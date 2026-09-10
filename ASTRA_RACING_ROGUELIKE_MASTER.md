# ASTRA MASTER BUILD SPEC
## Project Codename: VELOCITY ROGUE

> This file is the authoritative build brief for Astra.
> Build a real, polished, playable browser game — not a static 3D scene, tech demo, or collection of disconnected systems.

---

# 0. PRIMARY MANDATE

Create an original **3D procedural racing roguelike** for desktop browsers.

The core fantasy is:

> **Drive through a seamless world that rebuilds itself every run, physically choose routes at high speed, defeat rival racers, and turn one ordinary car into a ridiculous synergistic machine before the run kills you.**

The game must combine:

- weighty arcade/simcade driving;
- procedural roads assembled from authored modular pieces;
- seamless biome transitions;
- six-car races;
- physical route choices and forks;
- strong drifting and risk/reward driving;
- ramming and contact racing;
- roguelike upgrades with extreme synergies;
- rarity tiers and cursed upgrades;
- boss races;
- seeded deterministic runs;
- no permanent stat progression between runs.

A complete run should target **20–30 minutes**.

The game is **gameplay-first**. Do not spend the task building a visually impressive scene while leaving the driving loop incomplete.

---

# 1. NON-NEGOTIABLE DESIGN PILLARS

## 1.1 Driving must feel good before content expands

The player must immediately feel:

- vehicle mass;
- acceleration and braking;
- lateral grip;
- controllable loss of grip;
- suspension/body response;
- speed;
- impact force;
- useful drifting;
- readable airborne behavior;
- satisfying recovery after landing.

The car should be approachable within seconds but have enough depth that a skilled player can:

- trail brake;
- control slides;
- optimize racing lines;
- use weight transfer;
- chain drift into boost;
- deliberately ram opponents;
- exploit shortcuts;
- carry speed through difficult procedural sections.

Do not implement full simulation physics. Favor a polished arcade/simcade model.

## 1.2 The roguelike layer must change how the player drives

Upgrades must not be mostly invisible `+5%` stat increases.

A good upgrade changes decisions.

Examples:

- drifting becomes a primary boost engine;
- ramming becomes a viable build;
- low integrity increases power;
- boost can overheat the engine for extreme top speed;
- landing from jumps creates shockwaves;
- near misses restore boost;
- heavy cars gain impact damage but lose agility;
- perfect drifts create temporary grip;
- boost can consume integrity instead of energy;
- chained overtakes increase acceleration;
- cursed upgrades provide huge upside with a dangerous rule.

The player should be capable of creating broken, surprising, highly synergistic builds by the final biome.

## 1.3 Procedural generation must create meaningful routes

Procedural generation is not decorative.

The road network must affect gameplay through:

- forks;
- alternate routes;
- shortcuts;
- elevation;
- jumps;
- tunnels;
- bridges;
- hairpins;
- high-speed sweepers;
- narrow technical sectors;
- hazards;
- optional high-risk/high-reward lines;
- biome transitions;
- route-specific events and rewards.

## 1.4 Runs must remain readable

Random generation must never produce unfair or impossible tracks.

Procedural variety is subordinate to:

1. drivability;
2. readability;
3. racing line quality;
4. AI compatibility;
5. performance.

## 1.5 Contact racing is intentional

Cars may collide and ram each other.

Contact must feel physical and useful without turning the game into a weapon-combat racer.

There are **no guns, missiles, shells, or conventional weapons** in the core game.

The player's car itself is the weapon.

---

# 2. TARGET PLATFORM AND TECH STACK

## 2.1 Platform

Primary target:

- desktop browser;
- keyboard;
- gamepad.

Mobile is not an MVP target.

## 2.2 Recommended stack

Use:

- **TypeScript**
- **Vite**
- **Three.js**
- **Rapier 3D / WASM** for collision and rigid-body support
- custom arcade vehicle controller layered on top of the physics engine
- Web Audio API or a lightweight suitable audio layer
- seeded PRNG owned by the game, never `Math.random()` for run-critical generation

Prefer stable, well-supported dependencies.

Avoid introducing an additional framework unless it clearly improves the project.

## 2.3 Rendering

Prefer broad browser compatibility and predictable performance.

Use WebGL/WebGL2 through Three.js as the safe baseline.

WebGPU-specific enhancements may be added only if they have graceful fallback and do not become a dependency for core gameplay.

