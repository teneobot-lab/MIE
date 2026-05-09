import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PersistentPlayer } from "@/components/layout/PersistentPlayer";
import { PlayerProvider } from "@/hooks/use-player";
import Home from "@/pages/home";
import Menu from "@/pages/menu";
import MenuDetail from "@/pages/menu-detail";
import Order from "@/pages/order";
import Leaderboard from "@/pages/leaderboard";
import NowPlaying from "@/pages/now-playing";
import Friends from "@/pages/friends";
import NotFound from "@/pages/not-found";
import AdminMenu from "@/pages/admin-menu";
import Kasir from "@/pages/kasir";
import Laporan from "@/pages/laporan";
import Stok from "@/pages/stok";
import AdminVoucher from "@/pages/admin-voucher";
import Dashboard from "@/pages/dashboard";
import AdminSettings from "@/pages/admin-settings";
import { SettingsProvider } from "@/hooks/use-settings";
import HistoryPage from "@/pages/history";
import QrMeja from "@/pages/qr-meja";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function AutoplayUnlock() {
  const [unlocked, setUnlocked] = React.useState(() => {
    return sessionStorage.getItem("autoplay_unlocked") === "1";
  });
  if (unlocked) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="text-center p-8 border-4 border-primary max-w-sm w-full mx-4">
        <div className="text-6xl mb-4">🎸</div>
        <h1 className="font-black text-3xl uppercase text-white mb-2">Mie Ayam Berteman</h1>
        <p className="font-mono text-zinc-400 mb-6 text-sm">Warung makan dengan playlist request langsung!</p>
        <button
          onClick={() => {
            sessionStorage.setItem("autoplay_unlocked", "1");
            setUnlocked(true);
          }}
          className="w-full bg-primary text-primary-foreground font-black uppercase text-lg py-4 px-8 hover:opacity-90 active:scale-95 transition-all"
        >
          🍜 Masuk ke Warung
        </button>
      </div>
    </div>
  );
}

function Router() {
  return (
    <>
      <AutoplayUnlock />
      <div className="min-h-[100dvh] flex flex-col selection:bg-primary selection:text-primary-foreground pb-16">
        <Navbar />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/menu" component={Menu} />
            <Route path="/menu/:id" component={MenuDetail} />
            <Route path="/order" component={Order} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/now-playing" component={NowPlaying} />
            <Route path="/friends" component={Friends} />
            <Route path="/admin/menu" component={AdminMenu} />
            <Route path="/kasir" component={Kasir} />
            <Route path="/kasir/laporan" component={Laporan} />
            <Route path="/kasir/stok" component={Stok} />
            <Route path="/admin/voucher" component={AdminVoucher} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/admin/settings" component={AdminSettings} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/qr-meja" component={QrMeja} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
        <PersistentPlayer />
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <PlayerProvider>
            <Router />
          </PlayerProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
