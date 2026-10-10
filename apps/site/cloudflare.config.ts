import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "site",
    compatibilityDate: "2026-07-19",
    compatibilityFlags: ["global_fetch_strictly_public", "nodejs_compat"],
    entrypoint: ".output/server/index.mjs",
    placement: {
      mode: "smart",
    },
    cache: {
      enabled: true,
    },
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
    },
    assets: {
      htmlHandling: "drop-trailing-slash",
    },
    domains: ["omu-aikido.com"],
    env: {
      CONTACT_ALLOWED_ORIGINS: bindings.text("https://omu-aikido.com"),
      TURNSTILE_HOSTNAME: bindings.text("omu-aikido.com"),
      CF_TURNSTILE_SECRETKEY: bindings.secret(),
      DISCORD_WEBHOOK_URL: bindings.secret(),
      CONTACT_MAILER: bindings.sendEmail({
        destinationAddress: "aikido.omu@gmail.com",
        dev: {
          remote: true,
        },
      }),
      AI: bindings.ai({
        dev: {
          remote: true,
        },
      }),
      CONTACT_RATE_LIMITER: bindings.rateLimit({
        namespace: "1001",
        simple: {
          limit: 10,
          period: 60,
        },
      }),
      ASSETS: bindings.assets(),
    },
  },
});
