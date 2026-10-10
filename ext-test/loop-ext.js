// Battery B/C: full AI edit->compile->reload->verify loop for the extension, timed.
// Steps: esbuild compile probe.ts -> reload extension via CDP (SW chrome.runtime.reload)
//        -> run probe via cdp-test.js -> report PASS/FAIL + timings.
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const extDir = process.argv[2];
const testFile = process.argv[3];
const port = process.argv[4] || '9224';
const BASE = 'http://127.0.0.1:' + port;
const esbuild = require('esbuild');

async function j(url, opts) { const r = await fetch(url, opts); return r.json(); }

(async () => {
  const t0 = Date.now();
  // 1. compile TS
  esbuild.buildSync({ entryPoints: [path.join(extDir, 'probe.ts')], outfile: path.join(extDir, 'probe.js'), format: 'iife', target: 'chrome120' });
  const tCompile = Date.now() - t0;

  // 2. reload extension via CDP Extensions.loadUnpacked (Chrome 126+) — programmatic,
  //    no --load-extension flag needed, survives SW idle
  const ver = await j(BASE + '/json/version');
  const bws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res) => { bws.onopen = res; });
  let bid = 0; const bpending = {};
  bws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && bpending[m.id]) { bpending[m.id](m); delete bpending[m.id]; } };
  const bcall = (method, params) => new Promise((res) => { const i = ++bid; bpending[i] = res; bws.send(JSON.stringify({ id: i, method, params })); });
  const lu = await bcall('Extensions.loadUnpacked', { path: extDir });
  bws.close();
  if (lu.error) throw new Error('loadUnpacked failed: ' + JSON.stringify(lu.error));
  const extId = lu.result.id;
  fs.writeFileSync(path.join(extDir, 'ext-id.cache'), extId);
  await new Promise((r) => setTimeout(r, 500));
  const tReload = Date.now() - t0;

  // 3. run probe (cdp-test.js as child)
  const tProbe0 = Date.now();
  const run = spawnSync('node', [path.join(extDir, 'cdp-test.js'), extDir, testFile, 'chrome', port], { encoding: 'utf8' });
  const out = (run.stdout || '') + (run.stderr || '');
  const tTotal = Date.now() - t0;
  const pass = /RESULT B: SUCCESS/.test(out);
  console.log(`COMPILE_MS=${tCompile} RELOAD_MS=${tReload} PROBE_MS=${Date.now() - tProbe0} TOTAL_LOOP_MS=${tTotal} RESULT=${pass ? 'PASS' : 'FAIL'}`);
  if (!pass) console.log(out.split('\n').filter((l) => /RESULT|VERDICT|ERROR|error/i.test(l)).join('\n'));
  process.exit(pass ? 0 : 1);
})().catch((e) => { console.error('LOOP-ERROR:', e.message); process.exit(2); });