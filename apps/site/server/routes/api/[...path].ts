import { toWebRequest } from "h3";

import { createContactApp } from "../../api/contact-app";
import { getCloudflareRuntime } from "../../utils/cloudflare";

const app = createContactApp();

export default defineEventHandler(async (event) => {
  let runtime;
  try {
    runtime = getCloudflareRuntime(event.context);
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Cloudflare bindings are unavailable",
    });
  }
  return app.fetch(toWebRequest(event), runtime.env, runtime.context);
});
