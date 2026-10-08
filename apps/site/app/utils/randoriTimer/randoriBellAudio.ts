import { type BellCue, createRandoriBellPcm, RANDORI_BELL_SAMPLE_RATE } from "./randoriPcmWav";

export type { BellCue } from "./randoriPcmWav";

const cueBuffers = new WeakMap<BaseAudioContext, Map<BellCue, AudioBuffer>>();

export function scheduleRandoriBell(
  context: BaseAudioContext,
  destination: AudioNode,
  cue: BellCue,
  startTime: number,
) {
  const buffer = getCueBuffer(context, cue);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(destination);
  source.start(startTime);
  source.addEventListener("ended", () => source.disconnect(), { once: true });
  return startTime + buffer.duration;
}

function getCueBuffer(context: BaseAudioContext, cue: BellCue) {
  let buffers = cueBuffers.get(context);
  if (!buffers) {
    buffers = new Map();
    cueBuffers.set(context, buffers);
  }

  const cached = buffers.get(cue);
  if (cached) return cached;

  const pcm = createRandoriBellPcm(cue, RANDORI_BELL_SAMPLE_RATE);
  const buffer = context.createBuffer(1, pcm.length, RANDORI_BELL_SAMPLE_RATE);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < pcm.length; index += 1) {
    samples[index] = (pcm[index] ?? 0) / 0x8000;
  }
  buffers.set(cue, buffer);
  return buffer;
}
