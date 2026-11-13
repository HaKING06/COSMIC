<div align="center">

# COSMIC UNIVERSE — v11.5 Multiverse Portal

**60 Playable Space Browser Games · Captain Nova Vex 24-Chapter Season 1 Saga · Multi-Language Multi-Engine Portfolio**

[![Live Portal](https://img.shields.io/badge/Live_Portal-cosmic.haking.tr-38bdf8?style=for-the-badge)](https://cosmic.haking.tr/)
[![Games](https://img.shields.io/badge/Playable_Games-60_Titles-10b981?style=for-the-badge)](https://cosmic.haking.tr/#gamesGrid)
[![Stack](https://img.shields.io/badge/Engines-Phaser_·_3D_·_Lua_·_WASM_·_GLSL-f59e0b?style=for-the-badge)](#multi-language--multi-engine-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate?style=for-the-badge)](LICENSE)

<img src="assets/og-banner.png" alt="COSMIC UNIVERSE v11.5 Showcase Banner" width="100%" />

</div>

---

## Overview / Genel Bakış

**COSMIC UNIVERSE v11.5** is an independent, zero-backend, portfolio-grade sci-fi gaming portal created by **Halit Güneş (HaKING)**. Starring **Captain Nova Vex**, **S.A.R.A. AI**, and **Admiral Kaelen**, it unites **60 distinct browser games** (each with its own dedicated SEO route `/games/<slug>/` and Pre-Game Start Menu with separate **Endless / Free Play** vs **Story Mission** modes), a **24-chapter interactive Season 1 Story Saga** with live **60 FPS canvas cutscenes** and persistent auto-save, bespoke **256×256 game logo icons**, and **60 clean 16:9 keyart posters**.

**Öne Çıkanlar (v11.5):**
- **60 Özgün Uzay Oyunu & Ayrı Mod Mimarisi:** Her oyunun kendi `games/<slug>/index.html` sayfasında **Başlangıç Menüsü** (`♾ Sonsuz / Serbest Mod` · `📖 Hikâye Görevi` · zorluk seçimi · en yüksek skor) bulunur; portal ve serbest açılışlarda tüm oyunlar gerçek sonsuz/serbest kurallarla çalışır.
- **Amiral Gemisi +10 Yeni Nesil Çoklu Dil Motoru (#51–#60):** Phaser 3 Metroidvania/Gizlilik/Boss Baskını, Three.js + Cannon-es gerçek 3D fizik, ROT.js prosedürel roguelike, canlı **Fengari Lua 5.3 VM**, **AssemblyScript `.wasm`** kara delik N-body sürüsü, **D3.js** galaktik strateji haritası ve saf **WebGL2 GLSL SDF raymarching**.
- **Kaptan Nova Vex — 24 Bölümlük Sezon 1 Destanı (`story.html`):** 4 Perde (Perde I–IV), canlı 60 FPS animasyonlu ara sahneler, otomatik bölüm kaydı ve **S.A.R.A. AI fedakârlığı & paralel yarık uçurum finali (Sezon 2 Yakında)**.
- **Her Oyuna Özel Marka & Google SEO Altyapısı:** 60 adet `assets/v11/thumbs/<slug>.png` oyun logosu, 60 adet metinsiz `assets/v11/banners/<slug>.jpg` 16:9 afişi, `games/<slug>/index.html` JSON-LD `VideoGame` + `BreadcrumbList` şemaları ve 71 URL'li `sitemap.xml`.

---

## Multi-Language & Multi-Engine Architecture

| Runtime Layer | Technology Stack | Powering Modules |
| :--- | :--- | :--- |
| **Phaser 3.88 Engine** | Phaser 3 Arcade Physics & Boss FSM (`vendor/phaser.min.js`) | `exo-metroid-breach`, `phaser-stealth-heist`, `phaser-crimson-colossus` |
| **3D Physics & WebGL** | Three.js + Cannon-es 3D Rigid-Body (`vendor/three.min.js`, `cannon-es.min.js`) | `moon-rover-3d-odyssey`, `starfox-canyon-ace`, `three-void-interceptor`, `three-star-slalom`, `helix-station-drop` |
| **Lua 5.3 Virtual Machine** | Live Fengari Lua 5.3 VM (`vendor/fengari-web.js`, `lua/mission_kernel.lua`) | `lua-cyber-ops` (editable live AI chips running in Lua VM) |
| **AssemblyScript + WAT WASM** | AssemblyScript (`assembly/cosmic_adv.ts` -> `wasm/cosmic_adv.wasm`) & WAT (`wasm/cosmic_sim.wat`) | `asc-blackhole-swarm`, `wasm-bullet-weave`, `wasm-cellular-contain` |
| **Raw GLSL Shaders** | WebGL2 SDF Raymarching + Fragment Shaders (`shaders/cosmicShaders.js`) | `glsl-synthwave-surf`, `shader-pulse-survivor` |
| **ROT.js & D3.js Strategy** | ROT.js Roguelike + D3.js Force-Graph RTS (`vendor/rot.min.js`, `vendor/d3.min.js`) | `astral-roguelike-crawl`, `d3-galactic-conquest`, `phaser-stealth-heist` FOV |
| **TypeScript Core** | Strict TypeScript + BFS/GF(2)/Unique Solvers (`ts/puzzleEngine.ts`) | 12 logic & cipher puzzles (`js/ts_compiled/puzzleEngine.js`) |
| **Rigid-Body 2D Physics** | Matter.js (`vendor/matter.min.js`) | 7 gravity, tether, lander, pinball, golf & balance games |
| **2D WebGL2 Flagship** | PixiJS v8 + pixi-filters (`hangar.html`, `game.html`) | *Cosmic Survivors* (8 ships, 4 5600×5600 arenas, 5 modes, 53 modules) |
| **UI, Search & Cutscenes** | `js/cutscenePlayer.js`, Fuse.js, Howler.js, Chart.js, GSAP, Panzoom | 60 FPS Season 1 cutscenes, portal discovery, telemetry & EN/TR shell |

---

## Captain Nova Vex — 24-Chapter Season 1 Saga (`story.html`)

| Act / Ch. | Title (EN / TR) | Biome Sector | Mission Route |
| :--- | :--- | :--- | :--- |
| **Act I · Ch.1** | **Orbital Breach** (*Yörünge İhlali*) | `Sektör 01 — Vesta Karakol Halkası` | [nova-flappy-rift](games/nova-flappy-rift/index.html?chapter=1) |
| **Act I · Ch.2** | **Dockyard Lockout** (*Tersane Kilidi*) | `Sektör 02 — Hyperion Yük Rıhtımı` | [quantum-sokoban](games/quantum-sokoban/index.html?chapter=2) |
| **Act I · Ch.3** | **Crimson Swarm** (*Kızıl Sürü*) | `Sektör 03 — Kızıl Nebula Ablukası` | [boss-gauntlet](games/boss-gauntlet/index.html?chapter=3) |
| **Act I · Ch.4** | **Gravity Singularity** (*Kütleçekim Tekilliği*) | `Sektör 04 — Karayıldız Çekim Kuyusu` | [orbital-slingshot](games/orbital-slingshot/index.html?chapter=4) |
| **Act I · Ch.5** | **Dyson Circuit Matrix** (*Dyson Devre Matrisi*) | `Sektör 05 — Kadim Dyson Halkası` | [circuit-pipe-link](games/circuit-pipe-link/index.html?chapter=5) |
| **Act I · Ch.6** | **3D Hyper-Warp Corridor** (*3D Hiper-Büküm Koridoru*) | `Sektör 06 — Kuantum Büküm Tüneli` | [three-void-interceptor](games/three-void-interceptor/index.html?chapter=6) |
| **Act II · Ch.7** | **Chronos Bullet Paradox** (*Kronos Mermi Paradoksu*) | `Sektör 07 — Kronos Paradoks Çekirdeği` | [wasm-bullet-weave](games/wasm-bullet-weave/index.html?chapter=7) |
| **Act II · Ch.8** | **Infinity Throne** (*Sonsuzluk Tahtı*) | `Sektör 08 — Parçalanan Sonsuzluk Kalesi` | [tower-defense-bastion](games/tower-defense-bastion/index.html?chapter=8) |
| **Act II · Ch.9** | **The Vesta-9 Sabotage** (*Vesta-9 Suikast Dosyası*) | `Sektör 09 — Buzul Kristal Reviri` | [starship-murder-mystery](games/starship-murder-mystery/index.html?chapter=9) |
| **Act II · Ch.10** | **Shattered Armada** (*Kırık Armada Yolu*) | `Sektör 10 — Kızıl Enkaz Kuşağı` | [three-star-slalom](games/three-star-slalom/index.html?chapter=10) |
| **Act II · Ch.11** | **Dark Relay Cipher** (*Kara Röle Şifresi*) | `Sektör 11 — Şimşek İletişim Kulesi` | [typing-cipher-defense](games/typing-cipher-defense/index.html?chapter=11) |
| **Act II · Ch.12** | **Derelict Clone Lab** (*Klon Güvertesi*) | `Sektör 12 — Yarı-İnsan Laboratuvarı` | [astral-roguelike-crawl](games/astral-roguelike-crawl/index.html?chapter=12) |
| **Act III · Ch.13** | **The Molten Foundry** (*Kızıl Dökümhane*) | `Sektör 13 — Hephaestus Volkanik Uydusu` | [moon-rover-3d-odyssey](games/moon-rover-3d-odyssey/index.html?chapter=13) |
| **Act III · Ch.14** | **Monolith Slipstream** (*Monolit Hiper-Tüneli*) | `Sektör 14 — Mor Boyut Geçidi` | [glsl-synthwave-surf](games/glsl-synthwave-surf/index.html?chapter=14) |
| **Act III · Ch.15** | **Dyson Core Breach** (*Dyson Güneş Çekirdeği*) | `Sektör 15 — Altın Güneş Kuşağı` | [exo-metroid-breach](games/exo-metroid-breach/index.html?chapter=15) |
| **Act III · Ch.16** | **Singularity Quarantine** (*Kara Delik Karantinası*) | `Sektör 16 — Zincirli Tekillik Kuyusu` | [wasm-cellular-contain](games/wasm-cellular-contain/index.html?chapter=16) |
| **Act III · Ch.17** | **Phantom Boarding** (*Komuta Gemisine Sızma*) | `Sektör 17 — Kaelen Sancak Koridoru` | [phaser-stealth-heist](games/phaser-stealth-heist/index.html?chapter=17) |
| **Act III · Ch.18** | **Orbit Under Fire** (*Alev Kuşatması*) | `Sektör 18 — Çatlak Köprü Yörüngesi` | [starfox-canyon-ace](games/starfox-canyon-ace/index.html?chapter=18) |
| **Act IV · Ch.19** | **Star-Map Counterstrike** (*Galaktik Karşı Taarruz*) | `Sektör 19 — Altın Konsey Haritası` | [d3-galactic-conquest](games/d3-galactic-conquest/index.html?chapter=19) |
| **Act IV · Ch.20** | **Emerald Rift Push** (*Zümrüt Çekirdek Taarruzu*) | `Sektör 20 — Fırtına Hiper-Sıçrayışı` | [lua-cyber-ops](games/lua-cyber-ops/index.html?chapter=20) |
| **Act IV · Ch.21** | **Firewall in Flames** (*S.A.R.A.'nın Yanması*) | `Sektör 21 — Kuantum Sunucu Kalbi` | [photon-parry-duel](games/photon-parry-duel/index.html?chapter=21) |
| **Act IV · Ch.22** | **Ash at the Horizon** (*Küllenen Ufuk*) | `Sektör 22 — Dretnot Saldırı Hattı` | [shader-pulse-survivor](games/shader-pulse-survivor/index.html?chapter=22) |
| **Act IV · Ch.23** | **The Crimson Colossus** (*Kızıl Kolossus Hesaplaşması*) | `Sektör 23 — Kaelen'in Zirve Platformu` | [phaser-crimson-colossus](games/phaser-crimson-colossus/index.html?chapter=23) |
| **Act IV · Ch.24** | **Season 1 Finale — Into the Rift** (*Sezon Finali — S.A.R.A.'nın Fedakârlığı*) | `Sektör 24 — PARÇALANAN SONSUZLUK` | [asc-blackhole-swarm](games/asc-blackhole-swarm/index.html?chapter=24) |

---

## All 60 Playable Space Games

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
| #51 | [Exo-Metroid Sector Breach](games/exo-metroid-breach/index.html) | Exo-Metroid Sektör İhlali | `survivors` | Phaser 3 | `JS` |
| #52 | [Astral Roguelike Crawl](games/astral-roguelike-crawl/index.html) | Astral Zindan Kâşifi | `tactics` | ROT.js | `JS` |
| #53 | [Moon Rover 3D Odyssey](games/moon-rover-3d-odyssey/index.html) | Ay Gezgini 3D Fizik Rallisi | `physics` | Cannon-es 3D | `JS` |
| #54 | [Starfox 3D Canyon Ace](games/starfox-canyon-ace/index.html) | Yıldız Tilkisi 3D Kanyon Ası | `arcade` | Cannon-es 3D | `JS` |
| #55 | [Lua 5.3 Cyber Drone Ops](games/lua-cyber-ops/index.html) | Lua 5.3 Siber Drone Arenası | `tactics` | Lua 5.3 VM | `LUA` |
| #56 | [Event Horizon: WASM Singularity Swarm](games/asc-blackhole-swarm/index.html) | Olay Ufku: AssemblyScript Sürüsü | `survivors` | AssemblyScript | `WASM` |
| #57 | [Phantom Airlock: Stealth Heist](games/phaser-stealth-heist/index.html) | Korsan Sızması: Phaser Gizlilik Operasyonu | `tactics` | Phaser 3 | `JS` |
| #58 | [D3 Galactic Conquest RTS](games/d3-galactic-conquest/index.html) | D3 Galaktik Fethiyye RTS | `tactics` | D3.js Engine | `JS` |
| #59 | [GLSL Synthwave Tunnel Surf](games/glsl-synthwave-surf/index.html) | GLSL Raymarch Hiper Sörf | `reflex` | GLSL Raymarch | `GLSL` |
| #60 | [Crimson Colossus: Boss Raid](games/phaser-crimson-colossus/index.html) | Kızıl Kolossus: Boss Baskını | `arcade` | Phaser 3 | `JS` |

---

## Project Structure

```text
COSMIC/
├── index.html                  # v11.5 Portfolio Multi-Game Portal & Search Hub (EN/TR)
├── story.html                  # Captain Nova Vex 24-Chapter Season 1 Saga + Animated Cutscenes
├── arcade.html                 # Universal Arcade Player Shell & Pre-Game Start Menu
├── hangar.html                 # Cosmic Survivors Flagship Hangar (8 Ships, 5 Modes)
├── game.html / game.js         # PixiJS v8 Flagship Survival Arena Engine
├── armory.html / modes.html    # Fleet R&D Bay, Liveries, Daily Seeded Protocol
├── tree.html / wiki.html       # Interactive Panzoom Evolution Tree & 53-Module Wiki
├── about.html                  # Technical Architecture, Controls, FAQ & MIT License
├── games/<slug>/index.html     # 60 Dedicated SEO Game Pages + VideoGame & BreadcrumbList Schema
├── assembly/ & wasm/           # AssemblyScript (cosmic_adv.ts -> .wasm) & WAT (cosmic_sim.wasm)
├── lua/mission_kernel.lua      # Embedded Lua 5.3 drone tactics script for Fengari VM
├── ts/ & js/ts_compiled/       # Strict TypeScript puzzle solver engine + compiled output
├── shaders/cosmicShaders.js    # Custom WebGL2 GLSL vertex & fragment shaders
├── js/cutscenePlayer.js        # 60 FPS Live Canvas Cutscene Renderer for Season 1 Saga
├── js/games/                   # pack_phaser, pack_advanced3d, pack_multilang, pack_three, pack_reflex, pack_matter, pack_arcade, pack_puzzles, pack_tactics, pack_mystery
├── assets/v11/                 # 24 chapter keyarts, 4 cast portraits, 25 sprites, 60 logos, 60 posters
├── vendor/                     # Offline bundled Phaser 3, Three.js, Cannon-es, ROT.js, Fengari Lua, D3.js, PixiJS v8, Matter.js, Fuse.js, Howler.js, Chart.js
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
