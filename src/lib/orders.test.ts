import { describe, expect, it } from "vitest";
import { partialLabel, showDeliveryCode, type SubOrder } from "./orders";

const parcel = (status: string, id = 1): SubOrder => ({
  id,
  vendor_id: null,
  status,
  subtotal: { amount: 1, currency: "XOF" },
  delivered_at: null,
});

describe("partialLabel", () => {
  it("is null when the order is not partial", () => {
    expect(partialLabel({ partial: false, sub_orders: [parcel("shipped")] })).toBeNull();
    expect(partialLabel({})).toBeNull();
  });

  it("says partially delivered as soon as one parcel is delivered", () => {
    expect(partialLabel({ partial: true, sub_orders: [parcel("delivered"), parcel("shipped", 2)] })).toBe(
      "Partiellement livrée",
    );
  });

  it("says partially shipped when a parcel left but none arrived", () => {
    expect(partialLabel({ partial: true, sub_orders: [parcel("shipped"), parcel("confirmed", 2)] })).toBe(
      "Partiellement expédiée",
    );
  });

  it("falls back to the plain status when no parcel has moved", () => {
    expect(partialLabel({ partial: true, sub_orders: [parcel("confirmed"), parcel("pending", 2)] })).toBeNull();
  });
});

describe("showDeliveryCode", () => {
  it("shows the code while the parcel is still on its way", () => {
    expect(showDeliveryCode({ delivery_code: "482913", status: "shipped" })).toBe(true);
  });

  it("hides it once delivered or cancelled, or when there is none", () => {
    expect(showDeliveryCode({ delivery_code: "482913", status: "delivered" })).toBe(false);
    expect(showDeliveryCode({ delivery_code: "482913", status: "cancelled" })).toBe(false);
    expect(showDeliveryCode({ delivery_code: null, status: "pending" })).toBe(false);
    expect(showDeliveryCode({ status: "pending" })).toBe(false);
  });
});
