import { definePattern, definePreset, defineRecipe } from "@pandacss/dev";

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
const amber400 = "oklch(82.8% 0.189 84.429)";
const amber700 = "oklch(55.5% 0.163 48.998)";
const blue400 = "oklch(70.7% 0.165 254.624)";
const blue700 = "oklch(48.8% 0.243 264.376)";
const emerald300 = "oklch(84.5% 0.143 164.978)";
const emerald700 = "oklch(50.8% 0.118 165.612)";
const orange300 = "oklch(83.7% 0.128 66.29)";
const orange700 = "oklch(55.3% 0.195 38.402)";
const rose300 = "oklch(81% 0.117 11.638)";
const rose700 = "oklch(51.4% 0.222 16.935)";

// presetTypography の prose-gray。Site の fg は zinc なので、本文色を fg.base に寄せると明るさが変わる。
const gray100 = "oklch(96.7% 0.003 264.542)";
const gray200 = "oklch(92.8% 0.006 264.531)";
const gray300 = "oklch(87.2% 0.01 258.338)";
const gray700 = "oklch(37.3% 0.034 259.733)";
const gray900 = "oklch(21% 0.034 264.665)";
const white = "#fff";

// Uno theme の単色。ダーク専用の色は定義されていない。
const success = "oklch(0.571 0.181 145)";
const warning = "oklch(0.67 0.185 55)";
const error = "oklch(0.567 0.224 27)";

const zinc100At60 = "oklch(96.7% 0.001 286.375 / 60%)";
const zinc800At60 = "oklch(27.4% 0.006 286.033 / 60%)";
const zinc200At20 = "oklch(92% 0.004 286.32 / 20%)";
const zinc800At20 = "oklch(27.4% 0.006 286.033 / 20%)";

function semanticColor(base: string, dark: string) {
  return { value: { base, _dark: dark } };
}

// ダーク用の別色を発明しない。Uno が両モードで同じ色を使っている。
function sameColor(value: string) {
  return semanticColor(value, value);
}

// presetWind4 の spacing は 1 = 0.25rem。Site と packages で使っている段階だけ置く。
const spacingSteps = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 9, 10, 12, 16, 18, 24, 32];

function rem(step: number): string {
  if (step === 0) return "0";
  return `${step / 4}rem`;
}

function lengthScale(steps: readonly number[]) {
  return Object.fromEntries(steps.map((step) => [String(step), { value: rem(step) }]));
}

// wind4 の text-* が font-size と一緒に付ける line-height。fontSizes には付けない。
// 数値を fontSize トークンへ入れると、フォントサイズだけの指定ができなくなる。
const textLineHeights = {
  xs: { value: "1rem" },
  sm: { value: "1.25rem" },
  lg: { value: "1.75rem" },
  xl: { value: "1.75rem" },
  "2xl": { value: "2rem" },
  "3xl": { value: "2.25rem" },
  // text-4xl の line-height。fontSizes.4xl（2.25rem）とは別。
  "4xl": { value: "2.5rem" },
};

const link = defineRecipe({
  className: "panda-link",
  base: {
    color: "fg.accent",
    textDecoration: "none",
    textUnderlineOffset: "4px",
    _hover: { textDecorationLine: "underline" },
  },
  variants: {
    external: {
      true: {
        _after: { content: '" ↗ "' },
      },
    },
  },
});

const button = defineRecipe({
  className: "panda-button",
  base: {
    borderRadius: "sm",
    // フォーカスはブラウザ標準の輪に任せる。1px の独自 outline は標準より見えにくい。
    _hover: {
      cursor: "pointer",
      boxShadow: "sm",
      opacity: "0.9",
    },
    _active: { transform: "translateY(1px)" },
    _disabled: {
      cursor: "not-allowed",
      transform: "none",
      opacity: "0.6",
      _hover: {
        boxShadow: "none",
        cursor: "not-allowed",
        opacity: "0.6",
      },
      _active: { transform: "none" },
    },
  },
  variants: {
    tone: {
      accent: { bg: "bg.accent", color: "fg.invert" },
      base: { bg: "bg.base", color: "fg.base" },
    },
  },
});

const card = defineRecipe({
  className: "panda-card",
  base: {
    borderRadius: "lg",
    bg: "bg.ghost",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border.muted",
    p: "4",
    boxShadow: "sm",
  },
});

// Uno の `control`。フォーカスは枠色だけ変え、輪は消さない。
const control = defineRecipe({
  className: "panda-control",
  base: {
    borderRadius: "md",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border.muted",
    bg: "bg.base",
    px: "3",
    py: "2",
    color: "fg.base",
    _focus: { borderColor: "border.accent" },
  },
});

