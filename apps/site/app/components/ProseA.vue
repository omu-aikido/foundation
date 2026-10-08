<script setup lang="ts">
  const props = defineProps<{ href?: string; target?: string }>();
  const external = computed(() => Boolean(props.href && /^https?:\/\//.test(props.href)));
</script>

<template>
  <a
    :href="href"
    :target="external ? '_blank' : target"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="external ? 'outer_link' : 'link'"
  >
    <slot />
  </a>
</template>
