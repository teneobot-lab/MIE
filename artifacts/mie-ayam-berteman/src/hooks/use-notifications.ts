import { useEffect, useRef, useCallback } from "react";

// Minta permission notifikasi browser
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

// Kirim browser notification
export function sendNotification(title: string, body: string, icon?: string) {
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: icon ?? "/favicon.svg",
    badge: "/favicon.svg",
  });
}

// Play suara notifikasi
export function playNotificationSound(type: "order" | "done" = "order") {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (type === "order") {
    // Ding ding untuk order baru
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } else {
    // Melody untuk pesanan selesai
    oscillator.frequency.setValueAtTime(523, ctx.currentTime);
    oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
    oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.6);
  }
}

// Hook untuk detect order baru di kasir
export function useNewOrderNotification(orders: any[]) {
  const prevCountRef = useRef<number | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (orders.length === 0) return;
    if (isFirstLoad.current) {
      prevCountRef.current = orders.length;
      isFirstLoad.current = false;
      return;
    }
    if (prevCountRef.current !== null && orders.length > prevCountRef.current) {
      const newCount = orders.length - prevCountRef.current;
      playNotificationSound("order");
      sendNotification(
        "🍜 Order Baru Masuk!",
        `${newCount} order baru menunggu konfirmasi`,
      );
    }
    prevCountRef.current = orders.length;
  }, [orders.length]);
}

// Hook untuk polling status order customer
export function useOrderStatus(orderId: number | null, onDone: () => void) {
  const isDoneRef = useRef(false);

  useEffect(() => {
    if (!orderId || isDoneRef.current) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL ?? ""}/api/kasir/orders/${orderId}`
        );
        const data = await res.json();
        if (data.status === "done" && !isDoneRef.current) {
          isDoneRef.current = true;
          clearInterval(interval);
          playNotificationSound("done");
          sendNotification(
            "✅ Pesanan Siap!",
            `Order #${orderId} sudah siap diambil!`,
          );
          onDone();
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [orderId]);
}
