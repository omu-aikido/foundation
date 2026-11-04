import { bundledLicenseListPlugin } from "vite-plugin-third-party-licenses";
import { defineConfig } from "vite-plus";
import { fileURLToPath } from "node:url";
import UnoCSS from "unocss/vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    vueDevTools({
      launchEditor: "zed",
    }),
    bundledLicenseListPlugin(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      // ゾーンの WAF は URL に `s3` を含むリクエストを 403 にする。base64 のハッシュは
      // まれに `s3` を含み、そのチャンクが読めずに画面が壊れる。hex には `s` が無い。
      output: { hashCharacters: "hex" },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
