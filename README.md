<div align="center">

# COSMIC UNIVERSE — v12.0 Multiverse Portal

**60 Playable Space Browser Games · Captain Nova Vex 24-Chapter Season 1 Saga · Multi-Language Multi-Engine Portfolio**

[![Turkish README](https://img.shields.io/badge/README-Türkçe_Sürüm-ef4444?style=for-the-badge)](README.tr.md)
[![Live Portal](https://img.shields.io/badge/Live_Portal-cosmic.haking.tr-38bdf8?style=for-the-badge)](https://cosmic.haking.tr/)
[![Games](https://img.shields.io/badge/Playable_Games-60_Titles-10b981?style=for-the-badge)](https://cosmic.haking.tr/#gamesGrid)
[![Stack](https://img.shields.io/badge/Engines-Phaser_·_3D_·_Lua_·_WASM_·_GLSL-f59e0b?style=for-the-badge)](#multi-language--multi-engine-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate?style=for-the-badge)](LICENSE)

<img src="assets/og-banner.png" alt="COSMIC UNIVERSE v12.0 Showcase Banner" width="100%" />

</div>

---

## Overview

**COSMIC UNIVERSE v12.0** is an independent, zero-backend, portfolio-grade sci-fi browser gaming portal built by **Halit Güneş (HaKING)**. Starring **Captain Nova Vex**, **S.A.R.A. AI**, and **Admiral Kaelen**, the platform unites **60 distinct browser games**—each hosted on its own dedicated SEO route (`games/<slug>/index.html`) with an interactive Pre-Game Start Menu separating **Endless / Free Play** from **Story Mission**—alongside a **24-chapter interactive Season 1 Story Saga** powered by live **60 FPS animated canvas cutscenes**, persistent auto-save, bespoke **256×256 game logo emblems**, and **60 clean 16:9 key-art posters**.

### Key Highlights (v12.0)

- **60 Distinct Space Games & Dual Mode Architecture:** Every standalone route features a Pre-Game Start Menu (**Endless / Free Play** vs. **Story Mission**, difficulty scaling, and local high-score tracking). Portal launches always start true endless/free-play progression.
- **Flagship Multi-Engine Portfolio (#51–#60 & v12 Overhaul):** Powered by Phaser 3 Arcade Physics, Three.js + Cannon-es rigid-body 3D physics, ROT.js procedural dungeon crawling, a live **Fengari Lua 5.3 VM** with hot-swappable AI tactical chips, compiled **AssemblyScript `.wasm`** N-body singularity swarms, **D3.js** force-directed galactic RTS capture, and raw **WebGL2 GLSL SDF raymarching**.
- **Captain Nova Vex — 24-Chapter Season 1 Saga (`story.html`):** 4 Story Acts with constellation hyperlane route nodes, animated 60 FPS multi-layer canvas cutscenes (fighter skirmishes, S.A.R.A. holographic telemetry, plasma impacts), interactive 3-beat timeline controls, automatic resume, and a dramatic Season 1 cliffhanger finale.
- **Hardened Gameplay Physics & Polished UI:** Ledge/hazard AI awareness across platformers (enemies melt cleanly in toxic acid pits instead of stalling), deadlock-free puzzle solvers, canvas DPI/aspect-ratio-safe pointer mapping, unified dark obsidian controls across all portal subpages, and 71-URL `sitemap.xml` + JSON-LD `VideoGame` SEO schemas.

---

## Multi-Language & Multi-Engine Architecture

| Runtime Layer | Technology Stack | Powering Modules |
| :--- | :--- | :--- |
| **Phaser 3.88 Engine** | Phaser 3 Arcade Physics & Boss FSM (`vendor/phaser.min.js`) | `exo-metroid-breach`, `phaser-stealth-heist`, `phaser-crimson-colossus` |
| **3D Physics & WebGL** | Three.js + Cannon-es 3D Rigid-Body (`vendor/three.min.js`, `cannon-es.min.js`) | `moon-rover-3d-odyssey`, `starfox-canyon-ace`, `three-void-interceptor`, `three-star-slalom`, `helix-station-drop` |
| **Lua 5.3 Virtual Machine** | Live Fengari Lua 5.3 VM (`vendor/fengari-web.js`, `lua/mission_kernel.lua`) | `lua-cyber-ops` (editable live AI scripts executing inside Lua VM) |
| **AssemblyScript + WAT WASM** | AssemblyScript (`assembly/cosmic_adv.ts` -> `wasm/cosmic_adv.wasm`) & WAT (`wasm/cosmic_sim.wat`) | `asc-blackhole-swarm`, `wasm-bullet-weave`, `wasm-cellular-contain` |
| **Raw GLSL Shaders** | WebGL2 SDF Raymarching + Fragment Shaders (`shaders/cosmicShaders.js`) | `glsl-synthwave-surf`, `shader-pulse-survivor` |
| **ROT.js & D3.js Strategy** | ROT.js Roguelike + D3.js Force-Graph RTS (`vendor/rot.min.js`, `vendor/d3.min.js`) | `astral-roguelike-crawl`, `d3-galactic-conquest`, `phaser-stealth-heist` FOV |
| **TypeScript Core** | Strict TypeScript + BFS/GF(2)/Unique Solvers (`ts/puzzleEngine.ts`) | 12 logic & cipher puzzles (`js/ts_compiled/puzzleEngine.js`) |
| **Rigid-Body 2D Physics** | Matter.js (`vendor/matter.min.js`) | 7 gravity, tether, lander, pinball, billiards & balance titles |
| **2D WebGL2 Flagship** | PixiJS v8 + pixi-filters (`hangar.html`, `game.html`) | *Cosmic Survivors* (8 starships, four 5600×5600 cover arenas, 5 modes, 53 modules) |
| **UI, Search & Cutscenes** | `js/cutscenePlayer.js`, Fuse.js, Howler.js, Chart.js, GSAP, Panzoom | 60 FPS Season 1 cutscenes, portal search, telemetry & bilingual EN/TR shell |

---

## Captain Nova Vex — 24-Chapter Season 1 Saga (`story.html`)

| Act / Chapter | Chapter Title | Biome Sector | Mission Route |
| :--- | :--- | :--- | :--- |
| **Act I · Ch.1** | **Orbital Breach** | `Sector 01 — Vesta Outpost Ring` | [nova-flappy-rift](games/nova-flappy-rift/index.html?chapter=1) |
| **Act I · Ch.2** | **Dockyard Lockout** | `Sector 02 — Hyperion Cargo Drydock` | [quantum-sokoban](games/quantum-sokoban/index.html?chapter=2) |
| **Act I · Ch.3** | **Crimson Swarm** | `Sector 03 — Crimson Nebula Blockade` | [boss-gauntlet](games/boss-gauntlet/index.html?chapter=3) |
| **Act I · Ch.4** | **Gravity Singularity** | `Sector 04 — Blackstar Gravity Well` | [orbital-slingshot](games/orbital-slingshot/index.html?chapter=4) |
| **Act I · Ch.5** | **Dyson Circuit Matrix** | `Sector 05 — Ancient Dyson Array` | [circuit-pipe-link](games/circuit-pipe-link/index.html?chapter=5) |
| **Act I · Ch.6** | **3D Hyper-Warp Corridor** | `Sector 06 — Quantum Warp Trench` | [three-void-interceptor](games/three-void-interceptor/index.html?chapter=6) |
| **Act II · Ch.7** | **Chronos Bullet Paradox** | `Sector 07 — Chronos Core Paradox` | [wasm-bullet-weave](games/wasm-bullet-weave/index.html?chapter=7) |
| **Act II · Ch.8** | **Infinity Throne** | `Sector 08 — Citadel of Shattered Infinity` | [tower-defense-bastion](games/tower-defense-bastion/index.html?chapter=8) |
| **Act II · Ch.9** | **The Vesta-9 Sabotage** | `Sector 09 — Cryo-Crystal Bay` | [starship-murder-mystery](games/starship-murder-mystery/index.html?chapter=9) |
| **Act II · Ch.10** | **Shattered Armada** | `Sector 10 — Crimson Graveyard` | [three-star-slalom](games/three-star-slalom/index.html?chapter=10) |
| **Act II · Ch.11** | **Dark Relay Cipher** | `Sector 11 — Storm Spire Array` | [typing-cipher-defense](games/typing-cipher-defense/index.html?chapter=11) |
| **Act II · Ch.12** | **Derelict Clone Lab** | `Sector 12 — Abandoned Cryo-Deck` | [astral-roguelike-crawl](games/astral-roguelike-crawl/index.html?chapter=12) |
| **Act III · Ch.13** | **The Molten Foundry** | `Sector 13 — Hephaestus Crater` | [moon-rover-3d-odyssey](games/moon-rover-3d-odyssey/index.html?chapter=13) |
| **Act III · Ch.14** | **Monolith Slipstream** | `Sector 14 — Violet Slip-Corridor` | [glsl-synthwave-surf](games/glsl-synthwave-surf/index.html?chapter=14) |
| **Act III · Ch.15** | **Dyson Core Breach** | `Sector 15 — Solar Dyson Array` | [exo-metroid-breach](games/exo-metroid-breach/index.html?chapter=15) |
| **Act III · Ch.16** | **Singularity Quarantine** | `Sector 16 — Pylon Event Horizon` | [wasm-cellular-contain](games/wasm-cellular-contain/index.html?chapter=16) |
| **Act III · Ch.17** | **Phantom Boarding** | `Sector 17 — Sovereign Flagship Deck` | [phaser-stealth-heist](games/phaser-stealth-heist/index.html?chapter=17) |
| **Act III · Ch.18** | **Orbit Under Fire** | `Sector 18 — Shattered Bridge Skies` | [starfox-canyon-ace](games/starfox-canyon-ace/index.html?chapter=18) |
| **Act IV · Ch.19** | **Star-Map Counterstrike** | `Sector 19 — Tactical Star Network` | [d3-galactic-conquest](games/d3-galactic-conquest/index.html?chapter=19) |
| **Act IV · Ch.20** | **Emerald Rift Push** | `Sector 20 — Ion Hyperspace Charge` | [lua-cyber-ops](games/lua-cyber-ops/index.html?chapter=20) |
| **Act IV · Ch.21** | **Firewall in Flames** | `Sector 21 — AI Core Sanctum` | [photon-parry-duel](games/photon-parry-duel/index.html?chapter=21) |
| **Act IV · Ch.22** | **Ash at the Horizon** | `Sector 22 — Dreadnought Breach Line` | [shader-pulse-survivor](games/shader-pulse-survivor/index.html?chapter=22) |
| **Act IV · Ch.23** | **The Crimson Colossus** | `Sector 23 — Citadel Throne` | [phaser-crimson-colossus](games/phaser-crimson-colossus/index.html?chapter=23) |
| **Act IV · Ch.24** | **Season 1 Finale — Into the Rift** | `Sector 24 — THE SHATTERED INFINITY` | [asc-blackhole-swarm](games/asc-blackhole-swarm/index.html?chapter=24) |

---

## All 60 Playable Space Games

| # | Game Title | Genre | Engine | Language |
| :---: | :--- | :---: | :--- | :---: |
| #01 | [Cosmic Survivors (Flagship)](hangar.html) | `Flagship & 3D` | PixiJS v8 | `JS` |
| #02 | [Boss Gauntlet](games/boss-gauntlet/index.html) | `Flagship & 3D` | PixiJS v8 | `JS` |
| #03 | [3D Void Interceptor](games/three-void-interceptor/index.html) | `Flagship & 3D` | Three.js 3D | `JS` |
| #04 | [3D Star Slalom](games/three-star-slalom/index.html) | `Flagship & 3D` | Three.js 3D | `JS` |
| #05 | [WASM Bullet Weave](games/wasm-bullet-weave/index.html) | `Flagship & 3D` | WebAssembly | `WASM` |
| #06 | [Shader Pulse Survivor](games/shader-pulse-survivor/index.html) | `Flagship & 3D` | GLSL WebGL2 | `GLSL` |
| #07 | [Nova Flappy Rift](games/nova-flappy-rift/index.html) | `Reflex & Runner` | Neo-Pixel | `JS` |
| #08 | [Gravity Flip Runner](games/gravity-flip-runner/index.html) | `Reflex & Runner` | Neo-Pixel | `JS` |
| #09 | [Orbital Dash Ring](games/orbital-dash-ring/index.html) | `Reflex & Runner` | Neo-Pixel | `JS` |
| #10 | [Warp Lane Dodger](games/warp-lane-dodger/index.html) | `Reflex & Runner` | Neo-Pixel | `JS` |
| #11 | [Photon Parry Duel](games/photon-parry-duel/index.html) | `Reflex & Runner` | Neo-Pixel | `JS` |
| #12 | [Meteor Jetpack Rise](games/meteor-jetpack-rise/index.html) | `Reflex & Runner` | Neo-Pixel | `JS` |
| #13 | [Helix Station Drop](games/helix-station-drop/index.html) | `Reflex & Runner` | Three.js 3D | `JS` |
| #14 | [Laser Limbo Dash](games/laser-limbo-dash/index.html) | `Reflex & Runner` | Neo-Pixel | `JS` |
| #15 | [Starlight Rhythm Pulse](games/starlight-rhythm-pulse/index.html) | `Reflex & Runner` | Neo-Pixel | `JS` |
| #16 | [Silent Airlock: Starship Murder Mystery](games/starship-murder-mystery/index.html) | `Tactics & Mystery` | Neo-Pixel | `JS` |
| #17 | [Galaga Swarm Assault](games/galaga-swarm-assault/index.html) | `Classic Arcade` | Neo-Pixel | `JS` |
| #18 | [Defender Patrol](games/defender-patrol/index.html) | `Classic Arcade` | Neo-Pixel | `JS` |
| #19 | [Astro Vector Asteroids](games/astro-vector-asteroids/index.html) | `Classic Arcade` | Neo-Pixel | `JS` |
| #20 | [Cosmic Snake Leviathan](games/cosmic-snake-leviathan/index.html) | `Classic Arcade` | Neo-Pixel | `JS` |
| #21 | [Quantum Brick Breaker](games/quantum-brick-breaker/index.html) | `Classic Arcade` | Neo-Pixel | `JS` |
| #22 | [Twin Paddle Pong](games/twin-paddle-pong/index.html) | `Classic Arcade` | Neo-Pixel | `JS` |
| #23 | [Centipede Spore Purge](games/centipede-spore-purge/index.html) | `Classic Arcade` | Neo-Pixel | `JS` |
| #24 | [Missile Dome Defense](games/missile-dome-defense/index.html) | `Classic Arcade` | Neo-Pixel | `JS` |
| #25 | [Lunar Excavator](games/lunar-excavator/index.html) | `Classic Arcade` | Neo-Pixel | `JS` |
| #26 | [Quantum Sokoban](games/quantum-sokoban/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #27 | [Laser Mirror Grid](games/laser-mirror-grid/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #28 | [Circuit Pipe Link](games/circuit-pipe-link/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #29 | [Quantum 2048](games/quantum-2048/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #30 | [Nebula Minesweeper](games/nebula-minesweeper/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #31 | [Match-3 Isotope Core](games/match3-isotope-core/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #32 | [Lights-Out Array](games/lights-out-array/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #33 | [Memory Star Matrix](games/memory-star-matrix/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #34 | [Nonogram Star Map](games/nonogram-star-map/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #35 | [Hanoi Warp Cores](games/hanoi-warp-cores/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #36 | [WASM Cellular Containment](games/wasm-cellular-contain/index.html) | `Puzzle & Cipher` | WebAssembly | `WASM` |
| #37 | [Orbital Sudoku Mini](games/orbital-sudoku-mini/index.html) | `Puzzle & Cipher` | TypeScript | `TS` |
| #38 | [Orbital Slingshot](games/orbital-slingshot/index.html) | `Physics & Gravity` | Matter.js | `JS` |
| #39 | [Moon Lander Apollo](games/moon-lander-apollo/index.html) | `Physics & Gravity` | Matter.js | `JS` |
| #40 | [Cosmic Pinball Rig](games/cosmic-pinball-rig/index.html) | `Physics & Gravity` | Matter.js | `JS` |
| #41 | [Nebula Pool Ricochet](games/nebula-pool-ricochet/index.html) | `Physics & Gravity` | Matter.js | `JS` |
| #42 | [Cargo Tower Balance](games/cargo-tower-balance/index.html) | `Physics & Gravity` | Matter.js | `JS` |
| #43 | [Magnetic Tether Swing](games/magnetic-tether-swing/index.html) | `Physics & Gravity` | Matter.js | `JS` |
| #44 | [Gravity Golf Parsec](games/gravity-golf-parsec/index.html) | `Physics & Gravity` | Matter.js | `JS` |
| #45 | [Tower Defense Bastion](games/tower-defense-bastion/index.html) | `Tactics & Mystery` | PixiJS v8 | `JS` |
| #46 | [Deck Breach Tactics](games/deck-breach-tactics/index.html) | `Tactics & Mystery` | TypeScript | `TS` |
| #47 | [Fleet Commander Auto](games/fleet-commander-auto/index.html) | `Tactics & Mystery` | Neo-Pixel | `JS` |
| #48 | [Wormhole Roulette RPG](games/wormhole-roulette-rpg/index.html) | `Tactics & Mystery` | Neo-Pixel | `JS` |
| #49 | [Mining Tycoon Idle](games/mining-tycoon-idle/index.html) | `Tactics & Mystery` | Neo-Pixel | `JS` |
| #50 | [Typing Cipher Defense](games/typing-cipher-defense/index.html) | `Tactics & Mystery` | TypeScript | `TS` |
| #51 | [Exo-Metroid Sector Breach](games/exo-metroid-breach/index.html) | `Flagship & 3D` | Phaser 3 | `JS` |
| #52 | [Astral Roguelike Crawl](games/astral-roguelike-crawl/index.html) | `Tactics & Mystery` | ROT.js | `JS` |
| #53 | [Moon Rover 3D Odyssey](games/moon-rover-3d-odyssey/index.html) | `Physics & Gravity` | Cannon-es 3D | `JS` |
| #54 | [Starfox 3D Canyon Ace](games/starfox-canyon-ace/index.html) | `Classic Arcade` | Cannon-es 3D | `JS` |
| #55 | [Lua 5.3 Cyber Drone Ops](games/lua-cyber-ops/index.html) | `Tactics & Mystery` | Lua 5.3 VM | `LUA` |
| #56 | [Event Horizon: WASM Singularity Swarm](games/asc-blackhole-swarm/index.html) | `Flagship & 3D` | AssemblyScript | `WASM` |
| #57 | [Phantom Airlock: Stealth Heist](games/phaser-stealth-heist/index.html) | `Tactics & Mystery` | Phaser 3 | `JS` |
| #58 | [D3 Galactic Conquest RTS](games/d3-galactic-conquest/index.html) | `Tactics & Mystery` | D3.js Engine | `JS` |
| #59 | [GLSL Synthwave Tunnel Surf](games/glsl-synthwave-surf/index.html) | `Reflex & Runner` | GLSL Raymarch | `GLSL` |
| #60 | [Crimson Colossus: Boss Raid](games/phaser-crimson-colossus/index.html) | `Classic Arcade` | Phaser 3 | `JS` |

---

## Project Structure

```text
COSMIC/
├── index.html                  # v12.0 Portfolio Multi-Game Portal & Search Hub (EN/TR)
├── README.md / README.tr.md    # Complete English & Turkish Documentation
├── story.html                  # Captain Nova Vex 24-Chapter Season 1 Saga + Cinema Cutscenes
├── arcade.html                 # Universal Arcade Player Shell & Pre-Game Start Menu
├── hangar.html                 # Cosmic Survivors Flagship Hangar (8 Ships, 5 Modes)
├── game.html / game.js         # PixiJS v8 Flagship Survival Arena Engine
├── armory.html / modes.html    # Fleet R&D Bay, Liveries & Daily Seeded Protocol
├── tree.html / wiki.html       # Interactive Panzoom Evolution Tree & 53-Module Encyclopedia
├── about.html                  # Technical Architecture, Controls, FAQ & MIT License
├── games/<slug>/index.html     # 60 Dedicated SEO Game Pages + VideoGame & BreadcrumbList Schema
├── assembly/ & wasm/           # AssemblyScript (cosmic_adv.ts -> .wasm) & WAT (cosmic_sim.wasm)
├── lua/mission_kernel.lua      # Embedded Lua 5.3 drone tactics script for Fengari VM
├── ts/ & js/ts_compiled/       # Strict TypeScript puzzle solver engine + compiled output
├── shaders/cosmicShaders.js    # Custom WebGL2 GLSL vertex & fragment shaders
├── js/cutscenePlayer.js        # 60 FPS Multi-Layer Animated Cutscene Renderer for Season 1
├── js/games/                   # pack_phaser, pack_advanced3d, pack_multilang, pack_three, pack_reflex, pack_matter, pack_arcade, pack_puzzles, pack_tactics, pack_mystery
├── assets/v11/                 # 24 chapter plates, 4 cast portraits, 25 sprites, 60 logos, 60 posters
├── vendor/                     # Offline bundled Phaser 3, Three.js, Cannon-es, ROT.js, Fengari Lua, D3.js, PixiJS v8, Matter.js, Fuse.js, Howler.js, Chart.js
└── sitemap.xml / manifest.webmanifest / robots.txt
```

---

## Running Locally

Because WebAssembly (`.wasm`) and standalone game routes require standard HTTP MIME headers rather than `file://`, serve the project root using any static local HTTP server:

```bash
# Option A: Node.js
npx serve .

# Option B: Python 3
python -m http.server 8080
```

Optional developer verification checks (requires `npm install` devDependencies):

```bash
npx tsc --noEmit
```

---

## Official Channels & License

- **Developer:** Halit Güneş (HaKING)
- **Email:** [cosmic@haking.tr](mailto:cosmic@haking.tr)
- **GitHub:** [github.com/HaKING06/COSMIC](https://github.com/HaKING06/COSMIC)
- **Support:** [buymeacoffee.com/haking](https://buymeacoffee.com/haking)
- **License:** Released under the [MIT License](LICENSE). Bundled third-party runtime libraries (`vendor/`) and Kenney CC0 1.0 audio/visual assets remain under their respective open-source licenses.
