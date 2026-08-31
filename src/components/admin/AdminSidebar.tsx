"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/src/components/store/authStore";
import { setIntentionalLogout } from "@/src/components/auth/axiosInstance";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Users", href: "/admin/users", icon: Users },
];

export function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    setIntentionalLogout(true);
    try {
      await logout();
    } finally {
      setIntentionalLogout(false);
    }
    toast.success("Logged out from Admin area");
    router.push("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity animate-fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-stone-900 text-stone-300 border-r border-stone-800 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          // Mobile responsive placement
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-stone-800 shrink-0">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link
            href={"/admin/dashboard" as any}
            className="flex items-center gap-3 overflow-hidden group"
            onClick={onCloseMobile}
          >
            <div className="relative w-9 h-9 shrink-0 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-white text-base leading-none tracking-tight">
                  SH<span className="text-emerald-400">Admin</span>
                </span>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-0.5">
                  Dashboard
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              <Link
                key={item.href}
                href={item.href as any}
                onClick={onCloseMobile}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative",
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-semibold"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/80"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-white" : "text-stone-400 group-hover:text-emerald-400"
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
                {isCollapsed && isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-stone-800 shrink-0 space-y-2">
          {!isCollapsed && (
            <div className="px-3 py-2 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center gap-2.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold text-stone-200 truncate">Administrator</p>
                <p className="text-[10px] text-stone-500 truncate">Full access granted</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
