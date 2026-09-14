# Current Task

- Task: M6.1 — Costa del Faro, the first dressed biome.
- Status: DONE — local implementation and validation complete, 2026-09-14.
- Baseline: clean master / refreshed origin/master at d185ecc (2026-09-14). Baseline 45/45 tests and production build passed.
- Micro milestone: maritime rock/islet/lighthouse scenery, signed physical crosswind, FARO special rival with explicit attack/cooldown tactics, optional engine/wind/boost/impact audio and bounded spray/boost/impact VFX.
- Preserve: fixed 60 Hz physics, pose interpolation, progressive pad input, safe recovery, road-v4 geometry/seeds, both physical fork arms, Time Attack and one continuous world/body/stream across rewards and transfers. Lab stays a neutral tuning environment.
- Acceptance: seeded hazards survive connected placement and streaming; measured physical drift matches signs; FARO spends Flow and finishes reproducibly; audio/VFX stop during pause/countdown/results; browser modes, two mixed campaigns, tests/build/stress, visual inspection and documentation.
- No push or deployment. Changes remain local and reviewable.

## Evidence

- 50/50 automatic tests and build pass, including all 45 inherited regressions.
- Crosswind causes approximately ±0.91 m lateral displacement in 3 s; calm control 0 m; recovery and airborne exclusion pass.
- FARO: five attacks, 279 physical boost steps, finish 118.13 s, 100 integrity, identical in two runs.
- 1,000 roads / 1,000 connected mixed campaigns pass stress validation.
- Browser biome, menu/all modes, keyboard/simulated-controller smoke, full race, full solo, normal campaign and over-target campaign with Road Race finale pass. Final report: M6_VALIDATION.md.
- Both full campaigns preserve world/body identity across branches, rewards and transfers and pass victory/reset. Normal: 362.98 s / 100 integrity; over-target: 525.57 s / 80.39 integrity.
- Final audio polish silences pause/background directly. Screenshots inspected; 50 tests, production build and whitespace check pass.
- M6.1 is complete; subsequent M6 work is encounter variety and human art/audio/balance playtesting, not an unfinished implementation gate.
