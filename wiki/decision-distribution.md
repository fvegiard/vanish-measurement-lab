# Dir target + zip wins (unzip-and-run)

- **type:** decision
- **status:** decided

## Data

- **choice:** electron-builder dir target -> zip 155.3MB
- **why:** no installer traces, no 11.2s re-extraction (portable's measured flaw), no uninstall entry, zero trace by construction
- **measured:** launch from extracted copy 1099-1318ms vs portable 11.2s (9x)

## Links out

- [[decision-distribution]] (depends_on)

## Links in

- [[decision-distribution]] (informed_by)
