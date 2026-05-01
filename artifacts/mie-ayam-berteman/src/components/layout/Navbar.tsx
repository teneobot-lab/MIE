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
    <header className="sticky top-0 z-50 w-full border-b-4 border-foreground bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display font-black text-2xl tracking-tighter uppercase transform -rotate-2 hover:rotate-0 transition-all duration-200 select-none">
          <span className="bg-primary text-primary-foreground px-2 py-1 border-2 border-foreground">MIE AYAM</span>
          <span className="ml-1 text-foreground">BERTEMAN</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "relative font-bold uppercase tracking-widest text-sm flex items-center gap-2 px-3 py-2 transition-all duration-200 hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                <item.icon className="w-4 h-4" />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Cart Button */}
        <Link href="/order"
          className="relative zine-border bg-accent text-accent-foreground px-4 py-2 font-bold uppercase tracking-wider text-sm flex items-center gap-2 group hover:bg-primary hover:text-primary-foreground transition-all duration-200 active:scale-95">
          <ShoppingCart className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-200" />
          <span className="hidden sm:inline">Cart</span>
          {itemCount > 0 && (
            <span className="cart-badge absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-foreground">
              {itemCount}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden border-t-2 border-foreground bg-background flex justify-around py-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-[10px] uppercase font-bold transition-all duration-200 min-w-[56px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
              <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
              {item.label}
              {isActive && <span className="w-1 h-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
