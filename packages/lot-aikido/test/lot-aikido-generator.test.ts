import { describe, expect, it } from "bun:test";

import { generateTechniques } from "../src/utils/lotAikido/generate";
import type { WazaType } from "../src/utils/lotAikido/types";

const source: WazaType[] = [
  { id: 1, waza_in: "正面打ち", waza_out: "一教", rank: 5 },
  { id: 2, waza_in: "正面打ち", waza_out: "四方投げ", rank: 3 },
  { id: 3, waza_in: "片手取り", waza_out: "一教", rank: -1 },
  { id: 4, waza_in: "突き", waza_out: "小手返し", rank: 3 },
];

const settings = {
  rank: 3,
  filter: "under",
  count: 10,
  sortEnabled: false,
  positive: [],
  negative: [],
  seed: 42,
};

describe("lotAikido generator", () => {
  it("同じ seed と条件では同じ順序を返す", () => {
    const first = generateTechniques(settings, source);
    const second = generateTechniques(settings, source);
    expect(first.map((waza) => waza.id)).toEqual(second.map((waza) => waza.id));
  });

  it("級段・包含・除外・ソートの既存条件を維持する", () => {
    expect(
      generateTechniques(
        {
          ...settings,
          positive: ["正面", "一教"],
          negative: ["四方"],
          sortEnabled: true,
        },
        source,
      ).map((waza) => waza.id),
    ).toEqual([1]);
  });
});
