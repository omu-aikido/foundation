# 大阪公立大学合氣道部 website

Nuxt 4 / Nitroで構築し、Cloudflare Workersの`cloudflare_module` presetでbuildします。stableな公開ページとツールはSSR prerenderし、予定表は最新予定を取得するruntime SSRです。APIとカレンダーrouteもWorkerで処理します。

## Commands

```sh
vp install
vp dev
vp check
vp run typecheck
vp test
vp run build
bun run preview
```

buildではNitro `compiled` hookが`cloudflare.config.ts`のWorker設定とNitro出力をBuild Output Specification v0に配置します。`vp run build`はローカルbuildで、deployしません。ルートの`vite.config.ts`がVite+ toolchain設定を一元管理し、このアプリに固有のビルド設定は`nuxt.config.ts`に置きます。Workers型は`vp run generate-types`で再生成できます。

Workerのlocal previewは`vp run build:site`後に`bun run preview`で起動します。Wranglerは`--experimental-new-config`で`cloudflare.config.ts`を読み、`--local`でremote bindingsを無効にします。static assetsは`.output/public`を渡します。`cloudflare.config.ts`がWorker設定の正本で、Nitro hookによるBuild Output生成も維持します。

## Structure

- `app/`: Vue pages、layout、components
- `content/pages/`: 公開Markdownのsource of truth
- `server/api/`: 問い合わせAPI
- `server/routes/`: カレンダーJSONなどのNitro routes
- `server/services/`: カレンダー、問い合わせ配送処理
- `shared/schemas/`: client/server共有ArkType validator
- `scripts/generate-site-content.ts`: build-timeコンテンツ生成
