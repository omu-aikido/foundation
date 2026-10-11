import { describe, expect, it, mock } from "bun:test";

import { type ContactEnv, createContactApp } from "../server/api/contact-app";

function contactRequest(fields: Record<string, string> = {}, headers: Record<string, string> = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    name: "山田 太郎",
    email: "taro@example.com",
    subject: "見学について",
    body: "見学を希望します。",
    "cf-turnstile-response": "valid-token",
    ...fields,
  })) {
    form.set(key, value);
  }
  return new Request("https://omu-aikido.com/api/contact", {
    method: "POST",
    headers: { Origin: "https://omu-aikido.com", ...headers },
    body: form,
  });
}

function fakeEnv(overrides: Partial<ContactEnv> = {}): ContactEnv {
  return {
    CONTACT_ALLOWED_ORIGINS: "https://omu-aikido.com",
    TURNSTILE_HOSTNAME: "omu-aikido.com",
    CF_TURNSTILE_SECRETKEY: "secret",
    DISCORD_WEBHOOK_URL: "https://discord.test/webhook",
    CONTACT_RATE_LIMITER: {
      limit: mock().mockResolvedValue({ success: true }),
    },
    AI: {
      run: mock().mockResolvedValue({ response: "safe" }),
    },
    CONTACT_MAILER: {
      send: mock().mockResolvedValue(undefined),
    },
    ...overrides,
  };
}

function externalFetch(options?: { turnstile?: Record<string, unknown>; discordOk?: boolean }) {
  const fetch = mock(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.includes("siteverify")) {
      return Response.json(
        options?.turnstile ?? {
          success: true,
          hostname: "omu-aikido.com",
          action: "contact",
        },
      );
    }
    return new Response(null, {
      status: options?.discordOk === false ? 500 : 204,
    });
  });
  return Object.assign(fetch, { preconnect: mock() });
}

describe("POST /api/contact validation and security", () => {
  it("Origin が欠落・null・不一致なら外部処理前に 403", async () => {
    const fetch = externalFetch();
    const limit = mock().mockResolvedValue({ success: true });
    const env = fakeEnv({ CONTACT_RATE_LIMITER: { limit } });
    const app = createContactApp({ fetch });

    for (const origin of [undefined, "null", "https://evil.example"]) {
      const request = contactRequest();
      if (origin === undefined) request.headers.delete("Origin");
      else request.headers.set("Origin", origin);
      const response = await app.fetch(request, env);
      expect(response.status).toBe(403);
    }
    expect(fetch).not.toHaveBeenCalled();
    expect(limit).not.toHaveBeenCalled();
  });

  it("Origin がなくても許可された Referer の origin は受理する", async () => {
    const request = contactRequest();
    request.headers.delete("Origin");
    request.headers.set("Referer", "https://omu-aikido.com/contact");
    const response = await createContactApp({ fetch: externalFetch() }).fetch(request, fakeEnv());
    expect(response.status).toBe(200);
  });

  it("multipart 以外と 16 KiB 超過を拒否する", async () => {
    const app = createContactApp({ fetch: externalFetch() });
    const env = fakeEnv();
    const jsonResponse = await app.fetch(
      new Request("https://omu-aikido.com/api/contact", {
        method: "POST",
        headers: {
          Origin: "https://omu-aikido.com",
          "Content-Type": "application/json",
        },
        body: "{}",
      }),
      env,
    );
    expect(jsonResponse.status).toBe(400);

    const largeResponse = await app.fetch(contactRequest({ body: "a".repeat(17 * 1024) }), env);
    expect(largeResponse.status).toBe(413);
  });
});

