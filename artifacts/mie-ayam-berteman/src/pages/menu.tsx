import { useState } from "react";
import { Link } from "wouter";
import { useListMenu } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { formatPrice } from "@/lib/utils";
import { Flame, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="zine-border overflow-hidden">
          <div className="skeleton aspect-video" />
          <div className="p-5 space-y-3">
            <div className="skeleton h-6 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-10 w-full rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Menu() {
  const [category, setCategory] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const { data: menuItems, isLoading } = useListMenu(category ? { category } : undefined);
  const addItem = useCart(state => state.addItem);
  const { toast } = useToast();

  const categories = [
    { label: "Semua", value: undefined },
    { label: "Makanan", value: "makanan" },
    { label: "Mie", value: "mie" },
    { label: "Minuman", value: "minuman" },
    { label: "Ekstra", value: "ekstra" },
  ];

  const filtered = menuItems?.filter(item =>
    search ? item.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <PageTransition className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="font-display font-black text-5xl md:text-6xl uppercase tracking-tighter mb-2">
          <span className="bg-primary text-primary-foreground px-4 py-1 border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] inline-block transform -rotate-1">
            Menu Warung
          </span>
        </h1>
        <p className="font-mono mt-4 text-muted-foreground">
          Satu pesanan = satu request lagu. Jangan lupa tulis di kertas pesanan!
        </p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 pb-6 border-b-4 border-foreground">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isSelected = cat.value === category;
            return (
              <button key={cat.label} onClick={() => setCategory(cat.value)}
                className={`zine-border px-4 py-2 font-bold uppercase text-sm transition-all duration-200 active:scale-95 ${
                  isSelected ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-secondary"
                }`}>
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="pl-9 pr-4 py-2 border-2 border-foreground font-mono text-sm bg-background focus:outline-none focus:border-primary transition-colors w-full sm:w-48"
          />
        </div>
      </div>

      {/* Menu Grid */}
      {isLoading ? <MenuSkeleton /> : filtered?.length === 0 ? (
        <div className="zine-border bg-card p-12 text-center max-w-lg mx-auto">
          <p className="font-black text-3xl mb-4 text-primary">Kosong Bro!</p>
          <p className="font-mono text-muted-foreground">Menu ini lagi habis atau tidak ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered?.map((item, i) => (
            <div key={item.id}
              className={`zine-border bg-card group flex flex-col transition-all duration-300 hover:shadow-[6px_6px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 ${
                !item.available ? 'opacity-60 grayscale' : ''
              } ${i % 2 === 0 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'} hover:rotate-0`}>
              
              {/* Image */}
              <Link href={`/menu/${item.id}`} className="block relative aspect-video overflow-hidden border-b-2 border-foreground">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <span className="font-display font-black text-4xl opacity-20 uppercase">NO IMAGE</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {item.spicy && (
                    <span className="zine-badge bg-destructive text-destructive-foreground flex items-center gap-1 text-xs">
                      <Flame className="w-3 h-3" /> Pedas
                    </span>
                  )}
                  {!item.available && (
                    <span className="zine-badge bg-foreground text-background text-xs">Habis</span>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <Link href={`/menu/${item.id}`} className="hover:text-primary transition-colors flex-1 min-w-0">
                    <h3 className="font-bold text-xl uppercase leading-tight truncate">{item.name}</h3>
                  </Link>
                  <span className="font-display font-black text-base whitespace-nowrap bg-primary text-primary-foreground px-2 py-0.5 border border-foreground transform rotate-2 shrink-0">
                    {formatPrice(item.price)}
                  </span>
                </div>
                <p className="font-mono text-sm text-muted-foreground mb-5 line-clamp-2 flex-1">
                  {item.description}
                </p>
                <button
                  disabled={!item.available}
                  onClick={(e) => {
                    e.preventDefault();
                    addItem(item);
                    toast({ title: "✅ Masuk Cart!", description: `${item.name} sudah di keranjang.` });
                  }}
                  className="w-full zine-border flex items-center justify-center gap-2 bg-background text-foreground hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed py-3 font-bold uppercase tracking-widest text-sm transition-all duration-200 active:scale-[0.98] group/btn">
                  <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  {item.available ? "+ Tambah" : "Habis"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
