# Self-deleting native host

- **type:** component
- **status:** probe-proven

## Data

- **pattern:** register HKCU -> work -> unregister -> self-delete = zero trace
- **evidence:** probe Test B: real file deleted, verified gone

## Links in

- [[component-native-host]] (enables)
