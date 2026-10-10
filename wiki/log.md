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