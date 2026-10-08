import { defineEventHandler, getRequestURL, setResponseHeader, setResponseHeaders } from "h3";

import { getCalendarEventsJson } from "../services/calendar";
import {
  CALENDAR_BROWSER_CACHE_CONTROL,
  CALENDAR_CACHE_TAG,
  CALENDAR_EDGE_CACHE_CONTROL,
  parseCalendarRequestUrl,
} from "../services/calendar-policy";

export default defineEventHandler(async (event) => {
  // Errors and non-canonical requests must never populate Workers Cache.
  setResponseHeader(event, "Cache-Control", "no-store");

  const range = parseCalendarRequestUrl(getRequestURL(event));
  const events = await getCalendarEventsJson(range);

  setResponseHeaders(event, {
    "Cache-Control": CALENDAR_BROWSER_CACHE_CONTROL,
    "Cloudflare-CDN-Cache-Control": CALENDAR_EDGE_CACHE_CONTROL,
    "Cache-Tag": CALENDAR_CACHE_TAG,
  });

  return events;
});
