/// <reference types="@cloudflare/workers-types" />

import type { ContactEnv } from "../api/contact-app";

interface CloudflareRuntime {
  env: ContactEnv;
  context?: ExecutionContext;
}

export function getCloudflareRuntime(context: Record<string, unknown>) {
  const runtime = context.cloudflare as CloudflareRuntime | undefined;
  if (!runtime?.env) throw new Error("Cloudflare bindings are unavailable");
  return runtime;
}
