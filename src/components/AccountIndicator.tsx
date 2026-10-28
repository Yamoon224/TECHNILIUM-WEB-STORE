"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function AccountIndicator() {
  const { status, user } = useAuth();

  if (status === "checking") {
    return <span className="w-24" aria-hidden />;
  }

  return (
    <Link
      href={user ? "/compte" : "/connexion"}
      className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
      <span className="hidden sm:inline">{user ? `Salut, ${user.name.split(" ")[0]}` : "Connexion"}</span>
    </Link>
  );
}
