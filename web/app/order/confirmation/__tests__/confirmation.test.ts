import { describe, it, expect } from "vitest";
import { formatCents } from "../page";

describe("formatCents", () => {
  it("formats zero as 0,00 €", () => {
    expect(formatCents(0)).toBe("0,00\u00a0€");
  });

  it("formats 8900 as 89,00 €", () => {
    expect(formatCents(8900)).toBe("89,00\u00a0€");
  });

  it("formats 13999 as 139,99 €", () => {
    expect(formatCents(13999)).toBe("139,99\u00a0€");
  });

  it("formats 100 as 1,00 €", () => {
    expect(formatCents(100)).toBe("1,00\u00a0€");
  });

  it("formats large amounts correctly", () => {
    expect(formatCents(100000)).toBe("1.000,00\u00a0€");
  });
});
