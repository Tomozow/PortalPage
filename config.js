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

  // リポジトリごとの上書き設定
  //   description: カードに表示する説明文
  //   url:         「デモを見る」ボタンのリンク先
  //   screenshot:  スクリーンショットの画像（リポジトリ内のパス、または https:// から始まる URL）。
  //                false にすると表示しない。未指定なら docs/screenshot.png などを自動で探す
  //   readmeJp:    true で README_JP.md への「日本語の説明」ボタンを表示（別ファイル名なら文字列で指定）
  overrides: {
    DashTray: { screenshot: "docs/screenshot.png" },
    MultiPlatformLiveWatcher: {
      description: "Twitch・YouTube・TwitCasting の配信状況をまとめて確認できる Chrome 拡張機能",
      readmeJp: true,
    },
  },
};
