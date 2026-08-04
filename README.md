# job-hunt-management

就活管理アプリ

## 開発フロー

### ブランチ運用

作業は必ず GitHub Issue に紐づけ、Issue からブランチを作成する。

```bash
gh issue develop <Issue番号> --checkout
```

ブランチ名は `<type>/<Issue番号>-<内容>` の形式にする。

| type | 用途 |
|---|---|
| `feature/` | 新機能の追加 |
| `fix/` | 不具合の修正 |
| `chore/` | 設定変更・雑務など |

例: `feature/12-user-registration` / `fix/30-login-error` / `chore/46-branch-protection`

### PR・マージ

- `main` への直接 push は禁止（ブランチ保護ルールにより拒否される）
- 変更は必ず Pull Request 経由で `main` にマージする
- CI（Lint / Type Check / Test）の通過を必須とする
- レビュー承認は不要（1人開発のため）
- マージ方式は Squash merge のみ
- マージ後、ブランチは自動的に削除される
