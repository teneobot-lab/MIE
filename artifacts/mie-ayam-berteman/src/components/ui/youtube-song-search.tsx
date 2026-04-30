import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

type Suggestion = {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
};

async function searchYouTube(query: string): Promise<Suggestion[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey || query.length < 2) return [];
  const q = encodeURIComponent(query);
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&videoCategoryId=10&maxResults=6&key=${apiKey}`
  );
  const data = await res.json();
  return (data.items ?? []).map((item: any) => {
    const snippet = item.snippet;
    // Try to split channel name as artist
    const channelName = snippet.channelTitle.replace(/ - Topic$/, "").replace(/VEVO$/, "").trim();
    return {
      videoId: item.id.videoId,
      title: snippet.title,
      artist: channelName,
      thumbnail: snippet.thumbnails?.default?.url ?? "",
    };
  });
}

type Props = {
  onSelect: (title: string, artist: string) => void;
  placeholder?: string;
};

export function YouTubeSongSearch({ onSelect, placeholder }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setSelected("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchYouTube(value);
      setSuggestions(results);
      setOpen(results.length > 0);
      setLoading(false);
    }, 500);
  };

  const handleSelect = (s: Suggestion) => {
    setSelected(s.title);
    setQuery(s.title);
    setOpen(false);
    onSelect(s.title, s.artist);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder={placeholder ?? "Cari lagu..."}
          className="zine-border rounded-none font-mono focus-visible:ring-primary pr-8"
        />
        {loading && (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-background border-2 border-foreground mt-1 max-h-72 overflow-y-auto shadow-lg">
          {suggestions.map(s => (
            <button
              key={s.videoId}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors text-left"
            >
              {s.thumbnail && (
                <img src={s.thumbnail} alt="" className="w-10 h-10 object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{s.title}</p>
                <p className="text-xs opacity-70 truncate">{s.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
