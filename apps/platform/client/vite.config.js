import { bundledLicenseListPlugin } from "vite-plugin-thirparty-licenses";
import { defineConfig } from "vite-plus";
import path from "path"; // pathをインポート
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
      "@": path.resolve(__dirname, "./src"),
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
