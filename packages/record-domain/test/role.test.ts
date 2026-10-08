import { Role } from "../index";
import { describe, expect, test } from "bun:test";

describe("Role static instances", () => {
  test.each([
    [Role.ADMIN, "admin", "管理者"],
    [Role.CAPTAIN, "captain", "主将"],
    [Role.VICE_CAPTAIN, "vice-captain", "副主将"],
    [Role.TREASURER, "treasurer", "会計"],
    [Role.CHIEF, "chief", "主務"],
    [Role.MEMBER, "member", "部員"],
  ])("should expose %s", (instance, role, label) => {
    expect(instance.role).toBe(role);
    expect(instance.ja).toBe(label);
  });
});

describe("Role.ALL", () => {
  test("should contain all 6 roles", () => {
    expect(Role.ALL).toHaveLength(6);
    expect(Role.ALL).toContain(Role.ADMIN);
    expect(Role.ALL).toContain(Role.CAPTAIN);
    expect(Role.ALL).toContain(Role.VICE_CAPTAIN);
    expect(Role.ALL).toContain(Role.TREASURER);
    expect(Role.ALL).toContain(Role.CHIEF);
    expect(Role.ALL).toContain(Role.MEMBER);
  });

  test("should have correct ordering", () => {
    expect(Role.ALL[0]).toBe(Role.ADMIN);
    expect(Role.ALL[1]).toBe(Role.CAPTAIN);
    expect(Role.ALL[2]).toBe(Role.VICE_CAPTAIN);
    expect(Role.ALL[3]).toBe(Role.TREASURER);
    expect(Role.ALL[4]).toBe(Role.CHIEF);
    expect(Role.ALL[5]).toBe(Role.MEMBER);
  });
});

describe("Role.parse()", () => {
  test.each([
    ["admin", Role.ADMIN],
    ["captain", Role.CAPTAIN],
    ["vice-captain", Role.VICE_CAPTAIN],
    ["treasurer", Role.TREASURER],
    ["chief", Role.CHIEF],
    ["member", Role.MEMBER],
  ])("should parse valid role strings: %s", (input, expected) => {
    expect(Role.parse(input)).toBe(expected);
  });

  test("should return undefined for null", () => {
    expect(Role.parse(null)).toBeUndefined();
  });

  test("should return undefined for undefined", () => {
    expect(Role.parse(undefined)).toBeUndefined();
  });

  test("should return undefined for random strings", () => {
    expect(Role.parse("foo")).toBeUndefined();
    expect(Role.parse("unknown")).toBeUndefined();
    expect(Role.parse("")).toBeUndefined();
  });

  test("should return undefined for numbers", () => {
    expect(Role.parse(1)).toBeUndefined();
    expect(Role.parse(0)).toBeUndefined();
  });
});

describe("Role.fromString()", () => {
  test.each([
    ["admin", Role.ADMIN],
    ["captain", Role.CAPTAIN],
    ["vice-captain", Role.VICE_CAPTAIN],
    ["treasurer", Role.TREASURER],
    ["chief", Role.CHIEF],
    ["member", Role.MEMBER],
  ])("should return correct Role instances: %s", (input, expected) => {
    expect(Role.fromString(input)).toBe(expected);
  });

  test("should return null for invalid strings", () => {
    expect(Role.fromString("foo")).toBeNull();
    expect(Role.fromString("")).toBeNull();
    expect(Role.fromString("unknown")).toBeNull();
  });
});

describe("Role.toString()", () => {
  test("should return the role string", () => {
    expect(Role.ADMIN.toString()).toBe("admin");
    expect(Role.CAPTAIN.toString()).toBe("captain");
    expect(Role.VICE_CAPTAIN.toString()).toBe("vice-captain");
    expect(Role.TREASURER.toString()).toBe("treasurer");
    expect(Role.CHIEF.toString()).toBe("chief");
    expect(Role.MEMBER.toString()).toBe("member");
  });
});

describe("Role.isManagement()", () => {
  test("should return true for management roles", () => {
    expect(Role.ADMIN.isManagement()).toBe(true);
    expect(Role.CAPTAIN.isManagement()).toBe(true);
    expect(Role.VICE_CAPTAIN.isManagement()).toBe(true);
    expect(Role.TREASURER.isManagement()).toBe(true);
    expect(Role.CHIEF.isManagement()).toBe(true);
  });

  test("should return false for MEMBER", () => {
    expect(Role.MEMBER.isManagement()).toBe(false);
  });
});

describe("Role.compare()", () => {
  test("should return 0 for same roles", () => {
    expect(Role.compare("admin", "admin")).toBe(0);
    expect(Role.compare("member", "member")).toBe(0);
    expect(Role.compare("treasurer", "chief")).toBe(0);
    expect(Role.compare("chief", "treasurer")).toBe(0);
  });

  test("should return negative when first role has higher priority", () => {
    expect(Role.compare("admin", "captain")).toBeLessThan(0);
    expect(Role.compare("captain", "member")).toBeLessThan(0);
    expect(Role.compare("admin", "member")).toBeLessThan(0);
  });

  test("should return positive when first role has lower priority", () => {
    expect(Role.compare("member", "admin")).toBeGreaterThan(0);
    expect(Role.compare("captain", "admin")).toBeGreaterThan(0);
    expect(Role.compare("treasurer", "vice-captain")).toBeGreaterThan(0);
    expect(Role.compare("chief", "vice-captain")).toBeGreaterThan(0);
  });

  test("should handle invalid roles as member", () => {
    expect(Role.compare("invalid", "member")).toBe(0);
    expect(Role.compare("admin", "invalid")).toBeLessThan(0);
  });
});

describe("Role.type", () => {
  test("should exist as arktype schema", () => {
    expect(Role.type).toBeDefined();
    expect(typeof Role.type).toBe("function");
  });

  test("should validate valid role strings", () => {
    const result = Role.type("chief");
    expect(result).toBe("chief");
  });

  test("should reject invalid role strings", () => {
    const { ArkErrors } = require("arktype");
    const result = Role.type("invalid");
    expect(result instanceof ArkErrors).toBe(true);
  });
});
