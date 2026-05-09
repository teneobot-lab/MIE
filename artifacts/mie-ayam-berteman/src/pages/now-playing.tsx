import { useEffect, useState } from "react";
import { useGetNowPlaying } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Disc3, Music, Radio, BookOpen, User, ChevronDown, ChevronUp } from "lucide-react";
import { useLyrics, useArtistInfo } from "@/hooks/use-music-info";
import { usePlayer } from "@/hooks/use-player";
import { VoteButton } from "@/components/ui/vote-button";
import { useUpvoteSong } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function NowPlaying() {
  const { data, isLoading, refetch } = useGetNowPlaying();
  const { currentSong, allSongs, currentIndex, playAt } = usePlayer();
  const [bars, setBars] = useState<number[]>([]);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const song = currentSong ?? data?.song ?? null;
  const { lyrics, loading: lyricsLoading } = useLyrics(song?.title ?? null, song?.artist ?? null);
  const { bio, image: artistImage, loading: bioLoading } = useArtistInfo(song?.artist ?? null);
  const upvoteMutation = useUpvoteSong();
  const queryClient = useQueryClient();
  const handle = useCart(state => state.handle);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => refetch(), 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(Array.from({ length: 20 }, () => Math.floor(Math.random() * 100)));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleUpvote = async (songId: number) => {
    if (!handle) {
      toast({ title: "Isi nama dulu!", variant: "destructive" });
      throw new Error("no handle");
    }
    await upvoteMutation.mutateAsync({ id: songId, data: { handle } });
    queryClient.invalidateQueries({ queryKey: [`/api/songs/now-playing`] });
    queryClient.invalidateQueries({ queryKey: [`/api/songs/leaderboard`] });
  };

  if (isLoading) return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center">
      <Disc3 className="w-16 h-16 text-primary animate-spin" />
    </PageTransition>
  );

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-6xl min-h-[80vh]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2 font-bold uppercase tracking-widest zine-border transform -rotate-1 self-start">
            <Radio className="w-5 h-5 animate-pulse" />
            Live dari Warung
          </div>
          {song ? (
            <>
              <div className="zine-border bg-card p-6 md:p-8 relative">
                <h2 className="font-display font-black text-4xl md:text-5xl uppercase leading-none tracking-tighter mb-3 break-words">{song.title}</h2>
                <p className="font-mono text-2xl text-primary font-bold mb-4">{song.artist}</p>
                <div className="bg-background border-2 border-foreground p-4 mb-4">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Requested By</p>
                  <p className="font-bold text-xl">@{song.requesterHandle}</p>
                  {song.message && (
                    <p className="mt-2 italic font-mono border-l-4 border-primary pl-3 text-sm">"{song.message}"</p>
                  )}
                </div>
                {data?.song && (
                  <div className="flex items-center gap-3 mb-4">
                    <VoteButton key={data.song.id} count={data.song.upvotes} onVote={() => handleUpvote(data.song!.id)} disabled={!handle} size="lg" />
                    <span className="text-xs font-mono text-muted-foreground">{!handle ? "Pesan dulu untuk vote" : "Vote lagu ini!"}</span>
                  </div>
                )}
                <div className="flex items-end gap-0.5 h-12 w-full overflow-hidden">
                  {bars.map((h, i) => (
                    <div key={i} className="flex-1 bg-primary transition-all duration-150" style={{ height: `${Math.max(10, h)}%` }} />
                  ))}
                </div>
              </div>
              <div className="zine-border bg-card overflow-hidden">
                <button onClick={() => setShowBio(!showBio)} className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors">
                  <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm"><User className="w-4 h-4 text-primary" /> Tentang {song.artist}</span>
                  {showBio ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showBio && (
                  <div className="px-4 pb-4 border-t-2 border-foreground">
                    {bioLoading ? <div className="skeleton h-16 w-full mt-3 rounded" /> : bio ? (
                      <div className="flex gap-4 mt-3">
                        {artistImage && <img src={artistImage} alt={song.artist} className="w-20 h-20 object-cover border-2 border-foreground shrink-0" />}
                        <p className="font-mono text-sm text-muted-foreground leading-relaxed line-clamp-6">{bio}</p>
                      </div>
                    ) : <p className="font-mono text-sm text-muted-foreground mt-3">Info artis tidak tersedia.</p>}
                  </div>
                )}
              </div>
              <div className="zine-border bg-card overflow-hidden">
                <button onClick={() => setShowLyrics(!showLyrics)} className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors">
                  <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm"><BookOpen className="w-4 h-4 text-primary" /> Lirik Lagu</span>
                  {showLyrics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showLyrics && (
                  <div className="px-4 pb-4 border-t-2 border-foreground max-h-80 overflow-y-auto">
                    {lyricsLoading ? <div className="space-y-2 mt-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-4 w-full rounded" />)}</div>
                    : lyrics ? <pre className="font-mono text-sm whitespace-pre-wrap mt-3 leading-relaxed text-foreground">{lyrics}</pre>
                    : <p className="font-mono text-sm text-muted-foreground mt-3">Lirik tidak ditemukan untuk lagu ini.</p>}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="zine-border bg-card p-12 text-center">
              <Music className="w-24 h-24 text-muted-foreground mx-auto mb-6 opacity-30" />
              <h2 className="font-display font-black text-4xl uppercase mb-4 text-primary">Sepi Amat</h2>
              <p className="font-mono text-xl text-muted-foreground">Belum ada lagu yang dimainin.</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-secondary p-6 zine-border flex flex-col max-h-[70vh]">
            <h3 className="font-display font-black text-3xl uppercase border-b-4 border-foreground pb-4 mb-4">Antrian</h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {data?.queue && data.queue.length > 0 ? data.queue.map((song, i) => (
                <div key={song.id} className="bg-background border-2 border-foreground p-3 flex items-center gap-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group">
                  <div className="font-bold text-xl w-6 text-center opacity-50 group-hover:opacity-100">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold uppercase truncate text-sm">{song.title}</p>
                    <p className="text-xs truncate opacity-80">{song.artist}</p>
                  </div>
                  <div className="shrink-0">
                    <VoteButton key={song.id} count={song.upvotes} onVote={() => handleUpvote(song.id)} disabled={!handle} size="sm" />
                  </div>
                </div>
              )) : <div className="text-center py-8 opacity-50 font-mono"><p className="font-bold uppercase">Antrian kosong.</p></div>}
            </div>
          </div>
          {allSongs.length > 0 && (
            <div className="border-2 border-foreground p-4">
              <h4 className="font-bold uppercase text-sm mb-3 flex items-center gap-2"><Music className="w-4 h-4 text-primary" /> Playlist Player</h4>
              <div className="space-y-1">
                {allSongs.map((s, i) => (
                  <button key={s.id} onClick={() => playAt(i)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-all hover:bg-secondary ${i === currentIndex ? "bg-primary/10 border border-primary/30" : ""}`}>
                    <span className={`text-xs font-mono w-4 ${i === currentIndex ? "text-primary font-bold" : "text-muted-foreground"}`}>{i === currentIndex ? "▶" : i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase truncate">{s.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{s.artist}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
