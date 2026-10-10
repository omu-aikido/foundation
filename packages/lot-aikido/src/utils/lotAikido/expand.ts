import {
  type WazaType,
  体勢,
  type 技名,
  type 技指定,
  type 技組み合わせ,
  type 直積合成,
  type 級段位別,
  type 除外条件,
} from "./types";

type WazaTuple = Omit<WazaType, "id">;
type 展開済み組み合わせ = Exclude<技組み合わせ, { 基本動作: string }> & {
  技: 技名;
};

function expandTechniques(技: 技指定): 技名[] {
  if (typeof 技 === "string") return [技];

  return Object.values(技).flatMap((value) => expandTechniques(value as 技指定));
}

function matchesExclusion(組み合わせ: 展開済み組み合わせ, 除外: 除外条件): boolean {
  return (
    (除外.攻め === undefined || 除外.攻め === 組み合わせ.攻め) &&
    (除外.体勢 === undefined || 除外.体勢 === 組み合わせ.体勢) &&
    (除外.技 === undefined || expandTechniques(除外.技).includes(組み合わせ.技))
  );
}

function expandCombination(
  組み合わせ: 技組み合わせ,
): (展開済み組み合わせ | Extract<技組み合わせ, { 基本動作: string }>)[] {
  if ("基本動作" in 組み合わせ) return [組み合わせ];

  return expandTechniques(組み合わせ.技).map((技) => ({
    ...組み合わせ,
    技,
  }));
}

function expandCartesian(rule: 直積合成): 展開済み組み合わせ[] {
  return rule.攻め.flatMap((攻め) =>
    (rule.体勢 ?? [体勢.立ち技]).flatMap((指定体勢) =>
      rule.技.flatMap((技) =>
        expandTechniques(技)
          .map((展開技) => ({
            攻め,
            体勢: 指定体勢,
            技: 展開技,
          }))
          .filter((組み合わせ) => !rule.除外?.some((除外) => matchesExclusion(組み合わせ, 除外))),
      ),
    ),
  );
}

function toTuple(
  級段位: number,
  組み合わせ: 展開済み組み合わせ | Extract<技組み合わせ, { 基本動作: string }>,
): WazaTuple {
  if ("基本動作" in 組み合わせ) {
    return {
      waza_in: "",
      waza_out: 組み合わせ.基本動作,
      rank: 級段位,
    };
  }

  return {
    waza_in: 組み合わせ.体勢 ? `${組み合わせ.体勢}${組み合わせ.攻め}` : 組み合わせ.攻め,
    waza_out: 組み合わせ.技,
    rank: 級段位,
  };
}

export function expandWazaRules(級段位別: readonly 級段位別[]): WazaType[] {
  const unique = new Map<string, WazaTuple>();
  const definedRanks = new Set<number>();

  for (const { 級段位, 技一覧: 一覧 } of 級段位別) {
    if (definedRanks.has(級段位)) {
      throw new Error(`級段位 ${級段位} が複数定義されています`);
    }
    definedRanks.add(級段位);

    const keysInRank = new Set<string>();

    for (const rule of 一覧) {
      const 組み合わせ =
        rule.攻め !== undefined
          ? expandCartesian(rule)
          : rule.組み合わせ.flatMap(expandCombination);

      for (const item of 組み合わせ) {
        const tuple = toTuple(級段位, item);
        const key = `${tuple.waza_in}\u0000${tuple.waza_out}`;
        if (keysInRank.has(key)) {
          throw new Error(
            `級段位 ${級段位} 内で重複しています: ${tuple.waza_in} ${tuple.waza_out}`,
          );
        }
        keysInRank.add(key);

        const existing = unique.get(key);
        if (!existing || tuple.rank > existing.rank) unique.set(key, tuple);
      }
    }
  }

  return [...unique.values()].map((waza, index) => ({
    id: index + 1,
    ...waza,
  }));
}
