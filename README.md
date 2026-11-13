<div align="center">

# COSMIC UNIVERSE — v11.0 Multiverse Portal

**50 Playable Space Browser Games · Captain Nova Vex 8-Chapter Story Saga · Multi-Language Multi-Engine Portfolio**

[![Live Portal](https://img.shields.io/badge/Live_Portal-cosmic.haking.tr-38bdf8?style=for-the-badge)](https://cosmic.haking.tr/)
[![Games](https://img.shields.io/badge/Playable_Games-50_Titles-10b981?style=for-the-badge)](https://cosmic.haking.tr/#gamesGrid)
[![Stack](https://img.shields.io/badge/Engines-JS_·_TS_·_WASM_·_GLSL_·_3D-f59e0b?style=for-the-badge)](#multi-language--multi-engine-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate?style=for-the-badge)](LICENSE)

<img src="assets/og-banner.png" alt="COSMIC UNIVERSE v11.0 Showcase Banner" width="100%" />

</div>

---

## Overview / Genel Bakış

**COSMIC UNIVERSE v11.0** is an independent, zero-backend, portfolio-grade sci-fi gaming portal created by **Halit Güneş (HaKING)**. Starring **Captain Nova Vex**, it unites **50 distinct browser games**, an **8-chapter interactive Story Saga** (*The Shattered Infinity / Parçalanan Sonsuzluk*), bespoke **256×256 game logo icons**, **1200×630 SEO poster banners**, and **50 dedicated SEO game pages** (`/games/<slug>/`) running 100% locally in the browser with bilingual **EN / TR** support.

**Öne Çıkanlar (v11.0):**
- **50 Özgün Uzay Oyunu:** Amiral gemisi *Cosmic Survivors* (PixiJS v8), **3D uzay savaşları & slalom (Three.js)**, **Vesta-9 Adli Uzay Cinayeti Gizemi (3 Vaka)**, **WebAssembly (.wasm) mermi dokumacı & hücresel otomat**, **GLSL WebGL2 shader arena**, **TypeScript çözücülü mantık bulmacaları**, **Matter.js yörünge fizikleri**, klasik arcade & refleks oyunları.
- **Kaptan Nova Vex Hikâye Modu (`story.html`):** 8 boyutlu galaksi haritası ve görsel roman diyaloglarıyla her bölümde farklı oyun türüne geçiş.
- **Her Oyuna Özel Marka & SEO Altyapısı:** 50 adet `assets/v11/thumbs/<slug>.png` oyun logosu, 50 adet `assets/v11/banners/<slug>.jpg` 16:9 afişi, `games/<slug>/index.html` sayfaları, JSON-LD `VideoGame` şeması ve `sitemap.xml`.
- **Tam Çevrimdışı & Sıfır Arka Uç:** Tüm skorlar, yıldızlar (150 maks.), krediler (CRD), başarımlar ve hikâye ilerlemesi yerel `localStorage` üzerinde saklanır.

---

## Multi-Language & Multi-Engine Architecture

| Runtime Layer | Technology Stack | Powering Modules |
| :--- | :--- | :--- |
| **3D WebGL Engine** | Three.js (`vendor/three.min.js`) | `three-void-interceptor`, `three-star-slalom`, `helix-station-drop` |
| **WebAssembly Kernel** | Hand-authored WAT → `.wasm` (`wasm/cosmic_sim.wat`, `cosmic_sim.wasm`) | `wasm-bullet-weave`, `wasm-cellular-contain` |
| **Raw GLSL Shaders** | WebGL2 Vertex + Fragment Shaders (`shaders/cosmicShaders.js`) | `shader-pulse-survivor` + warp backgrounds |
| **TypeScript Core** | Strict TypeScript + BFS/GF(2)/Unique Solvers (`ts/puzzleEngine.ts`) | 12 logic & cipher puzzles (`js/ts_compiled/puzzleEngine.js`) |
| **Rigid-Body Physics** | Matter.js (`vendor/matter.min.js`) | 7 gravity, tether, lander, pinball, golf & balance games |
| **2D WebGL2 Flagship** | PixiJS v8 + pixi-filters (`hangar.html`, `game.html`) | *Cosmic Survivors* (8 ships, 4 5600×5600 arenas, 5 modes, 53 modules) |
| **UI, Search & Telemetry** | Fuse.js, Howler.js, Chart.js, GSAP, Panzoom, canvas-confetti, Lucide | Portal discovery, audio pool, DPS telemetry & bilingual EN/TR shell |

---

## Captain Nova Vex — 8-Chapter Story Saga (`story.html`)

| Chapter | Title (EN / TR) | Biome Sector | Mission Route |
| :--- | :--- | :--- | :--- |
| Ch.1 | **Chapter 1: Orbital Breach** (*Bölüm 1: Yörünge İhlali*) | `Sector 01 — Vesta Outpost Ring` | [nova-flappy-rift](games/nova-flappy-rift/index.html?chapter=1) |
| Ch.2 | **Chapter 2: Dockyard Lockout** (*Bölüm 2: Tersane Kilidi*) | `Sector 02 — Hyperion Cargo Drydock` | [quantum-sokoban](games/quantum-sokoban/index.html?chapter=2) |
| Ch.3 | **Chapter 3: Crimson Swarm** (*Bölüm 3: Kızıl Sürü*) | `Sector 03 — Crimson Nebula Blockade` | [boss-gauntlet](games/boss-gauntlet/index.html?chapter=3) |
| Ch.4 | **Chapter 4: Gravity Singularity** (*Bölüm 4: Kütleçekim Tekilliği*) | `Sector 04 — Blackstar Gravity Well` | [orbital-slingshot](games/orbital-slingshot/index.html?chapter=4) |
| Ch.5 | **Chapter 5: Dyson Circuit Matrix** (*Bölüm 5: Dyson Devre Matrisi*) | `Sector 05 — Ancient Dyson Array` | [circuit-pipe-link](games/circuit-pipe-link/index.html?chapter=5) |
| Ch.6 | **Chapter 6: 3D Hyper-Warp Corridor** (*Bölüm 6: 3D Hiper-Büküm Koridoru*) | `Sector 06 — Quantum Warp Trench` | [three-void-interceptor](games/three-void-interceptor/index.html?chapter=6) |
| Ch.7 | **Chapter 7: Chronos Bullet Paradox** (*Bölüm 7: Kronos Mermi Paradoksu*) | `Sector 07 — Chronos Core Paradox` | [wasm-bullet-weave](games/wasm-bullet-weave/index.html?chapter=7) |
| Ch.8 | **Chapter 8: Infinity Throne** (*Bölüm 8: Sonsuzluk Tahtı*) | `Sector 08 — Citadel of Shattered Infinity` | [tower-defense-bastion](games/tower-defense-bastion/index.html?chapter=8) |

---

## All 50 Playable Space Games

| # | Game Title (EN) | Oyun Adı (TR) | Category | Engine | Language |
| :---: | :--- | :--- | :---: | :--- | :---: |
| #01 | [Cosmic Survivors (Flagship)](hangar.html) | Kozmik Hayatta Kalanlar (Ana Sefer) | `survivors` | PixiJS v8 | `JS` |
| #02 | [Boss Gauntlet](games/boss-gauntlet/index.html) | Kızıl Sürü: Boss Arenası | `survivors` | PixiJS v8 | `JS` |
| #03 | [3D Void Interceptor](games/three-void-interceptor/index.html) | 3D Hipertünel Avcısı | `survivors` | Three.js 3D | `JS` |
| #04 | [3D Star Slalom](games/three-star-slalom/index.html) | 3D Yıldız Slalomu | `survivors` | Three.js 3D | `JS` |
| #05 | [WASM Bullet Weave](games/wasm-bullet-weave/index.html) | WASM Mermi Dokumacı | `survivors` | WebAssembly | `WASM` |
| #06 | [Shader Pulse Survivor](games/shader-pulse-survivor/index.html) | GLSL Ufuk Nabzı | `survivors` | GLSL WebGL2 | `GLSL` |
| #07 | [Nova Flappy Rift](games/nova-flappy-rift/index.html) | Nova Yarık Sıçrayışı | `reflex` | Neo-Pixel | `JS` |
| #08 | [Gravity Flip Runner](games/gravity-flip-runner/index.html) | Yerçekimi Ters Çeviren Koşucu | `reflex` | Neo-Pixel | `JS` |
| #09 | [Orbital Dash Ring](games/orbital-dash-ring/index.html) | Yörünge Atılma Halkası | `reflex` | Neo-Pixel | `JS` |
| #10 | [Warp Lane Dodger](games/warp-lane-dodger/index.html) | Büküm Şeridi Kaçışı | `reflex` | Neo-Pixel | `JS` |
| #11 | [Photon Parry Duel](games/photon-parry-duel/index.html) | Foton Savuşturma Düellosu | `reflex` | Neo-Pixel | `JS` |
| #12 | [Meteor Jetpack Rise](games/meteor-jetpack-rise/index.html) | Meteor Sırt Roketi Yükselişi | `reflex` | Neo-Pixel | `JS` |
| #13 | [Helix Station Drop](games/helix-station-drop/index.html) | 3D Sarmal İstasyon Düşüşü | `reflex` | Three.js 3D | `JS` |
| #14 | [Laser Limbo Dash](games/laser-limbo-dash/index.html) | Lazer Altından Atılma | `reflex` | Neo-Pixel | `JS` |
| #15 | [Starlight Rhythm Pulse](games/starlight-rhythm-pulse/index.html) | Yıldız Işığı Ritim Nabzı | `reflex` | Neo-Pixel | `JS` |
| #16 | [Silent Airlock: Starship Murder Mystery](games/starship-murder-mystery/index.html) | Vesta-9: Uzay Gemisi Cinayet Dosyası | `tactics` | Neo-Pixel | `JS` |
| #17 | [Galaga Swarm Assault](games/galaga-swarm-assault/index.html) | Galaktik Sürü Taarruzu | `arcade` | Neo-Pixel | `JS` |
| #18 | [Defender Patrol](games/defender-patrol/index.html) | Yatay Sektör Muhafızı | `arcade` | Neo-Pixel | `JS` |
| #19 | [Astro Vector Asteroids](games/astro-vector-asteroids/index.html) | Astro Vektör Asteroitler | `arcade` | Neo-Pixel | `JS` |
| #20 | [Cosmic Snake Leviathan](games/cosmic-snake-leviathan/index.html) | Kozmik Yılan Leviathan | `arcade` | Neo-Pixel | `JS` |
| #21 | [Quantum Brick Breaker](games/quantum-brick-breaker/index.html) | Kuantum Blok Kırıcı | `arcade` | Neo-Pixel | `JS` |
| #22 | [Twin Paddle Pong](games/twin-paddle-pong/index.html) | İkiz Palet Kuantum Pong | `arcade` | Neo-Pixel | `JS` |
| #23 | [Centipede Spore Purge](games/centipede-spore-purge/index.html) | Spor Kırkayağı İmhası | `arcade` | Neo-Pixel | `JS` |
| #24 | [Missile Dome Defense](games/missile-dome-defense/index.html) | Füze Kubbe Savunması | `arcade` | Neo-Pixel | `JS` |
| #25 | [Lunar Excavator](games/lunar-excavator/index.html) | Ay Yüzeyi Kazıcısı | `arcade` | Neo-Pixel | `JS` |
| #26 | [Quantum Sokoban](games/quantum-sokoban/index.html) | Kuantum Kargo Sokoban | `puzzle` | TypeScript | `TS` |
| #27 | [Laser Mirror Grid](games/laser-mirror-grid/index.html) | Lazer Ayna Matrisi | `puzzle` | TypeScript | `TS` |
| #28 | [Circuit Pipe Link](games/circuit-pipe-link/index.html) | Dyson Devre Bağlantısı | `puzzle` | TypeScript | `TS` |
| #29 | [Quantum 2048](games/quantum-2048/index.html) | Kuantum 2048 Füzyonu | `puzzle` | TypeScript | `TS` |
| #30 | [Nebula Minesweeper](games/nebula-minesweeper/index.html) | Nebula Mayın Tarlası | `puzzle` | TypeScript | `TS` |
| #31 | [Match-3 Isotope Core](games/match3-isotope-core/index.html) | İzotop Eşleştirme Çekirdeği | `puzzle` | TypeScript | `TS` |
| #32 | [Lights-Out Array](games/lights-out-array/index.html) | Işıkları Söndür Dizisi | `puzzle` | TypeScript | `TS` |
| #33 | [Memory Star Matrix](games/memory-star-matrix/index.html) | Yıldız Hafıza Matrisi | `puzzle` | TypeScript | `TS` |
| #34 | [Nonogram Star Map](games/nonogram-star-map/index.html) | Nonogram Yıldız Haritası | `puzzle` | TypeScript | `TS` |
| #35 | [Hanoi Warp Cores](games/hanoi-warp-cores/index.html) | Hanoi Büküm Çekirdekleri | `puzzle` | TypeScript | `TS` |
| #36 | [WASM Cellular Containment](games/wasm-cellular-contain/index.html) | WASM Hücresel Karantina | `puzzle` | WebAssembly | `WASM` |
| #37 | [Orbital Sudoku Mini](games/orbital-sudoku-mini/index.html) | Yörünge Mini Sudoku | `puzzle` | TypeScript | `TS` |
| #38 | [Orbital Slingshot](games/orbital-slingshot/index.html) | Yörünge Sapanı (Tekillik) | `physics` | Matter.js | `JS` |
| #39 | [Moon Lander Apollo](games/moon-lander-apollo/index.html) | Ay İniş Modülü Apollo | `physics` | Matter.js | `JS` |
| #40 | [Cosmic Pinball Rig](games/cosmic-pinball-rig/index.html) | Kozmik Langırt / Tilt Masası | `physics` | Matter.js | `JS` |
| #41 | [Nebula Pool Ricochet](games/nebula-pool-ricochet/index.html) | Nebula Bilardo Sekmesi | `physics` | Matter.js | `JS` |
| #42 | [Cargo Tower Balance](games/cargo-tower-balance/index.html) | Kargo Kulesi Dengesi | `physics` | Matter.js | `JS` |
| #43 | [Magnetic Tether Swing](games/magnetic-tether-swing/index.html) | Manyetik Halat Salınımı | `physics` | Matter.js | `JS` |
| #44 | [Gravity Golf Parsec](games/gravity-golf-parsec/index.html) | Parsec Yerçekimi Golfü | `physics` | Matter.js | `JS` |
| #45 | [Tower Defense Bastion](games/tower-defense-bastion/index.html) | Sonsuzluk Kalesi Kule Savunması | `tactics` | PixiJS v8 | `JS` |
| #46 | [Deck Breach Tactics](games/deck-breach-tactics/index.html) | Güverte İhlal Taktikleri | `tactics` | TypeScript | `TS` |
| #47 | [Fleet Commander Auto](games/fleet-commander-auto/index.html) | Filo Komutanı Oto-Savaş | `tactics` | Neo-Pixel | `JS` |
| #48 | [Wormhole Roulette RPG](games/wormhole-roulette-rpg/index.html) | Solucan Deliği Rulet RYO | `tactics` | Neo-Pixel | `JS` |
| #49 | [Mining Tycoon Idle](games/mining-tycoon-idle/index.html) | Asteroit Maden İmparatorluğu | `tactics` | Neo-Pixel | `JS` |
| #50 | [Typing Cipher Defense](games/typing-cipher-defense/index.html) | Şifre Yazım Savunması | `tactics` | TypeScript | `TS` |

---

## Project Structure

```text
COSMIC/
├── index.html                  # v11.0 Portfolio Multi-Game Portal & Search Hub (EN/TR)
├── story.html                  # Captain Nova Vex 8-Chapter Story Saga & Visual Novel
├── arcade.html                 # Universal Arcade Player Shell
├── hangar.html                 # Cosmic Survivors Flagship Hangar (8 Ships, 5 Modes)
├── game.html / game.js         # PixiJS v8 Flagship Survival Arena Engine
├── armory.html / modes.html    # Fleet R&D Bay, Liveries, Daily Seeded Protocol
├── tree.html / wiki.html       # Interactive Panzoom Evolution Tree & 53-Module Wiki
├── about.html                  # Technical Architecture, Controls & MIT License
├── games/<slug>/index.html     # 50 Dedicated SEO Game Pages + JSON-LD + OpenGraph
├── wasm/                       # cosmic_sim.wat source & compiled cosmic_sim.wasm
├── ts/ & js/ts_compiled/       # Strict TypeScript puzzle solver engine + compiled output
├── shaders/cosmicShaders.js    # Custom WebGL2 GLSL vertex & fragment shaders
├── js/games/                   # pack_three, pack_reflex, pack_matter, pack_arcade, pack_puzzles, pack_tactics, pack_mystery
├── assets/v11/                 # Captain Nova Vex art, 8 chapters, 16 sprites, 50 logos, 50 posters
├── vendor/                     # Offline bundled PixiJS v8, Three.js, Matter.js, Fuse.js, Howler.js, Chart.js, etc.
└── sitemap.xml / manifest.webmanifest / robots.txt
```

---

## Running Locally

Because WebAssembly (`.wasm`) and clean routes require HTTP headers rather than `file://`, serve the root folder with any static server:

```bash
# Option A: Node
npx serve .

# Option B: Python
python -m http.server 8080
```

Optional build checks (`npm install` devDependencies):

```bash
npx tsc --noEmit
```

---

## Official Channels & License

- **Developer:** Halit Güneş (HaKING)
- **Email:** [cosmic@haking.tr](mailto:cosmic@haking.tr)
- **GitHub:** [github.com/HaKING06/COSMIC](https://github.com/HaKING06/COSMIC)
- **Support:** [buymeacoffee.com/haking](https://buymeacoffee.com/haking)
- **License:** Released under the [MIT License](LICENSE). Third-party libraries (`vendor/`) and Kenney CC0 1.0 audio/visual assets remain under their respective open licenses.
