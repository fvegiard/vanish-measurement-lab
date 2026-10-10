# Agent must never surface UI on the user's desktop

- **type:** finding
- **status:** lesson

## Data

- **hit:** '& node_modules\esbuild\bin\esbuild' ShellExecuted the extensionless shim -> Windows 'choose an app' popup on user's desktop (2026-10-10)
- **rule:** every command runs on the user's machine; anything that can surface a dialog/window/sound is pollution = bug; resolve real .exe binaries only
- **karpathy:** the agent's value is being the disciplined one - 'LLMs don't get bored, don't forget'

## Links in

- [[task-build-app]] (produced)
