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
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
