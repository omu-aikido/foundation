import type { Plugin } from "vite";

export interface BundledLicenseListOptions {
  /** Output path relative to Vite's build output directory. */
  fileName?: string;
}

const reportFileName = ".license-report.json";

export function bundledLicenseListPlugin({
  fileName = "licenses.txt",
}: BundledLicenseListOptions = {}): Plugin {
  return {
    name: "bundled-license-list",
    apply: "build",
    config: {
      order: "post",
      handler() {
        return { build: { license: { fileName: reportFileName } } };
      },
    },
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const report = bundle[reportFileName];
        if (!report || report.type !== "asset") return;

        const licenses = JSON.parse(String(report.source)) as BundledLicense[];
        this.emitFile({
          type: "asset",
          fileName,
          source: renderLicenseReport(licenses),
        });
        delete bundle[reportFileName];
      },
    },
  };
}

type BundledLicense = {
  name: string;
  version: string;
  identifier?: string;
  text?: string;
};

function renderLicenseReport(licenses: BundledLicense[]): string {
  const sections = [...licenses]
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name) || left.version.localeCompare(right.version),
    )
    .map(({ name, version, identifier, text }) =>
      [
        `=== ${name}@${version} ===`,
        `License: ${identifier ?? "Not specified"}`,
        "",
        text ?? "No license text found in the package.",
        "",
      ].join("\n"),
    );

  return [
    "Third-party dependency licenses",
    "",
    "Packages bundled by Vite in this build.",
    "",
    ...(sections.length ? sections : ["No dependencies were bundled."]),
  ].join("\n");
}
