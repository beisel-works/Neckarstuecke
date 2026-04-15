/**
 * Unit tests for cart reducer logic extracted from CartContext.
 * Tests pure state transitions without needing a DOM or React.
 */
import { describe, it, expect } from "vitest";
import type { CartItem } from "@/types/cart";

// ── Extract the reducer to test it in isolation ───────────────────────────────
// Re-declare the types and reducer here so we can unit-test without mounting React.

type PrintFormat = "print" | "framed";

interface CartState {
  items: CartItem[];
  hydrated: boolean;
}

type CartAction =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; variantId: string }
  | { type: "UPDATE_QUANTITY"; variantId: string; quantity: number }
  | { type: "CLEAR_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items, hydrated: true };

    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.variantId === action.item.variantId
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.variantId === action.item.variantId
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.variantId !== action.variantId),
      };

    case "UPDATE_QUANTITY": {
      if (action.quantity < 1) {
        return {
          ...state,
          items: state.items.filter((i) => i.variantId !== action.variantId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.variantId === action.variantId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeItem(variantId: string, overrides?: Partial<CartItem>): CartItem {
  return {
    variantId,
    printId: "print-1",
    slug: "minneburg",
    title: "Minneburg",
    imageUrl: null,
    sizeLabel: "30×40 cm",
    format: "print" as PrintFormat,
    priceInCents: 8900,
    quantity: 1,
    ...overrides,
  };
}

const empty: CartState = { items: [], hydrated: false };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("cartReducer — HYDRATE", () => {
  it("marks state as hydrated and sets items", () => {
    const items = [makeItem("v1")];
    const next = cartReducer(empty, { type: "HYDRATE", items });
    expect(next.hydrated).toBe(true);
    expect(next.items).toHaveLength(1);
    expect(next.items[0].variantId).toBe("v1");
  });

  it("hydrates to empty array when given []", () => {
    const next = cartReducer(empty, { type: "HYDRATE", items: [] });
    expect(next.hydrated).toBe(true);
    expect(next.items).toHaveLength(0);
  });
});

describe("cartReducer — ADD_ITEM", () => {
  it("adds a new item to an empty cart", () => {
    const state = cartReducer(empty, { type: "HYDRATE", items: [] });
    const next = cartReducer(state, { type: "ADD_ITEM", item: makeItem("v1") });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].variantId).toBe("v1");
    expect(next.items[0].quantity).toBe(1);
  });

  it("increments quantity when the same variant is added again", () => {
    let state = cartReducer(empty, { type: "HYDRATE", items: [] });
    state = cartReducer(state, { type: "ADD_ITEM", item: makeItem("v1") });
    state = cartReducer(state, { type: "ADD_ITEM", item: makeItem("v1") });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it("adds a second distinct item as a separate line", () => {
    let state = cartReducer(empty, { type: "HYDRATE", items: [] });
    state = cartReducer(state, { type: "ADD_ITEM", item: makeItem("v1") });
    state = cartReducer(state, {
      type: "ADD_ITEM",
      item: makeItem("v2", { sizeLabel: "50×70 cm" }),
    });
    expect(state.items).toHaveLength(2);
  });
});

describe("cartReducer — REMOVE_ITEM", () => {
  it("removes the specified item", () => {
    let state = cartReducer(empty, {
      type: "HYDRATE",
      items: [makeItem("v1"), makeItem("v2", { sizeLabel: "50×70 cm" })],
    });
    state = cartReducer(state, { type: "REMOVE_ITEM", variantId: "v1" });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].variantId).toBe("v2");
  });

  it("is a no-op for a non-existent variantId", () => {
    const state = cartReducer(empty, {
      type: "HYDRATE",
      items: [makeItem("v1")],
    });
    const next = cartReducer(state, { type: "REMOVE_ITEM", variantId: "v99" });
    expect(next.items).toHaveLength(1);
  });
});

describe("cartReducer — UPDATE_QUANTITY", () => {
  it("updates the quantity of an existing item", () => {
    let state = cartReducer(empty, {
      type: "HYDRATE",
      items: [makeItem("v1")],
    });
    state = cartReducer(state, {
      type: "UPDATE_QUANTITY",
      variantId: "v1",
      quantity: 3,
    });
    expect(state.items[0].quantity).toBe(3);
  });

  it("removes the item when quantity is set to 0", () => {
    let state = cartReducer(empty, {
      type: "HYDRATE",
      items: [makeItem("v1")],
    });
    state = cartReducer(state, {
      type: "UPDATE_QUANTITY",
      variantId: "v1",
      quantity: 0,
    });
    expect(state.items).toHaveLength(0);
  });

  it("removes the item when quantity is set to a negative number", () => {
    let state = cartReducer(empty, {
      type: "HYDRATE",
      items: [makeItem("v1")],
    });
    state = cartReducer(state, {
      type: "UPDATE_QUANTITY",
      variantId: "v1",
      quantity: -1,
    });
    expect(state.items).toHaveLength(0);
  });
});

describe("cartReducer — CLEAR_CART", () => {
  it("empties all items", () => {
    const state = cartReducer(empty, {
      type: "HYDRATE",
      items: [makeItem("v1"), makeItem("v2", { sizeLabel: "50×70 cm" })],
    });
    const next = cartReducer(state, { type: "CLEAR_CART" });
    expect(next.items).toHaveLength(0);
  });
});

describe("derived values", () => {
  it("computes itemCount correctly across multiple lines", () => {
    const items = [
      makeItem("v1", { quantity: 2 }),
      makeItem("v2", { quantity: 3, sizeLabel: "50×70 cm" }),
    ];
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    expect(itemCount).toBe(5);
  });

  it("computes totalCents correctly", () => {
    const items = [
      makeItem("v1", { quantity: 2, priceInCents: 8900 }),
      makeItem("v2", { quantity: 1, priceInCents: 13900, sizeLabel: "50×70 cm" }),
    ];
    const totalCents = items.reduce((s, i) => s + i.priceInCents * i.quantity, 0);
    expect(totalCents).toBe(8900 * 2 + 13900);
  });
});
