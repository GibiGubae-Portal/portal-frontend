import { describe, expect, it } from "vitest";
import { escapeHtml, formatDate, fullName, humanize } from "./utils";

describe("humanize", () => {
  it("replaces underscores and handles empty values", () => {
    expect(humanize("Hymns_and_Arts_Section")).toBe("Hymns and Arts Section");
    expect(humanize(2016)).toBe("2016");
    expect(humanize(null)).toBe("N/A");
    expect(humanize(undefined, "-")).toBe("-");
    expect(humanize("")).toBe("N/A");
    expect(humanize(true)).toBe("Yes");
    expect(humanize(false)).toBe("No");
  });
});

describe("formatDate", () => {
  it("never throws on invalid input", () => {
    expect(formatDate("not a date")).toBe("N/A");
    expect(formatDate(null)).toBe("N/A");
    expect(formatDate("2000-01-15T00:00:00.000Z")).not.toBe("N/A");
  });
});

describe("escapeHtml", () => {
  it("escapes markup", () => {
    expect(escapeHtml('<img src=x onerror="a">&\'')).toBe(
      "&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;",
    );
    expect(escapeHtml(null)).toBe("");
  });
});

describe("fullName", () => {
  it("orders first, father's (lastname), grandfather's (middlename)", () => {
    expect(fullName({ firstname: "Abebe", middlename: "Kebede", lastname: "Tesfaye" })).toBe(
      "Abebe Tesfaye Kebede",
    );
  });

  it("skips missing parts and trims spaces", () => {
    expect(fullName({ firstname: " Abebe ", middlename: null, lastname: "Tesfaye " })).toBe(
      "Abebe Tesfaye",
    );
  });
});
