import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';

const root = process.cwd();
const errors = [];
const htmlFiles = (await readdir(root)).filter(name => name.endsWith('.html'));
const idCache = new Map();
const read = name => readFile(join(root, name), 'utf8');
const report = (file, problem) => errors.push(`${file}: ${problem}`);
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match => [match[1].toLowerCase(), match[2] ?? match[3]]));

async function ids(file) {
  if (!idCache.has(file)) {
    const text = await readFile(file, 'utf8');
    idCache.set(file, new Set([...text.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(match => match[1])));
  }
  return idCache.get(file);
}

async function checkReference(file, raw, { anchor = false } = {}) {
  const reference = raw.replaceAll('&amp;', '&').trim();
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) return;
  if (!reference || reference === '#') {
    report(file, `empty link or asset reference: ${JSON.stringify(reference)}`);
    return;
  }
  const [pathAndQuery, fragment] = reference.split('#');
  let pathname;
  try { pathname = decodeURIComponent(pathAndQuery.split('?')[0]); }
  catch { report(file, `malformed URL: ${reference}`); return; }
  let target = pathname.startsWith('/') ? resolve(root, '.' + pathname) : resolve(dirname(join(root, file)), pathname || file);
  if (pathname === '') target = join(root, file);
  if (target !== root && !target.startsWith(root + sep)) {
    report(file, `reference escapes site directory: ${reference}`);
    return;
  }
  try {
    if ((await stat(target)).isDirectory()) target = join(target, 'index.html');
    await stat(target);
    if (anchor && fragment && extname(target) === '.html' && !(await ids(target)).has(decodeURIComponent(fragment))) report(file, `missing anchor: ${reference}`);
  } catch { report(file, `missing local file: ${reference}`); }
}

if (!htmlFiles.includes('index.html')) report('index.html', 'required homepage is missing');
if (!htmlFiles.includes('404.html')) report('404.html', 'required Cloudflare error page is missing');
for (const file of htmlFiles) {
  const text = await read(file);
  if (!/<!doctype html>/i.test(text)) report(file, 'missing HTML doctype');
  if (!/<html\b[^>]*\blang\s*=/i.test(text)) report(file, 'missing document language');
  if (!/<meta\b[^>]*\bname\s*=\s*["']viewport["']/i.test(text)) report(file, 'missing responsive viewport');
  if (!/<title>[^<]+<\/title>/i.test(text)) report(file, 'missing page title');
  if (!/<main\b/i.test(text)) report(file, 'missing main landmark');
  if ((text.match(/<h1\b/gi) || []).length !== 1) report(file, 'page must have one primary heading');
  const pageIds = [...text.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(match => match[1]);
  if (new Set(pageIds).size !== pageIds.length) report(file, 'duplicate element IDs');
  for (const match of text.matchAll(/<(?:a|img|script|link|source|video|iframe)\b[^>]*>/gi)) {
    const tag = match[0];
    const attrs = attributes(tag);
    if (/^<img\b/i.test(tag) && !('alt' in attrs)) report(file, 'image without alt text');
    for (const key of ['src', 'href', 'poster']) if (key in attrs) await checkReference(file, attrs[key], { anchor: key === 'href' });
    if (attrs.srcset) for (const candidate of attrs.srcset.split(',')) await checkReference(file, candidate.trim().split(/\s+/)[0]);
    if (/^<a\b/i.test(tag) && attrs.target === '_blank' && !/(?:^|\s)noopener(?:\s|$)/.test(attrs.rel || '')) report(file, 'new-tab link missing rel="noopener"');
  }
  for (const match of text.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch { report(file, 'invalid structured data JSON'); }
  }
  if (file === 'index.html') {
    if (!/<meta\b[^>]*name\s*=\s*["']description["']/i.test(text)) report(file, 'missing homepage description');
    if (!/<link\b[^>]*rel\s*=\s*["']canonical["']/i.test(text)) report(file, 'missing canonical URL');
  }
}
async function checkCss(directory) {
  for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await checkCss(file);
    else if (entry.name.endsWith('.css')) {
      const text = await read(file);
      for (const match of text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) await checkReference(file, match[1]);
    }
  }
}
await checkCss('assets');
for (const file of ['robots.txt', 'sitemap.xml', '_headers']) {
  try { await stat(join(root, file)); } catch { report(file, 'required deployment file is missing'); }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Validated ${htmlFiles.length} HTML pages, metadata, structured data, and local file/anchor references.`);
