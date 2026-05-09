import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/hooks/use-player";
import { X, ChevronUp, ChevronDown, Radio, SkipBack, SkipForward, List, Play, Pause } from "lucide-react";

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void; }
}

export function PersistentPlayer() {
  const { currentSong, videoId, allSongs, currentIndex, playNext, playPrev, playAt } = usePlayer();
  const playerDivRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [bars, setBars] = useState<number[]>(Array.from({ length: 16 }, () => 20));
  const currentVideoRef = useRef<string>("");
  // Auto-expand saat lagu baru masuk
  const prevVideoId = useRef<string | null>(null);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPaused) {
      playerRef.current.playVideo();
      setIsPaused(false);
    } else {
      playerRef.current.pauseVideo();
      setIsPaused(true);
    }
  };

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
    if (!playerReady || !videoId || !playerDivRef.current) return;
    if (videoId === currentVideoRef.current) return;
    currentVideoRef.current = videoId;
    setDismissed(false);
    setIsPaused(false);
    setExpanded(true); // auto expand agar iframe visible
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(videoId);
    } else {
      playerRef.current = new window.YT.Player(playerDivRef.current, {
        height: "100%", width: "100%", videoId,
        playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: (e: any) => e.target.playVideo(),
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) playNext();
            if (e.data === window.YT.PlayerState.PAUSED) setIsPaused(true);
            if (e.data === window.YT.PlayerState.PLAYING) setIsPaused(false);
          }
        },
      });
    }
  }, [playerReady, videoId]);

  // Equalizer animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(Array.from({ length: 16 }, () => Math.floor(Math.random() * 90) + 10));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const totalHeight = expanded ? (showQueue ? "h-[480px]" : "h-80") : "h-[72px]";

  return (
    <>
      {currentSong && videoId && !dismissed && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-400 ease-in-out ${totalHeight}`}>
          {/* Background */}
          <div className="absolute inset-0 bg-zinc-900/98 backdrop-blur-md" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-primary" />

          {/* Main bar */}
          <div className="relative z-10 flex items-center px-3 md:px-4 h-[72px] gap-2 md:gap-3">
            {/* Radio icon */}
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 md:w-5 md:h-5 text-white animate-pulse" />
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary live-dot shrink-0" />
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest truncate">
                  {currentIndex + 1}/{allSongs.length} · Now Playing
                </span>
              </div>
              <p className="font-black text-sm uppercase text-white truncate leading-none">{currentSong.title}</p>
              <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">{currentSong.artist}</p>
            </div>

            {/* Equalizer - desktop only */}
            <div className="hidden md:flex items-end gap-[2px] h-7 shrink-0 w-20">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 bg-primary rounded-sm transition-all duration-75"
                  style={{ height: `${h}%`, opacity: 0.5 + (h / 100) * 0.5 }} />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button onClick={playPrev}
                className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10 active:scale-90">
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button onClick={togglePlay}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-primary text-white rounded-full hover:opacity-90 active:scale-90 transition-all mx-1">
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              </button>
              <button onClick={playNext}
                className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10 active:scale-90">
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
              <button onClick={() => { setShowQueue(!showQueue); setExpanded(true); }}
                className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center transition-colors rounded-full hover:bg-white/10 active:scale-90 ${showQueue ? "text-primary" : "text-zinc-400 hover:text-white"}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setExpanded(!expanded)}
                className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10 active:scale-90">
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              <button onClick={() => setDismissed(true)}
                className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/10 active:scale-90">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded content */}
          {expanded && (
            <div className="relative z-10 flex gap-3 px-3 md:px-4 pb-4" style={{ height: "calc(100% - 72px)" }}>
              {/* YouTube Player — satu ref, toggle display */}
              <div
                className="flex-1 border border-zinc-700 overflow-hidden rounded-sm"
                style={{ display: showQueue ? "none" : "block" }}
              >
                <div ref={playerDivRef} className="w-full h-full" />
              </div>

              {/* Queue panel */}
              {showQueue && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
                    Antrian Lagu ({allSongs.length})
                  </p>
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                    {allSongs.map((song, i) => (
                      <button key={song.id} onClick={() => { playAt(i); setShowQueue(false); setExpanded(true); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all duration-150 hover:bg-white/10 active:scale-[0.98] ${i === currentIndex ? "bg-primary/20 border border-primary/30" : ""}`}>
                        <span className={`text-xs font-mono w-5 shrink-0 text-center ${i === currentIndex ? "text-primary font-bold" : "text-zinc-500"}`}>
                          {i === currentIndex ? "▶" : i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate uppercase ${i === currentIndex ? "text-primary" : "text-white"}`}>
                            {song.title}
                          </p>
                          <p className="text-xs text-zinc-400 font-mono truncate">{song.artist}</p>
                        </div>
                        {i === currentIndex && (
                          <div className="flex items-end gap-[2px] h-4 shrink-0">
                            {bars.slice(0, 4).map((h, j) => (
                              <div key={j} className="w-1 bg-primary rounded-sm transition-all duration-75"
                                style={{ height: `${h}%` }} />
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