## 2.4 Why not C#/WASM for the first version

Do not begin with a split C# physics + JavaScript renderer architecture.

It is technically viable, but the MVP should minimize integration surfaces and iteration cost.

Keep vehicle/gameplay code modular enough that a future physics-core migration remains possible.

---

# 3. GAME STRUCTURE

## 3.1 Run structure

A run contains **3 acts / biome regions**.

Each region contains approximately:

1. seamless traversal / route choice;
2. two major racing events;
3. upgrade rewards between events;
4. escalating road difficulty;
5. one boss race.

Target total:

- approximately 9 major competitive events including bosses;
- approximately 20–30 minutes for a successful full run.

There should be no traditional node-map screen.

The world itself is the roguelike map.

## 3.2 Physical route selection

Choices should happen while driving.

Examples:

- left highway / right mountain road;
- tunnel / rooftop ramp;
- safe route / dangerous shortcut;
- repair route / high-rarity reward route;
- technical event / speed event;
- standard event / cursed challenge.

Use strong signage, road lighting, icons and color-independent silhouettes so choices are readable at speed.

The player should usually receive enough warning to make a deliberate choice.

## 3.3 Seamless structure

Avoid loading screens during the active run whenever practical.

Transitions between:

- free traversal;
- events;
- reward moments;
- biome boundaries

should feel continuous.

A reward choice may briefly slow or pause gameplay, but should not feel like leaving the run for an unrelated menu.

---

# 4. INITIAL BIOMES

Build the system for arbitrary biomes, but start with three strongly differentiated sets.

## 4.1 Neon Coast

Identity:

- wet coastal city;
- night or dusk;
- reflective asphalt;
- tunnels;
- overpasses;
- harbor roads;
- rain;
- broad highways mixed with tight urban connectors.

Driving character:

- fast;
- flowing;
- high slipstream potential;
- risky wet braking zones.

## 4.2 Alpine Pass

Identity:

- pine forest;
- cliffs;
- high elevation;
- snow patches;
- mountain tunnels;
- bridges;
- rock cuts.

Driving character:

- technical;
- elevation-heavy;
- hairpins;
- dangerous edges;
- jumps and compression zones.

## 4.3 Sunscorched Canyon

Identity:

- desert;
- canyon roads;
- industrial extraction structures;
- dust;
- long sightlines;
- broken highway sections;
- large ramps and verticality.

Driving character:

- highest average speed;
- long drifts;
- jumps;
- alternate canyon routes;
- punishing impacts.

## 4.4 Biome transitions

Biomes must blend through dedicated transition modules.

Examples:

- coastal city → hillside suburbs → pine foothills → alpine;
- alpine plateau → dry rock → canyon;
- canyon industrial zone → illuminated outskirts → coast.

Never abruptly swap the entire environment in one frame.

---

# 5. MODULAR PROCEDURAL ROAD SYSTEM

## 5.1 Authoring philosophy

Use **hand-authored modular road pieces assembled procedurally**.

This is intentionally preferred over generating raw road geometry without design constraints.

Each module should be fun and validated individually.

## 5.2 Required module metadata

Each road module should define or expose data similar to:

- unique id;
- biome tags;
- entry socket;
- exit socket(s);
- transform compatibility;
- road width;
- lane count;
- length;
- curvature;
- maximum recommended speed;
- elevation delta;
- grade;
- banking;
- difficulty score;
- module category;
- event compatibility;
- AI compatibility;
- shortcut flags;
- jump flags;
- tunnel flags;
- bridge flags;
- hazard sockets;
- scenery sockets;
- transition tags;
- estimated traversal time;
- minimum required sight distance.

Fork modules may expose multiple valid exits.

## 5.3 Module categories

Provide a growing library containing at minimum:

- straight;
- gentle curve;
- medium curve;
- hairpin;
- S-curve;
- crest;
- dip;
- banked turn;
- ramp;
- jump;
- bridge;
- tunnel;
- split/fork;
- merge;
- shortcut;
- chicane;
- narrow technical sector;
- high-speed sector;
- event start;
- event finish;
- boss arena/road sequence;
- biome transition.

## 5.4 Generation constraints

The generator must reject invalid compositions.

Validate:

- socket alignment;
- grade limits;
- curvature limits;
- minimum road width;
- drivable collision surface;
- landing feasibility after jumps;
- visual warning distance;
- AI navigability;
- player reset points;
- excessive repetition;
- invalid intersections.

