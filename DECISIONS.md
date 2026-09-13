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

- 2026-09-11: User authorized the next roadmap tasks. The previous M4-only stopping instruction is fulfilled and superseded. Start M5.1 with physical split/merge and next-event route profiles; M5 remains IN_PROGRESS until distinct event types and seamless continuation are implemented.

- M5.1: one 300 m split/merge in the first two campaign races. Two equal-length 12 m arms share forward checkpoint stationing and select the NEXT event road profile (technical or speed), not an immediate change to the current race. The final event has no redundant choice.
- Topology belongs to a per-vehicle RouteCursor. A choice commits from physical position after the fork mouth, stays locked through recovery and cannot be changed by another car. Both arms are streamed together; the central island is a real gap with inner barriers, not an invisible driveable shortcut.
- Preserve road-v2 in standalone modes. Campaign fork/profile generation uses road-v3; profile also participates in the next-event seed. No distinct event-type or seamless-transition claim is made for M5.1.

- 2026-09-11: The documentation checkpoint is `54a36cd`; M5.2 Time Attack is the next implementation target. Existing browser regressions and the M5.1 full-run path remain release gates for the next slice.
- 2026-09-11: Install the official `playwright` Codex skill for browser-test maintenance. Install `hermes-agent` from `NousResearch/hermes-agent` as an optional orchestration aid; it is not a gameplay dependency and must not be treated as evidence that Hermes is configured or running.
- M5.2: preserve three events and two rewards. Event 1 is Road Race, event 2 Time Attack, event 3 a seeded 50/50 selection (`event-types-v1`). This guarantees both types and a Time Attack reward in every short run. M5.1 branches still choose the NEXT road profile, independently of event type.
- Time Attack has only the player. It shares fixed-step physics, ordered gates, countdown and the existing three-second recovery hold with Road Race. Countdown/pause do not consume event time; recovery does, once. Going beyond Bronze is not a run loss: finish for reduced rewards. Integrity zero is still run over.
- Target model v1: integrate two-metre steps from route.start to the finish using route.speedAt, add 4 s for launch, multiply by 1.08 and seeded variation [0.98,1.02). Round Gold up to centiseconds; Silver = ceil(Gold*1.16*100)/100, Bronze = ceil(Gold*1.35*100)/100. Thresholds are inclusive. Equal-length M5.1 arms share stationing; profile affects actual generated road and target stream. Targets never adapt to owned upgrades, resources or driving.
- Time Attack Gold maps to reward placement 1, Silver to 3, Bronze/over-target to 6. Reuse rewards-v1 and all existing rarity/+8 repair/-8 penalty/floor-1 rules. The final event keeps the existing no-reward/no-between-event-repair behavior. Store discriminated results so the displayed band is not a fake race position.
- M5.2 extracts shared PointToPoint simulation plus distinct Road Race/TimeAttack classes and an event factory/presentation module; it does not implement M5.3 world continuity or the unrelated rebalance/content suggestions from PR #1 reviews.
- M5.2 remains IN_PROGRESS until browser validation succeeds. Automatic physical tests are evidence of drivability, not a replacement for the master-spec browser gate or physical-controller playtesting.

- 2026-09-13: M5.2 browser validation succeeded on the local Windows host with default headless Chrome 153. All browser regressions and normal/over-target mixed campaigns passed; screenshots were inspected. M5.2 is now DONE locally on the `b501508` gameplay baseline. The next micro-milestone is M5.3; physical-controller/human-balance/performance checks remain distinct. See `BROWSER_VALIDATION.md` for evidence. The existing remote PR is unchanged by this local checkpoint.

- M5.3 (`world-connect-v1`): retain one Rapier world, player body, renderer/camera and RoadStream throughout a campaign. Append each next independently seeded road at the previous exit socket, with global station/chunk IDs. Preserve road-v2/road-v3 local geometry and time-targets-v1; only world placement changes.
- Rewards stop the player in place. After selection, a roughly 145 m physical transfer uses the outgoing finish straight and next launch module. Crossing the next starting gate contiguously stops the car for a three-second countdown without moving its pose; five rivals are placed safely ahead for Road Race, none for Time Attack. Transfer time is excluded from event times and the sum of competitive results.
- Finished bodies become kinematic and stop running upgrade/vehicle ticks while rivals finish. On reward resume, explicitly clear Rapier's retained dynamic velocity. Keep resources and update derived stats, collider mass and removable hooks on the same player. Dispose old rival bodies/models; stream prior road resources away by distance. New runs dispose the stream/world and detach all hooks.
- Transfer uses normal driving resources/damage and three-second recovery holds. Pause freezes simulation. A transfer wreck ends the run without fabricating a competitive result or extra reward. Recovery/statistics now belong to the persistent player for the whole run.
