"use client";

import Link from "next/link";
import { ShoppingCart, Eye, Bell, BellCheck, Star, Package } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useCartStore } from "@/src/components/store/cartStore";
import { useAuthStore } from "@/src/components/store/authStore";
import { toast } from "sonner";
import { api } from "../auth/axiosInstance";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatPrice, normalizeImageUrl } from "@/src/lib/utils";

interface ProductCardProduct {
  _id?: string | number;
  id?: string | number;
  name: string;
  price: number;
  discountPrice?: number;
  image?: string;
  category?: { _id: string; name: string; slug: string } | string;
  brandName?: string;
  rating?: number;
  countInStock?: number;
}

interface ProductCardProps {
  product: ProductCardProduct;
  isRecommended?: boolean;
  className?: string;
}

export const ProductCard = ({ product, isRecommended = false, className }: ProductCardProps) => {
  const addItem      = useCartStore((state) => state.addItem);
  const accessToken  = useAuthStore((state) => state.accessToken);
  const router       = useRouter();
  const [isNotified, setIsNotified] = useState(false);
  const [isAdding,   setIsAdding]   = useState(false);

  const hasDiscount =
    product.discountPrice != null &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  const activePrice = hasDiscount ? product.discountPrice! : product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const inStock = (product.countInStock ?? 0) > 0;
  const productId = String(product._id || product.id);

  const handleAddToCart = async () => {
    if (!accessToken) {
      toast.error("Please sign in to add products to your cart.", {
        action: {
          label: "Sign in",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    if (!inStock || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(productId, 1);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleNotify = async () => {
    try {
      await api.post(`/products/${productId}/notify-restock`);
      setIsNotified(true);
      toast.success("We'll notify you when it's back!");
    } catch {
      toast.error("Failed to set notification");
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col",
        "bg-white rounded-2xl border border-stone-200",
        "shadow-[0_1px_4px_rgba(0,0,0,0.05)]",
        "hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5",
        "transition-all duration-250 ease-out",
        "overflow-hidden",
        className
      )}
      aria-label={product.name}
    >
      {/* ── Image Area ───────────────────────────────────────── */}
      <div className="relative aspect-square bg-stone-50 overflow-hidden">
        {product.image ? (
          <img
            src={normalizeImageUrl(product.image)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-400 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-stone-200" aria-hidden="true" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {hasDiscount && (
            <Badge variant="orange-solid" className="text-[10px] font-bold shadow-sm">
              -{discountPct}%
            </Badge>
          )}
          {isRecommended && (
            <Badge variant="emerald-solid" className="text-[10px] font-bold shadow-sm">
              ✦ For You
            </Badge>
          )}
          {!inStock && (
            <Badge variant="stone" className="text-[10px] font-bold">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Hover quick-view overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-2",
            "bg-stone-900/0 group-hover:bg-stone-900/10",
            "transition-all duration-250",
            "pointer-events-none group-hover:pointer-events-auto"
          )}
        >
          <Link
            href={`/products/${productId}`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl",
              "bg-white text-stone-800 text-xs font-semibold shadow-md",
              "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
              "transition-all duration-200 delay-50",
              "hover:bg-stone-50"
            )}
            aria-label={`View details for ${product.name}`}
            tabIndex={0}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            View
          </Link>
        </div>
      </div>

      {/* ── Product Info ──────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Meta row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">
            {product.brandName || ""}
          </span>
          {product.category && (
            <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full truncate max-w-[80px]">
              {typeof product.category === 'string' ? product.category : product.category.name}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating !== undefined && (
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5" aria-label={`Rating: ${product.rating} out of 5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-3 w-3",
                    star <= Math.round(product.rating!)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-stone-200 text-stone-200"
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              {product.rating > 0 ? product.rating.toFixed(1) : "New"}
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-base font-black text-stone-900">
              {formatPrice(activePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through leading-none">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Action */}
          {inStock ? (
            <Button
              variant="primary"
              size="icon-sm"
              onClick={handleAddToCart}
              loading={isAdding}
              aria-label={`Add ${product.name} to cart`}
              className="rounded-xl flex-shrink-0"
            >
              {!isAdding && <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />}
            </Button>
          ) : (
            <Button
              variant={isNotified ? "outline-emerald" : "outline"}
              size="xs"
              onClick={handleNotify}
              disabled={isNotified}
              aria-label={isNotified ? "Notification set" : `Notify me when ${product.name} is back`}
              className="rounded-xl flex-shrink-0"
            >
              {isNotified ? (
                <><BellCheck className="h-3 w-3" aria-hidden="true" /> Notified</>
              ) : (
                <><Bell className="h-3 w-3" aria-hidden="true" /> Notify</>
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};
