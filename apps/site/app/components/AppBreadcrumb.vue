<script setup lang="ts">
  const route = useRoute();
  const { generateBreadcrumbs } = useNavigation();
  const breadcrumbs = computed(() => generateBreadcrumbs(route.path));
</script>

<template>
  <nav
    v-if="breadcrumbs.length > 1"
    aria-label="パンくずリスト"
    class="mx-auto mb-8 w-full max-w-5xl px-4 pt-6 md:px-6"
  >
    <ol class="flex items-center gap-2 text-sm fg-muted">
      <li v-for="(item, index) in breadcrumbs" :key="item.path" class="flex items-center gap-2">
        <span v-if="index > 0" class="fg-ghost" aria-hidden="true">/</span>
        <span v-if="item.isCurrent" class="font-semibold fg-base">
          {{ item.title }}
        </span>
        <NuxtLink v-else :to="item.path" class="link">
          {{ item.title }}
        </NuxtLink>
      </li>
    </ol>
  </nav>
</template>
