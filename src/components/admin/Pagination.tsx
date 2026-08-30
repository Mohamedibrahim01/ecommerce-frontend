"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  onPageChange,
  hasMore,
  isLoading = false,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-stone-200 rounded-b-2xl">
      <span className="text-xs font-semibold text-stone-500">
        Page <span className="text-stone-900 font-bold">{currentPage}</span>
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || isLoading}
          className="rounded-lg gap-1 font-semibold"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </Button>

        <Button
          variant="outline"
          size="xs"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasMore || isLoading}
          className="rounded-lg gap-1 font-semibold"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
