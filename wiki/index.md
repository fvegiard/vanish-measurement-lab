# Index

Catalog of the Vanish project wiki. The LLM updates this on every ingest. Graph shape: see `../graph.json` (machine layer) or open this folder in Obsidian to see the link graph.

## Decisions
- [[decision-architecture]] — Electron + TypeScript wins (89.0, 5 methods unanimous)
- [[decision-distribution]] — Dir target + zip wins (unzip-and-run; no installer traces, no 11.2s re-extraction)

## Components
- [[component-core]] — Vanish core (Electron main): scan + delete engine
- [[component-native-host]] — Self-deleting native host (probe-proven zero trace)
- [[component-extension]] — Optional browser sidekick (deferred)
- [[component-cli]] — CLI + Markdown docs (Karpathy: don't ask a developer to click)

## Findings
- [[finding-portable-reextract]] — Portable exe re-extracts every launch (11.2s ×3)
- [[finding-correction-loop]] — Electron correction cycle 1.71s (needs uncaughtException handler)
- [[finding-loadunpacked]] — Extensions.loadUnpacked CDP works (Chrome 126+)
- [[finding-karpathy]] — Karpathy 2026: LLM Wiki pattern (markdown graph, not JSON)
- [[finding-fetch-errors]] — Never let an error behind: root-cause, don't patch (user rule 2026-10-10)
- [[finding-batched-reg]] — Batched reg query /s = 7.4x scan speedup (6926→941ms)
- [[finding-self-packing]] — electron-builder recursive self-packing footgun (fixed; asar 367.6→0.01MB)
- [[finding-stale-sweep]] — Force-kill leaves run-dir; startup sweep self-heals (fixed; STALE-DIRS-AFTER: 0)
- [[finding-desktop-pollution]] — Agent must never surface UI on the user's desktop (lesson)

## Tasks
- [[task-build-app]] — Build Vanish app (DONE, v0.1: scan 941ms, launch 1.1–1.3s, zip 155.3MB, zero-trace verified)
- [[task-trace-model]] — Design per-app trace model (PENDING)
- [[task-cleanup-demo]] — Copilot version-cache cleanup (DONE, 1013.6 MB reclaimed)