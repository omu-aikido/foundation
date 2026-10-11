import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "bun:test";

import {
  clampCalendarMonth,
  createJstDate,
  formatEventDateRange,
  formatLocalDate,
  formatMonthlyEventTime,
  getJstDaysInMonth,
} from "../shared/utils/calendar";
import {
  CALENDAR_BROWSER_CACHE_CONTROL,
  CALENDAR_CACHE_FRESH_SECONDS,
  CALENDAR_CACHE_TOTAL_SECONDS,
  CALENDAR_EDGE_CACHE_CONTROL,
  parseCalendarRequestUrl,
} from "../server/services/calendar-policy";
import { fetchCalendarIcsText, parseCalendarEvents } from "../server/services/calendar";

const JULY_2026 = new Date("2026-07-19T12:00:00+09:00");

function expectInvalidCalendarRequest(url: string) {
  try {
    parseCalendarRequestUrl(url, JULY_2026);
    throw new Error("expected calendar range validation to fail");
  } catch (error) {
    expect((error as { statusCode?: number }).statusCode).toBe(400);
  }
}

describe("calendar JST helpers", () => {
  it("JST の月境界とうるう年を扱う", () => {
    expect(formatLocalDate(createJstDate(2026, 0, 1))).toBe("2026-01-01");
    expect(getJstDaysInMonth(2024, 1)).toBe(29);
    expect(getJstDaysInMonth(2026, 1)).toBe(28);
  });

  it("月表示を当月と翌月に制限する", () => {
    expect(clampCalendarMonth(2026, 5, JULY_2026)).toEqual({
      year: 2026,
      month: 6,
    });
    expect(clampCalendarMonth(2026, 7, JULY_2026)).toEqual({
      year: 2026,
      month: 7,
    });
    expect(clampCalendarMonth(9999, 0, JULY_2026)).toEqual({
      year: 2026,
      month: 7,
    });
    expect(clampCalendarMonth(Number.NaN, Number.NaN, JULY_2026)).toEqual({
      year: 2026,
      month: 6,
    });
  });
});

describe("calendar request policy", () => {
  it("当月から翌月までの正規URLを許可する", () => {
    expect(
      parseCalendarRequestUrl(
        "https://omu-aikido.com/__calendar?start=2026-07-01&end=2026-08-31",
        JULY_2026,
      ),
    ).toEqual({ start: "2026-07-01", end: "2026-08-31" });
  });

  it("無効日付、過去月、遠未来を拒否する", () => {
    expectInvalidCalendarRequest(
      "https://omu-aikido.com/__calendar?start=2026-02-31&end=2026-03-01",
    );
    expectInvalidCalendarRequest(
      "https://omu-aikido.com/__calendar?start=2026-06-01&end=2026-06-30",
    );
    expectInvalidCalendarRequest(
      "https://omu-aikido.com/__calendar?start=9999-01-01&end=9999-01-31",
    );
  });

  it("キャッシュを分断する非正規クエリを拒否する", () => {
    expectInvalidCalendarRequest(
      "https://omu-aikido.com/__calendar?start=2026-07-01&end=2026-07-31&extra=1",
    );
    expectInvalidCalendarRequest(
      "https://omu-aikido.com/__calendar?end=2026-07-31&start=2026-07-01",
    );
    expectInvalidCalendarRequest(
      "https://omu-aikido.com/__calendar?start=2026-07-01&start=2026-07-02&end=2026-07-31",
    );
  });

  it("ブラウザとWorkers CacheのTTLを分離する", () => {
    const staleSeconds = CALENDAR_CACHE_TOTAL_SECONDS - CALENDAR_CACHE_FRESH_SECONDS;

    expect(CALENDAR_BROWSER_CACHE_CONTROL).toBe("public, max-age=60");
    expect(CALENDAR_EDGE_CACHE_CONTROL).toBe(
      `public, max-age=${CALENDAR_CACHE_FRESH_SECONDS}, stale-while-revalidate=${staleSeconds}, stale-if-error=${staleSeconds}`,
    );
    expect(CALENDAR_EDGE_CACHE_CONTROL).not.toContain("s-maxage");
  });
});

