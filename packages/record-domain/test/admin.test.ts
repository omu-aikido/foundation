import { AdminUser } from "../index";
import { ArkErrors } from "arktype";
import { describe, expect, test } from "bun:test";

function isValid(result: unknown): boolean {
  return !(result instanceof ArkErrors);
}

describe("AdminUser: full and nullable profiles", () => {
  test("should accept valid full object with nested profile", () => {
    const result = AdminUser({
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      imageUrl: "https://example.com/image.png",
      emailAddress: "john@example.com",
      profile: {
        role: "admin",
        roleLabel: "管理者",
        grade: 3,
        gradeLabel: "三級",
        year: "b1",
        yearLabel: "1回生",
        joinedAt: 2024,
        getGradeAt: "2024-01-01",
        birthday: "2001-02-03",
      },
    });
    expect(isValid(result)).toBe(true);
  });

  test("should accept null for firstName and lastName", () => {
    const result = AdminUser({
      id: "user_123",
      firstName: null,
      lastName: null,
      imageUrl: "https://example.com/image.png",
      emailAddress: null,
      profile: {
        role: "member",
        roleLabel: "部員",
        grade: 0,
        gradeLabel: "無級",
        year: "b1",
        yearLabel: "1回生",
        joinedAt: null,
        getGradeAt: null,
        birthday: null,
      },
    });
    expect(isValid(result)).toBe(true);
  });
});

describe("AdminUser: norm summary", () => {
  test("should accept optional norm summary in profile", () => {
    const result = AdminUser({
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      imageUrl: "https://example.com/image.png",
      emailAddress: "john@example.com",
      profile: {
        role: "member",
        roleLabel: "部員",
        grade: 0,
        gradeLabel: "無級",
        year: "b1",
        yearLabel: "1回生",
        joinedAt: 2024,
        getGradeAt: "2024-01-01",
        birthday: "2001-02-03",
        norm: {
          current: 12,
          required: 20,
          progress: 60,
          isMet: false,
        },
      },
    });
    expect(isValid(result)).toBe(true);
  });
});

describe("AdminUser: required fields", () => {
  test("should reject missing required fields", () => {
    const result = AdminUser({
      firstName: "John",
      lastName: "Doe",
      imageUrl: "https://example.com/image.png",
      emailAddress: "john@example.com",
      profile: {
        role: "admin",
        roleLabel: "管理者",
        grade: 3,
        gradeLabel: "三級",
        year: "b1",
        yearLabel: "1回生",
        joinedAt: 2024,
        getGradeAt: "2024-01-01",
        birthday: "2001-02-03",
      },
    });
    expect(isValid(result)).toBe(false);
  });

  test("should reject missing profile", () => {
    const result = AdminUser({
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      imageUrl: "https://example.com/image.png",
      emailAddress: "john@example.com",
    });
    expect(isValid(result)).toBe(false);
  });
});

describe("AdminUser: invalid profile", () => {
  test("should reject invalid types in profile", () => {
    const result = AdminUser({
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      imageUrl: "https://example.com/image.png",
      emailAddress: "john@example.com",
      profile: {
        role: 123,
        roleLabel: "管理者",
        grade: "three",
        gradeLabel: "三級",
        year: "b1",
        yearLabel: "1回生",
        joinedAt: "2024",
        getGradeAt: "2024-01-01",
        birthday: "2001-02-03",
      },
    });
    expect(isValid(result)).toBe(false);
  });
});

describe("AdminUser: invalid identifiers and images", () => {
  test("should reject invalid id type", () => {
    const result = AdminUser({
      id: 123,
      firstName: "John",
      lastName: "Doe",
      imageUrl: "https://example.com/image.png",
      emailAddress: "john@example.com",
      profile: {
        role: "admin",
        roleLabel: "管理者",
        grade: 3,
        gradeLabel: "三級",
        year: "b1",
        yearLabel: "1回生",
        joinedAt: 2024,
        getGradeAt: "2024-01-01",
        birthday: "2001-02-03",
      },
    });
    expect(isValid(result)).toBe(false);
  });

  test("should reject invalid imageUrl type", () => {
    const result = AdminUser({
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      imageUrl: 123,
      emailAddress: "john@example.com",
      profile: {
        role: "admin",
        roleLabel: "管理者",
        grade: 3,
        gradeLabel: "三級",
        year: "b1",
        yearLabel: "1回生",
        joinedAt: 2024,
        getGradeAt: "2024-01-01",
        birthday: "2001-02-03",
      },
    });
    expect(isValid(result)).toBe(false);
  });
});
