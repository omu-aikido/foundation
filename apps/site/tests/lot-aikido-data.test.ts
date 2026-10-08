import { describe, expect, it } from "bun:test";

import { wazadata } from "../app/utils/lotAikido/data";
import { expandWazaRules } from "../app/utils/lotAikido/expand";
import { 体勢, 技, 攻め } from "../app/utils/lotAikido/types";

describe("lotAikido rule expansion #1", () => {
  it("直積は攻め・体勢・技の組み合わせを展開する", () => {
    expect(
      expandWazaRules([
        {
          級段位: 5,
          技一覧: [
            {
              攻め: [攻め.正面],
              体勢: [体勢.立ち技, 体勢.座技],
              技: [技.教.一],
            },
          ],
        },
      ]),
    ).toEqual([
      { id: 1, waza_in: "正面打ち", waza_out: "一教（表）", rank: 5 },
      { id: 2, waza_in: "正面打ち", waza_out: "一教（裏）", rank: 5 },
      { id: 3, waza_in: "座技正面打ち", waza_out: "一教（表）", rank: 5 },
      { id: 4, waza_in: "座技正面打ち", waza_out: "一教（裏）", rank: 5 },
    ]);
  });

  it("列挙と体勢省略は指定した立ち技だけを展開する", () => {
    expect(
      expandWazaRules([
        {
          級段位: 5,
          技一覧: [
            {
              組み合わせ: [{ 攻め: 攻め.突き, 技: 技.小手 }],
            },
          ],
        },
      ]),
    ).toEqual([{ id: 1, waza_in: "突き", waza_out: "小手返し", rank: 5 }]);
  });

  it("直積から除外条件に一致する組み合わせを除く", () => {
    expect(
      expandWazaRules([
        {
          級段位: 5,
          技一覧: [
            {
              攻め: [攻め.諸手, 攻め.両手],
              体勢: [体勢.座技],
              技: [技.回転, 技.小手],
              除外: [{ 攻め: 攻め.諸手, 技: 技.回転 }],
            },
          ],
        },
      ]),
    ).toEqual([
      { id: 1, waza_in: "座技諸手取り", waza_out: "小手返し", rank: 5 },
      { id: 2, waza_in: "座技両手取り", waza_out: "内回転投げ", rank: 5 },
      { id: 3, waza_in: "座技両手取り", waza_out: "外回転投げ", rank: 5 },
      { id: 4, waza_in: "座技両手取り", waza_out: "小手返し", rank: 5 },
    ]);
  });

  it("列挙でも技の束を展開する", () => {
    expect(
      expandWazaRules([
        {
          級段位: 5,
          技一覧: [
            {
              組み合わせ: [{ 攻め: 攻め.片手, 技: 技.教.一 }],
            },
          ],
        },
      ]),
    ).toEqual([
      { id: 1, waza_in: "片手取り", waza_out: "一教（表）", rank: 5 },
      { id: 2, waza_in: "片手取り", waza_out: "一教（裏）", rank: 5 },
    ]);
  });

  it("異なる級段位で重複した組み合わせは低い級を採用する", () => {
    expect(
      expandWazaRules([
        {
          級段位: 3,
          技一覧: [
            {
              組み合わせ: [{ 攻め: 攻め.突き, 技: 技.小手 }],
            },
          ],
        },
        {
          級段位: 5,
          技一覧: [
            {
              組み合わせ: [{ 攻め: 攻め.突き, 技: 技.小手 }],
            },
          ],
        },
      ]),
    ).toEqual([{ id: 1, waza_in: "突き", waza_out: "小手返し", rank: 5 }]);
  });
});

describe("lotAikido rule expansion #2", () => {
  it("同じ級段位内の重複はエラーにする", () => {
    expect(() =>
      expandWazaRules([
        {
          級段位: 5,
          技一覧: [
            { 組み合わせ: [{ 攻め: 攻め.突き, 技: 技.小手 }] },
            { 組み合わせ: [{ 攻め: 攻め.突き, 技: 技.小手 }] },
          ],
        },
      ]),
    ).toThrow("級段位 5 内で重複しています");
  });

  it("同じ級段位ブロックを複数定義するとエラーにする", () => {
    expect(() =>
      expandWazaRules([
        { 級段位: 5, 技一覧: [] },
        { 級段位: 5, 技一覧: [] },
      ]),
    ).toThrow("級段位 5 が複数定義されています");
  });

  it("data.ts のサンプルを展開する", () => {
    expect(wazadata.length).toBeGreaterThan(0);
  });
});
