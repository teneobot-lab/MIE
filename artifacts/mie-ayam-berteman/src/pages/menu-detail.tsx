import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useGetMenuItem } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { formatPrice } from "@/lib/utils";
import { Flame, ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function MenuDetail() {
  const [, params] = useRoute("/menu/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const [, setLocation] = useLocation();
  
  const { data: item, isLoading } = useGetMenuItem(id, {
    query: { enabled: !!id, queryKey: [`/api/menu/${id}`] }
  });
  
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart(state => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (item) {
      addItem(item, quantity);
      toast({
        title: "Sikat!",
        description: `${quantity}x ${item.name} masuk keranjang.`,
      });
      setLocation("/menu");
    }
  };

  if (isLoading) {
    return (
      <PageTransition className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-4xl">
          <div className="h-8 bg-secondary w-32"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-secondary zine-border"></div>
            <div className="space-y-4">
              <div className="h-12 bg-secondary w-3/4"></div>
              <div className="h-8 bg-secondary w-1/4"></div>
              <div className="h-24 bg-secondary w-full"></div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!item) {
    return (
      <PageTransition className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display font-black text-4xl uppercase mb-4 text-destructive">Menu Gak Ketemu</h2>
        <p className="font-mono mb-8">Menu yang lo cari kayaknya udah dihapus dari peredaran.</p>
        <Link href="/menu" className="zine-border inline-block bg-primary text-primary-foreground font-bold uppercase px-6 py-3">
          Balik ke Menu
        </Link>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/menu" className="inline-flex items-center gap-2 font-bold uppercase text-sm tracking-widest hover:text-primary transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="relative zine-border aspect-square bg-card transform -rotate-1 group">
          <div className="tape" style={{ top: '-10px', right: '10%', transform: 'rotate(15deg)' }}></div>
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover mix-blend-multiply"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="font-display font-black text-4xl opacity-20 uppercase tracking-tighter transform -rotate-12">Visual Hilang</span>
            </div>
          )}
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {item.spicy && (
              <span className="zine-badge bg-destructive text-destructive-foreground flex items-center gap-1 shadow-none">
                <Flame className="w-4 h-4" /> Level Pedas
              </span>
            )}
            <span className="zine-badge bg-background text-foreground shadow-none">
              {item.category}
            </span>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-none mb-4 tracking-tighter">
            {item.name}
          </h1>
          
          <p className="font-display font-black text-3xl text-primary mb-6 inline-block bg-primary/10 px-4 py-1 transform -rotate-2 w-fit border-2 border-primary border-dashed">
            {formatPrice(item.price)}
          </p>
          
          <div className="prose prose-p:font-mono prose-p:text-muted-foreground prose-p:leading-relaxed mb-8">
            <p>{item.description}</p>
          </div>

          <div className="mt-auto space-y-6 bg-secondary/50 p-6 zine-border">
            {!item.available ? (
              <div className="text-center p-4 bg-destructive/10 border-2 border-destructive text-destructive font-bold uppercase">
                Lagi Habis Bro!
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold uppercase tracking-widest text-sm">Jumlah:</span>
                  <div className="flex items-center gap-4 bg-background border-2 border-foreground p-1">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold w-8 text-center font-mono text-lg">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="w-full zine-border bg-primary text-primary-foreground hover:bg-foreground hover:text-background py-4 font-black uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Tambah Rp {formatPrice(item.price * quantity).replace('Rp ', '')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
