# Current Task

- Task id: M2.2-streamed-driving
- Goal: Drive the seeded modules with streamed geometry/colliders, road-aware recovery, seed controls and debug view.
- Files expected to change: src/road/stream.ts, src/vehicle.ts, src/game.ts, src/main.ts, src/lab.ts, tests/, state files.
- Acceptance criteria: Original lab tests still pass; module joins/elevation can be driven; colliders/meshes unload and reload correctly; seed restart reproduces route; browser playtest passes.
- Baseline commit: latest feat: add validated seeded road module assembly
- Status: DONE
- Resume notes: Data generation validated across 1000 seeds. Preserve ?lab=1 regression mode. Integrate into a point-to-point road before AI racing.
