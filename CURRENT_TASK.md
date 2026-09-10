# Current Task

- Task id: M1-fixed-track-driving
- Goal: Playable custom vehicle on a fixed track with drift, Flow/boost, recovery, chase camera and keyboard/gamepad abstraction.
- Files changed: src/config.ts, src/vehicle.ts, src/car.ts, src/input.ts, src/main.ts, src/style.css, tests/, package.json, README.md, DOC_REVIEW.md, recovery state files.
- Acceptance criteria: Build and physics tests pass; actual browser controls exercised; collision, boost, pause, recovery and restart validated. Physical-controller and subjective feel acceptance explicitly remain outside automated validation.
- Baseline commit: f715220 (M0); task checkpoint fc35046.
- Status: DONE — implementation and automated validation. Milestone 1 acceptance gate remains IN_PROGRESS.
- Resume notes: All 7 unit/physics tests, browser controls and complete-lap checks passed. A quick-key bug in Esc/R was found and fixed. Full lap took 33.53s with 100 integrity. Physical controller not tested. Next task is handling acceptance/tuning; no procedural generation started.
