# 開発環境と秘密情報

平文の環境ファイルとAGE identityはGit管理しません。開発環境ファイルの暗号化済み版は `secrets/` にあります。対象ファイル、recipient、必須キーは [`secrets/development/targets.ts`](../secrets/development/targets.ts)、共通処理は [`scripts/env.ts`](../scripts/env.ts) が定義します。

| 暗号化ファイル                                | ローカルの平文ファイル         | 必須キー                                                                                                                                                            |
| --------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secrets/development/platform/client.env.age` | `apps/platform/client/.env`    | `VITE_CLERK_PUBLISHABLE_KEY`                                                                                                                                        |
| `secrets/development/platform/server.env.age` | `apps/platform/server/.env`    | `CLERK_AUTHORIZED_PARTIES`, `CLERK_FRONTEND_API_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `TURSO_AUTH_TOKEN`, `TURSO_DATABASE_URL` |
| `secrets/development/platform/e2e.env.age`    | `apps/platform/tests/e2e/.env` | `E2E_EMAIL`, `E2E_FIRSTNAME`, `E2E_LASTNAME`, `E2E_PASSWORD`, `E2E_USERNAME`                                                                                        |
| `secrets/development/site/site.env.age`       | `apps/site/.env`               | `CF_TURNSTILE_SECRETKEY`, `DISCORD_WEBHOOK_URL`, `PUBLIC_CF_TURNSTILE_SITEKEY`                                                                                      |

## AGE identity

AGE identityはリポジトリ外に置きます。既定では `~/.config/age/keys.txt`、次に `~/.config/age/identity.age` を探します。別の場所を使う場合は `AGE_IDENTITY_FILE` にパスを設定してください。`~` と `~/...` も利用できます。

## 復号・暗号化

通常の開発起動では `vp run dev:platform` がPlatformのClient・Server・E2E用ファイルを、`vp run dev:site` がSite用ファイルを扱います。どちらも不足しているファイルだけを復号し、既存の平文を上書きしません。

明示的に全対象を処理するコマンド:

```sh
bun secrets/development/targets.ts decrypt
bun secrets/development/targets.ts encrypt
```

明示的な復号は既存の平文ファイルも置き換えます。暗号化は全対象の平文ファイルが必要で、現在すべて `secrets/development/recipients` をrecipientとして使います。暗号化は入力ファイルとキーの組み合わせ、およびrecipientファイルの存在をage実行前に検証します。復号後もキーを検証し、キーが一致しない平文は書き込みません。復号ファイルは一時ファイル経由で書き込み、権限を `0600` に設定します。

これらのコマンドはCloudflareへのsecret登録やdeployを行いません。Worker secretの宣言は各アプリの `cloudflare.config.ts` で管理します。公開用環境変数にsecretを設定しないでください。
