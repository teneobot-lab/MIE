import { useEffect, useState, useRef } from "react";
import { useGetNowPlaying } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Disc3, Music, Radio } from "lucide-react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

async function searchYouTube(title: string, artist: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey) return null;
  const q = encodeURIComponent(`${title} ${artist} official`);
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=1&key=${apiKey}`
  );
  const data = await res.json();
  return data.items?.[0]?.id?.videoId ?? null;
}

export default function NowPlaying() {
  const { data, isLoading, refetch } = useGetNowPlaying();
  const [bars, setBars] = useState<number[]>([]);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const playerDivRef = useRef<HTMLDivElement>(null);
  const currentSongRef = useRef<string>("");

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => refetch(), 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Equalizer animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(Array.from({ length: 20 }, () => Math.floor(Math.random() * 100)));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) { setPlayerReady(true); return; }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setPlayerReady(true);
  }, []);

  // Search YouTube when song changes
  useEffect(() => {
    if (!data?.song) return;
    const key = `${data.song.title}||${data.song.artist}`;
    if (key === currentSongRef.current) return;
    currentSongRef.current = key;
    searchYouTube(data.song.title, data.song.artist).then(setVideoId);
  }, [data?.song]);

  // Init or update YouTube player
  useEffect(() => {
    if (!playerReady || !videoId || !playerDivRef.current) return;
    if (playerRef.current) {
      playerRef.current.loadVideoById(videoId);
      return;
    }
    playerRef.current = new window.YT.Player(playerDivRef.current, {
      height: "100%",
      width: "100%",
      videoId,
      playerVars: { autoplay: 1, controls: 1, modestbranding: 1, rel: 0 },
      events: {
        onReady: (e: any) => e.target.playVideo(),
      },
    });
  }, [playerReady, videoId]);

  if (isLoading) {
    return (
      <PageTransition className="min-h-[80vh] flex items-center justify-center">
        <Disc3 className="w-16 h-16 text-primary animate-spin" />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-6xl min-h-[80vh] flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* LEFT COL: NOW PLAYING */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative">
          <div className="mb-8 inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2 font-bold uppercase tracking-widest zine-border transform -rotate-2">
            <Radio className="w-5 h-5 animate-pulse" />
            Live dari Warung
          </div>
          {data?.song ? (
            <div className="w-full relative">
              <div className="absolute -inset-8 bg-secondary rounded-full filter blur-3xl opacity-50 z-0"></div>
              <div className="relative z-10 zine-border bg-card p-8 md:p-12 transform rotate-1">
                {/* YouTube Player */}
                {videoId && (
                  <div className="w-full aspect-video mb-6 border-2 border-foreground overflow-hidden">
                    <div ref={playerDivRef} className="w-full h-full" />
                  </div>
                )}
                <h2 className="font-display font-black text-4xl md:text-5xl uppercase leading-none tracking-tighter mb-4 break-words">
                  {data.song.title}
                </h2>
                <p className="font-mono text-2xl text-primary font-bold mb-6">
                  {data.song.artist}
                </p>
                <div className="bg-background border-2 border-foreground p-4 mb-6">
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Requested By</p>
                  <p className="font-bold text-xl">@{data.song.requesterHandle}</p>
                  {data.song.message && (
                    <p className="mt-4 italic font-mono border-l-4 border-primary pl-4 text-sm">
                      "{data.song.message}"
                    </p>
                  )}
                </div>
                {/* Equalizer */}
                <div className="flex items-end justify-center lg:justify-start gap-1 h-16 border-b-2 border-foreground w-full overflow-hidden">
                  {bars.map((height, i) => (
                    <div key={i} className="w-full bg-primary transition-all duration-150 ease-in-out"
                      style={{ height: `${Math.max(10, height)}%` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="zine-border bg-card p-12 text-center w-full">
              <Music className="w-24 h-24 text-muted-foreground mx-auto mb-6 opacity-30" />
              <h2 className="font-display font-black text-4xl uppercase mb-4 text-primary">Sepi Amat</h2>
              <p className="font-mono text-xl text-muted-foreground">Belum ada lagu yang dimainin.</p>
            </div>
          )}
        </div>

        {/* RIGHT COL: QUEUE */}
        <div className="bg-secondary p-6 md:p-8 zine-border h-full flex flex-col max-h-[80vh]">
          <h3 className="font-display font-black text-3xl uppercase border-b-4 border-foreground pb-4 mb-6 flex items-center gap-3">
            Antrian Selanjutnya
          </h3>
          <div className="flex-1 overflow-y-auto pr-4 space-y-4 font-mono custom-scrollbar">
            {data?.queue && data.queue.length > 0 ? (
              data.queue.map((song, i) => (
                <div key={song.id} className="bg-background border-2 border-foreground p-4 flex items-center gap-4 group hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                  <div className="font-bold text-2xl w-8 text-center opacity-50 group-hover:opacity-100">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold uppercase truncate">{song.title}</p>
                    <p className="text-sm truncate opacity-80">{song.artist}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs opacity-70 mb-1">Req: @{song.requesterHandle}</p>
                    <p className="font-bold">{song.upvotes} <span className="text-[10px] uppercase">Votes</span></p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 opacity-50">
                <p className="font-bold uppercase tracking-widest">Antrian kosong.</p>
                <p className="text-sm mt-2">Waktunya lo yang request.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
