"use client";

import { Tr } from "@/components/Tr";
import Link from "next/link";
import { User } from "lucide-react";
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
      <User className="h-5 w-5" aria-hidden />
      <span className="hidden sm:inline">{user ? `Salut, ${user.name.split(" ")[0]}` : <Tr>Connexion</Tr>}</span>
    </Link>
  );
}