// presetTypography の base と MarkdownPage の上書き。色は fg / border トークン。
// max-width の 65ch は container pattern（utilities）が後から勝つ。
const prose = defineRecipe({
  className: "panda-prose",
  base: {
    color: "fg.prose",
    maxW: "prose",
    fontSize: "base",
    lineHeight: "lg",
    "& > :first-child": { mt: "0" },
    "& > :last-child": { mb: "0" },
    "& h1": {
      color: "fg.heading",
      fontSize: "4xl",
      fontWeight: "extrabold",
      lineHeight: "4xl",
      mt: "0",
      mb: "8",
    },
    "& h2": {
      color: "fg.heading",
      fontSize: "2xl",
      fontWeight: "bold",
      lineHeight: "2xl",
      mt: "12",
      mb: "6",
    },
    "& h3": {
      color: "fg.heading",
      fontSize: "xl",
      fontWeight: "semibold",
      lineHeight: "2xl",
      mt: "8",
      mb: "3",
    },
    "& p": { m: "0" },
    "& a": {
      color: "fg.heading",
      fontWeight: "medium",
      textDecorationLine: "underline",
      textDecorationColor: "border.accent",
      textUnderlineOffset: "4px",
    },
    // Markdown から生成したリンク（build/generate-site-content.ts が data-link を付ける）。
    // 生 HTML の a は上の見出し色のまま。
    "& a[data-link]": { color: "fg.accent" },
    "& a[data-link=external]::after": { content: '" ↗ "' },
    "& strong": { color: "fg.heading", fontWeight: "semibold" },
    "& ul": { m: "0", p: "0", listStyle: "none" },
    "& li": { mt: "2", mb: "2", paddingInlineStart: "1.5" },
    "& li::before": { content: '"◆"', mr: "2", color: "fg.muted" },
    "& hr": { mt: "12", mb: "12", borderTopWidth: "1px", borderColor: "border.prose" },
    "& blockquote": {
      mt: "6",
      mb: "6",
      paddingInlineStart: "4",
      fontWeight: "medium",
      fontStyle: "italic",
      color: "fg.quote",
      borderInlineStartWidth: "0.25rem",
      borderInlineStartStyle: "solid",
      borderInlineStartColor: "border.prose",
      quotes: '"“""”""‘""’"',
    },
    // リンク内の太字はリンクの色のまま（presetTypography の `a strong` と同じ）。
    "& a strong": { color: "inherit" },
    "& blockquote p:first-of-type::before": { content: "open-quote" },
    "& blockquote p:last-of-type::after": { content: "close-quote" },
    // content/pages の画像と活動紹介の定義リスト。見出し直後は上の隣接規則で上余白が消える。
    "& img": { mt: "8", mb: "8" },
    "& dl": { mt: "5", mb: "5" },
    // presetTypography は em の色や太さを変えない。斜体はブラウザの初期値のまま。
    "& dt": { color: "fg.heading", fontWeight: "semibold", mt: "5" },
    "& dd": { mt: "2", paddingInlineStart: "6" },
    // 見出しと区切り線の直後は上余白を消す。`& h3` と詳細度が同じなので、後に置いて勝たせる。
    "& :is(h2, h3, hr) + *": { mt: "0" },
  },
});

// preset-base の container は max-width 8xl と padding。Uno の shortcut はこれではない。
const container = definePattern({
  transform(props) {
    return {
      maxW: "4xl",
      mx: { base: "4", sm: "6", md: "8", lg: "auto" },
      ...props,
    };
  },
});

// preset-base の stack は gap 8px が既定。Uno の shortcut は段組みだけで、間隔は付けない。
const stack = definePattern({
  properties: {
    align: { type: "property", value: "alignItems" },
    justify: { type: "property", value: "justifyContent" },
    gap: { type: "property", value: "gap" },
  },
  transform(props) {
    const { align, justify, gap, ...rest } = props;
    return {
      display: "flex",
      flexDirection: "column",
      alignItems: align,
      justifyContent: justify,
      ...(gap == null ? {} : { gap }),
      ...rest,
    };
  },
});

