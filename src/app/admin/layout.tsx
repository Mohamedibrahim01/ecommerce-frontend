"use client";

import React from "react";
import { AdminGuard } from "@/src/components/admin/AdminGuard";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Users", href: "/admin/users", icon: Users },
];

function AdminTabs() {
  const pathname = usePathname();
  
  return (
    <div className="bg-white border-b border-stone-200 mb-6 sticky top-20 z-30">
      <div className="container-xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Admin Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors",
                  isActive
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-emerald-500" : "text-stone-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-full bg-stone-50 text-stone-900 flex flex-col font-sans">
        <AdminTabs />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