Roads may cross if vertical separation makes the crossing valid.

## 5.5 Difficulty shaping

Do not choose modules with flat random probability.

Use a director that considers:

- act;
- current event;
- recent module history;
- player speed;
- build;
- biome;
- desired intensity;
- cooldown after difficult sectors.

Create rhythm:

**flow → challenge → release → choice → spectacle → flow**

Avoid several blind, high-difficulty modules back-to-back unless intentionally used by a boss.

## 5.6 Streaming

Generate ahead of the player and recycle old road/environment chunks.

Use object pooling where beneficial.

The player should not observe generation popping directly in front of the car.

---

# 6. SEED SYSTEM

Every run has a visible, shareable seed.

Example format:

`7F2C-A91D`

All run-critical procedural systems must derive from deterministic seeded random streams.

Separate streams where useful:

- world;
- biome order;
- road modules;
- event selection;
- AI personalities;
- upgrade rewards;
- cursed rewards;
- hazards.

Do not allow unrelated cosmetic randomness to alter gameplay generation.

Given:

- same game version;
- same seed;
- same difficulty;

the structural run should reproduce reliably.

Display the seed on:

- run HUD/pause screen;
- results screen.

---

# 7. PLAYER VEHICLE

## 7.1 One base car

There is one player car in the core game.

Do not build a garage of statistically different starting cars for the MVP.

The run build is what creates identity.

## 7.2 Base personality

The vehicle should feel:

- rear-biased or neutral sports-car-like;
- powerful but not uncontrollable;
- planted at medium speed;
- lively at high speed;
- drift-capable;
- heavy enough that collisions matter.

## 7.3 Vehicle model

Create a custom arcade/simcade controller.

Model at least:

- engine force;
- brake force;
- steering curve vs speed;
- longitudinal grip;
- lateral grip;
- slip;
- handbrake;
- drag;
- downforce approximation;
- suspension response;
- wheel contact;
- airborne state;
- landing;
- collision impulse;
- assisted stability.

Expose tuning parameters in one centralized configuration.

Avoid scattering magic numbers across systems.

---

# 8. DRIFT SYSTEM

Drifting is a major mechanic but not the only viable driving style.

Desired behavior:

- easy to initiate intentionally;
- difficult to perfect;
- recoverable;
- high skill ceiling;
- faster only when used correctly.

Handbrake initiates or deepens rotation.

Throttle modulation should matter.

Track:

- slip angle;
- drift duration;
- speed;
- proximity;
- drift direction;
- clean exit.

Long, controlled drifts build the Flow meter faster than sloppy spins.

Do not reward simply holding the handbrake.

---

# 9. FLOW / NITRO SYSTEM

Use one primary aggressive-driving resource called **Flow**.

Flow is gained from skilled or risky actions:

- clean drifting;
- near misses;
- overtakes;
- sustained high speed;
- drafting;
- airtime;
- clean landing;
- ramming an opponent without losing excessive speed;
- chaining several actions.

Flow decays slowly when the player drives passively.

The player can spend Flow as nitro/boost.

Boost should:

- clearly increase acceleration;
- raise achievable speed;
- affect camera and audio;
- create visual feedback;
- remain controllable.

Upgrades can radically modify how Flow is generated and spent.

---

# 10. INTEGRITY AND DAMAGE

The player has a vehicle **Integrity** meter.

Damage sources:

- severe wall impacts;
- hard vehicle collisions;
- failed landings;
- hazards;
- selected cursed effects.

Low-speed rubbing should not destroy the player.

Integrity is primarily a run resource, not realistic mechanical simulation.

At zero Integrity:

**RUN OVER**

Damage may produce visual deformation/effects if feasible, but do not make advanced visual damage a prerequisite for the game loop.

Some upgrades can interact with Integrity:

- repair;
- armor;
- damage-to-Flow conversion;
- low-health power;
- impact resistance;
- self-damaging boost;
- collision healing;
- glass-cannon effects.

---

# 11. RACING AND AI

## 11.1 Race size

Every standard race supports **6 cars total**:

- 1 player;
- 5 AI rivals.

## 11.2 AI goals

AI should:

- follow road topology;
- understand forks;
- choose racing lines;
- brake for corners;
- overtake;
- defend occasionally;
- react to nearby cars;
- recover from collisions;
- use shortcuts selectively;
- make human-readable mistakes.

Do not make all AI identical.

