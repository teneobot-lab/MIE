import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Voucher = {
  id: number; code: string; description: string | null;
  type: string; value: number; minOrder: number;
  maxUses: number; usedCount: number; active: boolean;
  expiresAt: string | null; createdAt: string;
};

function formatRp(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }

const emptyForm = { code: "", description: "", type: "percent", value: "", minOrder: "", maxUses: "1", expiresAt: "" };

export default function AdminVoucher() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: vouchers = [], isLoading } = useQuery<Voucher[]>({
    queryKey: ["admin-vouchers"],
    queryFn: () => customFetch("/api/admin/vouchers"),
  });

  const createMutation = useMutation({
    mutationFn: () => customFetch("/api/admin/vouchers", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vouchers"] });
      toast({ title: "✅ Voucher dibuat!" });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Gagal buat voucher", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/admin/vouchers/${id}/toggle`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vouchers"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/admin/vouchers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vouchers"] });
      toast({ title: "Voucher dihapus" });
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight">🎟️ Voucher & Promo</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Buat Voucher
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border-2 border-foreground p-6 mb-6 bg-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold uppercase">Voucher Baru</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Kode Voucher</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="DISKON20" className="font-mono uppercase" />
            </div>
            <div className="space-y-1">
              <Label>Deskripsi</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Diskon 20% untuk semua menu" />
            </div>
            <div className="space-y-1">
              <Label>Tipe Diskon</Label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border-2 border-foreground px-3 py-2 font-mono text-sm bg-background">
                <option value="percent">Persen (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>{form.type === "percent" ? "Besar Diskon (%)" : "Besar Diskon (Rp)"}</Label>
              <Input type="number" value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder={form.type === "percent" ? "20" : "10000"} />
            </div>
            <div className="space-y-1">
              <Label>Minimum Order (Rp)</Label>
              <Input type="number" value={form.minOrder}
                onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))}
                placeholder="0 = tidak ada minimum" />
            </div>
            <div className="space-y-1">
              <Label>Maksimal Pemakaian</Label>
              <Input type="number" value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                placeholder="1" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Kadaluarsa (opsional)</Label>
              <Input type="datetime-local" value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
            </div>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="mt-4">
            {createMutation.isPending ? "Menyimpan..." : "Buat Voucher"}
          </Button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Loading...</p>
      ) : vouchers.length === 0 ? (
        <div className="border-2 border-dashed border-muted p-12 text-center text-muted-foreground font-mono">
          Belum ada voucher. Buat voucher pertama!
        </div>
      ) : (
        <div className="space-y-3">
          {vouchers.map(v => (
            <div key={v.id} className={`border-2 p-4 transition-all ${v.active ? "border-foreground" : "border-dashed border-muted opacity-60"}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-black text-lg font-mono bg-primary text-primary-foreground px-2 py-0.5">{v.code}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 border ${v.active ? "border-green-400 text-green-600 bg-green-50" : "border-gray-300 text-gray-500"}`}>
                      {v.active ? "AKTIF" : "NONAKTIF"}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 border border-blue-300 text-blue-600 bg-blue-50">
                      {v.type === "percent" ? `${v.value}%` : formatRp(v.value)}
                    </span>
                  </div>
                  {v.description && <p className="text-sm text-muted-foreground mb-1">{v.description}</p>}
                  <div className="flex gap-3 text-xs font-mono text-muted-foreground flex-wrap">
                    {v.minOrder > 0 && <span>Min: {formatRp(v.minOrder)}</span>}
                    <span>Dipakai: {v.usedCount}/{v.maxUses}x</span>
                    {v.expiresAt && <span>Exp: {new Date(v.expiresAt).toLocaleDateString("id-ID")}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggleMutation.mutate(v.id)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 border-2 border-foreground font-mono hover:bg-secondary transition-colors">
                    {v.active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                    {v.active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button onClick={() => { if (confirm("Hapus voucher ini?")) deleteMutation.mutate(v.id); }}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 border-2 border-red-400 text-red-600 font-mono hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
