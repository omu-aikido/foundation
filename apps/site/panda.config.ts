import { defineConfig } from "@pandacss/dev";
import { preset } from "design-tokens/preset";

export default defineConfig({
  presets: ["@pandacss/preset-base", preset],
  // UnoCSS のリセットと二重にしない。共存中の基準は Uno の preflight。
  preflight: false,
  // パレット色や任意の長さを通すと、semantic token 以外で見た目を足せてしまう。
  strictTokens: true,
  strictPropertyValues: true,
  // presetTagify が <section> に付けていた余白（section shortcut: mx-2 my-3）。
  // base レイヤーなので、各要素の margin 指定が軸ごとに上書きする。
  globalCss: { section: { mx: "2", my: "3" } },
  // site は `~~/styled-system`、packages は `styled-system`。片方だけだと、もう一方の css() が抽出されない。
  importMap: ["styled-system", "~~/styled-system"],
  include: [
    "./app/**/*.{vue,ts}",
    "../../packages/lot-aikido/src/**/*.{vue,ts}",
    "../../packages/randori-timer/src/**/*.{vue,ts}",
  ],
  exclude: [],
  outdir: "styled-system",
});
