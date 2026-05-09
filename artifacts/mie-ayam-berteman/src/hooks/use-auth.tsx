import React, { createContext, useContext, useState, useEffect } from "react";

type Admin = { id: number; username: string; role: string };
type AuthContextType = {
  admin: Admin | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  admin: null, token: null, login: async () => {}, logout: () => {}, isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("mab_admin_token");
    if (!t) { setIsLoading(false); return; }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(d => {
        if (d.admin) { setToken(t); setAdmin(d.admin); }
        else localStorage.removeItem("mab_admin_token");
      })
      .catch(() => localStorage.removeItem("mab_admin_token"))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Login gagal");
    localStorage.setItem("mab_admin_token", data.token);
    setToken(data.token);
    setAdmin(data.user);
  };

  const logout = () => {
    localStorage.removeItem("mab_admin_token");
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
