/// <reference types="bun" />

import { resolve } from "node:path";
import { decryptEnvFiles, encryptEnvFiles, type EnvTarget } from "../../scripts/env";

const root = resolve(import.meta.dir, "../..");
const recipients = resolve(import.meta.dir, "recipients");

export const platformEnvTargets: readonly EnvTarget[] = [
  {
    encrypted: resolve(root, "secrets/development/platform/client.env.age"),
    plaintext: resolve(root, "apps/platform/client/.env"),
    recipients,
    expectedVariables: ["VITE_CLERK_PUBLISHABLE_KEY"],
  },
  {
    encrypted: resolve(root, "secrets/development/platform/server.env.age"),
    plaintext: resolve(root, "apps/platform/server/.env"),
    recipients,
    expectedVariables: [
      "CLERK_AUTHORIZED_PARTIES",
      "CLERK_FRONTEND_API_URL",
      "CLERK_PUBLISHABLE_KEY",
      "CLERK_SECRET_KEY",
      "CLERK_WEBHOOK_SECRET",
      "TURSO_AUTH_TOKEN",
      "TURSO_DATABASE_URL",
    ],
  },
  {
    encrypted: resolve(root, "secrets/development/platform/e2e.env.age"),
    plaintext: resolve(root, "apps/platform/tests/e2e/.env"),
    recipients,
    expectedVariables: [
      "E2E_EMAIL",
      "E2E_FIRSTNAME",
      "E2E_LASTNAME",
      "E2E_PASSWORD",
      "E2E_USERNAME",
    ],
  },
];

export const siteEnvTargets: readonly EnvTarget[] = [
  {
    encrypted: resolve(root, "secrets/development/site/site.env.age"),
    plaintext: resolve(root, "apps/site/.env"),
    recipients,
    expectedVariables: [
      "CF_TURNSTILE_SECRETKEY",
      "DISCORD_WEBHOOK_URL",
      "PUBLIC_CF_TURNSTILE_SITEKEY",
    ],
  },
];

async function main(): Promise<void> {
  const command = process.argv[2];
  const targets = [...platformEnvTargets, ...siteEnvTargets];
  if (command === "decrypt") {
    await decryptEnvFiles(targets);
    return;
  }
  if (command === "encrypt") {
    await encryptEnvFiles(targets);
    return;
  }

  throw new Error("Usage: bun secrets/development/targets.ts <encrypt|decrypt>");
}

if (import.meta.main) {
  await main();
}
