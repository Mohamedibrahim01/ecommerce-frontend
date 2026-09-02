"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/src/components/admin/PageHeader";

const adminModules = [
  {
    title: "Orders",
    description: "Manage customer orders, track shipments, and process fulfillments.",
    href: "/admin/orders",
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-600",
    hoverColor: "group-hover:bg-blue-100",
  },
  {
    title: "Products",
    description: "Add new inventory, update stock levels, and manage pricing.",
    href: "/admin/products",
    icon: Package,
    color: "bg-emerald-50 text-emerald-600",
    hoverColor: "group-hover:bg-emerald-100",
  },
  {
    title: "Categories",
    description: "Organize products into collections and manage taxonomy.",
    href: "/admin/categories",
    icon: Layers,
    color: "bg-amber-50 text-amber-600",
    hoverColor: "group-hover:bg-amber-100",
  },
  {
    title: "Users",
    description: "View customer profiles and manage administrator access.",
    href: "/admin/users",
    icon: Users,
    color: "bg-purple-50 text-purple-600",
    hoverColor: "group-hover:bg-purple-100",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Welcome to your command center. Select a module below to manage your store."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {adminModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.title}
              href={module.href}
              className="group flex flex-col justify-between bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${module.color} ${module.hoverColor} transition-colors mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-stone-900 mb-2">
                  {module.title}
                </h3>
                <p className="text-sm font-medium text-stone-500 leading-relaxed">
                  {module.description}
                </p>
              </div>
              <div className="mt-8 flex items-center text-emerald-600 font-bold text-sm">
                Manage {module.title}
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
