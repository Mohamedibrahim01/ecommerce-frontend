"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkRefresh = useAuthStore((state) => state.checkRefresh);
  const isLoading = useAuthStore((state) => state.isLoading);
  const accessToken = useAuthStore((state) => state.accessToken);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkRefresh();
  }, [checkRefresh]);

  useEffect(() => {
    const isRestoringSession = useAuthStore.getState().isAuthenticated && !accessToken;
    if (isLoading || isRestoringSession) return;
    
    if (accessToken) {
      fetchCart();
    } else {
      clearCart();
    }
  }, [accessToken, fetchCart, clearCart, isLoading]);

  useEffect(() => {
    if (isLoading || !accessToken) return;
    const syncCart = () => {
      fetchCart();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncCart();
      }
    };
    window.addEventListener("focus", syncCart);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", syncCart);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [accessToken, fetchCart]);

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F9F9]">
        <div className="text-lg font-semibold text-gray-600 animate-pulse">
          Loading...{" "}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
