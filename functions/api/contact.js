const SITE_NAME = 'Huntington Builders';
const SITE_HOST = 'huntingtonnd.com';
const DEFAULT_RECIPIENT = 'builders@huntingtonnd.com';
const DEFAULT_MAILBOX = 'noreply@huntingtonnd.com';
const MAX_BODY_BYTES = 16_000;
const EMAIL = /^[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]*[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]*[a-z\d])?)+$/i;
const SINGLE_LINE_CONTROL = /[\u0000-\u001f\u007f]/;
const MESSAGE_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const DELIVERY_ERROR = 'We couldn’t confirm that your message was sent. Please call or email our team before trying again.';

function json(status, data, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers
    }
  });
}

async function readJson(request) {
  const declaredLength = request.headers.get('Content-Length');
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) throw new Error('size');
  if (!request.body) throw new Error('json');
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error('size');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const result = {};
  for (const [field, maximum, required] of [
    ['name', 120, true], ['email', 160, true], ['phone', 40, false],
    ['interest', 80, true], ['message', 3000, true], ['website', 200, false]
  ]) {
    const value = input[field] ?? '';
    if (typeof value !== 'string') return null;
    result[field] = value.trim();
    const controls = field === 'message' ? MESSAGE_CONTROL : SINGLE_LINE_CONTROL;
    if ((required && !result[field]) || value.length > maximum || controls.test(value)) return null;
  }
  if (!EMAIL.test(result.email) || result.website) return null;
  if (!Number.isSafeInteger(input.startedAt) || input.startedAt <= 0) return null;
  result.startedAt = input.startedAt;
  return result;
}

function base64(value) {
  let binary = '';
  for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function encodedHeader(value) {
  const words = [];
  let chunk = '';
  for (const character of value) {
    if (new TextEncoder().encode(chunk + character).length > 42) {
      words.push(`=?UTF-8?B?${base64(chunk)}?=`);
      chunk = '';
    }
    chunk += character;
  }
  if (chunk) words.push(`=?UTF-8?B?${base64(chunk)}?=`);
  return words.join('\r\n ');
}

async function emailMessage(contact, from, to) {
  const text = [
    `New message from the ${SITE_NAME} website.`, '',
    `Name: ${contact.name}`, `Email: ${contact.email}`,
    `Phone: ${contact.phone || 'Not provided'}`, `Interest: ${contact.interest}`,
    '', contact.message
  ].join('\n');
  const fingerprint = JSON.stringify({ text, from, to, startedAt: contact.startedAt });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprint));
  const identifier = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
  return [
    `From: ${SITE_NAME} <${from}>`, `To: ${to}`, `Reply-To: ${contact.email}`,
    `Subject: ${encodedHeader(`${SITE_NAME} website: ${contact.interest}`)}`,
    `Date: ${new Date().toUTCString()}`, `Message-ID: <website-contact.${identifier}@${SITE_HOST}>`,
    'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64',
    '', base64(text).match(/.{1,76}/g).join('\r\n'), ''
  ].join('\r\n');
}

class SmtpSession {
  constructor(socket) {
    this.socket = socket;
    this.reader = socket.readable.getReader();
    this.writer = socket.writable.getWriter();
    this.decoder = new TextDecoder('utf-8', { fatal: true });
    this.buffer = '';
  }

  async line() {
    while (!this.buffer.includes('\r\n')) {
      const { value, done } = await this.reader.read();
      if (done) throw new Error('SMTP disconnected');
      this.buffer += this.decoder.decode(value, { stream: true });
      if (this.buffer.length > 16_384 || /(^|[^\r])\n/.test(this.buffer)) throw new Error('SMTP reply invalid');
    }
    const end = this.buffer.indexOf('\r\n');
    if (end > 1024) throw new Error('SMTP line too long');
    const line = this.buffer.slice(0, end);
    this.buffer = this.buffer.slice(end + 2);
    return line;
  }

  async reply() {
    const lines = [];
    let code = null;
    for (let count = 0; count < 100; count++) {
      const line = await this.line();
      const match = /^(\d{3})([ -])(.*)$/.exec(line);
      if (!match || (code !== null && code !== Number(match[1]))) throw new Error('SMTP reply invalid');
      code = Number(match[1]);
      lines.push(match[3]);
      if (match[2] === ' ') return { code, lines };
    }
    throw new Error('SMTP reply too long');
  }

  async write(value) {
    await this.writer.write(new TextEncoder().encode(value));
  }

  async command(value, expected) {
    await this.write(value + '\r\n');
    const reply = await this.reply();
    if (!expected.includes(reply.code)) throw new Error('SMTP command rejected');
    return reply;
  }

  release() {
    try { this.reader.releaseLock(); } catch {}
    try { this.writer.releaseLock(); } catch {}
  }
}

