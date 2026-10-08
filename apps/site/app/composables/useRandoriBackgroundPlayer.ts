// oxlint-disable-next-line max-lines-per-function
export function useRandoriBackgroundPlayer() {
  const elapsedSeconds = ref(0);
  const playing = ref(false);
  const ended = ref(false);
  const error = ref<unknown>();
  let audio: HTMLAudioElement | undefined;
  let objectUrl: string | undefined;
  let animationFrame: number | undefined;

  function ensureAudio() {
    if (!import.meta.client) return;
    if (audio) return audio;
    audio = new Audio();
    audio.preload = "auto";
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    return audio;
  }

  function setSource(blob: Blob) {
    const player = ensureAudio();
    if (!player) throw new Error("Audio playback is unavailable.");
    revokeSource();
    objectUrl = URL.createObjectURL(blob);
    player.src = objectUrl;
    player.load();
    elapsedSeconds.value = 0;
    ended.value = false;
    error.value = undefined;
  }

  async function play(fromStart = false) {
    const player = ensureAudio();
    if (!player?.src) throw new Error("Background audio is not prepared.");
    if (fromStart) player.currentTime = 0;
    ended.value = false;
    error.value = undefined;
    try {
      await player.play();
    } catch (cause) {
      error.value = cause;
      throw cause;
    }
  }

  function pause() {
    audio?.pause();
    syncElapsed();
  }

  function reset() {
    audio?.pause();
    if (audio) audio.currentTime = 0;
    elapsedSeconds.value = 0;
    playing.value = false;
    ended.value = false;
    error.value = undefined;
    stopClock();
  }

  function clearSource() {
    reset();
    if (audio) {
      audio.removeAttribute("src");
      audio.load();
    }
    revokeSource();
  }

  function handlePlay() {
    playing.value = true;
    startClock();
  }

  function handlePause() {
    playing.value = false;
    syncElapsed();
    stopClock();
  }

  function handleEnded() {
    syncElapsed();
    playing.value = false;
    ended.value = true;
    stopClock();
  }

  function handleError() {
    error.value = audio?.error ?? new Error("Background audio playback failed.");
    playing.value = false;
    stopClock();
  }

  function startClock() {
    stopClock();
    const update = () => {
      syncElapsed();
      if (playing.value) animationFrame = requestAnimationFrame(update);
    };
    update();
  }

  function syncElapsed() {
    if (audio) elapsedSeconds.value = audio.currentTime;
  }

  function stopClock() {
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
  }

  function revokeSource() {
    if (!objectUrl) return;
    URL.revokeObjectURL(objectUrl);
    objectUrl = undefined;
  }

  onMounted(ensureAudio);
  onBeforeUnmount(() => {
    clearSource();
    audio?.removeEventListener("play", handlePlay);
    audio?.removeEventListener("pause", handlePause);
    audio?.removeEventListener("ended", handleEnded);
    audio?.removeEventListener("error", handleError);
    audio = undefined;
  });

  return {
    elapsedSeconds: readonly(elapsedSeconds),
    playing: readonly(playing),
    ended: readonly(ended),
    error: readonly(error),
    setSource,
    play,
    pause,
    reset,
    clearSource,
  };
}