## 11.3 AI personalities

Create lightweight personality parameters such as:

- aggression;
- risk tolerance;
- preferred line;
- ramming tendency;
- cornering skill;
- top-speed bias;
- shortcut tendency;
- recovery skill.

## 11.4 Rubber-banding

If rubber-banding is used, keep it subtle.

Never visibly teleport rivals or give them absurd impossible acceleration.

Prefer:

- modest pace adjustment;
- mistake probability;
- route choice;
- drafting behavior.

The player should believe they won or lost because of racing.

---

# 12. EVENT TYPES

Use several event types so the procedural run changes its demands.

Initial set:

## 12.1 Road Race

Six-car point-to-point race through the generated world.

## 12.2 Elimination

Every interval, last place is eliminated.

The road should gradually increase pressure and reduce safe passing opportunities.

## 12.3 Time Attack

Player vs clock.

Use traffic/rivals sparingly if they improve tension rather than randomize the result.

## 12.4 Survival Run

Reach the endpoint while hazards and road difficulty escalate.

Integrity matters heavily.

## 12.5 Rival Duel

Player vs one especially strong procedural rival.

Can use tighter, more technical routes.

## 12.6 High-Risk Shortcut Event

The route contains optional dangerous branches that can dramatically save time.

## 12.7 Boss Race

End-of-biome signature race with a special rival and rule modifier.

Do not use every event type immediately if doing so harms polish.

Start with Road Race + Time Attack + Boss Race, then expand.

---

# 13. EVENT RESULTS

Normal races should not instantly end a full run simply because the player finishes fourth.

Suggested reward structure:

- **1st:** strongest reward quality / improved rarity odds;
- **2nd–3rd:** standard upgrade reward;
- **4th–6th:** reduced or no reward and a run penalty;
- **wrecked:** run over.

Boss races are gates.

Losing a boss race ends the run unless later playtesting proves this unnecessarily punishing.

This rule may be tuned, but the run must retain meaningful failure.

---

# 14. BOSS RACES

Each biome ends with a boss.

Bosses are rival-driver archetypes, not fantasy monsters.

Each boss should pressure a different driving skill.

Examples:

## 14.1 The Slipstream Hunter

- very strong drafting;
- aggressive overtakes;
- high-speed route;
- teaches positioning.

## 14.2 The Bruiser

- heavy car;
- ramming;
- difficult to push;
- technical mountain route;
- teaches avoiding bad contact.

## 14.3 The Linebreaker

- extreme shortcut usage;
- risky jumps;
- fastest final sectors;
- teaches mastery of route knowledge.

Boss mechanics must remain understandable as racing mechanics.

Avoid arbitrary boss health bars disconnected from driving.

---

# 15. ROGUELIKE REWARD SYSTEM

After major events, offer:

**CHOOSE 1 OF 3 UPGRADES**

No shop is required for the core version.

The decision should be fast and exciting.

Use clear text with:

- upgrade name;
- rarity;
- mechanical effect;
- important downside if any;
- synergy tags when useful.

---

# 16. RARITY

Initial tiers:

- Common
- Uncommon
- Rare
- Epic
- Legendary

Additionally:

- **Cursed**

Rarity should mostly represent:

- build-defining strength;
- mechanical uniqueness;
- synergy potential;

not just larger percentages.

---

# 17. UPGRADE FAMILIES

Build the upgrade system data-first.

Initial families:

## 17.1 Power

- acceleration;
- top speed;
- boost output;
- redline effects.

## 17.2 Grip

- lateral grip;
- steering;
- high-speed stability;
- perfect-corner effects.

## 17.3 Drift

- Flow generation;
- drift angle;
- drift recovery;
- drift-chain effects.

## 17.4 Impact

- mass;
- ramming;
- armor;
- knockback;
- collision recovery.

## 17.5 Flow

- Flow capacity;
- generation;
- decay;
- nitro efficiency;
- overcharge.

## 17.6 Air

- jump control;
- airtime rewards;
- landing;
- shockwave-style impact effects.

## 17.7 Integrity

- armor;
- repair;
- low-integrity bonuses;
- damage conversion.

## 17.8 Chaos

Rare rule-changing effects that modify other systems.

---

# 18. BUILD ARCHETYPES

Do not force classes, but support emergent recognizable builds.

Examples:

## Drift Reactor

Drift → Flow → Boost → increased drift potential → more Flow.

## Juggernaut

