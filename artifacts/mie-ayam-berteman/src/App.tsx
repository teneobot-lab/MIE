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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function Router() {
  return (
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
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <PersistentPlayer />
    </div>
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
