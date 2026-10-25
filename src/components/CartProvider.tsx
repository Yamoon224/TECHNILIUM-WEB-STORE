"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  addToCart,
  cartCount,
  cartSubtotalAmount,
  loadCart,
  removeFromCart,
  saveCart,
  setQuantity,
  type CartItem,
} from "@/lib/cart";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalAmount: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (offerId: number, quantity: number) => void;
  remove: (offerId: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const value: CartContextValue = {
    items,
    count: cartCount(items),
    subtotalAmount: cartSubtotalAmount(items),
    add: (item, quantity = 1) => setItems((current) => addToCart(current, item, quantity)),
    updateQuantity: (offerId, quantity) => setItems((current) => setQuantity(current, offerId, quantity)),
    remove: (offerId) => setItems((current) => removeFromCart(current, offerId)),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
