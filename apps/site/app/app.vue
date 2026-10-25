<script setup lang="ts">
  const route = useRoute();
  const siteName = "大阪公立大学合氣道部";
  const image = "https://omu-aikido.com/images/hero/bea041cf.png";
  const seo = computed(() =>
    createSeoMeta(
      { path: route.path, title: route.meta.title, description: route.meta.description },
      siteName,
      image,
    ),
  );

  useSeoMeta({
    title: computed(() => seo.value.title),
    description: computed(() => seo.value.description),
    ogTitle: computed(() => seo.value.ogTitle),
    ogDescription: computed(() => seo.value.ogDescription),
    ogSiteName: computed(() => seo.value.ogSiteName),
    ogUrl: computed(() => seo.value.ogUrl),
    ogType: computed(() => seo.value.ogType),
    ogImage: computed(() => seo.value.ogImage),
    ogImageWidth: computed(() => seo.value.ogImageWidth),
    ogImageHeight: computed(() => seo.value.ogImageHeight),
    ogImageAlt: computed(() => seo.value.ogImageAlt),
    ogLocale: computed(() => seo.value.ogLocale),
    twitterCard: computed(() => seo.value.twitterCard),
    twitterTitle: computed(() => seo.value.twitterTitle),
    twitterDescription: computed(() => seo.value.twitterDescription),
    twitterImage: computed(() => seo.value.twitterImage),
  });
  useHead({ link: [{ rel: "canonical", href: computed(() => seo.value.ogUrl) }] });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
