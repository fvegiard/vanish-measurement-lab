# Batched reg query /s = 7.4x scan speedup

- **type:** finding
- **status:** measured

## Data

- **before_ms:** 6926
- **after_ms:** 941
- **cause:** one recursive query per hive root vs one spawn per subkey (~7s)

## Links out

- [[finding-batched-reg]] (produced)
