// Battery A/C driver: TS edit -> esbuild compile -> electron dev launch -> verify
// Usage: node loop-electron.js [times]   (default 3)
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LAB = __dirname;
const times = parseInt(process.argv[2] || '3', 10);

function compile() {
  const t = Date.now();
  execSync(`npx esbuild main.ts --bundle --platform=node --external:electron --outfile=dist/main.js`, { cwd: LAB, stdio: 'pipe' });
  return Date.now() - t;
}

function launchAndVerify() {
  return new Promise((resolve) => {
    const t = Date.now();
    const p = spawn(path.join(LAB, 'node_modules', 'electron', 'dist', 'electron.exe'), [path.join(LAB, 'dist', 'main.js')], { cwd: LAB, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    const to = setTimeout(() => { p.kill(); resolve({ pass: false, ms: Date.now() - t, err: 'TIMEOUT' }); }, 30000);
    p.stdout.on('data', d => out += d);
    p.stderr.on('data', d => err += d);
    p.on('close', (code) => {
      clearTimeout(to);
      const m = out.match(/COLD_START_MS=(\d+)/);
      const rss = out.match(/MAIN_RSS_MB=(\d+)/);
      resolve({ pass: !!m, ms: m ? parseInt(m[1]) : Date.now() - t, rss: rss ? parseInt(rss[1]) : null, err: err.trim().slice(0, 300) });
    });
  });
}

(async () => {
  for (let i = 1; i <= times; i++) {
    const c = compile();
    const r = await launchAndVerify();
    console.log(`RUN${i} COMPILE_MS=${c} COLD_START_MS=${r.ms} RSS_MB=${r.rss ?? 'n/a'} RESULT=${r.pass ? 'PASS' : 'FAIL'}${r.pass ? '' : ' ERR=' + r.err}`);
  }
})();