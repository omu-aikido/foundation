<script setup lang="ts">
  import type { WazaType } from "../utils/lotAikido/types";

  defineProps<{ techniques: WazaType[] }>();

  function toRank(rank: number): string {
    if (rank >= 1) return `${rank}級`;
    if (rank <= -1) {
      const labels = ["", "初", "二", "三", "四", "五", "六", "七", "八", "九"];
      return `${labels[Math.abs(rank)]}段`;
    }
    return "不明";
  }
</script>

<template>
  <div class="overflow-x-auto p-3">
    <p v-if="techniques.length === 0" class="py-12 text-center text-sm fg-muted">
      条件に一致する技がありません
    </p>
    <table
      v-else
      style="min-width: -webkit-fill-available"
      class="w-full border-collapse text-left text-sm"
    >
      <thead class="border-b bg-muted bg-opacity-50 text-xs fg-muted bordered-muted">
        <tr>
          <th class="px-3 py-2 font-semibold">技</th>
          <th class="w-16 px-3 py-2 text-center font-semibold">級段</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="technique in techniques"
          :key="technique.id"
          class="border-b last:border-b-0 bordered-ghost"
        >
          <td class="px-3 py-3 fg-base">
            <span>{{ technique.waza_in }}</span>
            <span class="ml-2 font-semibold">{{ technique.waza_out }}</span>
          </td>
          <td class="px-3 py-3 text-center text-xs fg-muted">
            {{ toRank(technique.rank) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
