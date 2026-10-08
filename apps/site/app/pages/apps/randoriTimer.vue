<script setup lang="ts">
  definePageMeta({
    title: "乱取りタイマー",
    description: "乱取り特化のタイマー",
  });

  import TimerPanel from "~/components/randoriTimer/TimerPanel.vue";
  import SettingsPanel from "~/components/randoriTimer/SettingsPanel.vue";

  const timer = useRandoriTimer();
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <TimerPanel
      :active-round="timer.activeRound.value"
      :display-time="timer.displayTime.value"
      :durations="timer.durations.value"
      :progress="timer.progress.value"
      :remaining="timer.remaining.value"
      :reset-disabled="timer.resetDisabled.value"
      :running="timer.running.value"
      :start-disabled="timer.startDisabled.value"
      :status="timer.status.value"
      :total-rounds="timer.durations.value.length"
      @reset="timer.reset"
      @toggle="timer.toggle"
    />

    <SettingsPanel
      :background-playback-available="timer.backgroundPlaybackAvailable.value"
      :custom-presets="timer.customPresets.value"
      :durations="timer.durations.value"
      :playback-error="timer.playbackError.value"
      :playback-mode="timer.playbackMode.value"
      :preparation-error="timer.preparationError.value"
      :selected-id="timer.selectedId.value"
      :settings-locked="timer.settingsLocked.value"
      :status="timer.status.value"
      :total-duration="timer.totalDuration.value"
      @delete-preset="timer.deletePreset"
      @retry-preparation="timer.retryPreparation"
      @save-preset="timer.savePreset"
      @set-durations="timer.setDurations"
      @set-playback-mode="timer.setPlaybackMode"
    />
  </section>
</template>
