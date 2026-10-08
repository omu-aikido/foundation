<script setup lang="ts">
  definePageMeta({
    title: "アプリ",
    description: "ちょっと便利なツール集",
    navigation: { parent: "/", order: 6 },
  });

  const router = useRouter();
  const apps = computed(() =>
    router
      .getRoutes()
      .filter((route) => route.path.startsWith("/apps/") && route.meta.title)
      .map((route) => ({
        path: route.path,
        title: route.meta.title!,
        description: route.meta.description ?? "",
      })),
  );
</script>

<template>
  <section class="mx-auto max-w-3xl py-8">
    <h1 class="h1">アプリ</h1>
    <p class="mt-2 fg-muted">
      稽古に役立つかもしれないツールを公開しています。 予告なく提供を取りやめる場合があります。
      <br />
      ご利用の際は<a class="link" href="/terms-of-service">利用規約</a>をご一読下さい
    </p>
    <nav class="mt-6 grid gap-3 md:grid-cols-2" aria-label="アプリ一覧">
      <NuxtLink
        v-for="app in apps"
        :key="app.path"
        :to="app.path"
        class="card group py-5 no-underline transition-colors hover:fg-accent"
      >
        <span class="min-w-0">
          <span class="block text-lg font-bold fg-base group-hover:fg-accent">{{ app.title }}</span>
          <span
            v-if="app.description"
            class="mt-1 block text-sm leading-relaxed fg-muted group-hover:fg-accent"
          >
            {{ app.description }}
          </span>
        </span>
      </NuxtLink>
    </nav>
  </section>
</template>