Mass + armor + ramming + collision recovery.

## Redline

Extreme speed and boost with weak braking/fragility.

## Glass Cannon

Huge performance at low Integrity.

## Airborne

Jumps, airtime and landing bonuses.

## Precision

Rewards clean racing, perfect corners and collision avoidance.

## Flow Loop

Near misses/overtakes constantly refill boost.

The player should be able to hybridize these.

---

# 19. EXAMPLE UPGRADES

These are direction examples, not a mandatory final list.

### Common — Late Apex
Perfect corner exits grant a brief acceleration bonus.

### Uncommon — Tire Smoke
Sustained drift generates 25% more Flow.

### Rare — Predator Draft
Drafting fills Flow and temporarily raises top speed after an overtake.

### Rare — Reinforced Nose
Front impacts deal much more knockback and reduce self-damage.

### Epic — Kinetic Recovery
A successful ram restores Flow proportional to impact force.

### Epic — Afterburn
The final 25% of the Flow meter provides dramatically stronger boost.

### Legendary — Perpetual Motion
While above a high speed threshold, Flow slowly regenerates instead of decaying.

### Legendary — Falling Star
Long airtime charges a landing shockwave that destabilizes nearby rivals.

### Cursed — No Brakes
Massive acceleration and top-speed increase, heavily reduced normal braking.

### Cursed — Blood Fuel
Nitro remains usable at zero Flow but consumes Integrity.

### Cursed — Paper Rocket
Huge power and Flow generation, sharply reduced collision resistance.

### Cursed — Tunnel Vision
Large high-speed bonuses but reduced peripheral HUD warnings.

Cursed upgrades should make the player say:

> “This is probably a terrible idea. I want it.”

---

# 20. SYNERGY SYSTEM

Use tags and event hooks rather than hardcoding every pairwise combination.

Possible gameplay events:

- onDriftStart
- onDriftTick
- onDriftEnd
- onPerfectDrift
- onBoostStart
- onBoostTick
- onBoostEnd
- onNearMiss
- onOvertake
- onDraft
- onImpact
- onRam
- onDamageTaken
- onAirborne
- onLanding
- onPerfectLanding
- onLowIntegrity
- onCheckpoint
- onEventFinish

An upgrade should subscribe to relevant events through clean interfaces.

Avoid giant monolithic conditional blocks.

The system must tolerate several simultaneous effects without becoming impossible to debug.

---

# 21. META-PROGRESSION

There is **no permanent power progression**.

When a run ends:

- upgrades are lost;
- temporary stats are lost;
- Integrity resets;
- the next run begins from the same base power level.

The game must not make later runs easier because the player accumulated permanent stat bonuses.

For the initial version, all core gameplay upgrades may be available from the start.

Skill and knowledge are the true progression.

Optional cosmetic unlocks can be considered later but are outside the MVP.

---

# 22. CAMERA

Primary camera:

**dynamic third-person chase camera**

Requirements:

- smooth follow;
- readable road ahead;
- speed-sensitive FOV;
- subtle acceleration pullback;
- impact shake;
- landing response;
- drift framing;
- reduced shake accessibility option.

Do not let cinematic effects reduce steering readability.

---

# 23. CONTROLS

Support keyboard and controller from the core playable version.

## Keyboard baseline

- W / Up: throttle
- S / Down: brake / reverse
- A/D or arrows: steer
- Space: handbrake
- Shift: boost
- R: reset/recover
- Esc: pause

## Controller baseline

- RT/R2: throttle
- LT/L2: brake/reverse
- Left stick: steer
- face button: handbrake
- face/shoulder button: boost
- menu/start: pause

Support analog steering and analog throttle/brake.

---

# 24. RECOVERY / RESET

Procedural roads make recovery essential.

If the car becomes:

- overturned;
- stuck;
- outside the valid route;
- motionless in invalid geometry;

allow fast recovery to the most recent safe recovery anchor.

Apply an appropriate time/position penalty.

Never respawn the player inside another collider.

Every procedural module should expose one or more safe recovery anchors.

---

# 25. VISUAL DIRECTION

Use an **original stylized modern 3D racing aesthetic**.

Target:

- strong silhouettes;
- clean materials;
- selective PBR;
- bold environmental lighting;
- high readability at speed;
- premium rather than toy-like low-poly design;
- controlled geometric detail;
- atmosphere and particles;
- biome-specific weather.

