# Force-kill leaves run-dir; startup sweep self-heals

- **type:** finding
- **status:** fixed

## Data

- **bug:** Stop-Process -Force skips will-quit -> vanish-run-<pid> dir left in %TEMP%
- **fix:** sweepStaleRuns() at startup: rm vanish-run-* dirs whose PID is dead
- **verified:** STALE-DIRS-AFTER: 0

## Links out

- [[finding-stale-sweep]] (produced)
