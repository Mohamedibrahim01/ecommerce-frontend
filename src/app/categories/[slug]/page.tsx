"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/src/components/auth/axiosInstance";
import { ProductCard } from "@/src/components/products/ProductCard";
import { Button } from "@/src/components/ui/button";
import { normalizeImageUrl } from "@/src/lib/utils";
import {
  ArrowLeft,
  Loader2,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  PackageOpen
} from "lucide-react";

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 8;

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      try {
        setIsLoading(true);
        // 1. Fetch Category by Slug
        const catRes = await api.get(`/categories/${slug}`);
        const catData = catRes.data?.data || catRes.data;
        setCategory(catData);
        
        // 2. Fetch Products for this Category
        if (catData?._id || catData?.id) {
          fetchProducts(catData._id || catData.id, 1);
        }
      } catch (e) {
        console.error("Failed to load category data", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const fetchProducts = async (catId: string, page: number) => {
    try {
      setIsProductsLoading(true);
      const res = await api.get(`/Products`, {
        params: { categoryId: catId, pageNumber: page, pageSize },
      });
      setProducts(res.data);
      setHasMore(res.data.length === pageSize);
      setPageNumber(page);
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (category) {
      fetchProducts(category._id || category.id, newPage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8" dir="ltr">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : !category ? (
        <div className="text-center py-24 bg-stone-50 rounded-3xl">
          <PackageOpen className="w-16 h-16 mx-auto text-stone-300 mb-4" />
          <h3 className="font-black text-xl text-stone-900">Category not found</h3>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/categories')}>
            Back to Categories
          </Button>
        </div>
      ) : (
        <>
          {/* Category Banner */}
          <div className="relative overflow-hidden bg-stone-900 rounded-3xl min-h-[250px] flex items-center p-8 md:p-12">
            {category.image && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={normalizeImageUrl(category.image)}
                  alt={category.name}
                  fill
                  className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent" />
              </div>
            )}
            
            <div className="relative z-10 max-w-2xl text-white">
              <Button
                variant="ghost"
                className="rounded-full h-10 w-10 p-0 text-white hover:bg-white/20 hover:text-white mb-4"
                onClick={() => router.push('/categories')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-4xl md:text-5xl font-black mb-3 text-white">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-stone-300 text-lg">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-stone-900 mb-6">Explore {category.name}</h2>
            
            {isProductsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                <div className="flex justify-center items-center gap-6 pt-10 mt-10 border-t border-stone-100">
                  <Button
                    variant="outline"
                    disabled={pageNumber === 1}
                    onClick={() => handlePageChange(pageNumber - 1)}
                    className="rounded-xl font-bold"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Prev
                  </Button>
                  <span className="font-black text-emerald-600">Page {pageNumber}</span>
                  <Button
                    variant="outline"
                    disabled={!hasMore}
                    onClick={() => handlePageChange(pageNumber + 1)}
                    className="rounded-xl font-bold"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-24 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                <ShoppingBag className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                <h3 className="font-black text-xl text-stone-900 mb-2">No products found</h3>
                <p className="text-stone-500">We couldn't find any products in this category.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
