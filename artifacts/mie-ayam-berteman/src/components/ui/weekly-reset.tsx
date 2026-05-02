import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Trophy, Clock } from "lucide-react";

type Props = {
  resetsAt: string | null;
  weekStart: string | null;
};

function getTimeLeft(resetsAt: string) {
  const diff = new Date(resetsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, mins, secs, total: diff };
}

export function WeeklyResetCountdown({ resetsAt, weekStart }: Props) {
  const [timeLeft, setTimeLeft] = useState(resetsAt ? getTimeLeft(resetsAt) : null);
  const [ceremony, setCeremony] = useState(false);

  useEffect(() => {
    if (!resetsAt) return;
    const interval = setInterval(() => {
      const t = getTimeLeft(resetsAt);
      setTimeLeft(t);

      // Trigger ceremony saat 1 menit terakhir
      if (t && t.total < 60000 && !ceremony) {
        setCeremony(true);
        triggerCeremony();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [resetsAt]);

  const triggerCeremony = () => {
    const duration = 5000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ff0080", "#ffd700", "#ffffff"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ff0080", "#ffd700", "#ffffff"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  if (!timeLeft) return null;

  const isUrgent = timeLeft.total < 3600000; // < 1 jam
  const weekStr = weekStart ? new Date(weekStart).toLocaleDateString("id-ID", { day: "numeric", month: "long" }) : "";

  return (
    <div className={`border-2 p-4 transition-all duration-500 ${
      isUrgent ? "border-primary bg-primary/10 animate-pulse" : "border-foreground bg-secondary"
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className={`w-4 h-4 ${isUrgent ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-xs font-mono uppercase tracking-widest font-bold">
          {isUrgent ? "⚡ Chart Reset Sebentar Lagi!" : "Chart Reset Dalam"}
        </span>
      </div>
      <div className="flex gap-3 justify-center">
        {[
          { val: timeLeft.days, label: "Hari" },
          { val: timeLeft.hours, label: "Jam" },
          { val: timeLeft.mins, label: "Menit" },
          { val: timeLeft.secs, label: "Detik" },
        ].map(({ val, label }) => (
          <div key={label} className="text-center">
            <div className={`font-black text-2xl md:text-3xl w-12 h-12 flex items-center justify-center border-2 border-foreground ${
              isUrgent ? "bg-primary text-primary-foreground" : "bg-background"
            }`}>
              {String(val).padStart(2, "0")}
            </div>
            <p className="text-[10px] font-mono uppercase mt-1">{label}</p>
          </div>
        ))}
      </div>
      {weekStart && (
        <p className="text-xs font-mono text-muted-foreground text-center mt-2">
          Chart minggu {weekStr} akan diarsip
        </p>
      )}
    </div>
  );
}
