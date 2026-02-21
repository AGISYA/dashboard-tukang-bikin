export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scryptHash, signJWT } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "");
    if (!name || (!phone && !email) || !password) {
      return NextResponse.json({ error: "Nama, Email/Phone, dan password wajib" }, { status: 400 });
    }
    if (phone) {
      const existsPhone = await prisma.user.findUnique({ where: { phone } });
      if (existsPhone) {
        return NextResponse.json({ error: "Nomor sudah terdaftar" }, { status: 409 });
      }
    }
    if (email) {
      const existsEmail = await prisma.user.findUnique({ where: { email } });
      if (existsEmail) {
        return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
      }
    }
    const hashed = await scryptHash(password);
    const created = await prisma.user.create({
      data: {
        name,
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        password: hashed,
        role: "USER",
        active: true,
      },
      select: { id: true, name: true, phone: true, email: true, role: true },
    });
    const token = signJWT({
      id: created.id,
      name: created.name,
      phone: created.phone || undefined,
      email: created.email || undefined,
      role: "USER",
    });
    const resp = NextResponse.json(created);
    resp.cookies.set("shop_auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // for localhost as requested
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return resp;
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
