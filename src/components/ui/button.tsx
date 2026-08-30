import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold tracking-tight",
    "rounded-xl",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "select-none",
    "active:scale-[0.97]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /* ── Core ─────────────────────────────────────────── */
        default:
          "bg-stone-900 text-white shadow-sm hover:bg-stone-800 hover:shadow-md",

        primary:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md",

        accent:
          "bg-orange-500 text-white shadow-sm hover:bg-orange-600 hover:shadow-md",

        /* ── Outlined ─────────────────────────────────────── */
        outline:
          "border border-stone-200 bg-white text-stone-800 shadow-sm hover:bg-stone-50 hover:border-stone-300",

        "outline-emerald":
          "border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300",

        /* ── Ghost ────────────────────────────────────────── */
        ghost:
          "text-stone-700 hover:bg-stone-100 hover:text-stone-900",

        "ghost-emerald":
          "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",

        /* ── Destructive ──────────────────────────────────── */
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",

        /* ── Link ─────────────────────────────────────────── */
        link:
          "text-stone-800 underline-offset-4 hover:underline p-0 h-auto font-medium",

        "link-emerald":
          "text-emerald-600 underline-offset-4 hover:underline p-0 h-auto font-medium",

        /* ── Secondary ────────────────────────────────────── */
        secondary:
          "bg-stone-100 text-stone-800 hover:bg-stone-200",
      },
      size: {
        xs:      "h-7  px-3   text-xs gap-1 [&_svg]:size-3",
        sm:      "h-8  px-3.5 text-sm gap-1.5 [&_svg]:size-3.5",
        default: "h-10 px-4   text-sm gap-2 [&_svg]:size-4",
        lg:      "h-11 px-6   text-base gap-2 [&_svg]:size-4",
        xl:      "h-13 px-8   text-base gap-2.5 [&_svg]:size-5",
        icon:    "h-10 w-10   [&_svg]:size-4",
        "icon-sm":"h-8  w-8  [&_svg]:size-3.5",
        "icon-lg":"h-12 w-12 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin size-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
