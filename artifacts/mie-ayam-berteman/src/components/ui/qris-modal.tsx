import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, CheckCircle, Clock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  orderId: number;
  amount: number;
  onConfirm: () => void;
  onClose: () => void;
};

function formatRp(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function QrisModal({ orderId, amount, onConfirm, onClose }: Props) {
  const [status, setStatus] = useState<"waiting" | "confirming" | "paid">("waiting");
  const [seconds, setSeconds] = useState(300); // 5 menit timeout

  // Countdown timer
  useEffect(() => {
    if (status !== "waiting") return;
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Simulasi QRIS string (di production pakai string dari payment gateway)
  const qrisString = `00020101021226590014ID.CO.BANK.WWW011893600911000123456789020303UMI51440014ID.CO.QRIS.WWW0215ID20232023456780303UMI5204596253033605802ID5916MIE AYAM BERTEMAN6013KOTA BERTEMAN61051234062070703A016304${orderId.toString().padStart(4,"0")}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrisString);
  };

  const handleConfirm = () => {
    setStatus("confirming");
    setTimeout(() => {
      setStatus("paid");
      setTimeout(() => onConfirm(), 1000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="bg-background border-2 border-foreground w-full max-w-sm relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-foreground bg-primary text-primary-foreground">
          <span className="font-black uppercase tracking-tight">Bayar QRIS</span>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          {status === "paid" ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="font-black text-xl uppercase">Pembayaran Berhasil!</p>
              <p className="font-mono text-sm text-muted-foreground mt-2">Order #{orderId} lunas</p>
            </div>
          ) : (
            <>
              {/* Nominal */}
              <div className="text-center mb-4">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Total Pembayaran</p>
                <p className="font-black text-3xl text-primary">{formatRp(amount)}</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">Order #{orderId}</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-4">
                <div className="border-4 border-foreground p-3 bg-white">
                  <QRCodeSVG
                    value={qrisString}
                    size={200}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 rounded-sm" />
                  <div className="w-6 h-6 bg-blue-500 rounded-sm" />
                  <div className="w-6 h-6 bg-green-500 rounded-sm" />
                  <div className="w-6 h-6 bg-yellow-500 rounded-sm" />
                  <span className="text-xs font-mono font-bold">QRIS</span>
                </div>
              </div>

              {/* Nama merchant */}
              <div className="text-center mb-4 bg-secondary border border-foreground px-3 py-2">
                <p className="font-bold text-sm">MIE AYAM BERTEMAN</p>
                <p className="text-xs font-mono text-muted-foreground">Scan dengan aplikasi apapun</p>
              </div>

              {/* Timer */}
              <div className={`flex items-center justify-center gap-2 mb-4 font-mono text-sm ${seconds < 60 ? "text-red-500" : "text-muted-foreground"}`}>
                <Clock className="w-4 h-4" />
                <span>Berlaku {minutes}:{String(secs).padStart(2,"0")}</span>
              </div>

              {/* Copy button */}
              <button onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 text-xs font-mono border border-dashed border-muted-foreground py-2 hover:border-foreground transition-colors mb-4">
                <Copy className="w-3 h-3" /> Salin kode QRIS
              </button>

              {/* Confirm button */}
              <Button
                onClick={handleConfirm}
                disabled={status === "confirming" || seconds === 0}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                {status === "confirming" ? (
                  <span className="animate-pulse">Memverifikasi...</span>
                ) : seconds === 0 ? (
                  "QR Kadaluarsa"
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Konfirmasi Sudah Bayar
                  </>
                )}
              </Button>

              <p className="text-[10px] font-mono text-muted-foreground text-center mt-2">
                Klik konfirmasi setelah customer selesai scan & bayar
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
