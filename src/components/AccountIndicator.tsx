"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function AccountIndicator() {
  const { status, user } = useAuth();

  if (status === "checking") {
    return null;
  }

  return (
    <Link
      href={user ? "/compte" : "/connexion"}
      className="rounded-sm border border-line px-3 py-2 text-sm text-ink transition-colors hover:border-gold"
    >
      {user ? user.name.split(" ")[0] : "Connexion"}
    </Link>
  );
}
