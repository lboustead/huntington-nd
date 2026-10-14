import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const project = process.cwd();
const contactValidation = spawnSync(process.execPath, [join(project, 'scripts', 'contact.test.mjs')], { cwd: project, stdio: 'inherit' });
if (contactValidation.status !== 0) process.exit(contactValidation.status || 1);
const output = join(project, 'dist');
const entries = await readdir(project, { withFileTypes: true });
const publicNames = new Set(['assets', 'robots.txt', 'sitemap.xml', '_headers', '_redirects']);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of entries) {
  if (!publicNames.has(entry.name) && !entry.name.endsWith('.html')) continue;
  await cp(join(project, entry.name), join(output, entry.name), { recursive: true });
}
const contactSource = await readFile(join(project, 'functions', 'api', 'contact.js'), 'utf8');
const workerEntry = `

export default {
  fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    if (pathname === '/api/contact' || pathname === '/api/contact/') {
      return onRequest({ request, env });
    }
    return env.ASSETS.fetch(request);
  }
};
`;
await writeFile(join(output, '_worker.js'), contactSource + workerEntry);
await writeFile(join(output, '_routes.json'), JSON.stringify({ version: 1, include: ['/api/contact', '/api/contact/'], exclude: [] }, null, 2) + '\n');
const validation = spawnSync(process.execPath, [join(project, 'scripts', 'check.mjs')], { cwd: output, stdio: 'inherit' });
if (validation.status !== 0) process.exit(validation.status || 1);
const workerValidation = spawnSync(process.execPath, [join(project, 'scripts', 'worker.test.mjs')], { cwd: project, stdio: 'inherit' });
if (workerValidation.status !== 0) process.exit(workerValidation.status || 1);
console.log('Pages deployment built in dist/, including the contact API in advanced-mode _worker.js. No runtime dependencies.');
