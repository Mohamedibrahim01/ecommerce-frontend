import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full",
          "h-10 px-3.5 py-2",
          "text-sm text-stone-900 placeholder:text-stone-400",
          "bg-white",
          "border rounded-xl",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-stone-50",
          "read-only:bg-stone-50 read-only:cursor-default",
          error
            ? "border-red-400 focus-visible:ring-red-500/20 focus-visible:border-red-500"
            : "border-stone-200 hover:border-stone-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
