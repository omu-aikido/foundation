import { afterEach, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import cloudflareConfig from "../cloudflare.config";
import { writeCloudflareBuildOutput } from "../nitro/cloudflare-build-output";

const temporaryDirectories: string[] = [];
const assetHeaders = {
  "Content-Security-Policy": "default-src 'self'",
  "X-Content-Type-Options": "nosniff",
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function createBuildDirectories() {
  const rootDir = await mkdtemp(join(tmpdir(), "site-cloudflare-output-"));
  temporaryDirectories.push(rootDir);
  const serverDir = join(rootDir, ".output/server");
  const publicDir = join(rootDir, ".output/public");
  await mkdir(serverDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });
  await writeFile(join(serverDir, "index.mjs"), "export default {};\n");
  await writeFile(join(publicDir, "index.html"), "<!doctype html>\n");
  return { rootDir, serverDir, publicDir };
}

describe("Cloudflare Build Output", () => {
  it("writes a Build Output v0 worker bundle and static assets from the Nitro output", async () => {
    const directories = await createBuildDirectories();

    await writeCloudflareBuildOutput({
      ...directories,
      preset: "cloudflare-module",
      config: cloudflareConfig,
      assetHeaders,
    });

    const outputDir = join(directories.rootDir, ".cloudflare/output/v0");
    const assetHeaderFile = await readFile(
      join(outputDir, "workers/default/assets/_headers"),
      "utf8",
    );
    expect(assetHeaderFile).toContain("Content-Security-Policy: default-src 'self'");
    expect(assetHeaderFile).toContain("X-Content-Type-Options: nosniff");
    const rootConfig = JSON.parse(await readFile(join(outputDir, "config.json"), "utf8"));
    const workerConfig = JSON.parse(
      await readFile(join(outputDir, "workers/default/worker.config.json"), "utf8"),
    );

    expect(rootConfig.buildContext).toEqual({ isPreview: false });
    expect(workerConfig.name).toBe("page");
    expect(workerConfig.domains).toEqual(["omu-aikido.com"]);
    expect(workerConfig.entrypoint).toBeUndefined();
    expect(workerConfig.manifest).toEqual({
      type: "partial",
      mainModule: "index.mjs",
      modules: {},
    });
    expect(workerConfig.env).toHaveProperty("CF_TURNSTILE_SECRETKEY");
    expect(await readFile(join(outputDir, "workers/default/bundle/index.mjs"), "utf8")).toContain(
      "export default",
    );
    expect(await readFile(join(outputDir, "workers/default/assets/index.html"), "utf8")).toContain(
      "<!doctype html>",
    );
  });

  it("skips Nitro prerender builds", async () => {
    const directories = await createBuildDirectories();

    await writeCloudflareBuildOutput({
      ...directories,
      preset: "nitro-prerender",
      config: cloudflareConfig,
      assetHeaders,
    });

    expect(
      readFile(join(directories.rootDir, ".cloudflare/output/v0/config.json"), "utf8"),
    ).rejects.toThrow();
  });

  it("rejects a worker entrypoint outside Nitro's server output", async () => {
    const directories = await createBuildDirectories();
    const config = {
      ...cloudflareConfig,
      worker: {
        ...cloudflareConfig.worker,
        entrypoint: "../outside/index.mjs",
      },
    };

    expect(
      writeCloudflareBuildOutput({
        ...directories,
        preset: "cloudflare-module",
        config,
        assetHeaders,
      }),
    ).rejects.toThrow("Cloudflare worker entrypoint must be inside Nitro's server output");
  });
});
