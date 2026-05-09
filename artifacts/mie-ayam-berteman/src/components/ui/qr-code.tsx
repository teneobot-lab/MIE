import { useEffect, useRef } from "react";

type Props = { value: string; size?: number; };

export function QRCode({ value, size = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Simple QR via Google Charts API
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000&margin=2`;
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.clearRect(0, 0, size, size); ctx.drawImage(img, 0, 0, size, size); }
    };
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="border-2 border-foreground" />;
}
