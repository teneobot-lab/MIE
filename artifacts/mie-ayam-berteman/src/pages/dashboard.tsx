import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  ShoppingBag, UtensilsCrossed, BarChart3, Package,
  Ticket, Settings, ChevronRight, Clock, CheckCircle, XCircle
} from "lucide-react";

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  cancelledOrders: number;
};

function formatRp(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }

const menuItems = [
  {
    href: "/kasir",
    icon: ShoppingBag,
    label: "Kasir",
    desc: "Proses order & pembayaran",
    color: "bg-primary text-primary-foreground",
    border: "border-primary",
  },
  {
    href: "/admin/menu",
    icon: UtensilsCrossed,
    label: "Management Menu",
    desc: "Tambah, edit, hapus menu",
    color: "bg-foreground text-background",
    border: "border-foreground",
  },
  {
    href: "/kasir/stok",
    icon: Package,
    label: "Stok Menu",
    desc: "Tandai menu habis/tersedia",
    color: "bg-orange-500 text-white",
    border: "border-orange-500",
  },
  {
    href: "/admin/voucher",
    icon: Ticket,
    label: "Voucher & Promo",
    desc: "Buat dan kelola diskon",
    color: "bg-blue-500 text-white",
    border: "border-blue-500",
  },
  {
    href: "/kasir/laporan",
    icon: BarChart3,
    label: "Laporan Penjualan",
    desc: "Export PDF & Excel",
    color: "bg-green-600 text-white",
    border: "border-green-600",
  },
];

export default function Dashboard() {
  const today = new Date().toISOString().split("T")[0];
  const { data: laporan } = useQuery<Stats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => customFetch(`/api/kasir/laporan?from=${today}T00:00:00&to=${today}T23:59:59`),
    refetchInterval: 30000,
  });

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["dashboard-orders"],
    queryFn: () => customFetch("/api/kasir/orders"),
    refetchInterval: 10000,
  });

  const pending = orders.filter(o => !o.payment || o.payment.status === "pending").length;
  const cooking = orders.filter(o => o.status === "cooking").length;
  const done = orders.filter(o => o.status === "done").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-black text-3xl uppercase tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Dashboard Admin
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats hari ini */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="border-2 border-foreground p-4 bg-card">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Pendapatan Hari Ini</p>
          <p className="font-black text-xl text-primary">{formatRp(laporan?.totalRevenue ?? 0)}</p>
        </div>
        <div className="border-2 border-yellow-400 p-4 bg-yellow-50">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-yellow-600" />
            <p className="text-xs font-mono uppercase tracking-widest text-yellow-700">Belum Bayar</p>
          </div>
          <p className="font-black text-2xl text-yellow-600">{pending}</p>
        </div>
        <div className="border-2 border-orange-400 p-4 bg-orange-50">
          <div className="flex items-center gap-1 mb-1">
            <UtensilsCrossed className="w-3 h-3 text-orange-600" />
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700">Dimasak</p>
          </div>
          <p className="font-black text-2xl text-orange-600">{cooking}</p>
        </div>
        <div className="border-2 border-green-400 p-4 bg-green-50">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <p className="text-xs font-mono uppercase tracking-widest text-green-700">Selesai</p>
          </div>
          <p className="font-black text-2xl text-green-600">{done}</p>
        </div>
      </div>

      {/* Menu navigasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {menuItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`border-2 ${item.border} p-5 flex items-center gap-4 hover:shadow-[4px_4px_0px_0px] hover:shadow-foreground transition-all duration-200 active:scale-[0.98] group bg-card`}>
            <div className={`w-12 h-12 ${item.color} flex items-center justify-center shrink-0 border-2 border-foreground`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black uppercase tracking-tight">{item.label}</p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {/* Order terbaru */}
      <div className="border-2 border-foreground p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black uppercase tracking-tight">Order Terbaru</h2>
          <Link href="/kasir" className="text-xs font-mono text-primary hover:underline">
            Lihat Semua →
          </Link>
        </div>
        <div className="space-y-2">
          {orders.slice(0, 5).map(order => (
            <Link key={order.id} href="/kasir"
              className="flex items-center justify-between p-3 border border-muted hover:border-foreground transition-colors group">
              <div className="flex items-center gap-3">
                <span className="font-black text-sm">#{order.id}</span>
                <span className="font-mono text-sm text-muted-foreground">@{order.handle}</span>
                <span className={`text-xs font-mono px-1.5 py-0.5 border ${
                  order.status === "done" ? "border-green-400 text-green-600 bg-green-50" :
                  order.status === "cooking" ? "border-orange-400 text-orange-600 bg-orange-50" :
                  "border-gray-300 text-gray-500 bg-gray-50"
                }`}>
                  {order.status === "done" ? "✅ Selesai" : order.status === "cooking" ? "🍳 Dimasak" : "⏳ Pending"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">{formatRp(order.total)}</span>
                <span className={`text-xs font-mono px-1.5 py-0.5 border ${
                  order.payment?.status === "paid" ? "border-green-400 text-green-600" :
                  "border-yellow-400 text-yellow-600"
                }`}>
                  {order.payment?.status === "paid" ? "LUNAS" : "PENDING"}
                </span>
              </div>
            </Link>
          ))}
          {orders.length === 0 && (
            <p className="text-center py-4 text-muted-foreground font-mono text-sm">Belum ada order hari ini</p>
          )}
        </div>
      </div>
    </div>
  );
}
