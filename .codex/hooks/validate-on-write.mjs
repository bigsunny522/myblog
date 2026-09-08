#!/usr/bin/env node
/**
 * PostToolUse hook: Edit/Write で content/posts/**.mdx または content/drafts/**.mdx を
 * 編集した直後に scripts/validate-posts.mjs を単一ファイルモードで走らせ、
 * 検品結果を additionalContext として即フィードバックする。
 *
 * 文章で「ルールを守れ」と書くより機械的に検出する方が確実(Phase 4-4)。
 * ブロッキングはしない(PostToolUseは事後実行のため)。あくまで即時フィードバック。
 */

import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';

function exitSilently() {
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  exitSilently();
}

const toolName = payload.tool_name;
if (toolName !== 'Edit' && toolName !== 'Write') exitSilently();

const filePath = payload.tool_input?.file_path;
if (!filePath) exitSilently();

const cwd = payload.cwd || process.cwd();
const relPath = path.relative(cwd, filePath).replace(/\\/g, '/');

if (!/^content\/(posts|drafts)\/.*\.mdx$/.test(relPath)) exitSilently();

const result = spawnSync('node', ['scripts/validate-posts.mjs', relPath], {
  cwd,
  encoding: 'utf8',
});
const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();

// 問題なし(OK: ... のみ)の場合は何も出力しない
if (!output || (result.status === 0 && !/\[warnings\]|\[errors\]/.test(output))) {
  exitSilently();
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PostToolUse',
    additionalContext: `記事検品(check:posts)の結果、${relPath} に指摘があります:\n\n${output}`,
  },
}));
