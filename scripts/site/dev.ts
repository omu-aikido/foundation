/// <reference types="bun" />

import { resolve } from "node:path";
import { decryptEnvFiles, siteEnvTargets } from "../env";

await decryptEnvFiles({ onlyMissing: true, targets: siteEnvTargets });

const child = Bun.spawn(["bun", "run", "dev", ...process.argv.slice(2)], {
  cwd: resolve(import.meta.dir, "../../apps/site"),
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

process.once("SIGINT", () => child.kill("SIGINT"));
process.once("SIGTERM", () => child.kill("SIGTERM"));
process.exit(await child.exited);
