import { describe, it, expect } from "vitest";

function sanitizeHtml(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

describe("sanitizeHtml", () => {
  it("escapes HTML tags", () => {
    expect(sanitizeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;",
    );
  });

  it("escapes double quotes", () => {
    expect(sanitizeHtml('"test"')).toBe("&quot;test&quot;");
  });

  it("escapes ampersands", () => {
    expect(sanitizeHtml("a&b")).toBe("a&amp;b");
  });

  it("returns empty string for null/undefined", () => {
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml(undefined)).toBe("");
  });

  it("passes through safe strings", () => {
    expect(sanitizeHtml("hello world")).toBe("hello world");
  });
});
