export type CalendarEvent = {
  id: string;
  start: string;
  end: string;
  title: string;
  isAllDay: boolean;
  location?: string;
  description?: string;
};

const JST_TIME_ZONE = "Asia/Tokyo";
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function shiftToJst(date: Date): Date {
  return new Date(date.getTime() + JST_OFFSET_MS);
}

function getJstDateParts(date: Date) {
  const shifted = shiftToJst(date);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    date: shifted.getUTCDate(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
    seconds: shifted.getUTCSeconds(),
  };
}

export function formatLocalDate(date: Date): string {
  const { year, month, date: day } = getJstDateParts(date);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatJstDateTime(date: Date): string {
  const { year, month, date: day, hours, minutes, seconds } = getJstDateParts(date);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}+09:00`;
}

export function parseLocalDate(value: string, options?: { endOfDay?: boolean }): Date {
  const [year = Number.NaN, month = Number.NaN, day = Number.NaN] = value.split("-").map(Number);
  const endOfDay = options?.endOfDay ?? false;
  const utcTime = endOfDay
    ? Date.UTC(year, month - 1, day, 23, 59, 59, 999) - JST_OFFSET_MS
    : Date.UTC(year, month - 1, day, 0, 0, 0, 0) - JST_OFFSET_MS;
  return new Date(utcTime);
}

export function createJstDate(year: number, month: number, day: number): Date {
  return parseLocalDate(
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  );
}

function addJstDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function getJstDateKey(date: Date): string {
  return formatLocalDate(date);
}

function isSameJstDay(left: Date, right: Date): boolean {
  const leftParts = getJstDateParts(left);
  const rightParts = getJstDateParts(right);

  return (
    leftParts.year === rightParts.year &&
    leftParts.month === rightParts.month &&
    leftParts.date === rightParts.date
  );
}

export function getTodayInJst(): Date {
  return parseLocalDate(formatLocalDate(new Date()));
}

function formatJstDateLabel(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    timeZone: JST_TIME_ZONE,
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

export function getJstMonthName(year: number, month: number): string {
  return createJstDate(year, month, 1).toLocaleDateString("ja-JP", {
    timeZone: JST_TIME_ZONE,
    year: "numeric",
    month: "long",
  });
}

export function getJstWeekday(year: number, month: number, day: number): number {
  return shiftToJst(createJstDate(year, month, day)).getUTCDay();
}

export function getJstDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export function getCurrentJstYearMonth(date = new Date()) {
  const { year, month } = getJstDateParts(date);
  return { year, month };
}

export function clampCalendarMonth(year: number, month: number, now = new Date()) {
  const current = getCurrentJstYearMonth(now);
  const currentIndex = current.year * 12 + current.month;
  const requestedIndex = year * 12 + month;
  const normalizedIndex = Number.isSafeInteger(requestedIndex)
    ? Math.min(currentIndex + 1, Math.max(currentIndex, requestedIndex))
    : currentIndex;

  return {
    year: Math.floor(normalizedIndex / 12),
    month: normalizedIndex % 12,
  };
}

export function getJstDateNumber(date: Date): number {
  return getJstDateParts(date).date;
}

function isValidDateInstance(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function getJstTimeText(date: Date): string {
  return date.toLocaleTimeString("ja-JP", {
    timeZone: JST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getEventDateRange(event: CalendarEvent) {
  if (event.isAllDay) {
    const startDate = parseLocalDate(event.start);
    const endDate = addJstDays(parseLocalDate(event.end), -1);
    return { startDate, endDate };
  }

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  endDate.setMinutes(endDate.getMinutes() - 1);

  return { startDate, endDate };
}

export function isAllDayEvent(event: CalendarEvent): boolean {
  return event.isAllDay;
}

export function isMultiDayEvent(event: CalendarEvent): boolean {
  const { startDate, endDate } = getEventDateRange(event);
  return !isSameJstDay(startDate, endDate);
}

export function formatEventDateRange(event: CalendarEvent): string {
  const { startDate, endDate } = getEventDateRange(event);

  if (isSameJstDay(startDate, endDate)) {
    return formatJstDateLabel(startDate);
  }

  return `${formatJstDateLabel(startDate)} - ${formatJstDateLabel(endDate)}`;
}

export function formatEventTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);

  if (!isValidDateInstance(date)) {
    return "";
  }

  return getJstTimeText(date);
}

export function formatMonthlyEventTime(event: CalendarEvent): string {
  if (isAllDayEvent(event) || event.start === event.end || isMultiDayEvent(event)) {
    return "";
  }

  return `${formatEventTime(event.start)} - ${formatEventTime(event.end)}`;
}
