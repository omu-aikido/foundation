# foundation

大阪公立大学合氣道部の公式サイトと、活動記録・アカウント管理を担うプラットフォームを管理するモノレポです。Bun workspacesとVite+を共通の開発基盤にしています。

Bunは依存管理・補助スクリプト・テストに使用します。cf CLIの実行にはNode.js 22以上が必要です。WorkerはCloudflare runtimeで動作し、各`cloudflare.config.ts`の互換日付と`nodejs_compat`に従います。

TypeScriptの共通設定はroot `tsconfig.base.json`、Bunテスト用の共通型設定は`tsconfig.test.json`です。各workspaceの`tsconfig.json`と`tsconfig.test.json`でruntimeとテストの型を分け、`vp run check`でrootの共通lint・format設定を適用します。

## セットアップ

```sh
vp install
```

平文の環境ファイルはGit管理せず、SiteとPlatformの暗号化済み環境ファイルは`secrets/`に置きます。共通の処理は`scripts/env.ts`です。AGE identityはリポジトリ外に置き、必要に応じて`AGE_IDENTITY_FILE`で指定してください。

| 暗号化ファイル                    | ローカルの平文ファイル      | 扱い |
| --------------------------------- | --------------------------- | ---- |
| `secrets/platform/client.env.age` | `apps/platform/client/.env` | 必須 |
| `secrets/platform/server.env.age` | `apps/platform/server/.env` | 必須 |
| `secrets/platform/e2e.env.age`    | `e2e/.env`                  | 必須 |
| `secrets/site/site.env.age`       | `apps/site/.env`            | 任意 |

- `vp run dev:platform`：Client・Server・E2Eの不足している`.env`だけ復号して起動し、既存の平文ファイルはそのまま使います。
- `vp run dev:site`：`apps/site/.env`がない場合だけ、`secrets/site/site.env.age`から復号して起動します。既存の平文ファイルはそのまま使い、暗号化ファイルもない場合は復号せずに起動します。

明示的な復号は`bun scripts/env.ts decrypt`、暗号化は`bun scripts/env.ts encrypt`です。明示的な復号はClient・Server・E2Eに加え、`secrets/site/site.env.age`がある場合だけSiteも対象とし、既存の平文ファイルも置き換えます。暗号化は`secrets/dev.recipients`を使用し、Siteは`apps/site/.env`がある場合だけ対象になります。必須入力が不足している場合は、ageの実行前に停止します。これらのコマンドはCloudflareへのsecret登録やdeployを行いません。Workerのsecret宣言は各アプリの`cloudflare.config.ts`で管理し、公開用の環境変数にsecretを入れないでください。

## よく使うコマンド

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

`build:*`はローカルbuildのみで、deployやCloudflareリソース変更はしません。Siteの`build:site`はNuxt/Nitro build後に`.cloudflare/output/v0`のBuild Outputを生成します。`build:platform`はSPAとWorkerのcf buildを実行します。

SiteのWorker local previewは`vp run build:site`後に`cd apps/site && bun run preview`で起動します。Wranglerは`--experimental-new-config`で`cloudflare.config.ts`を読み、`--local`でremote bindingsを無効にします。`build:site`はNitro Build Outputを生成しますが、deployはしません。

## 構成

- `apps/site/`: Nuxt 4 / Nitroの公式サイト
- `apps/platform/client/`: Vue SPA
- `apps/platform/server/`: Hono API / Cloudflare Worker
- `packages/database/`: Tursoローカル開発とDrizzle migrations
- `packages/record-domain/`: Recordの共有domain型・schema・ロジック
- `scripts/platform/`: Recordの開発起動、環境ファイル、release-note補助

アプリごとのCloudflare設定は各アプリの`cloudflare.config.ts`です。SiteはstableなページをSSR prerenderし、予定表はruntime SSRします。Nitro hookがWorker設定とNitro生成物からcf CLI用manifestを構成します。Vite+ toolchain設定はroot `vite.config.ts`に集約し、app側のVite設定はbuild/dev-server設定に限ります。詳細は[構成方針](docs/architecture-plan.md)を参照してください。
