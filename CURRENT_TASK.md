# Current Task

- Task id: M4-reward-build-slice
- Goal: Three-event run with seeded one-of-three rewards, rarity, temporary build hooks/settings, controller selection, victory and clean reset.
- Files changed: src/game.ts, src/input.ts, src/run.ts, src/race.ts, src/vehicle.ts, src/style.css, tests/, README and state files. Foundation committed earlier in src/events.ts and src/upgrades.ts.
- Acceptance criteria: Unique nonempty seeded rewards; placement-dependent rarity; explicit cursed downsides; distinct drift/impact/power mechanics; safely removable hooks; reset clears all resources/build/history; complete browser loop passes.
- Baseline commit: 48653d9 (M4 foundation).
- Status: DONE.
- Verification: 22 automated tests and build passed; final `npm run test:run` passed all three events, two reward choices (keyboard and simulated controller), recovery, lower-placement penalty, victory and clean reset. Total run 178.18s; final integrity 82.69; new run reset exactly to integrity 100, Flow 25, event 0 and no upgrades.
- Resume notes: Current step is complete. Airborne progress and missed-gate recovery fixes are covered by tests. See PROJECT_STATE/ROADMAP for M5; do not restart this completed task or infer the full MVP is finished.
