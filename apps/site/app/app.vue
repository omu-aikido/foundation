<script setup lang="ts">
  const route = useRoute();
  const siteName = "大阪公立大学合氣道部";
  const canonical = computed(() => `https://omu-aikido.com${route.path === "/" ? "" : route.path}`);

  useSeoMeta({
    title: computed(() => (route.meta.title ? `${route.meta.title} | ${siteName}` : siteName)),
    description: computed(() => route.meta.description ?? ""),
  });
  useHead({ link: [{ rel: "canonical", href: canonical }] });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
