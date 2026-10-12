import { afterEach, describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

interface GitFixture {
  (workingDir: string): {
    branch(): Promise<{ current: string }>;
    revparse(args: string[]): Promise<string>;
    status(): Promise<{ isClean(): boolean }>;
  };
}

const nuxtRequire = createRequire(import.meta.resolve("nuxt/package.json"));
const devtoolsPackagePath = nuxtRequire.resolve("@nuxt/devtools/package.json");
const devtoolsDirectory = dirname(devtoolsPackagePath);
const simpleGitPath = Bun.resolveSync("simple-git", devtoolsDirectory);
const { simpleGit } = (await import(simpleGitPath)) as { simpleGit: GitFixture };

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("Nuxt DevTools simple-git compatibility", () => {
  it("loads DevTools and inspects analyzed-build repository state", async () => {
    await import(pathToFileURL(join(devtoolsDirectory, "dist/chunks/module-main.mjs")).href);

    const temporaryRoot = await mkdtemp(join(tmpdir(), "devtools-simple-git-"));
    temporaryDirectories.push(temporaryRoot);
    const repository = join(temporaryRoot, "repo");
    const hooksDirectory = join(temporaryRoot, "empty-hooks");
    const globalConfig = join(temporaryRoot, "empty-global-config");
    await Promise.all([mkdir(repository), mkdir(hooksDirectory)]);
    await writeFile(globalConfig, "");

    const gitEnvironment = Object.fromEntries(
      Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
    );
    const env = {
      ...gitEnvironment,
      GIT_CONFIG_GLOBAL: globalConfig,
      GIT_CONFIG_NOSYSTEM: "1",
    };
    const gitConfig = [
      "-c",
      "user.name=Compatibility Test",
      "-c",
      "user.email=compatibility@example.invalid",
      "-c",
      `core.hooksPath=${hooksDirectory}`,
      "-c",
      "commit.gpgsign=false",
    ];
    const runGit = (...args: string[]) =>
      execFileSync("git", [...gitConfig, ...args], { cwd: repository, env, stdio: "pipe" });

    runGit("init", `--template=${hooksDirectory}`, "--initial-branch=compatibility-test");
    await writeFile(join(repository, "fixture.txt"), "tracked fixture\n");
    runGit("add", "fixture.txt");
    runGit("commit", "--no-gpg-sign", "-m", "add compatibility fixture");

    const git = simpleGit(repository);

    const branch = await git.branch();
    const head = await git.revparse(["HEAD"]);
    const shortHead = await git.revparse(["--short", "HEAD"]);
    const cleanStatus = await git.status();

    expect(branch.current).toBe("compatibility-test");
    expect(shortHead).toMatch(/^[0-9a-f]+$/);
    expect(head.startsWith(shortHead)).toBe(true);
    expect(cleanStatus.isClean()).toBe(true);

    await writeFile(join(repository, "fixture.txt"), "modified fixture\n");
    const dirtyStatus = await git.status();
    expect(dirtyStatus.isClean()).toBe(false);
  });
});
