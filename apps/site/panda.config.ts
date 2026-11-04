import { defineConfig } from "@pandacss/dev";
import { preset } from "design-tokens/preset";

export default defineConfig({
  presets: ["@pandacss/preset-base", preset],
  preflight: true,
  // パレット色や任意の長さを通すと、semantic token 以外で見た目を足せてしまう。
  strictTokens: true,
  strictPropertyValues: true,
  globalCss: {
    html: { bg: "bg.base", color: "fg.base" },
    // preflight の text-wrap: balance は見出しの折り返し位置を変える。
    "h1, h2, h3, h4, h5, h6": { textWrap: "wrap" },
    // preflight の overflow-wrap: break-word は長い語を途中で割る。
    "p, h1, h2, h3, h4, h5, h6": { overflowWrap: "normal" },
    // preflight の antialiased は macOS で字が細くなる。
    "html, :host": { WebkitFontSmoothing: "auto", MozOsxFontSmoothing: "auto" },
    // preflight は選択範囲を青にする。
    "::selection": { backgroundColor: "revert", color: "revert" },
    // preflight はフォームの角丸と、disabled の透明度を戻さない。
    "button, input, optgroup, select, textarea, ::file-selector-button": {
      borderRadius: "0",
      opacity: "1",
    },
    // defaultStyle のインライン指定だと、幅と高さを上書きできない。
    ".icon": { display: "inline-block", verticalAlign: "middle" },
    // 要素セレクタの余白。レイヤー外に出すと、軸だけの margin 指定に勝つ。
    section: { mx: "2", my: "3" },
  },
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
