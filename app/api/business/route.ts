export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
  const row = await prisma.businessPromo.findFirst({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(row || null);
}

export async function PUT(req: NextRequest) {
  const token = await getAdminAuthTokenFromCookies();
  const me = token ? verifyJWT(token) : null;
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      title?: string;
      description?: string;
      buttonText?: string;
      buttonLink?: string;
      imageUrl?: string;
      active?: boolean;
    };

    const existing = await prisma.businessPromo.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!existing) {
      const newItem = await prisma.businessPromo.create({
        data: {
          title: String(body.title ?? "Shop for Business"),
          description: String(body.description ?? ""),
          buttonText: String(body.buttonText ?? "Shop now"),
          buttonLink: String(body.buttonLink ?? "/"),
          imageUrl: body.imageUrl ?? null,
          active: body.active ?? true,
        },
      });
      return NextResponse.json(newItem);
    } else {
      const updatedItem = await prisma.businessPromo.update({
        where: { id: existing.id },
        data: {
          title: typeof body.title === "string" ? body.title : undefined,
          description: typeof body.description === "string" ? body.description : undefined,
          buttonText: typeof body.buttonText === "string" ? body.buttonText : undefined,
          buttonLink: typeof body.buttonLink === "string" ? body.buttonLink : undefined,
          imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : undefined,
          active: typeof body.active === "boolean" ? body.active : undefined,
        },
      });
      return NextResponse.json(updatedItem);
    }
  } catch (err) {
    console.error("Business Put Error:", err);
    return NextResponse.json({ error: "Gagal menyimpan Business Promo" }, { status: 500 });
  }
}
