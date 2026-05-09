import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { QRCode } from "@/components/ui/qr-code";
import { QrCode, Download } from "lucide-react";

const BASE_URL = window.location.origin;
const TABLES = Array.from({ length: 10 }, (_, i) => i + 1);

export default function QrMeja() {
  const [selected, setSelected] = useState(1);
  const url = `${BASE_URL}/order?meja=${selected}`;

  const download = () => {
    const img = new Image();
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&margin=4`;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 460;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 460);
      ctx.drawImage(img, 0, 0, 400, 400);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Meja ${selected} — Scan untuk Order`, 200, 440);
      const a = document.createElement("a");
      a.download = `qr-meja-${selected}.png`;
      a.href = canvas.toDataURL();
      a.click();
    };
  };

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-xl min-h-[80vh]">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary text-primary-foreground px-6 py-2 font-bold uppercase tracking-widest zine-border flex items-center gap-2">
          <QrCode className="w-5 h-5" /> QR Code Meja
        </div>
      </div>

      <div className="zine-border bg-card p-6 flex flex-col items-center gap-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {TABLES.map(t => (
            <button key={t} onClick={() => setSelected(t)}
              className={`w-10 h-10 font-bold border-2 transition-all ${selected === t ? "bg-primary text-primary-foreground border-primary" : "border-foreground hover:bg-secondary"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className="font-mono text-sm text-muted-foreground mb-1">Meja {selected}</p>
          <QRCode value={url} size={220} />
          <p className="font-mono text-xs text-muted-foreground mt-2 break-all max-w-[220px]">{url}</p>
        </div>

        <button onClick={download}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-bold uppercase hover:opacity-90 active:scale-95 transition-all zine-border">
          <Download className="w-4 h-4" /> Download QR Meja {selected}
        </button>
      </div>
    </PageTransition>
  );
}
