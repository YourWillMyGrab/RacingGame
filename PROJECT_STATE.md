# Project State

- Current stable milestone: M5 in progress. M5.1 remains DONE and browser-validated.
- Current work: M5.2 Time Attack implemented and automatically verified; browser gate pending. M5.2 is not yet DONE.
- Last automatically verified implementation commit: 3613864c93b730739864968f0d0b9ea7fcba53a4 on codex/m5-2-time-attack. Its tree exactly matches the tested local tree; browser validation remains pending.
- Starting commit: bd802257e8ba1b48f578a5c649f65d3ceb57d8e8, master after PR #1. The old 40d0a78 hash identifies the validated M5.1 gameplay, not the current repository head.
- Last fully browser-validated gameplay checkpoint: 40d0a78, recorded by bfba80c; subsequent baseline commits add hosting/reviews. See CURRENT_TASK.md for current implementation checkpoint and exact resume instructions.

## Implemented

- Three-event coastal run: Road Race, Time Attack, then a seeded choice of either mode (`event-types-v1`). First two events retain their M5.1 physical forks and reward choices.
- Time Attack is one player against the clock; no rivals or invented standings. Seeded, route/profile-aware Gold/Silver/Bronze targets are fixed before driving and independent of upgrades (`time-targets-v1`). Late completion continues with the reduced reward tier; wreck ends the run.
- Event results retain type, actual time and timed band/targets. Gold uses placement-1 rewards; Silver placement-3; Bronze/over-target placement-6. Existing repair/penalty, Flow carry, unique offers and final-event rules are retained.
- Shared PointToPoint simulation owns countdown, gates, recovery and physical cars. Road Race and TimeAttack are separate event classes; factory and Italian event presentation live in src/event/. game.ts consumes the common contract.
- Road-v2 standalone geometry and road-v3 campaign geometry/profile streams are unchanged. Reproducibility includes version, seed and player route choices. Fresh runs clear build/results/route history and restore 100 integrity/25 Flow.

## Verified in this task

- 37/37 automatic tests pass, including original Road Race/fork tests, timed boundaries, invalid/wreck/late results, reward tiers, resource/reset integration and physical Time Attacks on both arms with recovery and boost.
- Physical simulations: technical/left 87.67 s, Silver; speed/right 90.02 s, Silver. One recovery each. These are Rapier simulations, not browser runs or human balance evidence.
- TypeScript check and production build pass; shared chunk remains about 3.40 MB / 1.23 MB gzip.
- Stress passes: 1,000 road seeds / 32,000 modules / 1,000 forks, plus 1,000 mixed campaigns / 3,000 events / 1,489 Time Attacks with matching geometry, targets, results, offers and reset.
- Browser run/menu attempts blocked before gameplay: no system Chrome; Playwright download timed out; alternate Chromium 153 crashed with SIGSEGV on an empty page. Browser/lap/modular/race suites were not rerun because the same runtime cannot launch. No new screenshot inspection or browser success is claimed.

## Resume

1. Use working desktop Chrome/Chromium, run npm ci and npm run dev.
2. Run npm run test:run, and TIME_ATTACK_OVERRUN=1 npm run test:run; inspect Time Attack HUD/result and fork/reward screenshots. Run menu and standalone browser regressions (commands below).
3. Repair any failures, rerun relevant automatic checks, then mark M5.2 DONE and commit a fully validated checkpoint.
4. Only after that begin M5.3 continuous event/world lifecycle. No M5.3 implementation is included here.

Commands: npm test; npm run build; npm run test:stress -- 1000; npm run dev; npm run test:menu; npm run test:run; npm run test:browser; npm run test:lap; npm run test:modular; npm run test:race. Browser tests default to system Chrome; BROWSER_CONFIG may point to a Playwright launch-options JSON file. RUN_SEED selects a different full-run browser seed.

Runtime: / menu/campaign; /?race=1 standalone Road Race; /?solo=1 practice; /?lab=1 fixed lab. GitHub origin is configured. Pages deployment is configured for master in .github/workflows/deploy-pages.yml; this feature branch does not deploy or merge automatically.

Incomplete: browser validation of M5.2, seamless continuation, arbitrary branching/shortcuts, further biomes, boss/hazards/audio, full 20–30 minute run and final art/performance polish. Physical-controller testing remains outstanding.
