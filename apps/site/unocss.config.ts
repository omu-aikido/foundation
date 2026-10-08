import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTagify,
  presetTypography,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  presets: [
    presetWind4({
      dark: "media",
    }),
    presetAttributify(),
    presetIcons({
      autoInstall: true,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
    presetTypography(),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: "Inter:400,700",
        mono: "Fira+Code:400,700",
      },
    }),
    presetTagify(),
  ],
  transformers: [
    transformerDirectives(), // @apply, @screen
    transformerVariantGroup(), // hover:(text-red bg-blue) 記法
  ],
  theme: {
    colors: {
      success: "oklch(0.571 0.181 145)",
      warning: "oklch(0.67 0.185 55)",
      error: "oklch(0.567 0.224 27)",
    },
    font: {
      sans: '"Inter", sans-serif',
      mono: '"Fira Code", monospace',
    },
  },
  shortcuts: [
    // Typography
    {
      h1: "text-3xl font-bold",
      h2: "text-2xl font-semibold",
      h3: "text-xl font-medium",
      h4: "text-lg font-medium",
    },
    // Layout
    {
      container: "max-w-4xl lg:mx-auto md:mx-8 sm:mx-6 mx-4",
      stack: "flex flex-col",
      row: "flex flex-row",
      section: "mx-2 my-3",
      start: "flex gap-2 items-start justify-center text-start",
      center: "flex gap-2 items-center justify-center text-center",
      end: "flex gap-2 items-end justify-center text-end",
    },
    // Color
    {
      // palette
      /// background colors
      "bg-accent": "bg-sky-600 dark:bg-sky-500",
      "bg-base": "bg-zinc-50 dark:bg-zinc-900",
      "bg-muted": "bg-zinc-300 dark:bg-zinc-700",
      "bg-ghost": "bg-zinc-100/60 dark:bg-zinc-800/60",
      "bg-invert": "bg-zinc-900 dark:bg-zinc-50",
      /// foreground colors
      "fg-accent": "text-sky-600 dark:text-sky-500",
      "fg-base": "text-zinc-900 dark:text-zinc-50",
      "fg-muted": "text-zinc-600 dark:text-zinc-400",
      "fg-ghost": "text-zinc-400 dark:text-zinc-500",
      "fg-invert": "text-zinc-50 dark:text-zinc-900",
      /// borders
      "bordered-accent": "border-sky-600 dark:border-sky-500",
      "bordered-base": "border-zinc-300 dark:border-zinc-700",
      "bordered-muted": "border-zinc-400 dark:border-zinc-600",
      "bordered-ghost": "border-zinc-100/60 dark:border-zinc-800/60",
      "bordered-invert": "border-zinc-600 dark:border-zinc-400",
      // combine
      accent: "bg-accent fg-invert",
      base: "bg-base fg-base",
      muted: "bg-muted fg-muted",
      ghost: "bg-ghost fg-ghost",

      // Status
      "status-error": "text-error font-medium",
      "status-icon-error": "text-error bg-error/10 p-1 rounded-full",
    },
    // Components
    {
      mark: "bg-accent fg-invert px-1 rounded-xs",
      card: "rounded-lg bg-ghost border bordered-muted p-4 shadow-sm",
      link: "text-sky-700 dark:text-sky-400 no-underline hover:underline underline-offset-4",
      outer_link:
        "text-sky-700 dark:text-sky-400 no-underline hover:underline underline-offset-4 after:content-['_↗_']",
      button:
        "rounded-sm hover:(cursor-pointer shadow-sm opacity-90) active:(transform translate-y-1px) focus-visible:(ring-1 ring-sky-600 dark:ring-sky-500) disabled:(cursor-not-allowed translate-y-0 opacity-60 hover:shadow-none hover:cursor-not-allowed)",
      control:
        "rounded border bg-base px-3 py-2 fg-base bordered-muted focus:bordered-accent focus:outline-none",
      input: "control",
    },
    // Events
    {
      "event-nakamozu": "text-sky-700 dark:text-sky-300",
      "event-sugimoto": "text-emerald-700 dark:text-emerald-300",
      "event-morinomiya": "text-orange-700 dark:text-orange-300",
      "event-event": "text-rose-700 dark:text-rose-300",
      "event-default": "text-zinc-700 dark:text-zinc-300",
    },
  ],
});
