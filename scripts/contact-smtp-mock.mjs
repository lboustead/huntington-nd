export function createSmtpMock(settings = {}) {
  const commands = [];
  const transactions = [];
  const connections = [];
  const upgrades = [];
  const encoder = new TextEncoder();
  const sockets = [];
  function makeSocket(secure, greeting) {
    let incoming;
    let ended = false;
    let buffer = '';
    let stage = 'command';
    let from = '';
    let to = '';
    let resolveClosed;
    const closed = new Promise(resolve => { resolveClosed = resolve; });
    const emit = text => {
      if (ended) return;
      const bytes = encoder.encode(text);
      const width = settings.fragmented === false ? bytes.length : 7;
      for (let start = 0; start < bytes.length; start += width) incoming.enqueue(bytes.slice(start, start + width));
    };
    const finish = () => {
      if (!ended) {
        ended = true;
        incoming.close();
      }
      resolveClosed();
    };
    const status = (name, expected, text) => {
      const code = settings.reject?.[name] ?? expected;
      emit(`${code} ${text}\r\n`);
      return code === expected;
    };
    const socket = {
      opened: settings.failTls && secure ? Promise.reject(new Error('TLS verification failed')) : Promise.resolve({}),
      closed,
      readable: new ReadableStream({ start(controller) { incoming = controller; } }),
      writable: new WritableStream({
        write(bytes) {
          buffer += new TextDecoder().decode(bytes);
          while (buffer) {
            if (stage === 'data') {
              const end = buffer.indexOf('\r\n.\r\n');
              if (end < 0) return;
              transactions.push({ mime: buffer.slice(0, end + 2), from, to, secure });
              buffer = buffer.slice(end + 5);
              stage = 'command';
              if (settings.disconnectAt === 'data') { finish(); return; }
              if (settings.hangAt === 'data') return;
              status('final', 250, 'Message accepted');
              continue;
            }
            const end = buffer.indexOf('\r\n');
            if (end < 0) return;
            const line = buffer.slice(0, end);
            buffer = buffer.slice(end + 2);
            commands.push({ line, secure });
            if (stage === 'plain') { status('auth', 235, 'Authenticated'); stage = 'command'; }
            else if (stage === 'user') { emit('334 UGFzc3dvcmQ6\r\n'); stage = 'password'; }
            else if (stage === 'password') { status('auth', 235, 'Authenticated'); stage = 'command'; }
            else if (line.startsWith('EHLO ')) {
              if (settings.ehloRaw) emit(settings.ehloRaw);
              else if (settings.reject?.hello) status('hello', 250, 'EHLO rejected');
              else {
                const capabilities = [];
                if (!secure && settings.starttls !== false) capabilities.push('STARTTLS');
                const auth = settings.auth ?? ['PLAIN', 'LOGIN'];
                if (auth.length) capabilities.push(`AUTH ${auth.join(' ')}`);
                capabilities.push('SIZE 10485760');
                emit('250-test.example\r\n' + capabilities.map((item, index) => `250${index === capabilities.length - 1 ? ' ' : '-'}${item}\r\n`).join(''));
              }
            } else if (line === 'STARTTLS') status('starttls', 220, 'Ready for TLS');
            else if (line.startsWith('AUTH PLAIN ')) {
              if (settings.plainChallenge) { emit('334 \r\n'); stage = 'plain'; }
              else status('auth', 235, 'Authenticated');
            } else if (line === 'AUTH LOGIN') { emit('334 VXNlcm5hbWU6\r\n'); stage = 'user'; }
            else if (line.startsWith('MAIL FROM:')) { from = line.slice(10); status('mail', 250, 'Sender accepted'); }
            else if (line.startsWith('RCPT TO:')) { to = line.slice(8); status('rcpt', 250, 'Recipient accepted'); }
            else if (line === 'DATA') { if (status('data', 354, 'Send message')) stage = 'data'; }
            else if (line === 'QUIT') {
              if (settings.failQuit) throw new Error('QUIT failed');
              emit('221 Bye\r\n');
            } else throw new Error('Unexpected SMTP command');
          }
        }
      }),
      startTls() {
        upgrades.push({ readableLocked: socket.readable.locked, writableLocked: socket.writable.locked });
        finish();
        return makeSocket(true, false);
      },
      close() {
        finish();
        return settings.failClose ? Promise.reject(new Error('Socket close failed')) : Promise.resolve();
      }
    };
    sockets.push(socket);
    if (greeting && settings.hangAt !== 'greeting') emit(settings.greetingRaw ?? `${settings.reject?.greeting ?? 220} Test SMTP ready\r\n`);
    return socket;
  }
  const connect = (address, options) => {
    connections.push({ address, options });
    if (settings.throwConnect) throw new Error('Socket connect failed');
    return makeSocket(options.secureTransport === 'on', true);
  };
  return { connect, commands, transactions, connections, upgrades, sockets };
}
