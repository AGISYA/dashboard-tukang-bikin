"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Phone, ShieldCheck } from "lucide-react";

type Me = { id: string; name: string; phone: string; role: string } | null;

export default function ProfilePage() {
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          setMe(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "U";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-xl w-full" />
        <div className="h-64 bg-slate-100 rounded-xl w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Pengguna"
        description="Informasi detail mengenai akun Anda saat ini."
      />

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card className="h-full border-none shadow-lg shadow-slate-200/50 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            <CardContent className="pt-12 relative flex flex-col items-center">
              <div className="size-24 rounded-full bg-white p-1 shadow-xl ring-4 ring-slate-50 relative z-10 mb-4">
                <div className="size-full rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-700">
                  {getInitials(me?.name || "")}
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{me?.name || "Pengguna"}</h2>
              <p className="text-sm font-medium text-slate-500 mb-6">{me?.role || "User"}</p>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="size-8 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">
                    <Phone className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Nomor Telepon</p>
                    <p className="text-sm font-semibold text-slate-700">{me?.phone || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="size-8 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Role Akses</p>
                    <p className="text-sm font-semibold text-slate-700">{me?.role || "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="h-full border-none shadow-md shadow-slate-100">
            <CardHeader>
              <CardTitle>Detail Akun</CardTitle>
              <CardDescription>Informasi lengkap terkait akun dan preferensi Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Nama Lengkap</label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-900">
                    {me?.name || "-"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Nomor Telepon</label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-900">
                    {me?.phone || "-"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Role</label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-900">
                    {me?.role || "-"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Status Akun</label>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm font-medium text-green-700 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                    Aktif
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
