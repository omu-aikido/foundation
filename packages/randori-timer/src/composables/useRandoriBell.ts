import { onBeforeUnmount, onMounted } from "vue";

import { type BellCue, scheduleRandoriBell } from "../utils/randoriTimer/randoriBellAudio";

export function useRandoriBell() {
  let audioContext: AudioContext | undefined;

  async function play(cue: BellCue) {
    const context = await resumeAudioContext();
    if (!context) return;
    scheduleRandoriBell(context, context.destination, cue, context.currentTime + 0.01);
  }

  async function resumeAudioContext() {
    if (typeof window === "undefined") return;
    const AudioContextClass =
      window.AudioContext ||
      (
        window as Window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContext || audioContext.state === "closed") {
      audioContext = new AudioContextClass();
    }
    if (audioContext.state !== "running") {
      const resume = audioContext.resume();
      playSilentBuffer(audioContext);
      try {
        await resume;
      } catch {
        return;
      }
    }
    if (audioContext.state !== "running") return;
    return audioContext;
  }

  function playSilentBuffer(context: AudioContext) {
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 1, context.sampleRate);
    source.connect(context.destination);
    source.start();
    source.addEventListener("ended", () => source.disconnect(), { once: true });
  }

  async function recoverAfterVisibilityChange() {
    if (
      document.visibilityState !== "visible" ||
      !audioContext ||
      audioContext.state === "closed"
    ) {
      return;
    }
    try {
      if (audioContext.state === "running") await audioContext.suspend();
      await audioContext.resume();
    } catch {
      // 次回のユーザー操作またはplay時に再試行する。
    }
  }

  onMounted(() => {
    document.addEventListener("visibilitychange", recoverAfterVisibilityChange);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("visibilitychange", recoverAfterVisibilityChange);
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close();
    }
  });

  return { play };
}
