"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/src/lib/api";
import { getCategoryImageUrl } from "@/src/lib/utils";
import {
  Loader2,
  Zap,
  Dumbbell,
  Flame,
  HeartPulse,
  Pill,
  BotMessageSquare,
} from "lucide-react";
import { normalizeImageUrl } from "@/src/lib/utils";

const categoryIcons: any = {
  Vitamins: <Pill className="w-8 h-8 text-emerald-500" />,
  "Vitamins Minerals": <Pill className="w-8 h-8 text-emerald-500" />,
  Protein: <Zap className="w-8 h-8 text-orange-500" />,
  Fitness: <Dumbbell className="w-8 h-8 text-emerald-500" />,
  Burners: <Flame className="w-8 h-8 text-red-500" />,
  "Fat Loss": <Flame className="w-8 h-8 text-red-500" />,
  Health: <HeartPulse className="w-8 h-8 text-pink-500" />,
  Default: <BotMessageSquare className="w-8 h-8 text-indigo-500" />,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/categories");
        setCategories(res.data?.data || res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          Explore Categories
        </h1>
        <p className="text-gray-500 text-lg">
          Find the perfect supplements for your specific goal.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center h-64 items-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#059669]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((cat, index) => {
            const fallbackImageUrl = getCategoryImageUrl(cat.name, index);
            const finalImageUrl = cat.image ? normalizeImageUrl(cat.image) : fallbackImageUrl;
            return (
              <Link href={`/products?category=${cat._id || cat.id}`} key={cat._id || cat.id} className="block group">
                <div className="relative bg-stone-900 border border-stone-800 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-end min-h-[300px] p-8">
                  {/* Background Image with slight zoom on hover */}
                  <div className="absolute inset-0 z-0 overflow-hidden bg-stone-900">
                    <Image
                      src={finalImageUrl}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Soft dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                  </div>

                  {/* Top Badge Icon */}
                  <div className="absolute top-6 left-6 z-10 p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all duration-300 shadow-sm">
                    {categoryIcons[cat.name] || categoryIcons["Default"]}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-emerald-300 transition-colors duration-300">
                      {cat.name}
                    </h2>
                    <p className="text-stone-200/90 text-sm mb-6 leading-relaxed line-clamp-2">
                      {cat.description ||
                        `Discover our premium collection of ${cat.name} supplements designed for your performance.`}
                    </p>

                    <div className="flex items-center text-emerald-400 font-bold gap-2 group-hover:gap-3 transition-all duration-300 group-hover:text-emerald-300">
                      Browse Collection <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
