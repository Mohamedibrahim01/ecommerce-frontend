import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "rounded-full px-2.5 py-0.5",
    "text-xs font-semibold tracking-tight",
    "border transition-colors duration-200",
    "select-none",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-stone-900 text-white border-transparent hover:bg-stone-800",

        emerald:
          "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",

        "emerald-solid":
          "bg-emerald-600 text-white border-transparent hover:bg-emerald-700",

        orange:
          "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",

        "orange-solid":
          "bg-orange-500 text-white border-transparent hover:bg-orange-600",

        stone:
          "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200",

        outline:
          "bg-transparent text-stone-700 border-stone-300 hover:bg-stone-50",

        success:
          "bg-green-50 text-green-700 border-green-200",

        warning:
          "bg-amber-50 text-amber-700 border-amber-200",

        danger:
          "bg-red-50 text-red-700 border-red-200",

        destructive:
          "bg-red-600 text-white border-transparent hover:bg-red-700",

        secondary:
          "bg-stone-100 text-stone-700 border-transparent hover:bg-stone-200",

        glass:
          "bg-white/70 backdrop-blur-sm text-stone-700 border-white/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
