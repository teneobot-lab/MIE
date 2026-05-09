import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ChefHat, Lock, User } from "lucide-react";

export default function Setup() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSetup = async () => {
    if (!username || password.length < 6) {
      setError("Username wajib diisi, password minimal 6 karakter");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDone(true);
      setTimeout(() => setLocation("/login"), 2000);
    } catch (e: any) {
      setError(e.message ?? "Setup gagal");
    }
    setLoading(false);
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="font-display font-black text-3xl uppercase">Setup Berhasil!</h2>
        <p className="font-mono text-muted-foreground mt-2">Redirecting ke login...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-4 zine-border">
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display font-black text-3xl uppercase tracking-tighter">Setup Awal</h1>
          <p className="font-mono text-sm text-muted-foreground mt-1">Buat akun owner pertama</p>
        </div>
        <div className="zine-border bg-card p-6 space-y-4">
          {error && <div className="bg-destructive/10 border-2 border-destructive text-destructive px-3 py-2 font-mono text-sm">{error}</div>}
          <div>
            <label className="block font-bold uppercase text-xs tracking-widest mb-1.5">Username Owner</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="owner" className="w-full border-2 border-foreground bg-background pl-9 pr-3 py-2.5 font-mono text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block font-bold uppercase text-xs tracking-widest mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSetup()}
                placeholder="min. 6 karakter" className="w-full border-2 border-foreground bg-background pl-9 pr-3 py-2.5 font-mono text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <button onClick={handleSetup} disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all zine-border disabled:opacity-50">
            {loading ? "Menyiapkan..." : "Mulai Setup"}
          </button>
        </div>
      </div>
    </div>
  );
}
