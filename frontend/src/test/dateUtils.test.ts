import { describe, it, expect } from "vitest";

import { formatDateTime } from "@/utils/dateUtils";

describe("dateUtils", () => {
  it("formatDateTime returns formatted string for valid date", () => {
    const result = formatDateTime("2026-05-13T10:30:00");

    expect(result).toContain("pada");
    expect(result).toContain("10");
  });

  it("formatDateTime handles Date object", () => {
    const result = formatDateTime(new Date("2026-05-13T10:30:00"));

    expect(result).toContain("pada");
  });

  it("formatDateTime handles edge date", () => {
    const result = formatDateTime("2026-01-01T00:00:00");

    expect(result).toContain("pada");
  });
});
