export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuthTokenFromCookies, verifyJWT } from "@/lib/auth";

export async function GET(_: NextRequest) {
  let token = await getAdminAuthTokenFromCookies();
  let payload = token ? verifyJWT(token) : null;

  if (!payload) {
    // try shop token
    const cookieStore = await cookies();
    const shopToken = cookieStore.get("shop_auth")?.value;
    if (shopToken) {
      payload = verifyJWT(shopToken);
    }
  }

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ...payload,
    user: {
      id: payload.id,
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone || null,
    },
  });
}
