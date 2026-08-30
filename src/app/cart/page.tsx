"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/src/components/store/cartStore";
import { useAuthStore } from "@/src/components/store/authStore";
import Link from "next/link";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";

// ─── Skeleton ──────────────────────────────────────────────────────────────
function SkeletonCartItem() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-200">
      <div className="skeleton h-16 w-16 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/4 rounded" />
      </div>
      <div className="skeleton h-8 w-24 rounded-xl" />
      <div className="skeleton h-5 w-14 rounded" />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  const { items, totalPrice, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) { 
      router.replace("/login?redirect=/cart"); 
      return; 
    }
    fetchCart();
  }, [accessToken, fetchCart, router]);

  const handleRemoveItem = async (productId: string) => {
    if (!productId) return;
    try {
      await removeItem(productId);
      toast.success("Item removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number, maxStock: number) => {
    if (!productId || newQuantity < 1) return;
    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items left in stock.`);
      return;
    }
    
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  if (!isClient) return null;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading && items.length === 0) {
    return (
      <div className="container-xl py-10" dir="ltr">
        <div className="skeleton h-8 w-40 rounded-lg mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[0, 1, 2].map((i) => <SkeletonCartItem key={i} />)}
          </div>
          <div className="skeleton h-56 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="container-xl py-24 flex flex-col items-center justify-center text-center" dir="ltr">
        <div className="h-20 w-20 rounded-3xl bg-stone-100 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-stone-300" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 mb-2">Your cart is empty</h1>
        <p className="text-stone-500 text-sm mb-8 max-w-xs">
          Looks like you haven't added anything yet. Browse our catalog and find something you love.
        </p>
        <Button asChild variant="primary" size="lg" className="rounded-xl font-bold">
          <Link href="/products">
            Browse Products <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  // ── Filled cart ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50" dir="ltr">
      <div className="container-xl py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Shopping Cart</h1>
          <p className="text-stone-500 text-sm mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* ── Cart Items ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.product._id}
                className={`flex items-center gap-4 p-4 bg-white border rounded-2xl transition-colors ${
                  isLoading ? "opacity-50 pointer-events-none" : ""
                } border-stone-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] group hover:border-stone-300`}
                role="listitem"
              >
                {/* Product image */}
                <Link href={`/products/${item.product._id}`} className="flex-shrink-0" aria-label={`View ${item.product.name}`}>
                  <div className="h-16 w-16 rounded-xl bg-stone-50 border border-stone-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={normalizeImageUrl(item.product.image)}
                      alt={item.product.name}
                      className="h-full w-full object-contain p-1 mix-blend-multiply"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                  </div>
                </Link>

                {/* Name + Price */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 text-sm truncate">{item.product.name}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{formatPrice(item.price)} each</p>
                </div>

                {/* Quantity stepper */}
                <div className="flex items-center bg-stone-100 rounded-xl p-0.5 gap-0" role="group" aria-label={`Quantity for ${item.product.name}`}>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isLoading || item.quantity <= 1}
                    className="h-8 w-8 rounded-xl hover:bg-stone-200 text-stone-600 disabled:opacity-30"
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1, item.product.countInStock)}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <span
                    className="w-8 text-center text-sm font-bold text-stone-900 select-none"
                    aria-live="polite"
                    aria-label={`Quantity: ${item.quantity}`}
                  >
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isLoading || item.quantity >= item.product.countInStock}
                    className="h-8 w-8 rounded-xl hover:bg-stone-200 text-stone-600 disabled:opacity-30"
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1, item.product.countInStock)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>

                {/* Line total */}
                <div className="text-right w-20 flex-shrink-0">
                  <p className="font-black text-stone-900 text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                {/* Remove */}
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={isLoading}
                  className="flex-shrink-0 rounded-xl text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                  onClick={() => handleRemoveItem(item.product._id)}
                  aria-label={`Remove ${item.product.name} from cart`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>

          {/* ── Order Summary ──────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100">
                <h2 className="font-bold text-stone-900 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Order Summary
                </h2>
              </div>

              <div className="p-5 space-y-3">
                {/* Item subtotals */}
                {items.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-center text-sm">
                    <span className="text-stone-500 truncate max-w-[60%]">
                      {item.product.name}
                      <span className="text-stone-400 ml-1">×{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-stone-800 flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                {/* Divider */}
                <div className="border-t border-stone-100 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-stone-900 text-base">Grand Total</span>
                    <span className="font-black text-stone-900 text-xl">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className="w-full rounded-xl font-bold"
                  aria-label="Proceed to checkout"
                >
                  <Link href="/orders/checkout">
                    Checkout <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-stone-500 rounded-xl"
                >
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
