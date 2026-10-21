// 各公開リポジトリの最新リリース（ファイル付き）を調べて data/releases.json に書き出す。
// GitHub Actions（.github/workflows/update-releases.yml）から定期的に実行される。
// 使い方: GITHUB_TOKEN=... OWNER=Tomozow node scripts/update-releases.mjs [リポジトリ名 ...]
import { mkdir, readFile, writeFile } from "node:fs/promises";

const owner = process.env.OWNER;
const token = process.env.GITHUB_TOKEN;
const out = new URL("../data/releases.json", import.meta.url);

async function api(path) {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

async function repoNames() {
  if (process.argv.length > 2) return process.argv.slice(2);
  const names = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await api(`users/${owner}/repos?per_page=100&page=${page}`);
    names.push(...batch.filter((r) => !r.fork && !r.private).map((r) => r.name));
    if (batch.length < 100) break;
  }
  return names;
}

// 下書きを除き、ファイル付きのリリースのうち正式版を優先して最新のものを選ぶ
function pickRelease(releases) {
  const withAssets = releases.filter((r) => !r.draft && r.assets.length > 0);
  return withAssets.find((r) => !r.prerelease) || withAssets[0];
}

const result = {};
for (const name of (await repoNames()).sort()) {
  const release = pickRelease(await api(`repos/${owner}/${name}/releases?per_page=20`));
  if (!release) continue;
  result[name] = {
    tag: release.tag_name,
    url: release.html_url,
    publishedAt: release.published_at,
    assets: release.assets.map((a) => ({ name: a.name, url: a.browser_download_url, size: a.size })),
  };
}

const json = `${JSON.stringify(result, null, 2)}\n`;
const previous = await readFile(out, "utf8").catch(() => "");
if (json !== previous) {
  await mkdir(new URL(".", out), { recursive: true });
  await writeFile(out, json);
  console.log(`updated: ${Object.keys(result).join(", ") || "(none)"}`);
} else {
  console.log("no changes");
}
