import { defineConfig } from "@pandacss/dev";
import { preset } from "design-tokens/preset";

export default defineConfig({
  presets: ["@pandacss/preset-base", preset],
  // UnoCSS のリセットと二重にしない。共存中の基準は Uno の preflight。
  preflight: false,
  // パレット色や任意の長さを通すと、semantic token 以外で見た目を足せてしまう。
  strictTokens: true,
  strictPropertyValues: true,
  include: ["./app/**/*.{vue,ts}"],
  exclude: [],
  outdir: "styled-system",
});
