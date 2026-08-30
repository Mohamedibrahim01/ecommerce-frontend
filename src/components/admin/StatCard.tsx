"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  colorScheme?: "emerald" | "blue" | "amber" | "purple" | "red";
  index?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorScheme = "emerald",
  index = 0,
}: StatCardProps) {
  const colorStyles = {
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    red: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{title}</span>
        <div className={cn("p-2.5 rounded-xl border flex items-center justify-center shrink-0", colorStyles[colorScheme])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="text-3xl font-black text-stone-900 tracking-tight">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-2 text-xs font-medium">
            {trend && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded font-bold",
                  trend.isPositive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                )}
              >
                {trend.value}
              </span>
            )}
            {description && <span className="text-stone-400">{description}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
