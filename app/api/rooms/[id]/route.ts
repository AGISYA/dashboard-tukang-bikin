export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const rows = await prisma.$queryRawUnsafe<{ id: string; name: string; active: boolean; createdAt: Date }[]>(
    `SELECT "id","name","active","createdAt" FROM "Room" WHERE "id" = $1 LIMIT 1`,
    id
  );
  const r = rows?.[0];
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: r.id,
    name: r.name,
    active: r.active,
    createdAt: r.createdAt.toISOString(),
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = (await req.json()) as { name?: string; active?: boolean };
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "Room" SET "name" = COALESCE($1, "name"), "active" = COALESCE($2, "active"), "updatedAt" = NOW() WHERE "id" = $3`,
      typeof body.name === "string" ? body.name : null,
      typeof body.active === "boolean" ? body.active : null,
      id
    );
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Konflik nama" }, { status: 409 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "Room" WHERE "id" = $1`, id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    // Check if it's a foreign key violation (usually P2003 in Prisma or specific codes in PG)
    // Since it's raw SQL, we might need to check various error properties
    if (error.code === "P2003" || String(error).includes("foreign key")) {
      return NextResponse.json(
        { error: "Ruangan tidak bisa dihapus karena masih digunakan oleh produk." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Gagal menghapus ruangan" },
      { status: 500 }
    );
  }
}
