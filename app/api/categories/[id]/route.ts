export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const c = await prisma.category.findUnique({ where: { id } });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: c.id,
    name: c.name,
    active: c.active,
    createdAt: c.createdAt.toISOString(),
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = (await req.json()) as { name?: string; active?: boolean };
  const data: Prisma.CategoryUpdateInput = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.active === "boolean") data.active = body.active;
  try {
    const updated = await prisma.category.update({ where: { id }, data });
    return NextResponse.json({ id: updated.id });
  } catch {
    return NextResponse.json({ error: "Konflik nama" }, { status: 409 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Kategori tidak bisa dihapus karena masih memiliki produk." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
