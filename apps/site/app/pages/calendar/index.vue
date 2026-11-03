<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { card, link } from "~~/styled-system/recipes";

  definePageMeta({
    title: "稽古予定",
    description:
      "大阪公立大学合氣道部の今後の稽古予定を一覧で確認できます。Googleカレンダーへの追加も可能です。",
    navigation: { parent: "/", order: 3 },
  });

  const page = css({ minH: "60dvh" });
  const heading = css({ textStyle: "h1", mb: "6" });
  const linkRow = css({ mt: "4", textAlign: "right" });
  const monthlyLink = [link(), css({ fontSize: "lg", lineHeight: "lg" })];
  const googleCard = [card(), css({ mt: "4", textAlign: "center" })];
  const textLink = link();
</script>

<template>
  <section :class="page">
    <h1 :class="heading">稽古予定</h1>
    <CalendarList />
  </section>
  <section>
    <p :class="linkRow">
      <NuxtLink to="/calendar/monthly" :class="monthlyLink">1ヶ月ごとの予定</NuxtLink>
    </p>
    <div :class="googleCard">
      <p>
        <a
          href="https://calendar.google.com/calendar/embed?src=aikido.omu%40gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          :class="textLink"
          >Googleカレンダー</a
        >では過去の稽古や1ヶ月以上先の予定も確認できます。
      </p>
      <p>
        <a
          href="https://calendar.google.com/calendar/ical/aikido.omu%40gmail.com/public/basic.ics"
          target="_blank"
          rel="noopener noreferrer"
          :class="textLink"
          >こちら</a
        >からカレンダーを端末へ追加できます。
      </p>
    </div>
  </section>
</template>