Avoid photorealism if it compromises iteration speed or performance.

Do not imitate copyrighted vehicle models, logos, liveries or branded environments.

Use an original fictional automotive identity.

---

# 26. SPEED FEEDBACK

High speed must feel fast.

Use a restrained combination of:

- FOV change;
- roadside parallax;
- particles;
- tire smoke;
- wind/audio;
- suspension motion;
- camera lag;
- subtle vibration;
- motion streaks when appropriate;
- environmental density;
- passing objects.

Do not depend on excessive full-screen motion blur.

---

# 27. HUD

Keep the HUD compact.

Display:

- speed;
- position;
- event objective;
- event progress;
- Integrity;
- Flow;
- current major modifier/build indicators;
- upcoming fork warning;
- seed in pause/results.

During upgrade selection, clearly show:

- current build;
- three choices;
- rarity;
- tradeoffs;
- important synergy information.

---

# 28. AUDIO

Audio is required for polish but should follow stable gameplay.

Prioritize:

- responsive engine pitch/load;
- tire slip;
- impacts;
- boost;
- wind;
- surface changes;
- landing;
- opponent proximity;
- UI feedback.

Music should intensify with run progression.

Do not block core implementation on bespoke music.

---

# 29. PERFORMANCE TARGETS

Desktop browser target:

- aim for stable 60 FPS on a reasonable mid-range machine;
- degrade gracefully;
- avoid uncontrolled draw calls;
- instance repeated scenery;
- pool procedural objects;
- use reasonable shadow budgets;
- stream and unload old world sections;
- avoid per-frame allocations in hot loops.

Add a simple developer performance overlay showing at least:

- FPS;
- active road chunks;
- body count;
- draw calls if available;
- generation queue size.

---

# 30. DEBUG / DEVELOPMENT TOOLS

Provide a developer/debug panel that can be disabled for release.

Useful controls:

- seed input;
- restart seed;
- biome selector;
- spawn specific module;
- skip to event;
- skip to boss;
- invulnerability;
- grant upgrade;
- force upgrade rarity;
- show road sockets;
- show racing line;
- show AI targets;
- show recovery anchors;
- show module ids;
- regenerate next chunks;
- slow motion;
- physics metrics.

The procedural system must be inspectable.

---

# 31. REQUIRED DATA-DRIVEN ARCHITECTURE

Prefer config/data definitions for:

- biomes;
- modules;
- events;
- upgrades;
- rarities;
- AI personalities;
- difficulty curves;
- boss modifiers;
- vehicle tuning.

Game logic should consume data rather than duplicate values in many files.

---

# 32. TESTING REQUIREMENTS

Testing is part of implementation, not an optional final step.

## 32.1 Automated tests where practical

At minimum test:

- same seed reproduces the same structural sequence;
- invalid module connections are rejected;
- procedural generator terminates;
- no empty upgrade choices;
- rarity selection obeys constraints;
- cursed upgrades include a downside;
- run reset clears temporary upgrades;
- upgrade event hooks can be added/removed safely.

## 32.2 Procedural stress test

Create a developer command/test capable of generating many virtual road sequences without rendering them.

Validate statistics such as:

- invalid connections;
- impossible grades;
- repetition;
- missing finish path;
- unreachable branches;
- excessive module streaks.

## 32.3 Browser playtest

Before declaring a gameplay milestone complete:

1. build/run the game;
2. actually play it in the browser;
3. use the implemented controls;
4. inspect behavior;
5. fix obvious gameplay or visual defects;
6. verify the full loop relevant to that milestone.

Do not treat compilation alone as proof that the game works.

---

# 33. COMPLETE CORE LOOP

The project is not considered a game until this loop works:

**TITLE**
→ **START RUN**
→ **SEE SEED**
→ **DRIVE**
→ **PHYSICAL ROUTE CHOICE**
→ **RACE EVENT**
→ **RESULT**
→ **CHOOSE 1 OF 3 UPGRADES**
→ **CONTINUE SEAMLESSLY**
→ **BIOME TRANSITION**
→ **BOSS RACE**
→ **NEXT REGION**
→ **FINAL BOSS**
→ **RUN VICTORY / RUN FAILURE**
→ **RESULTS**
→ **NEW RUN**

Prioritize making this loop complete with simple content before expanding visual scope.

---

# 34. DEVELOPMENT ORDER

Use vertical slices.

## Milestone 0 — Project Skeleton

