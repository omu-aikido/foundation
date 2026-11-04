<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { card, link } from "~~/styled-system/recipes";

  definePageMeta({
    title: "アプリ",
    description: "大阪公立大学合氣道部が公開しているツールを利用できます。",
    navigation: { parent: "/", order: 6 },
  });

  const router = useRouter();
  const apps = computed(() =>
    router
      .getRoutes()
      .filter((route) => route.path.startsWith("/apps/") && route.meta.title)
      .map((route) => ({
        path: route.path,
        title: route.meta.title!,
        description: route.meta.description ?? "",
      })),
  );

  const page = css({ mx: "auto", maxW: "3xl", py: "8" });
  const title = css({ textStyle: "h1" });
  const lead = css({ mt: "2", color: "fg.muted" });
  const textLink = link();
  const list = css({
    mt: "6",
    display: "grid",
    gap: "3",
    md: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  });
  const appLink = [
    card(),
    css({
      py: "5",
      textDecoration: "none",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: { color: "fg.accent" },
    }),
  ];
  const appBody = css({ minW: "0" });
  const appTitle = css({
    display: "block",
    fontSize: "lg",
    lineHeight: "lg",
    fontWeight: "bold",
    color: "fg.base",
    _groupHover: { color: "fg.accent" },
  });
  const appDescription = css({
    mt: "1",
    display: "block",
    fontSize: "sm",
    lineHeight: "relaxed",
    color: "fg.muted",
    _groupHover: { color: "fg.accent" },
  });
</script>

<template>
  <section :class="page">
    <h1 :class="title">アプリ</h1>
    <p :class="lead">
      稽古に役立つかもしれないツールを公開しています。 予告なく提供を取りやめる場合があります。
      <br />
      ご利用の際は<a :class="textLink" href="/terms-of-service">利用規約</a>をご一読下さい
    </p>
    <nav :class="list" aria-label="アプリ一覧">
      <NuxtLink v-for="app in apps" :key="app.path" :to="app.path" class="group" :class="appLink">
        <span :class="appBody">
          <span :class="appTitle">{{ app.title }}</span>
          <span v-if="app.description" :class="appDescription">
            {{ app.description }}
          </span>
        </span>
      </NuxtLink>
    </nav>
  </section>
</template>
