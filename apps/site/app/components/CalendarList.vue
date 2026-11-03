<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { button } from "~~/styled-system/recipes";

  const startDate = getTodayInJst();
  const endDate = new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000);
  const {
    data: events,
    error,
    pending,
    refresh,
  } = await useFetch<CalendarEvent[]>("/__calendar", {
    key: "calendar-list",
    query: {
      start: formatLocalDate(startDate),
      end: formatLocalDate(endDate),
    },
  });

  const eventColor = {
    "event.nakamozu": css({ color: "event.nakamozu" }),
    "event.sugimoto": css({ color: "event.sugimoto" }),
    "event.morinomiya": css({ color: "event.morinomiya" }),
    "event.event": css({ color: "event.event" }),
    "event.default": css({ color: "event.default" }),
  };
  type EventColor = keyof typeof eventColor;
  function titleClass(title: string): EventColor {
    if (title.includes("中百舌鳥")) return "event.nakamozu";
    if (title.includes("杉本")) return "event.sugimoto";
    if (title.includes("森之宮")) return "event.morinomiya";
    if (title.includes("会")) return "event.event";
    return "event.default";
  }

  const alert = css({ mb: "3", color: "fg.error" });
  const retry = [button(), css({ mt: "2" })];
  const empty = css({ display: "inline-flex", gap: "2", color: "fg.muted" });
  const article = css({
    display: "grid",
    minW: "0",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderColor: "border.muted",
    px: "4",
    py: "5",
    sm: { gridTemplateColumns: "1fr 2fr" },
  });
  const title = css({ textStyle: "h3" });
  const details = css({ display: "flex", flexDirection: "column" });
  const meta = css({
    display: "inline-flex",
    alignItems: "center",
    gap: "2",
    fontSize: "sm",
    lineHeight: "sm",
    color: "fg.muted",
  });
</script>

<template>
  <div v-if="error" :class="alert" role="alert">
    <p>稽古予定を取得できませんでした。再読み込みしてください。</p>
    <button type="button" :class="retry" :disabled="pending" @click="refresh()">
      {{ pending ? "再読み込み中..." : "予定を再読み込み" }}
    </button>
  </div>
  <div v-else-if="!events?.length" :class="empty">
    <span class="i-ri:calendar-view h-6 w-6" aria-hidden="true" />
    <p>今後3週間の稽古予定はありません</p>
  </div>
  <div v-else>
    <article
      v-for="(event, index) in events"
      :key="event.id"
      class="stagger-item"
      :class="[article, eventColor[titleClass(event.title)]]"
      :style="{ animationDelay: `${index * 60}ms` }"
    >
      <h2 :class="title">{{ event.title }}</h2>
      <div :class="details">
        <div :class="meta">
          <span class="i-ri:calendar-view h-4 w-4" aria-hidden="true" />{{
            formatEventDateRange(event)
          }}
        </div>
        <div
          v-if="!isAllDayEvent(event) && event.start !== event.end && !isMultiDayEvent(event)"
          :class="meta"
        >
          <span class="i-ri:time-line h-4 w-4" aria-hidden="true" />{{
            formatEventTime(event.start)
          }}
          -
          {{ formatEventTime(event.end) }}
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
  .stagger-item {
    animation: fade-slide 0.4s ease both;
  }
  @keyframes fade-slide {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .stagger-item {
      animation: none;
    }
  }
</style>
