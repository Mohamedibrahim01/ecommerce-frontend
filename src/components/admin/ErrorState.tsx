"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div className="w-full bg-red-50/50 rounded-3xl border border-red-100 p-10 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 mb-4 shadow-sm">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-black text-red-950 tracking-tight mb-1">{title}</h3>
      <p className="text-xs font-medium text-red-700 max-w-md mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          loading={isRetrying}
          variant="outline"
          size="sm"
          className="rounded-xl border-red-200 text-red-700 hover:bg-red-100/80 font-bold gap-1.5"
        >
          {!isRetrying && <RefreshCw className="w-3.5 h-3.5" />} Try Again
        </Button>
      )}
    </div>
  );
}
