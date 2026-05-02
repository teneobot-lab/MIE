import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

type MenuItem = {
  id: number; name: string; category: string; price: number;
  available: boolean; imageUrl: string | null;
};

function formatRp(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }

export default function Stok() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: items = [], isLoading, refetch } = useQuery<MenuItem[]>({
    queryKey: ["stok-menu"],
    queryFn: () => customFetch("/api/menu"),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) =>
      customFetch(`/api/kasir/menu/${id}/toggle-stock`, { method: "PATCH" }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["stok-menu"] });
      toast({
        title: data.available ? "✅ Menu Tersedia" : "❌ Menu Habis",
        description: `${data.name} ${data.available ? "sekarang tersedia" : "ditandai habis"}`,
      });
    },
  });

  const available = items.filter(i => i.available);
  const unavailable = items.filter(i => !i.available);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight">📦 Manajemen Stok</h1>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border-2 border-green-400 bg-green-50 p-4 text-center">
          <p className="font-black text-3xl text-green-600">{available.length}</p>
          <p className="text-xs font-mono uppercase text-green-700">Menu Tersedia</p>
        </div>
        <div className="border-2 border-red-400 bg-red-50 p-4 text-center">
          <p className="font-black text-3xl text-red-600">{unavailable.length}</p>
          <p className="text-xs font-mono uppercase text-red-700">Menu Habis</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id}
              className={`border-2 p-4 flex items-center gap-4 transition-all ${
                item.available ? "border-foreground" : "border-dashed border-muted-foreground opacity-60"
              }`}>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name}
                  className="w-12 h-12 object-cover border border-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{item.name}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {item.category} · {formatRp(item.price)}
                </p>
              </div>
              <button
                onClick={() => toggleMutation.mutate(item.id)}
                disabled={toggleMutation.isPending}
                className={`flex items-center gap-2 px-4 py-2 border-2 font-bold text-sm uppercase transition-all duration-200 active:scale-95 ${
                  item.available
                    ? "border-red-400 text-red-600 hover:bg-red-50"
                    : "border-green-400 text-green-600 hover:bg-green-50"
                }`}>
                {item.available ? (
                  <><XCircle className="w-4 h-4" /> Tandai Habis</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Tersedia Lagi</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
