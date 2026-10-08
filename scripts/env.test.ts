import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "bun:test";
import { basename, join, resolve } from "node:path";
import {
  decryptEnvFiles,
  type EnvTarget,
  platformEnvTargets,
  selectEnvTargets,
  siteEnvTargets,
} from "./env";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";

let temporaryDirectory: string | undefined;

afterEach(async () => {
  if (temporaryDirectory !== undefined) {
    await rm(temporaryDirectory, { recursive: true, force: true });
    temporaryDirectory = undefined;
  }
});

describe("startup environment targets", () => {
  it("limits platform startup targets to required client, server, and e2e files", () => {
    expect(platformEnvTargets.map((target) => basename(target.encrypted))).toEqual([
      "client.env.age",
      "server.env.age",
      "e2e.env.age",
    ]);
    const root = resolve(import.meta.dir, "..");
    expect(platformEnvTargets.map((target) => target.encrypted)).toEqual([
      join(root, "secrets/platform/client.env.age"),
      join(root, "secrets/platform/server.env.age"),
      join(root, "secrets/platform/e2e.env.age"),
    ]);
    expect(platformEnvTargets.map((target) => target.plaintext)).toEqual([
      join(root, "apps/platform/client/.env"),
      join(root, "apps/platform/server/.env"),
      join(root, "e2e/.env"),
    ]);
    expect(platformEnvTargets.every((target) => !target.optional)).toBe(true);
  });

  it("limits site startup to the configured optional site paths", () => {
    const root = resolve(import.meta.dir, "..");
    expect(siteEnvTargets).toEqual([
      {
        encrypted: join(root, "secrets/site/site.env.age"),
        plaintext: join(root, "apps/site/.env"),
        optional: true,
      },
    ]);
    expect(siteEnvTargets.some((target) => platformEnvTargets.includes(target))).toBe(false);
  });

  it("selects missing site plaintext with onlyMissing and preserves existing plaintext", async () => {
    const directory = await mkdtemp(join(tmpdir(), "foundation-env-test-"));
    temporaryDirectory = directory;
    const targets = siteEnvTargets.map((target) => ({
      ...target,
      encrypted: join(directory, basename(target.encrypted)),
      plaintext: join(directory, "site.env"),
    }));
    const target = targets[0]!;
    await writeFile(target.encrypted, "not-real-ciphertext");
    expect(await selectEnvTargets("decrypt", { onlyMissing: true, targets })).toEqual(targets);
    await writeFile(target.plaintext, "test-only-site-value");
    expect(await selectEnvTargets("decrypt", { onlyMissing: true, targets })).toEqual([]);
    await decryptEnvFiles({ onlyMissing: true, targets });
    expect(await readFile(target.plaintext, "utf8")).toBe("test-only-site-value");
    expect(await selectEnvTargets("decrypt", { targets })).toEqual(targets);
  });
});

describe("decryptEnvFiles", () => {
  it("skips an absent optional site without accessing an identity or running age", async () => {
    const directory = await mkdtemp(join(tmpdir(), "foundation-env-test-"));
    temporaryDirectory = directory;
    const targets: EnvTarget[] = [
      {
        encrypted: join(directory, "site.env.age"),
        plaintext: join(directory, "site.env"),
        optional: true,
      },
    ];
    expect(await selectEnvTargets("decrypt", { targets })).toEqual([]);
    expect(await selectEnvTargets("encrypt", { targets })).toEqual([]);
    await decryptEnvFiles({ targets });
  });

  it("selects optional site inputs separately for encryption and decryption", async () => {
    const directory = await mkdtemp(join(tmpdir(), "foundation-env-test-"));
    temporaryDirectory = directory;
    const target: EnvTarget = {
      encrypted: join(directory, "site.env.age"),
      plaintext: join(directory, "site.env"),
      optional: true,
    };
    const options = { targets: [target] };
    // Synthetic fixtures only: neither operation invokes age.
    await writeFile(target.plaintext, "test-only-value");
    expect(await selectEnvTargets("encrypt", options)).toEqual([target]);
    expect(await selectEnvTargets("decrypt", options)).toEqual([]);
    await writeFile(target.encrypted, "not-real-ciphertext");
    expect(await selectEnvTargets("decrypt", options)).toEqual([target]);
    expect(await selectEnvTargets("decrypt", { ...options, onlyMissing: true })).toEqual([]);
  });

  it("rejects missing required inputs before identity lookup or age execution", async () => {
    const directory = await mkdtemp(join(tmpdir(), "foundation-env-test-"));
    temporaryDirectory = directory;
    const targets: EnvTarget[] = [
      {
        encrypted: join(directory, "required.env.age"),
        plaintext: join(directory, "required.env"),
      },
    ];
    expect(decryptEnvFiles({ targets })).rejects.toThrow("Encrypted environment file not found:");
    expect(selectEnvTargets("encrypt", { targets })).rejects.toThrow(
      "Plain environment file not found:",
    );
  });

  it("preserves existing plaintext files without requiring an AGE identity", async () => {
    const directory = await mkdtemp(join(tmpdir(), "foundation-env-test-"));
    temporaryDirectory = directory;
    const targets: EnvTarget[] = platformEnvTargets.map((target) => ({
      encrypted: join(directory, basename(target.encrypted)),
      plaintext: join(directory, `${basename(target.encrypted, ".env.age")}.env`),
    }));
    const originalIdentity = process.env.AGE_IDENTITY_FILE;

    await Promise.all(targets.map(({ plaintext }) => writeFile(plaintext, "test-only-value")));
    process.env.AGE_IDENTITY_FILE = join(directory, "missing-identity");

    try {
      await decryptEnvFiles({ onlyMissing: true, targets });
    } finally {
      if (originalIdentity === undefined) {
        delete process.env.AGE_IDENTITY_FILE;
      } else {
        process.env.AGE_IDENTITY_FILE = originalIdentity;
      }
    }

    expect(await Promise.all(targets.map(({ plaintext }) => readFile(plaintext, "utf8")))).toEqual([
      "test-only-value",
      "test-only-value",
      "test-only-value",
    ]);
  });
});
