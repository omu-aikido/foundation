import { bundledLicenseListPlugin } from "vite-plugin-third-party-licenses";
import cloudflareConfig from "./cloudflare.config";
import vueDevTools from "vite-plugin-vue-devtools";
import { writeCloudflareBuildOutput } from "./build/cloudflare-build-output";
import { securityHeaders } from "./security-headers";
import type { NuxtConfig } from "nuxt/schema";

// Use Nuxt's own Vite plugin type; this app's `vite` can resolve to another peer-context copy.
type NuxtVitePlugin = NonNullable<NonNullable<NuxtConfig["vite"]>["plugins"]>[number];

// Keep stable content cached as assets; calendar pages render at request time.
const prerenderRoutes = [
  "/",
  "/about",
  "/about/aikido",
  "/about/links",
  "/access",
  "/apps",
  "/apps/lotAikido",
  "/apps/randoriTimer",
  "/contact",
  "/faq",
  "/privacy-policy",
  "/sitemap-index.xml",
  "/support",
  "/terms-of-service",
];

export default defineNuxtConfig({
  compatibilityDate: "2026-07-19",
  devtools: {
    enabled: false,
  },
  modules: ["@unocss/nuxt", "@nuxt/fonts", "@nuxtjs/sitemap"],
  // panda.css のレイヤー順の宣言を、global.css の @layer base より先に読ませる。
  css: ["~/assets/panda.css", "~/assets/global.css"],
  postcss: {
    plugins: {
      "@pandacss/dev/postcss": {},
    },
  },
  site: {
    url: "https://omu-aikido.com",
    name: "大阪公立大学合氣道部",
  },
  app: {
    head: {
      htmlAttrs: { lang: "ja", class: "base" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "color-scheme", content: "light dark" },
        {
          name: "theme-color",
          content: "#ffffff",
          media: "(prefers-color-scheme: light)",
        },
        {
          name: "theme-color",
          content: "#1a1a1a",
          media: "(prefers-color-scheme: dark)",
        },
      ],
      link: [
        { rel: "sitemap", href: "/sitemap-index.xml" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" },
        { rel: "preconnect", href: "https://challenges.cloudflare.com" },
      ],
    },
  },
  runtimeConfig: {
    public: {
      turnstileSiteKey: process.env.PUBLIC_CF_TURNSTILE_SITEKEY ?? "",
    },
    contactAllowedOrigins: process.env.CONTACT_ALLOWED_ORIGINS ?? "https://omu-aikido.com",
    turnstileHostname: process.env.TURNSTILE_HOSTNAME ?? "omu-aikido.com",
  },
  // Nitro defu-merges matched route rules; a more specific rule wins only on conflicting keys.
  // Keep security headers on "/**". Copying them onto each noScripts route would drift from that set.
  routeRules: {
    "/api/**": {
      cors: false,
      headers: { "Cache-Control": "no-store" },
    },
    "/about": { noScripts: true },
    "/about/aikido": { noScripts: true },
    "/about/links": { noScripts: true },
    "/access": { noScripts: true },
    "/apps": { noScripts: true },
    "/faq": { noScripts: true },
    "/privacy-policy": { noScripts: true },
    "/support": { noScripts: true },
    "/terms-of-service": { noScripts: true },
    "/**": { headers: securityHeaders },
  },
  nitro: {
    preset: "cloudflare_module",
    hooks: {
      compiled: (nitro) =>
        writeCloudflareBuildOutput({
          preset: nitro.options.preset,
          rootDir: nitro.options.rootDir,
          serverDir: nitro.options.output.serverDir,
          publicDir: nitro.options.output.publicDir,
          config: cloudflareConfig,
          assetHeaders: securityHeaders,
        }),
    },
    prerender: {
      crawlLinks: false,
      routes: prerenderRoutes,
      ignore: ["/__calendar"],
      failOnError: true,
    },
  },
  sitemap: {
    exclude: ["/api/**", "/404"],
  },
  experimental: {
    payloadExtraction: false,
    viewTransition: true,
  },
  vite: {
    plugins: [
      // Bun's peer-context copies of Vite Plus trigger recursive plugin-type conflicts with Nuxt.
      bundledLicenseListPlugin() as unknown as NuxtVitePlugin,
      vueDevTools({
        launchEditor: "zed",
      }) as unknown as NuxtVitePlugin,
    ],
    optimizeDeps: {
      include: ["arktype"],
    },
  },
  // 先頭以外の font-family は @font-face にならない。日本語の BIZ UDPGothic は2番目なので global で出す。
  fonts: {
    provider: "google",
    defaults: {
      styles: ["normal"],
      subsets: ["latin"],
    },
    families: [
      // 可変フォントなので 400–800 を1ファイルで取る。
      // 既定ではスタック後続の BIZ UDPGothic も Inter 用に size-adjust され、
      // 端末にある BIZ UDPGothic（Windows 標準）で日本語が 85% に縮む。欧文だけに絞る。
      {
        name: "Inter",
        weights: ["400 800"],
        fallbacks: ["Segoe UI", "Helvetica Neue", "Arial", "Noto Sans", "Liberation Sans"],
      },
      {
        name: "BIZ UDPGothic",
        weights: [400, 700],
        subsets: ["japanese", "latin"],
        global: true,
      },
      { name: "Fira Code", weights: [400] },
    ],
  },
  unocss: {
    nuxtLayers: true,
  },
});
