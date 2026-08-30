"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  ShoppingBag,
  Search,
  ChevronDown,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/src/components/products/ProductCard";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  description: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  countInStock: number;
  rating: number;
  numReviews: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────
function SkeletonProductCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-8 w-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Content ──────────────────────────────────────────────────────────
function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") || searchParams.get("keyword") || searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const PAGE_SIZE = 12;

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategoryId, setSelectedCategoryId] = useState(urlCategory);

  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setIsClient(true); }, []);

  // Sync state with URL if user navigates back/forward
  useEffect(() => {
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
    if (urlCategory !== selectedCategoryId) setSelectedCategoryId(urlCategory);
  }, [urlSearch, urlCategory]);

  // Fetch Categories for Filter Dropdown
  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        setCategories(res.data?.data || res.data || []);
      })
      .catch(() => console.warn("Failed to load categories"));
  }, []);

  // ── Data fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isClient) return;

    async function fetchInitialData() {
      try {
        setIsLoading(true);
        setError("");
        
        const params: any = { pageNumber: 1, limit: PAGE_SIZE };
        if (searchQuery.trim()) params.keyword = searchQuery.trim();
        if (selectedCategoryId) params.category = selectedCategoryId;

        const res = await api.get("/products", { params });
        const data = res.data?.data || [];
        
        setProducts(data);
        setPageNumber(1);
        setTotalProducts(res.data?.totalProducts || data.length);
        
        // If there's pages property, we can use it, else check if data length < PAGE_SIZE
        const pages = res.data?.pages;
        if (pages !== undefined) {
          setHasMore(1 < pages);
        } else {
          setHasMore(data.length >= PAGE_SIZE);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load products catalog.");
      } finally {
        setIsLoading(false);
      }
    }
    
    // Use debounce to prevent multiple calls on typing
    const timeoutId = setTimeout(() => {
      fetchInitialData();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [isClient, searchQuery, selectedCategoryId]);

  const handleLoadMore = async () => {
    if (isMoreLoading || !hasMore) return;
    setIsMoreLoading(true);
    const nextPage = pageNumber + 1;
    try {
      const params: any = { pageNumber: nextPage, limit: PAGE_SIZE };
      if (searchQuery.trim()) params.keyword = searchQuery.trim();
      if (selectedCategoryId) params.category = selectedCategoryId;

      const response = await api.get("/products", { params });
      const data = response.data?.data || [];
      
      if (data.length === 0) {
        setHasMore(false);
        toast.info("You've reached the end of the catalog.");
      } else {
        setProducts((prev) => [...prev, ...data]);
        setPageNumber(nextPage);
        const pages = response.data?.pages;
        if (pages !== undefined) {
          setHasMore(nextPage < pages);
        } else {
          setHasMore(data.length >= PAGE_SIZE);
        }
      }
    } catch {
      toast.error("Failed to load more products.");
    } finally {
      setIsMoreLoading(false);
    }
  };

  const updateFilters = (keyword: string, categoryId: string) => {
    const params = new URLSearchParams();
    if (keyword) params.set("search", keyword);
    if (categoryId) params.set("category", categoryId);
    
    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : "/products", { scroll: false });
  };

  if (!isClient) return null;

  // ── Error state ───────────────────────────────────────────────────────────
  if (error && products.length === 0) {
    return (
      <div className="container-xl py-24 text-center" dir="ltr">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-red-400" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Something went wrong</h2>
        <p className="text-stone-500 text-sm mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} className="rounded-xl">Try Again</Button>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container-xl py-8 space-y-10" dir="ltr">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FULL CATALOG                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section aria-label="Full product catalog">
        {/* Catalog Header & Interactive Filter Bar */}
        <div className="space-y-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                {searchQuery ? `Search Results for "${searchQuery}"` : "All Supplements"}
              </h2>
              <p className="text-sm text-stone-500 mt-0.5">
                Showing <strong className="text-stone-800">{products.length}</strong> {totalProducts > 0 && <>of <strong className="text-stone-800">{totalProducts}</strong></>} products
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Keyword Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  type="search"
                  placeholder="Filter catalog..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateFilters(e.target.value, selectedCategoryId);
                  }}
                  className="pl-10 h-11 rounded-xl bg-white border border-stone-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    updateFilters(searchQuery, e.target.value);
                  }}
                  aria-label="Filter by category"
                  className="h-11 px-4 pr-10 bg-white border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>

              {/* Reset Filters */}
              {(searchQuery || selectedCategoryId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategoryId("");
                    router.push("/products", { scroll: false });
                  }}
                  className="h-11 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-bold transition-colors"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200 space-y-4" role="status" aria-live="polite">
            <div className="h-16 w-16 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="h-8 w-8 text-stone-300" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-700 mb-1">No matching products found</h3>
              <p className="text-sm text-stone-400">We couldn't find any items matching your search or filters.</p>
            </div>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryId("");
                router.push("/products", { scroll: false });
              }}
              variant="outline"
              className="rounded-xl font-bold px-6"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map((product) => (
                <ProductCard key={`catalog-${product._id}`} product={product as any} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-10">
                <Button
                  onClick={handleLoadMore}
                  loading={isMoreLoading}
                  variant="outline"
                  size="lg"
                  className="rounded-xl font-semibold px-8"
                  aria-label="Load more products"
                >
                  {!isMoreLoading && <><ChevronDown className="h-4 w-4" aria-hidden="true" /> Load More</>}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-xl py-8 space-y-10" dir="ltr">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-20 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={i} />)}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