describe("POST /api/contact streaming body limit", () => {
  it("Content-Length がない、または過少でもストリーム上限を適用して超過時に cancel する", async () => {
    for (const declaredLength of [undefined, "1"]) {
      let cancelled = false;
      const headers = new Headers({
        Origin: "https://omu-aikido.com",
        "Content-Type": "multipart/form-data; boundary=x",
      });
      if (declaredLength) headers.set("Content-Length", declaredLength);
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(16 * 1024));
          controller.enqueue(new Uint8Array([1]));
        },
        cancel() {
          cancelled = true;
        },
      });
      const request = new Request("https://omu-aikido.com/api/contact", {
        method: "POST",
        headers,
        body,
      });
      const limit = mock().mockResolvedValue({ success: true });
      const fetch = externalFetch();
      const response = await createContactApp({ fetch }).fetch(
        request,
        fakeEnv({ CONTACT_RATE_LIMITER: { limit } }),
      );
      expect(response.status).toBe(413);
      expect(cancelled).toBe(true);
      expect(limit).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    }
  });

  it("応答しない cancel を待たず、読み取りエラーは 400 とする", async () => {
    const neverSettles = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(16 * 1024 + 1));
      },
      cancel() {
        return new Promise<void>(() => {});
      },
    });
    const tooLarge = new Request("https://omu-aikido.com/api/contact", {
      method: "POST",
      headers: {
        Origin: "https://omu-aikido.com",
        "Content-Type": "multipart/form-data; boundary=x",
      },
      body: neverSettles,
    });
    const tooLargeResponse = await createContactApp().fetch(tooLarge, fakeEnv());
    expect(tooLargeResponse.status).toBe(413);

    const broken = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(new Error("broken request stream"));
      },
    });
    const brokenRequest = new Request("https://omu-aikido.com/api/contact", {
      method: "POST",
      headers: {
        Origin: "https://omu-aikido.com",
        "Content-Type": "multipart/form-data; boundary=x",
      },
      body: broken,
    });
    expect((await createContactApp().fetch(brokenRequest, fakeEnv())).status).toBe(400);
  });

  it("16 KiB ちょうどの body はサイズ超過として扱わない", async () => {
    const bytes = new Uint8Array(16 * 1024);
    const response = await createContactApp({ fetch: externalFetch() }).fetch(
      new Request("https://omu-aikido.com/api/contact", {
        method: "POST",
        headers: {
          Origin: "https://omu-aikido.com",
          "Content-Type": "multipart/form-data; boundary=x",
        },
        body: bytes,
      }),
      fakeEnv(),
    );
    expect(response.status).toBe(400);
  });
});

describe("POST /api/contact validation and security", () => {
  it("rate limit は Turnstile と配送より前に 429 を返す", async () => {
    const fetch = externalFetch();
    const env = fakeEnv({
      CONTACT_RATE_LIMITER: {
        limit: mock().mockResolvedValue({ success: false }),
      },
    });
    const response = await createContactApp({ fetch }).fetch(contactRequest(), env);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("未知フィールドと件名の改行を strict schema で拒否する", async () => {
    const app = createContactApp({ fetch: externalFetch() });
    const env = fakeEnv();
    expect((await app.fetch(contactRequest({ extra: "x" }), env)).status).toBe(400);
    expect((await app.fetch(contactRequest({ subject: "hello\nBcc: x" }), env)).status).toBe(400);
  });

  it("Turnstile の hostname と action を照合する", async () => {
    for (const turnstile of [
      { success: true, hostname: "evil.example", action: "contact" },
      { success: true, hostname: "omu-aikido.com", action: "login" },
      { success: false },
    ]) {
      const response = await createContactApp({
        fetch: externalFetch({ turnstile }),
      }).fetch(contactRequest(), fakeEnv());
      expect(response.status).toBe(400);
    }
  });
});

describe("POST /api/contact moderation and delivery", () => {
  it("AI 障害時は配送を継続し Discord を mask する", async () => {
    const fetch = externalFetch();
    const env = fakeEnv({
      AI: { run: mock().mockRejectedValue(new Error("AI down")) },
    });
    const response = await createContactApp({ fetch }).fetch(contactRequest(), env);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      masked: true,
      moderationDegraded: true,
    });
    const discordCall = fetch.mock.calls.find(([input]) =>
      (input instanceof Request ? input.url : String(input)).includes("discord.test"),
    );
    const body = discordCall?.[1]?.body;
    expect(typeof body).toBe("string");
    expect(body).not.toContain("taro@example.com");
  });

  it("配送が両方失敗した場合だけ 502", async () => {
    const env = fakeEnv({
      CONTACT_MAILER: { send: mock().mockRejectedValue(new Error("mail")) },
    });
    const bothFailed = await createContactApp({
      fetch: externalFetch({ discordOk: false }),
    }).fetch(contactRequest(), env);
    expect(bothFailed.status).toBe(502);

    const discordOnly = await createContactApp({
      fetch: externalFetch({ discordOk: true }),
    }).fetch(contactRequest(), env);
    expect(discordOnly.status).toBe(200);
  });
});

describe("/api/contact HTTP behavior", () => {
  it("常に no-store、POST 以外は 405", async () => {
    const app = createContactApp({ fetch: externalFetch() });
    const response = await app.fetch(new Request("https://omu-aikido.com/api/contact"), fakeEnv());
    expect(response.status).toBe(405);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
