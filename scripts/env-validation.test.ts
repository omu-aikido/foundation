import { describe, expect, test } from "bun:test";
import { validateEnv, type EnvTarget } from "./env";

const target: EnvTarget = {
  encrypted: "test.env.age",
  plaintext: "test.env",
  recipients: "recipients",
  expectedVariables: ["FIRST_KEY", "SECOND_KEY"],
};

describe("environment key validation", () => {
  test("accepts an exact key set and dotenv comments, quotes, and export", () => {
    expect(() =>
      validateEnv(target, `# comment\nexport FIRST_KEY='first value'\nSECOND_KEY="second value"`),
    ).not.toThrow();
  });

  test("reports missing keys without exposing values", () => {
    let error = "";
    try {
      validateEnv(target, "FIRST_KEY=secret-value");
    } catch (cause) {
      error = (cause as Error).message;
    }
    expect(error).toContain("missing: SECOND_KEY");
    expect(error).not.toContain("secret-value");
  });

  test("reports unexpected keys without exposing values", () => {
    let error = "";
    try {
      validateEnv(target, "FIRST_KEY=secret-value\nSECOND_KEY=another-secret\nEXTRA_KEY=hidden");
    } catch (cause) {
      error = (cause as Error).message;
    }
    expect(error).toContain("unexpected: EXTRA_KEY");
    expect(error).not.toContain("secret-value");
    expect(error).not.toContain("another-secret");
  });
});
