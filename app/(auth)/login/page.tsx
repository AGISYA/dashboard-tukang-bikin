"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json().catch(() => null);
      if (data && data.id) {
        if (data.role === "ADMIN" || data.role === "SUPER_ADMIN") {
          router.replace("/dashboard");
        } else {
          // If logged in as regular user, maybe logout or show error?
          // For now, let's just do nothing or redirect to dashboard (middleware will handle)
          router.replace("/dashboard");
        }
      }
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Login gagal");
      return;
    }
    const j = await res.json().catch(() => ({}));
    if (j.redirectTo) {
      router.replace(j.redirectTo);
    } else {
      // For dashboard, always go to dashboard
      // If user is not admin/superadmin, middleware will block anyway
      // But we can add a check here if needed eventually.
      router.replace("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <form onSubmit={onSubmit} className="card w-full max-w-sm p-6 space-y-5">
        <h1 className="text-2xl font-semibold tracking-tight">Masuk</h1>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm mb-1 text-muted">
            Email atau Phone
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="contoh: 08xxxxxxxxxx atau user@mail.com"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-muted">Password</label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button
          className="btn btn-primary w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
