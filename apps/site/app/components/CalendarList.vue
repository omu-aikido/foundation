<script setup lang="ts">
  const startDate = getTodayInJst();
  const endDate = new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000);
  const { data: events, error } = await useFetch<CalendarEvent[]>("/__calendar", {
    key: "calendar-list",
    query: {
      start: formatLocalDate(startDate),
      end: formatLocalDate(endDate),
    },
  });

  function titleClass(title: string) {
    if (title.includes("中百舌鳥")) return "event-nakamozu";
    if (title.includes("杉本")) return "event-sugimoto";
    if (title.includes("森之宮")) return "event-morinomiya";
    if (title.includes("会")) return "event-event";
    return "event-default";
  }
</script>

<template>
  <div v-if="error" class="status-error">稽古予定を取得できませんでした。</div>
  <div v-else-if="!events?.length" class="inline-flex gap-2 fg-muted">
    <span class="i-ri:calendar-view h-6 w-6" aria-hidden="true" />
    <p>今後3週間の稽古予定はありません</p>
  </div>
  <div v-else>
    <article
      v-for="(event, index) in events"
      :key="event.id"
      class="stagger-item grid min-w-0 grid-cols-2 border-b px-4 py-5 bordered-muted sm:grid-cols-[1fr_2fr]"
      :class="titleClass(event.title)"
      :style="{ animationDelay: `${index * 60}ms` }"
    >
      <h2 class="h3">{{ event.title }}</h2>
      <div class="flex flex-col">
        <div class="inline-flex items-center gap-2 text-sm fg-muted">
          <span class="i-ri:calendar-view h-4 w-4" aria-hidden="true" />{{
            formatEventDateRange(event)
          }}
        </div>
        <div
          v-if="!isAllDayEvent(event) && event.start !== event.end && !isMultiDayEvent(event)"
          class="inline-flex items-center gap-2 text-sm fg-muted"
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
