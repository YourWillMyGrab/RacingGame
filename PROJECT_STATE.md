# Project State

- Current stable milestone: M5 in progress; M5.1 physical route choice and M5.2 Time Attack are DONE.
- Last fully validated gameplay baseline: `b501508` on `codex/m5-2-browser-validation`, tested on 2026-09-13. It integrates `3613864` (Time Attack implementation), remote master `bd80225` and preserved local documentation `fff275d`.
- Current checkpoint: M5.2 browser gate completed locally; see `CURRENT_TASK.md` and `BROWSER_VALIDATION.md`. No gameplay changes were needed during validation.
- Next task: M5.3 continuous event/world lifecycle. No M5.3 implementation is included.

## Implemented

- Three-event coastal run: Road Race, Time Attack, then a seeded choice of either mode (`event-types-v1`). First two events retain physical forks and reward choices.
- Time Attack uses one player, ordered gates and fixed seeded route/profile-aware Gold/Silver/Bronze targets, independent of upgrades (`time-targets-v1`). Countdown/pause do not consume event time; recovery counts once. Exceeding Bronze allows completion with reduced rewards; zero integrity ends the run.
- Discriminated results retain event type, actual time and timed band/targets. Gold uses placement-1 rewards; Silver placement-3; Bronze/over-target placement-6. Existing repair/penalty, Flow carry, unique offers and final-event rules remain.
- PointToPoint owns shared physical simulation; Road Race and TimeAttack have separate rules with factory/Italian presentation in `src/event/`.
- Standalone road-v2 and campaign road-v3 geometry/profile streams are unchanged. Reproducibility includes version, seed and route choices. New runs clear upgrades/results/route history and restore balanced profile, 100 integrity and 25 Flow.

## Verified on 2026-09-13

- 37/37 automatic tests; TypeScript/Vite build; 1,000-road stress (32,000 modules / 1,000 forks), plus 1,000 mixed campaigns (3,000 events / 1,489 Time Attacks).
- Browser menu, input, lab lap, modular route, standalone six-car race, normal mixed campaign and over-target mixed campaign all passed on Windows / Chrome 153.0.8010.36 with default headless options.
- Normal campaign: 89.50 s Road Race, 90.98 s Silver Time Attack, 102.03 s Gold finale; 282.52 s total. Both forks/recoveries, technical/speed profiles, keyboard/controller rewards, victory and reset passed.
- Over-target campaign: event 2 finished at 210.28 s, applied reduced rewards and -8 integrity, then completed the final event and clean reset; 401.82 s total. No page exceptions.
- Standalone race: first place, 136.52 s, 100 integrity. Solo road: 136.10 s, 100 integrity, 21 chunks unloaded. Lab lap: 34.53 s, 100 integrity.
- Inspected Time Attack HUD/countdown/results, forks, reward screens, final victory and narrow menu. Exact evidence and limits: `BROWSER_VALIDATION.md`.

## Resume and limitations

Read the master resume protocol, inspect Git status/diff and start only M5.3 with explicit lifecycle/state-preservation checks. Preserve all existing mixed-event and fork regressions.

Commands: `npm test`; `npm run build`; `npm run test:stress -- 1000`; `npm run dev`; `npm run test:menu`; `npm run test:run`; `npm run test:browser`; `npm run test:lap`; `npm run test:modular`; `npm run test:race`. Browser configuration and the PowerShell over-target command are in `DEVELOPMENT.md`.

Runtime: `/` menu/campaign; `/?race=1` standalone Road Race; `/?solo=1` practice; `/?lab=1` fixed lab. GitHub origin and Pages deployment for master are configured. This validation checkpoint is local; it neither updates PR #2 nor deploys the feature branch.

Incomplete: seamless continuation, arbitrary branches/shortcuts, more biomes, bosses/hazards/audio, full 20–30 minute run and art/performance polish. Physical-controller testing and human balance remain outstanding. The shared bundle is still about 3.40 MB / 1.23 MB gzip, and browser suites remain outside Pages CI.
