import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetTopFriends, customFetch } from "@workspace/api-client-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Users, Disc3, ShoppingBag, ArrowUp, Instagram, Youtube, X, Plus, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Profile = {
  id: number;
  handle: string;
  bio: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  youtube: string | null;
};

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function Friends() {
  const { data: friends, isLoading } = useGetTopFriends({ limit: 20 });
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: () => customFetch("/api/profiles"),
  });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ handle: "", bio: "", instagram: "", tiktok: "", twitter: "", youtube: "" });

  const saveMutation = useMutation({
    mutationFn: () => customFetch("/api/profiles", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast({ title: "Profil tersimpan!" });
      setShowForm(false);
      setForm({ handle: "", bio: "", instagram: "", tiktok: "", twitter: "", youtube: "" });
    },
    onError: () => toast({ title: "Gagal simpan", variant: "destructive" }),
  });

  const getProfile = (handle: string) =>
    profiles.find(p => p.handle.toLowerCase() === handle.toLowerCase());

  return (
    <PageTransition className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
          <Users className="w-64 h-64" />
        </div>
        <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter relative z-10 text-primary"
          style={{ textShadow: '4px 4px 0px hsl(var(--foreground))' }}>
          Tongkrongan
        </h1>
        <p className="font-mono mt-6 text-lg max-w-2xl mx-auto bg-foreground text-background px-4 py-2 transform rotate-1 zine-border inline-block">
          Mereka yang paling rajin jajan dan request lagu minggu ini.
        </p>
        <div className="mt-6">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Edit2 className="w-4 h-4" /> Daftarkan Profil Sosmedmu
          </Button>
        </div>
      </div>

      {/* Form daftar profil */}
      {showForm && (
        <div className="zine-border bg-card p-6 mb-10 max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold uppercase tracking-widest">Profil Sosmed</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <Input placeholder="Handle kamu (misal: jokowee)" value={form.handle}
              onChange={e => setForm(f => ({ ...f, handle: e.target.value }))}
              className="font-mono zine-border rounded-none" />
            <Textarea placeholder="Bio singkat..." value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              className="font-mono zine-border rounded-none resize-none" rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Instagram (tanpa @)" value={form.instagram}
                onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                className="font-mono zine-border rounded-none" />
              <Input placeholder="TikTok (tanpa @)" value={form.tiktok}
                onChange={e => setForm(f => ({ ...f, tiktok: e.target.value }))}
                className="font-mono zine-border rounded-none" />
              <Input placeholder="Twitter/X (tanpa @)" value={form.twitter}
                onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))}
                className="font-mono zine-border rounded-none" />
              <Input placeholder="YouTube channel" value={form.youtube}
                onChange={e => setForm(f => ({ ...f, youtube: e.target.value }))}
                className="font-mono zine-border rounded-none" />
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? "Menyimpan..." : "Simpan Profil"}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-secondary animate-pulse zine-border" />)}
        </div>
      ) : friends?.length === 0 ? (
        <div className="zine-border bg-card p-12 text-center max-w-lg mx-auto">
          <p className="font-bold text-3xl mb-4 text-primary">Belum Ada Siapa-siapa</p>
          <p className="font-mono text-muted-foreground">Jadilah yang pertama nangkring di sini minggu ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {friends?.map((friend, i) => {
            const profile = getProfile(friend.handle);
            return (
              <div key={friend.handle}
                className={`zine-border bg-card p-6 relative group ${i < 3 ? 'bg-primary/5 border-primary' : ''}`}>
                {i < 3 && (
                  <div className="absolute -top-3 -right-3 zine-badge bg-accent text-accent-foreground text-xl transform rotate-12">
                    #{i + 1}
                  </div>
                )}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-dashed border-muted">
                  <div className="w-14 h-14 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center font-display font-black text-2xl uppercase group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    {friend.handle.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl truncate">@{friend.handle}</h3>
                    {i === 0 && <p className="text-xs font-bold uppercase tracking-widest text-primary">Penguasa Warung</p>}
                    {profile?.bio && <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{profile.bio}</p>}
                  </div>
                </div>

                {/* Sosmed links */}
                {profile && (profile.instagram || profile.tiktok || profile.twitter || profile.youtube) && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {profile.instagram && (
                      <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-mono px-2 py-1 bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors border border-foreground">
                        <Instagram className="w-3 h-3" /> {profile.instagram}
                      </a>
                    )}
                    {profile.tiktok && (
                      <a href={`https://tiktok.com/@${profile.tiktok}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-mono px-2 py-1 bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors border border-foreground">
                        <TikTokIcon /> {profile.tiktok}
                      </a>
                    )}
                    {profile.twitter && (
                      <a href={`https://x.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-mono px-2 py-1 bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors border border-foreground">
                        <XIcon /> {profile.twitter}
                      </a>
                    )}
                    {profile.youtube && (
                      <a href={`https://youtube.com/@${profile.youtube}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-mono px-2 py-1 bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors border border-foreground">
                        <Youtube className="w-3 h-3" /> {profile.youtube}
                      </a>
                    )}
                  </div>
                )}

                {!profile && (
                  <p className="text-xs font-mono text-muted-foreground mb-4 italic">
                    Belum daftar profil sosmed
                  </p>
                )}

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
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
