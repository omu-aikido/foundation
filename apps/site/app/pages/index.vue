<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { stack } from "~~/styled-system/patterns";
  import { button } from "~~/styled-system/recipes";

  definePageMeta({
    title: "大阪公立大学合氣道部",
    description:
      "大阪公立大学の森之宮・中百舌鳥・杉本キャンパスで稽古する、体育会所属の合氣道部です。活動内容や稽古予定をご案内します。",
    navigation: { order: 0 },
  });

  const hero = [stack({ gap: "4" }), css({ position: "relative", pt: "12" })];
  const title = css({ textStyle: "h1" });
  const titleBreak = css({ sm: { display: "none" } });
  const lead = css({ maxW: "2/3", lineHeight: "relaxed", color: "fg.base" });
  const actions = css({ display: "inline-flex", gap: "2" });
  const action = [button({ tone: "accent" }), css({ w: "fit", px: "4", py: "2" })];
  const secondary = [button({ tone: "base" }), css({ w: "fit", px: "4", py: "2" })];
  const slideshow = css({ py: "8" });
  const mapTitle = css({ textStyle: "h2", mb: "4" });
</script>

<template>
  <section id="hero-section" :class="hero">
    <h1 :class="title">大阪公立大学<br :class="titleBreak" />合氣道部</h1>
    <p :class="lead">
      大阪公立大学合氣道部は、大阪公立大学（ハム大）の森之宮・中百舌鳥・杉本キャンパスで活動する、体育会所属の合気道団体です。
    </p>
    <div :class="actions">
      <NuxtLink to="/about" :class="action">活動について→</NuxtLink>
      <NuxtLink to="/faq" :class="secondary">よくある質問→</NuxtLink>
    </div>
    <div class="hero-accent" aria-hidden="true" />
  </section>
  <section :class="slideshow"><HomeSlideshow /></section>
  <section>
    <h2 :class="mapTitle">サイトマップ</h2>
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
