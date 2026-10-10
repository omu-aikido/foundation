import { Random } from "./random";
import type { WazaType } from "./types";

export type LotAikidoSettings = {
  rank: number;
  filter: string;
  count: number;
  sortEnabled: boolean;
  positive: string[];
  negative: string[];
  seed: number;
};

export function generateTechniques(
  settings: LotAikidoSettings,
  source: readonly WazaType[],
): WazaType[] {
  let filtered = [...source];

  if (settings.filter === "under") {
    filtered = filtered.filter((waza) => waza.rank >= settings.rank);
  } else if (settings.filter === "only") {
    filtered = filtered.filter((waza) => waza.rank === settings.rank);
  } else if (settings.filter === "over") {
    filtered = filtered.filter((waza) => waza.rank <= settings.rank);
  }

  if (settings.positive.length > 0) {
    const inKeywords = settings.positive.filter((keyword) =>
      source.some((waza) => waza.waza_in.includes(keyword)),
    );
    const outKeywords = settings.positive.filter((keyword) =>
      source.some((waza) => waza.waza_out.includes(keyword)),
    );
    filtered = filtered.filter((waza) => {
      if (inKeywords.length === 0)
        return outKeywords.some((keyword) => waza.waza_out.includes(keyword));
      if (outKeywords.length === 0)
        return inKeywords.some((keyword) => waza.waza_in.includes(keyword));
      return (
        inKeywords.some((keyword) => waza.waza_in.includes(keyword)) &&
        outKeywords.some((keyword) => waza.waza_out.includes(keyword))
      );
    });
  }

  if (settings.negative.length > 0) {
    filtered = filtered.filter((waza) =>
      settings.negative.every(
        (keyword) => !waza.waza_in.includes(keyword) && !waza.waza_out.includes(keyword),
      ),
    );
  }

  const indices = Array.from({ length: filtered.length }, (_, index) => index);
  const randomized = new Random(settings.seed)
    .shuffleArray(indices)
    .map((index) => filtered[index])
    .filter(Boolean) as WazaType[];
  const selected = randomized.slice(0, settings.count);

  return settings.sortEnabled ? [...selected].sort((left, right) => left.id - right.id) : selected;
}
