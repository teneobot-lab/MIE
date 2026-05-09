import { createContext, useContext, useState, useRef, useEffect } from "react";
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
  currentIndex: number;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  playNext: () => void;
  playPrev: () => void;
  playAt: (index: number) => void;
  allSongs: Song[];
};

const PlayerContext = createContext<PlayerContextType>({
  currentSong: null,
  queue: [],
  videoId: null,
  currentIndex: 0,
  isPlaying: false,
  setIsPlaying: () => {},
  playNext: () => {},
  playPrev: () => {},
  playAt: () => {},
  allSongs: [],
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentKeyRef = useRef<string>("");

  // Gabungkan nowplaying + queue jadi satu list
  const allSongs: Song[] = data
    ? [
        ...(data.song ? [data.song] : []),
        ...(data.queue ?? []),
      ]
    : [];

  const currentSong = allSongs[currentIndex] ?? null;

  useEffect(() => {
    const interval = setInterval(() => refetch(), 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    if (!currentSong) return;
    const key = `${currentSong.title}||${currentSong.artist}`;
    if (key === currentKeyRef.current) return;
    currentKeyRef.current = key;
    searchYouTube(currentSong.title, currentSong.artist).then(vid => {
      console.log("[DEBUG] vid:", vid, "song:", currentSong.title);
      console.log("[PLAYER] videoId dari YouTube:", vid, "song:", currentSong.title);
      const startMusic = () => {
        setVideoId(vid);
        setIsPlaying(true);
      };
      const openers = [
        `Oi oi! Selanjutnya kita putar`,
        `Yo! Request masuk nih,`,
        `Gaskeun! Berikutnya ada`,
        `Hei hei! Siap-siap dengerin`,
      ];
      const closers = [
        `request dari ${currentSong.requesterHandle}! Let's go!`,
        `dipesen sama ${currentSong.requesterHandle}! Cus!`,
        `buat ${currentSong.requesterHandle}! Gaspol!`,
        `dari ${currentSong.requesterHandle}! Hayuk!`,
      ];
      const text = `${openers[Math.floor(Math.random() * openers.length)]} ${currentSong.title} dari ${currentSong.artist}, ${closers[Math.floor(Math.random() * closers.length)]}`;
      const rv = (window as any).responsiveVoice;
      if (rv && rv.voiceSupport()) {
        let done = false;
        const safeStart = () => { if (!done) { done = true; startMusic(); } };
        const voices = ["Indonesian Female", "Indonesian Male", "id-ID"];
        const useVoice = voices.find(v => rv.hasVoice(v)) || "Indonesian Female";
        rv.speak(text, useVoice, { rate: 1.1, pitch: 1, volume: 1, onend: safeStart, onerror: safeStart });
        setTimeout(safeStart, 8000); // fallback 8 detik
      } else {
        startMusic();
      }
    });
  }, [currentSong?.title, currentSong?.artist]);

  const playNext = () => {
    if (allSongs.length === 0) return;
    setCurrentIndex(i => (i + 1) % allSongs.length);
  };

  const playPrev = () => {
    if (allSongs.length === 0) return;
    setCurrentIndex(i => (i - 1 + allSongs.length) % allSongs.length);
  };

  const playAt = (index: number) => {
    if (index < 0 || index >= allSongs.length) return;
    setCurrentIndex(index);
    currentKeyRef.current = ""; // force refresh
  };

  return (
    <PlayerContext.Provider value={{
      currentSong,
      queue: data?.queue ?? [],
      videoId,
      currentIndex,
      isPlaying,
      setIsPlaying,
      playNext,
      playPrev,
      playAt,
      allSongs,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
