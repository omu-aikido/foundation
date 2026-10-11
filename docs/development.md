# 開発

## 前提

- Bun 1.4.3 以上。依存関係は `vp install` で導入します。
- Cloudflare CLI を使う処理には Node.js 22 以上が必要です。
- Worker は Cloudflare runtime で動作し、各アプリの `cloudflare.config.ts` が互換日付と `nodejs_compat` を定めます。
- TypeScript の共通設定は `tsconfig.base.json`、テスト用の共通型設定は `tsconfig.test.json` です。各workspaceの `tsconfig.json` がruntime用、`test/tsconfig.json`（Siteは `tests/tsconfig.json`）がテスト用の型を定義します。

開発用環境変数の作成・暗号化の手順は[環境設定](environment.md)を参照してください。

## 開発と検証

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

ルートの `package.json` で `simple-git` のセキュリティ修正版を override し、ルートの `patchedDependencies` が適用する `patches/` 内の追跡対象パッチで Nuxt DevTools のESM named export importを互換化しています。上流 DevTools が修正版の named export に対応したら、override とパッチを合わせて見直してください。

`build:site` はコンテンツ生成後に `cf build` を実行し、Nuxt/Nitro の出力を Cloudflare Build Output Specification v0 (`apps/site/.cloudflare/output/v0`) に構成します。`build:platform` はClient SPAとServer Workerをローカルでbuildします。どちらもdeployやCloudflareリソース変更は行いません。`test:*`、`typecheck:*` もローカル検証です。

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
