"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Layers, Search, Image as ImageIcon, Edit2, Trash2 } from "lucide-react";
import { api } from "@/src/lib/api";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { SearchBar } from "@/src/components/admin/SearchBar";
import { FormDialog } from "@/src/components/admin/FormDialog";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Field, FieldError } from "@/src/components/ui/field";
import { normalizeImageUrl } from "@/src/lib/utils";
import { toast } from "sonner";

interface Category {
  _id: string;
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  productsCount?: number;
}

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(50, "Name is too long"),
  description: z.string().max(300, "Description cannot exceed 300 characters").optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
    },
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/categories");
      setCategories(Array.isArray(res.data) ? res.data : (res.data.data || res.data.categories || []));
    } catch (err: any) {
      console.error("Failed to load categories:", err);
      setError(
        err.response?.data?.Message ||
          err.response?.data?.message ||
          "Could not load categories catalog from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenEdit = (cat: Category) => {
    setModalMode("edit");
    setActiveCategory(cat);
    reset({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleteLoading(true);
    try {
      const targetId = deletingCategory._id || deletingCategory.id;
      await api.delete(`/categories/${targetId}`);
      toast.success(`Category "${deletingCategory.name}" deleted successfully!`);
      setCategories((prev) => prev.filter((c) => (c._id || c.id) !== targetId));
      setDeletingCategory(null);
    } catch (err: any) {
      console.error("Delete category failed:", err);
      const msg = err.response?.data?.Message || err.response?.data?.message || "Failed to delete category.";
      toast.error(msg);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name.trim());
      if (values.description?.trim()) formData.append("description", values.description.trim());

      const fileInput = document.getElementById("cat-img") as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append("image", fileInput.files[0]);
      }

      const headers = { "Content-Type": "multipart/form-data" };

      if (modalMode === "edit" && activeCategory) {
        const targetId = activeCategory._id || activeCategory.id;
        await api.put(`/categories/${targetId}`, formData, { headers });
        toast.success(`Category "${values.name}" updated successfully!`);
        fetchCategories();
      } else {
        await api.post("/categories", formData, { headers });
        toast.success(`Category "${values.name}" created successfully!`);
        fetchCategories();
      }
      reset();
      if (fileInput) fileInput.value = "";
      setIsCreateModalOpen(false);
      setActiveCategory(null);
    } catch (err: any) {
      console.error("Failed to save category:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        `Failed to ${modalMode === "edit" ? "update" : "create"} category. Please try again.`;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Category>[] = [
    {
      header: "Image",
      cell: (cat) => (
        <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
          {cat.image ? (
            <img
              src={normalizeImageUrl(cat.image)}
              alt={cat.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Layers className="w-5 h-5 text-stone-400" />
          )}
        </div>
      ),
      className: "w-16",
    },
    {
      header: "Category Name",
      accessorKey: "name",
      cell: (cat) => <span className="font-bold text-stone-900">{cat.name}</span>,
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (cat) => (
        <span className="text-stone-500 line-clamp-1 max-w-md">
          {cat.description || "—"}
        </span>
      ),
    },
    {
      header: "ID",
      accessorKey: "id",
      cell: (cat) => <span className="text-stone-400 text-xs font-mono">#{cat._id || cat.id}</span>,
      className: "w-20",
    },
    {
      header: "Actions",
      cell: (cat) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => handleOpenEdit(cat)}
            title="Edit Category"
            className="rounded-lg text-stone-700 hover:text-amber-600 gap-1 font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setDeletingCategory(cat)}
            title="Delete Category"
            className="rounded-lg text-stone-700 hover:text-red-600 gap-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      ),
      className: "text-right w-36",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Categories Management"
        subtitle="Organize product categories and collections across your catalog."
      >
        <Button
          onClick={() => {
            setModalMode("add");
            setActiveCategory(null);
            reset({
              name: "",
              description: "",
              image: "",
            });
            setIsCreateModalOpen(true);
          }}
          className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md shadow-emerald-900/10"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </PageHeader>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories by name..."
        />
        <span className="text-xs font-semibold text-stone-500">
          Total: <strong className="text-stone-900">{filteredCategories.length}</strong>
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategories} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredCategories}
          keyExtractor={(item) => (item._id || item.id) as string}
          emptyMessage={
            searchQuery
              ? `No categories match "${searchQuery}"`
              : "No categories found. Click 'Add Category' to create one."
          }
        />
      )}

      {/* Create/Edit Category Modal */}
      <FormDialog
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setActiveCategory(null);
        }}
        title={modalMode === "edit" ? `Edit Category — ${activeCategory?.name || ""}` : "Create New Category"}
        description={
          modalMode === "edit"
            ? "Modify category details and branding image URL."
            : "Add a new product category to organize your supplements catalog."
        }
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field>
            <Label htmlFor="cat-name" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cat-name"
              {...register("name")}
              placeholder="e.g. Whey Protein, Amino Acids"
              className="mt-1.5 h-11 rounded-xl"
            />
            <FieldError errors={errors.name ? [{ message: errors.name.message }] : undefined} />
          </Field>

          <Field>
            <Label htmlFor="cat-desc" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
              Description
            </Label>
            <textarea
              id="cat-desc"
              {...register("description")}
              rows={3}
              placeholder="Brief summary of supplements in this category..."
              className="mt-1.5 w-full p-3 text-sm bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <FieldError errors={errors.description ? [{ message: errors.description.message }] : undefined} />
          </Field>

          <Field>
            <Label htmlFor="cat-img" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
              Category Image
            </Label>
            <div className="relative mt-1.5">
              <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                id="cat-img"
                type="file"
                accept="image/*"
                className="pl-10 h-11 rounded-xl pt-2.5"
              />
            </div>
            {modalMode === "edit" && <p className="text-xs text-stone-500 mt-1">Leave empty to keep existing image</p>}
          </Field>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setActiveCategory(null);
              }}
              disabled={isSubmitting}
              className="rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 px-6"
            >
              {modalMode === "edit" ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? This will remove the category from your catalog.`}
        variant="destructive"
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