describe("calendar ICS fetching", () => {
  it("timeout before response headers aborts fetch and rejects", async () => {
    let signal: AbortSignal | undefined;
    const fetcher = (_input: RequestInfo | URL, init?: RequestInit) => {
      signal = init?.signal ?? undefined;
      return new Promise<Response>(() => {});
    };

    await assert.rejects(fetchCalendarIcsText(fetcher, 5), /timed out/);
    expect(signal?.aborted).toBe(true);
  });

  it("cancels a response that arrives after the fetch timed out", async () => {
    let cancelled = false;
    const lateFetch = () =>
      new Promise<Response>((resolve) => {
        setTimeout(
          () =>
            resolve(
              new Response(
                new ReadableStream<Uint8Array>({
                  start(controller) {
                    controller.enqueue(new Uint8Array([65]));
                  },
                  cancel() {
                    cancelled = true;
                  },
                }),
              ),
            ),
          20,
        );
      });

    await assert.rejects(fetchCalendarIcsText(lateFetch, 5), /timed out/);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(cancelled).toBe(true);
  });

  it("stalled response body times out, cancels, and a later fetch can succeed", async () => {
    let cancelled = false;
    const stalledFetch = async () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array([65]));
          },
          cancel() {
            cancelled = true;
          },
        }),
      );

    await assert.rejects(fetchCalendarIcsText(stalledFetch, 5), /timed out/);
    expect(cancelled).toBe(true);
    const retry = async () => new Response("retry ok");
    expect(await fetchCalendarIcsText(retry, 100)).toBe("retry ok");
  });

  it("bounds cumulative bytes across chunks and accepts the exact limit", async () => {
    let cancelled = false;
    const oversized = async () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array(1024 * 1024));
            controller.enqueue(new Uint8Array([1]));
          },
          cancel() {
            cancelled = true;
          },
        }),
      );
    await assert.rejects(fetchCalendarIcsText(oversized, 100, 1024 * 1024), /too large/);
    expect(cancelled).toBe(true);

    const chunks = [new Uint8Array(1024 * 1024 - 2), new TextEncoder().encode("é")];
    const exact = async () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            for (const chunk of chunks) controller.enqueue(chunk);
            controller.close();
          },
        }),
      );
    const text = await fetchCalendarIcsText(exact, 100, 1024 * 1024);
    expect(new TextEncoder().encode(text)).toHaveLength(1024 * 1024);
    expect(text.endsWith("é")).toBe(true);
  });
});

describe("ICS parsing", () => {
  const fixture = readFileSync(
    fileURLToPath(new URL("./fixtures/calendar.ics", import.meta.url)),
    "utf8",
  );

  it("終日予定の排他的 DTEND を1日として表示する", () => {
    const events = parseCalendarEvents(fixture, {
      start: "2026-07-20",
      end: "2026-07-20",
    });
    expect(events).toHaveLength(2);
    const event = events.find((item) => item.id === "all-day-1");
    expect(event?.isAllDay).toBe(true);
    expect(event && formatEventDateRange(event)).toContain("7月20日");
  });

  it("RRULE を展開し EXDATE を除外する", () => {
    const events = parseCalendarEvents(fixture, {
      start: "2026-07-01",
      end: "2026-07-31",
    }).filter((event) => event.title.includes("中百舌鳥"));
    expect(events).toHaveLength(2);
    expect(events.map((event) => event.start.slice(0, 10))).toEqual(["2026-07-06", "2026-07-20"]);
  });

  it("月表示では同日内の時刻指定予定に開始・終了時刻を表示する", () => {
    const events = parseCalendarEvents(fixture, {
      start: "2026-07-06",
      end: "2026-07-06",
    });
    const event = events.find((item) => item.id === "weekly-1");

    expect(event && formatMonthlyEventTime(event)).toBe("18:00 - 20:00");
  });
});
