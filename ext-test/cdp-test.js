// Drives the probe end-to-end over CDP: finds/derives the extension id, registers the
// native host (HKCU), opens the probe page, waits for it to finish, prints results.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const BASE = 'http://127.0.0.1:' + (process.argv[5] || '9222');
const extDir = process.argv[2];
const testFile = process.argv[3];
const browserFlavor = process.argv[4] || 'chrome'; // 'chrome' | 'edge'

async function j(url, opts) { const r = await fetch(url, opts); return r.json(); }

(async () => {
  const ver = await j(BASE + '/json/version');
  console.log('BROWSER:', ver.Browser);

  const list = await j(BASE + '/json/list');
  // Candidate ids: our own service worker target first (authoritative — the SW only
  // exists if the extension loaded), then path-derived id, then any other ext ids.
  const candidates = [];
  // cached id from a previous successful run — authoritative even when the SW is idle
  try {
    const cached = fs.readFileSync(path.join(extDir, 'ext-id.cache'), 'utf8').trim();
    if (cached) candidates.push(cached);
  } catch (e) { /* no cache yet */ }
  for (const t of list) {
    const m = /chrome-extension:\/\/([a-p]{32})\/sw\.js/.exec(t.url || '');
    if (m && !candidates.includes(m[1])) candidates.push(m[1]);
  }
  const pathId = crypto.createHash('sha256').update(extDir).digest('hex').slice(0, 32)
    .replace(/[0-9a-f]/g, (c) => 'abcdefghijklmnop'[parseInt(c, 16)]);
  if (!candidates.includes(pathId)) candidates.push(pathId);
  for (const t of list) {
    const m = /chrome-extension:\/\/([a-p]{32})/.exec(t.url || '');
    if (m && !candidates.includes(m[1])) candidates.push(m[1]);
  }
  console.log('candidate extension ids:', candidates.join(', '));

  const manifestPath = path.join(extDir, 'com.vanish.test.json');
  // Register native host (HKCU — no admin needed) under every Chromium flavor root
  for (const root of ['Google\\Chrome', 'Microsoft\\Edge', 'Chromium']) {
    const regKey = `HKCU\\Software\\${root}\\NativeMessagingHosts\\com.vanish.test`;
    execSync(`reg add "${regKey}" /ve /d "${manifestPath}" /f`, { stdio: 'pipe' });
  }
  console.log('native host registered (chrome/edge/chromium roots)');

  // Try each candidate id until the probe page actually loads and finishes
  let extId = null, outText = null;
  for (const cand of candidates) {
    // manifest must allowlist THIS candidate id
    fs.writeFileSync(manifestPath, JSON.stringify({
      name: 'com.vanish.test',
      description: 'Vanish native host probe',
      path: path.join(extDir, 'host.bat'),
      type: 'stdio',
      allowed_origins: [`chrome-extension://${cand}/`]
    }, null, 2));
    const probeUrl = `chrome-extension://${cand}/probe.html?run=1&file=${encodeURIComponent(testFile)}`;
    let tab;
    try {
      tab = await j(`${BASE}/json/new?${encodeURIComponent(probeUrl)}`, { method: 'PUT' });
    } catch (_) { continue; }
    if (!tab || !tab.webSocketDebuggerUrl) continue;
    console.log('trying probe tab in extension', cand, '→', tab.id);
    try {
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      let id = 0; const pending = {};
      const call = (method, params) => new Promise((res) => {
        const i = ++id; pending[i] = res;
        ws.send(JSON.stringify({ id: i, method, params }));
      });
      ws.onmessage = (ev) => {
        const m = JSON.parse(ev.data);
        if (m.id && pending[m.id]) { pending[m.id](m.result); delete pending[m.id]; }
      };
      await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; setTimeout(() => rej(new Error('ws timeout')), 5000); });
      let loaded = false, done = false;
      for (let i = 0; i < 16; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          const t = await call('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
          const v = t && t.result && t.result.value;
          if (v === 'PROBE-DONE') { loaded = done = true; break; }
          if (v === 'PROBE-RUNNING') loaded = true;
        } catch (_) { /* still loading */ }
      }
      if (loaded) {
        const out = await call('Runtime.evaluate', { expression: 'document.getElementById("out").textContent', returnByValue: true });
        outText = out.result.value;
        extId = cand;
        console.log(done ? 'probe completed.' : 'probe loaded but did not finish in time.');
      }
      ws.close();
    } catch (e) { console.log('candidate failed:', e.message); }
    try { await j(`${BASE}/json/close/${tab.id}`); } catch (_) {}
    if (extId) break;
  }
  if (!extId) throw new Error('no candidate extension served probe.html — extension not loaded?');
  console.log('EXTENSION ID:', extId);
  if (extId) fs.writeFileSync(path.join(extDir, 'ext-id.cache'), extId);
  console.log('=== PROBE OUTPUT ===');
  console.log(outText);
  process.exit(0);
})().catch((e) => { console.error('CDP-ERROR:', e.message || e); process.exit(1); });