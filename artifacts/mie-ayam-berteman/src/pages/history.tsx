import { useEffect, useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { History, Music2, Clock } from "lucide-react";

type PlayedSong = {
  id: number;
  title: string;
  artist: string;
  requesterHandle: string;
  playedAt: string;
};

export default function HistoryPage() {
  const [songs, setSongs] = useState<PlayedSong[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    fetch("/api/songs/history")
      .then(r => r.json())
      .then(data => { setSongs(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-3xl min-h-[80vh]">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary text-primary-foreground px-6 py-2 font-bold uppercase tracking-widest zine-border flex items-center gap-2">
          <History className="w-5 h-5" />
          History Hari Ini
        </div>
        <span className="font-mono text-muted-foreground text-sm">{songs.length} lagu diputar</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 w-full rounded" />)}
        </div>
      ) : songs.length === 0 ? (
        <div className="zine-border bg-card p-12 text-center">
          <Music2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="font-mono text-muted-foreground">Belum ada lagu yang diputar hari ini.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song, i) => (
            <div key={song.id} className="zine-border bg-card p-4 flex items-center gap-4">
              <span className="font-mono text-2xl font-black text-primary w-8 shrink-0">{songs.length - i}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold uppercase truncate">{song.title}</p>
                <p className="text-sm font-mono text-muted-foreground truncate">{song.artist}</p>
                <p className="text-xs font-mono text-primary mt-0.5">@{song.requesterHandle}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-xs font-mono text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(song.playedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
