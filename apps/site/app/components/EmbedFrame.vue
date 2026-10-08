<script setup lang="ts">
  withDefaults(defineProps<{ src: string; title: string }>(), {
    title: "Embedded content",
  });
</script>

<template>
  <div class="aspect-[16/9] h-full w-full overflow-hidden rounded-lg border bordered-muted">
    <iframe
      :src="src"
      :title="title"
      loading="lazy"
      allowfullscreen
      class="relative h-inherit w-full border-0 dark:contrast-90 dark:invert"
    />
  </div>
</template>
