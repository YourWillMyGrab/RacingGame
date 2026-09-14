# Project State

- Current task: M6.1 Costa del Faro, 2026-09-14. DONE locally: implementation, automatic/build/stress and browser gates complete.
- Git baseline: clean master at d185ecc, identical to origin/master after git fetch origin. No push/deployment performed.
- M5 and driving refinement remain complete. M6 is IN_PROGRESS; M6.1 is DONE and delivers its first playable biome micro milestone.

## Current behavior

- Fixed 60 Hz physics, interpolated player/rival poses and damped camera heading remain. Progressive controller dead zone/curve, planted grip, deliberate drift, Flow/upgrades and recovery are unchanged.
- road-v4 retains identical road layouts, compound technical sectors and seeded asymmetric 620 m forks. Both independent routes/recovery paths and next-event profiles remain.
- Costa del Faro adds a maritime palette, faceted coastal islets, salt-white harbour huts, striped lighthouses, warm barriers, warning signs and windsocks. Scenery stays instanced and streamed; a fixed 64-particle pool handles spray, drift, boost and impacts.
- coast-wind-v1 uses an independent seeded stream. Local zone offsets remain attached to modules through global station/heading placement. A real 4–5 m/s² lateral force acts on supported cars inside signed corridors, with ramped boundaries. Starts expose the road well after the portal; forks, tunnels, technical sectors and finishes stay clear.
- FARO replaces one standard Road Race rival: recognisable amber body/roof lamp, conservative technical line, clear-straight attacks up to 2.5 s and 5 s cooldown. Actual physics/Flow/checkpoints determine its result. Time Attack remains solo.
- Optional synthesized engine/wind/boost/impact audio unlocks on a browser gesture, persists mute preference, and silences outside active driving. No audio files or network requests are required.
- One world, body and stream persist across all events. Rewards pause safely; Time Attack restores finish momentum and starts timing at the next portal; Road Race retains a stopped grid countdown. Transfers, resources, in-place builds and recovery/failure/reset semantics remain covered.

## Validation and limits

Current evidence: M6_VALIDATION.md and CURRENT_TASK.md. All 50 automatic tests, build, 1,000-road/1,000-campaign stress, browser biome/menu/input, standalone race/solo and both full mixed campaigns pass. Historical driving/continuity gates remain in DRIVING_REFINEMENT.md and M5_3_VALIDATION.md.

Still a three-event, one-biome slice. Physical controller feel, artistic/audio mix preference and hardware frame rates require human playtesting. FARO is a special competitor, not a separate scripted boss encounter. The shared Rapier/Three bundle remains about 3.4 MB; broader biome content, final assets and startup optimisation remain later work.
