# foundationの構成方針

## 目的

公式サイトとRecordプラットフォームを一つのBun/Vite+ monorepoで管理しつつ、アプリごとの実行・デプロイ単位を保つ。共有コードはアプリの親階層ではなく、独立workspace packageとして管理する。

## 現在の配置

- `apps/site`: Nuxt / Nitroによる公式サイト
- `apps/platform/client`: Vue SPA
- `apps/platform/server`: Hono API / Cloudflare Worker
- `apps/platform/tests/e2e`: Platform E2E環境ファイル
- `packages/database`: Tursoローカル開発とDrizzle migrations
- `packages/record-domain`: Recordの共有型・schema・ロジック
- `packages/lot-aikido`: 抽選機能のUI・composable・技データ
- `packages/randori-timer`: 乱取りタイマーのUI・composable・音声処理
- `packages/vite-plugin-third-party-licenses`: third-party license一覧を出力するVite plugin
- `scripts/platform`: Recordの開発・環境・release-note補助
- `scripts/site`: Siteの開発補助

インストール単位はroot（開発ツールと `packages/*` のworkspace）、Site、Platform（ClientとServerのworkspace）に分け、各単位で `package.json` と `bun.lock` を管理する。アプリは共有パッケージを `file:` で参照する。導入手順とWorkers Buildsの設定は[開発ドキュメント](development.md)を正本とする。root共通コマンドのtask定義とVite+のlint・formatなどtoolchain設定はroot `vite.config.ts`を正本とする。app側のVite設定には各app固有のbuild/dev-server設定のみを置き、アプリ固有の依存とscriptは各アプリの `package.json` に置く。Bunのバージョンは各インストールルートの `package.json` の `packageManager` に定義する。

## Site rendering

SiteはNuxtのSSRを基本とする。安定した公開ページとツールはSSRでprerenderしてcached assetsとして維持し、予定表は最新予定を取得するruntime SSRにする。route別のCSR overrideと重複したprerender ruleは設けない。security headersはNuxt routeRulesと生成するCloudflare `_headers`でSSR/asset双方に適用し、APIの`no-store`とNuxt SEO metadataも維持する。ブラウザAPIが必要なtimer/audio機能はmount後に初期化し、lotAikidoの乱数seedはSSR hydration後にshuffleしてサーバーと初期HTMLを一致させる。

## Site security contract

- お問い合わせAPIは `Content-Length` を信用せずrequest bodyをstreamで読み、累計16 KiBを超えた時点で読み込みを中断して413を返す。
- 予定表の固定ICS feed取得はfetchとbody readの両方を含めて5秒で打ち切り、bodyは最大1 MiBまで受け付ける。
- CSPの `script-src` は `unsafe-eval` を許可しない。Nuxt prerender/hydration用inline scriptを維持するため `unsafe-inline` は許可する。

この節をSiteのセキュリティ動作の正本とし、変更時は実装とテストを合わせて更新する。

## Cloudflare build

SiteはNuxtのNitro `cloudflare_module` presetを使い、route renderingはNuxt SSRを基本とする。Nitro `compiled` hookは同じ `apps/site/cloudflare.config.ts` のWorker設定を使い、Nitroのserver/public出力をBuild Output Specification v0 (`apps/site/.cloudflare/output/v0`)として配置する。Worker manifestはpartial形式とし、module inventoryはcf CLIのreaderにbundleから解決させる。

この橋渡しはSiteの `package.json` で指定する `cf` バージョンに要求されるBuild Outputに合わせたもので、Site testsは生成物の配置と設定を検査し、`cf deploy --prebuilt --dry-run` がreaderとの互換性を検証する。Local Worker previewはWranglerの `--experimental-new-config` で同じ `cloudflare.config.ts` を読み、Nitro出力と `.output/public` を使う。Cloudflare CLI・Nitro更新時はこの契約を再確認する。

Siteのbuildは `vp run build:site`（root `vite.config.ts` のtask）から `apps/site` の `cf-build` scriptを実行し、コンテンツ生成と `nuxt build` の後に `cf deploy --prebuilt --dry-run` で生成物を検証します。Platformの `vp run build:platform` はClientの `vp build` とServerの `cf build` を実行します。これらはローカルbuildでありdeployやCloudflareリソース変更を行いません。Site previewはbuild後に `cd apps/site && bun run preview` で起動し、Wranglerの `--local` でremote bindingsを無効にします。

## 設定と運用境界

- Worker runtime設定は各アプリの `cloudflare.config.ts` を正本にする。Site previewは `wrangler dev --experimental-new-config --local` で同じ設定を読み、remote bindingsを無効にしてWorkerを起動する。Wranglerのasset directoryは `.output/public` をCLI optionで渡すため、Siteに別のWrangler config fileは置かない。Platform serverの `wrangler.config.ts` はclient assets directoryを設定するtooling補助で、cf Build Output生成に必要なため維持する。
- Site Worker (`site`) は `omu-aikido.com`、Platform Worker (`platform`) は `app.omu-aikido.com` を使用する。既存の各Workerにデプロイし、設定済みのcustom domainを維持する。
- ローカル `.env` とAGE identityはGit管理しない。詳細は[環境設定](environment.md)を参照する。
- build・test・typecheckはローカル検証であり、deploy、Cloudflareリソース操作、DB変更を含めない。
