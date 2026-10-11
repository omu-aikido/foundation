import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "platform",
    compatibilityDate: "2026-10-01",
    compatibilityFlags: ["nodejs_compat"],
    entrypoint: "src/index.ts",
    observability: {
      logs: {
        enabled: true,
        invocationLogs: false,
      },
      traces: {
        enabled: true,
      },
      issues: {
        enabled: true,
      },
      enabled: true,
    },
    placement: { mode: "smart" },
    assets: {
      notFoundHandling: "single-page-application",
    },
    domains: ["app.omu-aikido.com"],
    env: {
      CLERK_SECRET_KEY: bindings.secret(),
      CLERK_WEBHOOK_SECRET: bindings.secret(),
      TURSO_AUTH_TOKEN: bindings.secret(),
      CLERK_AUTHORIZED_PARTIES: bindings.secret(),
      CLERK_FRONTEND_API_URL: bindings.secret(),
      CLERK_PUBLISHABLE_KEY: bindings.secret(),
      TURSO_DATABASE_URL: bindings.secret(),
      ANALYTICS: bindings.analyticsEngineDataset({
        name: "platform_analytics",
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
      // delete
      VITE_CLERK_PUBLISHABLE_KEY: bindings.secret(),
    },
  },
});
