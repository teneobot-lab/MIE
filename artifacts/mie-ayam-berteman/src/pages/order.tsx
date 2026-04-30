import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCreateOrder } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageTransition } from "@/components/layout/PageTransition";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Music, Check, ArrowRight } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { YouTubeSongSearch } from "@/components/ui/youtube-song-search";
import { Textarea } from "@/components/ui/textarea";

const orderSchema = z.object({
  handle: z.string().min(2, "Nama minimal 2 huruf coy"),
  songTitle: z.string().min(1, "Judul lagu wajib diisi"),
  songArtist: z.string().min(1, "Artis/Band wajib diisi"),
  message: z.string().max(100, "Kepanjangan, maksimal 100 karakter").optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function Order() {
  const { items, handle: savedHandle, setHandle, removeItem, updateQuantity, clearCart, getCartTotal } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastRank, setLastRank] = useState<number | null>(null);

  const createOrderMutation = useCreateOrder();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      handle: savedHandle || "",
      songTitle: "",
      songArtist: "",
      message: "",
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    if (items.length === 0) {
      toast({
        title: "Cart Kosong",
        description: "Pesan dulu bos sebelum checkout.",
        variant: "destructive"
      });
      return;
    }

    setHandle(data.handle); // Save handle for next time

    try {
      const response = await createOrderMutation.mutateAsync({
        data: {
          handle: data.handle,
          items: items.map(item => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity
          })),
          songRequest: {
            title: data.songTitle,
            artist: data.songArtist,
            message: data.message || undefined
          }
        }
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/orders/recent`] });
      queryClient.invalidateQueries({ queryKey: [`/api/songs/leaderboard`] });
      queryClient.invalidateQueries({ queryKey: [`/api/songs/now-playing`] });

      setLastRank(response.songRequest.score); // Not exact rank but gives feedback
      setIsSuccess(true);
      clearCart();
      window.scrollTo(0, 0);
    } catch (error) {
      toast({
        title: "Gagal Proses",
        description: "Ada error pas ngirim pesanan lo. Coba lagi.",
        variant: "destructive"
      });
    }
  };

  if (isSuccess) {
    return (
      <PageTransition className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto transform -rotate-12 border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
            <Check className="w-12 h-12" />
          </div>
          
          <div>
            <h1 className="font-display font-black text-5xl uppercase tracking-tighter mb-4">Pesanan Masuk!</h1>
            <p className="font-mono text-lg text-muted-foreground bg-secondary inline-block px-4 py-2 border-2 border-foreground transform rotate-1">
              Makanan segera disiapin.
            </p>
          </div>

          <div className="zine-border bg-card p-8 text-left relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Music className="w-48 h-48" />
            </div>
            
            <h2 className="font-bold uppercase tracking-widest border-b-2 border-foreground pb-2 mb-6">Status Request Lagu</h2>
            
            <div className="space-y-4 font-mono">
              <p><span className="text-muted-foreground w-24 inline-block">Lagu:</span> <strong className="text-xl uppercase">{form.getValues().songTitle}</strong></p>
              <p><span className="text-muted-foreground w-24 inline-block">Artis:</span> <strong>{form.getValues().songArtist}</strong></p>
              <div className="mt-6 p-4 bg-primary/10 border-2 border-primary border-dashed">
                <p className="font-bold text-primary">Request lo berhasil masuk antrian!</p>
                <p className="text-sm mt-1">Cek leaderboard buat lihat posisi lagu lo, atau kasih tau temen-teman lo buat upvote.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-8">
            <Link href="/leaderboard" className="zine-border bg-primary text-primary-foreground font-bold uppercase px-6 py-3 flex items-center gap-2 hover:bg-foreground hover:text-background transition-colors">
              <Music className="w-4 h-4" /> Lihat Chart
            </Link>
            <Link href="/menu" className="zine-border bg-background text-foreground font-bold uppercase px-6 py-3 flex items-center gap-2 hover:bg-secondary transition-colors">
              Pesan Lagi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (items.length === 0) {
    return (
      <PageTransition className="container mx-auto px-4 py-20 text-center">
        <div className="zine-border bg-card p-12 max-w-lg mx-auto transform -rotate-1 relative">
          <div className="tape" style={{ top: '-10px', left: '10%' }}></div>
          <h2 className="font-display font-black text-4xl uppercase mb-4">Cart Kosong</h2>
          <p className="font-mono text-muted-foreground mb-8">
            Pesan minimal satu menu buat dapet hak request lagu.
          </p>
          <Link href="/menu" className="zine-border inline-block bg-primary text-primary-foreground font-bold uppercase px-8 py-4 hover:bg-foreground hover:text-background transition-colors">
            Lihat Menu
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto px-4 py-12">
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter mb-8 border-b-4 border-foreground pb-4">
        Checkout & Request Lagu
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COL: CART ITEMS */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-bold uppercase tracking-widest text-muted-foreground">Pesanan Lo ({items.length})</h2>
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.menuItem.id} className="zine-border bg-card p-4 flex gap-4 items-center">
                {item.menuItem.imageUrl ? (
                  <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-20 h-20 object-cover border-2 border-foreground" />
                ) : (
                  <div className="w-20 h-20 bg-secondary border-2 border-foreground flex items-center justify-center">
                    <span className="text-xs font-bold uppercase opacity-50">No Img</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-bold uppercase leading-tight">{item.menuItem.name}</h3>
                  <p className="font-mono text-primary font-bold mt-1">{formatPrice(item.menuItem.price)}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <button 
                    onClick={() => removeItem(item.menuItem.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3 bg-background border-2 border-foreground p-1">
                    <button 
                      className="px-2 font-mono hover:text-primary"
                      onClick={() => updateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
                    >-</button>
                    <span className="font-mono w-4 text-center">{item.quantity}</span>
                    <button 
                      className="px-2 font-mono hover:text-primary"
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                    >+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="zine-border bg-secondary p-6 flex justify-between items-end">
            <span className="font-bold uppercase tracking-widest">Total Bayar</span>
            <span className="font-display font-black text-4xl text-primary transform rotate-1 inline-block border-b-4 border-primary">
              {formatPrice(getCartTotal())}
            </span>
          </div>
        </div>

        {/* RIGHT COL: FORM */}
        <div className="lg:col-span-5">
          <div className="zine-border bg-primary/10 border-primary p-6 md:p-8 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary transform translate-x-1/2 -translate-y-1/2 rotate-45 z-0"></div>
            <div className="absolute top-2 right-2 text-primary-foreground font-black z-10"><Music className="w-6 h-6" /></div>
            
            <h2 className="font-display font-black text-3xl uppercase mb-6 relative z-10">Form Request Lagu</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                <div className="space-y-4 pb-6 border-b-2 border-foreground/20">
                  <FormField
                    control={form.control}
                    name="handle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold uppercase tracking-widest text-xs">Panggilan / Nickname</FormLabel>
                        <FormControl>
                          <Input placeholder="Misal: Si Paling NasiGoreng" className="zine-border rounded-none font-mono focus-visible:ring-primary focus-visible:border-primary" {...field} />
                        </FormControl>
                        <FormMessage className="font-mono text-xs text-destructive" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="songTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold uppercase tracking-widest text-xs">Judul Lagu</FormLabel>
                        <FormControl>
                          <YouTubeSongSearch
                            placeholder="Cari judul lagu..."
                            onSelect={(title, artist) => {
                              form.setValue("songTitle", title);
                              form.setValue("songArtist", artist);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="font-mono text-xs text-destructive" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="songArtist"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold uppercase tracking-widest text-xs">Artis / Band</FormLabel>
                        <FormControl>
                          <Input placeholder="Misal: Earth, Wind & Fire" className="zine-border rounded-none font-mono focus-visible:ring-primary" {...field} />
                        </FormControl>
                        <FormMessage className="font-mono text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold uppercase tracking-widest text-xs">Pesan (Opsional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Nitip salam buat..." className="zine-border rounded-none font-mono min-h-[80px] resize-none focus-visible:ring-primary" {...field} />
                        </FormControl>
                        <FormMessage className="font-mono text-xs text-destructive" />
                      </FormItem>
                    )}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="w-full zine-border bg-primary text-primary-foreground hover:bg-foreground hover:text-background disabled:opacity-70 py-4 font-black uppercase tracking-widest text-xl mt-4 transition-all"
                >
                  {createOrderMutation.isPending ? "Lagi Masukin Antrian..." : "Checkout & Kirim Lagu"}
                </button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
