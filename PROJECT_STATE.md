# Project State

- Current task: user driving refinement on `master`, following M5.3; DONE on 2026-09-14.
- Git baseline: `a4549fa`. Pulled origin/master and merged local M5.2/M5.3 and the remote gameplay-review branch. No branches remain outside master at integration time. No push/deployment requested.
- M5 remains complete; M6 has not started. Current validation: see `DRIVING_REFINEMENT.md`.

## Current behavior

- Physics remains fixed at 60 Hz. Player/rival rendering interpolates between physics snapshots, with wrap-safe heading interpolation and recovery resets. Chase heading is damped independently of steering; static scenery uses instancing and runtime streaming loads at most one new chunk per frame.
- Standard controller input has a continuous dead zone and a gentle centre curve. Normal yaw respects available lateral grip, with stronger tyre recovery. A deliberate handbrake input retains a brief drift/catch window, Flow and upgrade hooks.
- `road-v4` adds 210–240 m slalom/double-esse/chicane modules and seeded 620 m forks. Left has several direction changes and a longer physical line; right is a broad express arc. Both keep their next-event profile choice and independent recovery paths. Existing codes generate new layouts in this version.
- One world, body and stream persist for all events. Before a Time Attack, the result leads directly to perk selection; selection pauses safely, confirmation restores finish momentum, and the next portal starts timing without stopping or countdown. Before a Road Race, results/rewards and a stopped grid countdown remain.
- Transfers are untimed, support pause/recovery/damage and apply upgrades in place. Event checkpoints, finish freeze, failure, resources and reset semantics remain covered.

## Validation and limits

Historical validation: `M5_3_VALIDATION.md`, `BROWSER_VALIDATION.md`. Current evidence and remaining checks: `DRIVING_REFINEMENT.md`, `CURRENT_TASK.md`.

Still a three-event coastal slice. Physical controller feel and frame rates on the user's hardware require human playtesting. AI uses a simple passing heuristic. The shared Rapier/Three bundle remains about 3.4 MB; additional biomes, audio, bosses and broader content are future work.
