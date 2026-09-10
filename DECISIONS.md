# Decisions

- The authoritative design brief is `ASTRA_RACING_ROGUELIKE_MASTER.md`.
- The initial implementation follows a vertical-slice approach, starting with a fixed test track and driving feel before procedural generation.
- Target stack: TypeScript, Vite, Three.js, and a custom arcade/simcade vehicle controller.
- Run-critical randomness must use deterministic seeded streams; `Math.random()` is not allowed for gameplay generation.
- There is one base player car in the MVP; build identity comes from temporary run upgrades.

- Rapier 3D compatibility/WASM package owns collisions; vehicle handling is a custom fixed-step controller. Local Git does not require a remote. Dependencies are exact-pinned in package-lock.json.

- The M1 circuit is a fixed oval, not procedural assembly. Its mathematical sampling must not be presented as completion of M2.
- Suspension uses four downward Rapier rays; yaw is physical, pitch/roll are locked for arcade stability and represented visually. Elevation validation can revise this explicitly when introduced.
- Physics advances at 60 Hz with a bounded real-time accumulator; input actions (pause/recover) use events so short keypresses cannot be missed between frames.
- No physical-controller or subjective fun claim is inferred from synthetic Gamepad API tests.

- 2026-09-10: User accepted the initial prototype and authorized proceeding. M1 handling gate is accepted for continued development; physical-controller testing remains a known limitation, not an approval blocker. Preserve the fixed lab while adding modular roads.

- M3 validation note: A single-race result screen reports actual recorded finishes and labels remaining racers IN PISTA, then FUORI TEMPO after 30 seconds. It never invents a finishing time. Finished cars keep road collision but no longer block other racers.
- M3 recovery is a physical three-second hold already included in race elapsed time; the solo/lab timer still uses its original added-time penalty. Do not count both penalties in a race.
