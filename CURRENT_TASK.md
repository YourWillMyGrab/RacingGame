# Current Task

- Task id: M4-reward-build-slice
- Goal: A short three-event run with seeded one-of-three rewards, rarity, temporary build modifiers/hooks and clean reset.
- Files expected to change: src/upgrades.ts, src/run.ts, src/events.ts, src/vehicle.ts, src/game.ts, src/input.ts, tests/, state files.
- Acceptance criteria: No empty/duplicate reward choices; placement affects rarity; cursed effects have downsides; three distinct build directions; event hooks detach safely; run reset clears all effects; browser reward/continue/new-run loop passes.
- Baseline commit: latest fix: preserve integrity after crossing the finish (M3 stable).
- Status: IN_PROGRESS
- Resume notes: M3 race/playtest passed; finish-stop damage fixed and regression-tested. M4 is a short coastal slice, not the full three-biome MVP; physical forks/seamless events remain M5.

- Checkpoint: M4 data and hook layer implemented; 19 tests and build passed. UI integration next.
