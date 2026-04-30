import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, X } from "lucide-react";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string | null;
  spicy: boolean;
  available: boolean;
};

const emptyForm = { name: "", description: "", category: "mie", price: "", spicy: false, available: true };

export default function AdminMenu() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: items = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["admin-menu"],
    queryFn: () => customFetch("/api/menu"),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("spicy", String(form.spicy));
      fd.append("available", String(form.available));
      if (imageFile) fd.append("image", imageFile);
      const url = editItem ? `/api/admin/menu/${editItem.id}` : "/api/admin/menu";
      const method = editItem ? "PUT" : "POST";
      return customFetch(url, { method, body: fd });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-menu"] });
      toast({ title: editItem ? "Menu diupdate!" : "Menu ditambahkan!" });
      setShowForm(false);
      setEditItem(null);
      setForm(emptyForm);
      setImageFile(null);
    },
    onError: () => toast({ title: "Gagal simpan", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/admin/menu/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-menu"] });
      toast({ title: "Menu dihapus!" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/admin/menu/${id}/toggle`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-menu"] }),
  });

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description, category: item.category, price: String(item.price), spicy: item.spicy, available: item.available });
    setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Management Menu</h1>
        <Button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Menu
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{editItem ? "Edit Menu" : "Tambah Menu Baru"}</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama menu" />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="mie, minuman, dll" />
            </div>
            <div className="space-y-2">
              <Label>Harga (Rp)</Label>
              <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="15000" />
            </div>
            <div className="space-y-2">
              <Label>Foto</Label>
              <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Deskripsi menu" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.spicy} onCheckedChange={v => setForm(f => ({ ...f, spicy: v }))} />
                <Label>Pedas</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.available} onCheckedChange={v => setForm(f => ({ ...f, available: v }))} />
                <Label>Tersedia</Label>
              </div>
            </div>
          </div>
          <Button className="mt-4" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-8">Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="border rounded-xl p-4 flex items-center gap-4">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.name}</span>
                  {item.spicy && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Pedas</span>}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-sm font-medium">Rp {item.price.toLocaleString("id-ID")} · {item.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={item.available} onCheckedChange={() => toggleMutation.mutate(item.id)} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm("Hapus menu ini?")) deleteMutation.mutate(item.id); }}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
