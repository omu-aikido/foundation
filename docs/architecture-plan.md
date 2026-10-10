# foundationの構成方針

## 目的

公式サイトとRecordプラットフォームを一つのBun/Vite+ monorepoで管理しつつ、アプリごとの実行・デプロイ単位を保つ。共有コードはアプリの親階層ではなく、独立workspace packageとして管理する。

## 現在の配置

- `apps/site`: Nuxt 4 / Nitroによる公式サイト
- `apps/platform/client`: Vue SPA
- `apps/platform/server`: Hono API / Cloudflare Worker
- `packages/database`: ローカルTurso開発とDrizzle migrations
- `packages/record-domain`: Recordの共有型・schema・ロジック
- `scripts/platform`: Recordの開発・環境補助

workspace一覧はroot `package.json`、root共通コマンドのtask定義とVite+のlint・formatなどtoolchain設定はroot `vite.config.ts`を正本とする。app側のVite設定には各app固有のbuild/dev-server設定のみを置き、アプリ固有の依存とscriptは各アプリの`package.json`に置く。

## Site rendering

SiteはNuxtのSSRを基本とする。安定した公開ページとツールはSSRでprerenderしてcached assetsとして維持し、予定表は最新予定を取得するruntime SSRにする。route別のCSR overrideと重複したprerender ruleは設けない。security headersはNuxt routeRulesと生成するCloudflare `_headers`でSSR/asset双方に適用し、APIの`no-store`とNuxt SEO metadataも維持する。ブラウザAPIが必要なtimer/audio機能はmount後に初期化し、lotAikidoの乱数seedはSSR hydration後にshuffleしてサーバーと初期HTMLを一致させる。

## Cloudflare build

SiteはNitroの`cloudflare_module` presetを使い、route renderingはNuxt SSRを基本とする。Nitro `compiled` hookは同じ`apps/site/cloudflare.config.ts`のWorker設定を使い、Nitroのserver/public出力をBuild Output Specification v0 (`.cloudflare/output/v0`)として配置する。Worker manifestはpartial形式とし、module inventoryはcf CLIのreaderにbundleから解決させる。

この橋渡しは`cf@1.0.0-beta.13`が要求するBuild Outputに合わせたもので、site testsは生成物の配置と設定を検査し、`cf build`がreaderとの互換性を検証する。Local Worker previewはWranglerの`--experimental-new-config`で同じ`cloudflare.config.ts`を読み、Nitro出力と`.output/public`を使う。Cloudflare CLI・Nitro更新時はこの契約を再確認する。

## 設定と運用境界

- Worker runtime設定は各アプリの`cloudflare.config.ts`を正本にする。Siteのlocal previewは`wrangler dev --experimental-new-config --local`で同じ設定を読み、remote bindingsを無効にしてWorkerを起動する。Wranglerのasset directoryは`.output/public`をCLI optionで渡すため、Siteに別のWrangler config fileは置かない。Platform serverの`wrangler.config.ts`はclient assets directoryを設定するtooling補助で、cf Build Output生成に必要なため維持する。
- Site Worker (`page`) は`omu-aikido.com`、Platform Worker (`record`) は`app.omu-aikido.com`を使用する。既存の各Workerにデプロイし、設定済みのcustom domainを維持する。
- ローカル`.env`とAGE identityはGit管理しない。開発scriptは既存の`.env`を保護し、不足ファイルだけ復号する。
- build・test・typecheckはローカル検証であり、deploy、Cloudflareリソース操作、DB変更を含めない。
