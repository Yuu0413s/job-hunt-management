# job-hunt-management

就活管理アプリ

## セットアップ

`apps/api` は Workers Static Assets で `apps/web` のビルド成果物（`apps/web/dist`）を
配信する構成になっている。そのため `apps/api` で `wrangler dev` / `wrangler deploy` を
実行する前に、必ず一度 `apps/web` をビルドしておく必要がある。

```bash
bun install
bun run build   # apps/web を apps/web/dist にビルド

cd apps/api
bunx wrangler dev
```

`apps/web/dist` が存在しない状態で `wrangler dev` を実行すると、
`assets.directory` が見つからないというエラーで起動に失敗する。

## 開発フロー

### ブランチ運用

作業は必ず GitHub Issue に紐づけ、Issue からブランチを作成する。
ブランチ名は `<type>/<Issue番号>-<内容>` の形式にする。

| type | 用途 |
|---|---|
| `feature/` | 新機能の追加 |
| `fix/` | 不具合の修正 |
| `chore/` | 設定変更・雑務など |

`gh issue develop` は `--name` を指定しないと Issue タイトルから自動生成された
ブランチ名になり、上記の命名規則と一致しない。**必ず `--name` を指定する。**

```bash
gh issue develop <Issue番号> --name <type>/<Issue番号>-<内容> --checkout
```

例:

```bash
gh issue develop 46 --name chore/46-branch-protection --checkout
```

### PR・マージ

- `main` への直接 push は禁止（ブランチ保護ルールにより拒否される）
- 変更は必ず Pull Request 経由で `main` にマージする
- CI（Lint / Type Check / Test）の通過を必須とする
- レビュー承認は不要（1人開発のため）
- マージ方式は Merge commit のみ
- マージ後、ブランチは自動的に削除される

## デプロイ

Cloudflare Workers Builds が GitHub リポジトリと連携しており、以下のタイミングで自動的にビルド・デプロイが実行される。

- `main` への push → 本番環境へデプロイ
- PR の作成・更新 → プレビュー環境へデプロイし、PR にプレビューURLが発行される

### ビルド設定（Cloudflareダッシュボード側）

| 項目 | 値 |
|---|---|
| Root directory | `apps/api` |
| Build command | `bun install && bun run --filter '@job-hunt/web' build` |
| Deploy command | `bunx wrangler deploy` |

Root directory を `apps/api` にすることで、`wrangler` が `apps/api/wrangler.jsonc` を自動的に見つけられるようにしている。
`bun run --filter` はモノレポのどのディレクトリから実行しても workspace root を自動検出するため、
Root directory が `apps/api` でも `apps/web` のビルドが実行できる。

PRのプレビューデプロイでは、Deploy commandの設定に関わらず Cloudflare が内部的に `wrangler versions upload` を実行する
（本番デプロイ時のみカスタムDeploy commandが使われる）。そのため、Root directory を正しく設定し、
どちらのコマンドを実行してもconfigが解決できる状態にしておく必要がある。

### シークレット

本番用の環境変数（`DATABASE_URL` など）は Cloudflareダッシュボードの Worker設定、
または `wrangler secret put <名前>` で登録する。`.env` 等でリポジトリに含めない。
