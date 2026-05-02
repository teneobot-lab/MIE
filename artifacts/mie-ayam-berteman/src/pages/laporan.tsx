import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { TrendingUp, ShoppingBag, XCircle, CreditCard, Banknote, BarChart3, Trophy, Clock, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type LaporanData = {
  from: string;
  to: string;
  totalRevenue: number;
  totalOrders: number;
  cancelledOrders: number;
  methodBreakdown: { method: string; total: number; count: number }[];
  topMenu: { name: string; qty: number; revenue: number }[];
  perJam: { jam: number; count: number; total: number }[];
};

function formatRp(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}


function exportToExcel(data: LaporanData) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan
  const summary = [
    ["LAPORAN PENJUALAN MIE AYAM BERTEMAN"],
    ["Periode", `${new Date(data.from).toLocaleDateString("id-ID")} - ${new Date(data.to).toLocaleDateString("id-ID")}`],
    [],
    ["Total Pendapatan", data.totalRevenue],
    ["Total Order Lunas", data.totalOrders],
    ["Order Dibatalkan", data.cancelledOrders],
    ["Rata-rata per Order", data.totalOrders > 0 ? Math.round(data.totalRevenue / data.totalOrders) : 0],
    [],
    ["BREAKDOWN METODE BAYAR"],
    ["Metode", "Jumlah Transaksi", "Total"],
    ...data.methodBreakdown.map(m => [m.method.toUpperCase(), m.count, m.total]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");

  // Sheet 2: Menu Terlaris
  const menuData = [
    ["MENU TERLARIS"],
    ["No", "Nama Menu", "Qty Terjual", "Total Pendapatan"],
    ...data.topMenu.map((m, i) => [i + 1, m.name, m.qty, m.revenue]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(menuData);
  XLSX.utils.book_append_sheet(wb, ws2, "Menu Terlaris");

  // Sheet 3: Per Jam
  const jamData = [
    ["TRANSAKSI PER JAM"],
    ["Jam", "Jumlah Order", "Total Pendapatan"],
    ...data.perJam.map(j => [`${String(j.jam).padStart(2,"0")}:00`, j.count, j.total]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(jamData);
  XLSX.utils.book_append_sheet(wb, ws3, "Per Jam");

  XLSX.writeFile(wb, `laporan-mab-${new Date().toISOString().split("T")[0]}.xlsx`);
}

function exportToPDF(data: LaporanData) {
  const doc = new jsPDF();
  const dateStr = `${new Date(data.from).toLocaleDateString("id-ID")} - ${new Date(data.to).toLocaleDateString("id-ID")}`;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN PENJUALAN", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("MIE AYAM BERTEMAN", 105, 28, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Periode: ${dateStr}`, 105, 36, { align: "center" });

  // Summary
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RINGKASAN", 14, 50);

  autoTable(doc, {
    startY: 54,
    head: [["Keterangan", "Nilai"]],
    body: [
      ["Total Pendapatan", `Rp ${data.totalRevenue.toLocaleString("id-ID")}`],
      ["Total Order Lunas", String(data.totalOrders)],
      ["Order Dibatalkan", String(data.cancelledOrders)],
      ["Rata-rata per Order", `Rp ${data.totalOrders > 0 ? Math.round(data.totalRevenue / data.totalOrders).toLocaleString("id-ID") : 0}`],
    ],
    theme: "striped",
    headStyles: { fillColor: [220, 0, 100] },
  });

  // Menu terlaris
  const afterSummary = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("MENU TERLARIS", 14, afterSummary);

  autoTable(doc, {
    startY: afterSummary + 4,
    head: [["No", "Menu", "Qty", "Pendapatan"]],
    body: data.topMenu.map((m, i) => [
      i + 1, m.name, m.qty, `Rp ${m.revenue.toLocaleString("id-ID")}`
    ]),
    theme: "striped",
    headStyles: { fillColor: [220, 0, 100] },
  });

  // Per jam
  const afterMenu = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("TRANSAKSI PER JAM", 14, afterMenu);

  autoTable(doc, {
    startY: afterMenu + 4,
    head: [["Jam", "Jumlah Order", "Total"]],
    body: data.perJam.map(j => [
      `${String(j.jam).padStart(2,"0")}:00`, j.count, `Rp ${j.total.toLocaleString("id-ID")}`
    ]),
    theme: "striped",
    headStyles: { fillColor: [220, 0, 100] },
  });

  doc.save(`laporan-mab-${new Date().toISOString().split("T")[0]}.pdf`);
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="border-2 border-foreground p-4 bg-card">
      <div className={`flex items-center gap-2 mb-2 ${color ?? "text-muted-foreground"}`}>
        {icon}
        <span className="text-xs font-mono uppercase tracking-widest">{label}</span>
      </div>
      <p className="font-black text-2xl">{value}</p>
      {sub && <p className="text-xs font-mono text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function Laporan() {
  const today = new Date().toISOString().split("T")[0];
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const { data, isLoading, refetch } = useQuery<LaporanData>({
    queryKey: ["laporan", from, to],
    queryFn: () => customFetch(`/api/kasir/laporan?from=${from}T00:00:00&to=${to}T23:59:59`),
  });

  const maxJam = Math.max(...(data?.perJam.map(j => j.count) ?? [1]));
  const maxMenu = Math.max(...(data?.topMenu.map(m => m.qty) ?? [1]));

  const cash = data?.methodBreakdown.find(m => m.method === "cash");
  const qris = data?.methodBreakdown.find(m => m.method === "qris");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-black text-3xl uppercase tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Laporan Penjualan
        </h1>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-3 mb-8 border-2 border-foreground p-4 bg-secondary">
        <div>
          <label className="text-xs font-mono uppercase tracking-widest block mb-1">Dari</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border-2 border-foreground px-3 py-2 font-mono text-sm bg-background" />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-widest block mb-1">Sampai</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border-2 border-foreground px-3 py-2 font-mono text-sm bg-background" />
        </div>
        <button onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm uppercase border-2 border-primary hover:opacity-90 transition-opacity">
          Tampilkan
        </button>
        <button onClick={() => { setFrom(today); setTo(today); }}
          className="px-4 py-2 border-2 border-foreground font-bold text-sm uppercase hover:bg-secondary transition-colors">
          Hari Ini
        </button>
        <button onClick={() => {
          const d = new Date();
          const first = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
          setFrom(first); setTo(today);
        }} className="px-4 py-2 border-2 border-foreground font-bold text-sm uppercase hover:bg-secondary transition-colors">
          Bulan Ini
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 font-mono text-muted-foreground">Memuat data...</div>
      ) : !data ? null : (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Total Pendapatan"
              value={formatRp(data.totalRevenue)}
              color="text-primary"
            />
            <StatCard
              icon={<ShoppingBag className="w-4 h-4" />}
              label="Order Lunas"
              value={String(data.totalOrders)}
              sub={data.totalOrders > 0 ? `Avg ${formatRp(Math.round(data.totalRevenue / data.totalOrders))}` : "-"}
            />
            <StatCard
              icon={<Banknote className="w-4 h-4" />}
              label="Cash"
              value={formatRp(cash?.total ?? 0)}
              sub={`${cash?.count ?? 0} transaksi`}
            />
            <StatCard
              icon={<CreditCard className="w-4 h-4" />}
              label="QRIS"
              value={formatRp(qris?.total ?? 0)}
              sub={`${qris?.count ?? 0} transaksi`}
            />
          </div>

          {data.cancelledOrders > 0 && (
            <div className="flex items-center gap-2 text-sm font-mono text-red-600 border border-red-300 bg-red-50 px-4 py-2">
              <XCircle className="w-4 h-4" />
              {data.cancelledOrders} order dibatalkan pada periode ini
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Menu terlaris */}
            <div className="border-2 border-foreground p-4">
              <h2 className="font-black uppercase tracking-tight flex items-center gap-2 mb-4 pb-3 border-b-2 border-foreground">
                <Trophy className="w-5 h-5 text-primary" /> Menu Terlaris
              </h2>
              {data.topMenu.length === 0 ? (
                <p className="text-muted-foreground font-mono text-sm text-center py-4">Belum ada data</p>
              ) : (
                <div className="space-y-3">
                  {data.topMenu.map((m, i) => (
                    <div key={m.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black w-5 text-primary">#{i+1}</span>
                          <span className="font-bold text-sm truncate">{m.name}</span>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-xs font-mono text-muted-foreground">{m.qty} porsi</span>
                          <span className="text-xs font-mono ml-2">{formatRp(m.revenue)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary border border-foreground">
                        <div className="h-full bg-primary transition-all"
                          style={{ width: `${Math.round((m.qty / maxMenu) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transaksi per jam */}
            <div className="border-2 border-foreground p-4">
              <h2 className="font-black uppercase tracking-tight flex items-center gap-2 mb-4 pb-3 border-b-2 border-foreground">
                <Clock className="w-5 h-5 text-primary" /> Ramai per Jam
              </h2>
              {data.perJam.length === 0 ? (
                <p className="text-muted-foreground font-mono text-sm text-center py-4">Belum ada data</p>
              ) : (
                <div className="space-y-2">
                  {data.perJam.map(j => (
                    <div key={j.jam} className="flex items-center gap-3">
                      <span className="text-xs font-mono w-12 shrink-0 text-right">
                        {String(j.jam).padStart(2,"0")}:00
                      </span>
                      <div className="flex-1 h-6 bg-secondary border border-foreground relative">
                        <div className="h-full bg-primary transition-all flex items-center justify-end pr-1"
                          style={{ width: `${Math.round((j.count / maxJam) * 100)}%` }}>
                        </div>
                      </div>
                      <span className="text-xs font-mono w-16 shrink-0">
                        {j.count}x · {formatRp(j.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Print button */}
          <div className="flex justify-end gap-2 flex-wrap">
            <button onClick={() => exportToExcel(data)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-green-600 text-green-700 font-bold text-sm uppercase hover:bg-green-50 transition-colors">
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            <button onClick={() => exportToPDF(data)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-600 font-bold text-sm uppercase hover:bg-red-50 transition-colors">
              <FileText className="w-4 h-4" /> Export PDF
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border-2 border-foreground font-bold text-sm uppercase hover:bg-secondary transition-colors">
              🖨️ Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
