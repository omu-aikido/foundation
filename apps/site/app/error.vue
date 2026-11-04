<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { button } from "~~/styled-system/recipes";

  const props = defineProps<{ error: { statusCode?: number } }>();
  const statusCode = props.error.statusCode ?? 404;
  const notFound = statusCode === 404;

  useSeoMeta({
    title: notFound
      ? "404 - ページが見つかりません | 大阪公立大学合氣道部"
      : `${statusCode} - ページを表示できませんでした | 大阪公立大学合氣道部`,
    robots: "noindex",
  });

  const page = css({
    minH: "60dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    px: "4",
  });
  const panel = css({ w: "full", maxW: "2xl", p: "10", textAlign: "center" });
  const status = css({
    mb: "6",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  });
  const code = css({
    fontSize: "7xl",
    fontWeight: "extrabold",
    lineHeight: "none",
    sm: { fontSize: "8xl" },
  });
  const label = css({
    fontFamily: "mono",
    fontSize: "4xl",
    fontWeight: "bold",
    lineHeight: "4xl",
    sm: { fontSize: "6xl", lineHeight: "none" },
  });
  const message = css({ color: "fg.base", mb: "6" });
  const home = [button({ tone: "accent" }), css({ display: "inline-block", px: "4", py: "2" })];
</script>

<template>
  <NuxtLayout>
    <section :class="page">
      <div :class="panel">
        <div :class="status">
          <div :class="code">
            {{ statusCode }}
          </div>
          <div :class="label">
            {{ notFound ? "Not Found" : "Error" }}
          </div>
        </div>
        <p :class="message">
          {{
            notFound
              ? "お探しのページは移動したか、存在しない可能性があります。"
              : "ページを表示できませんでした。時間をおいて再読み込みしてください。"
          }}
        </p>
        <NuxtLink to="/" :class="home"> ホームに戻る </NuxtLink>
      </div>
    </section>
  </NuxtLayout>
</template>
