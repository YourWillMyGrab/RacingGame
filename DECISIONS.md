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

- M4 is a short three-event coastal run with two upgrade selections. It must not be described as completion of the three-biome MVP.
- Route seeds derive from the full root seed plus event index using an independent stream; long user seeds must not truncate away the event suffix and repeat roads.
- Reward rarity depends on placement; choices are unique and exclude already owned upgrades. Lower placements offer Common/Uncommon rewards, apply an 8-integrity penalty with a floor of 1; top-three finishers repair up to 8.
- Vehicle hooks are per-instance and unsubscribe before the next event/new run. Derived settings always start from DEFAULT_TUNING; no permanent stat progression or mutation of global defaults.
- The run preserves integrity/Flow between events and clears all build/history/resources on a new run. Countdown locks resource values until driving starts.
- User's latest instruction limits this pass to finishing the current step; after M4 validation and Git checkpoint, do not begin M5 in the same pass.

- User feedback pass after M4: prioritize braking difficulty, useful base-car Flow, a real main menu and Italian text before M5. The road-v2 stream intentionally changes old seed geometry; reproducibility is within a generator version.
- Technical modules recur every three modules with an alignment/release section, narrow to 12 m and recommend 50 km/h. Tire lateral acceleration is bounded; AI uses an advance braking envelope. These remain chicanes/esses within the forward corridor, not hairpins or forks.
- Base Flow rewards controlled drift, clean corners, reachable speed and clean drift exits; stationary/held-handbrake input earns none. A drift-exit bonus can outweigh concurrent nitro consumption. Flow stays the resource name; displayed action/rarity labels use Italian.
- The main menu owns mode discovery, help and persisted view/resolution preferences. Audio controls are deferred until audio exists. No permanent run progression is introduced.
