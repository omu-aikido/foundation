<script setup lang="ts">
  definePageMeta({
    title: "稽古予定",
    description: "月ごとの稽古予定",
    key: (route) => route.fullPath,
  });

  const route = useRoute();
  const now = new Date();
  const current = getCurrentJstYearMonth(now);
  const requestedYear = Number.parseInt(String(route.query.year ?? current.year), 10);
  const requestedMonth = Number.parseInt(String(route.query.month ?? current.month + 1), 10) - 1;
  const { year, month } = clampCalendarMonth(requestedYear, requestedMonth, now);
  const selectedIndex = year * 12 + month;
  const currentIndex = current.year * 12 + current.month;
  const href = (date: Date) =>
    `/calendar/monthly?year=${date.getFullYear()}&month=${date.getMonth() + 1}`;
  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  const canPrev = selectedIndex > currentIndex;
  const canNext = selectedIndex < currentIndex + 1;
</script>

<template>
  <section class="min-h-60dvh">
    <h1 class="h1 mb-6">稽古予定</h1>
    <CalendarGrid
      :year="year"
      :month="month"
      :prev-href="canPrev ? href(prev) : undefined"
      :next-href="canNext ? href(next) : undefined"
    />
  </section>
  <section class="print:hidden">
    <p class="mt-4 text-right">
      <NuxtLink to="/calendar" class="link text-lg">リスト表示</NuxtLink>
    </p>
  </section>
</template>
