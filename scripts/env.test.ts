import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { encryptEnvFiles, selectEnvTargets, type EnvTarget } from "./env";

const missingPath = "/tmp/foundation-env-test-missing";
const missingTarget: EnvTarget = {
  encrypted: missingPath,
  plaintext: missingPath,
  recipients: missingPath,
  expectedVariables: [],
};

describe("environment target selection", () => {
  test("skips an absent optional target during decryption", async () => {
    const selected = await selectEnvTargets("decrypt", [{ ...missingTarget, optional: true }]);
    expect(selected).toEqual([]);
  });

  test("rejects a missing required encrypted file", async () => {
    expect(selectEnvTargets("decrypt", [missingTarget])).rejects.toThrow(
      "Encrypted environment file not found",
    );
  });

  test("rejects invalid plaintext keys before running age", async () => {
    const directory = await mkdtemp(join(tmpdir(), "foundation-env-test-"));
    const plaintext = join(directory, "plaintext.env");
    const ageMarker = join(directory, "age-was-run");
    const target: EnvTarget = {
      encrypted: join(directory, "encrypted.age"),
      plaintext,
      recipients: join(directory, "recipients"),
      expectedVariables: ["EXPECTED_KEY"],
    };

    try {
      await writeFile(plaintext, "UNEXPECTED_KEY=value\\n");
      expect(await readFile(plaintext, "utf8")).toBe("UNEXPECTED_KEY=value\\n");
      const originalPath = process.env.PATH;
      process.env.PATH = directory;
      await writeFile(join(directory, "age"), `#!/bin/sh\\ntouch '${ageMarker}'\\n`);
      const { chmod } = await import("node:fs/promises");
      await chmod(join(directory, "age"), 0o755);
      try {
        expect(encryptEnvFiles([target])).rejects.toThrow("Environment variables in");
        expect(await Bun.file(ageMarker).exists()).toBe(false);
      } finally {
        if (originalPath === undefined) delete process.env.PATH;
        else process.env.PATH = originalPath;
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("selects only explicitly provided targets", async () => {
    const selected = await selectEnvTargets("decrypt", []);
    expect(selected).toEqual([]);
  });
});
