# Current Task

- Task id: M2.1-road-data
- Goal: Authored module metadata, socket validation, isolated seed streams and bounded deterministic assembly.
- Files expected to change: src/road/, tests/road.test.ts, tests/stress.ts, state files.
- Acceptance criteria: Identical seeds reproduce route; different seeds vary; invalid sockets/modules rejected; stress generation terminates and creates connected drivable finish paths.
- Baseline commit: 918d350
- Status: DONE
- Resume notes: User accepted the starting prototype and explicitly authorized continuation. Physical controller validation remains documented but does not block this authorized work. Baseline 7 tests pass. Preserve the fixed driving lab for regression checks.