async function deliverSmtp(config, contact, options) {
  const connector = options.connect || (await import('cloudflare:sockets')).connect;
  const message = await emailMessage(contact, config.from, config.to);
  let socket;
  let session;
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      try { Promise.resolve(socket?.close()).catch(() => {}); } catch {}
      reject(new Error('SMTP timed out'));
    }, options.timeoutMs || 15_000);
  });
  const deliver = async () => {
    socket = connector({ hostname: config.host, port: config.port }, { secureTransport: config.port === 465 ? 'on' : 'starttls' });
    socket.closed.catch(() => {});
    await socket.opened;
    session = new SmtpSession(socket);
    if ((await session.reply()).code !== 220) throw new Error('SMTP greeting rejected');
    let hello = await session.command(`EHLO ${SITE_HOST}`, [250]);
    if (config.port === 587) {
      if (!hello.lines.some(line => /^STARTTLS(?:\s|$)/i.test(line))) throw new Error('SMTP TLS unavailable');
      await session.command('STARTTLS', [220]);
      if (session.buffer) throw new Error('SMTP TLS reply invalid');
      session.release();
      socket = socket.startTls();
      socket.closed.catch(() => {});
      await socket.opened;
      session = new SmtpSession(socket);
      hello = await session.command(`EHLO ${SITE_HOST}`, [250]);
    }
    const mechanisms = hello.lines.flatMap(line => /^AUTH[ =]/i.test(line) ? line.slice(5).trim().toUpperCase().split(/\s+/) : []);
    if (mechanisms.includes('PLAIN')) {
      const credentials = base64(`\0${config.username}\0${config.password}`);
      const auth = await session.command(`AUTH PLAIN ${credentials}`, [235, 334]);
      if (auth.code === 334) await session.command(credentials, [235]);
    } else if (mechanisms.includes('LOGIN')) {
      await session.command('AUTH LOGIN', [334]);
      await session.command(base64(config.username), [334]);
      await session.command(base64(config.password), [235]);
    } else {
      throw new Error('SMTP authentication unavailable');
    }
    await session.command(`MAIL FROM:<${config.from}>`, [250]);
    await session.command(`RCPT TO:<${config.to}>`, [250, 251]);
    await session.command('DATA', [354]);
    await session.write(message + '.\r\n');
    if ((await session.reply()).code !== 250) throw new Error('SMTP message rejected');
    try { session.writer.write(new TextEncoder().encode('QUIT\r\n')).catch(() => {}); } catch {}
  };
  try {
    await Promise.race([deliver(), deadline]);
  } finally {
    clearTimeout(timer);
    session?.release();
    try { Promise.resolve(socket?.close()).catch(() => {}); } catch {}
  }
}

export async function onRequest({ request, env = {} }, options = {}) {
  if (request.method !== 'POST') {
    return json(405, { ok: false, error: 'Please submit the contact form to send a message.' }, { Allow: 'POST' });
  }
  const origin = request.headers.get('Origin');
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (origin !== new URL(request.url).origin || (fetchSite && fetchSite !== 'same-origin')) {
    return json(403, { ok: false, error: 'Please send your message using the contact form on this website.' });
  }
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) {
    return json(415, { ok: false, error: 'Please send your message using the contact form on this website.' });
  }
  let input;
  try {
    input = await readJson(request);
  } catch (error) {
    return json(error.message === 'size' ? 413 : 400, { ok: false, error: 'Please check your message and try again.' });
  }
  const contact = validate(input);
  if (!contact) return json(422, { ok: false, error: 'Please check the form fields and try again.' });
  const settings = {
    host: env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(env.SMTP_PORT ?? '465'),
    username: env.SMTP_USERNAME ?? DEFAULT_MAILBOX,
    password: env.SMTP_PASSWORD,
    from: env.CONTACT_FROM_EMAIL ?? env.SMTP_USERNAME ?? DEFAULT_MAILBOX,
    to: env.CONTACT_TO_EMAIL ?? DEFAULT_RECIPIENT
  };
  if (
    typeof settings.host !== 'string' || !/^(?=.{1,253}$)[a-z\d](?:[a-z\d.-]*[a-z\d])?$/i.test(settings.host) ||
    ![465, 587].includes(settings.port) ||
    typeof settings.password !== 'string' || !settings.password.trim() || settings.password.length > 512 || SINGLE_LINE_CONTROL.test(settings.password) ||
    ![settings.username, settings.from, settings.to].every(value => typeof value === 'string' && value.length <= 160 && EMAIL.test(value) && !SINGLE_LINE_CONTROL.test(value))
  ) {
    return json(503, { ok: false, error: 'Online messaging is not available yet. Please call or email our team.' });
  }
  try {
    await deliverSmtp(settings, contact, options);
    return json(200, { ok: true });
  } catch {
    return json(503, { ok: false, error: DELIVERY_ERROR });
  }
}
