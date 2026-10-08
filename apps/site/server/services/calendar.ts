import type { CalendarEvent } from "../../shared/utils/calendar";
import { convertIcsCalendar, extendByRecurrenceRule, getEventEnd } from "ts-ics";
import {
  createJstDate,
  formatJstDateTime,
  formatLocalDate,
  getCurrentJstYearMonth,
  parseLocalDate,
} from "../../shared/utils/calendar";
import type { IcsDateObject, IcsEvent } from "ts-ics";

/**
 * Configuration
 */
const CALENDAR_BASE_URL = "https://calendar.google.com/calendar/ical/";
const CALENDAR_ID = "aikido.omu";
const CALENDAR_DEFAULT_PATH = "%40gmail.com/public/basic.ics";
const CALENDAR_ICS_URL = `${CALENDAR_BASE_URL}${CALENDAR_ID}${CALENDAR_DEFAULT_PATH}`;

/**
 * Cache for parsed events (Layer 2)
 */
let cachedEvents: { events: IcsEvent[]; fetchedAt: number } | null = null;
let inFlight: Promise<IcsEvent[]> | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function fetchIcsText(): Promise<string> {
  const res = await fetch(CALENDAR_ICS_URL);
  if (!res.ok) throw new Error(`Failed to fetch ICS (${res.status})`);
  return res.text();
}

function parseIcs(text: string): IcsEvent[] {
  return convertIcsCalendar(undefined, text).events ?? [];
}

