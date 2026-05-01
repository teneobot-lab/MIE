import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/hooks/use-player";
import { X, ChevronUp, ChevronDown, Radio, Music2 } from "lucide-react";

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void; }
}

export function PersistentPlayer() {
  const { currentSong, videoId } = usePlayer();
  const playerDivRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [bars, setBars] = useState<number[]>(Array.from({ length: 16 }, () => 20));
  const currentVideoRef = useRef<string>("");

  useEffect(() => {
    if (window.YT?.Player) { setPlayerReady(true); return; }
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setPlayerReady(true);
  }, []);

  useEffect(() => {
    if (!playerReady || !videoId || !playerDivRef.current) return;
    if (videoId === currentVideoRef.current) return;
    currentVideoRef.current = videoId;
    setDismissed(false);
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(videoId);
    } else {
      playerRef.current = new window.YT.Player(playerDivRef.current, {
        height: "100%", width: "100%", videoId,
        playerVars: { autoplay: 1, controls: 1, modestbranding: 1, rel: 0 },
        events: { onReady: (e: any) => e.target.playVideo() },
      });
    }
  }, [playerReady, videoId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(Array.from({ length: 16 }, () => Math.floor(Math.random() * 90) + 10));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="fixed z-[-1] opacity-0 pointer-events-none" style={{ width: 1, height: 1, bottom: 0 }}>
        <div ref={playerDivRef} style={{ width: 1, height: 1 }} />
      </div>

      {currentSong && videoId && !dismissed && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${expanded ? "h-80" : "h-[72px]"}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          
          {/* Background */}
          <div className="absolute inset-0 bg-zinc-900/98 backdrop-blur-md border-t-2 border-zinc-700" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />

          {/* Main bar */}
          <div className="relative z-10 flex items-center px-4 h-[72px] gap-3">
            
            {/* Icon */}
            <div className="w-10 h-10 bg-primary flex items-center justify-center shrink-0 border border-primary/50">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary live-dot" />
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Now Playing</span>
              </div>
              <p className="font-black text-sm uppercase text-white truncate leading-none">{currentSong.title}</p>
              <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">{currentSong.artist}</p>
            </div>

            {/* Equalizer bars */}
            <div className="hidden sm:flex items-end gap-[2px] h-8 shrink-0 w-24">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 bg-primary rounded-sm transition-all duration-75"
                  style={{ height: `${h}%`, opacity: 0.6 + (h / 100) * 0.4 }} />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setExpanded(!expanded)}
                className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors rounded-full hover:bg-white/5">
                {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
              <button onClick={() => setDismissed(true)}
                className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded player */}
          {expanded && (
            <div className="relative z-10 px-4 pb-4" style={{ height: "calc(100% - 72px)" }}>
              <div className="w-full h-full border border-zinc-700 overflow-hidden rounded-sm">
                <div ref={playerDivRef} className="w-full h-full" />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
