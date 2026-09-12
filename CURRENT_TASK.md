# Current Task

- Task id: M5.2-time-attack
- Goal: Playable seeded Time Attack alongside Road Race in the existing three-event run.
- Baseline commit: bd802257e8ba1b48f578a5c649f65d3ceb57d8e8 (master after PR #1).
- Status: IN_PROGRESS — baseline inspected; implementation not yet started.
- Baseline verification: clean checkout; 30/30 tests pass via `node --import tsx --test tests/*.test.ts`. The original tsx CLI failed to create its IPC socket (EPERM); no test failure. Dev server starts.
- Files expected to change: src/race.ts, src/run.ts, src/game.ts, new event/session modules, tests, package scripts and state documents.

## Acceptance criteria / planned checks

1. Seeded event schedule guarantees both Road Race and Time Attack in three events, with a Time Attack before a reward choice. Preserve the first Road Race and both M5.1 forks.
2. Time Attack has one physical player, ordered checkpoints, a countdown excluded from elapsed time, and fixed-step timing. Recovery holds for three seconds counted once. Pause and resolved events freeze timing/resources.
3. Gold/Silver/Bronze target times depend on seeded road geometry/profile and a separate versioned target stream; never adapt to owned upgrades or driving. Inclusive thresholds and a distinct over-target result are tested.
4. Gold maps to reward position 1, Silver to 3, Bronze/over-target to 6. Reuse existing reward rarity, +/-8 integrity and floor-1 rules. Missing the target alone never ends a run; zero integrity does. Preserve final-event semantics (no third reward/repair).
5. Shared simulation is separate from event-specific rules and presentation; avoid Time Attack conditionals in game.ts.
6. Italian pre-start/HUD/results explain target times, elapsed time, next achievable band and reward consequences. No fake solo standings.
7. Keep Flow, integrity, upgrades, branch profile/history and reset working across mixed events. Road Race remains six cars and retains actual finish order.
8. Run automatic tests, build, 1,000-seed stress and available browser suites. Record actual results and blockers only; M5.3 stays TODO.

## Resume / discrepancies

M5.1 is DONE. Old state docs name 40d0a78 as the validated gameplay hash; current baseline also includes hosting and PR #1 reviews. The claim of no GitHub remote/backup is stale. Review suggestions are not overrides of the master/DECISIONS: no initial upgrade, reward rebalance, asymmetric forks, boss, new Flow sources or seamless lifecycle in this task.
