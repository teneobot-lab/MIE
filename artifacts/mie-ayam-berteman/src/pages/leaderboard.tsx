import { useState } from "react";
import { Link } from "wouter";
import { useGetLeaderboard, useListArchive, useUpvoteSong } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageTransition } from "@/components/layout/PageTransition";
import { Flame, Music, History, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { format } from "date-fns";
import { VoteButton } from "@/components/ui/vote-button";
import { WeeklyResetCountdown } from "@/components/ui/weekly-reset";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard({ limit: 20 });
  const { data: archive } = useListArchive();
  const [showArchive, setShowArchive] = useState(false);
  const [expandedArchive, setExpandedArchive] = useState<string | null>(null);
  const upvoteMutation = useUpvoteSong();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const handle = useCart(state => state.handle);

  const handleUpvote = async (songId: number) => {
    if (!handle) {
      toast({
        title: "Isi nama dulu!",
        description: "Pesan dulu atau set nama di cart untuk bisa vote.",
        variant: "destructive"
      });
      throw new Error("no handle");
    }
    await upvoteMutation.mutateAsync({ id: songId, data: { handle } });
    queryClient.invalidateQueries({ queryKey: [`/api/songs/leaderboard`] });
    queryClient.invalidateQueries({ queryKey: [`/api/songs/now-playing`] });
  };

  const rankColors = [
    "bg-yellow-400 text-yellow-900 border-yellow-500",
    "bg-gray-300 text-gray-800 border-gray-400",
    "bg-orange-400 text-orange-900 border-orange-500",
  ];

  const rankEmoji = ["🥇", "🥈", "🥉"];

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Trophy className="w-64 h-64" />
        </div>
        <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter text-primary relative z-10"
          style={{ textShadow: "4px 4px 0px hsl(var(--foreground))" }}>
          Chart
        </h1>
        <p className="font-mono mt-4 bg-foreground text-background px-4 py-2 transform rotate-1 zine-border inline-block">
          Top lagu berdasarkan request + upvote minggu ini
        </p>
      </div>

      {/* Countdown */}
      {leaderboard && (
        <div className="mb-8">
          <WeeklyResetCountdown
            resetsAt={leaderboard.resetsAt ?? null}
            weekStart={leaderboard.weekStart ?? null}
          />
        </div>
      )}

      {/* Chart */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton h-20 zine-border" />
          ))}
        </div>
      ) : leaderboard?.entries.length === 0 ? (
        <div className="zine-border bg-card p-12 text-center">
          <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="font-black text-3xl uppercase text-primary mb-2">Sepi!</p>
          <p className="font-mono text-muted-foreground">Belum ada request minggu ini. Pesan mie dan request lagu!</p>
          <Link href="/menu" className="inline-block mt-4 zine-border bg-primary text-primary-foreground px-6 py-2 font-bold uppercase">
            Pesan Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3 mb-10">
          {leaderboard?.entries.map((song, i) => (
            <div key={song.id}
              className={`border-2 p-4 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] ${
                i < 3 ? "border-primary bg-primary/5" : "border-foreground bg-card"
              }`}>
              {/* Rank */}
              <div className={`w-10 h-10 flex items-center justify-center font-black text-lg shrink-0 border-2 ${
                i < 3 ? rankColors[i] : "bg-secondary border-foreground text-muted-foreground"
              }`}>
                {i < 3 ? rankEmoji[i] : i + 1}
              </div>

              {/* Song info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base uppercase truncate leading-tight">{song.title}</h3>
                <p className="text-sm text-muted-foreground font-mono truncate">{song.artist}</p>
                <p className="text-xs font-mono opacity-60 mt-0.5">
                  req: <span className="text-primary font-bold">@{song.requesterHandle}</span>
                  {" · "}{song.requests}x request
                </p>
              </div>

              {/* Score */}
              <div className="text-center shrink-0 px-3 border-l-2 border-dashed border-muted">
                <p className="font-black text-2xl text-primary leading-none">{song.score}</p>
                <p className="text-[10px] font-mono uppercase">score</p>
              </div>

              {/* Vote button */}
              <VoteButton
                count={song.upvotes}
                onVote={() => handleUpvote(song.id)}
                disabled={!handle}
                size={i < 3 ? "lg" : "md"}
              />
            </div>
          ))}
        </div>
      )}

      {/* Archive toggle */}
      <div className="border-t-4 border-foreground pt-8">
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="w-full flex items-center justify-between p-4 border-2 border-foreground hover:bg-secondary transition-colors font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <History className="w-5 h-5" /> Arsip Chart Minggu Lalu
          </span>
          {showArchive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showArchive && (
          <div className="space-y-4 mt-4">
            {!archive || archive.length === 0 ? (
              <p className="text-center py-8 font-mono text-muted-foreground">Belum ada arsip</p>
            ) : archive.map(week => (
              <div key={week.weekStart} className="border-2 border-foreground">
                <button
                  onClick={() => setExpandedArchive(expandedArchive === week.weekStart ? null : week.weekStart)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors">
                  <div className="text-left">
                    <p className="font-bold uppercase">
                      Minggu {format(new Date(week.weekStart), "d MMM yyyy")}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {week.totalRequests} request total
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {week.topSongs[0] && (
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-mono text-muted-foreground">🥇 Top</p>
                        <p className="text-sm font-bold truncate max-w-[150px]">{week.topSongs[0].title}</p>
                      </div>
                    )}
                    {expandedArchive === week.weekStart
                      ? <ChevronUp className="w-4 h-4 shrink-0" />
                      : <ChevronDown className="w-4 h-4 shrink-0" />
                    }
                  </div>
                </button>

                {expandedArchive === week.weekStart && (
                  <div className="border-t-2 border-foreground p-4 space-y-2 bg-secondary/50">
                    {week.topSongs.map((song, i) => (
                      <div key={song.id} className="flex items-center gap-3 p-2 bg-background border border-muted">
                        <span className="font-black text-lg w-6 text-center text-muted-foreground">
                          {rankEmoji[i] ?? i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate uppercase">{song.title}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate">{song.artist}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-primary">{song.score}</p>
                          <p className="text-[10px] font-mono">score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
