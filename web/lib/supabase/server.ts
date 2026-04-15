import { createClient } from "@supabase/supabase-js";
import type { PrintWithVariants, PrintRow, PrintVariantRow } from "@/types/print";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
  );
}

/** Server-side Supabase client — safe for use in Server Components and Route Handlers. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

/** Fetch all available prints with their variants, ordered by collection and title. */
export async function getAvailablePrints(): Promise<PrintWithVariants[]> {
  const { data: prints, error: printsError } = await supabase
    .from("prints")
    .select("*")
    .eq("available", true)
    .order("collection")
    .order("title");

  if (printsError) throw new Error(`Failed to fetch prints: ${printsError.message}`);
  if (!prints || prints.length === 0) return [];

  const printIds = (prints as PrintRow[]).map((p) => p.id);

  const { data: variants, error: variantsError } = await supabase
    .from("print_variants")
    .select("*")
    .in("print_id", printIds)
    .order("width_mm");

  if (variantsError) throw new Error(`Failed to fetch variants: ${variantsError.message}`);

  const variantsByPrintId = ((variants as PrintVariantRow[]) ?? []).reduce<
    Record<string, PrintVariantRow[]>
  >((acc, v) => {
    acc[v.print_id] = acc[v.print_id] ?? [];
    acc[v.print_id].push(v);
    return acc;
  }, {});

  return (prints as PrintRow[]).map((print) => ({
    ...print,
    variants: variantsByPrintId[print.id] ?? [],
  }));
}

/** Fetch a single print by slug, with variants. Returns null if not found. */
export async function getPrintBySlug(slug: string): Promise<PrintWithVariants | null> {
  const { data: print, error: printError } = await supabase
    .from("prints")
    .select("*")
    .eq("slug", slug)
    .eq("available", true)
    .single();

  if (printError) {
    if (printError.code === "PGRST116") return null; // not found
    throw new Error(`Failed to fetch print "${slug}": ${printError.message}`);
  }
  if (!print) return null;

  const { data: variants, error: variantsError } = await supabase
    .from("print_variants")
    .select("*")
    .eq("print_id", (print as PrintRow).id)
    .order("width_mm");

  if (variantsError)
    throw new Error(`Failed to fetch variants for "${slug}": ${variantsError.message}`);

  return { ...(print as PrintRow), variants: (variants as PrintVariantRow[]) ?? [] };
}
