# Vanish Measurement Lab

Empirical decision lab for **Vanish** — a one-click, zero-trace uninstaller for vibe coders
(the "18 Ollamas on my PC" problem: one icon, click, the app never existed, no scanner can
tell it was ever installed).

This repo holds **how the architecture was chosen**: the rubric, the raw measurements,
the scoring scripts, and every battery test. Every number below is reproducible on any
Windows PC with the commands in [How to rerun](#how-to-rerun).

## Design principles (Karpathy-aligned)

The verdict isn't only numbers — it follows Karpathy's revealed preferences from primary
sources (see [research](#key-technical-findings)):

1. **CLI/API/Markdown over GUI.** "Don't ask a developer to visit, look, or click.
   Instruct and empower their LLM." Vanish ships a CLI + Markdown docs so both humans
   and AI agents drive it without touching a GUI.
2. **Self-contained, zero-dependency.** "It has no other master. It just does the thing."
   One portable exe: no accounts, no telemetry, no auto-updates, no third-party bridge
   service, no extension-store review.
3. **Simple stacks.** Electron + TypeScript, nothing else. No serverless multiverse, no
   multi-service glue — the part Karpathy called "a painful slog as a deployed, real app".
4. **The vibe-coding loop is the spec.** Copy-pasteable errors, fast re-runs, verify by
   looking. The batteries in this repo measure exactly that loop (1.3 s extension,
   ~0.8 s Electron) because that's the loop the product will be built and corrected in.
5. **Zero trace is the artifact.** Like his calculator: install it and the system shows
   no memory of it; uninstall it and no scanner can tell it was ever there.

## The question

Three candidate architectures for a zero-trace uninstaller:

| # | Architecture | Idea |
|---|--------------|------|
| A | **Electron portable** | Single portable `.exe`, native Node fs access, TypeScript |
| B | **Hybrid** | Electron shell + Chrome extension front-end via native messaging |
| C | **Extension + Desktop Commander** | Chrome extension + native messaging + remote MCP bridge |

## Verdict (so far)

**Electron portable wins — unanimously, 5 scoring methods.**

| Method | Electron | Hybrid | Extension+DC |
|---|---|---|---|
| Weighted sum | **89.0** | 85.5 | 66.0 |
| TOPSIS (rubric weights) | **0.648** | 0.612 | 0.318 |
| TOPSIS (equal weights) | **0.687** | 0.640 | 0.318 |
| AHP (rubric weights) | **0.376** | 0.358 | 0.266 |
| AHP (equal weights) | **0.378** | 0.355 | 0.267 |

No method flips the ranking, including with equal weights.

## What was measured

### Battery A — Electron (TypeScript, portable)

| Metric | Result | Status |
|---|---|---|
| esbuild compile | 515–615 ms | ✅ 3/3 PASS |
| Dev cold start (`electron dist/main.js`) | 147–174 ms | ✅ 3/3 PASS |
| Main process RSS | 93–95 MB | ✅ |
| Portable build time | 320.7 s | ✅ built |
| Portable exe size | 189.3 MB | ✅ |
| Portable exe cold start | *pending — Windows Sandbox run* | ⏳ |
| Correction cycle (bug→FAIL→fix→PASS) | FAIL detect 20.0 s (modal dialog blocked stderr; fixed with `uncaughtException` handler → re-measuring in sandbox), fix→PASS **288 ms** | ⏳ re-measuring |

### Battery B — Extension TS edit→verify loop

| Metric | Result |
|---|---|
| esbuild compile | 42–47 ms |
| Reload via CDP `Extensions.loadUnpacked` | ~585 ms |
| Probe verify | ~700 ms |
| **Total loop** | **1.26–1.32 s, 3/3 PASS** |

### Battery C — Correction cycle (inject bug → detect → fix → verify)

| Architecture | Bug detect | Fix verify | Total |
|---|---|---|---|
| Extension | 1.43 s (precise: "Specified native messaging host not found") | 1.40 s | ~2.8 s |
| Electron | 20.0 s (dialog-blocked; handler fix applied) | 0.29 s | re-measuring in sandbox |

### Probe — the zero-trace mechanism (works, verified)

- **Test A**: a Chrome extension with full `chrome.*` permissions **cannot** reach the real
  filesystem (OPFS is a sandboxed virtual FS). Extension alone is not enough.
- **Test B**: extension + native messaging host **deleted a real file** on the OS
  (`%TEMP%\vanish-test.txt`), independently verified gone.
- Therefore: the product pattern is *register native host → do the work → unregister →
  delete itself* = zero trace, exactly the "temporary self-deleting daemon" design.

## Key technical findings

1. **`Extensions.loadUnpacked` CDP command (Chrome 126+)** loads/reloads an unpacked
   extension purely over CDP — no `--load-extension` flag, no browser relaunch. This is
   the AI-iteration loop mechanism.
2. **MV3 service workers** stop after ~30 s idle and only restart on events; extension
   *pages* keep working and can call `chrome.runtime.connectNative` without the SW.
3. **`chrome.runtime.reload()` corrupts `--load-extension` sessions** in headless
   (extension becomes `ERR_BLOCKED_BY_CLIENT`); use `loadUnpacked` instead.
4. **Electron uncaught exceptions show a modal dialog** that blocks stderr — a
   `process.on('uncaughtException')` handler that prints and exits makes the dev loop
   stream errors instead (also the right production behavior).
5. **Native messaging is the only sanctioned extension→OS bridge**; CWS review for
   `nativeMessaging` can take weeks. Desktop Commander's remote MCP is **not a sandbox**
   (per its own SECURITY.md) and adds a third-party trust surface.
6. **Karpathy's revealed preferences** (researched, primary sources): CLI/API/Markdown
   surfaces over GUI ("Don't ask a developer to visit, look, or click"), self-contained
   zero-dependency artifacts ("I love calculator"), and browser-GUI glue as an
   LLM-unmanipulable bottleneck — all favor the portable single-exe over the
   extension+remote-bridge architecture.

## How to rerun

Requirements: Windows, Node.js ≥ 20, Chrome/Chromium, `npm i esbuild topsis2 ahp`
in the respective folders.

```batch
:: Scoring (weighted sum + TOPSIS + AHP cross-validation)
cd score
node score.js
node crossval.js

:: Extension loop battery (needs a headless Chromium with CDP on 127.0.0.1:9224)
cd ext-test
node loop-ext.js 3

:: Electron dev loop battery
cd electron-lab
npm i && npm i -D electron electron-builder esbuild
node loop-electron.js 3

:: Electron correction cycle
node correction-electron.js

:: Portable build
npx electron-builder --win portable
```

### Windows Sandbox kit (zero-trace verification)

- `sandbox-test.wsb` — maps `electron-lab/` (rw, for results) and Node.js (read-only)
  into a disposable VM, auto-runs on logon.
- `electron-lab/sandbox-run.cmd` — runs portable exe cold start ×3, dev loop ×3, and the
  correction cycle inside the VM; results land in `electron-lab/sandbox-results.txt`.
- Closing the sandbox erases the VM; only the mapped results file persists.

## Repo layout

```
score/          rubric.json, measurements.json, score.js, crossval.js, scores.json
ext-test/       CDP probe + extension loop (probe.ts, cdp-test.js, loop-ext.js, ...)
electron-lab/   Electron TS lab (main.ts, loop-electron.js, correction-electron.js)
sandbox-test.wsb            Windows Sandbox launcher
electron-lab/sandbox-run.cmd  in-sandbox test runner
```

## Status

- [x] Probe: extension sandboxed / bridge reaches OS (verified, cleaned up)
- [x] Scoring pipeline: weighted sum + TOPSIS + AHP, unanimous
- [x] Battery B: extension loop 1.26–1.32 s, 3/3 PASS
- [x] Battery C (extension): correction cycle ~2.8 s
- [x] Battery A: portable build (189.3 MB, 320.7 s), dev loop 3/3 PASS
- [ ] Battery A/C: portable exe + correction cycle inside Windows Sandbox
- [ ] Final verdict doc with sandbox numbers

## Related

- Phase 1 (the BCU fork with plugin API + control plane):
  https://github.com/fvegiard/bcu-copilot-fork

## License

MIT