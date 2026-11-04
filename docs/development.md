# 開発

## 前提

- Node.js 26.12.1 と Bun 1.4.4 を使用します。依存関係はルートで `vp install` を実行して導入します。
- Cloudflare CLI を使う処理にも、このNode.jsバージョンを使用します。
- Worker は Cloudflare runtime で動作し、各アプリの `cloudflare.config.ts` が互換日付と `nodejs_compat` を定めます。
- TypeScript の共通設定は `tsconfig.base.json`、テスト用の共通型設定は `tsconfig.test.json` です。各workspaceの `tsconfig.json` がruntime用、`test/tsconfig.json`（Siteは `tests/tsconfig.json`）がテスト用の型を定義します。
- SiteのNuxt設定では、外部ViteプラグインをNuxtの設定型から取り出したプラグイン型として型付けします。Bunのisolated linkerが同じVite Plusでも異なるpeer解決先を作る場合に、型定義の重複でtypecheckが失敗するのを防ぎます。実行時のプラグイン構成には影響しません。

開発用環境変数の作成・暗号化の手順は[環境設定](environment.md)を参照してください。

## 依存関係の導入

ルートの `package.json` が `packages/*`、`apps/site`、`apps/platform`、`apps/platform/client`、`apps/platform/server` をworkspaceとしてまとめ、ロックファイルはルートの `bun.lock` だけです。

```sh
vp install
```

CIでは `vp install --frozen-lockfile` を使います。各 `package.json` の依存はexactなバージョンで書き、`bunfig.toml` の `exact = true` で追加時もexactにします。アプリは共有パッケージを `workspace:*` で参照します。

## Workers Builds

Workers Buildsでは以下を設定します。Build variablesは `SKIP_DEPENDENCY_INSTALL=1`、`BUN_VERSION=1.4.4`、`NODE_VERSION=26.12.1` とし、自動依存導入を止めてbuildコマンド内でルートのロックファイルから対象アプリの依存だけを導入します。Cloudflareのビルド環境ではVite+のグローバル導入を前提にせず `bun install` を使います。

| 設定           | Site                                                                                     | Platform                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Root directory | `apps/site`                                                                              | `apps/platform`                                                                              |
| Build command  | `(cd ../.. && bun install --frozen-lockfile --filter official-site) && bun run cf-build` | `(cd ../.. && bun install --frozen-lockfile --filter './apps/platform/**') && bun run build` |
| Deploy command | `bunx --no-install cf deploy --prebuilt`                                                 | `cd server && bunx --no-install cf deploy --prebuilt`                                        |

PlatformのbuildはClient、Serverの順に実行します。ClientのVite設定はmodule runnerで読み込み、workspaceの共有TypeScriptプラグインも変換します。上記のDeploy commandは実際のデプロイ用です。ローカル検証には既存の `vp run deploy:site` / `vp run deploy:platform`（`--dry-run`）を使用してください。

