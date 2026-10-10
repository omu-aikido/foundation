import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { build, type Plugin } from "vite";
import { bundledLicenseListPlugin } from "../index";

const tempDirs: string[] = [];

async function makeFixture() {
  const root = await mkdtemp(join(tmpdir(), "third-party-licenses-"));
  tempDirs.push(root);
  const dependencyDir = join(root, "node_modules", "fixture-dependency");
  await Bun.write(
    join(dependencyDir, "package.json"),
    JSON.stringify({ name: "fixture-dependency", version: "1.2.3", license: "MIT" }),
  );
  await Bun.write(
    join(dependencyDir, "index.js"),
    'export const fixtureValue = "bundled dependency";',
  );
  await Bun.write(join(dependencyDir, "LICENSE"), "Fixture dependency license text.");
  await Bun.write(
    join(root, "index.js"),
    'import { fixtureValue } from "fixture-dependency"; console.log(fixtureValue);',
  );
  await Bun.write(join(root, "index.html"), '<script type="module" src="/index.js"></script>');
  return root;
}

async function buildFixture(
  root: string,
  outDir: string,
  plugin: Plugin,
  write = true,
  ssr?: string,
) {
  let output: Record<string, { type: string; source?: string }> = {};
  const capture: Plugin = {
    name: "capture-final-bundle",
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        output = Object.fromEntries(
          Object.entries(bundle).map(([name, item]) => [
            name,
            item.type === "asset"
              ? { type: item.type, source: String(item.source) }
              : { type: item.type },
          ]),
        );
      },
    },
  };
  await build({
    configFile: false,
    root,
    logLevel: "silent",
    plugins: [plugin, capture],
    build: { outDir, emptyOutDir: true, write, ...(ssr ? { ssr } : {}) },
  });
  return output;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("bundledLicenseListPlugin", () => {
  test.each([
    [undefined, "licenses.txt"],
    ["legal/custom.txt", "legal/custom.txt"],
  ] as const)("emits %s as an output asset", async (fileName, expectedPath) => {
    const root = await makeFixture();
    const output = await buildFixture(
      root,
      join(root, "dist"),
      bundledLicenseListPlugin(fileName ? { fileName } : undefined),
      false,
    );
    expect(output[expectedPath]?.source).toContain("fixture-dependency@1.2.3");
    expect(Object.keys(output)).not.toContain(".license-report.json");
  });

  test("writes independent client and SSR reports without internal JSON", async () => {
    const root = await makeFixture();
    for (const ssr of [undefined, join(root, "index.js")]) {
      const outDir = join(root, ssr ? "server" : "client");
      const output = await buildFixture(root, outDir, bundledLicenseListPlugin(), true, ssr);
      const report = await readFile(join(outDir, "licenses.txt"), "utf8");
      expect(report).toContain("Third-party dependency licenses");
      if (!ssr) expect(report).toContain("fixture-dependency@1.2.3");
      expect(Object.keys(output)).not.toContain(".license-report.json");
      expect(await readdir(outDir)).not.toContain(".license-report.json");
    }
  });
});
