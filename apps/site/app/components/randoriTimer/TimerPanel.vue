<script setup lang="ts">
  import type { RandoriTimerStatus } from "~/composables/useRandoriTimer";

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
  <section class="card mt-6 overflow-hidden" aria-live="polite">
    <div class="flex items-center justify-between text-sm fg-muted">
      <div aria-hidden="true"></div>
      <span>{{ activeRound }} / {{ totalRounds }}</span>
    </div>
    <div
      class="my-4 text-center font-mono text-7xl font-bold leading-none tracking-tighter sm:text-9xl tabular-nums"
      aria-label="残り時間"
    >
      {{ displayTime }}
    </div>
    <div
      class="flex h-3 flex-row-reverse gap-1"
      role="progressbar"
      aria-label="残りラウンド"
      :aria-valuenow="totalProgress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        v-for="(segment, index) in segments"
        :key="index"
        class="min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
        :style="{ flexGrow: segment.duration }"
      >
        <i
          class="block h-full rounded-full bg-accent transition-[width] duration-800 ease-linear"
          :style="{ width: `${segment.fill}%` }"
        />
      </div>
    </div>
    <div class="mt-5 flex justify-center gap-2">
      <button
        type="button"
        class="button accent px-8 py-3 font-bold before:content-empty"
        :class="running ? 'before:i-ri:pause-fill' : 'before:i-ri:play-fill'"
        :disabled="startDisabled"
        :aria-label="status === 'playing' ? '一時停止' : status === 'paused' ? '再開' : '開始'"
        @click="$emit('toggle')"
      ></button>
      <button
        type="button"
        class="button base bordered-muted border px-4 py-3 before:i-ri:restart-line before:content-empty"
        aria-label="最初からやり直す"
        :disabled="resetDisabled"
        @click="$emit('reset')"
      />
    </div>
  </section>
</template>
