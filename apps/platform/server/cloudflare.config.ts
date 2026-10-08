import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "record",
    compatibilityDate: "2026-03-30",
    compatibilityFlags: ["nodejs_compat"],
    entrypoint: "src/index.ts",
    observability: {
      enabled: true,
      traces: {
        enabled: true,
      },
    },
    assets: {
      notFoundHandling: "single-page-application",
    },
    env: {
      CLERK_SECRET_KEY: bindings.secret(),
      CLERK_WEBHOOK_SECRET: bindings.secret(),
      TURSO_AUTH_TOKEN: bindings.secret(),
      ANALYTICS: bindings.analyticsEngineDataset({
        name: "record_analytics",
      }),
      CF_VERSION_METADATA: bindings.versionMetadata(),
      ACCOUNT_MUTATION_RATE_LIMIT: bindings.rateLimit({
        namespace: "10001",
        simple: {
          limit: 5,
          period: 60,
        },
      }),
      ACTIVITY_MUTATION_RATE_LIMIT: bindings.rateLimit({
        namespace: "10002",
        simple: {
          limit: 20,
          period: 60,
        },
      }),
      BULK_DELETE_RATE_LIMIT: bindings.rateLimit({
        namespace: "10003",
        simple: {
          limit: 5,
          period: 60,
        },
      }),
      ASSETS: bindings.assets(),
    },
  },
});
