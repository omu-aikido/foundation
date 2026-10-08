import { getRandoriTimelineState } from "~/utils/randoriTimer/randoriTimeline";
import type { RandoriPreset } from "~/utils/randoriTimer/randoriTimer";
import {
  BACKGROUND_AUDIO_MAX_SECONDS,
  renderRandoriWav,
} from "~/utils/randoriTimer/randoriBackgroundAudio";

export type RandoriPlaybackMode = "normal" | "background";
export type RandoriTimerStatus =
  | "idle"
  | "preparing"
  | "ready"
  | "playing"
  | "paused"
  | "finished"
  | "error";

const PRESET_STORAGE_KEY = "omu-aikido-randori-presets-v2";
const PLAYBACK_MODE_STORAGE_KEY = "omu-aikido-randori-playback-mode-v1";
const PREPARE_DEBOUNCE_MS = 300;

// oxlint-disable-next-line max-lines-per-function
export function useRandoriTimer() {
  const bell = useRandoriBell();
  const backgroundPlayer = useRandoriBackgroundPlayer();
  const durations = ref([30, 30, 30]);
  const customPresets = ref<RandoriPreset[]>([]);
  const selectedId = ref("three");
  const playbackMode = ref<RandoriPlaybackMode>("normal");
  const status = ref<RandoriTimerStatus>("idle");
  const normalElapsedSeconds = ref(0);
  const preparationError = ref<unknown>();
  const playbackError = ref<unknown>();
  const backgroundPrepared = ref(false);
  let startedAt: number | undefined;
  let elapsedBeforePause = 0;
  let animationFrame: number | undefined;
  let lastNormalElapsed = 0;
  let preparationTimer: number | undefined;
  let preparationVersion = 0;

  const totalDuration = computed(() => durations.value.reduce((sum, value) => sum + value, 0));
  const backgroundPlaybackAvailable = computed(
    () => totalDuration.value <= BACKGROUND_AUDIO_MAX_SECONDS,
  );
  const elapsedSeconds = computed(() =>
    playbackMode.value === "background"
      ? backgroundPlayer.elapsedSeconds.value
      : normalElapsedSeconds.value,
  );
  const timeline = computed(() => getRandoriTimelineState(durations.value, elapsedSeconds.value));
  const activeRound = computed(() => timeline.value.activeRound);
  const remaining = computed(() => Math.ceil(timeline.value.remaining));
  const progress = computed(() => timeline.value.progress);
  const running = computed(() => status.value === "playing");
  const settingsLocked = computed(() => ["preparing", "playing", "paused"].includes(status.value));
  const startDisabled = computed(() => status.value === "preparing" || status.value === "error");
  const resetDisabled = computed(() => status.value === "preparing");
  const displayTime = computed(() => {
    const minutes = Math.floor(remaining.value / 60);
    const seconds = remaining.value % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  });

  useScreenWakeLock(running);

  function reset() {
    if (status.value === "preparing") return;
    stopNormalClock();
    startedAt = undefined;
    elapsedBeforePause = 0;
    lastNormalElapsed = 0;
    normalElapsedSeconds.value = 0;
    playbackError.value = undefined;
    backgroundPlayer.reset();
    if (playbackMode.value === "background") {
      status.value = backgroundPrepared.value ? "ready" : preparationError.value ? "error" : "idle";
    } else {
      status.value = "idle";
    }
  }

  async function toggle() {
    if (startDisabled.value) return;
    if (playbackMode.value === "background") {
      await toggleBackgroundPlayback();
    } else {
      toggleNormalPlayback();
    }
  }

  function toggleNormalPlayback() {
    if (status.value === "playing") {
      elapsedBeforePause = getNormalElapsedSeconds();
      normalElapsedSeconds.value = elapsedBeforePause;
      stopNormalClock();
      startedAt = undefined;
      status.value = "paused";
      return;
    }

    if (status.value === "finished") reset();
    const resuming = status.value === "paused";
    if (!resuming) void bell.play("start");
    startedAt = performance.now();
    lastNormalElapsed = elapsedBeforePause;
    status.value = "playing";
    startNormalClock();
  }

  async function toggleBackgroundPlayback() {
    if (status.value === "playing") {
      backgroundPlayer.pause();
      status.value = "paused";
      return;
    }
    if (status.value === "finished") reset();
    if (status.value !== "ready" && status.value !== "paused") return;

    const fromStart = status.value === "ready";
    try {
      await backgroundPlayer.play(fromStart);
      status.value = "playing";
    } catch (error) {
      playbackError.value = error;
      status.value = "error";
    }
  }

  function getNormalElapsedSeconds() {
    if (startedAt === undefined) return elapsedBeforePause;
    return elapsedBeforePause + (performance.now() - startedAt) / 1000;
  }

  function startNormalClock() {
    stopNormalClock();
    const update = () => {
      const elapsed = getNormalElapsedSeconds();
      const previous = getRandoriTimelineState(durations.value, lastNormalElapsed);
      const current = getRandoriTimelineState(durations.value, elapsed);
      const frameGap = elapsed - lastNormalElapsed;
      normalElapsedSeconds.value = Math.min(elapsed, totalDuration.value);

      if (current.finished) {
        if (!previous.finished && frameGap <= 1) void bell.play("finish");
        elapsedBeforePause = totalDuration.value;
        startedAt = undefined;
        status.value = "finished";
        stopNormalClock();
        return;
      }
      if (current.activeRound !== previous.activeRound && frameGap <= 1) {
        void bell.play("change");
      }

      lastNormalElapsed = elapsed;
      animationFrame = requestAnimationFrame(update);
    };
    animationFrame = requestAnimationFrame(update);
  }

  function stopNormalClock() {
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
  }

  function setDurations(values: number[], presetId = "") {
    if (settingsLocked.value) return;
    durations.value = values.map((value) => Math.max(5, Math.min(600, Math.round(value || 5))));
    selectedId.value = presetId;

    if (playbackMode.value === "background" && !backgroundPlaybackAvailable.value) {
      applyPlaybackMode("normal");
      return;
    }
    reset();
    if (playbackMode.value === "background") schedulePreparation();
  }

  function setPlaybackMode(mode: RandoriPlaybackMode) {
    if (settingsLocked.value || mode === playbackMode.value) return;
    if (mode === "background" && !backgroundPlaybackAvailable.value) return;
    applyPlaybackMode(mode);
  }

  function applyPlaybackMode(mode: RandoriPlaybackMode) {
    cancelPreparation();
    backgroundPlayer.clearSource();
    backgroundPrepared.value = false;
    playbackMode.value = mode;
    status.value = "idle";
    preparationError.value = undefined;
    playbackError.value = undefined;
    if (import.meta.client) {
      localStorage.setItem(PLAYBACK_MODE_STORAGE_KEY, mode);
    }
    if (mode === "background") schedulePreparation();
  }

  function schedulePreparation() {
    cancelPreparation();
    status.value = "preparing";
    preparationError.value = undefined;
    preparationTimer = window.setTimeout(prepareBackgroundAudio, PREPARE_DEBOUNCE_MS);
  }

  async function prepareBackgroundAudio() {
    preparationTimer = undefined;
    const version = ++preparationVersion;
    const snapshot = [...durations.value];
    status.value = "preparing";
    preparationError.value = undefined;
    backgroundPrepared.value = false;

    try {
      const blob = await renderRandoriWav(snapshot);
      if (version !== preparationVersion || playbackMode.value !== "background") {
        return;
      }
      backgroundPlayer.setSource(blob);
      backgroundPrepared.value = true;
      status.value = "ready";
    } catch (error) {
      if (version !== preparationVersion || playbackMode.value !== "background") {
        return;
      }
      preparationError.value = error;
      status.value = "error";
    }
  }

  function cancelPreparation() {
    preparationVersion += 1;
    if (preparationTimer !== undefined) {
      window.clearTimeout(preparationTimer);
      preparationTimer = undefined;
    }
  }

  function retryPreparation() {
    if (
      playbackMode.value !== "background" ||
      !backgroundPlaybackAvailable.value ||
      status.value !== "error"
    ) {
      return;
    }
    schedulePreparation();
  }

  function savePreset(name: string) {
    if (settingsLocked.value) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const preset: RandoriPreset = {
      id: crypto.randomUUID(),
      name: trimmedName,
      durations: [...durations.value],
    };
    customPresets.value.push(preset);
    selectedId.value = preset.id;
  }

  function deletePreset(id: string) {
    if (settingsLocked.value) return;
    customPresets.value = customPresets.value.filter((preset) => preset.id !== id);
    if (selectedId.value === id) selectedId.value = "";
  }

  watch(
    customPresets,
    (presets) => {
      if (import.meta.client) {
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
      }
    },
    { deep: true },
  );
  watch(backgroundPlayer.ended, (ended) => {
    if (ended && playbackMode.value === "background") status.value = "finished";
  });
  watch(backgroundPlayer.error, (error) => {
    if (!error || playbackMode.value !== "background") return;
    playbackError.value = error;
    status.value = "error";
  });

  onMounted(() => {
    try {
      const storedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
      if (storedPresets) {
        customPresets.value = JSON.parse(storedPresets) as RandoriPreset[];
      }
    } catch {
      localStorage.removeItem(PRESET_STORAGE_KEY);
    }

    const storedMode = localStorage.getItem(PLAYBACK_MODE_STORAGE_KEY);
    if (storedMode === "background" && backgroundPlaybackAvailable.value) {
      playbackMode.value = "background";
      schedulePreparation();
    } else if (storedMode !== null && storedMode !== "normal") {
      localStorage.setItem(PLAYBACK_MODE_STORAGE_KEY, "normal");
    }
  });
  onBeforeUnmount(() => {
    stopNormalClock();
    cancelPreparation();
  });

  return {
    activeRound,
    backgroundPlaybackAvailable,
    customPresets,
    displayTime,
    durations,
    playbackError,
    playbackMode,
    preparationError,
    progress,
    remaining,
    resetDisabled,
    running,
    selectedId,
    settingsLocked,
    startDisabled,
    status,
    totalDuration,
    deletePreset,
    reset,
    retryPreparation,
    savePreset,
    setDurations,
    setPlaybackMode,
    toggle,
  };
}
