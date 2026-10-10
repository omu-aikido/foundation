import { describe, expect, it } from "bun:test";

import { createRandoriBellPcm } from "../src/utils/randoriTimer/randoriPcmWav";
import {
  BACKGROUND_AUDIO_MAX_SECONDS,
  RANDORI_AUDIO_SAMPLE_RATE,
  renderRandoriWav,
} from "../src/utils/randoriTimer/randoriBackgroundAudio";

describe("renderRandoriWav", () => {
  it("Web Audioを使わず、開始音・無音・終了音を含むPCM16 WAVを生成する", async () => {
    const view = new DataView(await renderRandoriWav([1]).then(readBlob));

    expect(readAscii(view, 0, 4)).toBe("RIFF");
    expect(readAscii(view, 8, 4)).toBe("WAVE");
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(RANDORI_AUDIO_SAMPLE_RATE);
    expect(view.getUint16(34, true)).toBe(16);
    expect(maxAmplitude(view, 0, 0.5)).toBeGreaterThan(10_000);
    expect(maxAmplitude(view, 0.6, 0.8)).toBe(0);
    expect(maxAmplitude(view, 1, 1.8)).toBeGreaterThan(10_000);
  });

  it("10分を超える設定を拒否する", async () => {
    expect(renderRandoriWav([BACKGROUND_AUDIO_MAX_SECONDS + 1])).rejects.toBeInstanceOf(RangeError);
  });

  it("通常再生と同じPCM開始音をWAVの先頭へ埋め込む", async () => {
    const view = new DataView(await renderRandoriWav([1]).then(readBlob));
    const cue = createRandoriBellPcm("start", RANDORI_AUDIO_SAMPLE_RATE);

    for (const [frame, sample] of cue.entries()) {
      expect(view.getInt16(44 + frame * 2, true)).toBe(sample);
    }
  });
});

function readBlob(blob: Blob) {
  return blob.arrayBuffer();
}

function maxAmplitude(view: DataView, startSeconds: number, endSeconds: number) {
  let maximum = 0;
  const start = Math.floor(startSeconds * RANDORI_AUDIO_SAMPLE_RATE);
  const end = Math.floor(endSeconds * RANDORI_AUDIO_SAMPLE_RATE);
  for (let frame = start; frame < end; frame += 1) {
    maximum = Math.max(maximum, Math.abs(view.getInt16(44 + frame * 2, true)));
  }
  return maximum;
}

function readAscii(view: DataView, offset: number, length: number) {
  return Array.from({ length }, (_, index) =>
    String.fromCharCode(view.getUint8(offset + index)),
  ).join("");
}
