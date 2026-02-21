"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Me = { id: string; name: string; phone: string; role: string } | null;

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const j = await res.json();
          setMe(j);
        } else {
          setMe(null);
        }
      } catch {
        setMe(null);
      }
    })();
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const initial = (me?.name || me?.phone || "A").charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        className="h-10 w-10 rounded-full bg-[#eef2f7] border flex items-center justify-center font-semibold"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-50">
          <div className="px-3 py-2 text-sm">
            <div className="font-semibold">{me?.name || "Pengguna"}</div>
            <div className="text-muted">{me?.phone || ""}</div>
          </div>
          <div className="border-t my-1" />
          <Link className="block px-3 py-2 hover:bg-[#f1f5f9] rounded-lg" href="/profile">
            Profil
          </Link>
          <button className="block w-full text-left px-3 py-2 hover:bg-[#f1f5f9] rounded-lg" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
