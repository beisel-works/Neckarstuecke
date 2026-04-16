/**
 * Shared TypeScript types for the print product data model.
 * Mirrors the Supabase `prints` and `print_variants` tables.
 */

export type PrintFormat = "print" | "framed";

export interface PrintVariant {
  id: string;
  print_id: string;
  size_label: string; // e.g. "30×40 cm"
  width_mm: number;
  height_mm: number;
  format: PrintFormat;
  price_cents: number; // in EUR cents
  in_stock: boolean;
  available_on_request: boolean;
}

export interface Print {
  id: string;
  slug: string;
  title: string;
  location: string;
  collection: string; // e.g. "kollektion-01"
  description: string;
  emotional_narrative: string;
  material_description: string;
  image_web_preview_url: string | null;
  image_thumbnail_url: string | null;
  image_mockup_url: string | null;
  image_og_url: string | null;
  available: boolean;
  created_at: string;
  variants: PrintVariant[];
}

/** Print as returned directly from Supabase (without joined variants). */
export type PrintRow = Omit<Print, "variants">;

/** Variant as returned directly from Supabase. */
export type PrintVariantRow = Omit<PrintVariant, never>;

/** Print with resolved variants — used in catalog and product pages. */
export type PrintWithVariants = PrintRow & { variants: PrintVariantRow[] };
