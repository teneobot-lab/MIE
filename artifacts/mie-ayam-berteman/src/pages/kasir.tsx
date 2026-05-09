import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Receipt, ChefHat, CheckCircle, XCircle, Clock, Printer, RefreshCw, Bell, UtensilsCrossed, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrisModal } from "@/components/ui/qris-modal";
import { useNewOrderNotification, requestNotificationPermission } from "@/hooks/use-notifications";

type OrderItem = { id: number; name: string; quantity: number; price: number };
type Payment = { id: number; method: string; status: string; amount: number; paidAt: string | null };
type Order = {
  id: number; handle: string; total: number; createdAt: string; status: string;
  items: OrderItem[]; payment: Payment | null;
};

function formatRp(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ payment }: { payment: Payment | null }) {
  if (!payment || payment.status === "pending") return (
    <span className="flex items-center gap-1 text-xs font-mono bg-yellow-100 text-yellow-800 px-2 py-1 border border-yellow-400">
      <Clock className="w-3 h-3" /> PENDING
    </span>
  );
  if (payment.status === "paid") return (
    <span className="flex items-center gap-1 text-xs font-mono bg-green-100 text-green-800 px-2 py-1 border border-green-400">
      <CheckCircle className="w-3 h-3" /> LUNAS
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-mono bg-red-100 text-red-800 px-2 py-1 border border-red-400">
      <XCircle className="w-3 h-3" /> CANCEL
    </span>
    {/* Konfirmasi Cancel Order */}
      {confirmCancelId !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border-4 border-destructive p-6 max-w-sm w-full zine-border">
            <h3 className="font-black text-xl uppercase mb-2 text-destructive">Batalkan Order?</h3>
            <p className="font-mono text-sm text-muted-foreground mb-6">
              Order #{confirmCancelId} akan dibatalkan dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancelId(null)}
                className="flex-1 border-2 border-foreground py-2.5 font-bold uppercase text-sm hover:bg-secondary transition-all">
                Batal
              </button>
              <button onClick={() => { cancelMutation.mutate(confirmCancelId); setConfirmCancelId(null); }}
                className="flex-1 bg-destructive text-destructive-foreground py-2.5 font-bold uppercase text-sm hover:opacity-90 transition-all border-2 border-destructive">
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  if (status === "pending") return (
    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 border border-gray-300">PENDING</span>
  );
  if (status === "cooking") return (
    <span className="text-xs font-mono bg-orange-100 text-orange-700 px-2 py-0.5 border border-orange-300">🍳 DIMASAK</span>
  );
  return (
    <span className="text-xs font-mono bg-green-100 text-green-700 px-2 py-0.5 border border-green-300">✅ SELESAI</span>
    {/* Konfirmasi Cancel Order */}
      {confirmCancelId !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border-4 border-destructive p-6 max-w-sm w-full zine-border">
            <h3 className="font-black text-xl uppercase mb-2 text-destructive">Batalkan Order?</h3>
            <p className="font-mono text-sm text-muted-foreground mb-6">
              Order #{confirmCancelId} akan dibatalkan dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancelId(null)}
                className="flex-1 border-2 border-foreground py-2.5 font-bold uppercase text-sm hover:bg-secondary transition-all">
                Batal
              </button>
              <button onClick={() => { cancelMutation.mutate(confirmCancelId); setConfirmCancelId(null); }}
                className="flex-1 bg-destructive text-destructive-foreground py-2.5 font-bold uppercase text-sm hover:opacity-90 transition-all border-2 border-destructive">
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
  );
}

function ReceiptPreview({ order, type }: { order: Order; type: "customer" | "kitchen" }) {
  const isPaid = order.payment?.status === "paid";
  const now = new Date().toLocaleString("id-ID");
  if (type === "kitchen") {
    return (
      <div className="font-mono text-sm bg-white text-black p-4 border-2 border-dashed border-gray-400 w-72 mx-auto">
        <div className="text-center font-black text-lg mb-2 border-b-2 border-black pb-2">*** KITCHEN ***</div>
        <div className="mb-2">
          <p>Order #{order.id}</p>
          <p>Customer: @{order.handle}</p>
          <p>Waktu: {formatTime(order.createdAt)}</p>
        </div>
        <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between">
              <span>{item.quantity}x {item.name}</span>
            </div>
          ))}
        </div>
        <div className="text-center border-t border-dashed border-gray-400 pt-2 font-black">SEGERA DIPROSES!</div>
      </div>
    );
  }
  return (
    <div className="font-mono text-sm bg-white text-black p-4 border-2 border-dashed border-gray-400 w-72 mx-auto">
      <div className="text-center mb-2">
        <p className="font-black text-lg">MIE AYAM BERTEMAN</p>
        <p className="text-xs">Satu pesanan = satu request lagu!</p>
        <div className="border-t border-dashed border-gray-400 my-2" />
      </div>
      <div className="mb-2">
        <p>No: #{order.id}</p>
        <p>Customer: @{order.handle}</p>
        <p>Tanggal: {now}</p>
        <p>Bayar: {order.payment?.method?.toUpperCase() ?? "CASH"}</p>
      </div>
      <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between">
            <span>{item.quantity}x {item.name}</span>
            <span>{formatRp(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-black pt-2 flex justify-between font-black">
        <span>TOTAL</span><span>{formatRp(order.total)}</span>
      </div>
      {isPaid && (
        <div className="text-center mt-2 border-t border-dashed border-gray-400 pt-2">
          <p className="font-black">*** LUNAS ***</p>
          <p className="text-xs">{order.payment?.paidAt ? formatTime(order.payment.paidAt) : ""}</p>
        </div>
      )}
      <div className="text-center mt-2 text-xs border-t border-dashed border-gray-400 pt-2">
        <p>Terima kasih sudah makan!</p>
        <p>Jangan lupa request lagu 🎵</p>
      </div>
    </div>
    {/* Konfirmasi Cancel Order */}
      {confirmCancelId !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border-4 border-destructive p-6 max-w-sm w-full zine-border">
            <h3 className="font-black text-xl uppercase mb-2 text-destructive">Batalkan Order?</h3>
            <p className="font-mono text-sm text-muted-foreground mb-6">
              Order #{confirmCancelId} akan dibatalkan dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancelId(null)}
                className="flex-1 border-2 border-foreground py-2.5 font-bold uppercase text-sm hover:bg-secondary transition-all">
                Batal
              </button>
              <button onClick={() => { cancelMutation.mutate(confirmCancelId); setConfirmCancelId(null); }}
                className="flex-1 bg-destructive text-destructive-foreground py-2.5 font-bold uppercase text-sm hover:opacity-90 transition-all border-2 border-destructive">
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
  );
}

export default function Kasir() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptType, setReceiptType] = useState<"customer" | "kitchen">("customer");
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");
  const [showQris, setShowQris] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
  const [notifGranted, setNotifGranted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestNotificationPermission().then(setNotifGranted);
  }, []);

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ["kasir-orders"],
    queryFn: () => customFetch("/api/kasir/orders"),
    refetchInterval: 10000,
  });

  useNewOrderNotification(orders);

  const payMutation = useMutation({
    mutationFn: ({ id, method }: { id: number; method: string }) =>
      customFetch(`/api/kasir/orders/${id}/pay`, {
        method: "POST", body: JSON.stringify({ method }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kasir-orders"] });
      toast({ title: "Pembayaran berhasil!" });
      setSelectedOrder(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => customFetch(`/api/kasir/orders/${id}/cancel`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kasir-orders"] });
      toast({ title: "Order dibatalkan" });
      setSelectedOrder(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      customFetch(`/api/kasir/orders/${id}/status`, {
        method: "PATCH", body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["kasir-orders"] });
      setSelectedOrder(prev => prev ? { ...prev, status: data.status } : null);
      if (data.status === "done") toast({ title: "✅ Pesanan selesai!" });
      else if (data.status === "cooking") toast({ title: "🍳 Pesanan sedang dimasak!" });
    },
  });

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Struk</title><style>body{margin:0;padding:16px;font-family:monospace;}</style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
    win.close();
  };

  const filtered = orders.filter(o => {
    if (filter === "pending") return !o.payment || o.payment.status === "pending";
    if (filter === "paid") return o.payment?.status === "paid";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-black uppercase tracking-tight">🧾 Kasir</h1>
        <div className="flex gap-2 flex-wrap">
          {!notifGranted && (
            <button onClick={() => requestNotificationPermission().then(setNotifGranted)}
              className="flex items-center gap-2 text-sm font-mono border-2 border-yellow-400 bg-yellow-50 px-3 py-1.5 hover:bg-yellow-100 transition-colors">
              <Bell className="w-4 h-4" /> Aktifkan Notifikasi
            </button>
          )}
          <a href="/kasir/laporan" className="flex items-center gap-2 text-sm font-mono border-2 border-foreground px-3 py-1.5 hover:bg-secondary transition-colors">
            📊 Laporan
          </a>
          <a href="/kasir/stok" className="flex items-center gap-2 text-sm font-mono border-2 border-foreground px-3 py-1.5 hover:bg-secondary transition-colors">
            📦 Stok
          </a>
          <a href="/admin/voucher" className="flex items-center gap-2 text-sm font-mono border-2 border-foreground px-3 py-1.5 hover:bg-secondary transition-colors">
            🎟️ Voucher
          </a>
          <button onClick={() => refetch()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "paid"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-mono uppercase border-2 transition-colors ${filter === f ? "bg-foreground text-background border-foreground" : "border-foreground hover:bg-secondary"}`}>
            {f === "all" ? "Semua" : f === "pending" ? "Belum Bayar" : "Lunas"}
          </button>
        ))}
        <span className="ml-auto text-xs font-mono text-muted-foreground self-center">Auto-refresh 10s</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground font-mono">Tidak ada order</p>
          ) : filtered.map(order => (
            <div key={order.id} onClick={() => setSelectedOrder(order)}
              className={`border-2 p-4 cursor-pointer transition-all hover:border-primary ${selectedOrder?.id === order.id ? "border-primary bg-primary/5" : "border-foreground"}`}>
              <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg">#{order.id}</span>
                  <span className="font-mono text-sm text-muted-foreground">@{order.handle}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <StatusBadge payment={order.payment} />
              </div>
              <div className="text-xs font-mono text-muted-foreground mb-2">
                {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-black">{formatRp(order.total)}</span>
                <span className="text-xs font-mono text-muted-foreground">{formatTime(order.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          {selectedOrder ? (
            <div className="border-2 border-foreground p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-lg uppercase">Order #{selectedOrder.id}</h2>
                <OrderStatusBadge status={selectedOrder.status} />
              </div>

              {/* Status kitchen */}
              <div className="flex gap-2 mb-4">
                <button onClick={() => statusMutation.mutate({ id: selectedOrder.id, status: "cooking" })}
                  disabled={selectedOrder.status === "cooking" || selectedOrder.status === "done"}
                  className={`flex-1 flex items-center justify-center gap-1 text-xs py-2 border-2 font-mono transition-colors ${selectedOrder.status === "cooking" ? "bg-orange-500 text-white border-orange-500" : "border-orange-400 text-orange-600 hover:bg-orange-50"} disabled:opacity-50`}>
                  <UtensilsCrossed className="w-3 h-3" /> Mulai Masak
                </button>
                <button onClick={() => statusMutation.mutate({ id: selectedOrder.id, status: "done" })}
                  disabled={selectedOrder.status === "done"}
                  className={`flex-1 flex items-center justify-center gap-1 text-xs py-2 border-2 font-mono transition-colors ${selectedOrder.status === "done" ? "bg-green-500 text-white border-green-500" : "border-green-400 text-green-600 hover:bg-green-50"} disabled:opacity-50`}>
                  <CheckCheck className="w-3 h-3" /> Selesai
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={() => setReceiptType("customer")}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 border-2 font-mono transition-colors ${receiptType === "customer" ? "bg-foreground text-background border-foreground" : "border-foreground"}`}>
                  <Receipt className="w-3 h-3" /> Customer
                </button>
                <button onClick={() => setReceiptType("kitchen")}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 border-2 font-mono transition-colors ${receiptType === "kitchen" ? "bg-foreground text-background border-foreground" : "border-foreground"}`}>
                  <ChefHat className="w-3 h-3" /> Kitchen
                </button>
              </div>

              <div ref={printRef} className="mb-4 overflow-auto">
                <ReceiptPreview order={selectedOrder} type={receiptType} />
              </div>

              <div className="space-y-2">
                <Button onClick={handlePrint} variant="outline" className="w-full gap-2">
                  <Printer className="w-4 h-4" /> Print Struk
                </Button>
                {(!selectedOrder.payment || selectedOrder.payment.status === "pending") && (
                  <>
                    <Button onClick={() => payMutation.mutate({ id: selectedOrder.id, method: "cash" })}
                      disabled={payMutation.isPending} className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="w-4 h-4" /> Bayar Cash
                    </Button>
                    <Button onClick={() => setShowQris(true)}
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                      <CheckCircle className="w-4 h-4" /> Bayar QRIS
                    </Button>
                    <Button onClick={() => setConfirmCancelId(selectedOrder.id)}
                      disabled={cancelMutation.isPending} variant="destructive" className="w-full gap-2">
                      <XCircle className="w-4 h-4" /> Cancel Order
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted p-12 text-center text-muted-foreground font-mono">
              Pilih order untuk lihat detail & struk
            </div>
          )}
        </div>
      </div>

      {showQris && selectedOrder && (
        <QrisModal
          orderId={selectedOrder.id}
          amount={selectedOrder.total}
          onConfirm={() => {
            payMutation.mutate({ id: selectedOrder.id, method: "qris" });
            setShowQris(false);
          }}
          onClose={() => setShowQris(false)}
        />
      )}
    </div>
    {/* Konfirmasi Cancel Order */}
      {confirmCancelId !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border-4 border-destructive p-6 max-w-sm w-full zine-border">
            <h3 className="font-black text-xl uppercase mb-2 text-destructive">Batalkan Order?</h3>
            <p className="font-mono text-sm text-muted-foreground mb-6">
              Order #{confirmCancelId} akan dibatalkan dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancelId(null)}
                className="flex-1 border-2 border-foreground py-2.5 font-bold uppercase text-sm hover:bg-secondary transition-all">
                Batal
              </button>
              <button onClick={() => { cancelMutation.mutate(confirmCancelId); setConfirmCancelId(null); }}
                className="flex-1 bg-destructive text-destructive-foreground py-2.5 font-bold uppercase text-sm hover:opacity-90 transition-all border-2 border-destructive">
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
  );
}
