import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useGetNowPlaying } from "@workspace/api-client-react";

type Song = {
  id: number;
  title: string;
  artist: string;
  requesterHandle: string;
  message?: string | null;
};

type PlayerContextType = {
  currentSong: Song | null;
  queue: Song[];
  videoId: string | null;
  isVisible: boolean;
  setIsVisible: (v: boolean) => void;
};

const PlayerContext = createContext<PlayerContextType>({
  currentSong: null,
  queue: [],
  videoId: null,
  isVisible: false,
  setIsVisible: () => {},
});

async function searchYouTube(title: string, artist: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey) return null;
  const q = encodeURIComponent(`${title} ${artist} official`);
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=1&key=${apiKey}`
  );
  const data = await res.json();
  return data.items?.[0]?.id?.videoId ?? null;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { data, refetch } = useGetNowPlaying();
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const currentSongRef = useRef<string>("");

  useEffect(() => {
    const interval = setInterval(() => refetch(), 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    if (!data?.song) return;
    const key = `${data.song.title}||${data.song.artist}`;
    if (key === currentSongRef.current) return;
    currentSongRef.current = key;
    searchYouTube(data.song.title, data.song.artist).then(setVideoId);
  }, [data?.song]);

  return (
    <PlayerContext.Provider value={{
      currentSong: data?.song ?? null,
      queue: data?.queue ?? [],
      videoId,
      isVisible,
      setIsVisible,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
