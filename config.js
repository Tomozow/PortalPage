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

  // カテゴリ（最近更新されたリポジトリがあるカテゴリから順に表示）
  // 各リポジトリの GitHub の Topics に topic の値を付けると、そのカテゴリに入ります。
  // どのカテゴリの topic も付いていないリポジトリは「その他」に入ります
  categories: [
    { name: "配信", topic: "category-streaming" },
    { name: "クリエイティブ", topic: "category-creative" },
    { name: "ユーティリティ", topic: "category-utility" },
    { name: "VR", topic: "category-vr" },
  ],

  // リポジトリごとの上書き設定
  //   description: カードに表示する説明文
  //   url:         「デモを見る」ボタンのリンク先
  //   screenshot:  スクリーンショットの画像（リポジトリ内のパス、または https:// から始まる URL）。
  //                false にすると表示しない。未指定なら docs/screenshot.png などを自動で探す
  //   readme:      README のファイル名（未指定なら README_JP.md → README.ja.md → README.md の順に自動で探す）
  // 説明文が未設定または英語のときは、日本語 README の冒頭の文章を自動で説明文に使います
  overrides: {
    DashTray: { screenshot: "docs/screenshot.png" },
    MangaNameStudio: { screenshot: "docs/screenshots/overview.jpg" },
    virtualkeyboard: { screenshot: "assets/screenshot.png" },
  },
};
