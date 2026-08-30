"use client";

import { useEffect, useSyncExternalStore, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/src/components/store/authStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const router = useRouter();
  const pathname = usePathname();
  const unauthorizedNotifiedRef = useRef(false);

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isClient || isLoading) return;

    if (!accessToken) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (!isAdmin) {
      if (!unauthorizedNotifiedRef.current) {
        unauthorizedNotifiedRef.current = true;
        toast.error("Access Denied: Administrator privileges required.");
      }
      router.replace("/");
    }
  }, [isClient, isLoading, accessToken, isAdmin, router, pathname]);

  const hasAccess = Boolean(isClient && !isLoading && accessToken && isAdmin);

  // Prevent Admin UI flicker: never render admin layout/pages before authorization completes
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-stone-400 text-sm font-medium">Verifying authorization...</p>
      </div>
    );
  }

  return <>{children}</>;
}
