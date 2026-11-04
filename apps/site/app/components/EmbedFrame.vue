<script setup lang="ts">
  import { css } from "~~/styled-system/css";

  withDefaults(defineProps<{ src: string; title: string }>(), {
    title: "Embedded content",
  });

  const frame = css({
    aspectRatio: "video",
    h: "full",
    w: "full",
    overflow: "hidden",
    rounded: "lg",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border.muted",
  });
  const embedded = css({
    position: "relative",
    h: "inherit",
    w: "full",
    borderWidth: "0",
    _dark: {
      filter: "auto",
      contrast: "90%",
      invert: "100%",
    },
  });
</script>

<template>
  <div :class="frame">
    <iframe :src="src" :title="title" loading="lazy" allowfullscreen :class="embedded" />
  </div>
</template>