Workers Buildsの設定仕様は[Build image](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/)と[Build watch paths](https://developers.cloudflare.com/workers/ci-cd/builds/build-watch-paths/)を参照してください。

Cloudflare側のbuild watch pathsには、リポジトリルートからの相対パスで以下を設定します。

| Worker   | Include paths                                                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site     | `apps/site/*`, `packages/design-tokens/*`, `packages/lot-aikido/*`, `packages/randori-timer/*`, `packages/vite-plugin-third-party-licenses/*`, `patches/*`, `package.json`, `bunfig.toml`, `tsconfig.base.json`, `tsconfig.test.json` |
| Platform | `apps/platform/*`, `packages/record-domain/*`, `packages/vite-plugin-third-party-licenses/*`, `package.json`, `bunfig.toml`, `tsconfig.base.json`, `tsconfig.test.json`, `vite.config.ts`                                             |

`omu-aikido.com` ゾーンのWAFは、URLに `s3`（大文字小文字を問わない）を含むリクエストを403にします。このためSiteとPlatformのクライアントは、ビルド資産のハッシュを `s` を含まないhexで出力します。`@nuxt/fonts` のフォントのファイル名はbase64urlのハッシュで変えられないため、名前に `s3` を含むフォントはWAFのルールを見直すまで配信されません。

`*` はWorkers Buildsのパス指定でサブディレクトリも含めます。依存の更新は各アプリの `package.json` のexactなバージョンの変化で検知するため、ルートの `bun.lock` は監視対象に含めません。推移的依存だけが変わった場合は、次にそのアプリが変更されたときに反映されます。ルートの `package.json` の `overrides` と `catalog` は両アプリに効くため監視します。Cloudflareダッシュボードの作業ルート・依存導入・build/deployコマンド・監視パスは、この構成に合わせて設定してください。

## 開発と検証

Siteのページタイトルと説明文はVueページの `definePageMeta`、生成コンテンツのページは `apps/site/content/pages/` のfrontmatterで管理します。共通のcanonical URL、OGP、Xカードは `apps/site/app/app.vue` が設定し、共有画像には `apps/site/public/images/hero/bea041cf.png` を使います。

```sh
vp run dev:site
vp run dev:platform
vp run check
vp run typecheck:site
vp run typecheck:platform
vp run test:site
vp run test:platform
vp run build:site
vp run build:platform
```

`dev:site` と `dev:platform` は、必要な `.env` がない場合だけ暗号化ファイルから復号し、既存の平文ファイルを保護して起動します。

ルートの `package.json` で `simple-git` を override し、`braces` と `node-forge` は `patches/` のローカルパッケージを使用します。Viteはルートのoverrideと `catalog` でVite Plusのcoreへ解決します。PlatformのClientが使うHono RPC型は `apps/platform/server/rpc.d.ts` に置きます。

SiteのスタイルはUnoCSSとPandaCSSの共存中です。Siteの画面はPandaで、packagesのUIとアイコンはUnoCSSのままです。詳細は[アーキテクチャ方針](architecture-plan.md)のSite stylesを正本とします。Pandaは `design-tokens` の preset と `strictTokens` を使い、`apps/site/styled-system` は codegen の生成物です。`apps/site` の `postinstall` と `build` が `panda codegen` を実行します。Webフォントは `@nuxt/fonts` がビルド時に取得し、外部オリジンへ接続せずサイト自身から配信します。

`build:site` はコンテンツ生成、`panda codegen`、`nuxt build` を実行し、Nuxt/Nitro の出力を Cloudflare Build Output Specification v0 (`apps/site/.cloudflare/output/v0`) に構成して `cf deploy --prebuilt --dry-run` で検証します。`build:platform` はClient SPAとServer Workerをローカルでbuildします。どちらもdeployやCloudflareリソース変更は行いません。`test:*`、`typecheck:*` もローカル検証です。

SiteのWorker previewはSite build後に実行します。

```sh
cd apps/site && bun run preview
```

これはWranglerの `--experimental-new-config` で `cloudflare.config.ts` を読み、`--local` でremote bindingsを無効にしてWorkerを起動します。Asset directoryには `.output/public` を使います。Build/previewの生成物や実行方法の詳細は[アーキテクチャ方針](architecture-plan.md)を参照してください。

## GitHub PR とリリース

- 通常の作業ブランチから `dev` をbaseとするPRを作成します。`ci.yml` は `dev` / `main` 宛てPRを検証し、`release-note.yml` は `main` 宛てPRのみrelease-note checkを実行します。
- `dev` が変更を統合するブランチです。`main` へ直接通常変更を取り込まず、リリース時に `dev` から `main` へのPRを作成します。
- リリース時期は別途決定します。`main` へのマージは直ちにデプロイを開始するため、明示的なリリース許可を得るまでエージェントは `main` をマージまたはpushしてはいけません。
- CIのbuild/testはローカル検証であり、deployを実行しません。

## 作業ディレクトリ

通常のGit worktreeを使ってください。Nitroが `.git` を除外するため、`.git` 内に置いたworktreeではauto-importsの解決が崩れ、buildできないことがあります。h5iの既定boxはこの構成と互換性がなく、buildには使えません。
