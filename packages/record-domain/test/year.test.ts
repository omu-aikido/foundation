import { describe, expect, test } from "bun:test";
import { translateYear, year } from "../index";

describe("year array", () => {
  test("should have 8 entries", () => {
    expect(year).toHaveLength(8);
  });

  test("should contain correct undergraduate years", () => {
    expect(year).toContainEqual({ name: "1回生", year: "b1" });
    expect(year).toContainEqual({ name: "2回生", year: "b2" });
    expect(year).toContainEqual({ name: "3回生", year: "b3" });
    expect(year).toContainEqual({ name: "4回生", year: "b4" });
  });

  test("should contain correct graduate years", () => {
    expect(year).toContainEqual({ name: "修士1年", year: "m1" });
    expect(year).toContainEqual({ name: "修士2年", year: "m2" });
    expect(year).toContainEqual({ name: "博士1年", year: "d1" });
    expect(year).toContainEqual({ name: "博士2年", year: "d2" });
  });
});

describe("translateYear(): valid year codes", () => {
  test.each([
    ["b1", "1回生"],
    ["b2", "2回生"],
    ["b3", "3回生"],
    ["b4", "4回生"],
  ])("should translate b1-b4 to undergraduate labels: %s", (input, expected) => {
    expect(translateYear(input)).toBe(expected);
  });

  test.each([
    ["m1", "修士1年"],
    ["m2", "修士2年"],
  ])("should translate m1-m2 to master labels: %s", (input, expected) => {
    expect(translateYear(input)).toBe(expected);
  });

  test.each([
    ["d1", "博士1年"],
    ["d2", "博士2年"],
  ])("should translate d1-d2 to doctoral labels: %s", (input, expected) => {
    expect(translateYear(input)).toBe(expected);
  });

  test.each([
    ["B1", "1回生"],
    ["M1", "修士1年"],
    ["D2", "博士2年"],
  ])("should be case insensitive: %s", (input, expected) => {
    expect(translateYear(input)).toBe(expected);
  });
});

describe("translateYear(): valid Japanese labels", () => {
  test.each([
    ["1回生", "1回生"],
    ["2回生", "2回生"],
    ["3回生", "3回生"],
    ["4回生", "4回生"],
  ])("should translate undergraduate labels: %s", (input, expected) => {
    expect(translateYear(input)).toBe(expected);
  });

  test.each([
    ["修士1年", "修士1年"],
    ["修士2年", "修士2年"],
    ["博士1年", "博士1年"],
    ["博士2年", "博士2年"],
  ])("should translate graduate labels: %s", (input, expected) => {
    expect(translateYear(input)).toBe(expected);
  });
});

describe("translateYear(): valid UI labels", () => {
  test.each([
    ["学部 1年", "1回生"],
    ["学部 2年", "2回生"],
    ["学部 3年", "3回生"],
    ["学部 4年", "4回生"],
  ])("should translate undergraduate UI labels: %s", (input, expected) => {
    expect(translateYear(input)).toBe(expected);
  });

  test.each([
    ["修士 1年", "修士1年"],
    ["修士 2年", "修士2年"],
    ["博士 1年", "博士1年"],
    ["博士 2年", "博士2年"],
  ])("should translate graduate UI labels: %s", (input, expected) => {
    expect(translateYear(input)).toBe(expected);
  });
});

describe("translateYear(): invalid inputs", () => {
  test("should return 不明 for empty string", () => {
    expect(translateYear("")).toBe("不明");
  });

  test("should return 不明 for whitespace-only string", () => {
    expect(translateYear("   ")).toBe("不明");
  });

  test.each([
    ["foo", "不明"],
    ["x5", "不明"],
    ["b5", "不明"],
    ["m3", "不明"],
    ["d3", "不明"],
  ])("should return 不明 for unknown strings: %s", (input, expected) => {
    expect(translateYear(input)).toBe(expected);
  });
});
