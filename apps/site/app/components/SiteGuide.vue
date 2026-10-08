<script setup lang="ts">
  const { navlinks } = useNavigation();
  const mainNav = computed(() => navlinks.value[0]?.children ?? []);
</script>

<template>
  <nav aria-label="サイト案内" class="grid grid-cols-1 gap-3 min-[441px]:grid-cols-3">
    <NuxtLink
      v-for="item in mainNav"
      :key="item.path"
      :to="item.path"
      class="card group relative grid min-h-18 overflow-hidden no-underline transition-[transform,border-color,background] duration-180 ease-out hover:-translate-y-0.5 hover:bordered-accent hover:bg-sky-600/8 motion-reduce:transition-none"
    >
      <span class="self-center">
        <span class="block text-[1.08rem] font-bold">{{ item.title }}</span>
        <span v-if="item.description" class="mt-1 block flex-1 text-xs leading-1.5 fg-muted">
          {{ item.description }}
        </span>
      </span>
      <span
        class="i-ri:arrow-right-up-line absolute right-4 top-4 fg-accent transition-transform duration-180 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </NuxtLink>
  </nav>
</template>
