import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

import type CFType from "../cloudflare.config";

type SiteCloudflareConfig = typeof CFType;
export type CloudflareBuildConfig = Omit<SiteCloudflareConfig, "worker"> & {
  worker: Omit<SiteCloudflareConfig["worker"], "entrypoint"> & { entrypoint: string };
};

type BuildOutputOptions = {
  preset: string;
  rootDir: string;
  serverDir: string;
  publicDir: string;
  config: CloudflareBuildConfig;
  assetHeaders: Record<string, string>;
};

export async function writeCloudflareBuildOutput({
  preset,
  rootDir,
  serverDir,
  publicDir,
  config,
  assetHeaders,
}: BuildOutputOptions): Promise<void> {
  if (preset !== "cloudflare_module" && preset !== "cloudflare-module") return;

  const { worker, ...settings } = config;
  const { entrypoint, ...workerConfig } = worker;
  const absoluteRoot = resolve(rootDir);
  const absoluteServerDir = resolve(serverDir);
  const absolutePublicDir = resolve(publicDir);
  const entrypointPath = resolve(absoluteRoot, entrypoint);
  const mainModule = relative(absoluteServerDir, entrypointPath);

  if (
    !mainModule ||
    isAbsolute(mainModule) ||
    mainModule === ".." ||
    mainModule.startsWith(`..${sep}`)
  ) {
    throw new Error(
      `Cloudflare worker entrypoint must be inside Nitro's server output: ${entrypoint} (resolved to ${entrypointPath}; server output: ${absoluteServerDir})`,
    );
  }

  try {
    await access(entrypointPath);
    await access(absolutePublicDir);
  } catch {
    throw new Error(
      "Nitro server entrypoint and public assets must exist before writing Cloudflare Build Output",
    );
  }

  const outputDir = join(absoluteRoot, ".cloudflare/output/v0");
  const workerDir = join(outputDir, "workers/default");
  const bundleDir = join(workerDir, "bundle");
  const assetsDir = join(workerDir, "assets");

  await rm(outputDir, { recursive: true, force: true });
  await Promise.all([mkdir(bundleDir, { recursive: true }), mkdir(assetsDir, { recursive: true })]);

  const headersFile = [
    "/*",
    ...Object.entries(assetHeaders).map(([name, value]) => `  ${name}: ${value}`),
    "",
    "/llms*.txt",
    "  Content-Type: text/plain; charset=utf-8",
    "",
    "/licenses.txt",
    "  Content-Type: text/plain; charset=utf-8",
    "",
  ].join("\n");

  await writeFile(join(absolutePublicDir, "_headers"), headersFile);

  await Promise.all([
    cp(absoluteServerDir, bundleDir, { recursive: true }),
    cp(absolutePublicDir, assetsDir, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(
      join(outputDir, "config.json"),
      JSON.stringify({ ...settings, buildContext: { isPreview: false } }),
    ),
    writeFile(
      join(workerDir, "worker.config.json"),
      JSON.stringify({
        ...workerConfig,
        manifest: { type: "partial", mainModule, modules: {} },
      }),
    ),
  ]);
}
