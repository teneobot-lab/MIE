import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Disc3 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !admin) setLocation("/login");
  }, [admin, isLoading]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Disc3 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (!admin) return null;
  return <>{children}</>;
}
