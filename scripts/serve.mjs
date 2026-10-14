import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { onRequest as contact } from '../functions/api/contact.js';
import { createSmtpMock } from './contact-smtp-mock.mjs';

const root = resolve(process.cwd(), process.argv[2] || '.');
const port = Number(process.env.PORT || 3000);
const contactMock = process.env.CONTACT_DEV_MOCK === '1';
const contactEnv = Object.fromEntries(['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'CONTACT_FROM_EMAIL', 'CONTACT_TO_EMAIL'].filter(name => process.env[name] !== undefined).map(name => [name, process.env[name]]));
if (contactMock) {
  contactEnv.SMTP_PASSWORD = 'local-preview-only';
}
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/api/contact' || pathname === '/api/contact/') {
      const init = { method: request.method, headers: request.headers };
      if (!['GET', 'HEAD'].includes(request.method)) {
        init.body = Readable.toWeb(request);
        init.duplex = 'half';
      }
      const incoming = new Request(new URL(request.url, `http://${request.headers.host || `127.0.0.1:${port}`}`), init);
      const result = await contact({ request: incoming, env: contactEnv }, contactMock ? { connect: createSmtpMock().connect } : {});
      response.writeHead(result.status, Object.fromEntries(result.headers));
      response.end(request.method === 'HEAD' ? undefined : await result.text());
      return;
    }
    const allowed = pathname === '/' || /^\/[\w-]+\.html$/.test(pathname) || pathname.startsWith('/assets/') || ['/robots.txt', '/sitemap.xml'].includes(pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!allowed || !file.startsWith(root + sep) || !(await stat(file)).isFile()) throw new Error('Not found');
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    const fallback = await readFile(resolve(root, '404.html')).catch(() => Buffer.from('Page not found'));
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(fallback);
  }
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Local preview: http://127.0.0.1:${port}`);
  if (contactMock) console.log('Contact delivery mock enabled for local preview; no email will be sent.');
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
