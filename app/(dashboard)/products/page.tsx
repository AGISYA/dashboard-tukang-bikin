"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import ProductTable from "@/components/table/ProductTable";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useRooms } from "@/hooks/useRooms";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Filter, RotateCcw } from "lucide-react";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [room, setRoom] = useState("");
  const { data, refetch } = useProducts({
    q,
    category,
    room,
    page: 1,
    limit: 20,
  });
  const { data: cats } = useCategories();
  const { data: rooms } = useRooms();
  const del = useDeleteProduct();
  const items = useMemo(() => data?.data ?? [], [data]);

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this product?")) {
      del.mutate(id, {
        onSuccess: () => refetch(),
        onError: (err: any) => alert(err.message),
      });
    }
  }

  function resetFilters() {
    setQ("");
    setCategory("");
    setRoom("");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Inventory Products"
        description="Monitor and manage your store's items. Add categories, update pricing, or view stock status instantly."
        actions={
          <Link href="/products/new">
            <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2 px-6">
              <Plus className="size-4" />
              Add New Product
            </Button>
          </Link>
        }
      />

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 mb-2">
          <Filter className="size-4 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-widest">Filter & Search</h3>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Search by product name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 placeholder:text-slate-400 border"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="h-11 min-w-[180px] rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {cats?.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="h-11 min-w-[180px] rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            >
              <option value="">All Rooms</option>
              {rooms?.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={resetFilters}
              className="h-11 px-4 rounded-xl border-slate-100 hover:bg-slate-50"
              title="Reset Filters"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <ProductTable items={items} onDelete={handleDelete} />
      </div>
    </div>
  );
}
