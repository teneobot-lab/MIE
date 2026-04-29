import { Link } from "wouter";
import { PageTransition } from "@/components/layout/PageTransition";

export default function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <h1 className="font-display font-black text-8xl md:text-9xl text-primary tracking-tighter mix-blend-difference z-10" style={{ textShadow: '4px 4px 0px hsl(var(--foreground))' }}>
          404
        </h1>
        <div className="zine-border bg-card p-8 max-w-md w-full relative -mt-8 z-0 transform rotate-1">
          <div className="tape" style={{ top: '-10px', left: '50%' }}></div>
          <h2 className="font-bold text-2xl uppercase mb-2">Halaman Hilang</h2>
          <p className="font-mono text-muted-foreground mb-6">
            Kaya lagu yang di-skip pas lagi enak-enaknya. Halaman ini gak ketemu.
          </p>
          <Link href="/" className="zine-border inline-block bg-primary text-primary-foreground font-bold uppercase px-6 py-3 hover:bg-foreground hover:text-background transition-colors">
            Balik ke Warung
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
