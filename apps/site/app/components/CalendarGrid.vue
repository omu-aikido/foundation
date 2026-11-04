<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { button } from "~~/styled-system/recipes";
  import IconRiArrowLeftSLine from "~icons/ri/arrow-left-s-line";
  import IconRiArrowRightSLine from "~icons/ri/arrow-right-s-line";

  const props = defineProps<{
    year: number;
    month: number;
    prevHref?: string;
    nextHref?: string;
  }>();
  const start = createJstDate(props.year, props.month, 1);
  const end = createJstDate(props.year, props.month + 1, 0);
  const {
    data: events,
    error,
    pending,
    refresh,
  } = await useFetch<CalendarEvent[]>("/__calendar", {
    key: `calendar-grid:${props.year}-${props.month}`,
    query: {
      start: formatLocalDate(start),
      end: formatLocalDate(end),
    },
  });

  const days = computed(() => {
    const result: Array<Date | null> = Array(getJstWeekday(props.year, props.month, 1)).fill(null);
    for (let day = 1; day <= getJstDaysInMonth(props.year, props.month); day++)
      result.push(createJstDate(props.year, props.month, day));
    while (result.length % 7) result.push(null);
    return result;
  });
  const byDate = computed(() => {
    const result = new Map<string, NonNullable<typeof events.value>>();
    for (const event of events.value ?? []) {
      const { startDate, endDate } = getEventDateRange(event);
      for (let date = startDate; date <= endDate; date = new Date(date.getTime() + 86400000)) {
        const key = getJstDateKey(date);
        result.set(key, [...(result.get(key) ?? []), event]);
      }
    }
    return result;
  });
  const eventColor = {
    "event.nakamozu": css({ color: "event.nakamozu" }),
    "event.sugimoto": css({ color: "event.sugimoto" }),
    "event.morinomiya": css({ color: "event.morinomiya" }),
    "event.event": css({ color: "event.event" }),
    "event.default": css({ color: "event.default" }),
  };
  type EventColor = keyof typeof eventColor;
  function badge(title: string): EventColor {
    if (title.includes("中百舌鳥")) return "event.nakamozu";
    if (title.includes("杉本")) return "event.sugimoto";
    if (title.includes("森之宮")) return "event.morinomiya";
    if (title.includes("会")) return "event.event";
    return "event.default";
  }
  const weekdayColor = {
    "calendar.sunday": css({ color: "calendar.sunday" }),
    "calendar.saturday": css({ color: "calendar.saturday" }),
    "fg.base": css({ color: "fg.base" }),
  };
  type WeekdayColor = keyof typeof weekdayColor;
  function weekdayTone(day: string): WeekdayColor {
    if (day === "日") return "calendar.sunday";
    if (day === "土") return "calendar.saturday";
    return "fg.base";
  }

  const alert = css({ mb: "3", color: "fg.error" });
  const retry = [button(), css({ mt: "2" })];
  const frame = css({ overflow: "hidden" });
  const heading = css({
    textStyle: "h2",
    mb: "4",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  });
  const monthLink = css({
    borderRadius: "md",
    p: "2",
    _hover: { bg: "bg.muted" },
  });
  const monthDisabled = css({ p: "2", opacity: "0.3" });
  const weekdays = css({
    mb: "2",
    display: "grid",
    gridTemplateColumns: "repeat(7,minmax(0,1fr))",
  });
  const weekday = css({
    textAlign: "center",
    fontSize: "sm",
    fontWeight: "semibold",
    lineHeight: "sm",
  });
  const cells = css({
    display: "grid",
    gridTemplateColumns: "repeat(7,minmax(0,1fr))",
    gap: "1",
  });
  const cell = css({
    minH: "24",
    minW: "0",
    borderRadius: "sm",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border.muted",
    p: "1",
    bg: "bg.subtle",
  });
  const cellMuted = css({ opacity: "0.6" });
  const dateNumber = css({
    ml: "1",
    fontSize: "xs",
    fontWeight: "semibold",
    lineHeight: "xs",
  });
  const eventsList = css({
    mt: "1",
    p: "0",
    "& > :not(:last-child)": { mb: "1" },
  });
  const eventItem = css({
    listStyle: "none",
    borderRadius: "md",
    px: "1",
    py: "0.5",
    fontSize: "xs",
    lineHeight: "tight",
  });
  const eventTitle = css({ display: "block", overflowWrap: "anywhere" });
  const monthIcon = css({ display: "block", w: "5", h: "5" });
  const eventTime = css({
    display: "block",
    overflowWrap: "anywhere",
    fontSize: "xs",
    lineHeight: "xs",
    opacity: "0.8",
  });
</script>

<template>
  <div v-if="error" :class="alert" role="alert">
    <p>稽古予定を取得できませんでした。再読み込みしてください。</p>
    <button type="button" :class="retry" :disabled="pending" @click="refresh()">
      {{ pending ? "再読み込み中..." : "予定を再読み込み" }}
    </button>
  </div>
  <div :class="frame">
    <h2 :class="heading">
      <NuxtLink v-if="prevHref" :to="prevHref" :class="monthLink" aria-label="前の月"
        ><IconRiArrowLeftSLine :class="monthIcon" /></NuxtLink
      ><span v-else :class="monthDisabled" aria-disabled="true"
        ><IconRiArrowLeftSLine :class="monthIcon"
      /></span>
      <span>{{ getJstMonthName(year, month) }}</span>
      <NuxtLink v-if="nextHref" :to="nextHref" :class="monthLink" aria-label="次の月"
        ><IconRiArrowRightSLine :class="monthIcon" /></NuxtLink
      ><span v-else :class="monthDisabled" aria-disabled="true"
        ><IconRiArrowRightSLine :class="monthIcon"
      /></span>
    </h2>
    <div :class="weekdays">
      <div
        v-for="day in ['日', '月', '火', '水', '木', '金', '土']"
        :key="day"
        :class="[weekday, weekdayColor[weekdayTone(day)]]"
      >
        {{ day }}
      </div>
    </div>
    <div :class="cells">
      <div
        v-for="(date, index) in days"
        :key="date ? getJstDateKey(date) : `empty-${index}`"
        :class="[cell, !date && cellMuted]"
      >
        <template v-if="date"
          ><time :class="dateNumber" :datetime="formatLocalDate(date)">{{
            getJstDateNumber(date)
          }}</time>
          <ul :class="eventsList">
            <li
              v-for="event in byDate.get(getJstDateKey(date)) ?? []"
              :key="event.id"
              :class="[eventItem, eventColor[badge(event.title)]]"
            >
              <span :class="eventTitle">{{ event.title }}</span>
              <span v-if="formatMonthlyEventTime(event)" :class="eventTime">{{
                formatMonthlyEventTime(event)
              }}</span>
            </li>
          </ul></template
        >
      </div>
    </div>
  </div>
</template>
