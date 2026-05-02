import { useState, useEffect } from "react";

type LyricsResult = {
  lyrics: string | null;
  source: string | null;
  loading: boolean;
  error: string | null;
};

type ArtistInfo = {
  bio: string | null;
  genres: string[];
  image: string | null;
  loading: boolean;
};

export function useLyrics(title: string | null, artist: string | null): LyricsResult {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!title || !artist) return;
    setLoading(true);
    setLyrics(null);
    setError(null);

    // Pakai lyrics.ovh API (gratis, no key)
    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);

    fetch(`https://lrclib.net/api/get?artist_name=${encodedArtist}&track_name=${encodedTitle}`)
      .then(r => r.json())
      .then(data => {
        if (data.plainLyrics) {
          setLyrics(data.plainLyrics);
          setSource("lrclib.net");
        } else {
          setError("Lirik tidak ditemukan");
        }
      })
      .catch(() => setError("Gagal memuat lirik"))
      .finally(() => setLoading(false));
  }, [title, artist]);

  return { lyrics, source, loading, error };
}

export function useArtistInfo(artist: string | null): ArtistInfo {
  const [bio, setBio] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!artist) return;
    setLoading(true);
    setBio(null);
    setGenres([]);
    setImage(null);

    // Wikipedia API untuk bio artis
    const encoded = encodeURIComponent(artist);
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`)
      .then(r => r.json())
      .then(data => {
        if (data.extract) {
          setBio(data.extract);
        }
        if (data.thumbnail?.source) {
          setImage(data.thumbnail.source);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [artist]);

  return { bio, genres, image, loading };
}
