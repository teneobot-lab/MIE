import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Lock, User, ChefHat } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError("Username dan password wajib diisi"); return; }
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      setLocation("/kasir");
    } catch (e: any) {
      setError(e.message ?? "Login gagal");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-4 zine-border">
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display font-black text-3xl uppercase tracking-tighter">Admin Login</h1>
          <p className="font-mono text-sm text-muted-foreground mt-1">Mie Ayam Berteman</p>
        </div>

        <div className="zine-border bg-card p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 border-2 border-destructive text-destructive px-3 py-2 font-mono text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold uppercase text-xs tracking-widest mb-1.5">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="username"
                className="w-full border-2 border-foreground bg-background pl-9 pr-3 py-2.5 font-mono text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase text-xs tracking-widest mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full border-2 border-foreground bg-background pl-9 pr-3 py-2.5 font-mono text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all zine-border disabled:opacity-50">
            {loading ? "Loading..." : "Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}
