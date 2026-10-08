import { describe, expect, it } from "bun:test";

import {
  createRoundBoundaries,
  getRandoriTimelineState,
} from "../app/utils/randoriTimer/randoriTimeline";

const durations = [30, 30, 30, 60];

describe("randori timeline", () => {
  it("累積ラウンド境界を生成する", () => {
    expect(createRoundBoundaries(durations)).toEqual([30, 60, 90, 150]);
  });

  it.each([
    [0, 1, 30, false],
    [29.9, 1, 0.1, false],
    [30, 2, 30, false],
    [60, 3, 30, false],
    [90, 4, 60, false],
    [150, 4, 0, true],
  ])("%s秒の状態を算出する", (elapsed, activeRound, remaining, finished) => {
    const state = getRandoriTimelineState(durations, elapsed);
    expect(state.activeRound).toBe(activeRound);
    expect(state.remaining).toBeCloseTo(remaining);
    expect(state.finished).toBe(finished);
  });

  it("大きな時刻ジャンプ後も現在のラウンドへ同期する", () => {
    expect(getRandoriTimelineState(durations, 121)).toMatchObject({
      activeRound: 4,
      elapsedInRound: 31,
      remaining: 29,
      finished: false,
    });
  });
});
