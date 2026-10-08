<script setup lang="ts">
  import { generatedContent } from "~/generated/content";

  const props = defineProps<{ path: keyof typeof generatedContent }>();
  const page = generatedContent[props.path];
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" });
  }
</script>

<template>
  <MarkdownPage>
    <!-- HTML is generated from repository-owned Markdown, never user input. -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="page.html" />
  </MarkdownPage>
</template>
