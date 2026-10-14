import assert from 'node:assert/strict';
import { test } from 'node:test';
import { onRequest } from '../functions/api/contact.js';
import { createSmtpMock } from './contact-smtp-mock.mjs';

const origin = 'https://huntingtonnd.com';
const recipient = 'builders@huntingtonnd.com';
const mailbox = 'noreply@huntingtonnd.com';
const configured = { SMTP_PASSWORD: 'local-test-password' };
const valid = () => ({ name: 'Test Visitor', email: 'visitor@example.com', phone: '', interest: 'Buying a home', message: 'Please contact me about next steps.', website: '', startedAt: Date.now() });

function request(body = valid(), { method = 'POST', headers = {}, raw } = {}) {
  return new Request(origin + '/api/contact', {
    method,
    headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json', ...headers },
    ...(method === 'GET' || method === 'HEAD' ? {} : { body: raw ?? JSON.stringify(body) })
  });
}

async function rejected(incoming, status, env = configured) {
  const smtp = createSmtpMock();
  const result = await onRequest({ request: incoming, env }, { connect: smtp.connect });
  assert.equal(result.status, status);
  assert.equal((await result.json()).ok, false);
  assert.equal(smtp.connections.length, 0);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
  assert.equal(result.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), null);
}

async function submit(smtp = createSmtpMock(), env = configured, body = valid(), options = {}) {
  return onRequest({ request: request(body), env }, { connect: smtp.connect, ...options });
}

const messageId = message => /^Message-ID: (.+)$/m.exec(message)[1].trim();

test('Only POST is accepted, with a useful Allow response', async () => {
  for (const method of ['GET', 'HEAD', 'OPTIONS', 'PUT']) {
    const result = await onRequest({ request: request(undefined, { method }), env: configured });
    assert.equal(result.status, 405);
    assert.equal(result.headers.get('Allow'), 'POST');
  }
});

test('Missing, cross-origin, and cross-site origins never open a socket', async () => {
  await rejected(request(undefined, { headers: { Origin: 'https://another.example' } }), 403);
  const withoutOrigin = request();
  withoutOrigin.headers.delete('Origin');
  await rejected(withoutOrigin, 403);
  await rejected(request(undefined, { headers: { 'Sec-Fetch-Site': 'cross-site' } }), 403);
});

test('Wrong content type and malformed JSON are rejected before delivery', async () => {
  await rejected(request(undefined, { headers: { 'Content-Type': 'text/plain' } }), 415);
  await rejected(request(undefined, { raw: '{invalid' }), 400);
  await rejected(request(null), 422);
  await rejected(request([]), 422);
});

test('Declared and actual oversized UTF-8 bodies are rejected', async () => {
  await rejected(request(undefined, { headers: { 'Content-Length': '16001' } }), 413);
  await rejected(request(undefined, { raw: JSON.stringify({ message: '😀'.repeat(5000) }) }), 413);
});

test('Required fields, field types, lengths, and email header injection are rejected', async () => {
  for (const field of ['name', 'email', 'interest', 'message']) {
    await rejected(request({ ...valid(), [field]: '  ' }), 422);
    await rejected(request({ ...valid(), [field]: { value: 'unexpected' } }), 422);
  }
  for (const [field, maximum] of [['name', 120], ['email', 160], ['phone', 40], ['interest', 80], ['message', 3000]]) {
    await rejected(request({ ...valid(), [field]: 'x'.repeat(maximum + 1) }), 422);
  }
  for (const email of ['invalid-address', 'visitor@example.com\r\nBcc: other@example.com', 'first@example.com,second@example.com']) {
    await rejected(request({ ...valid(), email }), 422);
  }
  await rejected(request({ ...valid(), interest: 'Buying\na home' }), 422);
});

test('Honeypot and invalid retry identifiers do not send', async () => {
  await rejected(request({ ...valid(), website: 'https://spam.example' }), 422);
  for (const startedAt of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, null, String(Date.now())]) {
    await rejected(request({ ...valid(), startedAt }), 422);
  }
});

test('Fresh, fast-clock, and long-open forms are accepted', async () => {
  for (const startedAt of [Date.now(), Date.now() + 43_200_000, Date.now() - 604_800_000]) {
    const smtp = createSmtpMock();
    const response = await submit(smtp, configured, { ...valid(), startedAt });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(smtp.transactions.length, 1);
  }
});

