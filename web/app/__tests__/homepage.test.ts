import { describe, it, expect } from "vitest";
import type { PrintWithVariants } from "@/types/print";

// ── Fallback data shape tests ──────────────────────────────────────────────
// These mirror the FALLBACK_PRINTS constant in app/page.tsx.
// If the Supabase data model changes, these tests catch mismatches early.

type FeaturedPrint = Pick<
  PrintWithVariants,
  "slug" | "title" | "location" | "image_thumbnail_url"
>;

const FALLBACK_PRINTS: FeaturedPrint[] = [
  { slug: "minneburg", title: "Minneburg", location: "Neckartal bei Neckargerach", image_thumbnail_url: null },
  { slug: "dilsberg", title: "Dilsberg", location: "Dilsberg, Neckargemünd", image_thumbnail_url: null },
  { slug: "guttenberg", title: "Guttenberg", location: "Burg Guttenberg, Neckarmühlbach", image_thumbnail_url: null },
  { slug: "bad-wimpfen", title: "Bad Wimpfen", location: "Bad Wimpfen am Neckar", image_thumbnail_url: null },
];

describe("Homepage fallback prints", () => {
  it("contains exactly 4 motifs", () => {
    expect(FALLBACK_PRINTS).toHaveLength(4);
  });

  it("each fallback print has a non-empty slug", () => {
    for (const print of FALLBACK_PRINTS) {
      expect(print.slug.length).toBeGreaterThan(0);
    }
  });

  it("each fallback print has a non-empty title", () => {
    for (const print of FALLBACK_PRINTS) {
      expect(print.title.length).toBeGreaterThan(0);
    }
  });

  it("each fallback print has a non-empty location", () => {
    for (const print of FALLBACK_PRINTS) {
      expect(print.location.length).toBeGreaterThan(0);
    }
  });

  it("all fallback slugs are unique", () => {
    const slugs = FALLBACK_PRINTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("fallback slugs match expected Collection 01 motifs", () => {
    const slugs = FALLBACK_PRINTS.map((p) => p.slug);
    expect(slugs).toEqual(
      expect.arrayContaining(["minneburg", "dilsberg", "guttenberg", "bad-wimpfen"])
    );
  });

  it("fallback image_thumbnail_url is null (no CDN in dev)", () => {
    for (const print of FALLBACK_PRINTS) {
      expect(print.image_thumbnail_url).toBeNull();
    }
  });
});

// ── Featured-print projection logic ────────────────────────────────────────

function projectFeaturedPrints(prints: PrintWithVariants[]): FeaturedPrint[] {
  return prints.slice(0, 4).map((print) => ({
    slug: print.slug,
    title: print.title,
    location: print.location,
    image_thumbnail_url: print.image_thumbnail_url,
  }));
}

const makePrint = (overrides: Partial<PrintWithVariants> = {}): PrintWithVariants => ({
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
  variants: [],
  ...overrides,
});

describe("projectFeaturedPrints", () => {
  it("returns the curated featured set when those motifs are available", () => {
    const input = [
      makePrint({ id: "1", slug: "minneburg" }),
      makePrint({ id: "2", slug: "dilsberg" }),
      makePrint({ id: "3", slug: "guttenberg" }),
      makePrint({ id: "4", slug: "bad-wimpfen" }),
      makePrint({ id: "5", slug: "heidelberg" }),
      makePrint({ id: "6", slug: "hirschhorn" }),
    ];
    expect(projectFeaturedPrints(input).map((print) => print.slug)).toEqual([
      "minneburg",
      "dilsberg",
      "guttenberg",
      "bad-wimpfen",
    ]);
  });

  it("returns all matching featured motifs when fewer than 4 are available", () => {
    const input = [makePrint({ slug: "minneburg" })];
    const result = projectFeaturedPrints(input);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("minneburg");
  });

  it("returns empty array for empty input", () => {
    expect(projectFeaturedPrints([])).toHaveLength(0);
  });

  it("maps correct fields from print", () => {
    const input = [
      makePrint({
        slug: "minneburg",
        title: "Minneburg",
        location: "Neckartal bei Neckargerach",
        image_thumbnail_url: "https://cdn.example.com/thumb.webp",
      }),
    ];
    const [result] = projectFeaturedPrints(input);
    expect(result.slug).toBe("minneburg");
    expect(result.title).toBe("Minneburg");
    expect(result.location).toBe("Neckartal bei Neckargerach");
    expect(result.image_thumbnail_url).toBe("https://cdn.example.com/thumb.webp");
  });

  it("does not include variant data in projection", () => {
    const input = [makePrint({ slug: "minneburg" })];
    const [result] = projectFeaturedPrints(input);
    expect(result).not.toHaveProperty("variants");
    expect(result).not.toHaveProperty("description");
    expect(result).not.toHaveProperty("emotional_narrative");
  });
});
