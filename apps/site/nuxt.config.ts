import { bundledLicenseListPlugin } from "vite-plugin-third-party-licenses";
import cloudflareConfig from "./cloudflare.config";
import vueDevTools from "vite-plugin-vue-devtools";
import { writeCloudflareBuildOutput } from "./build/cloudflare-build-output";
import { securityHeaders } from "./security-headers";

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
  modules: ["@unocss/nuxt", "@nuxtjs/sitemap"],
  css: ["~/assets/global.css"],
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
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
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
  routeRules: {
    "/api/**": {
      cors: false,
      headers: { "Cache-Control": "no-store" },
    },
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
      bundledLicenseListPlugin(),
      vueDevTools({
        launchEditor: "zed",
      }),
    ],
    optimizeDeps: {
      include: ["arktype"],
    },
  },
  unocss: {
    nuxtLayers: true,
  },
});
