<script setup lang="ts">
  const route = useRoute();
</script>

<template>
  <div>
    <AppHeader />
    <main class="container min-h-90dvh" :aria-label="String(route.name ?? 'page')">
      <AppBreadcrumb />
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
