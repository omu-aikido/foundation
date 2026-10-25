# 開発

## 前提

- Node.js 26.12.1 と Bun 1.4.4 を使用します。依存関係は以下の3つのインストールルートで、それぞれ `vp install` で導入します。
- Cloudflare CLI を使う処理にも、このNode.jsバージョンを使用します。
- Worker は Cloudflare runtime で動作し、各アプリの `cloudflare.config.ts` が互換日付と `nodejs_compat` を定めます。
- TypeScript の共通設定は `tsconfig.base.json`、テスト用の共通型設定は `tsconfig.test.json` です。各workspaceの `tsconfig.json` がruntime用、`test/tsconfig.json`（Siteは `tests/tsconfig.json`）がテスト用の型を定義します。
- SiteのNuxt設定では、外部ViteプラグインをNuxt側の `PluginOption` として型付けします。Bunのisolated linkerが同じVite Plusでも異なるpeer解決先を作る場合に、型定義の重複でtypecheckが失敗するのを防ぎます。実行時のプラグイン構成には影響しません。

開発用環境変数の作成・暗号化の手順は[環境設定](environment.md)を参照してください。

## 依存関係の導入

| インストールルート | 対象                                       | ロックファイル           |
| ------------------ | ------------------------------------------ | ------------------------ |
| リポジトリルート   | 共通開発ツールと `packages/*` の開発・検証 | `bun.lock`               |
| `apps/site`        | Site Worker                                | `apps/site/bun.lock`     |
| `apps/platform`    | Client SPAとServerを含むPlatform Worker    | `apps/platform/bun.lock` |

```sh
vp install
(cd apps/site && vp install)
(cd apps/platform && vp install)
```

アプリの依存導入はルートから `vp run install:apps` でも実行できます。CIでは各ルートで `vp install --frozen-lockfile` を使います。各アプリはルートの `node_modules` に依存せずbuildできます。ビルドツールも必要なので、開発依存を含めて導入してください。

共有パッケージは `file:` で参照します。リポジトリ全体をcheckoutした状態でインストールしてください。共有パッケージを編集したら、利用するアプリ側でも再度 `vp install` を実行して取り込みます。共有パッケージの外部依存を変更した場合は、ルートと利用先のロックファイルをそれぞれ更新します。

## Workers Builds

Workers Buildsでは以下を設定します。Build variablesは `SKIP_DEPENDENCY_INSTALL=1`、`BUN_VERSION=1.4.4`、`NODE_VERSION=26.12.1` とし、自動依存導入を止めてbuildコマンド内で対象のロックファイルから導入します。Cloudflareのビルド環境ではVite+のグローバル導入を前提にせず `bun install` を使います。

| 設定           | Site                                                | Platform                                              |
| -------------- | --------------------------------------------------- | ----------------------------------------------------- |
| Root directory | `apps/site`                                         | `apps/platform`                                       |
| Build command  | `bun install --frozen-lockfile && bun run cf-build` | `bun install --frozen-lockfile && bun run build`      |
| Deploy command | `bunx --no-install cf deploy --prebuilt`            | `cd server && bunx --no-install cf deploy --prebuilt` |

PlatformのbuildはClient、Serverの順に実行します。ClientのVite設定はmodule runnerで読み込み、`file:` で導入した共有TypeScriptプラグインも変換します。上記のDeploy commandは実際のデプロイ用です。ローカル検証には既存の `vp run deploy:site` / `vp run deploy:platform`（`--dry-run`）を使用してください。

Workers Buildsの設定仕様は[Build image](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/)と[Build watch paths](https://developers.cloudflare.com/workers/ci-cd/builds/build-watch-paths/)を参照してください。

Cloudflare側のbuild watch pathsには、リポジトリルートからの相対パスで以下を設定します。

| Worker   | Include paths                                                                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site     | `apps/site/*`, `packages/lot-aikido/*`, `packages/randori-timer/*`, `packages/vite-plugin-third-party-licenses/*`, `patches/*`, `tsconfig.base.json`, `tsconfig.test.json` |
| Platform | `apps/platform/*`, `packages/record-domain/*`, `packages/vite-plugin-third-party-licenses/*`, `tsconfig.base.json`, `tsconfig.test.json`, `vite.config.ts`                 |

`*` はWorkers Buildsのパス指定でサブディレクトリも含めます。ルートの `package.json` と `bun.lock` はアプリの依存解決に使わないため監視対象に含めません。Cloudflareダッシュボードの作業ルート・依存導入・build/deployコマンド・監視パスは、この構成に合わせて設定してください。

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

ルートとSiteの `package.json` で `simple-git` を override し、`braces` と `node-forge` は `patches/` のローカルパッケージを使用します。Viteは各インストールルートのoverrideでVite Plusのcoreへ解決します。PlatformのClientが使うHono RPC型は `apps/platform/server/rpc.d.ts` に置きます。

`build:site` はコンテンツ生成と `nuxt build` を実行し、Nuxt/Nitro の出力を Cloudflare Build Output Specification v0 (`apps/site/.cloudflare/output/v0`) に構成して `cf deploy --prebuilt --dry-run` で検証します。`build:platform` はClient SPAとServer Workerをローカルでbuildします。どちらもdeployやCloudflareリソース変更は行いません。`test:*`、`typecheck:*` もローカル検証です。

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
