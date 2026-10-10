// Debug: dump all CDP targets, open probe.html, dump what actually loads
const BASE = 'http://127.0.0.1:' + (process.argv[2] || '9224');
const extId = process.argv[3];
async function j(url, opts) { const r = await fetch(url, opts); return r.json(); }
(async () => {
  const list = await j(BASE + '/json/list');
  console.log('=== ALL TARGETS ===');
  for (const t of list) console.log(`[${t.type}] ${t.url}`);
  const probeUrl = `chrome-extension://${extId}/probe.html?run=0`;
  let tab;
  try { tab = await j(`${BASE}/json/new?${encodeURIComponent(probeUrl)}`, { method: 'PUT' }); }
  catch (e) { console.log('open failed:', e.message); return; }
  console.log('=== PROBE TAB ===', tab.id, tab.url);
  await new Promise((r) => setTimeout(r, 2500));
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0; const pending = {};
  const call = (method, params) => new Promise((res) => { const i = ++id; pending[i] = res; ws.send(JSON.stringify({ id: i, method, params })); });
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending[m.id]) { pending[m.id](m.result); delete pending[m.id]; } };
  await new Promise((res) => { ws.onopen = res; });
  const t = await call('Runtime.evaluate', { expression: 'JSON.stringify({title: document.title, url: location.href, body: (document.body ? document.body.innerText.slice(0, 500) : null), hasOut: !!document.getElementById("out")})', returnByValue: true });
  console.log('=== PAGE STATE ===');
  console.log(t.result.value);
  await j(`${BASE}/json/close/${tab.id}`);
  process.exit(0);
})().catch((e) => { console.error('ERR:', e.message); process.exit(1); });