"use client";

import { useAppearance } from "./AppearanceProvider";

/**
 * A piece of French text shown in the visitor's language. A client component,
 * so server-rendered pages can use it too: `<Tr>Livraison</Tr>`. The child is
 * the French source; without an English entry it simply stays French.
 */
export function Tr({ children }: { children: string }) {
  const { tr } = useAppearance();

  return <>{tr(children)}</>;
}