Deliver:

- Vite + TypeScript + Three.js app;
- physics initialized;
- input abstraction;
- basic scene;
- debug overlay;
- project state/checkpoint files;
- clean build.

## Milestone 1 — Driving Prototype

Deliver:

- one car;
- one fixed test road;
- acceleration/braking;
- steering;
- drift;
- collisions;
- chase camera;
- Flow/boost;
- recovery;
- gamepad.

Do not begin procedural generation until the car is enjoyable enough to test repeatedly.

## Milestone 2 — Modular Road

Deliver:

- road module interface;
- sockets;
- module metadata;
- several test modules;
- seeded assembly;
- chunk streaming;
- recovery anchors;
- validation/debug view.

## Milestone 3 — One Complete Race

Deliver:

- player + five AI;
- start countdown;
- checkpoints/progress;
- finishing order;
- result screen/state;
- restart.

## Milestone 4 — Roguelike Slice

Deliver:

- run state;
- 1-of-3 reward;
- rarity;
- initial upgrade pool;
- at least three clearly different emergent builds;
- run reset.

## Milestone 5 — Procedural World Loop

Deliver:

- physical forks;
- route choices;
- two event types;
- seamless continuation;
- procedural event selection;
- seeded reward generation.

## Milestone 6 — First Complete Biome

Deliver:

- dressed biome;
- scenery;
- hazards;
- transitions;
- boss;
- audio/VFX pass;
- complete biome loop.

## Milestone 7 — Full Three-Biome Run

Deliver:

- all three initial biomes;
- seamless transitions;
- escalating difficulty;
- three bosses;
- 20–30 minute target;
- final victory.

## Milestone 8 — Depth and Chaos

Deliver:

- expanded upgrade pool;
- cursed upgrades;
- more synergy interactions;
- remaining event types;
- balance pass;
- procedural variety.

## Milestone 9 — Polish

Deliver:

- menus;
- accessibility basics;
- settings;
- performance optimization;
- final HUD;
- audio polish;
- visual polish;
- bug fixing.

Do not prematurely implement Milestone 9 features while the core loop is incomplete.

---

# 35. CRITICAL QUOTA-SAFE / INTERRUPTION-SAFE PROTOCOL

Astra may be interrupted at any moment because the user's available quota can end mid-task.

Assume abrupt termination is always possible.

The repository must therefore remain recoverable without relying on conversation memory.

## 35.1 Mandatory state files

Maintain these files at repository root:

### `PROJECT_STATE.md`

Contains:

- current stable milestone;
- current stable micro-milestone;
- last known working commit;
- what currently works;
- what is incomplete;
- exact next recommended action;
- current known blockers;
- required commands to run/build/test.

### `ROADMAP.md`

Contains:

- milestones;
- micro-milestones;
- status: TODO / IN_PROGRESS / DONE / BLOCKED.

### `DECISIONS.md`

Contains important technical and game-design decisions that future sessions must not silently reverse.

### `KNOWN_ISSUES.md`

Contains reproducible bugs and limitations.

### `CHANGELOG.md`

Contains meaningful completed changes.

### `CURRENT_TASK.md`

Temporary but mandatory execution checkpoint.

Contains:

- task id;
- goal;
- files expected to change;
- acceptance criteria;
- baseline commit;
- status;
- notes needed to resume.

## 35.2 Git is the recovery boundary

Before starting a new micro-milestone:

1. inspect `git status`;
2. ensure the previous stable state is committed;
3. run the relevant quick verification;
4. record the baseline commit in `CURRENT_TASK.md`;
5. commit the task checkpoint if needed before risky edits.

After completing a micro-milestone:

1. run tests/build;
2. playtest when applicable;
3. update state files;
4. mark the micro-milestone DONE;
5. commit all validated work;
6. record that commit as the new stable checkpoint.

Never combine several unrelated systems into one unvalidated commit.

## 35.3 Micro-milestone sizing

Break work into small atomic units.

A micro-milestone should normally implement one coherent outcome, such as:

- analog steering input;
- one road socket validator;
- Flow generation from drift;
- AI checkpoint following;
- one upgrade event hook;
- one fork module.

Do not begin a giant rewrite spanning many subsystems unless unavoidable.

Prefer multiple stable commits over one enormous change.

## 35.4 Interruption rule

If execution is interrupted mid-edit, the next Astra session must assume the working tree may contain incomplete code.

