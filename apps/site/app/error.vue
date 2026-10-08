<script setup lang="ts">
  const props = defineProps<{ error: { statusCode?: number } }>();

  useSeoMeta({
    title: `${props.error.statusCode ?? 404} - ページが見つかりません | 大阪公立大学合氣道部`,
    robots: "noindex",
  });
</script>

<template>
  <NuxtLayout>
    <section class="min-h-60dvh flex items-center justify-center px-4">
      <div class="w-full max-w-2xl p-10 text-center">
        <div class="mb-6 flex flex-col items-center justify-center">
          <div class="text-7xl font-extrabold sm:text-8xl">
            {{ error.statusCode ?? 404 }}
          </div>
          <div class="font-mono text-4xl font-bold sm:text-6xl">Not Found</div>
        </div>
        <p class="fg-base mb-6">お探しのページは移動したか、存在しない可能性があります。</p>
        <NuxtLink to="/" class="button accent inline-block px-4 py-2"> ホームに戻る </NuxtLink>
      </div>
    </section>
  </NuxtLayout>
</template>
