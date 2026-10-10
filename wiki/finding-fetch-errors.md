# Never let an error behind: root-cause, don't patch

- **type:** finding
- **status:** lesson

## Data

- **rule:** user rule 2026-10-10: every error gets a found cause and a real fix, never a homemade little patch
- **cases:** ["events API [] -> control-test proved API fine, data genuinely absent; use repos API (pushed_at) as truth","GitHub HTML 'can't perform' -> blocks non-browser clients; REST API is the proper interface","parse->0 comments -> PowerShell pipe encoding + regex on ']' in bodies; fixed with gh api --slurp (tool feature)"]

## Links in

- [[task-build-app]] (produced)
