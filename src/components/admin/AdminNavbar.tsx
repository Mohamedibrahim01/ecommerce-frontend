"use client";

import Link from "next/link";
import { Menu, Bell, Store, Shield } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

interface AdminNavbarProps {
  onOpenMobile: () => void;
}

export function AdminNavbar({ onOpenMobile }: AdminNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-stone-200 shadow-sm">
      {/* Left section: Mobile menu & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="p-2 -ml-2 text-stone-600 rounded-lg hover:bg-stone-100 lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="emerald-solid" className="gap-1 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
            <Shield className="w-3 h-3" /> Admin Portal
          </Badge>
        </div>
      </div>

      {/* Right section: Actions */}
      <div className="flex items-center gap-3">
        {/* Link back to customer store */}
        <Button asChild variant="outline" size="xs" className="gap-1.5 rounded-xl font-semibold text-stone-700">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">View Store</span>
          </Link>
        </Button>

        {/* Notifications placeholder */}


        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-black text-xs flex items-center justify-center shadow-sm">
            SH
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-stone-900 leading-tight">Admin User</p>
            <p className="text-[10px] font-medium text-stone-400">System Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
