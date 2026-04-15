import { describe, it, expect } from "vitest";
import type { Print, PrintVariant, PrintWithVariants } from "@/types/print";

// Type-level tests: these compile only if the types are correctly defined.
// Runtime tests verify structural invariants of the data model.

describe("Print type structure", () => {
  it("accepts a well-formed Print object", () => {
    const print: Print = {
      id: "a1000001-0000-0000-0000-000000000001",
      slug: "minneburg",
      title: "Minneburg",
      location: "Neckartal bei Neckargerach",
      collection: "kollektion-01",
      description: "Herbstsilhouette der Minneburg.",
      emotional_narrative: "Manche Orte brauchen keinen Namen.",
      material_description: "Pigmentdruck auf 310 g/m² Hahnemühle Photo Rag.",
      image_web_preview_url: null,
      image_thumbnail_url: null,
      image_og_url: null,
      available: true,
      created_at: "2026-01-01T00:00:00Z",
      variants: [],
    };
    expect(print.slug).toBe("minneburg");
    expect(print.available).toBe(true);
    expect(Array.isArray(print.variants)).toBe(true);
  });

  it("accepts a well-formed PrintVariant object", () => {
    const variant: PrintVariant = {
      id: "b2000001-0000-0000-0000-000000000001",
      print_id: "a1000001-0000-0000-0000-000000000001",
      size_label: "30×40 cm",
      width_mm: 300,
      height_mm: 400,
      format: "print",
      price_cents: 8900,
      in_stock: true,
    };
    expect(variant.price_cents).toBe(8900);
    expect(variant.format).toBe("print");
  });

  it("accepts framed format on PrintVariant", () => {
    const variant: PrintVariant = {
      id: "b2000002-0000-0000-0000-000000000001",
      print_id: "a1000001-0000-0000-0000-000000000001",
      size_label: "50×70 cm",
      width_mm: 500,
      height_mm: 700,
      format: "framed",
      price_cents: 28900,
      in_stock: true,
    };
    expect(variant.format).toBe("framed");
  });

  it("builds a PrintWithVariants correctly", () => {
    const printWithVariants: PrintWithVariants = {
      id: "a1000001-0000-0000-0000-000000000002",
      slug: "dilsberg",
      title: "Dilsberg",
      location: "Dilsberg, Neckar-Odenwald-Kreis",
      collection: "kollektion-01",
      description: "Frühsommer am Dilsberg.",
      emotional_narrative: "Die Ruine thront über dem Tal.",
      material_description: "Pigmentdruck auf 310 g/m² Hahnemühle Photo Rag.",
      image_web_preview_url: "https://cdn.example.com/dilsberg-web.webp",
      image_thumbnail_url: "https://cdn.example.com/dilsberg-thumb.webp",
      image_og_url: "https://cdn.example.com/dilsberg-og.jpg",
      available: true,
      created_at: "2026-01-01T00:00:00Z",
      variants: [
        {
          id: "b2000003-0000-0000-0000-000000000001",
          print_id: "a1000001-0000-0000-0000-000000000002",
          size_label: "30×40 cm",
          width_mm: 300,
          height_mm: 400,
          format: "print",
          price_cents: 8900,
          in_stock: true,
        },
      ],
    };

    expect(printWithVariants.variants).toHaveLength(1);
    expect(printWithVariants.variants[0].size_label).toBe("30×40 cm");
  });

  it("allows null image URLs", () => {
    const printWithNulls: PrintWithVariants = {
      id: "a1000001-0000-0000-0000-000000000003",
      slug: "hirschhorn",
      title: "Hirschhorn",
      location: "Hirschhorn am Neckar",
      collection: "kollektion-01",
      description: "Goldene Stunde.",
      emotional_narrative: "Das Licht trifft den Sandstein.",
      material_description: "Pigmentdruck auf 310 g/m² Hahnemühle Photo Rag.",
      image_web_preview_url: null,
      image_thumbnail_url: null,
      image_og_url: null,
      available: true,
      created_at: "2026-01-01T00:00:00Z",
      variants: [],
    };
    expect(printWithNulls.image_web_preview_url).toBeNull();
  });
});
