<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { link } from "~~/styled-system/recipes";

  const route = useRoute();
  const { generateBreadcrumbs } = useNavigation();
  const breadcrumbs = computed(() => generateBreadcrumbs(route.path));
  const nav = css({
    mx: "auto",
    mb: "8",
    w: "full",
    maxW: "5xl",
    px: "4",
    pt: "6",
    md: { px: "6" },
  });
  const list = css({
    display: "flex",
    alignItems: "center",
    gap: "2",
    fontSize: "sm",
    lineHeight: "sm",
    color: "fg.muted",
  });
  const crumbItem = css({ display: "flex", alignItems: "center", gap: "2" });
  const separator = css({ color: "fg.ghost" });
  const current = css({ fontWeight: "semibold", color: "fg.base" });
  const crumb = link();
</script>

<template>
  <nav v-if="breadcrumbs.length > 1" aria-label="パンくずリスト" :class="nav">
    <ol :class="list">
      <li v-for="(item, index) in breadcrumbs" :key="item.path" :class="crumbItem">
        <span v-if="index > 0" :class="separator" aria-hidden="true">/</span>
        <span v-if="item.isCurrent" :class="current">
          {{ item.title }}
        </span>
        <NuxtLink v-else :to="item.path" :class="crumb">
          {{ item.title }}
        </NuxtLink>
      </li>
    </ol>
  </nav>
</template>
