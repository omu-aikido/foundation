import { describe, expect, it } from "bun:test";

import { securityHeaders } from "../security-headers";

describe("site security headers", () => {
  it("allows inline Nuxt hydration while excluding eval and irrelevant worker sources", () => {
    const directives = Object.fromEntries(
      securityHeaders["Content-Security-Policy"].split("; ").map((directive) => {
        const [name, ...sources] = directive.split(" ");
        return [name, sources];
      }),
    );

    expect(directives["script-src"]).toContain("'unsafe-inline'");
    expect(directives["script-src"]).not.toContain("'unsafe-eval'");
    expect(directives["worker-src"]).toEqual(["'self'", "https://challenges.cloudflare.com"]);
    expect(directives["worker-src"]).not.toContain("'unsafe-inline'");
    expect(directives["worker-src"]).not.toContain("'unsafe-eval'");
  });
});
