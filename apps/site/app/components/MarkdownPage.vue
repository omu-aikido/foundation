<script setup lang="ts">
  import { container } from "~~/styled-system/patterns";
  import { prose } from "~~/styled-system/recipes";

  const article = [container(), prose()];
</script>

<template>
  <article :class="article">
    <slot />
  </article>
</template>
