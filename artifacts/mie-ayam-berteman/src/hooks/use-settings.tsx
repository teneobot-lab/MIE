import { createContext, useContext, useEffect, useState } from "react";

export type AppSettings = {
  nama_usaha: string;
  alamat: string;
  jam_buka: string;
  instagram: string;
  tiktok: string;
  logo_url: string;
  tagline: string;
};

const DEFAULT: AppSettings = {
  nama_usaha: "Mie Ayam Berteman",
  alamat: "Jl. Contoh No. 1, Jakarta",
  jam_buka: "08:00 - 22:00",
  instagram: "@mieayamberteman",
  tiktok: "@mieayamberteman",
  logo_url: "",
  tagline: "Warung makan dengan playlist request langsung!",
};

const SettingsContext = createContext<AppSettings>(DEFAULT);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
