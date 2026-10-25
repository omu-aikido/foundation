import { RANDORI_BELL_SAMPLE_RATE, renderRandoriPcmWav } from "./randoriPcmWav";

export const BACKGROUND_AUDIO_MAX_SECONDS = 600;
export const RANDORI_AUDIO_SAMPLE_RATE = RANDORI_BELL_SAMPLE_RATE;

const RANDORI_AUDIO_TAIL_SECONDS = 2;

export async function renderRandoriWav(durations: readonly number[]) {
  const totalDuration = durations.reduce((sum, duration) => sum + Math.max(0, duration), 0);
  if (totalDuration > BACKGROUND_AUDIO_MAX_SECONDS) {
    throw new RangeError("Background playback supports up to 600 seconds.");
  }

  return renderRandoriPcmWav(durations, RANDORI_AUDIO_SAMPLE_RATE, RANDORI_AUDIO_TAIL_SECONDS);
}
