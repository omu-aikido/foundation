import { describe, expect, it } from "bun:test";
import { toGamut, wcagContrast } from "culori";
import { preset } from "../src/preset";

// CSS Color 4 の gamut mapping 後の sRGB で測る。範囲外の線形RGBをそのまま入れると、表示色と比がずれる。
const toSrgb = toGamut("rgb");
const minimumContrast = 4.5;

const textPairs = [
  ["本文テキストの色ペアはライト/ダークとも4.5:1以上", "fg.base", "bg.base"],
  ["補助テキストの色ペアはライト/ダークとも4.5:1以上", "fg.muted", "bg.base"],
  ["アクセントテキストの色ペアはライト/ダークとも4.5:1以上", "fg.accent", "bg.base"],
  ["エラーテキストの色ペアはライト/ダークとも4.5:1以上", "fg.error", "bg.base"],
  ["アクセント面上の反転テキストはライト/ダークとも4.5:1以上", "fg.invert", "bg.accent"],
  ["日曜の文字色は地色に対してライト/ダークとも4.5:1以上", "calendar.sunday", "bg.base"],
  ["土曜の文字色は地色に対してライト/ダークとも4.5:1以上", "calendar.saturday", "bg.base"],
  ["中百舌鳥の予定の文字色は地色に対してライト/ダークとも4.5:1以上", "event.nakamozu", "bg.base"],
  ["杉本の予定の文字色は地色に対してライト/ダークとも4.5:1以上", "event.sugimoto", "bg.base"],
  ["森之宮の予定の文字色は地色に対してライト/ダークとも4.5:1以上", "event.morinomiya", "bg.base"],
  ["イベントの予定の文字色は地色に対してライト/ダークとも4.5:1以上", "event.event", "bg.base"],
  ["その他の予定の文字色は地色に対してライト/ダークとも4.5:1以上", "event.default", "bg.base"],
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSemanticColor(value: unknown): value is { value: { base: string; _dark: string } } {
  if (!isRecord(value) || !isRecord(value.value)) return false;
  return typeof value.value.base === "string" && typeof value.value._dark === "string";
}

function semanticColors(): Record<string, unknown> {
  const colors = preset.theme?.extend?.semanticTokens?.colors;
  if (!isRecord(colors)) throw new Error("preset has no semantic colors");
  return colors;
}

function colorValue(path: string, mode: "base" | "_dark"): string {
  let node: unknown = semanticColors();
  for (const key of path.split(".")) {
    if (!isRecord(node) || !(key in node)) throw new Error(`missing semantic color ${path}`);
    node = node[key];
  }
  if (!isSemanticColor(node)) throw new Error(`semantic color ${path} has no light and dark value`);
  return node.value[mode];
}

function contrastRatio(foreground: string, background: string): number {
  const ratio = wcagContrast(toSrgb(foreground), toSrgb(background));
  if (!Number.isFinite(ratio))
    throw new Error(`contrast is not finite for ${foreground} on ${background}`);
  return ratio;
}

function failingModes(foreground: string, background: string): string[] {
  return (["base", "_dark"] as const).flatMap((mode) => {
    const ratio = contrastRatio(colorValue(foreground, mode), colorValue(background, mode));
    if (ratio >= minimumContrast) return [];
    const appearance = mode === "base" ? "light" : "dark";
    return [`${appearance} ${ratio.toFixed(2)}:1`];
  });
}

function colorsMissingMode(node: unknown, path: string): string[] {
  if (!isRecord(node)) return [path];
  if ("value" in node) return isSemanticColor(node) ? [] : [path];
  return Object.entries(node).flatMap(([key, value]) =>
    colorsMissingMode(value, path === "" ? key : `${path}.${key}`),
  );
}

describe("デザイントークンのコントラスト", () => {
  it("ダークモードは prefers-color-scheme で切り替わる", () => {
    expect(preset.conditions?.extend?.dark).toBe("@media (prefers-color-scheme: dark)");
  });

  it("色のセマンティックトークンはライトとダークの両方の値を持つ", () => {
    expect(colorsMissingMode(semanticColors(), "")).toEqual([]);
  });

  it.each(textPairs)("%s", (name, foreground, background) => {
    const failures = failingModes(foreground, background).map((failure) => `${name} ${failure}`);
    expect(failures).toEqual([]);
  });
});
