import { describe, it, expect } from "vitest";
import { normaliseSkuKey } from "../stripe";

describe("normaliseSkuKey", () => {
  it("produces uppercase key from basic inputs", () => {
    expect(normaliseSkuKey("minneburg", "30×40 cm", "print")).toBe(
      "MINNEBURG__30X40-CM__PRINT"
    );
  });

  it("normalises ASCII x as multiplication sign", () => {
    expect(normaliseSkuKey("dilsberg", "50x70 cm", "framed")).toBe(
      "DILSBERG__50X70-CM__FRAMED"
    );
  });

  it("strips non-alphanumeric characters from slug", () => {
    expect(normaliseSkuKey("hirschhorn", "70×100 cm", "print")).toBe(
      "HIRSCHHORN__70X100-CM__PRINT"
    );
  });

  it("handles slugs with hyphens", () => {
    expect(normaliseSkuKey("heidelberg", "30×40 cm", "print")).toBe(
      "HEIDELBERG__30X40-CM__PRINT"
    );
  });

  it("collapses multiple spaces to single hyphen", () => {
    // \s+ collapses runs of spaces into one hyphen
    expect(normaliseSkuKey("test", "30  x  40 cm", "print")).toBe(
      "TEST__30-X-40-CM__PRINT"
    );
  });
});
