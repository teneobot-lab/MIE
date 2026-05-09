import React from "react";

type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="zine-border bg-card p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="font-display font-black text-3xl uppercase mb-2 text-destructive">Ada yang Rusak</h2>
            <p className="font-mono text-sm text-muted-foreground mb-6">
              {this.state.error?.message ?? "Terjadi error yang tidak terduga."}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="bg-primary text-primary-foreground px-6 py-3 font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all zine-border">
              🔄 Refresh Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
