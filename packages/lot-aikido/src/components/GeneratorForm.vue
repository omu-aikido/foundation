<script setup lang="ts">
  import { css } from "styled-system/css";
  import { button, control } from "styled-system/recipes";
  import IconRiShuffleFill from "~icons/ri/shuffle-fill";

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

  const form = css({
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderColor: "border.muted",
  });
  const bar = css({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "3",
    p: "4",
  });
  const filters = css({ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2" });
  const hiddenLabel = css({ srOnly: true });
  const select = [control(), css({ px: "2", py: "1.5", fontSize: "base", lineHeight: "normal" })];
  const countLabel = css({ display: "flex", alignItems: "center", gap: "2", color: "fg.muted" });
  // control の px-3 / py-2 だと件数欄が広い。
  const countInput = [
    control(),
    css({
      w: "24",
      px: "2",
      py: "1.5",
      textAlign: "center",
    }),
  ];
  const actions = css({ display: "flex", alignItems: "center", gap: "3" });
  const sortLabel = css({
    display: "flex",
    cursor: "pointer",
    alignItems: "center",
    gap: "1.5",
    color: "fg.muted",
  });
  const sortInput = [control(), css({ accentColor: "accent.field" })];
  // recipe の button は focus-visible の 1px ring を持たない。shortcut は持っていた。
  const buttonFocus = css({
    _focusVisible: { boxShadow: "ring", _hover: { boxShadow: "ringRaised" } },
  });
  const shuffle = [
    button({ tone: "accent" }),
    buttonFocus,
    css({ px: "3", py: "1.5", fontSize: "sm", lineHeight: "sm", fontWeight: "semibold" }),
  ];
  const shuffleIcon = css({ mr: "1" });
</script>

<template>
  <section :class="form" aria-label="抽選条件">
    <div :class="bar">
      <div :class="filters">
        <label :class="hiddenLabel" for="rank">級・段位</label>
        <select
          id="rank"
          :class="select"
          :value="rank"
          @change="emit('update:rank', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="option in rankOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <label :class="hiddenLabel" for="filter">フィルター</label>
        <select
          id="filter"
          :class="select"
          :value="filter"
          @change="emit('update:filter', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <label :class="countLabel" for="count">
          <input
            id="count"
            :class="countInput"
            min="1"
            type="number"
            :value="count"
            @input="emit('update:count', Number(($event.target as HTMLInputElement).value))"
          />
          件
        </label>
      </div>
      <div :class="actions">
        <label :class="sortLabel">
          <input
            :class="sortInput"
            type="checkbox"
            :checked="sortEnabled"
            @change="emit('update:sortEnabled', ($event.target as HTMLInputElement).checked)"
          />
          ソート
        </label>
        <button type="button" :class="shuffle" @click="emit('shuffle')">
          <IconRiShuffleFill :class="shuffleIcon" aria-hidden="true" />シャッフル
        </button>
      </div>
    </div>
  </section>
</template>
