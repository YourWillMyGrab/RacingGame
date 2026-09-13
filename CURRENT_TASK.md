# Current Task

- Task id: M5.3-world-continuity
- Goal: preserve world, streamed road, player body and camera across rewards; drive from each finish to the next event on connected seeded road.
- Status: IN_PROGRESS — 2026-09-13.
- Baseline: `6459ea6`; fetched origin and merged origin/master (already included). Clean working tree; 37/37 baseline tests passed.
- Branch: `codex/m5-3-world-continuity`.
- Expected files: road connection, event lifecycle, vehicle/build handling, game coordinator, regression/browser tests and state documentation.

## Acceptance criteria

1. One Rapier world, player/body and RoadStream per run. Rewards preserve player pose and nearby road resources; no camera reset or loading screen.
2. Next seeded road connects at matching sockets. Drive the transfer to the next starting gate, then a fresh countdown and ordered checkpoints. Transfer is excluded from competitive time; pause freezes it.
3. Preserve integrity/Flow/builds and branch-derived profiles. Update stats and physical mass on the existing body without accumulating hooks. Freeze finished resources/pose during results/rewards.
4. Retire old rivals and stream old road away; spawn the correct next participants. Recovery crosses seams safely; transfer failure and new-run reset leave no stale state.
5. Physical/lifecycle regressions, build, 1,000-seed stress and browser mixed campaigns (both finales, normal/over-target), plus standalone/input/menu regressions pass. Inspect transition/reward screenshots.
6. Update state files and commit validated M5.3 only. M6 is out of scope.
