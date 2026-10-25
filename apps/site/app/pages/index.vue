<script setup lang="ts">
  definePageMeta({
    title: "大阪公立大学合氣道部",
    description:
      "大阪公立大学の森之宮・中百舌鳥・杉本キャンパスで稽古する、体育会所属の合氣道部です。活動内容や稽古予定をご案内します。",
    navigation: { order: 0 },
  });
</script>

<template>
  <section id="hero-section" class="stack relative gap-4 pt-12">
    <h1 class="h1">大阪公立大学<br class="sm:hidden" />合氣道部</h1>
    <p class="max-w-2/3 leading-relaxed fg-base">
      大阪公立大学合氣道部は、大阪公立大学（ハム大）の森之宮・中百舌鳥・杉本キャンパスで活動する、体育会所属の合気道団体です。
    </p>
    <div class="inline-flex gap-2">
      <NuxtLink to="/about" class="button accent w-fit px-4 py-2">活動について→</NuxtLink>
      <NuxtLink to="/faq" class="button base w-fit px-4 py-2">よくある質問→</NuxtLink>
    </div>
    <div class="hero-accent" aria-hidden="true" />
  </section>
  <section class="py-8"><HomeSlideshow /></section>
  <section>
    <h2 class="h2 mb-4">サイトマップ</h2>
    <SiteGuide />
  </section>
</template>

<style scoped>
  #hero-section::before {
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    content: "";
    background: linear-gradient(90deg, transparent, rgb(37 99 235 / 30%), transparent);
  }
  .hero-accent {
    position: absolute;
    top: -30%;
    width: min(500px, 70vw);
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 50%, rgb(37 99 235 / 8%), transparent 70%);
    pointer-events: none;
  }
</style>
