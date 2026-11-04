<script setup lang="ts">
  import { css } from "styled-system/css";
  import { button, card } from "styled-system/recipes";
  import IconRiPauseFill from "~icons/ri/pause-fill";
  import IconRiPlayFill from "~icons/ri/play-fill";
  import IconRiRestartLine from "~icons/ri/restart-line";
  import { computed } from "vue";
  import type { RandoriTimerStatus } from "../composables/useRandoriTimer";

  const props = defineProps<{
    activeRound: number;
    displayTime: string;
    durations: readonly number[];
    progress: number;
    remaining: number;
    resetDisabled: boolean;
    running: boolean;
    startDisabled: boolean;
    status: RandoriTimerStatus;
    totalRounds: number;
  }>();

  defineEmits<{ reset: []; toggle: [] }>();

  const panel = [card(), css({ mt: "6", overflow: "hidden" })];
  const roundRow = css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "sm",
    lineHeight: "sm",
    color: "fg.muted",
  });
  const time = css({
    my: "4",
    textAlign: "center",
    fontFamily: "mono",
    fontSize: "7xl",
    fontWeight: "bold",
    lineHeight: "none",
    letterSpacing: "tighter",
    fontVariantNumeric: "tabular-nums",
    sm: { fontSize: "9xl" },
  });
  const progressBar = css({
    display: "flex",
    h: "3",
    flexDirection: "row-reverse",
    gap: "1",
  });
  const segmentTrack = css({
    minW: "0",
    flex: "1",
    overflow: "hidden",
    borderRadius: "full",
    bg: "bg.muted",
  });
  const segmentFill = css({
    display: "block",
    h: "full",
    borderRadius: "full",
    bg: "bg.accent",
    transitionProperty: "width",
    transitionDuration: "0.8s",
    transitionTimingFunction: "linear",
  });
  const controls = css({ mt: "5", display: "flex", justifyContent: "center", gap: "2" });
  // recipe の button は focus-visible の 1px ring を持たない。shortcut は持っていた。
  const buttonFocus = css({
    _focusVisible: { boxShadow: "ring", _hover: { boxShadow: "ringRaised" } },
  });
  const toggleButton = [
    button({ tone: "accent" }),
    buttonFocus,
    css({ px: "8", py: "3", fontWeight: "bold" }),
  ];
  const resetButton = [
    button({ tone: "base" }),
    buttonFocus,
    css({
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.muted",
      px: "4",
      py: "3",
    }),
  ];

  const segments = computed(() =>
    props.durations.map((duration, index) => ({
      duration,
      fill:
        index + 1 < props.activeRound ? 0 : index + 1 === props.activeRound ? props.progress : 100,
    })),
  );

  const totalProgress = computed(() => {
    const totalDuration = props.durations.reduce((sum, duration) => sum + duration, 0);
    if (totalDuration === 0) return 0;

    return (
      segments.value.reduce((sum, segment) => sum + segment.duration * segment.fill, 0) /
      totalDuration
    );
  });
</script>

<template>
  <section :class="panel" aria-live="polite">
    <div :class="roundRow">
      <div aria-hidden="true"></div>
      <span>{{ activeRound }} / {{ totalRounds }}</span>
    </div>
    <div :class="time" aria-label="残り時間">
      {{ displayTime }}
    </div>
    <div
      :class="progressBar"
      role="progressbar"
      aria-label="残りラウンド"
      :aria-valuenow="totalProgress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        v-for="(segment, index) in segments"
        :key="index"
        :class="segmentTrack"
        :style="{ flexGrow: segment.duration }"
      >
        <i :class="segmentFill" :style="{ width: `${segment.fill}%` }" />
      </div>
    </div>
    <div :class="controls">
      <button
        type="button"
        :class="toggleButton"
        :disabled="startDisabled"
        :aria-label="status === 'playing' ? '一時停止' : status === 'paused' ? '再開' : '開始'"
        @click="$emit('toggle')"
      >
        <IconRiPauseFill v-if="running" aria-hidden="true" />
        <IconRiPlayFill v-else aria-hidden="true" />
      </button>
      <button
        type="button"
        :class="resetButton"
        aria-label="最初からやり直す"
        :disabled="resetDisabled"
        @click="$emit('reset')"
      >
        <IconRiRestartLine aria-hidden="true" />
      </button>
    </div>
  </section>
</template>
