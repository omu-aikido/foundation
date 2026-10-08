import { ArkErrors } from "arktype";
import { AccountInfo, AccountMetadata, formatDateSlash, isProfileComplete } from "../index";
import { describe, expect, test } from "bun:test";

function isValid(result: unknown): boolean {
  return !(result instanceof ArkErrors);
}

describe("AccountMetadata: full profiles", () => {
  test("should accept valid full object", () => {
    const result = AccountMetadata({
      role: "admin",
      grade: 3,
      getGradeAt: "2024-01-01",
      joinedAt: 2024,
      year: "b1",
      birthday: "2001-02-03",
    });
    expect(isValid(result)).toBe(true);
  });

  test("should accept valid string grade", () => {
    const result = AccountMetadata({
      role: "member",
      grade: "2",
      getGradeAt: null,
      joinedAt: "2024",
      year: "m1",
      birthday: "2001-02-03",
    });
    expect(isValid(result)).toBe(true);
  });
});

describe("AccountMetadata: grades", () => {
  test("should accept valid numeric grade within range", () => {
    expect(
      isValid(
        AccountMetadata({
          role: "member",
          grade: -5,
          getGradeAt: null,
          joinedAt: 2024,
          year: "b1",
          birthday: null,
        }),
      ),
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({
          role: "member",
          grade: 5,
          getGradeAt: null,
          joinedAt: 2024,
          year: "b1",
          birthday: "",
        }),
      ),
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({
          role: "member",
          grade: 0,
          getGradeAt: null,
          joinedAt: 2024,
          year: "b1",
          birthday: "2001-02-03",
        }),
      ),
    ).toBe(true);
  });
});

describe("AccountMetadata: years and roles", () => {
  test.each(["b1", "b4", "m1", "m2", "d1", "d2"])("should accept valid year %s", (year) => {
    expect(
      isValid(
        AccountMetadata({
          role: "member",
          grade: 0,
          getGradeAt: null,
          joinedAt: 2024,
          year,
          birthday: null,
        }),
      ),
    ).toBe(true);
  });

  test.each(["admin", "captain", "vice-captain", "treasurer", "member"])(
    "should accept valid role %s",
    (role) => {
      expect(
        isValid(
          AccountMetadata({
            role,
            grade: 0,
            getGradeAt: null,
            joinedAt: 2024,
            year: "b1",
            birthday: null,
          }),
        ),
      ).toBe(true);
    },
  );
});

describe("AccountMetadata: optional profile fields", () => {
  test("should accept getGradeAt as null or empty string", () => {
    expect(
      isValid(
        AccountMetadata({
          role: "member",
          grade: 0,
          getGradeAt: null,
          joinedAt: 2024,
          year: "b1",
          birthday: null,
        }),
      ),
    ).toBe(true);
    expect(
      isValid(
        AccountMetadata({
          role: "member",
          grade: 0,
          getGradeAt: "",
          joinedAt: 2024,
          year: "b1",
          birthday: null,
        }),
      ),
    ).toBe(true);
  });

  test("should accept getGradeAt as valid date string", () => {
    const result = AccountMetadata({
      role: "member",
      grade: 0,
      getGradeAt: "2024-06-15",
      joinedAt: 2024,
      year: "b1",
      birthday: "2001-02-03",
    });
    expect(isValid(result)).toBe(true);
  });

  test("should accept missing birthday and missing profile fields for existing users", () => {
    const result = AccountMetadata({
      role: "member",
      grade: null,
      getGradeAt: null,
      joinedAt: null,
      year: "",
      birthday: "",
    });
    expect(isValid(result)).toBe(true);
  });
});

describe("AccountMetadata: invalid birthday and role", () => {
  test("should reject invalid birthday format", () => {
    const result = AccountMetadata({
      role: "member",
      grade: 0,
      getGradeAt: null,
      joinedAt: 2024,
      year: "b1",
      birthday: "2001/02/03",
    });
    expect(isValid(result)).toBe(false);
  });

  test("should reject invalid role", () => {
    const result = AccountMetadata({
      role: "invalid",
      grade: 0,
      getGradeAt: null,
      joinedAt: 2024,
      year: "b1",
      birthday: null,
    });
    expect(isValid(result)).toBe(false);
  });
});

describe("AccountMetadata: invalid year and joining date", () => {
  test("should reject invalid year format", () => {
    const result = AccountMetadata({
      role: "member",
      grade: 0,
      getGradeAt: null,
      joinedAt: 2024,
      year: "x5",
      birthday: null,
    });
    expect(isValid(result)).toBe(false);
  });

  test("should reject invalid joinedAt (out of range)", () => {
    const result = AccountMetadata({
      role: "member",
      grade: 0,
      getGradeAt: null,
      joinedAt: 2019,
      year: "b1",
      birthday: null,
    });
    expect(isValid(result)).toBe(false);
  });
});

describe("AccountMetadata: invalid grades", () => {
  test("should reject grade out of range", () => {
    expect(
      isValid(
        AccountMetadata({
          role: "member",
          grade: 6,
          getGradeAt: null,
          joinedAt: 2024,
          year: "b1",
          birthday: null,
        }),
      ),
    ).toBe(false);
    expect(
      isValid(
        AccountMetadata({
          role: "member",
          grade: -6,
          getGradeAt: null,
          joinedAt: 2024,
          year: "b1",
          birthday: null,
        }),
      ),
    ).toBe(false);
  });
});

describe("profile helpers", () => {
  test("isProfileComplete returns true when required fields exist", () => {
    expect(
      isProfileComplete({
        role: "member",
        grade: 0,
        getGradeAt: null,
        joinedAt: 2024,
        year: "b1",
        birthday: "2001-02-03",
      }),
    ).toBe(true);
  });

  test("isProfileComplete returns false when birthday is missing", () => {
    expect(
      isProfileComplete({
        role: "member",
        grade: 0,
        getGradeAt: null,
        joinedAt: 2024,
        year: "b1",
        birthday: "",
      }),
    ).toBe(false);
  });

  test("formatDateSlash converts profile dates for display", () => {
    expect(formatDateSlash("2001-02-03")).toBe("2001/02/03");
    expect(formatDateSlash("2001-02-03T09:30:00Z")).toBe("2001/02/03");
    expect(formatDateSlash("invalid-date")).toBe("-");
    expect(formatDateSlash(null)).toBe("-");
  });
});

describe("AccountInfo", () => {
  test("should accept valid full object", () => {
    const result = AccountInfo({
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      profileImage: "https://example.com/image.png",
    });
    expect(isValid(result)).toBe(true);
  });

  test("should accept empty object", () => {
    const result = AccountInfo({});
    expect(isValid(result)).toBe(true);
  });

  test("should accept partial fields", () => {
    expect(isValid(AccountInfo({ firstName: "John" }))).toBe(true);
    expect(isValid(AccountInfo({ lastName: "Doe" }))).toBe(true);
    expect(isValid(AccountInfo({ username: "johndoe" }))).toBe(true);
  });

  test("should accept undefined values for optional fields", () => {
    expect(isValid(AccountInfo({ firstName: undefined }))).toBe(true);
  });

  test("should reject null values for optional string fields", () => {
    expect(isValid(AccountInfo({ firstName: null }))).toBe(false);
  });
});
