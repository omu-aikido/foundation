<script setup lang="ts">
  import { css } from "styled-system/css";
  import type { WazaType } from "../utils/lotAikido/types";

  defineProps<{ techniques: WazaType[] }>();

  const wrap = css({ overflowX: "auto", p: "3" });
  const empty = css({
    py: "12",
    textAlign: "center",
    fontSize: "sm",
    lineHeight: "sm",
    color: "fg.muted",
  });
  const table = css({
    w: "full",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "sm",
    lineHeight: "sm",
  });
  const head = css({
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderColor: "border.muted",
    bg: "bg.mutedHalf",
    fontSize: "xs",
    lineHeight: "xs",
    color: "fg.muted",
  });
  const techniqueHead = css({ px: "3", py: "2", fontWeight: "semibold" });
  const rankHead = css({ w: "16", px: "3", py: "2", textAlign: "center", fontWeight: "semibold" });
  const row = css({
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderColor: "border.ghost",
    "&:last-child": { borderBottomWidth: "0" },
  });
  const techniqueCell = css({ px: "3", py: "3", color: "fg.base" });
  const techniqueOut = css({ ml: "2", fontWeight: "semibold" });
  const rankCell = css({
    px: "3",
    py: "3",
    textAlign: "center",
    fontSize: "xs",
    lineHeight: "xs",
    color: "fg.muted",
  });

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
  <div :class="wrap">
    <p v-if="techniques.length === 0" :class="empty">条件に一致する技がありません</p>
    <table v-else style="min-width: -webkit-fill-available" :class="table">
      <thead :class="head">
        <tr>
          <th :class="techniqueHead">技</th>
          <th :class="rankHead">級段</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="technique in techniques" :key="technique.id" :class="row">
          <td :class="techniqueCell">
            <span>{{ technique.waza_in }}</span>
            <span :class="techniqueOut">{{ technique.waza_out }}</span>
          </td>
          <td :class="rankCell">
            {{ toRank(technique.rank) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
