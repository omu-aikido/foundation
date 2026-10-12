<script setup lang="ts">
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
  function badge(title: string) {
    if (title.includes("中百舌鳥")) return "event-nakamozu";
    if (title.includes("杉本")) return "event-sugimoto";
    if (title.includes("森之宮")) return "event-morinomiya";
    if (title.includes("会")) return "event-event";
    return "event-default";
  }
</script>

<template>
  <div v-if="error" class="mb-3 text-error" role="alert">
    <p>稽古予定を取得できませんでした。再読み込みしてください。</p>
    <button type="button" class="button mt-2" :disabled="pending" @click="refresh()">
      {{ pending ? "再読み込み中..." : "予定を再読み込み" }}
    </button>
  </div>
  <div class="overflow-hidden" role="grid" aria-labelledby="calendar-title">
    <h2 id="calendar-title" class="h2 mb-4 flex items-center justify-between">
      <NuxtLink
        v-if="prevHref"
        :to="prevHref"
        class="rounded p-2 hover:bg-zinc-200"
        aria-label="前の月"
        ><span class="i-ri:arrow-left-s-line block h-5 w-5" /></NuxtLink
      ><span v-else class="p-2 opacity-30" aria-disabled="true"
        ><span class="i-ri:arrow-left-s-line block h-5 w-5"
      /></span>
      <span>{{ getJstMonthName(year, month) }}</span>
      <NuxtLink
        v-if="nextHref"
        :to="nextHref"
        class="rounded p-2 hover:bg-zinc-200"
        aria-label="次の月"
        ><span class="i-ri:arrow-right-s-line block h-5 w-5" /></NuxtLink
      ><span v-else class="p-2 opacity-30" aria-disabled="true"
        ><span class="i-ri:arrow-right-s-line block h-5 w-5"
      /></span>
    </h2>
    <div class="mb-2 grid grid-cols-7" role="row">
      <div
        v-for="day in ['日', '月', '火', '水', '木', '金', '土']"
        :key="day"
        class="text-center text-sm font-semibold"
        :class="day === '日' ? 'text-red-500' : day === '土' ? 'text-blue-500' : 'fg-base'"
      >
        {{ day }}
      </div>
    </div>
    <div class="grid grid-cols-7 gap-1" role="rowgroup">
      <div
        v-for="(date, index) in days"
        :key="date ? getJstDateKey(date) : `empty-${index}`"
        role="gridcell"
        class="min-h-24 rounded-sm border p-1 bordered-muted bg-zinc-200/20 dark:bg-zinc-800/20"
        :class="!date && 'opacity-60'"
      >
        <template v-if="date"
          ><time class="ml-1 text-xs font-semibold" :datetime="formatLocalDate(date)">{{
            getJstDateNumber(date)
          }}</time>
          <ul class="mt-1 space-y-1 p-0">
            <li
              v-for="event in byDate.get(getJstDateKey(date)) ?? []"
              :key="event.id"
              class="list-none rounded px-1 py-0.5 text-[11px] leading-tight"
              :class="badge(event.title)"
              :title="event.title"
            >
              <span class="block truncate">{{ event.title }}</span>
              <span
                v-if="formatMonthlyEventTime(event)"
                class="block truncate text-[10px] opacity-80"
                >{{ formatMonthlyEventTime(event) }}</span
              >
            </li>
          </ul></template
        >
      </div>
    </div>
  </div>
</template>
