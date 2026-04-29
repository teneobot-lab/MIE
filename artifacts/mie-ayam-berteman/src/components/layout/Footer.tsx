import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t-4 border-foreground bg-secondary text-secondary-foreground py-12 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/images/noise.png')", backgroundSize: "200px" }}></div>
      <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display font-black text-2xl uppercase mb-4 tracking-tighter">
            <span className="bg-primary text-primary-foreground px-2 py-1 transform -rotate-2 inline-block border-2 border-transparent">MIE AYAM</span> BERTEMAN
          </h3>
          <p className="font-mono text-sm mb-4 max-w-xs text-muted-foreground">
            Makan mie ayam, request lagu, cari teman. Buka sampai malam. 
          </p>
          <div className="flex gap-4">
            {/* Social links placeholders */}
            <div className="w-10 h-10 border-2 border-secondary-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer transform hover:-rotate-6">IG</div>
            <div className="w-10 h-10 border-2 border-secondary-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer transform hover:rotate-6">TT</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold uppercase tracking-widest mb-4 border-b-2 border-secondary-foreground inline-block pb-1">Link Cepat</h4>
          <ul className="space-y-2 font-mono text-sm">
            <li><Link href="/menu" className="hover:text-primary hover:underline underline-offset-4">Menu Lengkap</Link></li>
            <li><Link href="/leaderboard" className="hover:text-primary hover:underline underline-offset-4">Chart Lagu</Link></li>
            <li><Link href="/friends" className="hover:text-primary hover:underline underline-offset-4">Top Teman</Link></li>
            <li><Link href="/now-playing" className="hover:text-primary hover:underline underline-offset-4">Now Playing</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold uppercase tracking-widest mb-4 border-b-2 border-secondary-foreground inline-block pb-1">Lokasi</h4>
          <address className="not-italic font-mono text-sm space-y-2 text-muted-foreground">
            <p>Jl. Panglima Polim No. 99</p>
            <p>Jakarta Selatan</p>
            <p className="mt-4 font-bold text-primary">Buka: 18:00 - Habis</p>
          </address>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-4 border-t border-secondary-foreground/20 flex flex-col md:flex-row items-center justify-between font-mono text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Mie Ayam Berteman.</p>
        <p className="mt-2 md:mt-0">Dilarang pesan lagu galau kalau lagi rame.</p>
      </div>
    </footer>
  );
}
