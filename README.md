# foundation

大阪公立大学合氣道部の公式サイトと、活動記録・アカウント管理を担うプラットフォームのモノレポです。Bun workspaces と Vite+ を共通の開発基盤とし、各アプリを独立した Cloudflare Worker として管理します。

## 開発を始める

必要環境は Bun 1.4.4 と Node.js 26.12.1 です。ルートで `vp install`、続いて `vp run install:apps` を実行します。開発ツール・Site・Platformはそれぞれ独立したロックファイルで依存関係を管理します。開発用環境変数の準備は [`docs/environment.md`](docs/environment.md)、起動・検証・PRの手順は [`docs/development.md`](docs/development.md) を参照してください。

```sh
vp run dev:site
vp run dev:platform
```

## ブランチとリリース

通常の変更は `dev` を base とする GitHub PR で取り込みます。`dev` が統合ブランチです。リリース時は `dev` から `main` へのPRを作成し、release-note checkを含むCIで検証します。`main` へのマージは直ちにデプロイを開始するため、明示的なリリース許可なしにエージェントが `main` をマージまたはpushしてはいけません。

## ドキュメント

- [開発・検証・ブランチ運用](docs/development.md)
- [環境変数と秘密情報](docs/environment.md)
- [アーキテクチャ方針](docs/architecture-plan.md)
