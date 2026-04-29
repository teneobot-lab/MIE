import { useState } from "react";
import { Link } from "wouter";
import { useGetLeaderboard, useListArchive, useUpvoteSong } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageTransition } from "@/components/layout/PageTransition";
import { Flame, Music, ArrowUp, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { format } from "date-fns";

export default function Leaderboard() {
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useGetLeaderboard();
  const { data: archive, isLoading: isLoadingArchive } = useListArchive();
  const [showArchive, setShowArchive] = useState(false);
  
  const upvoteMutation = useUpvoteSong();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const handle = useCart(state => state.handle);

  const handleUpvote = async (songId: number) => {
    if (!handle) {
      toast({
        title: "Woy, isi nama dulu",
        description: "Lo harus pesan minimal sekali atau set nama di cart buat bisa nge-vote.",
        variant: "destructive"
      });
      return;
    }

    try {
      await upvoteMutation.mutateAsync({
        id: songId,
        data: { handle }
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/songs/leaderboard`] });
      queryClient.invalidateQueries({ queryKey: [`/api/songs/now-playing`] });
      
      toast({
        title: "Masuk Pak Eko!",
        description: "Vote lo udah direkam.",
      });
    } catch (error) {
      toast({
        title: "Gagal Vote",
        description: "Ada error pas ngirim vote lo.",
        variant: "destructive"
      });
    }
  };

  return (
    <PageTransition className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-4 border-foreground pb-6">
        <div>
          <h1 className="font-display font-black text-5xl uppercase tracking-tighter transform -rotate-1 inline-block">
            <span className="bg-primary text-primary-foreground px-4 py-1 border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">Chart Warung</span>
          </h1>
          <p className="font-mono mt-6 text-muted-foreground max-w-xl">
            Lagu dengan vote tertinggi bakal diputar terus-terusan sampai yang lain pada bosen.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowArchive(false)}
            className={`zine-border px-4 py-2 font-bold uppercase text-sm transition-colors flex items-center gap-2 ${
              !showArchive 
                ? "bg-foreground text-background" 
                : "bg-background text-foreground hover:bg-secondary"
            }`}
          >
            <Flame className="w-4 h-4" /> Minggu Ini
          </button>
          <button
            onClick={() => setShowArchive(true)}
            className={`zine-border px-4 py-2 font-bold uppercase text-sm transition-colors flex items-center gap-2 ${
              showArchive 
                ? "bg-foreground text-background" 
                : "bg-background text-foreground hover:bg-secondary"
            }`}
          >
            <History className="w-4 h-4" /> Archive
          </button>
        </div>
      </div>

      {!showArchive ? (
        <div className="space-y-6">
          {isLoadingLeaderboard ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-secondary animate-pulse zine-border"></div>
              ))}
            </div>
          ) : leaderboard?.entries.length === 0 ? (
            <div className="zine-border bg-card p-12 text-center max-w-lg mx-auto transform rotate-1">
              <div className="tape" style={{ top: '-10px', right: '10%' }}></div>
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="font-marker text-3xl mb-4 text-primary">Kosong Melompong</p>
              <p className="font-mono text-muted-foreground mb-6">Belum ada yang request lagu minggu ini.</p>
              <Link href="/menu" className="zine-border inline-block bg-primary text-primary-foreground font-bold uppercase px-6 py-3 hover:bg-foreground hover:text-background transition-colors">
                Pesan & Request
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard?.entries.map((song, i) => (
                <div 
                  key={song.id} 
                  className={`zine-border bg-card p-4 sm:p-6 flex items-center gap-4 group transition-colors ${i === 0 ? 'bg-primary/10 border-primary' : 'hover:bg-secondary'}`}
                >
                  <div className={`font-display font-black w-10 text-center transition-colors ${i === 0 ? 'text-5xl text-primary' : 'text-4xl text-muted-foreground group-hover:text-primary'}`}>
                    {i + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl sm:text-2xl uppercase leading-tight truncate">
                      {song.title}
                    </h3>
                    <p className="text-muted-foreground truncate font-mono text-sm sm:text-base mb-1">{song.artist}</p>
                    
                    {song.message && (
                      <p className="text-xs font-mono bg-background p-2 border border-dashed border-foreground/30 mt-2 italic">
                        "{song.message}"
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-xs font-mono opacity-70">
                        Req by: <span className="font-bold text-primary">@{song.requesterHandle}</span>
                      </p>
                      <span className="text-xs font-mono opacity-50">•</span>
                      <p className="text-xs font-mono opacity-70">
                        {song.requests} requests
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 pl-4 sm:pl-6 border-l-2 border-dashed border-muted">
                    <div className="text-center">
                      <p className="font-black text-2xl sm:text-3xl text-foreground">{song.upvotes}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Votes</p>
                    </div>
                    
                    <button 
                      onClick={() => handleUpvote(song.id)}
                      disabled={upvoteMutation.isPending}
                      className="zine-border bg-primary text-primary-foreground p-2 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 mt-1"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {isLoadingArchive ? (
            <div className="space-y-8">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-secondary animate-pulse zine-border"></div>
              ))}
            </div>
          ) : archive?.length === 0 ? (
            <div className="zine-border bg-card p-12 text-center max-w-lg mx-auto">
              <p className="font-marker text-3xl mb-4 text-primary">Archive Kosong</p>
              <p className="font-mono text-muted-foreground">Belum ada data minggu lalu.</p>
            </div>
          ) : (
            archive?.map((week, i) => (
              <div key={i} className="zine-border bg-card p-6 relative">
                <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground px-4 py-2 font-bold uppercase tracking-widest text-sm zine-border transform -rotate-3">
                  {format(new Date(week.weekStart), 'dd MMM')} - {format(new Date(week.weekEnd), 'dd MMM yyyy')}
                </div>
                
                <div className="mt-6 mb-4 flex items-center justify-between border-b-2 border-dashed border-muted pb-4">
                  <span className="font-mono text-sm text-muted-foreground">Total: {week.totalRequests} Requests</span>
                </div>
                
                <div className="space-y-4">
                  {week.topSongs.map((song, j) => (
                    <div key={song.id} className="flex items-center gap-4 bg-background p-3 border border-foreground/20">
                      <div className="font-black text-xl text-muted-foreground w-6 text-center">{j + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold uppercase truncate">{song.title}</p>
                        <p className="text-xs font-mono text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-primary">{song.upvotes} <span className="text-[10px] uppercase text-muted-foreground">Votes</span></p>
                        <p className="text-[10px] font-mono text-muted-foreground">by @{song.requesterHandle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </PageTransition>
  );
}
