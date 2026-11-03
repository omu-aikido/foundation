import { definePreset } from "@pandacss/dev";

// presetWind4 の oklch をそのまま置く。`{colors.zinc.*}` は @pandacss/preset-panda が
// 無いと解決できず、この preset 単体の色が変わる。
const zinc50 = "oklch(98.5% 0 0)";
const zinc300 = "oklch(87.1% 0.006 286.286)";
const zinc400 = "oklch(70.5% 0.015 286.067)";
const zinc500 = "oklch(55.2% 0.016 285.938)";
const zinc600 = "oklch(44.2% 0.017 285.786)";
const zinc700 = "oklch(37% 0.013 285.805)";
const zinc900 = "oklch(21% 0.006 285.885)";

const sky300 = "oklch(82.8% 0.111 230.318)";
const sky400 = "oklch(74.6% 0.16 232.661)";
const sky500 = "oklch(68.5% 0.169 237.323)";
const sky600 = "oklch(58.8% 0.158 241.966)";
const sky700 = "oklch(50% 0.134 242.749)";

const red400 = "oklch(70.4% 0.191 22.216)";
const red700 = "oklch(50.5% 0.213 27.518)";
const blue400 = "oklch(70.7% 0.165 254.624)";
const blue700 = "oklch(48.8% 0.243 264.376)";
const emerald300 = "oklch(84.5% 0.143 164.978)";
const emerald700 = "oklch(50.8% 0.118 165.612)";
const orange300 = "oklch(83.7% 0.128 66.29)";
const orange700 = "oklch(55.3% 0.195 38.402)";
const rose300 = "oklch(81% 0.117 11.638)";
const rose700 = "oklch(51.4% 0.222 16.935)";

// Uno theme の単色。ダーク専用の色は定義されていない。
const success = "oklch(0.571 0.181 145)";
const warning = "oklch(0.67 0.185 55)";
const error = "oklch(0.567 0.224 27)";

const zinc100At60 = "oklch(96.7% 0.001 286.375 / 60%)";
const zinc800At60 = "oklch(27.4% 0.006 286.033 / 60%)";

function semanticColor(base: string, dark: string) {
  return { value: { base, _dark: dark } };
}

// ダーク用の別色を発明しない。Uno が両モードで同じ色を使っている。
function sameColor(value: string) {
  return semanticColor(value, value);
}

export const preset = definePreset({
  name: "design-tokens",
  conditions: {
    extend: {
      // Panda の既定 dark は `.dark &`。UnoCSS は `dark: "media"` なので、クラスに戻すと切り替わらない。
      dark: "@media (prefers-color-scheme: dark)",
    },
  },
  theme: {
    extend: {
      tokens: {
        // xs（0.75rem。既定ルートで 12px）未満は作らない。数値の line-height は fontSize に付けない。
        fontSizes: {
          xs: { value: "0.75rem" },
          sm: { value: "0.875rem" },
          base: { value: "1rem" },
          lg: { value: "1.125rem" },
          xl: { value: "1.25rem" },
          "2xl": { value: "1.5rem" },
          "3xl": { value: "1.875rem" },
          "4xl": { value: "2.25rem" },
          "5xl": { value: "3rem" },
          "6xl": { value: "3.75rem" },
          "7xl": { value: "4.5rem" },
          "8xl": { value: "6rem" },
          "9xl": { value: "8rem" },
        },
        lineHeights: {
          none: { value: "1" },
          tight: { value: "1.25" },
          snug: { value: "1.375" },
          normal: { value: "1.5" },
          relaxed: { value: "1.625" },
          loose: { value: "2" },
        },
      },
      semanticTokens: {
        colors: {
          fg: {
            base: semanticColor(zinc900, zinc50),
            muted: semanticColor(zinc600, zinc400),
            ghost: semanticColor(zinc400, zinc500),
            invert: semanticColor(zinc50, zinc900),
            accent: semanticColor(sky700, sky400),
            error: semanticColor(error, red400),
          },
          bg: {
            base: semanticColor(zinc50, zinc900),
            muted: semanticColor(zinc300, zinc700),
            ghost: semanticColor(zinc100At60, zinc800At60),
            invert: semanticColor(zinc900, zinc50),
            accent: semanticColor(sky700, sky500),
          },
          border: {
            base: semanticColor(zinc300, zinc700),
            muted: semanticColor(zinc400, zinc600),
            ghost: semanticColor(zinc100At60, zinc800At60),
            invert: semanticColor(zinc600, zinc400),
            accent: semanticColor(sky600, sky500),
          },
          status: {
            success: sameColor(success),
            warning: sameColor(warning),
            error: sameColor(error),
          },
          event: {
            nakamozu: semanticColor(sky700, sky300),
            sugimoto: semanticColor(emerald700, emerald300),
            morinomiya: semanticColor(orange700, orange300),
            event: semanticColor(rose700, rose300),
            default: semanticColor(zinc700, zinc300),
          },
          calendar: {
            sunday: semanticColor(red700, red400),
            saturday: semanticColor(blue700, blue400),
          },
        },
      },
    },
  },
});
