import { useState } from "react";
import { Link } from "wouter";
import { useListMenu } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { formatPrice } from "@/lib/utils";
import { Flame, Info } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function Menu() {
  const [category, setCategory] = useState<string | undefined>();
  const { data: menuItems, isLoading } = useListMenu(category ? { category } : undefined);
  const addItem = useCart(state => state.addItem);
  const { toast } = useToast();

  const categories = ["Semua", "Makanan", "Minuman", "Ekstra"];

  return (
    <PageTransition className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-4 border-foreground pb-6">
        <div>
          <h1 className="font-display font-black text-5xl uppercase tracking-tighter transform -rotate-1 inline-block">
            <span className="bg-primary text-primary-foreground px-4 py-1 border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">Menu Warung</span>
          </h1>
          <p className="font-mono mt-6 text-muted-foreground max-w-xl">
            Satu pesanan = satu request lagu. Jangan lupa tulis di kertas pesanan!
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = (cat === "Semua" && !category) || cat.toLowerCase() === category?.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat === "Semua" ? undefined : cat.toLowerCase())}
                className={`zine-border px-4 py-2 font-bold uppercase text-sm transition-colors ${
                  isSelected 
                    ? "bg-foreground text-background" 
                    : "bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-secondary animate-pulse zine-border"></div>
          ))}
        </div>
      ) : menuItems?.length === 0 ? (
        <div className="zine-border bg-card p-12 text-center max-w-lg mx-auto">
          <p className="font-marker text-3xl mb-4 text-primary">Kosong Bro!</p>
          <p className="font-mono text-muted-foreground">Menu kategori ini lagi habis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems?.map((item, i) => (
            <div 
              key={item.id} 
              className={`zine-border bg-card group flex flex-col ${!item.available ? 'opacity-60 grayscale' : ''} ${i % 2 === 0 ? 'transform rotate-1' : 'transform -rotate-1'} hover:rotate-0 transition-transform duration-300`}
            >
              <Link href={`/menu/${item.id}`} className="block relative aspect-video overflow-hidden border-b-2 border-foreground">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <span className="font-display font-black text-4xl opacity-20 uppercase tracking-tighter">No Image</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="absolute top-2 right-2 flex gap-2">
                  {item.spicy && (
                    <span className="zine-badge bg-destructive text-destructive-foreground flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Pedas
                    </span>
                  )}
                  {!item.available && (
                    <span className="zine-badge bg-foreground text-background">
                      Habis
                    </span>
                  )}
                </div>
              </Link>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <Link href={`/menu/${item.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-bold text-xl uppercase leading-tight">{item.name}</h3>
                  </Link>
                  <span className="font-display font-black text-lg whitespace-nowrap bg-primary text-primary-foreground px-2 py-0.5 border border-foreground transform rotate-3">
                    {formatPrice(item.price)}
                  </span>
                </div>
                
                <p className="font-mono text-sm text-muted-foreground mb-6 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="mt-auto">
                  <button 
                    disabled={!item.available}
                    onClick={(e) => {
                      e.preventDefault();
                      addItem(item);
                      toast({
                        title: "Masuk Cart!",
                        description: `${item.name} udah di keranjang.`,
                      });
                    }}
                    className="w-full zine-border bg-background text-foreground hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed py-3 font-bold uppercase tracking-widest text-sm transition-colors"
                  >
                    {item.available ? "+ Tambah" : "Habis"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