test('Missing SMTP config and disallowed ports are honest503 without opening a socket', async () => {
  for (const env of [
    {}, { SMTP_PASSWORD: '' }, { SMTP_PASSWORD: '   ' }, { CONTACT_DEV_MOCK: '1' },
    { ...configured, SMTP_PORT: '25' }, { ...configured, SMTP_PORT: '80' },
    { ...configured, SMTP_HOST: 'smtp.gmail.com\r\nother' },
    { ...configured, SMTP_USERNAME: 'bad-address' },
    { ...configured, CONTACT_FROM_EMAIL: 'bad-address' },
    { ...configured, CONTACT_TO_EMAIL: 'bad-address' }
  ]) await rejected(request(), 503, env);
});

test('465 authenticates only over TLS and sends safe UTF-8 MIME to the fixed recipient', async () => {
  const smtp = createSmtpMock();
  const body = { ...valid(), name: '  Test Visitor  ', interest: 'A home 🏡 with more room', message: 'Hello 🏡\r\n.\r\nPlease call me.', to: 'attacker@example.com', from: 'attacker@example.com' };
  const response = await submit(smtp, configured, body);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.deepEqual(smtp.connections, [{ address: { hostname: 'smtp.gmail.com', port: 465 }, options: { secureTransport: 'on' } }]);
  assert.equal(smtp.upgrades.length, 0);
  assert.ok(smtp.commands.filter(item => item.line.startsWith('AUTH')).every(item => item.secure));
  const auth = smtp.commands.find(item => item.line.startsWith('AUTH PLAIN '));
  assert.equal(Buffer.from(auth.line.slice(11), 'base64').toString(), `\0${mailbox}\0local-test-password`);
  assert.equal(smtp.transactions.length, 1);
  const transaction = smtp.transactions[0];
  assert.equal(transaction.from, `<${mailbox}>`);
  assert.equal(transaction.to, `<${recipient}>`);
  assert.equal(transaction.secure, true);
  const [headers, content] = transaction.mime.split('\r\n\r\n');
  assert.ok(headers.includes(`To: ${recipient}\r\n`));
  assert.ok(headers.includes(`Reply-To: ${body.email}\r\n`));
  assert.match(headers, /Content-Transfer-Encoding: base64$/);
  assert.ok(content.trim().split('\r\n').every(line => line.length <= 76));
  const text = Buffer.from(content.replaceAll('\r\n', ''), 'base64').toString('utf8');
  assert.match(text, /Name: Test Visitor\n/);
  assert.ok(text.endsWith(body.message));
  assert.equal(transaction.mime.includes('\r\n.\r\n'), false);
  const encoded = [...headers.matchAll(/=\?UTF-8\?B\?([^?]+)\?=/g)].map(match => Buffer.from(match[1], 'base64').toString('utf8')).join('');
  assert.ok(encoded.endsWith(body.interest));
  assert.equal(encoded.includes('\uFFFD'), false);
});

test('587 requires STARTTLS, releases old streams, re-EHLOs, then authenticates securely', async () => {
  const smtp = createSmtpMock();
  const response = await submit(smtp, { ...configured, SMTP_PORT: '587' });
  assert.equal(response.status, 200);
  assert.equal(smtp.connections[0].options.secureTransport, 'starttls');
  assert.deepEqual(smtp.upgrades, [{ readableLocked: false, writableLocked: false }]);
  const hello = smtp.commands.filter(item => item.line.startsWith('EHLO '));
  assert.equal(hello.length, 2);
  assert.equal(hello[0].secure, false);
  assert.equal(hello[1].secure, true);
  assert.ok(smtp.commands.filter(item => item.line.startsWith('AUTH')).every(item => item.secure));
});

test('Absent or rejected STARTTLS never sends credentials or data', async () => {
  for (const settings of [{ starttls: false }, { reject: { starttls: 454 } }]) {
    const smtp = createSmtpMock(settings);
    const response = await submit(smtp, { ...configured, SMTP_PORT: '587' });
    assert.equal(response.status, 503);
    assert.equal(smtp.upgrades.length, 0);
    assert.equal(smtp.commands.some(item => item.line.startsWith('AUTH')), false);
    assert.equal(smtp.transactions.length, 0);
  }
});

test('TLS connection failures stop before authentication', async () => {
  for (const port of ['465', '587']) {
    const smtp = createSmtpMock({ failTls: true });
    const response = await submit(smtp, { ...configured, SMTP_PORT: port });
    assert.equal(response.status, 503);
    assert.equal(smtp.commands.some(item => item.line.startsWith('AUTH')), false);
  }
});

