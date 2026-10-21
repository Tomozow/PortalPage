# PortalPage

GitHub で公開している制作物（リポジトリ）を一覧できるポータルページです。
GitHub API から公開リポジトリを自動取得して表示するため、新しいリポジトリを作るとページにも自動で反映されます。

## 機能

- 公開リポジトリをカード形式で一覧表示（説明・トピック・言語・スター数・更新日）
- `homepage` が設定されている、または GitHub Pages が有効なリポジトリには「デモを見る」ボタンを表示
- キーワード検索、言語による絞り込み、並び替え（更新日・作成日・スター数・名前）
- おすすめリポジトリの固定表示
- ダークモード / スマートフォン表示に対応
- API 結果を 10 分間ブラウザにキャッシュ（API の利用上限対策）

## 設定

`config.js` を編集します。

| 項目 | 内容 |
| --- | --- |
| `username` | GitHub のユーザー名 |
| `displayName` / `tagline` | ページ上部の名前と紹介文 |
| `exclude` | 一覧から外すリポジトリ名 |
| `featured` | 「おすすめ」として先頭に固定表示するリポジトリ名 |
| `showForks` / `showArchived` | フォーク / アーカイブ済みリポジトリを表示するか |
| `overrides` | リポジトリごとの説明文・デモ URL・スクリーンショット・日本語 README の設定 |

### スクリーンショット

リポジトリに次のいずれかのファイルがあると、カードの上部に自動で表示されます（上から順に探します）。クリックすると拡大表示します。

- `docs/screenshot.png`
- `screenshot.png`
- `docs/screenshot.jpg`
- `screenshots/screenshot.png`
- `docs/demo.gif`

別の画像を使いたいときは `overrides` の `screenshot` にパスを書きます。

### 説明文

GitHub の説明文（About 欄）が空または英語のときは、README を `README_JP.md` → `README.ja.md` → `README_ja.md` → `README.md` の順に探し、日本語 README の冒頭の文章を説明文として表示します。

各リポジトリの説明文やトピック、デモ URL は GitHub のリポジトリ設定（About 欄）で設定すると、そのままページに反映されます。

## 公開方法（GitHub Pages）

1. このリポジトリの **Settings → Pages** を開く
2. **Source** を「Deploy from a branch」にし、公開したいブランチと `/ (root)` を選んで保存
3. 数分後に `https://<ユーザー名>.github.io/PortalPage/` で閲覧できます

## ローカルで確認

```sh
python3 -m http.server 8000
# http://localhost:8000 を開く
```