Never blindly continue with the next roadmap item.

Use the recovery protocol below.

---

# 36. MANDATORY RESUME PROTOCOL

At the beginning of EVERY new Astra session:

1. read this master specification;
2. read `PROJECT_STATE.md`;
3. read `ROADMAP.md`;
4. read `CURRENT_TASK.md`;
5. inspect `git log` for recent stable commits;
6. inspect `git status`;
7. inspect `git diff`;
8. run the quickest relevant build/test;
9. determine whether uncommitted work is:
   - valid and nearly complete;
   - broken but recoverable;
   - unrelated/unsafe to preserve.

If a task was interrupted:

### Case A — partial work is coherent
Complete only that micro-milestone, test it, document it, commit it.

### Case B — partial work is broken and intention is clear
Repair the micro-milestone from the recorded baseline, test it, document it, commit it.

### Case C — partial work is corrupted or intention is unclear
Return only the partial work to the recorded baseline commit, then reimplement the micro-milestone cleanly.

Never reset or discard unrelated user work.

Never delete uncommitted work before inspecting it.

After recovery, update all state/checkpoint files.

Only then move to a new roadmap item.

---

# 37. SESSION END PROTOCOL

Whenever possible, before voluntarily ending work:

1. stop starting new features;
2. get the current micro-milestone into a coherent state;
3. run relevant tests;
4. run build;
5. playtest if gameplay changed;
6. update `PROJECT_STATE.md`;
7. update `ROADMAP.md`;
8. update `KNOWN_ISSUES.md`;
9. update `CHANGELOG.md`;
10. clear or mark `CURRENT_TASK.md` complete;
11. create a stable Git commit.

If a known bug remains, document it instead of hiding it.

---

# 38. RECOVERY COMMAND FOR THE USER

If the previous Astra execution was cut off, the user should be able to send only:

> **Resume the project using the mandatory resume protocol in the master spec. Assume the previous execution may have been interrupted mid-micro-milestone. Recover the working tree first; do not start new roadmap work until the last task is either completed and validated or safely returned to its recorded baseline.**

The repository itself must contain enough information for this instruction to work without requiring the prior chat transcript.

---

# 39. ASTRA WORKING BEHAVIOR

When implementing this project:

- inspect existing code before changing architecture;
- preserve working systems;
- prefer simple robust solutions over clever fragile ones;
- test actual gameplay;
- fix regressions before adding features;
- avoid placeholder interactions that pretend to work;
- avoid fake buttons;
- avoid unreachable content;
- keep systems modular;
- keep run-critical randomness deterministic;
- update project state continuously;
- prioritize a complete playable loop over asset quantity.

Do not rewrite the project from scratch because a different architecture looks attractive.

A working vertical slice is more valuable than a larger unfinished system.

---

# 40. MVP DEFINITION OF DONE

The MVP is done only when a user can:

1. open the browser game;
2. start a fresh seeded run;
3. drive a satisfying 3D car with keyboard or controller;
4. drift and build Flow;
5. use boost;
6. collide and ram rivals;
7. take damage;
8. race against five AI cars;
9. drive through roads assembled procedurally from modules;
10. encounter jumps, tunnels, shortcuts, elevation and physical forks;
11. make route choices while driving;
12. transition between three distinct biomes;
13. complete multiple event types;
14. defeat biome bosses;
15. choose one of three upgrades after events;
16. create meaningful upgrade synergies;
17. acquire rare and cursed upgrades;
18. lose all build progress when the run ends;
19. share/replay the run seed;
20. complete a successful run in approximately 20–30 minutes;
21. start another run that meaningfully differs from the previous one.

If several of these systems exist only as disconnected demonstrations, the MVP is not done.

---

# 41. FIRST EXECUTION INSTRUCTION

On the first implementation pass:

1. initialize the repository and quota-safe state files;
2. create the minimal browser project;
3. implement only the Milestone 1 driving vertical slice on a fixed test track;
4. prioritize handling quality;
5. expose vehicle tuning in a developer panel/config;
6. verify keyboard and controller;
7. implement Flow/boost and recovery;
8. build and playtest it;
9. fix obvious handling/control defects;
10. commit a stable checkpoint.

Do **not** begin generating the full procedural world in the first pass.

The first question the prototype must answer is:

> **Is driving this car fun enough that I want to do another lap?**

Only after the answer is yes should the project move deeper into procedural generation and roguelike systems.
