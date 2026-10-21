// ポータルページの設定。ここを編集するだけで表示内容を調整できます。
window.PORTAL_CONFIG = {
  // GitHub のユーザー名
  username: "tomozow",

  // ページ上部に表示する名前と紹介文
  displayName: "tomozow",
  tagline: "GitHub で公開している制作物のまとめ",

  // 一覧から除外するリポジトリ名
  exclude: ["PortalPage"],

  // 先頭に「おすすめ」として固定表示するリポジトリ名（順番どおりに表示）
  featured: [],

  // フォークしたリポジトリを表示するか
  showForks: false,

  // アーカイブ済みリポジトリを表示するか
  showArchived: true,

  // リポジトリごとに説明文やリンクを上書きしたい場合に使用
  // 例: "my-app": { description: "日本語の説明", url: "https://example.com" }
  overrides: {},
};
