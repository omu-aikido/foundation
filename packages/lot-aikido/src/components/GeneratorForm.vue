<script setup lang="ts">
  defineProps<{
    rank: number;
    filter: string;
    count: number;
    sortEnabled: boolean;
    rankOptions: { value: number; label: string }[];
    filterOptions: { value: string; label: string }[];
  }>();

  const emit = defineEmits<{
    "update:rank": [value: number];
    "update:filter": [value: string];
    "update:count": [value: number];
    "update:sortEnabled": [value: boolean];
    shuffle: [];
  }>();
</script>

<template>
  <section class="border-b bordered-muted" aria-label="抽選条件">
    <div class="flex flex-wrap items-center justify-between gap-3 p-4">
      <div class="flex flex-wrap items-center gap-2">
        <label class="sr-only" for="rank">級・段位</label>
        <select
          id="rank"
          class="control rounded-sm px-2 py-1.5 text-base"
          :value="rank"
          @change="emit('update:rank', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="option in rankOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <label class="sr-only" for="filter">フィルター</label>
        <select
          id="filter"
          class="control rounded-sm px-2 py-1.5 text-base"
          :value="filter"
          @change="emit('update:filter', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <label class="flex items-center gap-2 fg-muted" for="count">
          <input
            id="count"
            class="control w-24 rounded-sm px-2 py-1.5 text-center"
            min="1"
            type="number"
            :value="count"
            @input="emit('update:count', Number(($event.target as HTMLInputElement).value))"
          />
          件
        </label>
      </div>
      <div class="flex items-center gap-3">
        <label class="flex cursor-pointer items-center gap-1.5 fg-muted">
          <input
            class="accent-sky-600"
            type="checkbox"
            :checked="sortEnabled"
            @change="emit('update:sortEnabled', ($event.target as HTMLInputElement).checked)"
          />
          ソート
        </label>
        <button
          type="button"
          class="button accent px-3 py-1.5 text-sm font-semibold"
          @click="emit('shuffle')"
        >
          <span class="i-ri:shuffle-fill mr-1" aria-hidden="true" />シャッフル
        </button>
      </div>
    </div>
  </section>
</template>
