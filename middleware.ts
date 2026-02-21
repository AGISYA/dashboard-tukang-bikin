import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

const ADMIN_PATHS = [
    "/dashboard",
    "/products",
    "/categories",
    "/carousel",
    "/users",
    "/rooms",
    "/why",
    "/business",
    "/news",
    "/footer",
    "/pengguna",
];


export async function middleware(req: NextRequest) {
    const { pathname, origin } = req.nextUrl;
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "default_secret");

    // Helper for Neon Auth JWKS
    const NEON_AUTH_URL = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
    const JWKS = NEON_AUTH_URL
        ? createRemoteJWKSet(new URL(`${NEON_AUTH_URL}/.well-known/jwks.json`))
        : null;

    async function verifyToken(token: string, secret: Uint8Array) {
        try {
            // 1. Try Local Secret (HS256)
            return await jwtVerify(token, secret);
        } catch (localErr) {
            // 2. Try Neon JWKS (RS256) if available
            if (JWKS) {
                try {
                    return await jwtVerify(token, JWKS);
                } catch (remoteErr) {
                    throw localErr; // Throw original error if both fail
                }
            }
            throw localErr;
        }
    }

    // --- CORS HANDLING ---
    const allowedOrigins = ["http://localhost:3001", "http://localhost:3000"];
    const currentOrigin = req.headers.get("origin") || "";
    const isAllowedOrigin = allowedOrigins.includes(currentOrigin);

    // Handle OPTIONS request for preflight
    if (req.method === "OPTIONS") {
        const preflightResponse = new NextResponse(null, { status: 204 });
        preflightResponse.headers.set("Access-Control-Allow-Origin", currentOrigin || "*");
        preflightResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        preflightResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
        preflightResponse.headers.set("Access-Control-Allow-Credentials", "true");
        return preflightResponse;
    }

    // 1. Handle Admin Dashboard Protection
    const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
    if (isAdminPath) {
        const adminToken = req.cookies.get("admin_token")?.value;
        if (!adminToken) {
            return NextResponse.redirect(new URL("/login", origin));
        }

        try {
            const { payload } = await verifyToken(adminToken, secret);
            const role = payload.role as string;

            // For existing logic compat & Neon fallback:
            const effectiveRole = role || (payload.client_metadata as any)?.role || "USER";

            if (effectiveRole !== "ADMIN" && effectiveRole !== "SUPER_ADMIN") {
                // Logged in as SHOP user but trying to access ADMIN area
                return NextResponse.redirect(new URL("/login?error=forbidden", origin));
            }
        } catch (err) {
            return NextResponse.redirect(new URL("/login", origin));
        }
    }

    // 3. Prevent logged-in users from accessing Login page
    if (pathname === "/login") {
        const adminToken = req.cookies.get("admin_token")?.value;

        if (adminToken) {
            try {
                const { payload } = await verifyToken(adminToken, secret);
                const role = payload.role as string || (payload.client_metadata as any)?.role;
                if (role === "ADMIN" || role === "SUPER_ADMIN") {
                    return NextResponse.redirect(new URL("/dashboard", origin));
                }
            } catch { }
        }
    }

    const res = NextResponse.next();
    // Add CORS headers to all normal responses
    res.headers.set("Access-Control-Allow-Origin", currentOrigin || "*");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/products/:path*",
        "/categories/:path*",
        "/carousel/:path*",
        "/users/:path*",
        "/rooms/:path*",
        "/why/:path*",
        "/business/:path*",
        "/news/:path*",
        "/footer/:path*",
        "/pengguna/:path*",
        "/login",
    ],
};
