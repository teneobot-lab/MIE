import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/hooks/use-player";
import { X, ChevronUp, ChevronDown, Music2, Radio } from "lucide-react";

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void; }
}

export function PersistentPlayer() {
  const { currentSong, videoId } = usePlayer();
  const playerRef = useRef<any>(null);
  const playerDivRef = useRef<HTMLDivElement>(null);
  const hiddenDivRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [bars, setBars] = useState<number[]>(Array.from({ length: 12 }, () => 20));
  const currentVideoRef = useRef<string>("");

  // Load YouTube API
  useEffect(() => {
    if (window.YT?.Player) { setPlayerReady(true); return; }
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setPlayerReady(true);
  }, []);

  // Init/update player
  useEffect(() => {
    if (!playerReady || !videoId) return;
    const targetDiv = expanded ? playerDivRef.current : hiddenDivRef.current;
    if (!targetDiv) return;
    if (videoId === currentVideoRef.current) return;
    currentVideoRef.current = videoId;
    setDismissed(false);
    if (playerRef.current) {
      playerRef.current.loadVideoById(videoId);
      return;
    }
    playerRef.current = new window.YT.Player(targetDiv, {
      height: "100%", width: "100%", videoId,
      playerVars: { autoplay: 1, controls: 1, modestbranding: 1, rel: 0 },
      events: { onReady: (e: any) => e.target.playVideo() },
    });
  }, [playerReady, videoId, expanded]);

  // Equalizer animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(Array.from({ length: 12 }, () => Math.floor(Math.random() * 90) + 10));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  if (!currentSong || !videoId || dismissed) return null;

  return (
    <>
      {/* Hidden player when collapsed */}
      <div className="hidden">
        <div ref={hiddenDivRef} />
      </div>

      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${expanded ? "h-80" : "h-20"}`}>
        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-foreground opacity-[0.97]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
        
        {/* Top border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

        {/* Collapsed bar */}
        <div className="relative z-10 flex items-center justify-between px-4 h-20 gap-3">
          
          {/* Left: icon + song info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-primary-foreground">
                <Radio className="w-5 h-5 text-primary-foreground animate-pulse" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Now Playing</span>
              </div>
              <p className="font-black text-sm uppercase text-white truncate tracking-tight leading-none">
                {currentSong.title}
              </p>
              <p className="text-xs text-gray-400 font-mono truncate mt-0.5">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Center: equalizer bars */}
          <div className="hidden sm:flex items-end gap-[2px] h-8 shrink-0">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-1 bg-primary transition-all duration-100 ease-in-out"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
            >
              {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded: YouTube player */}
        {expanded && (
          <div className="relative z-10 px-4 pb-4 h-56">
            <div className="w-full h-full border-2 border-gray-700 overflow-hidden">
              <div ref={playerDivRef} className="w-full h-full" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
