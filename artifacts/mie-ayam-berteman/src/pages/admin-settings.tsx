import { useEffect, useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Settings, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AppSettings } from "@/hooks/use-settings";

const FIELDS: { key: keyof AppSettings; label: string; placeholder: string }[] = [
  { key: "nama_usaha", label: "Nama Usaha", placeholder: "Mie Ayam Berteman" },
  { key: "tagline", label: "Tagline", placeholder: "Warung makan dengan playlist request langsung!" },
  { key: "alamat", label: "Alamat", placeholder: "Jl. Contoh No. 1, Jakarta" },
  { key: "jam_buka", label: "Jam Buka", placeholder: "08:00 - 22:00" },
  { key: "instagram", label: "Instagram", placeholder: "@mieayamberteman" },
  { key: "tiktok", label: "TikTok", placeholder: "@mieayamberteman" },
  { key: "logo_url", label: "URL Logo", placeholder: "https://..." },
];

export default function AdminSettings() {
  const [form, setForm] = useState<AppSettings>({
    nama_usaha: "", tagline: "", alamat: "", jam_buka: "",
    instagram: "", tiktok: "", logo_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => { setForm(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast({ title: "✅ Pengaturan disimpan!" });
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-2xl min-h-[80vh]">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary text-primary-foreground px-6 py-2 font-bold uppercase tracking-widest zine-border flex items-center gap-2">
          <Settings className="w-5 h-5" /> Pengaturan Usaha
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 w-full rounded" />)}</div>
      ) : (
        <div className="zine-border bg-card p-6 space-y-5">
          {FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block font-bold uppercase text-xs tracking-widest mb-1.5">{label}</label>
              {key === "logo_url" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border-2 border-foreground bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary"
                  />
                  {form.logo_url && (
                    <img src={form.logo_url} alt="Logo preview" className="h-16 border-2 border-foreground object-contain" />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border-2 border-foreground bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary"
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all zine-border disabled:opacity-50">
            <Save className="w-5 h-5" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      )}
    </PageTransition>
  );
}
