"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Leaf,
  FlaskConical,
  Package,
  Dumbbell,
  Pill,
  Heart,
  Droplet,
  Flame,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useState, useEffect } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { ProductCard } from "@/src/components/products/ProductCard";
import { cn, getCategoryImageUrl } from "@/src/lib/utils";
import { useCartStore } from "@/src/components/store/cartStore";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";

const getCategoryIcon = (categoryName: string) => {
  const nameLower = (categoryName || "").toLowerCase();
  if (nameLower.includes("protein") || nameLower.includes("whey") || nameLower.includes("mass")) {
    return Dumbbell;
  }
  if (nameLower.includes("creatine") || nameLower.includes("strength") || nameLower.includes("workout")) {
    return FlaskConical;
  }
  if (nameLower.includes("vitamin") || nameLower.includes("health") || nameLower.includes("wellness") || nameLower.includes("omega")) {
    return Heart;
  }
  if (nameLower.includes("hydrat") || nameLower.includes("electrolyte")) {
    return Droplet;
  }
  if (nameLower.includes("pill") || nameLower.includes("capsule") || nameLower.includes("supplement")) {
    return Pill;
  }
  if (nameLower.includes("fat") || nameLower.includes("loss") || nameLower.includes("burn") || nameLower.includes("shred")) {
    return Flame;
  }
  return Package;
};

// ─── Interfaces (unchanged) ────────────────────────────────────────────────


interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

// ─── Skeleton Components ───────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-9 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

function SkeletonCategory({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={cn(
        "skeleton rounded-3xl",
        wide ? "md:col-span-2 min-h-[280px]" : "min-h-[200px]"
      )}
    />
  );
}

