/**
 * 元画像の圧縮スクリプト
 *
 * カメラ直出しの巨大なJPG(7〜10MB)をコミットするとリポジトリが肥大化し、
 * CI(Cloudflare Pages)のビルドも遅くなるため、コミット前にこのスクリプトで圧縮する。
 *
 * 使い方:
 *   npm run optimize:images -- posts/<slug>     # public/images/posts/<slug>/ を圧縮
 *   npm run optimize:images -- Gear slideshow   # 複数ディレクトリ指定も可
 *
 * 処理内容:
 *   - 長辺が 2560px を超える画像は 2560px に縮小(EXIF回転は適用してから)
 *   - JPG は quality 82 (mozjpeg)、PNG は compressionLevel 9 で再圧縮
 *   - 縮小不要かつ 1MB 未満のファイルはスキップ
 *   - nextImageExportOptimizer/ ディレクトリと WEBP・動画・SVG・GIF はスキップ
 *   - 元ファイルを上書きするため、圧縮後は `npm run build:images` で WEBP キャッシュを再生成すること
 */

import { readdirSync, statSync, renameSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import sharp from 'sharp';

const MAX_DIMENSION = 2560;
const SKIP_UNDER_BYTES = 1024 * 1024; // 1MB
const JPEG_QUALITY = 82;

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('使い方: npm run optimize:images -- <public/images からの相対パス> [...]');
  console.error('例:     npm run optimize:images -- posts/my-article');
  process.exit(1);
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'nextImageExportOptimizer') continue;
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

let processed = 0;
let skipped = 0;
let savedBytes = 0;

for (const relDir of args) {
  const dir = join('public/images', relDir);
  let files;
  try {
    files = [...walk(dir)];
  } catch {
    console.error(`ディレクトリが見つかりません: ${dir}`);
    process.exitCode = 1;
    continue;
  }

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      skipped++;
      continue;
    }

    const before = statSync(file).size;
    const meta = await sharp(file).metadata();
    const longSide = Math.max(meta.width ?? 0, meta.height ?? 0);

    if (longSide <= MAX_DIMENSION && before < SKIP_UNDER_BYTES) {
      skipped++;
      continue;
    }

    // .rotate() で EXIF の回転を実画素に適用してから縮小する
    let pipeline = sharp(file).rotate();
    if (longSide > MAX_DIMENSION) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true });
    }
    pipeline =
      ext === '.png'
        ? pipeline.png({ compressionLevel: 9 })
        : pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

    const tmp = `${file}.tmp${ext}`;
    await pipeline.toFile(tmp);

    const after = statSync(tmp).size;
    if (after < before) {
      renameSync(tmp, file);
      savedBytes += before - after;
      processed++;
      console.log(`${file}: ${(before / 1024 / 1024).toFixed(1)}MB → ${(after / 1024 / 1024).toFixed(1)}MB`);
    } else {
      unlinkSync(tmp);
      skipped++;
    }
  }
}

console.log(`\n完了: ${processed} 件圧縮 / ${skipped} 件スキップ / 合計 ${(savedBytes / 1024 / 1024).toFixed(1)}MB 削減`);
