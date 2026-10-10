import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    ignorePatterns: [
      "**/worker-configuration.d.ts",
      "**/.nuxt/**",
      "**/.output/**",
      "**/.cloudflare/**",
      "**/.wrangler/**",
      "**/.direnv/**",
      ".agents/**",
    ],
    plugins: ["import", "unicorn", "promise", "typescript", "oxc"],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "consistent-type-imports": "warn",
      "eslint/max-lines-per-function": [
        "warn",
        { max: 100, skipComments: true, skipBlankLines: true },
      ],
      "eslint/no-useless-return": "allow",
      "import/max-dependencies": ["warn", { max: 15 }],
      "import/no-cycle": "error",
      "no-inline-comments": "allow",
      "unicorn/no-null": "off",
      "unicorn/prefer-add-event-listener": "allow",
      "unicorn/prefer-top-level-await": "off",
      "typescript/prefer-readonly-parameter-types": "allow",
      "typescript/consistent-return": "allow",
    },
    options: { typeAware: true, typeCheck: false },
  },
  fmt: {
    vueIndentScriptAndStyle: true,
    ignorePatterns: [
      ".agents/**",
      "**/.direnv/**",
      "**/.turbo/**",
      "**/.worktrees/**",
      "**/.vite-hooks/**",
      "**/.wrangler/**",
      "**/.cloudflare/**",
      "**/.nuxt/**",
      "**/.output/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
    ],
  },
  run: {
    // Keep migrated commands fresh; builds and type generation produce environment-dependent artifacts.
    cache: { tasks: false },
    tasks: {
      "build:platform": "cd apps/platform/client && bun run build && cd ../server && bun run build",
      "build:site": "cd apps/site && bun run cf-build",
      check: "vp check",
      "dev:platform": "bun scripts/platform/dev.ts",
      "dev:site": "bun scripts/site/dev.ts",
      "generate-types:server": "cd apps/platform/server && bun run cf-typegen",
      "generate-types:site": "cd apps/site && bun run generate-types",
      knip: "knip --workspace apps/platform/client --workspace apps/platform/server --workspace packages/record-domain",
      "test:platform":
        "bun test --isolate apps/platform/server/test apps/platform/client/test packages/record-domain/test scripts/platform scripts/env.test.ts",
      "test:site":
        "bun test --isolate apps/site/tests packages/lot-aikido/test packages/randori-timer/test scripts/env.test.ts",
      "typecheck:platform":
        "cd apps/platform/server && bun run typecheck && cd ../client && bun run typecheck && cd ../../../packages/record-domain && bun run typecheck",
      "typecheck:site":
        "cd apps/site && bun run typecheck && cd ../../packages/lot-aikido && bun run typecheck && cd ../randori-timer && bun run typecheck",
      "deploy:site":
        "vp run build:site && (cd apps/site && bunx --no-install cf deploy --prebuilt --dry-run)",
      "deploy:platform":
        "vp run build:platform && (cd apps/platform/server && bunx --no-install cf deploy --prebuilt --dry-run)",
    },
  },
});
