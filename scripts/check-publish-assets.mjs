// Validate the staged snapshot, not untracked files that only exist locally.
// Run after git add and before committing/publishing.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const tracked = execFileSync('git', ['ls-files', '-z'], {encoding: 'utf8'}).split('\0').filter(Boolean);
const files = new Set(tracked);
const origin = 'https://realmake-okegawa.github.io';
const failures = [];
let checked = 0;
// takeoff.html is an internal, non-sitemap tool using intentionally private configuration.
const sources = tracked.filter(file => /\.(?:html|css)$/.test(file) && file !== 'takeoff.html'
  && !/^(?:design-proposals|node_modules|index_files|_[^/]+)\//.test(file));
const batch = execFileSync('git', ['cat-file', '--batch'], {
  input: sources.map(file => `:${file}`).join('\n') + '\n', maxBuffer: 64 * 1024 * 1024,
});
let offset = 0;
for (const file of sources) {
  const end = batch.indexOf(10, offset);
  const header = batch.subarray(offset, end).toString('utf8');
  const size = Number(header.split(' ')[2]);
  if (!Number.isFinite(size)) throw new Error(`Cannot read staged file: ${file}`);
  offset = end + 1;
  const content = batch.subarray(offset, offset + size).toString('utf8');
  offset += size + 1;
  const refs = [
    ...content.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi),
    ...content.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi),
    ...content.matchAll(/<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/gi),
  ].map(match => match[1]);
  for (const raw of new Set(refs)) {
    if (raw.includes('${') || /^(?:data:|blob:)/.test(raw)) continue;
    let url;
    try { url = new URL(raw.replaceAll('&amp;', '&'), `${origin}/realmake6/${file}`); } catch { continue; }
    if (url.origin !== origin || !/\.(?:jpe?g|png|webp|gif|svg|ico|css|js|woff2?|ttf|mp4)(?:$)/i.test(url.pathname)) continue;
    checked++;
    const target = decodeURIComponent(url.pathname).replace(/^\/realmake6\//, '').replace(/^\//, '');
    if (!files.has(path.posix.normalize(target))) failures.push(`${file}: ${raw} — 公開対象に含まれていません`);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`公開用の参照 ${checked} 本中、${failures.length} 件の問題があります。`);
  process.exitCode = 1;
} else {
  console.log(`公開用の参照 ${checked} 本すべてがGitの公開対象に含まれています。`);
}
