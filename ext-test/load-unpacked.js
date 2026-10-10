// Test Extensions.loadUnpacked via browser-level CDP (Chrome 126+)
const BASE = 'http://127.0.0.1:' + (process.argv[2] || '9224');
const extDir = process.argv[3];
(async () => {
  const ver = await fetch(BASE + '/json/version').then((r) => r.json());
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res) => { ws.onopen = res; });
  let id = 0; const pending = {};
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; } };
  const call = (method, params) => new Promise((res) => { const i = ++id; pending[i] = res; ws.send(JSON.stringify({ id: i, method, params })); });
  const r = await call('Extensions.loadUnpacked', { path: extDir });
  console.log('loadUnpacked response:', JSON.stringify(r));
  ws.close();
  process.exit(0);
})().catch((e) => { console.error('ERR:', e.message); process.exit(1); });