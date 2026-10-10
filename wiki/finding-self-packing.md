# electron-builder recursive self-packing footgun

- **type:** finding
- **status:** fixed

## Data

- **bug:** 'files': ['dist/**/*'] packs previous build's win-unpacked into app.asar (367.6MB)
- **fix:** explicit files list ['dist/main.js','dist/preload.js','package.json'] + delete stale win-unpacked before rebuild
- **result:** asar 0.01MB

## Links out

- [[finding-self-packing]] (produced)
