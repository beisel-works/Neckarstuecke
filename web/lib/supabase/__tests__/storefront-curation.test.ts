import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PrintRow } from "@/types/print";

const createClientMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

async function loadServerModule() {
  vi.resetModules();
  createClientMock.mockReturnValue({});
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
  return import("@/lib/supabase/server");
}

const makePrint = (overrides: Partial<PrintRow> = {}): PrintRow => ({
  id: "test-id",
  slug: "test-slug",
  title: "Test Title",
  location: "Test Location",
  collection: "kollektion-01",
  description: "desc",
  emotional_narrative: "narrative",
  material_description: "material",
  image_web_preview_url: null,
  image_thumbnail_url: null,
  image_mockup_url: null,
  image_og_url: null,
  available: true,
  created_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("projectStorefrontPrints", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("keeps the curated four slugs for kollektion-01", async () => {
    const { projectStorefrontPrints } = await loadServerModule();
    const prints = [
      makePrint({ id: "1", slug: "heidelberg", title: "Heidelberg" }),
      makePrint({ id: "2", slug: "minneburg", title: "Minneburg" }),
      makePrint({ id: "3", slug: "bad-wimpfen", title: "Bad Wimpfen" }),
      makePrint({ id: "4", slug: "hirschhorn", title: "Hirschhorn" }),
      makePrint({ id: "5", slug: "guttenberg", title: "Guttenberg" }),
      makePrint({ id: "6", slug: "dilsberg", title: "Dilsberg" }),
    ];

    expect(projectStorefrontPrints(prints).map((print) => print.slug)).toEqual([
      "minneburg",
      "dilsberg",
      "guttenberg",
      "bad-wimpfen",
    ]);
  });

  it("caps uncurated collections at four prints", async () => {
    const { projectStorefrontPrints } = await loadServerModule();
    const prints = [
      makePrint({ id: "1", slug: "a", collection: "kollektion-02" }),
      makePrint({ id: "2", slug: "b", collection: "kollektion-02" }),
      makePrint({ id: "3", slug: "c", collection: "kollektion-02" }),
      makePrint({ id: "4", slug: "d", collection: "kollektion-02" }),
      makePrint({ id: "5", slug: "e", collection: "kollektion-02" }),
    ];

    expect(projectStorefrontPrints(prints).map((print) => print.slug)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });
});
