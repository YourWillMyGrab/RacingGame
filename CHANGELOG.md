# Changelog

## 2026-09-10

- Created the repository documentation and interruption-safe project state baseline.

- M0: Added buildable Vite/TypeScript/Three.js app, Rapier collision world, fixed track, instanced scenery, input abstraction and debug overlay. Build and Chrome smoke check passed.

## First driving slice — 2026-09-10

- Implemented fixed-step custom Rapier vehicle with ray suspension, grip, steering, handbrake drift, braking/reverse and boost.
- Added controlled-drift Flow generation, integrity damage, recovery penalty and clean session restart.
- Added original car geometry, chase camera, lap timer/counter, HUD, title/pause/wreck screens and live tuning.
- Fixed short R/Esc presses missed between animation frames; single actions now use keydown events.
- Added 7 physics/track regression tests and reproducible Chrome keyboard/gamepad/lap checks. Completed a full lap with no damage.
- Reviewed project Markdown, corrected state/blocker descriptions and documented startup and limitations.

- M2.1: Added 11 authored road profiles, independent deterministic random streams, socket validation and reproducible 1,000-seed stress command.

- M2.2: Connected authored geometry to drivable Rapier trimeshes, streamed chunks/colliders, tunnel/bridge scenery, seed entry/replay, route progress and finish. Preserved original Driving Lab. Full 2,860m Chrome test passed at 100 integrity, with 21 chunks unloaded. Added occupied-recovery regression.

- M3: Added five physical AI rivals, seeded personalities and passing behavior, locked countdown, ordered checkpoints, finishing times, three-second recovery holds and race results/restart. 15 tests and full Chrome race passed (1st, 107.30s, 100 integrity).

- Fixed result-screen stop incorrectly counting as collision damage; finished racers no longer receive impact evaluation. Added post-finish integrity regression.

- M4 foundation: added typed removable gameplay hooks, 14 data-defined upgrades, seeded placement-weighted rewards, three-event temporary run state and build/reset regression tests. UI connection is next.

## M4 completed — 2026-09-10

- Connected the 14-upgrade pool and temporary build hooks to a three-event coastal run with one-of-three reward screens, placement-based rarity/repair/penalty and resource carryover.
- Added keyboard and controller reward navigation, final victory, and clean new-run reset. Preserved standalone race, solo road and fixed lab modes.
- Derived separate event road seeds from the full root seed; long seed input no longer risks erasing event identity.
- Fixed countdown resource decay, airborne road progress and recovery past missed checkpoints. Added explicit missed-checkpoint HUD guidance.
- Final verification: 22 automated tests, production build and full Chrome three-event/reward/victory/reset test pass. Tested 1st/5th/1st placements, both reward input methods and recovery. Final run 178.18s, integrity 82.69; new run has zero upgrades, integrity 100 and Flow 25.
