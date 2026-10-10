# Index

Catalog of the Vanish project wiki. The LLM updates this on every ingest. Graph shape: see `../graph.json` (machine layer) or open this folder in Obsidian to see the link graph.

## Decisions
- [[decision-architecture]] — Electron + TypeScript wins (89.0, 5 methods unanimous)
- [[decision-distribution]] — Portable vs NSIS: OPEN (portable re-extracts 189MB every launch)

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

## Tasks
- [[task-build-app]] — Build Vanish app (PENDING, blocked on distribution decision)
- [[task-trace-model]] — Design per-app trace model (PENDING)
- [[task-cleanup-demo]] — Copilot version-cache cleanup (DONE, 1013.6 MB reclaimed)