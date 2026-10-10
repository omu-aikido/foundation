/// <reference types="bun" />

import { homedir } from "node:os";
import { chmod, mkdir, rename, rm, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

export type EnvTarget = {
  encrypted: string;
  plaintext: string;
  recipients: string;
  optional?: boolean;
};

const root = resolve(import.meta.dir, "..");
const developmentRecipients = resolve(root, "secrets/development/recipients");

export const platformEnvTargets: readonly EnvTarget[] = [
  {
    encrypted: resolve(root, "secrets/development/platform/client.env.age"),
    plaintext: resolve(root, "apps/platform/client/.env"),
    recipients: developmentRecipients,
  },
  {
    encrypted: resolve(root, "secrets/development/platform/server.env.age"),
    plaintext: resolve(root, "apps/platform/server/.env"),
    recipients: developmentRecipients,
  },
  {
    encrypted: resolve(root, "secrets/development/platform/e2e.env.age"),
    plaintext: resolve(root, "apps/platform/e2e/.env"),
    recipients: developmentRecipients,
  },
];

export const siteEnvTargets: readonly EnvTarget[] = [
  {
    encrypted: resolve(root, "secrets/development/site/site.env.age"),
    plaintext: resolve(root, "apps/site/.env"),
    recipients: developmentRecipients,
  },
];

const envTargets: readonly EnvTarget[] = [...platformEnvTargets, ...siteEnvTargets];

function displayPath(path: string): string {
  return relative(root, path) || ".";
}

function expandHome(path: string): string {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return path;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function identityPath(): string {
  const configured = process.env.AGE_IDENTITY_FILE;
  if (configured !== undefined && configured.trim() !== "") {
    return resolve(expandHome(configured.trim()));
  }

  const candidates = [
    join(homedir(), ".config/age/keys.txt"),
    join(homedir(), ".config/age/identity.age"),
  ];
  const existing = candidates.find((candidate) => Bun.file(candidate).size > 0);
  if (existing !== undefined) return existing;

  throw new Error(
    "No age identity found. Set AGE_IDENTITY_FILE to your private age identity file (it must stay outside this repository).",
  );
}

async function writeAtomically(path: string, contents: ArrayBuffer): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;

  try {
    await Bun.write(temporary, contents);
    await chmod(temporary, 0o600);
    await rename(temporary, path);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

async function decryptFile(target: EnvTarget, identity: string): Promise<void> {
  const ageProcess = Bun.spawn(["age", "--decrypt", "--identity", identity, target.encrypted], {
    cwd: root,
    stdin: "inherit",
    stdout: "pipe",
    stderr: "inherit",
  });
  const contents = new Response(ageProcess.stdout).arrayBuffer();
  const exitCode = await ageProcess.exited;

  if (exitCode !== 0) {
    try {
      await contents;
    } catch {
      // Ignore failed command output; no plaintext is written on failure.
    }
    throw new Error(
      `age could not decrypt ${displayPath(target.encrypted)} (exit code ${exitCode})`,
    );
  }

  await writeAtomically(target.plaintext, await contents);
  console.log(`Decrypted ${displayPath(target.plaintext)}`);
}

async function encryptFile(target: EnvTarget): Promise<void> {
  const temporary = `${target.encrypted}.${process.pid}.tmp`;
  await mkdir(dirname(target.encrypted), { recursive: true });

  const ageProcess = Bun.spawn(
    [
      "age",
      "--encrypt",
      "--recipients-file",
      target.recipients,
      "--output",
      temporary,
      target.plaintext,
    ],
    {
      cwd: root,
      stdin: "inherit",
      stdout: "ignore",
      stderr: "inherit",
    },
  );
  const exitCode = await ageProcess.exited;

  if (exitCode !== 0) {
    await rm(temporary, { force: true });
    throw new Error(
      `age could not encrypt ${displayPath(target.plaintext)} (exit code ${exitCode})`,
    );
  }

  try {
    await rename(temporary, target.encrypted);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
  console.log(`Encrypted ${displayPath(target.plaintext)} -> ${displayPath(target.encrypted)}`);
}

// Select using filesystem metadata only; validate every input before invoking age.
export async function selectEnvTargets(
  command: "encrypt" | "decrypt",
  options: { onlyMissing?: boolean; targets?: readonly EnvTarget[] } = {},
): Promise<EnvTarget[]> {
  const selected: EnvTarget[] = [];
  for (const target of options.targets ?? envTargets) {
    if (command === "decrypt" && options.onlyMissing && (await fileExists(target.plaintext))) {
      continue;
    }
    const input = command === "decrypt" ? target.encrypted : target.plaintext;
    if (!(await fileExists(input))) {
      if (target.optional) continue;
      const kind = command === "decrypt" ? "Encrypted" : "Plain";
      throw new Error(`${kind} environment file not found: ${displayPath(input)}`);
    }
    selected.push(target);
  }
  return selected;
}

export async function decryptEnvFiles(
  options: { onlyMissing?: boolean; targets?: readonly EnvTarget[] } = {},
): Promise<void> {
  const targets = await selectEnvTargets("decrypt", options);
  if (targets.length === 0) return;

  const identity = identityPath();
  await Promise.all(targets.map((target) => decryptFile(target, identity)));
}

export async function encryptEnvFiles(): Promise<void> {
  const selected = await selectEnvTargets("encrypt", { targets: envTargets });
  if (selected.length === 0) return;
  for (const recipients of new Set(selected.map((target) => target.recipients))) {
    if (!(await fileExists(recipients))) {
      throw new Error(`Age recipient file not found: ${displayPath(recipients)}`);
    }
  }
  await Promise.all(selected.map((target) => encryptFile(target)));
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command === "decrypt") {
    await decryptEnvFiles();
    return;
  }
  if (command === "encrypt") {
    await encryptEnvFiles();
    return;
  }

  throw new Error("Usage: bun scripts/env.ts <encrypt|decrypt>");
}

if (import.meta.main) {
  await main();
}
