import { createError } from "h3";

import {
  createJstDate,
  formatLocalDate,
  getCurrentJstYearMonth,
  parseLocalDate,
} from "../../shared/utils/calendar";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_MS = 62 * DAY_MS;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const CALENDAR_CACHE_FRESH_SECONDS = 15 * 60;
export const CALENDAR_CACHE_TOTAL_SECONDS = 24 * 60 * 60;
const CALENDAR_CACHE_STALE_SECONDS = CALENDAR_CACHE_TOTAL_SECONDS - CALENDAR_CACHE_FRESH_SECONDS;

export const CALENDAR_BROWSER_CACHE_CONTROL = "public, max-age=60";
export const CALENDAR_EDGE_CACHE_CONTROL = [
  "public",
  `max-age=${CALENDAR_CACHE_FRESH_SECONDS}`,
  `stale-while-revalidate=${CALENDAR_CACHE_STALE_SECONDS}`,
  `stale-if-error=${CALENDAR_CACHE_STALE_SECONDS}`,
].join(", ");
export const CALENDAR_CACHE_TAG = "calendar";

export type CalendarRange = {
  start: string;
  end: string;
};

function invalidCalendarRange(): never {
  throw createError({
    statusCode: 400,
    statusMessage: "invalid calendar range",
  });
}

function parseDateQuery(value: string, endOfDay = false): Date {
  if (!ISO_DATE_PATTERN.test(value)) {
    invalidCalendarRange();
  }

  const date = parseLocalDate(value, { endOfDay });
  if (Number.isNaN(date.getTime()) || formatLocalDate(date) !== value) {
    invalidCalendarRange();
  }

  return date;
}

export function getAllowedCalendarWindow(now = new Date()) {
  const { year, month } = getCurrentJstYearMonth(now);
  const start = createJstDate(year, month, 1);
  const end = parseLocalDate(formatLocalDate(createJstDate(year, month + 2, 0)), {
    endOfDay: true,
  });
  return { start, end };
}

export function parseCalendarRequestUrl(requestUrl: string | URL, now = new Date()): CalendarRange {
  const url = new URL(requestUrl);
  const entries = [...url.searchParams.entries()];
  const startEntry = entries[0];
  const endEntry = entries[1];

  if (
    entries.length !== 2 ||
    !startEntry ||
    !endEntry ||
    startEntry[0] !== "start" ||
    endEntry[0] !== "end"
  ) {
    invalidCalendarRange();
  }

  const startValue = startEntry[1];
  const endValue = endEntry[1];
  const start = parseDateQuery(startValue);
  const end = parseDateQuery(endValue, true);

  if (end < start || end.getTime() - start.getTime() > MAX_RANGE_MS) {
    invalidCalendarRange();
  }

  const allowed = getAllowedCalendarWindow(now);
  if (start < allowed.start || end > allowed.end) {
    invalidCalendarRange();
  }

  return { start: startValue, end: endValue };
}
