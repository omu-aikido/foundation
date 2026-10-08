export type RandoriTimelineState = {
  activeRound: number;
  elapsedInRound: number;
  remaining: number;
  progress: number;
  finished: boolean;
};

export function createRoundBoundaries(durations: readonly number[]) {
  const boundaries: number[] = [];
  let elapsed = 0;

  for (const duration of durations) {
    elapsed += Math.max(0, duration);
    boundaries.push(elapsed);
  }

  return boundaries;
}

export function getRandoriTimelineState(
  durations: readonly number[],
  elapsedSeconds: number,
): RandoriTimelineState {
  if (durations.length === 0) {
    return {
      activeRound: 0,
      elapsedInRound: 0,
      remaining: 0,
      progress: 0,
      finished: true,
    };
  }

  const elapsed = Math.max(0, elapsedSeconds);
  const boundaries = createRoundBoundaries(durations);
  const totalDuration = boundaries.at(-1) ?? 0;
  const finished = elapsed >= totalDuration;
  const roundIndex = finished
    ? durations.length - 1
    : boundaries.findIndex((boundary) => elapsed < boundary);
  const roundStart = roundIndex === 0 ? 0 : (boundaries[roundIndex - 1] ?? 0);
  const duration = Math.max(0, durations[roundIndex] ?? 0);
  const elapsedInRound = finished
    ? duration
    : Math.min(duration, Math.max(0, elapsed - roundStart));
  const remaining = Math.max(0, duration - elapsedInRound);

  return {
    activeRound: roundIndex + 1,
    elapsedInRound,
    remaining,
    progress: duration === 0 ? 0 : (remaining / duration) * 100,
    finished,
  };
}
