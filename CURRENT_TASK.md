# Current Task

- Task id: M5.2-time-attack
- Goal: Playable seeded Time Attack alongside Road Race in the existing three-event run.
- Baseline commit: bd802257e8ba1b48f578a5c649f65d3ceb57d8e8 (master after PR #1).
- Status: IN_PROGRESS — implementation and automatic validation complete; browser validation blocked in this environment.
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

## Implementation checkpoint

- Added event/point-to-point.ts (shared physical lifecycle), event/time-attack.ts, event/rules.ts and event/session.ts (factory + Italian presentation). Road Race remains a six-car subclass; Time Attack uses one car.
- Run.finish now accepts a discriminated event result. Reward settlement is unchanged; results retain event kind, actual time and Time Attack band/targets.
- Verified so far: 37/37 automatic tests, TypeScript/Vite build, 1,000 road seeds / 32,000 modules / 1,000 forks plus 1,000 mixed campaigns / 3,000 events / 1,489 Time Attacks with matching targets/rewards/reset.
- Physical Time Attack simulations passed both profiles/arms with one recovery and Flow/nitro: technical 87.67 s (Silver), speed 90.02 s (Silver). These are Rapier simulations, not browser playtests.
- Browser status (2026-09-12): Google Chrome 153 now launches. A short smoke reached menu/title/driving with six Road Race cars and no page exceptions. The standalone `test:race` timed out before 450 m after 45 s. `test:menu` produced desktop/mobile menu and braking-warning screenshots, then was stopped during its long virtual-time driving section; no pass is claimed. Full campaign and over-target browser runs still need completion and screenshot inspection. Software-rendered headless Chrome advances gameplay slowly in this environment.
- tests/browser.mjs supports BROWSER_CONFIG pointing to a Playwright launch-options JSON file, defaulting to system Chrome. Updated test:run asserts mixed events, target HUD, pause/countdown resources, results, rewards and reset. TIME_ATTACK_OVERRUN=1 additionally exercises late completion; RUN_SEED overrides the test seed. These additions are not claimed browser-validated.
- Resume: complete the Road Race/menu browser checks and the mixed/over-target campaign browser runs on a faster or hardware-accelerated Chrome host; inspect Time Attack HUD/results screenshots and repair any failures. Only then mark M5.2 DONE and record a fully browser-validated checkpoint. Do not start M5.3 yet.

- Published implementation checkpoint: `3613864c93b730739864968f0d0b9ea7fcba53a4` on `codex/m5-2-time-attack`; its Git tree exactly matches the locally tested tree `358ded106c5356ab377fcce0ac2d0927e670d864`. Browser gate remains pending.
