// Battery C electron: inject bug -> compile+launch -> FAIL detect; revert -> PASS
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const LAB = __dirname;
const MAIN = path.join(LAB, 'main.ts');
const orig = fs.readFileSync(MAIN, 'utf8');

function compile() { execSync(`npx esbuild main.ts --bundle --platform=node --external:electron --outfile=dist/main.js`, { cwd: LAB, stdio: 'pipe' }); }

function launch() {
  return new Promise((resolve) => {
    const t = Date.now();
    const p = spawn(path.join(LAB, 'node_modules', 'electron', 'dist', 'electron.exe'), [path.join(LAB, 'dist', 'main.js')], { cwd: LAB, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    const to = setTimeout(() => { p.kill(); resolve({ pass: false, ms: Date.now() - t, err: 'TIMEOUT' }); }, 20000);
    p.stdout.on('data', d => {
      out += d;
      if (/COLD_START_MS=\d+/.test(out)) { clearTimeout(to); p.kill(); resolve({ pass: true, ms: Date.now() - t, err: '' }); }
    });
    p.stderr.on('data', d => {
      err += d;
      if (/ReferenceError|TypeError|SyntaxError|Cannot find|Error:/.test(err)) { clearTimeout(to); p.kill(); resolve({ pass: false, ms: Date.now() - t, err: err.trim().split('\n').filter(l => l.includes('Error'))[0] || err.trim().slice(0, 200) }); }
    });
    p.on('close', () => {
      clearTimeout(to);
      resolve({ pass: /COLD_START_MS=\d+/.test(out), ms: Date.now() - t, err: err.trim().slice(0, 400) });
    });
  });
}

(async () => {
  // Phase 1: inject bug
  const buggy = orig.replace('console.log(`COLD_START_MS=', 'console.log(bugVarNotDefined.toFixed(2)); console.log(`COLD_START_MS=');
  fs.writeFileSync(MAIN, buggy);
  let t = Date.now(); compile(); const c1 = Date.now() - t;
  const f = await launch();
  console.log(`BUG COMPILE_MS=${c1} DETECT_MS=${f.ms} RESULT=${f.pass ? 'UNEXPECTED-PASS' : 'FAIL-DETECTED'} ERR=${f.err.split('\n')[0]}`);

  // Phase 2: revert
  fs.writeFileSync(MAIN, orig);
  t = Date.now(); compile(); const c2 = Date.now() - t;
  const p = await launch();
  console.log(`FIX COMPILE_MS=${c2} VERIFY_MS=${p.ms} RESULT=${p.pass ? 'PASS' : 'FAIL'} ERR=${p.err.split('\n')[0]}`);
})();