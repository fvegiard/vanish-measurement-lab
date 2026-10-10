# Log

Append-only. Each entry starts with `## [YYYY-MM-DD] type | title` so `grep "^## \[" log.md | tail -5` gives the last 5 entries.

## [2026-10-09] cleanup | Copilot version-cache purge
Deleted 6 old %LOCALAPPDATA%\copilot\pkg\win32-x64\ version folders (1.0.89-4 … 1.0.93-1) + pkg\tmp leftover. Reclaimed 1013.6 MB (1189.1 → 175.5). Kept running 1.0.94-3. Verified app still works.

## [2026-10-09] research | Karpathy tracking method, 2026 sources
2025 answer: "append-and-review note" (one plain text note, anti-structure). 2026 answer: **LLM Wiki** pattern (Sequoia Ascent 2026 fireside, Apr 2026 + gist): persistent markdown wiki, entity pages + cross-links, index.md + append-only log.md, Obsidian graph view, lint passes. Graph exists but as markdown links, not JSON. Adopted here: graph.json = machine layer, wiki/ = human layer.

## [2026-10-09] measurement | Final battery numbers pushed
All batteries complete. 5 scoring methods unanimous: Electron 89.0 > Hybrid 85.5 > Extension+DC 66.0. Commits 66c4390, c9ccd3d, 79d14a8 pushed to fvegiard/vanish-measurement-lab.

## [2026-10-09] measurement | Portable launch re-extraction
Portable exe launch measured 11208/11193/11157 ms — re-extracts 189MB payload to %TEMP% every run. Informs decision-distribution.
## [2026-10-10] build | Vanish v0.1 built, measured, pushed
- App repo: github.com/fvegiard/vanish (1d31c33, 7 files)
- Measured: full scan 941ms (batched reg query, 7.4x), packaged launch 1.1-1.3s (9x vs portable), zip 155.3MB, asar 0.01MB
- Proof: fixture findings detected+deleted+verified; real-PC scan 0 (correct); zero-trace verified
- Fixed: recursive self-packing (asar 367.6->0.01MB), stale run-dir sweep at startup
- Lesson: agent must never surface UI on the user's desktop (esbuild ShellExecute popup hit)
- Distribution decided: dir target + zip (unzip-and-run), no installer, zero trace by construction

## [2026-10-09] lint | Wiki lint pass: orphan linked, index completed
Regenerated all 18 pages from graph.json (finding-fetch-errors page was missing). index.md now lists all 18 nodes; 2 stale summaries corrected (decision-distribution -> decided dir+zip, task-build-app -> done v0.1). Orphan task-cleanup-demo linked to component-core (cross_validates): the manual Copilot-cache cleanup is the ground truth the real-PC scan's 0-finding result was checked against.

## [2026-10-10] lint | Maintenance pass
- Ingested Karpathy style from nanochat commit log + living gists; 90-day freshness rule applied; fetch errors root-caused (events API control-test, REST over HTML, gh --slurp)
- Run by karpathy-loop dynamic workflow
