/**
 * content/posts/*.mdx を検品する。
 * - published: false (下書き) の記事は warning のみ(公開時の安全網なので下書き段階の未完成は許容する)
 * - published !== false (公開済み/公開予定) の記事は error として扱い、非ゼロ終了する
 *
 * Usage:
 *   node scripts/validate-posts.mjs                    # content/posts/*.mdx を全件チェック(npm run check:posts)
 *   node scripts/validate-posts.mjs <path/to/file.mdx>  # 指定した1ファイルのみチェック(hookから利用。
 *                                                          content/drafts/ 配下も指定可、常に warning 扱い)
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'content/posts');
const publicDir = path.join(process.cwd(), 'public');
const taxonomyPath = path.join(process.cwd(), 'content/data/taxonomy.json');

const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
const validCategories = new Set(taxonomy.categories);
const validTags = new Set(taxonomy.tags);

function report(list, file, message) {
  list.push(`${file}: ${message}`);
}

function isExternalUrl(src) {
  return /^https?:\/\//.test(src);
}

function resolvePublicPath(src) {
  return path.join(publicDir, src.replace(/^\//, ''));
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function checkImageExists(list, file, src, label) {
  if (!src || isExternalUrl(src)) return;
  const fullPath = resolvePublicPath(src);
  if (!fs.existsSync(fullPath)) {
    report(list, file, `${label} のファイルが存在しません: ${src}`);
    return;
  }
  const ext = path.extname(fullPath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return; // 動画(mp4等)は WEBP 最適化の対象外

  const dir = path.dirname(fullPath);
  const base = path.basename(fullPath, path.extname(fullPath));
  const cacheDir = path.join(dir, 'nextImageExportOptimizer');
  const hasCache = fs.existsSync(cacheDir) &&
    fs.readdirSync(cacheDir).some((f) => f.startsWith(`${base}-opt-`));
  if (!hasCache) {
    report(list, file, `${label} の WEBP キャッシュが見当たりません(npm run build を実行してコミットしてください): ${src}`);
  }
}

function extractImageRefs(content) {
  const refs = [];
  for (const m of content.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) refs.push(m[1]);
  for (const m of content.matchAll(/\bsrc="([^"]+)"/g)) refs.push(m[1]);
  return refs;
}

function lintBoldBrackets(content) {
  // CommonMark の強調記号ルール上、閉じ側の ** が「」』）) などの閉じ括弧に直接隣接し、
  // 直後が空白・句読点でもない通常の文字だと ** がそのまま表示されてしまう。CLAUDE.md 参照。
  const pattern = /[」』）)]\*\*[^\s、。,.!?！？：；・…～〜」』）)\n]/g;
  const hits = [];
  let m;
  while ((m = pattern.exec(content)) !== null) {
    const snippetStart = Math.max(0, m.index - 15);
    const snippet = content.slice(snippetStart, m.index + 15).replace(/\n/g, ' ');
    hits.push(snippet);
  }
  return hits;
}

// 1ファイル分の検証を行い、errors/warnings リストに追記する。
// forceDraft: true の場合、published の値によらず warning 扱いにする(content/drafts/ 配下用)
function validatePost(fullPath, label, forceDraft, errors, warnings) {
  const slug = path.basename(fullPath, '.mdx');
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);
  const isDraft = forceDraft || data.published === false;
  const list = isDraft ? warnings : errors;

  if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
    report(errors, label, `スラッグに英数字・ハイフン以外の文字が含まれています: ${slug}`);
  }

  if (!data.title) report(list, label, 'title が未設定です');
  if (!data.excerpt) report(list, label, 'excerpt が未設定です');
  if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    report(list, label, `date が YYYY-MM-DD 形式ではありません: "${data.date ?? ''}"`);
  }
  if (!data.category) report(list, label, 'category が未設定です');
  if (!data.coverImage) report(list, label, 'coverImage が未設定です');

  if (data.category && !validCategories.has(data.category)) {
    report(list, label, `category "${data.category}" が content/data/taxonomy.json に存在しません`);
  }
  for (const tag of data.tags || []) {
    if (tag && !validTags.has(tag)) {
      report(list, label, `tag "${tag}" が content/data/taxonomy.json に存在しません`);
    }
  }

  if (data.coverImage) checkImageExists(list, label, data.coverImage, 'coverImage');
  for (const src of extractImageRefs(content)) {
    checkImageExists(list, label, src, '本文中');
  }

  for (const snippet of lintBoldBrackets(content)) {
    report(list, label, `太字閉じタグが閉じ括弧に隣接し無効化されている可能性があります: "...${snippet}..."`);
  }
}

const errors = [];
const warnings = [];
const singleFileArg = process.argv[2];

if (singleFileArg) {
  // hookなどからの単一ファイルチェック。content/drafts/ 配下は常に warning 扱い。
  const fullPath = path.isAbsolute(singleFileArg) ? singleFileArg : path.join(process.cwd(), singleFileArg);
  if (!fs.existsSync(fullPath)) {
    console.error(`ファイルが見つかりません: ${singleFileArg}`);
    process.exit(1);
  }
  const normalized = fullPath.replace(/\\/g, '/');
  const forceDraft = normalized.includes('/content/drafts/');
  validatePost(fullPath, singleFileArg, forceDraft, errors, warnings);
} else {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));
  for (const file of files) {
    validatePost(path.join(postsDir, file), file, false, errors, warnings);
  }
}

if (warnings.length > 0) {
  console.warn(`\n[warnings] 下書き記事 (published: false) の検出事項 (${warnings.length}件、非公開のためビルドは通ります):`);
  for (const w of warnings) console.warn(`  - ${w}`);
}

if (errors.length > 0) {
  console.error(`\n[errors] 検証エラー (${errors.length}件):`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\ncheck:posts failed: ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}

if (!singleFileArg) {
  const total = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx')).length;
  console.log(`check:posts passed: ${total} posts checked, ${warnings.length} warning(s)`);
} else if (warnings.length === 0) {
  console.log(`OK: ${singleFileArg}`);
}
