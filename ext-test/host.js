// Minimal Chrome native messaging host: receives {cmd:'delete', file} and deletes the file.
const fs = require('fs');
let buf = Buffer.alloc(0);

function send(obj) {
  const data = Buffer.from(JSON.stringify(obj), 'utf8');
  const head = Buffer.alloc(4);
  head.writeUInt32LE(data.length, 0);
  process.stdout.write(head);
  process.stdout.write(data);
}

function handleMessage(msg) {
  if (msg && msg.cmd === 'delete') {
    let result;
    try {
      const existed = fs.existsSync(msg.file);
      if (existed) fs.rmSync(msg.file, { force: true });
      result = { ok: true, existed, deleted: !fs.existsSync(msg.file) };
    } catch (e) { result = { ok: false, error: String(e) }; }
    send(result);
  } else {
    send({ ok: false, error: 'unknown cmd' });
  }
}

process.stdin.on('data', (d) => {
  buf = Buffer.concat([buf, d]);
  while (buf.length >= 4) {
    const len = buf.readUInt32LE(0);
    if (buf.length < 4 + len) break;
    const msg = JSON.parse(buf.slice(4, 4 + len).toString('utf8'));
    buf = buf.slice(4 + len);
    handleMessage(msg);
  }
});
process.stdin.on('end', () => process.exit(0));