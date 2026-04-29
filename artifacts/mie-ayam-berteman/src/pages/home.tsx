import { Link } from "wouter";
import { PageTransition } from "@/components/layout/PageTransition";
import { 
  useGetNowPlaying, 
  useGetLeaderboard, 
  useListRecentOrders,
  useGetOverviewStats
} from "@workspace/api-client-react";
import { formatPrice, cn } from "@/lib/utils";
import { Play, Music, Flame, ArrowRight, Disc3 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: nowPlaying } = useGetNowPlaying();
  const { data: leaderboard } = useGetLeaderboard({ limit: 5 });
  const { data: recentOrders } = useListRecentOrders({ limit: 5 });
  const { data: stats } = useGetOverviewStats();

  return (
    <PageTransition>
      {/* HERO SECTION */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-b-4 border-foreground">
        <div className="absolute inset-0 bg-secondary z-0">
          <img 
            src="/images/hero.png" 
            alt="Warung Vibes" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity grayscale"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ rotate: -5, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary transform rotate-2 z-0 mix-blend-multiply opacity-50"></div>
            <h1 className="font-display font-black text-6xl md:text-8xl tracking-tighter uppercase relative z-10 text-foreground mix-blend-hard-light" style={{ textShadow: '4px 4px 0px hsl(var(--primary))' }}>
              Makan Mie.<br/>
              Request Lagu.<br/>
              Cari Teman.
            </h1>
          </motion.div>
          
          <p className="mt-8 font-mono text-lg md:text-xl max-w-2xl bg-foreground text-background px-4 py-2 transform -rotate-1 border-2 border-primary shadow-[4px_4px_0px_0px_hsl(var(--primary))]">
            Cukup pesan satu porsi mie ayam, kamu dapat satu hak request lagu untuk diputar di warung.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/menu" 
              className="zine-border bg-primary text-primary-foreground font-bold uppercase tracking-widest px-8 py-4 text-lg hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2 group"
            >
              Pesan Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link 
              href="/leaderboard" 
              className="zine-border bg-background text-foreground font-bold uppercase tracking-widest px-8 py-4 text-lg hover:bg-secondary hover:text-secondary-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Music className="w-5 h-5" />
              Lihat Chart
            </Link>
          </div>
        </div>
      </section>

      {/* NOW PLAYING STRIP */}
      <section className="bg-primary text-primary-foreground py-4 border-b-4 border-foreground overflow-hidden relative">
        <div className="container mx-auto px-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center animate-spin-slow">
              <Disc3 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold uppercase text-xs tracking-widest opacity-80">Sekarang Diputar</p>
              {nowPlaying?.song ? (
                <p className="font-display font-bold text-xl md:text-2xl truncate max-w-[200px] md:max-w-md">
                  {nowPlaying.song.title} <span className="opacity-70 text-sm md:text-lg">— {nowPlaying.song.artist}</span>
                </p>
              ) : (
                <p className="font-display font-bold text-xl">Playlist Kosong</p>
              )}
            </div>
          </div>
          <Link href="/now-playing" className="hidden md:flex items-center gap-2 zine-border bg-background text-foreground px-4 py-2 text-sm font-bold uppercase hover:bg-secondary hover:text-secondary-foreground">
            Buka Player <Play className="w-4 h-4 fill-current" />
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT COL: LEADERBOARD TEASER */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-end justify-between border-b-4 border-foreground pb-4 relative">
            <div className="tape hidden md:block" style={{ left: '10%', top: '-15px' }}></div>
            <h2 className="font-display font-black text-4xl uppercase flex items-center gap-3">
              <Flame className="w-8 h-8 text-primary" /> Top 5 Minggu Ini
            </h2>
            <Link href="/leaderboard" className="font-bold uppercase tracking-widest text-sm hover:text-primary transition-colors flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {leaderboard?.entries.length === 0 ? (
              <div className="zine-border bg-secondary p-8 text-center">
                <p className="font-marker text-2xl text-muted-foreground">Belum ada request minggu ini.</p>
                <p className="font-mono text-sm mt-2">Jadilah yang pertama!</p>
              </div>
            ) : (
              leaderboard?.entries.map((song, i) => (
                <div key={song.id} className="zine-border bg-card p-4 flex items-center gap-4 group hover:bg-secondary transition-colors">
                  <div className="font-display font-black text-4xl text-muted-foreground w-8 text-center group-hover:text-primary transition-colors">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate uppercase">{song.title}</h3>
                    <p className="text-muted-foreground truncate">{song.artist}</p>
                    <p className="text-xs font-mono mt-1 opacity-70">Req by: <span className="font-bold text-primary">@{song.requesterHandle}</span></p>
                  </div>
                  <div className="text-center px-4 border-l-2 border-dashed border-muted">
                    <p className="font-black text-2xl text-primary">{song.upvotes}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Votes</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COL: ACTIVITY FEED */}
        <div className="space-y-8">
          <div className="border-b-4 border-foreground pb-4">
            <h2 className="font-display font-black text-3xl uppercase">Aktivitas Terbaru</h2>
          </div>

          <div className="zine-border bg-background p-4 relative">
            <div className="absolute -top-3 -right-3 zine-badge bg-accent text-accent-foreground transform rotate-6">Live</div>
            
            <div className="space-y-6">
              {recentOrders?.length === 0 ? (
                <p className="text-sm font-mono text-muted-foreground text-center py-4">Sepi nih...</p>
              ) : (
                recentOrders?.map((order) => (
                  <div key={order.id} className="flex gap-3 text-sm font-mono border-b border-dashed border-muted pb-4 last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-1.5 bg-primary rounded-full shrink-0"></div>
                    <div>
                      <p>
                        <span className="font-bold text-primary">@{order.handle}</span> pesan {order.itemCount} item 
                        seharga {formatPrice(order.total)}.
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        🎶 Req: <span className="font-bold text-foreground">{order.songTitle}</span> - {order.songArtist}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="zine-border bg-secondary p-4 text-center">
                <p className="font-black text-3xl text-primary font-display">{stats.totalFriends}</p>
                <p className="text-xs font-bold uppercase tracking-widest mt-1">Teman Tongkrongan</p>
              </div>
              <div className="zine-border bg-primary text-primary-foreground p-4 text-center">
                <p className="font-black text-3xl font-display">{stats.currentWeekRequests}</p>
                <p className="text-xs font-bold uppercase tracking-widest mt-1">Lagu Minggu Ini</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
