import { describe, expect, test } from "bun:test";
import { platformEnvTargets, selectEnvTargets, siteEnvTargets } from "./env";

const missingPath = "/tmp/foundation-env-test-missing";

describe("environment targets", () => {
  test("uses development-scoped encrypted files and recipient configuration", () => {
    expect(platformEnvTargets.map((target) => target.encrypted)).toEqual([
      expect.stringContaining("secrets/development/platform/client.env.age"),
      expect.stringContaining("secrets/development/platform/server.env.age"),
      expect.stringContaining("secrets/development/platform/e2e.env.age"),
    ]);
    expect(siteEnvTargets[0]?.encrypted).toContain("secrets/development/site/site.env.age");
    expect(
      new Set([...platformEnvTargets, ...siteEnvTargets].map((target) => target.recipients)),
    ).toEqual(new Set([expect.stringContaining("secrets/development/recipients")]));
  });

  test("skips an absent optional site file", async () => {
    const selected = await selectEnvTargets("decrypt", {
      targets: [
        { encrypted: missingPath, plaintext: missingPath, recipients: missingPath, optional: true },
      ],
    });
    expect(selected).toEqual([]);
  });

  test("rejects a missing required encrypted file", () =>
    expect(
      selectEnvTargets("decrypt", {
        targets: [{ encrypted: missingPath, plaintext: missingPath, recipients: missingPath }],
      }),
    ).rejects.toThrow("Encrypted environment file not found"));
});
