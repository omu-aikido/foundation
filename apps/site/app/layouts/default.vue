<script setup lang="ts">
  import { css } from "~~/styled-system/css";
  import { container } from "~~/styled-system/patterns";

  const main = [container(), css({ minH: "90dvh" })];
</script>

<template>
  <div>
    <AppHeader />
    <main :class="main">
      <AppBreadcrumb />
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
