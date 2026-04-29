import { useGetTopFriends } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Users, Disc3, ShoppingBag, ArrowUp } from "lucide-react";

export default function Friends() {
  const { data: friends, isLoading } = useGetTopFriends({ limit: 20 });

  return (
    <PageTransition className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
          <Users className="w-64 h-64" />
        </div>
        <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter relative z-10 text-primary" style={{ textShadow: '4px 4px 0px hsl(var(--foreground))' }}>
          Tongkrongan
        </h1>
        <p className="font-mono mt-6 text-lg max-w-2xl mx-auto bg-foreground text-background px-4 py-2 transform rotate-1 zine-border inline-block">
          Mereka yang paling rajin jajan dan request lagu minggu ini.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-secondary animate-pulse zine-border"></div>
          ))}
        </div>
      ) : friends?.length === 0 ? (
        <div className="zine-border bg-card p-12 text-center max-w-lg mx-auto">
          <p className="font-marker text-3xl mb-4 text-primary">Belum Ada Siapa-siapa</p>
          <p className="font-mono text-muted-foreground">Jadilah yang pertama nangkring di sini minggu ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {friends?.map((friend, i) => (
            <div 
              key={friend.handle} 
              className={`zine-border bg-card p-6 relative group ${i < 3 ? 'bg-primary/5 border-primary' : ''}`}
            >
              {i < 3 && (
                <div className="absolute -top-3 -right-3 zine-badge bg-accent text-accent-foreground text-xl transform rotate-12">
                  #{i + 1}
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-dashed border-muted">
                <div className="w-16 h-16 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center font-display font-black text-2xl uppercase group-hover:bg-primary group-hover:text-primary-foreground transition-colors overflow-hidden">
                  {/* Just use initials since we don't have avatars */}
                  {friend.handle.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl truncate">@{friend.handle}</h3>
                  {i === 0 && <p className="text-xs font-bold uppercase tracking-widest text-primary">Penguasa Warung</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1 text-muted-foreground">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-lg">{friend.orderCount}</p>
                  <p className="text-[10px] uppercase">Orders</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1 text-muted-foreground">
                    <Disc3 className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-lg">{friend.requestCount}</p>
                  <p className="text-[10px] uppercase">Requests</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1 text-muted-foreground">
                    <ArrowUp className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-lg">{friend.upvotesGiven}</p>
                  <p className="text-[10px] uppercase">Upvotes</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