// ─── Page Component ────────────────────────────────────────────────────────
export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Data fetching ──────────────────────────────────────
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories and products (max 8)
        const [categoriesResult, productsResult] = await Promise.allSettled([
          api.get("/categories"),
          api.get("/products?limit=8"),
        ]);

        if (categoriesResult.status === "fulfilled") {
          const data = categoriesResult.value.data?.data || categoriesResult.value.data;
          if (Array.isArray(data)) {
            setCategories(data.slice(0, 7));
          }
        } else {
          console.warn("No categories found.");
        }

        if (productsResult.status === "fulfilled") {
          const data = productsResult.value.data?.data || productsResult.value.data;
          if (Array.isArray(data)) {
            setFeaturedProducts(data.slice(0, 8));
          }
        } else {
          console.warn("No products found.");
        }
      } catch (err) {
        console.error("Home data fetch error:", err);
        toast.error("Failed to load some home page data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short" });

  const addItem = useCartStore((state) => state.addItem);
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();



  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        {/* Hero skeleton */}
        <div className="container-xl pt-8 pb-6">
          <div className="skeleton rounded-3xl min-h-[460px] md:min-h-[520px]" />
        </div>
        {/* Trust bar skeleton */}
        <div className="container-xl pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        </div>
        {/* Categories skeleton */}
        <div className="container-xl py-8">
          <div className="skeleton h-8 w-48 rounded-lg mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCategory wide />
            <SkeletonCategory />
            <SkeletonCategory />
          </div>
        </div>
        {/* Products skeleton */}
        <div className="container-xl py-8">
          <div className="skeleton h-8 w-48 rounded-lg mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" dir="ltr">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO                                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="container-xl pt-6 pb-4" aria-label="Hero">
        <div className="relative rounded-3xl overflow-hidden min-h-[460px] md:min-h-[520px] flex items-end">

          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1400&q=80')`,
            }}
            aria-hidden="true"
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, rgba(6,78,59,0.92) 0%, rgba(6,78,59,0.70) 45%, rgba(28,25,23,0.20) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Floating geometric accent */}
          <div
            className="absolute right-8 top-8 h-48 w-48 rounded-full border border-white/10 opacity-30 hidden md:block animate-float"
            aria-hidden="true"
          />
          <div
            className="absolute right-16 top-16 h-24 w-24 rounded-full border border-white/15 opacity-40 hidden md:block animate-float delay-300"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 p-8 md:p-14 max-w-2xl animate-fade-up">
            <Badge
              variant="outline"
              className="mb-5 flex w-fit items-center gap-1.5 rounded-full border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200 backdrop-blur-md transition-colors hover:bg-white/10"
            >
              <Leaf className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>Science-Backed Nutrition</span>
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-4">
              Fuel Your Best
              <br />
              <span className="text-emerald-300">Performance.</span>
            </h1>

            <p className="text-stone-300 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              Clinically formulated supplements for every goal. Precision nutrition trusted by athletes worldwide.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="primary" size="lg" className="rounded-xl font-bold shadow-lg">
                <Link href="/products">
                  Shop Now <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-xl text-white hover:bg-white/15 font-semibold border border-white/20"
              >
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. TRUST STRIP                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="container-xl py-6" aria-label="Trust features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Truck,
              title: "Fast Nationwide Delivery",
              desc: "Orders shipped within 24 hours",
              color: "emerald",
            },
            {
              icon: ShieldCheck,
              title: "100% Authentic Products",
              desc: "Every product is verified original",
              color: "emerald",
            },
            {
              icon: FlaskConical,
              title: "Clinically Tested",
              desc: "Third-party lab tested for purity",
              color: "emerald",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-4 hover-lift"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">{title}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. CATEGORIES                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="container-xl py-12" aria-label="Shop by category">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                Collections
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                Shop by Category
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((category, index) => {
              const Icon = getCategoryIcon(category.name);
              const imageUrl = getCategoryImageUrl(category.name, index);
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className={cn(
                    "relative rounded-3xl overflow-hidden group block cursor-pointer",
                    "border border-stone-200/80 shadow-md hover:shadow-xl hover:-translate-y-1",
                    "transition-all duration-500 flex flex-col justify-end min-h-[260px] sm:min-h-[300px]"
                  )}
                  aria-label={`Browse ${category.name}`}
                >
                  {/* Background Image with slight zoom on hover */}
                  <div className="absolute inset-0 z-0 overflow-hidden bg-stone-900">
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Soft dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                  </div>

                  {/* Top Badge / Icon */}
                  <div className="absolute top-5 left-5 z-10">
                    <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all duration-300 shadow-sm">
                      <Icon
                        className="h-5 w-5 text-white transition-colors duration-300"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-6 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-white mb-1 tracking-tight group-hover:text-emerald-300 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-xs font-medium text-stone-200/90 line-clamp-2 leading-relaxed">
                        {category.description || `Explore our premium ${category.name} collection.`}
                      </p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 group-hover:bg-emerald-600 group-hover:border-emerald-600 flex items-center justify-center transition-all duration-300 flex-shrink-0 shadow-sm group-hover:scale-105">
                      <ArrowRight
                        className="h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom CTA button → dedicated categories page */}
          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline" size="lg" className="rounded-xl font-bold">
              <Link href="/categories" aria-label="View all categories">
                View All Categories <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. FEATURED PRODUCTS                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="container-xl py-12" aria-label="Featured products">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                Top Picks
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-emerald-600 transition-colors"
              aria-label="Browse full catalog"
            >
              Browse all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex justify-center sm:hidden">
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/products">Browse all products <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
            </Button>
          </div>
        </section>
      )}



      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 6. VALUE PROPOSITION STRIP                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="container-xl py-12" aria-label="Brand values">
        <div className="bg-emerald-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%)",
              backgroundSize: "40px 40px",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                Ready to reach your goals?
              </h2>
              <p className="text-emerald-100 text-base max-w-md">
                Join thousands of athletes who trust PeakSupps for clinically precise nutrition.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl flex-shrink-0 shadow-lg"
            >
              <Link href="/products">
                Start Shopping <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}