async function getEvents(): Promise<IcsEvent[]> {
  const now = Date.now();
  if (cachedEvents && now - cachedEvents.fetchedAt < CACHE_TTL) {
    return cachedEvents.events;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const text = await fetchIcsText();
      const events = parseIcs(text);
      cachedEvents = { events, fetchedAt: Date.now() };
      return events;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

function getWindow(monthsBefore = 2, monthsAfter = 3) {
  const { year, month } = getCurrentJstYearMonth();
  const start = createJstDate(year, month - monthsBefore, 1);
  const end = parseLocalDate(formatLocalDate(createJstDate(year, month + monthsAfter + 1, 0)), {
    endOfDay: true,
  });
  return { start, end };
}

export type { CalendarEvent };

type ExpandedIcsEvent = Omit<IcsEvent, "duration" | "end"> & {
  end: IcsDateObject;
  occurrenceId?: string;
};

type ExpandWindow = {
  start: Date;
  end: Date;
};

export type CalendarRangeInput = {
  start?: string;
  end?: string;
};

function isIsoDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function sameTime(left: Date, right: Date): boolean {
  return left.getTime() === right.getTime();
}

function addMilliseconds(date: Date, milliseconds: number): Date {
  return new Date(date.getTime() + milliseconds);
}

function occurrenceKey(uid: string, recurrenceDate: Date): string {
  return `${uid}#${recurrenceDate.toISOString()}`;
}

function dateObjectFrom(dateObject: IcsDateObject, date: Date): IcsDateObject {
  return {
    ...dateObject,
    date,
  };
}

function isCancelled(event: IcsEvent): boolean {
  return event.status === "CANCELLED";
}

function eventEnd(event: IcsEvent): Date {
  return event.end?.date ?? getEventEnd(event);
}

function normalizeEvent(event: IcsEvent, occurrenceId?: string): ExpandedIcsEvent {
  const { duration: _duration, end: _end, ...rest } = event;
  return {
    ...rest,
    end: event.end ?? dateObjectFrom(event.start, getEventEnd(event)),
    occurrenceId,
  };
}

function overlapsWindow(event: IcsEvent | ExpandedIcsEvent, start: Date, end: Date): boolean {
  const eventStart = event.start.date;
  if (!eventStart) return false;
  const eventEndDate = eventEnd(event);
  return eventStart <= end && eventEndDate >= start;
}

function collectOverrides(events: IcsEvent[]): Map<string, IcsEvent> {
  const overrides = new Map<string, IcsEvent>();
  for (const event of events) {
    if (!event.recurrenceId) continue;
    overrides.set(occurrenceKey(event.uid, event.recurrenceId.value.date), event);
  }
  return overrides;
}

function expandRecurringEvent(
  event: IcsEvent,
  overrides: Map<string, IcsEvent>,
  window: ExpandWindow,
): ExpandedIcsEvent[] {
  if (!event.recurrenceRule) return [normalizeEvent(event)];

  const durationMs = eventEnd(event).getTime() - event.start.date.getTime();
  const overrideDates = [...overrides.values()]
    .filter((override) => override.uid === event.uid)
    .map((override) => override.recurrenceId?.value.date)
    .filter((date): date is Date => Boolean(date));
  const exceptions = [
    ...(event.exceptionDates ?? []).map((exception) => exception.date),
    ...overrideDates,
  ];
  const occurrenceStarts = extendByRecurrenceRule(event.recurrenceRule, {
    start: event.start.date,
    end: window.end,
    exceptions,
  }).filter((occurrenceStart) => {
    const occurrenceEnd = addMilliseconds(occurrenceStart, durationMs);
    return occurrenceStart <= window.end && occurrenceEnd >= window.start;
  });

  const expanded = occurrenceStarts.map((occurrenceStart) => {
    const occurrenceEnd = addMilliseconds(occurrenceStart, durationMs);
    const isFirstOccurrence = sameTime(occurrenceStart, event.start.date);
    const occurrenceId = isFirstOccurrence ? event.uid : occurrenceKey(event.uid, occurrenceStart);
    return {
      ...normalizeEvent(event, occurrenceId),
      start: dateObjectFrom(event.start, occurrenceStart),
      end: dateObjectFrom(event.end ?? event.start, occurrenceEnd),
    };
  });

  for (const override of overrides.values()) {
    if (override.uid !== event.uid || isCancelled(override)) continue;
    if (!overlapsWindow(override, window.start, window.end)) continue;
    expanded.push(
      normalizeEvent(override, occurrenceKey(event.uid, override.recurrenceId!.value.date)),
    );
  }

  return expanded;
}

function expandCalendarEvents(events: IcsEvent[], window: ExpandWindow): ExpandedIcsEvent[] {
  const overrides = collectOverrides(events);
  return events.flatMap((event) => {
    if (event.recurrenceId || isCancelled(event)) return [];
    return expandRecurringEvent(event, overrides, window);
  });
}

function filterEvents(events: ExpandedIcsEvent[], start: Date, end: Date): ExpandedIcsEvent[] {
  return events.filter((event) => overlapsWindow(event, start, end));
}

function eventsToJson(events: ExpandedIcsEvent[]): CalendarEvent[] {
  return events
    .map((ev) => {
      const start = ev.start.date;
      const end = eventEnd(ev);
      const allDay = ev.start.type === "DATE";

      const fmt = (d: Date) => {
        if (allDay) {
          return formatLocalDate(d);
        } else {
          return formatJstDateTime(d);
        }
      };

      return {
        id: ev.occurrenceId ?? ev.uid ?? "",
        title: ev.summary ?? "",
        start: fmt(start),
        end: fmt(end),
        isAllDay: allDay,
        location: ev.location,
        description: ev.description,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

function resolveCalendarRange(input?: CalendarRangeInput): ExpandWindow {
  if (!input?.start && !input?.end) {
    return getWindow(1, 1);
  }

  if (!input?.start || !input?.end) {
    throw new Error("start と end は両方指定してください");
  }

  if (!isIsoDateString(input.start) || !isIsoDateString(input.end)) {
    throw new Error("start と end は YYYY-MM-DD 形式で指定してください");
  }

  const start = parseLocalDate(input.start);
  const end = parseLocalDate(input.end, { endOfDay: true });

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("start または end の日付が不正です");
  }

  if (start > end) {
    throw new Error("start must be before end");
  }

  return { start, end };
}

export async function getCalendarEventsJson(input?: CalendarRangeInput): Promise<CalendarEvent[]> {
  const { start, end } = resolveCalendarRange(input);
  const events = await getEvents();
  const expanded = expandCalendarEvents(events, { start, end });
  const filtered = filterEvents(expanded, start, end);
  return eventsToJson(filtered);
}

export function parseCalendarEvents(text: string, input?: CalendarRangeInput): CalendarEvent[] {
  const { start, end } = resolveCalendarRange(input);
  const expanded = expandCalendarEvents(parseIcs(text), { start, end });
  return eventsToJson(filterEvents(expanded, start, end));
}
