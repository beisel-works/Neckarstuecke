import { describe, expect, it } from "vitest";
import { generateCoaPdf } from "../generate-pdf";

describe("generateCoaPdf", () => {
  it("returns non-empty PDF bytes", async () => {
    const pdf = await generateCoaPdf({
      buyerName: "Ada Käuferin",
      editionNumber: 42,
      motifTitle: "Minneburg",
      formatLabel: "30×40 cm, Print",
      issuedAt: "2026-04-16",
    });

    expect(pdf.byteLength).toBeGreaterThan(100);
    expect(pdf.toString("utf8", 0, 8)).toContain("%PDF-1.4");
  });

  it("throws when required fields are missing", async () => {
    await expect(
      generateCoaPdf({
        buyerName: "",
        editionNumber: 0,
        motifTitle: "",
        formatLabel: "",
        issuedAt: "",
      })
    ).rejects.toThrow("Missing required COA PDF fields.");
  });
});
