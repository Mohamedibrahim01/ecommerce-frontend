import React from "react";
import { cn } from "@/src/lib/utils";

interface LoadingSkeletonProps {
  type?: "table" | "cards" | "form" | "text";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ type = "table", count = 4, className }: LoadingSkeletonProps) {
  if (type === "cards") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 animate-pulse shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 bg-stone-100 rounded w-1/3" />
              <div className="h-8 w-8 bg-stone-100 rounded-xl" />
            </div>
            <div className="h-8 bg-stone-200 rounded w-1/2" />
            <div className="h-3 bg-stone-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className={cn("space-y-6 bg-white p-6 rounded-3xl border border-stone-200 animate-pulse", className)}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-4 bg-stone-200 rounded w-1/4" />
            <div className="h-10 bg-stone-100 rounded-xl w-full" />
          </div>
        ))}
        <div className="h-11 bg-stone-200 rounded-xl w-1/3 mt-4" />
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className={cn("space-y-3 animate-pulse", className)}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="h-4 bg-stone-100 rounded w-full" />
        ))}
      </div>
    );
  }

  // Default table skeleton
  return (
    <div className={cn("bg-white rounded-2xl border border-stone-200 p-6 space-y-4 animate-pulse shadow-sm", className)}>
      <div className="flex justify-between items-center pb-4 border-b border-stone-100">
        <div className="h-6 bg-stone-200 rounded w-48" />
        <div className="h-9 bg-stone-100 rounded-xl w-32" />
      </div>
      <div className="space-y-3 pt-2">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="h-12 bg-stone-50 rounded-xl w-full flex items-center px-4 gap-4">
            <div className="h-4 bg-stone-200 rounded w-1/4" />
            <div className="h-4 bg-stone-100 rounded w-1/3" />
            <div className="h-4 bg-stone-200 rounded w-1/5 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
