import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import worker from '../dist/_worker.js';

const origin = 'https://huntingtonnd.com';
const noAssets = { ASSETS: { fetch() { throw new Error('Contact API must not delegate to static assets'); } } };
const valid = () => ({ name: 'Packaging test', email: 'test@example.com', interest: 'Something else', message: 'No email should be sent by this test.', website: '', startedAt: Date.now() });
const post = body => new Request(origin + '/api/contact', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('The published Worker artifact owns canonical, trailing-slash, and queried contact routes', async () => {
  for (const path of ['/api/contact', '/api/contact/', '/api/contact?source=footer']) {
    const response = await worker.fetch(new Request(origin + path), noAssets);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('Allow'), 'POST');
    assert.match(response.headers.get('Content-Type'), /^application\/json/);
    assert.equal((await response.json()).ok, false);
  }
});

test('The generated production handler retains origin and field validation', async () => {
  const invalid = await worker.fetch(post({ ...valid(), email: 'invalid' }), noAssets);
  assert.equal(invalid.status, 422);
  assert.equal((await invalid.json()).ok, false);
  const honeypot = await worker.fetch(post({ ...valid(), website: 'https://spam.example' }), noAssets);
  assert.equal(honeypot.status, 422);
  const foreign = post(valid());
  foreign.headers.set('Origin', 'https://other.example');
  assert.equal((await worker.fetch(foreign, noAssets)).status, 403);
});

test('Missing SMTP secret stays an honest503 and production cannot enable the development mock', async () => {
  for (const extra of [{}, { CONTACT_DEV_MOCK: '1' }]) {
    const response = await worker.fetch(post(valid()), { ...noAssets, ...extra });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).ok, false);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  }
});

test('Static assets, redirects, HEAD, and custom404 responses delegate unchanged to native Pages ASSETS', async () => {
  for (const [path, method, status] of [['/', 'GET', 200], ['/assets/styles.css?v=1', 'GET', 200], ['/old-page', 'GET', 301], ['/missing-page', 'GET', 404], ['/', 'HEAD', 200]]) {
    const request = new Request(origin + path, { method });
    const expected = new Response(method === 'HEAD' ? null : 'Native Pages response', { status, headers: { 'X-Native-Headers': 'preserved', 'Cache-Control': 'public, max-age=3600', ...(status === 301 ? { Location: origin + '/' } : {}) } });
    let delegated = 0;
    const response = await worker.fetch(request, { ASSETS: { fetch(received) {
      delegated++;
      assert.equal(received, request);
      return expected;
    } } });
    assert.equal(delegated, 1);
    assert.equal(response, expected);
    assert.equal(response.status, status);
    assert.equal(response.headers.get('X-Native-Headers'), 'preserved');
    assert.equal(response.headers.get('Cache-Control'), 'public, max-age=3600');
    if (method === 'HEAD') assert.equal(response.body, null);
  }
});

test('Only contact routes invoke the Worker and static header/404 files remain intact', async () => {
  const routes = JSON.parse(await readFile(new URL('../dist/_routes.json', import.meta.url), 'utf8'));
  assert.equal(routes.version, 1);
  assert.deepEqual(routes.include, ['/api/contact', '/api/contact/']);
  assert.deepEqual(routes.exclude, []);
  for (const name of ['_headers', '404.html']) {
    assert.deepEqual(await readFile(new URL('../dist/' + name, import.meta.url)), await readFile(new URL('../' + name, import.meta.url)));
  }
});

test('Published output contains no development mock, source tooling, documentation, or environment files', async () => {
  const names = await readdir(new URL('../dist/', import.meta.url));
  for (const name of ['functions', 'scripts', 'README.md', 'CONTACT-SETUP.md', '.env', '.dev.vars']) assert.equal(names.includes(name), false);
  const source = await readFile(new URL('../dist/_worker.js', import.meta.url), 'utf8');
  for (const marker of ['CONTACT_DEV_MOCK', 'contact-smtp-mock', 'local-preview-only', 'local-test-password']) assert.equal(source.includes(marker), false);
  assert.ok(source.includes("import('cloudflare:sockets')"));
});
