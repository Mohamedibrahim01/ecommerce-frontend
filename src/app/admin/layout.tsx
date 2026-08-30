"use client";

import React, { useState } from "react";
import { AdminGuard } from "@/src/components/admin/AdminGuard";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";
import { AdminNavbar } from "@/src/components/admin/AdminNavbar";
import { cn } from "@/src/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <AdminGuard>
      {/* Hide customer Navbar and Footer without modifying customer files */}
      <style jsx global>{`
        nav[aria-label="Main navigation"],
        footer[aria-label="Site footer"] {
          display: none !important;
        }
        main.flex-1 {
          min-height: auto !important;
          padding: 0 !important;
          margin: 0 !important;
          max-width: none !important;
        }
      `}</style>

      <div className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col font-sans">
        {/* Sidebar */}
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div
          className={cn(
            "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen",
            isCollapsed ? "lg:pl-20" : "lg:pl-64"
          )}
        >
          <AdminNavbar onOpenMobile={() => setIsMobileOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