export const preset = definePreset({
  name: "design-tokens",
  conditions: {
    extend: {
      // 既定の dark は `.dark &`。クラスは付けていないので、media でないと切り替わらない。
      dark: "@media (prefers-color-scheme: dark)",
    },
  },
  theme: {
    extend: {
      breakpoints: {
        // サイト案内の 3 列化（441px）。他の段階が rem なので、単位を混ぜると並びが崩れる。
        guide: "27.5625rem",
        sm: "40rem",
        md: "48rem",
        lg: "64rem",
      },
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
          ...textLineHeights,
        },
        fontWeights: {
          normal: { value: "400" },
          medium: { value: "500" },
          semibold: { value: "600" },
          bold: { value: "700" },
          extrabold: { value: "800" },
        },
        // tracking-tighter。spacing の倍数ではなく、fontSize の行間でもない。
        letterSpacings: {
          tighter: { value: "-0.05em" },
        },
        // 日本語は BIZ UDPGothic。Inter の latin に無い字は次のファミリーで描く。
        fonts: {
          sans: { value: '"Inter", "BIZ UDPGothic", sans-serif' },
          mono: { value: '"Fira Code", monospace' },
        },
        spacing: {
          ...lengthScale(spacingSteps),
          // 分数と em は spacing の倍数ではない。
          "1/4": { value: "25%" },
          "1/3": { value: "33.3333333333%" },
          "1/2": { value: "50%" },
          em: { value: "1em" },
        },
        sizes: {
          ...lengthScale(spacingSteps),
          full: { value: "100%" },
          min: { value: "min-content" },
          max: { value: "max-content" },
          fit: { value: "fit-content" },
          prose: { value: "65ch" },
          "2/3": { value: "66.6666666667%" },
          "2xl": { value: "42rem" },
          "3xl": { value: "48rem" },
          "4xl": { value: "56rem" },
          "5xl": { value: "64rem" },
          // 予定表の min-h-60dvh。spacing の倍数ではなく、生の長さは strictTokens で書けない。
          "60dvh": { value: "60dvh" },
          "90dvh": { value: "90dvh" },
        },
        // md は wind4 の `rounded`（radius.DEFAULT = 0.25rem）。
        // `rounded-md`（0.375rem）に合わせると、接尾辞なしの rounded が太くなる。
        radii: {
          xs: { value: "0.125rem" },
          sm: { value: "0.25rem" },
          md: { value: "0.25rem" },
          lg: { value: "0.5rem" },
          xl: { value: "0.75rem" },
          "2xl": { value: "1rem" },
          full: { value: "calc(infinity * 1px)" },
        },
        shadows: {
          // 選択枠の 1px。outline の ring は box-shadow ではなく、hover の影と重ならない。
          ring: { value: "0 0 0 1px {colors.border.accent}" },
          // button の hover は輪と shadow.sm を一つの box-shadow に並べる。sm だけだと輪が消える。
          ringRaised: {
            value:
              "0 0 0 1px {colors.border.accent}, 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          },
          sm: {
            value: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          },
          md: {
            value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          },
          xl: {
            value: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          },
          none: { value: "0 0 rgb(0 0 0 / 0)" },
        },
        // wind4 の blur-sm は 4px ではない。生成 CSS は blur(8px)。backdrop-blur-3xl は 64px。
        blurs: {
          sm: { value: "8px" },
          "3xl": { value: "64px" },
        },
        aspectRatios: {
          video: { value: "16/9" },
        },
        gradients: {
          // 写真の上端と下端。色は overlay トークンなので、モードでは変わらない。
          photoScrim: {
            value:
              "linear-gradient(to top, {colors.overlay.scrim}, transparent, {colors.overlay.veil})",
          },
        },
        animations: {
          // animate-spin。1s linear infinite。
          spin: { value: "spin 1s linear infinite" },
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
            // 注意の文字。status.warning は両モード同じ橙で、白地の文字には薄い。
            warning: semanticColor(amber700, amber400),
            // presetTypography の prose-gray。本文を fg.base（zinc）にすると明るさが変わる。
            prose: semanticColor(gray700, gray300),
            heading: semanticColor(gray900, white),
            quote: semanticColor(gray900, gray100),
          },
          bg: {
            base: semanticColor(zinc50, zinc900),
            muted: semanticColor(zinc300, zinc700),
            ghost: semanticColor(zinc100At60, zinc800At60),
            invert: semanticColor(zinc900, zinc50),
            accent: semanticColor(sky700, sky500),
            subtle: semanticColor(zinc200At20, zinc800At20),
            // bg-muted を 50% にしたもの。不透明な bg.muted でも、20% の bg.subtle でもない。
            mutedHalf: semanticColor(
              `color-mix(in srgb, ${zinc300} 50%, transparent)`,
              `color-mix(in srgb, ${zinc700} 50%, transparent)`,
            ),
            // 選択行の地。sky-600 の 8% で、ダークでも sky-500 にしない。
            selected: sameColor(`color-mix(in srgb, ${sky600} 8%, transparent)`),
          },
          border: {
            base: semanticColor(zinc300, zinc700),
            muted: semanticColor(zinc400, zinc600),
            ghost: semanticColor(zinc100At60, zinc800At60),
            invert: semanticColor(zinc600, zinc400),
            accent: semanticColor(sky600, sky500),
            prose: semanticColor(gray200, gray700),
          },
          accent: {
            // checkbox の accent-color。border.accent はダークで sky-500 になる。
            field: sameColor(sky600),
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
          // 写真の上に載せる色。zinc の fg に寄せると、ダークで白黒が反転する。
          overlay: {
            fg: sameColor(white),
            scrim: sameColor("color-mix(in oklab, black 30%, transparent)"),
            veil: sameColor("color-mix(in oklab, black 10%, transparent)"),
            frame: sameColor(zinc900),
          },
        },
      },
      textStyles: {
        h1: { value: { fontSize: "3xl", fontWeight: "bold", lineHeight: "3xl" } },
        h2: { value: { fontSize: "2xl", fontWeight: "semibold", lineHeight: "2xl" } },
        h3: { value: { fontSize: "xl", fontWeight: "medium", lineHeight: "xl" } },
        h4: { value: { fontSize: "lg", fontWeight: "medium", lineHeight: "lg" } },
      },
      recipes: { link, button, card, control, prose },
      keyframes: {
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  // extend だと preset-base の stack（gap 8px）が残る。Uno の shortcut は間隔を持たない。
  patterns: { container, stack },
});
