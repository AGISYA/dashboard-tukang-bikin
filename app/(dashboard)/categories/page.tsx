"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import CategoryTable from "@/components/table/CategoryTable";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteCategory } from "@/hooks/useDeleteCategory";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const { data, refetch } = useCategories();
  const del = useDeleteCategory();
  const router = useRouter();

  function onEdit(id: string) {
    router.push(`/categories/${id}/edit`);
  }

  function onDelete(id: string) {
    if (confirm("Are you sure you want to delete this category?")) {
      del.mutate(id, {
        onSuccess: () => refetch(),
        onError: (err: any) => alert(err.message),
      });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Product Categories"
        description="Organize your inventory with logical categories. This high-level grouping helps customers find what they need faster."
        actions={
          <Link href="/categories/new">
            <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2 px-6">
              <Plus className="size-4" />
              New Category
            </Button>
          </Link>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <CategoryTable
          items={(data ?? []).map(c => ({ id: c.id, name: c.name, active: c.active }))}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
