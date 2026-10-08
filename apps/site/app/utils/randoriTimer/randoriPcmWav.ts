export type BellCue = "start" | "change" | "finish";

export const RANDORI_BELL_SAMPLE_RATE = 24_000;

type BellSegment = { offset: number; duration: number };
type WhistleTone = {
  type: OscillatorType;
  volume: number;
  frequency: number;
  glide: number;
};

const WHISTLE_TONES: readonly WhistleTone[] = [
  { type: "square", volume: 0.62, frequency: 2860, glide: 1.018 },
  { type: "sawtooth", volume: 0.32, frequency: 2890, glide: 1.012 },
  { type: "triangle", volume: 0.42, frequency: 1430, glide: 1.01 },
  { type: "sine", volume: 0.2, frequency: 4300, glide: 1.008 },
];

export function createRandoriBellPcm(cue: BellCue, sampleRate: number) {
  const segments = getSegments(cue);
  const duration = Math.max(...segments.map(({ offset, duration }) => offset + duration));
  const output = new Int16Array(Math.ceil(duration * sampleRate));
  for (let index = 0; index < segments.length; index += 1) {
    renderSegment(output, sampleRate, segments[index]!, index + cue.length);
  }
  return output;
}

export function renderRandoriPcmWav(
  durations: readonly number[],
  sampleRate: number,
  tailSeconds: number,
) {
  const totalDuration = durations.reduce((sum, duration) => sum + Math.max(0, duration), 0);
  const frameCount = Math.ceil((totalDuration + tailSeconds) * sampleRate);
  const buffer = new ArrayBuffer(44 + frameCount * 2);
  const samples = new Int16Array(buffer, 44, frameCount);

  writeCue(samples, createRandoriBellPcm("start", sampleRate), 0);
  let cursor = 0;
  for (let index = 0; index < durations.length; index += 1) {
    cursor += Math.max(0, durations[index] ?? 0);
    const cue = index === durations.length - 1 ? "finish" : "change";
    writeCue(samples, createRandoriBellPcm(cue, sampleRate), Math.round(cursor * sampleRate));
  }

  writeWavHeader(new DataView(buffer), frameCount, sampleRate);
  return new Blob([buffer], { type: "audio/wav" });
}

function getSegments(cue: BellCue): BellSegment[] {
  if (cue === "start") return [{ offset: 0, duration: 0.5 }];
  if (cue === "change") {
    return [
      { offset: 0, duration: 0.12 },
      { offset: 0.2, duration: 0.12 },
    ];
  }
  return [
    { offset: 0, duration: 0.14 },
    { offset: 0.22, duration: 0.78 },
  ];
}

function renderSegment(
  output: Int16Array,
  sampleRate: number,
  segment: BellSegment,
  noiseSeed: number,
) {
  const startFrame = Math.round(segment.offset * sampleRate);
  const frameCount = Math.ceil(segment.duration * sampleRate);
  const attack = 0.003;
  const release = Math.min(0.03, segment.duration * 0.25);
  const glideDuration = Math.min(0.05, segment.duration * 0.4);
  const phases = WHISTLE_TONES.map(() => 0);
  let noiseState = (noiseSeed ^ 0x9e3779b9) >>> 0;

  for (let index = 0; index < frameCount; index += 1) {
    const outputIndex = startFrame + index;
    if (outputIndex >= output.length) break;
    const elapsed = index / sampleRate;
    const envelope = getEnvelope(elapsed, segment.duration, attack, release);
    const glideProgress = Math.min(1, glideDuration ? elapsed / glideDuration : 1);
    let mixed = 0;

    for (let toneIndex = 0; toneIndex < WHISTLE_TONES.length; toneIndex += 1) {
      const tone = WHISTLE_TONES[toneIndex]!;
      const frequency = tone.frequency * Math.pow(tone.glide, glideProgress);
      phases[toneIndex] = (phases[toneIndex] ?? 0) + (Math.PI * 2 * frequency) / sampleRate;
      mixed += getWaveSample(tone.type, phases[toneIndex]!) * tone.volume * envelope;
    }

    if (elapsed < 0.035) {
      noiseState ^= noiseState << 13;
      noiseState ^= noiseState >>> 17;
      noiseState ^= noiseState << 5;
      const noise = ((noiseState >>> 0) / 0x7fffffff - 1) * 0.18;
      mixed += noise * (1 - elapsed / 0.035);
    }

    const limited = Math.tanh(mixed * 2.4) / Math.tanh(2.4);
    output[outputIndex] = Math.round(Math.max(-1, Math.min(1, limited * 0.92)) * 0x7fff);
  }
}

function writeCue(output: Int16Array, cue: Int16Array, startFrame: number) {
  for (let index = 0; index < cue.length; index += 1) {
    const outputIndex = startFrame + index;
    if (outputIndex >= output.length) break;
    const mixed = (output[outputIndex] ?? 0) + (cue[index] ?? 0);
    output[outputIndex] = Math.max(-0x8000, Math.min(0x7fff, mixed));
  }
}

function getWaveSample(type: OscillatorType, phase: number) {
  const cycle = (phase / (Math.PI * 2)) % 1;
  if (type === "square") return cycle < 0.5 ? 1 : -1;
  if (type === "sawtooth") return cycle * 2 - 1;
  if (type === "triangle") return 1 - 4 * Math.abs(Math.round(cycle) - cycle);
  return Math.sin(phase);
}

function getEnvelope(elapsed: number, duration: number, attack: number, release: number) {
  if (elapsed < attack) return elapsed / attack;
  if (elapsed < duration - release) return 1;
  return Math.max(0, (duration - elapsed) / release);
}

function writeWavHeader(view: DataView, frameCount: number, sampleRate: number) {
  const dataLength = frameCount * 2;
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataLength, true);
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}