test('AUTH LOGIN works when advertised and PLAIN challenge replies are consumed', async () => {
  const login = createSmtpMock({ auth: ['LOGIN'] });
  assert.equal((await submit(login)).status, 200);
  const loginCommand = login.commands.findIndex(item => item.line === 'AUTH LOGIN');
  assert.equal(Buffer.from(login.commands[loginCommand + 1].line, 'base64').toString(), mailbox);
  assert.equal(Buffer.from(login.commands[loginCommand + 2].line, 'base64').toString(), 'local-test-password');
  assert.ok(login.commands.slice(loginCommand, loginCommand + 3).every(item => item.secure));
  const plain = createSmtpMock({ plainChallenge: true });
  assert.equal((await submit(plain)).status, 200);
  const plainCommand = plain.commands.findIndex(item => item.line.startsWith('AUTH PLAIN '));
  assert.equal(plain.commands[plainCommand].line.slice(11), plain.commands[plainCommand + 1].line);
});

test('Missing auth mechanisms and provider rejections never claim success', async () => {
  for (const settings of [
    { auth: [] }, { throwConnect: true },
    ...Object.entries({ greeting: 421, hello: 500, auth: 535, mail: 550, rcpt: 550, data: 554, final: 451 }).map(([stage, code]) => ({ reject: { [stage]: code } }))
  ]) {
    const smtp = createSmtpMock(settings);
    const response = await submit(smtp);
    assert.equal(response.status, 503);
    const result = await response.json();
    assert.equal(result.ok, false);
    assert.equal(result.error.includes('SMTP'), false);
    assert.equal(result.error.includes('password'), false);
  }
});

test('Malformed multiline replies and oversized greeting lines fail safely', async () => {
  for (const settings of [{ ehloRaw: '250-capability\r\n220 Wrong code\r\n' }, { greetingRaw: '220 ' + 'x'.repeat(1100) + '\r\n' }]) {
    const smtp = createSmtpMock(settings);
    const response = await submit(smtp);
    assert.equal(response.status, 503);
    assert.equal(smtp.transactions.length, 0);
  }
});

test('Disconnect before DATA acceptance returns an honest unconfirmed response', async () => {
  const smtp = createSmtpMock({ disconnectAt: 'data' });
  const response = await submit(smtp);
  assert.equal(response.status, 503);
  const result = await response.json();
  assert.equal(result.ok, false);
  assert.match(result.error, /couldn’t confirm/);
  assert.equal(smtp.transactions.length, 1);
});

test('The absolute SMTP deadline closes stalled connections without claiming success', async () => {
  for (const hangAt of ['greeting', 'data']) {
    const smtp = createSmtpMock({ hangAt });
    const response = await submit(smtp, configured, valid(), { timeoutMs: 25 });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).ok, false);
    await smtp.sockets[0].closed;
  }
});

test('QUIT or socket-close failure after finalDATA250 cannot mask accepted delivery', async () => {
  const smtp = createSmtpMock({ failQuit: true, failClose: true });
  const response = await submit(smtp);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(smtp.transactions.length, 1);
});

test('Server-controlled sender and recipient overrides cannot come from visitor data', async () => {
  const smtp = createSmtpMock();
  const response = await submit(smtp, { ...configured, CONTACT_FROM_EMAIL: 'office@example.com', CONTACT_TO_EMAIL: 'team@example.com' }, { ...valid(), to: 'attacker@example.com' });
  assert.equal(response.status, 200);
  assert.equal(smtp.transactions[0].from, '<office@example.com>');
  assert.equal(smtp.transactions[0].to, '<team@example.com>');
});

test('Retries retain a traceable Message-ID but SMTP acceptance is not deduplicated', async () => {
  const input = valid();
  const smtp = createSmtpMock();
  assert.equal((await submit(smtp, configured, input)).status, 200);
  assert.equal((await submit(smtp, configured, input)).status, 200);
  assert.equal((await submit(smtp, configured, { ...input, message: 'A different question.' })).status, 200);
  assert.equal(smtp.transactions.length, 3);
  assert.equal(messageId(smtp.transactions[0].mime), messageId(smtp.transactions[1].mime));
  assert.notEqual(messageId(smtp.transactions[1].mime), messageId(smtp.transactions[2].mime));
});
