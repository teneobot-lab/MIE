import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  count: number;
  onVote: () => Promise<void>;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
};

export function VoteButton({ count, onVote, disabled, size = "md" }: Props) {
  const [isVoting, setIsVoting] = useState(false);
  const [localCount, setLocalCount] = useState(count);
  useEffect(() => {
    if (!hasVoted) setLocalCount(count);
  }, [count, hasVoted]);
  const [hasVoted, setHasVoted] = useState(false);
  const [animate, setAnimate] = useState(false);

  const handleVote = async () => {
    if (isVoting || disabled || hasVoted) return;
    setIsVoting(true);
    try {
      await onVote();
      setLocalCount(c => c + 1);
      setHasVoted(true);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 600);

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#ff0080", "#ff4db8", "#ffffff", "#000000", "#ffd700"],
        ticks: 200,
      });
    } catch {}
    setIsVoting(false);
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-2 text-sm gap-1.5",
    lg: "px-4 py-3 text-base gap-2",
  };

  const iconSize = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };

  return (
    <button
      onClick={handleVote}
      disabled={disabled || isVoting || hasVoted}
      className={cn(
        "flex items-center font-black uppercase tracking-wider border-2 transition-all duration-200 active:scale-90",
        sizeClasses[size],
        hasVoted
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary",
        disabled && "opacity-40 cursor-not-allowed",
        animate && "scale-110"
      )}>
      <ArrowUp className={cn(iconSize[size], animate && "animate-bounce")} />
      <span className={cn("transition-all duration-300", animate && "scale-125")}>
        {localCount}
      </span>
      {hasVoted && <span className="text-[10px]">✓</span>}
    </button>
  );
}
