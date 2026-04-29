import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu as MenuIcon, Music, Users, Home } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();
  const itemCount = useCart((state) => state.getItemCount());

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/menu", label: "Menu", icon: MenuIcon },
    { href: "/leaderboard", label: "Chart", icon: Music },
    { href: "/friends", label: "Teman", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-foreground bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl tracking-tighter uppercase transform -rotate-2 hover:rotate-0 transition-transform">
          <span className="bg-primary text-primary-foreground px-2 py-1 border-2 border-foreground">MIE AYAM</span>
          <span className="ml-1 text-foreground mix-blend-difference">BERTEMAN</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-bold uppercase tracking-widest text-sm flex items-center gap-2 hover:text-primary transition-colors",
                location === item.href ? "text-primary decoration-primary underline decoration-2 underline-offset-4" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/order" className="relative zine-border bg-accent text-accent-foreground px-4 py-2 font-bold uppercase tracking-wider text-sm flex items-center gap-2 group">
            <ShoppingCart className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-foreground transform rotate-12">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden border-t-2 border-foreground bg-background flex justify-around p-2">
         {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "p-2 flex flex-col items-center justify-center gap-1 text-[10px] uppercase font-bold",
                location === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
      </div>
    </header>
  );
}
