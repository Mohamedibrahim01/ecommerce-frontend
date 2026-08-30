"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { FormDialog } from "./FormDialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  const icons = {
    destructive: <AlertTriangle className="w-6 h-6 text-red-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    default: <Info className="w-6 h-6 text-emerald-600" />,
  };

  const bgStyles = {
    destructive: "bg-red-50 border-red-100",
    warning: "bg-amber-50 border-amber-100",
    default: "bg-emerald-50 border-emerald-100",
  };

  const buttonVariants: Record<string, "destructive" | "primary" | "outline"> = {
    destructive: "destructive",
    warning: "primary",
    default: "primary",
  };

  return (
    <FormDialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border shrink-0 ${bgStyles[variant]}`}>
            {icons[variant]}
          </div>
          <div className="pt-1">
            <p className="text-sm text-stone-600 leading-relaxed font-medium">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl font-semibold h-10 px-5"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={buttonVariants[variant] || "primary"}
            onClick={onConfirm}
            loading={isLoading}
            className="rounded-xl font-bold h-10 px-5 shadow-sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
