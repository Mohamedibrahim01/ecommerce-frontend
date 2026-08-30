"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Package,
  Filter,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Copy,
} from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { SearchBar } from "@/src/components/admin/SearchBar";
import { Pagination } from "@/src/components/admin/Pagination";
import { FormDialog } from "@/src/components/admin/FormDialog";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Field, FieldError } from "@/src/components/ui/field";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: { _id: string; name: string };
  countInStock: number;
}

interface CategoryOption {
  _id: string;
  name: string;
}

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(100, "Name is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  price: z.number().positive("Price must be greater than 0"),
  countInStock: z.number().int().min(0, "Stock cannot be negative"),
  category: z.string().min(1, "Please select a category"),
  image: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 12;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "duplicate">("add");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // ─── Form Setup ───────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      countInStock: 10,
      category: "",
      image: "",
    },
  });

  // ─── Fetch Data ───────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/products`, {
        params: { pageNumber: page, limit: PAGE_SIZE, keyword: searchQuery }
      });
      const data = res.data?.data || [];
      setProducts(data);
      setPageNumber(page);
      
      const pages = res.data?.pages;
      if (pages !== undefined) {
        setHasMore(page < pages);
      } else {
        setHasMore(data.length >= PAGE_SIZE);
      }
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError(err.response?.data?.message || "Could not load product catalog from server.");
    } finally {
      setIsLoading(false);
    }
  }, [PAGE_SIZE, searchQuery]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const catsRes = await api.get("/categories").catch(() => ({ data: { data: [] } }));
      setCategories(catsRes.data?.data || catsRes.data || []);
    } catch {
      console.warn("Could not load dropdown metadata");
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchProducts]);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  // ─── Open Edit / Duplicate Modals ─────────────────────────────────────────
  const handleOpenEdit = (product: Product) => {
    setModalMode("edit");
    setActiveProduct(product);
    reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      countInStock: product.countInStock || 0,
      category: product.category?._id || "",
      image: product.image || "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenDuplicate = (product: Product) => {
    setModalMode("duplicate");
    setActiveProduct(product);
    reset({
      name: `${product.name} (Copy)`,
      description: product.description || "",
      price: product.price,
      countInStock: product.countInStock || 0,
      category: product.category?._id || "",
      image: product.image || "",
    });
    setIsAddModalOpen(true);
  };

  // ─── Delete Handler ───────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleteLoading(true);
    try {
      await api.delete(`/products/${deletingProduct._id}`);
      toast.success(`Product "${deletingProduct.name}" deleted successfully!`);
      setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));
      setDeletingProduct(null);
    } catch (err: any) {
      console.error("Delete product failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // ─── Create / Update Product Handler ──────────────────────────────────────
  const onSubmitProduct = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        price: values.price,
        countInStock: values.countInStock,
        category: values.category,
        image: values.image?.trim() || "",
      };

      if (modalMode === "edit" && activeProduct) {
        await api.put(`/products/${activeProduct._id}`, payload);
        toast.success(`Product "${values.name}" updated successfully!`);
      } else {
        await api.post("/products", payload);
        toast.success(`Product "${values.name}" ${modalMode === "duplicate" ? "duplicated" : "created"} successfully!`);
      }
      
      fetchProducts(pageNumber); // Refresh
      reset();
      setIsAddModalOpen(false);
      setActiveProduct(null);
    } catch (err: any) {
      console.error("Save product failed:", err);
      toast.error(err.response?.data?.message || `Failed to ${modalMode === "edit" ? "update" : "create"} product.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Filter Logic ─────────────────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "All") return true;
    return p.category?._id === selectedCategory;
  });

  // ─── Table Columns ────────────────────────────────────────────────────────
  const columns: Column<Product>[] = [
    {
      header: "Image",
      cell: (p) => (
        <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
          {p.image ? (
            <img
              src={normalizeImageUrl(p.image)}
              alt={p.name}
              className="w-full h-full object-contain p-1 mix-blend-multiply"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Package className="w-5 h-5 text-stone-300" />
          )}
        </div>
      ),
      className: "w-16",
    },
    {
      header: "Product Name",
      accessorKey: "name",
      cell: (p) => (
        <div className="max-w-xs">
          <p className="font-bold text-stone-900 line-clamp-1">{p.name}</p>
          <p className="text-xs text-stone-400 font-mono mt-0.5">ID: #{p._id}</p>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (p) => (
        <Badge variant="stone" className="font-semibold text-xs px-2.5 py-0.5">
          {p.category?.name || "General"}
        </Badge>
      ),
    },
    {
      header: "Price",
      cell: (p) => (
        <span className="font-black text-stone-900 text-sm">
          {formatPrice(p.price)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (p) => {
        const inStock = p.countInStock > 0;
        return (
          <div className="flex items-center gap-1.5">
            {inStock ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> In Stock ({p.countInStock})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /> Out of Stock
              </span>
            )}
          </div>
        )
      },
    },
    {
      header: "Actions",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => handleOpenEdit(p)}
            title="Edit Product"
            className="rounded-lg text-stone-700 hover:text-amber-600 gap-1 font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => handleOpenDuplicate(p)}
            title="Duplicate Product"
            className="rounded-lg text-stone-700 hover:text-blue-600 gap-1 font-semibold"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setDeletingProduct(p)}
            title="Delete Product"
            className="rounded-lg text-stone-700 hover:text-red-600 gap-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Products Catalog"
        subtitle="Manage inventory items, pricing, and stock levels."
      >
        <Button
          onClick={() => {
            setModalMode("add");
            setActiveProduct(null);
            reset({
              name: "",
              description: "",
              price: 0,
              countInStock: 10,
              category: "",
              image: "",
            });
            setIsAddModalOpen(true);
          }}
          className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md shadow-emerald-900/10 h-11 px-6"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </PageHeader>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products by name..."
            className="max-w-md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  Cat: {c.name}
                </option>
              ))}
            </select>
          </div>

          <Badge variant="stone" className="h-10 px-3 rounded-xl font-bold text-xs flex items-center">
            {filteredProducts.length} items
          </Badge>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchProducts(pageNumber)} />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={filteredProducts}
            keyExtractor={(item) => item._id}
            emptyMessage={
              searchQuery || selectedCategory !== "All"
                ? "No products match the selected filters."
                : "No products in inventory. Click 'Add Product' to begin."
            }
          />
          <Pagination
            currentPage={pageNumber}
            onPageChange={(page) => fetchProducts(page)}
            hasMore={hasMore}
          />
        </div>
      )}

      {/* ─── Add/Edit/Duplicate Product Modal ─────────────────────────────── */}
      <FormDialog
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setActiveProduct(null);
        }}
        title={
          modalMode === "edit"
            ? `Edit Product — ${activeProduct?.name || ""}`
            : modalMode === "duplicate"
            ? `Duplicate Product — ${activeProduct?.name || ""}`
            : "Add New Product"
        }
        description="Fill in product details, pricing, and associate with a category."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field className="md:col-span-2">
              <Label htmlFor="prod-name" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prod-name"
                {...register("name")}
                placeholder="e.g. Gold Standard 100% Whey Protein"
                className="mt-1.5 h-11 rounded-xl"
              />
              <FieldError errors={errors.name ? [{ message: errors.name.message }] : undefined} />
            </Field>

            <Field className="md:col-span-2">
              <Label htmlFor="prod-desc" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Description
              </Label>
              <textarea
                id="prod-desc"
                {...register("description")}
                rows={4}
                placeholder="Product description and details..."
                className="mt-1.5 w-full p-3 text-sm bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <FieldError errors={errors.description ? [{ message: errors.description.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="prod-price" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Price (EGP) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prod-price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                placeholder="0.00"
                className="mt-1.5 h-11 rounded-xl"
              />
              <FieldError errors={errors.price ? [{ message: errors.price.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="prod-stock" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Stock Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prod-stock"
                type="number"
                {...register("countInStock", { valueAsNumber: true })}
                placeholder="10"
                className="mt-1.5 h-11 rounded-xl"
              />
              <FieldError errors={errors.countInStock ? [{ message: errors.countInStock.message }] : undefined} />
            </Field>

            <Field className="md:col-span-2">
              <Label htmlFor="prod-cat" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="prod-cat"
                {...register("category")}
                className="mt-1.5 w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.category ? [{ message: errors.category.message }] : undefined} />
            </Field>

            <Field className="md:col-span-2">
              <Label htmlFor="prod-img" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Image URL
              </Label>
              <div className="relative mt-1.5">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  id="prod-img"
                  {...register("image")}
                  placeholder="https://example.com/product-image.jpg"
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <FieldError errors={errors.image ? [{ message: errors.image.message }] : undefined} />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setActiveProduct(null);
              }}
              disabled={isSubmitting}
              className="rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/10"
            >
              {modalMode === "edit" ? "Save Changes" : modalMode === "duplicate" ? "Create Duplicate" : "Create Product"}
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* ─── Delete Confirmation Modal ────────────────────────────────────── */}
      {deletingProduct && (
        <div className="fixed inset-0 z-[100] bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-100 p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-stone-900 text-xl">Delete Product?</h3>
                <p className="text-stone-500 text-sm mt-1">
                  Are you sure you want to delete <span className="font-bold text-stone-900">{deletingProduct.name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl font-bold"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleteLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmDelete}
                loading={isDeleteLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
