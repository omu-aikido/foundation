<script setup lang="ts">
  definePageMeta({
    title: "稽古予定",
    description: "今後の稽古予定",
    navigation: { parent: "/", order: 3 },
  });
</script>

<template>
  <section class="min-h-60dvh">
    <h1 class="h1 mb-6">稽古予定</h1>
    <CalendarList />
  </section>
  <section>
    <p class="mt-4 text-right">
      <NuxtLink to="/calendar/monthly" class="link text-lg">1ヶ月ごとの予定</NuxtLink>
    </p>
    <div class="card mt-4 text-center">
      <p>
        <a
          href="https://calendar.google.com/calendar/embed?src=aikido.omu%40gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          class="link"
          >Googleカレンダー</a
        >では過去の稽古や1ヶ月以上先の予定も確認できます。
      </p>
      <p>
        <a
          href="https://calendar.google.com/calendar/ical/aikido.omu%40gmail.com/public/basic.ics"
          target="_blank"
          rel="noopener noreferrer"
          class="link"
          >こちら</a
        >からカレンダーを端末へ追加できます。
      </p>
    </div>
  </section>
</template>
