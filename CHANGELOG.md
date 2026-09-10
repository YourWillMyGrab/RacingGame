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
