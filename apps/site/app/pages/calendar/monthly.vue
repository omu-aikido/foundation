<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { link } from "~~/styled-system/recipes";

  definePageMeta({
    title: "1ヶ月ごとの稽古予定",
    description: "大阪公立大学合氣道部の稽古予定を月ごとのカレンダーで確認できます。",
    navigation: { parent: "/calendar", order: 1 },
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

  const page = css({ minH: "60dvh" });
  const heading = css({ textStyle: "h1", mb: "6" });
  const back = css({ _print: { display: "none" } });
  const linkRow = css({ mt: "4", textAlign: "right" });
  const listLink = [link(), css({ fontSize: "lg", lineHeight: "lg" })];
</script>

<template>
  <section :class="page">
    <h1 :class="heading">稽古予定</h1>
    <CalendarGrid
      :year="year"
      :month="month"
      :prev-href="canPrev ? href(prev) : undefined"
      :next-href="canNext ? href(next) : undefined"
    />
  </section>
  <section :class="back">
    <p :class="linkRow">
      <NuxtLink to="/calendar" :class="listLink">リスト表示</NuxtLink>
    </p>
  </section>
</template>
