import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

type BundledLicense = {
  name: string;
  version: string;
  identifier?: string;
  text?: string;
};

type ResolvedViteConfig = {
  build: { outDir: string; ssr?: boolean | string | string[] };
};

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const reportFileName = ".license-report.json";

export function bundledLicenseListPlugin() {
  let serverConfig: ResolvedViteConfig | undefined;

  return {
    name: "bundled-license-list",
    apply: "build" as const,
    configResolved(config: ResolvedViteConfig) {
      if (config.build.ssr) serverConfig = config;
    },
    async closeBundle() {
      if (!serverConfig) return;

      const serverOutput = serverConfig.build.outDir;
      const reports = [
        {
          bundle: "client",
          path: join(dirname(serverOutput), "client", reportFileName),
        },
        { bundle: "server", path: join(serverOutput, reportFileName) },
      ];
      const licensesByBundle = await Promise.all(
        reports.map(async ({ bundle, path }) => ({
          bundle,
          licenses: JSON.parse(await readFile(path, "utf8")) as BundledLicense[],
        })),
      );
      const licenses = new Map<string, BundledLicense & { bundles: string[] }>();

      for (const { bundle, licenses: bundleLicenses } of licensesByBundle) {
        for (const license of bundleLicenses) {
          const key = `${license.name}@${license.version}`;
          const existing = licenses.get(key) ?? {
            ...license,
            bundles: [],
          };
          if (!existing.bundles.includes(bundle)) {
            existing.bundles.push(bundle);
          }
          if (!existing.identifier && license.identifier) {
            existing.identifier = license.identifier;
          }
          if (!existing.text && license.text) existing.text = license.text;
          licenses.set(key, existing);
        }
      }

      const sections = [...licenses.values()]
        .sort(
          (left, right) =>
            left.name.localeCompare(right.name) || left.version.localeCompare(right.version),
        )
        .map(({ name, version, identifier, text, bundles }) =>
          [
            `=== ${name}@${version} ===`,
            `License: ${identifier ?? "Not specified"}`,
            `Included in: ${bundles.join(", ")}`,
            "",
            text ?? "No license text found in the package.",
            "",
          ].join("\n"),
        );
      const output = [
        "Third-party dependency licenses",
        "",
        "Packages bundled by Vite in the client and server builds.",
        "",
        ...(sections.length ? sections : ["No dependencies were bundled."]),
      ].join("\n");

      await mkdir(join(projectRoot, "public"), { recursive: true });
      await writeFile(join(projectRoot, "public/licenses.txt"), output);
      await Promise.all(reports.map(({ path }) => rm(path, { force: true })));
    },
  };
}
