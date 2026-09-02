"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Package,
  Star,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/src/components/store/cartStore";
import { useAuthStore } from "@/src/components/store/authStore";
import { toast } from "sonner";
import { cn, formatPrice, normalizeImageUrl } from "@/src/lib/utils";

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  user: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: { _id: string; name: string; slug?: string };
  countInStock: number;
  rating: number;
  numReviews: number;
  reviews?: Review[];
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function SkeletonDetail() {
  return (
    <div className="container-xl py-8 space-y-8" dir="ltr">
      <div className="skeleton h-4 w-32 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="skeleton rounded-3xl aspect-square" />
        <div className="space-y-5 py-4">
          <div className="skeleton h-4 w-1/2 rounded-lg" />
          <div className="skeleton h-10 w-3/4 rounded-lg" />
          <div className="skeleton h-8 w-1/3 rounded-lg" />
          <div className="skeleton h-24 w-full rounded-2xl" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function SingleProductPage() {
  const { id } = useParams();
  const [product,      setProduct]      = useState<Product | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isAdding,     setIsAdding]     = useState(false);
  const [quantity,     setQuantity]     = useState(1);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const addItem     = useCartStore((state) => state.addItem);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isGuest     = useAuthStore((state) => state.isGuest);
  const router      = useRouter();

  // ── Cart handler ──────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!accessToken && !isGuest) {
      toast.error("Please sign in to add products to your cart.", {
        action: {
          label: "Sign in",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    if (!product || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(product._id, quantity);
      toast.success("Added to Cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  // ── Review Handler ────────────────────────────────────────────────────────
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("Please sign in to leave a review.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      // Reload product to show new review
      const response = await api.get(`/products/${id}`);
      setProduct(response.data?.data || response.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.Message || "Failed to submit review.";
      toast.error(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data?.data || response.data);
      } catch {
        console.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (isLoading) return <SkeletonDetail />;

  if (!product) {
    return (
      <div className="container-xl py-24 text-center" dir="ltr">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-red-300" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">Product not found</h1>
        <p className="text-stone-500 text-sm mb-6">This product may have been removed or is unavailable.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/products"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Products</Link>
        </Button>
      </div>
    );
  }

  const inStock = product.countInStock > 0;

  return (
    <div className="min-h-screen bg-stone-50" dir="ltr">
      <div className="container-xl py-8 space-y-12">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-emerald-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Products
          </Link>
        </nav>

        {/* ── Product Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

          {/* Left — Image Panel */}
          <div className="space-y-4">
            <div className="relative bg-white border border-stone-200 rounded-3xl overflow-hidden aspect-square flex items-center justify-center shadow-sm">
              {product.image ? (
                <img
                  src={normalizeImageUrl(product.image)}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain p-8 mix-blend-multiply"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="flex-col items-center gap-2 text-stone-300"
                style={{ display: product.image ? "none" : "flex" }}
              >
                <Package className="h-16 w-16" aria-hidden="true" />
                <span className="text-sm">No image</span>
              </div>
            </div>
          </div>

          {/* Right — Info Panel */}
          <div className="flex flex-col justify-start space-y-6 py-2">
            {/* Category */}
            {product.category && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="stone" className="font-semibold">
                  {product.category.name}
                </Badge>
              </div>
            )}

            {/* Name + Price */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-black text-stone-900">
                  {formatPrice(product.price)}
                </span>
              </div>
              
              {/* Rating Snippet */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= Math.round(product.rating || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-stone-200 text-stone-200"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-stone-600">
                  {product.rating > 0 ? product.rating.toFixed(1) : "New"}
                </span>
                <span className="text-sm text-stone-400">
                  ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            {/* Stock status */}
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold w-fit",
                inStock
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}
              role="status"
            >
              {inStock ? (
                <><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> In Stock ({product.countInStock} available)</>
              ) : (
                <><XCircle className="h-4 w-4" aria-hidden="true" /> Out of Stock</>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-stone-600 leading-relaxed py-4 border-y border-stone-100">
                {product.description}
              </p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-stone-100">
              {inStock && (
                <div className="flex items-center border border-stone-200 rounded-xl bg-white p-1 w-fit">
                  <button
                    type="button"
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:bg-stone-50 hover:text-stone-900 rounded-lg transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-stone-900">{quantity}</span>
                  <button
                    type="button"
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:bg-stone-50 hover:text-stone-900 rounded-lg transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                    disabled={quantity >= product.countInStock}
                  >
                    +
                  </button>
                </div>
              )}

              <Button
                size="xl"
                variant={inStock ? "primary" : "secondary"}
                className="flex-1 sm:flex-none sm:w-48 rounded-xl font-bold shadow-sm"
                onClick={handleAddToCart}
                loading={isAdding}
                disabled={!inStock}
                aria-label={inStock ? `Add ${product.name} to cart` : "Out of stock"}
              >
                {!isAdding && <ShoppingCart className="h-5 w-5 mr-2" aria-hidden="true" />}
                {inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Reviews Section ───────────────────────────────────────────── */}
        <section className="pt-12 border-t border-stone-200" aria-label="Customer Reviews">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">Customer Reviews</h2>
              <p className="text-sm text-stone-500">See what others are saying about this product</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {!product.reviews || product.reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-200">
                  <MessageCircle className="h-8 w-8 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 font-medium">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                product.reviews.map((review) => (
                  <div key={review._id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500 text-sm">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-stone-900">{review.name}</span>
                      </div>
                      <span className="text-xs text-stone-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-3.5 w-3.5",
                            star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-stone-700 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm h-fit sticky top-28">
              <h3 className="text-lg font-black text-stone-900 mb-6">Write a Review</h3>
              
              {accessToken ? (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none focus:scale-110 transition-transform"
                        >
                          <Star
                            className={cn(
                              "h-6 w-6 transition-colors",
                              star <= rating ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-300 hover:text-amber-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Your Comment
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      rows={4}
                      placeholder="What did you like or dislike?"
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full rounded-xl font-bold h-12"
                    loading={isSubmittingReview}
                  >
                    Submit Review
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-stone-500 text-sm mb-4">Please sign in to share your experience with this product.</p>
                  <Button asChild variant="outline" className="rounded-xl w-full">
                    <Link href="/login">Sign In to Review</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
