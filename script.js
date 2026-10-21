(function () {
  const cfg = Object.assign(
    { exclude: [], featured: [], showForks: false, showArchived: true, overrides: {} },
    window.PORTAL_CONFIG || {}
  );
  const API = "https://api.github.com";
  const CACHE_KEY = `portal-cache:${cfg.username}`;
  const CACHE_TTL = 10 * 60 * 1000;

  const LANG_COLORS = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", HTML: "#e34c26",
    CSS: "#663399", Java: "#b07219", "C#": "#178600", "C++": "#f34b7d", C: "#555555",
    Go: "#00ADD8", Rust: "#dea584", Ruby: "#701516", PHP: "#4F5D95", Swift: "#F05138",
    Kotlin: "#A97BFF", Dart: "#00B4AB", Shell: "#89e051", Vue: "#41b883",
    "Jupyter Notebook": "#DA5B0B", Svelte: "#ff3e00", Lua: "#000080", GDScript: "#355570",
  };

  // スクリーンショットを自動で探すときの候補パス（上から順に試す）
  const SCREENSHOT_CANDIDATES = cfg.screenshotCandidates || [
    "docs/screenshot.png", "screenshot.png", "docs/screenshot.jpg", "screenshots/screenshot.png", "docs/demo.gif",
  ];

  // README を探すときの候補（日本語版を優先）
  const README_CANDIDATES = ["README_JP.md", "README.ja.md", "README_ja.md", "README.md"];
  const JA_PATTERN = /[\u3040-\u30ff]/g;

  const $ = (id) => document.getElementById(id);
  const state = { repos: [], query: "", language: "", sort: "updated" };

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  function safeUrl(u) {
    try {
      const url = new URL(u);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  }

  function readCache() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (c && Date.now() - c.time < CACHE_TTL) return c.data;
    } catch {}
    return null;
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }));
    } catch {}
  }

  async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) {
      const err = new Error(`GitHub API error: ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  async function load() {
    const cached = readCache();
    if (cached) return cached;

    const user = await fetchJson(`${API}/users/${encodeURIComponent(cfg.username)}`);
    const repos = [];
    for (let page = 1; page <= 10; page++) {
      const batch = await fetchJson(
        `${API}/users/${encodeURIComponent(cfg.username)}/repos?per_page=100&page=${page}&sort=updated`
      );
      repos.push(...batch);
      if (batch.length < 100) break;
    }
    const data = { user, repos };
    writeCache(data);
    return data;
  }

  function pagesUrl(repo) {
    if (!repo.has_pages) return "";
    const owner = repo.owner.login.toLowerCase();
    if (repo.name.toLowerCase() === `${owner}.github.io`) return `https://${owner}.github.io/`;
    return `https://${owner}.github.io/${repo.name}/`;
  }

  function rawUrl(repo, path) {
    const branch = encodeURIComponent(repo.default_branch || "main");
    const file = path.split("/").map(encodeURIComponent).join("/");
    return `https://raw.githubusercontent.com/${repo.full_name}/${branch}/${file}`;
  }

  function screenshotUrls(repo, o) {
    if (o.screenshot === false) return [];
    if (o.screenshot) return [safeUrl(o.screenshot) || rawUrl(repo, o.screenshot)];
    return SCREENSHOT_CANDIDATES.map((p) => rawUrl(repo, p));
  }

  function normalize(repo) {
    const o = cfg.overrides[repo.name] || {};
    return {
      name: repo.name,
      description: o.description ?? repo.description ?? "",
      hasCustomDescription: o.description != null,
      htmlUrl: repo.html_url,
      readmeUrls: (o.readme ? [o.readme] : README_CANDIDATES).map((path) => rawUrl(repo, path)),
      screenshots: screenshotUrls(repo, o),
      demoUrl: safeUrl(o.url ?? repo.homepage ?? "") || pagesUrl(repo),
      language: repo.language || "",
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      fork: repo.fork,
      archived: repo.archived,
      updated: new Date(repo.pushed_at || repo.updated_at),
      created: new Date(repo.created_at),
    };
  }

  function formatDate(d) {
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
  }

  function card(r) {
    const color = LANG_COLORS[r.language] || "#8b949e";
    const badges = [
      r.fork ? '<span class="badge">Fork</span>' : "",
      r.archived ? '<span class="badge">Archived</span>' : "",
    ].join("");
    const topics = r.topics.length
      ? `<div class="topics">${r.topics.map((t) => `<span class="topic">${escapeHtml(t)}</span>`).join("")}</div>`
      : "";
    const lang = r.language
      ? `<span><span class="lang-dot" style="background:${color}"></span>${escapeHtml(r.language)}</span>`
      : "";
    const demo = r.demoUrl
      ? `<a class="btn primary" href="${escapeHtml(r.demoUrl)}" target="_blank" rel="noopener">デモを見る</a>`
      : "";
    const shot = r.screenshots.length
      ? `<button type="button" class="shot" hidden aria-label="${escapeHtml(r.name)} のスクリーンショットを拡大">
           <img alt="${escapeHtml(r.name)} のスクリーンショット" data-candidates="${escapeHtml(JSON.stringify(r.screenshots))}">
         </button>`
      : "";
    return `
      <article class="card">
        ${shot}
        <h3><a href="${escapeHtml(r.htmlUrl)}" target="_blank" rel="noopener">${escapeHtml(r.name)}</a>${badges}</h3>
        <p class="desc${r.description ? "" : " empty"}">${escapeHtml(r.description || "説明はまだありません")}</p>
        ${topics}
        <div class="meta">
          ${lang}
          <span>★ ${r.stars}</span>
          <span>更新: ${formatDate(r.updated)}</span>
        </div>
        <div class="actions">
          ${demo}
          <a class="btn" href="${escapeHtml(r.htmlUrl)}" target="_blank" rel="noopener">ソースコード</a>
        </div>
      </article>`;
  }

  const sorters = {
    updated: (a, b) => b.updated - a.updated,
    created: (a, b) => b.created - a.created,
    stars: (a, b) => b.stars - a.stars || b.updated - a.updated,
    name: (a, b) => a.name.localeCompare(b.name),
  };

  function render() {
    const q = state.query.trim().toLowerCase();
    const matches = (r) =>
      (!state.language || r.language === state.language) &&
      (!q || [r.name, r.description, ...r.topics].some((s) => s.toLowerCase().includes(q)));

    const featuredNames = cfg.featured.map((n) => n.toLowerCase());
    const featured = featuredNames
      .map((n) => state.repos.find((r) => r.name.toLowerCase() === n))
      .filter((r) => r && matches(r));
    const rest = state.repos
      .filter((r) => !featuredNames.includes(r.name.toLowerCase()) && matches(r))
      .sort(sorters[state.sort]);

    $("featured-section").hidden = featured.length === 0;
    $("featured").innerHTML = featured.map(card).join("");
    $("projects").innerHTML = rest.map(card).join("");
    loadScreenshots();
    $("all-heading").textContent = `すべての制作物 (${rest.length})`;
    $("status").textContent =
      featured.length + rest.length === 0 ? "条件に一致する制作物はありません。" : "";
  }

  // 候補の画像を順に読み込み、見つかったものだけ表示する
  function loadScreenshots() {
    document.querySelectorAll(".shot img[data-candidates]").forEach((img) => {
      const candidates = JSON.parse(img.dataset.candidates);
      img.removeAttribute("data-candidates");
      let i = 0;
      img.onerror = () => {
        i += 1;
        if (i < candidates.length) img.src = candidates[i];
      };
      img.onload = () => { img.parentElement.hidden = false; };
      img.src = candidates[0];
    });
  }

  function setupLightbox() {
    const box = $("lightbox");
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".shot");
      if (!btn) return;
      const img = btn.querySelector("img");
      $("lightbox-img").src = img.currentSrc || img.src;
      $("lightbox-img").alt = img.alt;
      box.showModal();
    });
    box.addEventListener("click", () => box.close());
  }

  function setupControls() {
    const langs = [...new Set(state.repos.map((r) => r.language).filter(Boolean))].sort();
    $("language").insertAdjacentHTML(
      "beforeend",
      langs.map((l) => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("")
    );
    $("search").addEventListener("input", (e) => { state.query = e.target.value; render(); });
    $("language").addEventListener("change", (e) => { state.language = e.target.value; render(); });
    $("sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  }

  function renderHeader(user) {
    const name = cfg.displayName || user?.name || cfg.username;
    document.title = `${name} | Portfolio`;
    $("name").textContent = name;
    $("tagline").textContent = cfg.tagline || user?.bio || "";
    $("profile-link").href = `https://github.com/${encodeURIComponent(cfg.username)}`;
    if (user?.avatar_url) {
      $("avatar").src = user.avatar_url;
      $("avatar").hidden = false;
    }
  }

  function isJapanese(text) {
    return (text.match(JA_PATTERN) || []).length >= 10;
  }

  // README の最初の文章の段落を、カード用の短い説明文として取り出す
  function readmeExcerpt(md) {
    const blocks = md
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .split(/\n\s*\n/);
    for (const block of blocks) {
      const text = block
        .split("\n")
        .filter((l) => !/^\s*(#|\||>|[-*+] |\d+\. |<|!\[|\[!\[|---)/.test(l))
        .join(" ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/[*_`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      // 「English | 日本語」のような言語切り替えリンクだけの行は飛ばす
      if (text.length >= 15 && !/^(English|日本語)\b.{0,20}$/.test(text)) {
        return text.length > 140 ? `${text.slice(0, 140)}…` : text;
      }
    }
    return "";
  }

  async function fetchText(url) {
    try {
      const res = await fetch(url);
      return res.ok ? await res.text() : null;
    } catch {
      return null;
    }
  }

  // 説明文が空または英語なら、日本語 README の冒頭の文章を説明文にする
  async function loadReadme(r) {
    if (r.hasCustomDescription || /[\u3040-\u30ff\u4e00-\u9fff]/.test(r.description)) return;
    for (const url of r.readmeUrls) {
      const md = await fetchText(url);
      if (md == null) continue;
      if (isJapanese(md)) r.description = readmeExcerpt(md) || r.description;
      return;
    }
  }

  async function main() {
    renderHeader(null);
    setupLightbox();
    try {
      const { user, repos } = await load();
      renderHeader(user);
      const exclude = cfg.exclude.map((n) => n.toLowerCase());
      state.repos = repos
        .filter((r) => !exclude.includes(r.name.toLowerCase()))
        .filter((r) => cfg.showForks || !r.fork)
        .filter((r) => cfg.showArchived || !r.archived)
        .map(normalize);
      await Promise.all(state.repos.map(loadReadme));
      setupControls();
      render();
    } catch (e) {
      $("status").textContent =
        e.status === 403
          ? "GitHub API の利用上限に達しました。しばらくしてから再読み込みしてください。"
          : e.status === 404
            ? `ユーザー「${cfg.username}」が見つかりません。config.js を確認してください。`
            : "制作物の読み込みに失敗しました。";
      console.error(e);
    }
  }

  main();
})();
