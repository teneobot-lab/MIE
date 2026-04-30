import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/hooks/use-player";
import { X, Music, ChevronUp, ChevronDown } from "lucide-react";

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void; }
}

export function PersistentPlayer() {
  const { currentSong, videoId } = usePlayer();
  const playerRef = useRef<any>(null);
  const playerDivRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
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
    if (playerRef.current) {
      playerRef.current.loadVideoById(videoId);
      return;
    }
    playerRef.current = new window.YT.Player(playerDivRef.current, {
      height: "100%", width: "100%", videoId,
      playerVars: { autoplay: 1, controls: 1, modestbranding: 1, rel: 0 },
      events: { onReady: (e: any) => e.target.playVideo() },
    });
  }, [playerReady, videoId]);

  if (!currentSong || !videoId || dismissed) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 border-foreground shadow-lg transition-all duration-300 ${expanded ? "h-72" : "h-16"}`}>
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Music className="w-5 h-5 text-primary animate-pulse shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-sm uppercase truncate">{currentSong.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setExpanded(!expanded)} className="p-1 hover:text-primary">
            {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
          <button onClick={() => setDismissed(true)} className="p-1 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className={`px-4 pb-4 ${expanded ? "h-52" : "h-0 overflow-hidden"}`}>
        <div ref={playerDivRef} className="w-full h-full" />
      </div>
      {!expanded && <div ref={playerDivRef} className="hidden" />}
    </div>
  );
}
