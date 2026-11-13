// =============================================================================
// COSMIC UNIVERSE v11.0 — 50-GAME ARCADE CATALOG & PERSISTENCE STORE
// Exposes window.COSMIC_ARCADE_GAMES and window.CosmicArcadeStore
// =============================================================================
(function (global) {
    'use strict';

    const STORAGE_KEY = 'cosmic_v11_arcade';

    const RAW_GAMES = [
        // ── SURVIVORS (1..6) ─────────────────────────────────────────────────
        {
            id: 'cosmic-survivors',
            category: 'survivors',
            engine: 'PixiJS v8',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#00f0ff',
            sprite: 'fighter',
            storyChapter: null,
            isFlagship: true,
            title: { tr: 'Kozmik Hayatta Kalanlar (Ana Sefer)', en: 'Cosmic Survivors (Flagship)' },
            tagline: { tr: '8 yıldız gemisi, 4 arena, 32+ evrimsel silah sinerjisiyle tam ölçekli uzay savaşı.', en: 'Full-scale space survival with 8 starships, 4 arenas, and 32+ evolutionary weapon synergies.' },
            controls: { tr: 'WASD / Ok Tuşları ile uç, Space ile Overdrive, otomatik ateş.', en: 'WASD / Arrows to pilot, Space for Overdrive, auto-fire.' },
            objective: { tr: 'Dalgaları yar, XP kristallerini topla, Mega Evrimleri aç ve Bossları yok et.', en: 'Break enemy waves, collect XP crystals, unlock Mega Evolutions, and defeat Bosses.' }
        },
        {
            id: 'boss-gauntlet',
            category: 'survivors',
            engine: 'PixiJS v8',
            lang: 'JS',
            difficulty: 4,
            hasLevels: false,
            maxLevel: 1,
            accent: '#ff3b6b',
            sprite: 'boss_core',
            storyChapter: 3,
            isFlagship: false,
            title: { tr: 'Kızıl Sürü: Boss Arenası', en: 'Boss Gauntlet' },
            tagline: { tr: 'Ardışık elit komuta çekirdeklerine karşı kesintisiz mermi dansı ve evrim düellosu.', en: 'Nonstop bullet-pattern duel against escalating crimson command cores.' },
            controls: { tr: 'WASD / Fare ile manevra yap, Space ile ani kaçış (Dash) kullan.', en: 'WASD / Mouse to maneuver, Space to trigger emergency Dash.' },
            objective: { tr: 'Aşama bosslarının zayıf çekirdeğini parçala ve 1500+ puana ulaş.', en: 'Shatter sequential boss cores and surpass 1,500 points.' }
        },
        {
            id: 'three-void-interceptor',
            category: 'survivors',
            engine: 'Three.js 3D',
            lang: 'JS',
            difficulty: 4,
            hasLevels: false,
            maxLevel: 1,
            accent: '#7c5cff',
            sprite: 'fighter',
            storyChapter: 6,
            isFlagship: false,
            title: { tr: '3D Hipertünel Avcısı', en: '3D Void Interceptor' },
            tagline: { tr: 'Üç boyutlu hiper-uzay koridorunda tam derinlikli üç eksenli it dalaşı.', en: 'Full-depth 3D dogfighting inside a warping hyperspace corridor.' },
            controls: { tr: 'WASD / Ok Tuşları ile 3D eksende yönel, Space ile plazma salvo.', en: 'WASD / Arrows to steer in 3D space, Space for plasma salvo.' },
            objective: { tr: 'Hiper-tünel bariyerlerinden kaç, düşman filolarını avla ve 1200+ skor yap.', en: 'Evade warp barriers, hunt enemy squadrons, and reach 1,200+ score.' }
        },
        {
            id: 'three-star-slalom',
            category: 'survivors',
            engine: 'Three.js 3D',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#38bdf8',
            sprite: 'asteroid',
            storyChapter: 10,
            isFlagship: false,
            title: { tr: '3D Yıldız Slalomu', en: '3D Star Slalom' },
            tagline: { tr: 'Yüksek hızlı asteroit kuşağında 3D refleks slalomu ve kapı komboları.', en: 'High-velocity 3D reflex slalom and boost-gate chaining in an asteroid belt.' },
            controls: { tr: 'A/D veya Sol/Sağ oklarla yan yatış, W/S ile irtifa ayarı.', en: 'A/D or Left/Right to bank, W/S to adjust altitude.' },
            objective: { tr: 'Enerji halkalarından geçerek çarpanını büyüt ve kayalara çarpma.', en: 'Thread energy rings to multiply your score without colliding with rocks.' }
        },
        {
            id: 'wasm-bullet-weave',
            category: 'survivors',
            engine: 'WebAssembly',
            lang: 'WASM',
            difficulty: 5,
            hasLevels: false,
            maxLevel: 1,
            accent: '#f59e0b',
            sprite: 'plasma_bomb',
            storyChapter: 7,
            isFlagship: false,
            title: { tr: 'WASM Mermi Dokumacı', en: 'WASM Bullet Weave' },
            tagline: { tr: 'WebAssembly çekirdeğiyle 2000+ eşzamanlı mermi arasında milimetrik sıyrılma.', en: 'Thread through 2,000+ simultaneous projectiles driven by a WebAssembly core.' },
            controls: { tr: 'Fare veya WASD ile çekirdek hitboxını yönlendir, Shift ile hassas yavaşlama.', en: 'Mouse or WASD to guide your core hitbox, Shift for precision focus.' },
            objective: { tr: 'Zaman paradoksu barajından sağ çık ve 1000+ hayatta kalma skoru topla.', en: 'Survive the chronos bullet barrage and achieve 1,000+ survival score.' }
        },
        {
            id: 'shader-pulse-survivor',
            category: 'survivors',
            engine: 'GLSL WebGL2',
            lang: 'GLSL',
            difficulty: 4,
            hasLevels: false,
            maxLevel: 1,
            accent: '#e879f9',
            sprite: 'portal_vortex',
            storyChapter: 22,
            isFlagship: false,
            title: { tr: 'GLSL Ufuk Nabzı', en: 'Shader Pulse Survivor' },
            tagline: { tr: 'Gerçek zamanlı GLSL yerçekimi merceği ve genişleyen şok dalgalarına karşı diren.', en: 'Endure real-time GLSL gravitational lensing and expanding danger shockwaves.' },
            controls: { tr: 'WASD / Fare ile olay ufkunda pozisyon al, Space ile faz sıçraması yap.', en: 'WASD / Mouse to reposition around the horizon, Space to phase-blink.' },
            objective: { tr: 'Genişleyen plazma şok halkalarının üzerinden atla ve rezonans kürelerini topla.', en: 'Phase across expanding plasma shockwaves and collect resonance orbs.' }
        },

        // ── REFLEX (7..16) ───────────────────────────────────────────────────
        {
            id: 'nova-flappy-rift',
            category: 'reflex',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 2,
            hasLevels: false,
            maxLevel: 1,
            accent: '#22d3ee',
            sprite: 'astronaut',
            storyChapter: 1,
            isFlagship: false,
            title: { tr: 'Nova Yarık Sıçrayışı', en: 'Nova Flappy Rift' },
            tagline: { tr: 'Yörüngedeki iyon kapılarından itici darbelerle süzülen mikro yerçekimi testi.', en: 'Micro-gravity thruster timing through orbital plasma rift gates.' },
            controls: { tr: 'Space / Tık / Yukarı Ok ile itici ateşle.', en: 'Space / Click / Up Arrow to pulse jump thrusters.' },
            objective: { tr: 'Plazma sütunlarına çarpmadan en az 8 yarık kapısından geç.', en: 'Pass through at least 8 rift gates without grazing plasma pylons.' }
        },
        {
            id: 'gravity-flip-runner',
            category: 'reflex',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#34d399',
            sprite: 'astronaut',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Yerçekimi Ters Çeviren Koşucu', en: 'Gravity Flip Runner' },
            tagline: { tr: 'Tavan ve zemin arasında kutup değiştirerek lazer tünellerinde koş.', en: 'Invert polarity between floor and ceiling across high-speed laser corridors.' },
            controls: { tr: 'Space / Tık ile yerçekimi yönünü tersine çevir.', en: 'Space / Click to invert gravity polarity.' },
            objective: { tr: 'Boşluklardan ve elektrik tuzaklarından kaçarak kesintisiz mesafe kat et.', en: 'Avoid hull gaps and arc traps to push your maximum distance.' }
        },
        {
            id: 'orbital-dash-ring',
            category: 'reflex',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#a78bfa',
            sprite: 'warp_ring',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Yörünge Atılma Halkası', en: 'Orbital Dash Ring' },
            tagline: { tr: 'Dönen halka yörüngeleri arasında tam zamanında sıçrayarak çekirdeğe in.', en: 'Snap between rotating orbital rings with split-second dash timing.' },
            controls: { tr: 'Space / Tık ile iç veya dış yörünge halkasına atıl.', en: 'Space / Click to dash to the next orbital track.' },
            objective: { tr: 'Dönen lazer süpürücülerinden kaçıp enerji kristallerini topla.', en: 'Dodge sweeping orbital lasers while harvesting energy shards.' }
        },
        {
            id: 'warp-lane-dodger',
            category: 'reflex',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 2,
            hasLevels: false,
            maxLevel: 1,
            accent: '#60a5fa',
            sprite: 'fighter',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Büküm Şeridi Kaçışı', en: 'Warp Lane Dodger' },
            tagline: { tr: 'Beş şeritli hiper-otoyolda gelen enkaz konvoyları arasından makas at.', en: 'Weave across five hyperspace traffic lanes through oncoming debris convoys.' },
            controls: { tr: 'A/D veya Sol/Sağ oklar ile şerit değiştir, W ile kısa turbo.', en: 'A/D or Left/Right to switch lanes, W for short nitro.' },
            objective: { tr: 'Yakın sıyrılmalarla hız bonusunu artır ve en uzun hayatta kalma rekorunu kır.', en: 'Chain near-misses for multiplier bonuses and survive rising speeds.' }
        },
        {
            id: 'photon-parry-duel',
            category: 'reflex',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 4,
            hasLevels: false,
            maxLevel: 1,
            accent: '#facc15',
            sprite: 'shield_battery',
            storyChapter: 21,
            isFlagship: false,
            title: { tr: 'Foton Savuşturma Düellosu', en: 'Photon Parry Duel' },
            tagline: { tr: 'Dört yönden gelen enerji atışlarını kusursuz zamanlamayla geri yansıt.', en: 'Deflect incoming four-directional energy bolts with frame-tight parry timing.' },
            controls: { tr: 'W/A/S/D veya Ok Tuşları ile kalkan yönünü seç ve darbe anında savuştur.', en: 'W/A/S/D or Arrows to face and parry incoming bolts on impact.' },
            objective: { tr: 'Kusursuz savuşturma zinciri kurarak kombo sayacını zirveye taşı.', en: 'Build an unbroken perfect-parry streak as salvo tempo accelerates.' }
        },
        {
            id: 'meteor-jetpack-rise',
            category: 'reflex',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#fb923c',
            sprite: 'astronaut',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Meteor Sırt Roketi Yükselişi', en: 'Meteor Jetpack Rise' },
            tagline: { tr: 'Çöken atmosferden sırt roketinle yükselirken düşen meteorlardan sıyrıl.', en: 'Ascend out of a collapsing atmosphere while dodging plummeting meteors.' },
            controls: { tr: 'A/D ile yatay süzül, Space / W basılı tutarak iticiyi yak.', en: 'A/D to strafe, hold Space / W to burn jetpack fuel.' },
            objective: { tr: 'Yakıt kapsüllerini yakala ve irtifa rekorunu yukarı taşı.', en: 'Grab fuel cells along the climb and reach new altitude records.' }
        },
        {
            id: 'helix-station-drop',
            category: 'reflex',
            engine: 'Three.js 3D',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#f43f5e',
            sprite: 'warp_ring',
            storyChapter: null,
            isFlagship: false,
            title: { tr: '3D Sarmal İstasyon Düşüşü', en: 'Helix Station Drop' },
            tagline: { tr: 'Üç boyutlu dönen reaktör kulesinin yarıklarından aşağıya hızla süzül.', en: 'Drop through rotating 3D reactor platform gaps while avoiding hazard sectors.' },
            controls: { tr: 'A/D veya Fare sürükleme ile 3D sarmal kuleyi döndür.', en: 'A/D or drag Mouse to rotate the 3D helix tower.' },
            objective: { tr: 'Kırmızı plazma dilimlerine değmeden art arda katmanları delip geç.', en: 'Smash through consecutive layers without touching red plasma wedges.' }
        },
        {
            id: 'laser-limbo-dash',
            category: 'reflex',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 4,
            hasLevels: false,
            maxLevel: 1,
            accent: '#ef4444',
            sprite: 'plasma_bomb',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Lazer Altından Atılma', en: 'Laser Limbo Dash' },
            tagline: { tr: 'Süpüren güvenlik ızgaralarının tam altından kay ve faz kapılarını aş.', en: 'Slide cleanly beneath sweeping security beams and dash through phase gates.' },
            controls: { tr: 'A/D hareket, S/Aşağı ile kayma (Slide), Space ile atılma.', en: 'A/D move, S/Down to slide under beams, Space to phase-dash.' },
            objective: { tr: 'Giderek hızlanan lazer koridorunda tek çizik almadan ilerle.', en: 'Navigate accelerating security corridors without tripping a beam.' }
        },
        {
            id: 'starlight-rhythm-pulse',
            category: 'reflex',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#ec4899',
            sprite: 'energy_prism',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Yıldız Işığı Ritim Nabzı', en: 'Starlight Rhythm Pulse' },
            tagline: { tr: 'Dört kanallı sentez nabzına uyarak gelen ışık notalarını tam vuruşta yakala.', en: 'Lock onto 4-lane synthwave light notes on the exact beat window.' },
            controls: { tr: 'D / F / J / K veya Ok Tuşları ile 4 şeritte vuruş yap.', en: 'D / F / J / K or Arrow Keys to strike notes across 4 lanes.' },
            objective: { tr: 'Mükemmel zamanlama kombosunu koruyarak rezonans senkronunu tamamla.', en: 'Maintain high combo accuracy to complete the harmonic overdrive.' }
        },
        {
            id: 'starship-murder-mystery',
            category: 'tactics',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 3,
            accent: '#f43f5e',
            sprite: 'boss_core',
            storyChapter: 9,
            isFlagship: false,
            title: { tr: 'Vesta-9: Uzay Gemisi Cinayet Dosyası', en: 'Silent Airlock: Starship Murder Mystery' },
            tagline: { tr: 'Sabotaja uğrayan kruvazörde odaları tara, adli delilleri topla, yalan ifadeleri çürüt ve katili açığa çıkar.', en: 'Inspect rooms aboard a sabotaged starcruiser, scan forensics, break alibis, and expose the killer across 3 cases.' },
            controls: { tr: 'Fare ile odalara, kanıt tarayıcılarına, şüphelilere ve suçlama paneline tıkla.', en: 'Mouse click rooms, evidence scanners, crew suspects, and the final verdict panel.' },
            objective: { tr: '3 farklı gizem vakasında doğru katili ve cinayet aracını kanıtlarla yakala.', en: 'Solve 3 sci-fi murder cases by uncovering contradicting logs and identifying culprit + weapon.' }
        },

        // ── ARCADE (17..25) ──────────────────────────────────────────────────
        {
            id: 'galaga-swarm-assault',
            category: 'arcade',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#38bdf8',
            sprite: 'ufo',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Galaktik Sürü Taarruzu', en: 'Galaga Swarm Assault' },
            tagline: { tr: 'Formasyon halinde dalan uzaylı filolarına karşı klasik dikey nişancı.', en: 'Classic vertical formation shooter against diving alien squadrons.' },
            controls: { tr: 'A/D veya Ok Tuşları ile süzül, Space ile çift lazer ateşle.', en: 'A/D or Arrows to strafe, Space to fire twin lasers.' },
            objective: { tr: 'Dalga formasyonlarını temizle ve yakalanan eşlikçi gemileri kurtar.', en: 'Clear diving formations and rescue captured wingman drones.' }
        },
        {
            id: 'defender-patrol',
            category: 'arcade',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 4,
            hasLevels: false,
            maxLevel: 1,
            accent: '#22c55e',
            sprite: 'fighter',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Yatay Sektör Muhafızı', en: 'Defender Patrol' },
            tagline: { tr: 'Döngüsel gezegen ufkunda kolonistleri kaçıran akıncıları avla.', en: 'Patrol a wrap-around planetary horizon to stop raiders abducting colonists.' },
            controls: { tr: 'WASD / Oklar ile yön değiştir ve hızlan, Space ile ateş, B ile Akıllı Bomba.', en: 'WASD / Arrows to thrust and steer, Space fires, B triggers Smart Bomb.' },
            objective: { tr: 'Kolonistleri havada yakalayıp yüzeye güvenle geri bırak.', en: 'Intercept abductors and catch falling colonists safely.' }
        },
        {
            id: 'astro-vector-asteroids',
            category: 'arcade',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#94a3b8',
            sprite: 'asteroid',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Astro Vektör Asteroitler', en: 'Astro Vector Asteroids' },
            tagline: { tr: 'Atalet fiziğiyle dönen vektör gemisiyle dev kaya parçalarını parçala.', en: 'Inertia-driven vector ship combat against splitting asteroid fields.' },
            controls: { tr: 'A/D döndür, W itiş ver, Space ateş et, Shift ile hiper-sıçrama.', en: 'A/D rotate, W thrust, Space fire, Shift for emergency hyperspace.' },
            objective: { tr: 'Parçalanan asteroitleri ve pusu kuran UFO avcılarını temizle.', en: 'Break down drifting boulders and eliminate ambushing UFO scouts.' }
        },
        {
            id: 'cosmic-snake-leviathan',
            category: 'arcade',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 2,
            hasLevels: false,
            maxLevel: 1,
            accent: '#10b981',
            sprite: 'alien_drone',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Kozmik Yılan Leviathan', en: 'Cosmic Snake Leviathan' },
            tagline: { tr: 'Kuyruğunu uzatan enerji çekirdeklerini yutarak neon ızgaraya hükmet.', en: 'Grow an energy leviathan across a glowing cosmic grid without self-collision.' },
            controls: { tr: 'WASD veya Ok Tuşları ile yön ver.', en: 'WASD or Arrow Keys to steer.' },
            objective: { tr: 'Süpernova çekirdeklerini topla, duvarlara ve kendi gövdene çarpma.', en: 'Consume energy cores while avoiding arena walls and your own tail.' }
        },
        {
            id: 'quantum-brick-breaker',
            category: 'arcade',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 2,
            hasLevels: false,
            maxLevel: 1,
            accent: '#06b6d4',
            sprite: 'energy_prism',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Kuantum Blok Kırıcı', en: 'Quantum Brick Breaker' },
            tagline: { tr: 'Çoklu top, lazer paleti ve plazma güçlendiricilerle zırh bloklarını dağıt.', en: 'Shatter quantum armor grids with multi-ball splits and laser paddles.' },
            controls: { tr: 'Fare veya A/D ile enerji paletini kaydır, Space ile topu fırlat.', en: 'Mouse or A/D to slide the energy paddle, Space to launch.' },
            objective: { tr: 'Tüm kristal matrisini kır ve düşen modül kapsüllerini yakala.', en: 'Clear the crystal matrix and catch falling weapon upgrades.' }
        },
        {
            id: 'twin-paddle-pong',
            category: 'arcade',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 2,
            hasLevels: false,
            maxLevel: 1,
            accent: '#818cf8',
            sprite: 'warp_ring',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'İkiz Palet Kuantum Pong', en: 'Twin Paddle Pong' },
            tagline: { tr: 'Falso ve hızlanan enerji küresiyle yapay zekaya karşı yüksek tempolu düello.', en: 'High-speed spin-physics energy duel against an adaptive AI keeper.' },
            controls: { tr: 'W/S, Yukarı/Aşağı veya Fare ile enerji paletini yönet.', en: 'W/S, Up/Down, or Mouse to control your energy paddle.' },
            objective: { tr: 'Ralliyi falsolu vuruşlarla hızlandır ve 7 puana ilk ulaşan ol.', en: 'Accelerate rallies with angled spin shots and be first to 7 points.' }
        },
        {
            id: 'centipede-spore-purge',
            category: 'arcade',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#84cc16',
            sprite: 'alien_drone',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Spor Kırkayağı İmhası', en: 'Centipede Spore Purge' },
            tagline: { tr: 'Spor mantarları arasında kıvrılan bölünebilir biyo-makineyi parçala.', en: 'Blast apart a segmented bio-centipede weaving through crystal spores.' },
            controls: { tr: 'WASD / Oklar ile alt bölgede manevra yap, Space ile seri ateş.', en: 'WASD / Arrows to maneuver in the defense zone, Space to fire.' },
            objective: { tr: 'Tüm kırkayak halkalarını ve zehirli spor örümceklerini temizle.', en: 'Eliminate every segment and intercept descending spore drones.' }
        },
        {
            id: 'missile-dome-defense',
            category: 'arcade',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#f97316',
            sprite: 'laser_turret',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Füze Kubbe Savunması', en: 'Missile Dome Defense' },
            tagline: { tr: 'Yağan yörünge bombalarını önleme patlamalarıyla gökyüzünde imha et.', en: 'Intercept falling orbital warheads mid-air with timed blast domes.' },
            controls: { tr: 'Fare ile hedef al ve Tıkla (veya 1/2/3 bataryalarını kullan).', en: 'Aim with Mouse and Click to launch counter-interceptor blasts.' },
            objective: { tr: 'Üs kubbelerini koru ve zincirleme şok patlamalarıyla mühimmat tasarrufu yap.', en: 'Protect all base domes by chaining overlapping airbursts.' }
        },
        {
            id: 'lunar-excavator',
            category: 'arcade',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#eab308',
            sprite: 'cryo_crystal',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Ay Yüzeyi Kazıcısı', en: 'Lunar Excavator' },
            tagline: { tr: 'Yeraltı tünelleri kaz, krater kayalarını düşür ve mağara avcılarını şişir.', en: 'Tunnel beneath lunar strata, drop boulders, and neutralize cave stalkers.' },
            controls: { tr: 'WASD / Oklar ile kaz, Space ile yüksek basınçlı plazma zıpkını kullan.', en: 'WASD / Arrows to dig, Space to fire the pressure harpoon.' },
            objective: { tr: 'Değerli kriyo kristallerini çıkarırken derinliklerdeki tüm tehditleri temizle.', en: 'Clear subterranean threats while extracting rare cryo crystals.' }
        },

        // ── PUZZLE (26..37) ──────────────────────────────────────────────────
        {
            id: 'quantum-sokoban',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 12,
            accent: '#fbbf24',
            sprite: 'cargo_crate',
            storyChapter: 2,
            isFlagship: false,
            title: { tr: 'Kuantum Kargo Sokoban', en: 'Quantum Sokoban' },
            tagline: { tr: 'Tersane kilitlerini açmak için enerji sandıklarını manyetik yuvalara it.', en: 'Push heavy quantum cargo crates onto magnetic dock pads across 12 decks.' },
            controls: { tr: 'WASD / Oklar ile it, Z ile hamle geri al, R ile bölümü sıfırla.', en: 'WASD / Arrows to push, Z to undo step, R to reset stage.' },
            objective: { tr: '12 tersane bulmacasında tüm sandıkları hedef plakalara yerleştir.', en: 'Seat every crate on its dock pad across 12 engineered stages.' }
        },
        {
            id: 'laser-mirror-grid',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 10,
            accent: '#38bdf8',
            sprite: 'energy_prism',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Lazer Ayna Matrisi', en: 'Laser Mirror Grid' },
            tagline: { tr: 'Aynaları ve prizmaları döndürerek foton ışınını tüm alıcı düğümlere ulaştır.', en: 'Rotate reflectors and beam splitters to energize every target receptor.' },
            controls: { tr: 'Aynalara tıklayarak 45°/90° döndür veya sürükle.', en: 'Click mirrors and prisms to rotate beam angles.' },
            objective: { tr: '10 optik devrede tüm alıcı kristalleri aynı anda besle.', en: 'Power all target crystals simultaneously across 10 optical circuits.' }
        },
        {
            id: 'circuit-pipe-link',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 8,
            accent: '#00f0ff',
            sprite: 'warp_ring',
            storyChapter: 5,
            isFlagship: false,
            title: { tr: 'Dyson Devre Bağlantısı', en: 'Circuit Pipe Link' },
            tagline: { tr: 'Dyson küresi enerji hatlarını sızıntısız kapalı devre haline getir.', en: 'Rotate Dyson power conduits into a leak-free closed plasma loop.' },
            controls: { tr: 'Devre karolarına tıkla ve yönünü çevir.', en: 'Click conduit tiles to rotate connections.' },
            objective: { tr: 'Tüm reaktör düğümlerini tek kesintisiz akış ağına bağla.', en: 'Connect all reactor nodes into one continuous energized network.' }
        },
        {
            id: 'quantum-2048',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 2,
            hasLevels: false,
            maxLevel: 1,
            accent: '#f59e0b',
            sprite: 'coin_star',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Kuantum 2048 Füzyonu', en: 'Quantum 2048' },
            tagline: { tr: 'Eşleşen izotop karolarını birleştirerek 2048 süper çekirdeğine ulaş.', en: 'Merge matching isotope tiles across the 4x4 grid to forge the 2048 core.' },
            controls: { tr: 'WASD / Oklar veya kaydırma ile tüm matrisi it.', en: 'WASD / Arrows or swipe to slide and fuse matching tiles.' },
            objective: { tr: 'Izgarayı kilitlemeden 2048 ve ötesindeki füzyon katmanlarına ulaş.', en: 'Reach the 2048 singularity tile and push your high score higher.' }
        },
        {
            id: 'nebula-minesweeper',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 3,
            accent: '#ef4444',
            sprite: 'plasma_bomb',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Nebula Mayın Tarlası', en: 'Nebula Minesweeper' },
            tagline: { tr: 'Sayısal sensör verilerini okuyarak plazma mayınlarını hatasız işaretle.', en: 'Deduce hidden plasma mines from proximity sensor readings across 3 sectors.' },
            controls: { tr: 'Sol Tık ile tarama aç, Sağ Tık (veya F) ile mayın bayrağı koy.', en: 'Left Click to scan cell, Right Click (or F) to flag a plasma mine.' },
            objective: { tr: 'Hiçbir mayını tetiklemeden tüm güvenli sektör karelerini aç.', en: 'Reveal every safe sector tile without detonating a single mine.' }
        },
        {
            id: 'match3-isotope-core',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 2,
            hasLevels: true,
            maxLevel: 8,
            accent: '#2dd4bf',
            sprite: 'cryo_crystal',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'İzotop Eşleştirme Çekirdeği', en: 'Match-3 Isotope Core' },
            tagline: { tr: 'Zincirleme kristal füzyonlarıyla hamle sınırı dolmadan reaktörü şarj et.', en: 'Trigger cascading 3+ crystal fusions to charge the core within move limits.' },
            controls: { tr: 'İki komşu kristale sırayla tıkla ve yerlerini değiştir.', en: 'Click two adjacent crystals to swap and form 3+ chains.' },
            objective: { tr: '8 aşamada hedef enerji kotasını doldur ve hiper-kristaller üret.', en: 'Meet the target energy quota across 8 levels using cascade combos.' }
        },
        {
            id: 'lights-out-array',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 10,
            accent: '#a855f7',
            sprite: 'shield_battery',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Işıkları Söndür Dizisi', en: 'Lights-Out Array' },
            tagline: { tr: 'Artı şeklinde komşu hücreleri tersleyerek tüm aşırı yüklenmiş panelleri kapat.', en: 'Toggle orthogonal cell clusters to neutralize every overloaded grid node.' },
            controls: { tr: 'Bir düğüme tıkla; kendisi ve 4 komşusunun durumu terslenir.', en: 'Click any node to invert itself and its 4 orthogonal neighbors.' },
            objective: { tr: '10 devre panosunu minimum hamlede tamamen söndür.', en: 'Turn off all glowing nodes across 10 boards in minimal moves.' }
        },
        {
            id: 'memory-star-matrix',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 2,
            hasLevels: true,
            maxLevel: 6,
            accent: '#fcd34d',
            sprite: 'coin_star',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Yıldız Hafıza Matrisi', en: 'Memory Star Matrix' },
            tagline: { tr: 'Parlayan yıldız dizilerini hafızana kazı ve çiftleri hatasız eşleştir.', en: 'Memorize cosmic glyph pairs and pattern flashes across 6 expanding grids.' },
            controls: { tr: 'Fare ile kapalı matris kartlarını seç ve eşle.', en: 'Click concealed matrix cells to uncover and pair matching glyphs.' },
            objective: { tr: '6 zorluk seviyesinde en az hata ile tüm çiftleri açığa çıkar.', en: 'Match all pairs with high accuracy across 6 escalating grid sizes.' }
        },
        {
            id: 'nonogram-star-map',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 4,
            hasLevels: true,
            maxLevel: 8,
            accent: '#60a5fa',
            sprite: 'asteroid',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Nonogram Yıldız Haritası', en: 'Nonogram Star Map' },
            tagline: { tr: 'Satır ve sütun sayısal ipuçlarını çözerek gizli takımyıldızı piksel sanatını bul.', en: 'Deduce row and column run-lengths to reconstruct 8 hidden star charts.' },
            controls: { tr: 'Sol Tık ile kareyi doldur, Sağ Tık ile boş olarak işaretle (X).', en: 'Left Click to fill cell, Right Click to mark empty (X).' },
            objective: { tr: '8 mantık haritasında tüm yıldız piksellerini hatasız tamamla.', en: 'Complete all 8 logic grids cleanly with zero false placements.' }
        },
        {
            id: 'hanoi-warp-cores',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 5,
            accent: '#c084fc',
            sprite: 'warp_ring',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Hanoi Büküm Çekirdekleri', en: 'Hanoi Warp Cores' },
            tagline: { tr: 'Büyük diski küçüğün üstüne koymadan reaktör halkalarını hedef sütuna taşı.', en: 'Transfer concentric warp rings to the target pylon without stacking larger over smaller.' },
            controls: { tr: 'Kaynak sütuna sonra hedef sütuna tıkla (veya 1/2/3 tuşları).', en: 'Click source then destination pylon (or press 1/2/3 keys).' },
            objective: { tr: '5 çekirdek yığınını optimal hamle sayısına yakın tamamla.', en: 'Solve 5 escalating ring stacks near optimal move efficiency.' }
        },
        {
            id: 'wasm-cellular-contain',
            category: 'puzzle',
            engine: 'WebAssembly',
            lang: 'WASM',
            difficulty: 4,
            hasLevels: true,
            maxLevel: 8,
            accent: '#10b981',
            sprite: 'alien_drone',
            storyChapter: 16,
            isFlagship: false,
            title: { tr: 'WASM Hücresel Karantina', en: 'WASM Cellular Containment' },
            tagline: { tr: 'WebAssembly hücresel otomatonla yayılan siber-spor enfeksiyonunu duvarlarla hapset.', en: 'Contain a fast WASM cellular-automaton infection using limited firewall walls.' },
            controls: { tr: 'Izgara karelerine tıklayarak güvenlik duvarı (1) ör ve adımı başlat.', en: 'Click grid cells to place firewall barriers and run propagation.' },
            objective: { tr: '8 karantina haritasında enfeksiyon yayılımını hedef oranın altında tut.', en: 'Seal the outbreak below the infection threshold across 8 containment maps.' }
        },
        {
            id: 'orbital-sudoku-mini',
            category: 'puzzle',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 6,
            accent: '#38bdf8',
            sprite: 'energy_prism',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Yörünge Mini Sudoku', en: 'Orbital Sudoku Mini' },
            tagline: { tr: '6x6 ve 4x4 yörünge bloklarında her satır, sütun ve bölgede benzersiz frekans kur.', en: 'Balance unique frequency digits across every row, column, and orbital block.' },
            controls: { tr: 'Hücreye tıkla ve 1-6 rakam tuşları ya da alt paletle doldur.', en: 'Select a cell and enter digits 1-6 via keyboard or pad.' },
            objective: { tr: '6 farklı yörünge şifresini hatasız mantık çıkarımıyla çöz.', en: 'Solve all 6 orbital matrix puzzles with zero frequency conflicts.' }
        },

        // ── PHYSICS (38..44) ─────────────────────────────────────────────────
        {
            id: 'orbital-slingshot',
            category: 'physics',
            engine: 'Matter.js',
            lang: 'JS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 10,
            accent: '#8b5cf6',
            sprite: 'portal_vortex',
            storyChapter: 4,
            isFlagship: false,
            title: { tr: 'Yörünge Sapanı (Tekillik)', en: 'Orbital Slingshot' },
            tagline: { tr: 'Gezegen kütleçekim kuyularından sapan etkisiyle bükülerek solucan deliğine gir.', en: 'Curve probes around planetary gravity wells to reach the exit singularity.' },
            controls: { tr: 'Sondadan geriye sürükleyip fırlatma açısını ve gücünü ayarla.', en: 'Drag back from the probe to aim launch angle and velocity.' },
            objective: { tr: '10 yörünge bulmacasında tekillik kapısına tek veya en az atışta ulaş.', en: 'Thread the probe into the portal across 10 gravity-well stages.' }
        },
        {
            id: 'moon-lander-apollo',
            category: 'physics',
            engine: 'Matter.js',
            lang: 'JS',
            difficulty: 4,
            hasLevels: true,
            maxLevel: 5,
            accent: '#cbd5e1',
            sprite: 'moon_lander',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Ay İniş Modülü Apollo', en: 'Moon Lander Apollo' },
            tagline: { tr: 'Sınırlı yakıt ve hassas dikey hız kontrolüyle krater pistine yumuşak iniş yap.', en: 'Touch down softly on lunar pads while managing fuel and vertical descent speed.' },
            controls: { tr: 'W / Yukarı Ok ana motor, A/D ile yan iticiler.', en: 'W / Up Arrow for main thruster, A/D for attitude thrusters.' },
            objective: { tr: '5 farklı gezegen yerçekimi altında aracını kırmadan piste indir.', en: 'Land cleanly on target pads across 5 planetary gravity stages.' }
        },
        {
            id: 'cosmic-pinball-rig',
            category: 'physics',
            engine: 'Matter.js',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#f43f5e',
            sprite: 'plasma_bomb',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Kozmik Langırt / Tilt Masası', en: 'Cosmic Pinball Rig' },
            tagline: { tr: 'Yüksek enerjili tamponlar, rampa döngüleri ve çoklu top kilidiyle uzay tilti.', en: 'High-energy space pinball with plasma bumpers, ramps, and multiball locks.' },
            controls: { tr: 'Sol/Sağ Oklar (veya Z / /) ile kanatçıklar, Space ile fırlatıcı.', en: 'Left/Right Arrows (or Z / /) for flippers, Space to plunge.' },
            objective: { tr: 'Çarpan hedeflerini devirerek skor kombolarını milyonlara taşı.', en: 'Hit drop targets and ramp loops to maximize your pinball score.' }
        },
        {
            id: 'nebula-pool-ricochet',
            category: 'physics',
            engine: 'Matter.js',
            lang: 'JS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 8,
            accent: '#22d3ee',
            sprite: 'cryo_crystal',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Nebula Bilardo Sekmesi', en: 'Nebula Pool Ricochet' },
            tagline: { tr: 'Sürtünmesiz uzay masasında açısal çarpışmalarla enerji kürelerini ceplere sok.', en: 'Pocket cosmic energy spheres via crisp elastic collisions across 8 trick tables.' },
            controls: { tr: 'Beyaz küreden sürükle ve bırakarak vuruş yap.', en: 'Drag from the cue sphere and release to strike.' },
            objective: { tr: '8 masada verilen vuruş hakkı içinde tüm hedef küreleri ceple.', en: 'Sink all target spheres within par shots across 8 tables.' }
        },
        {
            id: 'cargo-tower-balance',
            category: 'physics',
            engine: 'Matter.js',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#f59e0b',
            sprite: 'cargo_crate',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Kargo Kulesi Dengesi', en: 'Cargo Tower Balance' },
            tagline: { tr: 'Sallanan vinçten kargo konteynerlerini bırakıp devrilmeden uzaya kule dik.', en: 'Drop cargo containers from an orbital crane and balance the tallest stable stack.' },
            controls: { tr: 'Space veya Tık ile vinci serbest bırak.', en: 'Space or Click to release the swinging cargo crate.' },
            objective: { tr: 'Ağırlık merkezini koruyarak kuleni mümkün olan en yüksek kata çıkar.', en: 'Stack crates carefully without toppling the tower off the platform.' }
        },
        {
            id: 'magnetic-tether-swing',
            category: 'physics',
            engine: 'Matter.js',
            lang: 'JS',
            difficulty: 4,
            hasLevels: true,
            maxLevel: 6,
            accent: '#34d399',
            sprite: 'astronaut',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Manyetik Halat Salınımı', en: 'Magnetic Tether Swing' },
            tagline: { tr: 'Çekim düğümlerine manyetik kanca atıp sarkaç momentumuyla boşlukları aş.', en: 'Grapple onto magnetic anchor nodes and swing across deep space chasms.' },
            controls: { tr: 'Tık veya Space basılı tutarak en yakın düğüme kanca at, bırakınca fırlat.', en: 'Hold Click or Space to grapple nearest anchor, release to launch.' },
            objective: { tr: '6 parkurda yıldız geçidine düşmeden hızla ulaş.', en: 'Reach the exit gate across 6 momentum-based obstacle courses.' }
        },
        {
            id: 'gravity-golf-parsec',
            category: 'physics',
            engine: 'Matter.js',
            lang: 'JS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 8,
            accent: '#a3e635',
            sprite: 'coin_star',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Parsec Yerçekimi Golfü', en: 'Gravity Golf Parsec' },
            tagline: { tr: 'Gezegen kanyonları ve sekme duvarları arasında kuark topunu deliğe ulaştır.', en: 'Sink a quark ball into cosmic wormhole cups around gravity hazards.' },
            controls: { tr: 'Topun üzerinden sürükleyip yön ve güç ver.', en: 'Drag from the ball to aim trajectory and shot power.' },
            objective: { tr: '8 kozmik parkuru Par vuruş sınırının altında tamamla.', en: 'Finish all 8 orbital courses at or under par.' }
        },

        // ── TACTICS (45..50) ─────────────────────────────────────────────────
        {
            id: 'tower-defense-bastion',
            category: 'tactics',
            engine: 'PixiJS v8',
            lang: 'JS',
            difficulty: 4,
            hasLevels: true,
            maxLevel: 6,
            accent: '#00f0ff',
            sprite: 'laser_turret',
            storyChapter: 8,
            isFlagship: false,
            title: { tr: 'Sonsuzluk Kalesi Kule Savunması', en: 'Tower Defense Bastion' },
            tagline: { tr: 'Mimar istilasına karşı plazma, kriyo ve raylı taret ağını inşa edip yükselt.', en: 'Construct and upgrade laser, cryo, and railgun turrets against Architect waves.' },
            controls: { tr: 'İnşa yuvasına tıkla, kule seç (1/2/3), dalgayı başlat (Space).', en: 'Click build pads, pick turret type (1/2/3), launch wave (Space).' },
            objective: { tr: '6 stratejik sektörde kaleyi koru ve en az 3. aşama zaferine ulaş.', en: 'Defend the core across 6 sectors and conquer at least stage 3.' }
        },
        {
            id: 'deck-breach-tactics',
            category: 'tactics',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 4,
            hasLevels: true,
            maxLevel: 6,
            accent: '#f43f5e',
            sprite: 'astronaut',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Güverte İhlal Taktikleri', en: 'Deck Breach Tactics' },
            tagline: { tr: 'Sıra tabanlı ızgarada düşman niyetini okuyup kart hamleleriyle gemiyi temizle.', en: 'Read enemy telegraph intents and clear compact grids via tactical card plays.' },
            controls: { tr: 'Kart seç, hedef karoya tıkla, Turu Bitir butonunu kullan.', en: 'Select a tactical card, click a target tile, and end turn.' },
            objective: { tr: '6 güverte çatışmasında mürettebatını hayatta tutup tüm korsanları alt et.', en: 'Eliminate all hostiles across 6 tactical boarding encounters.' }
        },
        {
            id: 'fleet-commander-auto',
            category: 'tactics',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 6,
            accent: '#38bdf8',
            sprite: 'fighter',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Filo Komutanı Oto-Savaş', en: 'Fleet Commander Auto' },
            tagline: { tr: 'Kredi ekonomini yönet, avcı ve kruvazör sinerjileri kur, oto-muharebeyi izle.', en: 'Draft ships, position synergies on a hex deck, and win auto-resolved battles.' },
            controls: { tr: 'Dükkandan gemi satın al, ızgaraya yerleştir, Savaşı Başlat.', en: 'Buy ships from the dock shop, position formation, and start battle.' },
            objective: { tr: '6 komuta aşamasında rakip armadayı stratejik dizilimle ez.', en: 'Outmaneuver 6 rival armadas with smart fleet composition.' }
        },
        {
            id: 'wormhole-roulette-rpg',
            category: 'tactics',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#c084fc',
            sprite: 'portal_vortex',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Solucan Deliği Rulet RYO', en: 'Wormhole Roulette RPG' },
            tagline: { tr: 'Zarlar, risk-ödül geçitleri ve enerji kalkanlarıyla hızlı tur tabanlı macera.', en: 'Tactical dice combat and risk-reward portal encounters in deep space.' },
            controls: { tr: 'Zar atmak ve saldırı/savunma yuvalarına atamak için Tıkla.', en: 'Click to roll tactical dice and assign energy to attack or shield.' },
            objective: { tr: 'Yüzdeyi akıllıca yöneterek arka arkaya kozmik muhafızları alt et.', en: 'Defeat consecutive sector guardians by balancing risk and shielding.' }
        },
        {
            id: 'mining-tycoon-idle',
            category: 'tactics',
            engine: 'Neo-Pixel',
            lang: 'JS',
            difficulty: 1,
            hasLevels: false,
            maxLevel: 1,
            accent: '#22d3ee',
            sprite: 'cryo_crystal',
            storyChapter: null,
            isFlagship: false,
            title: { tr: 'Asteroit Maden İmparatorluğu', en: 'Mining Tycoon Idle' },
            tagline: { tr: 'Otomatik sondaj dronları ve rafineri yükseltmeleriyle kristal ekonomisi kur.', en: 'Scale autonomous mining drones and orbital refineries for exponential output.' },
            controls: { tr: 'Çekirdeğe tıklayarak manuel kaz, panelden dron ve yükseltme al.', en: 'Click the core to mine manually, buy drones and upgrades on the panel.' },
            objective: { tr: 'Üretim çarpanlarını birleştirip galaktik maden hedefine ulaş.', en: 'Compound refinery multipliers and hit galactic extraction milestones.' }
        },
        {
            id: 'typing-cipher-defense',
            category: 'tactics',
            engine: 'TypeScript',
            lang: 'TS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#fb7185',
            sprite: 'boss_core',
            storyChapter: 11,
            isFlagship: false,
            title: { tr: 'Şifre Yazım Savunması', en: 'Typing Cipher Defense' },
            tagline: { tr: 'Yaklaşan siber füzelerin üzerindeki şifre kodlarını hatasız yazarak imha et.', en: 'Intercept incoming cyber-warheads by typing their cipher lock strings cleanly.' },
            controls: { tr: 'Klavyeden ekrandaki aktif hedef kelimesini yaz; Backspace yok!', en: 'Type target cipher strings directly on your keyboard.' },
            objective: { tr: 'WPM hızını yükselt, kombo çarpanını koru ve güvenlik duvarını savun.', en: 'Boost typing speed and chain flawless intercepts to protect the core.' }
        },
        {
            id: 'exo-metroid-breach',
            category: 'survivors',
            engine: 'Phaser 3',
            lang: 'JS',
            difficulty: 4,
            hasLevels: true,
            maxLevel: 5,
            hasEndless: true,
            endlessLevel: 6,
            accent: '#38bdf8',
            sprite: 'exo_trooper',
            storyChapter: 15,
            isFlagship: true,
            title: { tr: 'Exo-Metroid Sektör İhlali', en: 'Exo-Metroid Sector Breach' },
            tagline: { tr: '5 biyom, Zırh Yükseltmeleri, Yüklü Plazma, Darbe Tüfeği, Pogo Kılıcı, füzeler ve Aegis Boss.', en: '5 biomes, Suit Upgrades, Charged Plasma, Pulse Rifle, Pogo Sabre, Spread Missiles & Aegis Boss.' },
            controls: { tr: 'A/D Yürü · W/Space Zıplama · S Platform İn/Pogo · J (Basılı) Yüklü Plazma · E Tüfek · K Füze · L/Shift Atılma.', en: 'A/D Move · W/Space Jump · S Drop/Pogo · J (Hold) Charge Beam · E Pulse Rifle · K Missile · L/Shift Dash.' },
            objective: { tr: '5 biyomdaki reaktörleri ve Aegis Kolossus’u yok et ya da 4 Sonsuz İhlal arenasında rekor kır.', en: 'Breach 5 handcrafted Metroidvania biomes with Suit Upgrades or fight infinite waves across 4 Endless Arenas.' }
        },
        {
            id: 'astral-roguelike-crawl',
            category: 'tactics',
            engine: 'ROT.js',
            lang: 'JS',
            difficulty: 4,
            hasLevels: false,
            maxLevel: 1,
            accent: '#a855f7',
            sprite: 'spider_bot',
            storyChapter: 12,
            isFlagship: true,
            title: { tr: 'Astral Zindan Kâşifi', en: 'Astral Roguelike Crawl' },
            tagline: { tr: 'ROT.js prosedürel zindan haritası, görüş alanı gölgelemesi ve Dijkstra avcı yapay zekâsı.', en: 'Procedural sci-fi roguelike powered by ROT.js Digger maps, shadowcasting FOV & Dijkstra pathing.' },
            controls: { tr: 'WASD / Oklar Adım At ve Saldır · E / Space Plazma Patlaması · R Yenile.', en: 'WASD / Arrows Move & Bump-Attack · E / Space Pulse Nova.' },
            objective: { tr: 'Karanlık güverte katlarında kalıntı topla, asansöre in ve sonsuz derinlikte rekor kır.', en: 'Loot relics through shadowed procedural decks and descend deeper infinitely.' }
        },
        {
            id: 'moon-rover-3d-odyssey',
            category: 'physics',
            engine: 'Cannon-es 3D',
            lang: 'JS',
            difficulty: 3,
            hasLevels: true,
            maxLevel: 4,
            accent: '#f59e0b',
            sprite: 'moon_rover',
            storyChapter: 13,
            isFlagship: true,
            title: { tr: 'Ay Gezgini 3D Fizik Rallisi', en: 'Moon Rover 3D Odyssey' },
            tagline: { tr: 'Three.js 3D kraterler ve Cannon-es gerçek katı cisim süspansiyonu & itici fiziği.', en: 'True 3D rigid-body lunar rover physics combining Three.js terrain and Cannon-es dynamics.' },
            controls: { tr: 'W/S İleri-Geri · A/D Direksiyon · Space Sıfır-Yerçekimi İtici · R Düzelt.', en: 'W/S Drive · A/D Steer · Space Thruster Boost · R Flip.' },
            objective: { tr: 'Krater rampalarından uç, yakıt hücrelerini topla ve düşmeden sınırsız ralli yap.', en: 'Launch off lunar ramps, grab crystal pods and push endless distance checkpoints.' }
        },
        {
            id: 'starfox-canyon-ace',
            category: 'arcade',
            engine: 'Cannon-es 3D',
            lang: 'JS',
            difficulty: 4,
            hasLevels: false,
            maxLevel: 1,
            accent: '#22d3ee',
            sprite: 'stealth_jet',
            storyChapter: 18,
            isFlagship: true,
            title: { tr: 'Yıldız Tilkisi 3D Kanyon Ası', en: 'Starfox 3D Canyon Ace' },
            tagline: { tr: 'Kanyon sütunları arasında namlu dönüşü savunması, çoklu kilitli füze ve 3D Dretnot.', en: '3D corridor dogfighter with barrel-roll deflection, lock-on salvos and Dreadnought encounters.' },
            controls: { tr: 'WASD / Fare Nişan · Space / Tık Çift Lazer · Shift Namlu Dönüşü (Deflect).', en: 'WASD / Mouse Steer · Space / Click Twin Lasers · Shift Barrel Roll.' },
            objective: { tr: 'Kanyon engellerinden sıyrıl, filoyu imha et ve sonsuz sektörde dalgaları yar.', en: 'Weave through monolith canyons, shatter interceptor wings and clear endless sectors.' }
        },
        {
            id: 'lua-cyber-ops',
            category: 'tactics',
            engine: 'Lua 5.3 VM',
            lang: 'LUA',
            difficulty: 4,
            hasLevels: false,
            maxLevel: 1,
            accent: '#34d399',
            sprite: 'reactor_node',
            storyChapter: 20,
            isFlagship: true,
            title: { tr: 'Lua 5.3 Siber Drone Arenası', en: 'Lua 5.3 Cyber Drone Ops' },
            tagline: { tr: 'Gerçek Fengari Lua 5.3 sanal makinesiyle canlı programlanan otonom filo savaşı.', en: 'Autonomous arena tactics driven live by the Fengari Lua 5.3 VM and mission_kernel.lua.' },
            controls: { tr: 'Hazır Lua AI Çipi seç (Avcı/Kaçak/Koruyucu) veya canlı Lua kodunu düzenle + Uygula!', en: 'Pick tactical Lua AI Chips or edit live Lua code · Space EMP Overdrive.' },
            objective: { tr: 'Lua mantığıyla otonom dronu yönet, düşman dalgalarını ez ve sonsuz arenayı fethet.', en: 'Program optimal Lua tactical loops to purge endless cyber-swarm waves.' }
        },
        {
            id: 'asc-blackhole-swarm',
            category: 'survivors',
            engine: 'AssemblyScript',
            lang: 'WASM',
            difficulty: 5,
            hasLevels: false,
            maxLevel: 1,
            accent: '#c084fc',
            sprite: 'portal_vortex',
            storyChapter: 24,
            isFlagship: true,
            title: { tr: 'Olay Ufku: AssemblyScript Sürüsü', en: 'Event Horizon: WASM Singularity Swarm' },
            tagline: { tr: 'Özel cosmic_adv.wasm doğrusal belleğinde çalışan 600+ parçacıklı kara delik savaşı.', en: 'Hardware-speed AssemblyScript N-body vortex kernel driving 600+ active swarm entities in WASM.' },
            controls: { tr: 'WASD / Fare Uçuş · Sol Tık Şok Dalgası İtmesi · Otomatik Plazma Yörüngesi.', en: 'WASD / Mouse Pilot · Click Shockwave Pulse · Auto-Orbit Cannons.' },
            objective: { tr: 'Kara deliğin çekimine diren, enerji çekirdeklerini topla ve Sezon Finali sürüsünü yar.', en: 'Defy singularity gravity wells, overload enemies and survive infinite event-horizon waves.' }
        },
        {
            id: 'phaser-stealth-heist',
            category: 'tactics',
            engine: 'Phaser 3',
            lang: 'JS',
            difficulty: 4,
            hasLevels: true,
            maxLevel: 4,
            accent: '#2dd4bf',
            sprite: 'carrier_ship',
            storyChapter: 17,
            isFlagship: true,
            title: { tr: 'Korsan Sızması: Phaser Gizlilik Operasyonu', en: 'Phantom Airlock: Stealth Heist' },
            tagline: { tr: 'Phaser 3 ve ROT.js görüş konileriyle güvenlik kameralarından kaçıp veri kasasını çal.', en: 'Top-down sci-fi stealth infiltration featuring guard vision cones, EMP strikes and vault extraction.' },
            controls: { tr: 'WASD Yürü · Shift Sessiz Koşu · E / Tık Gizli EMP İndirme.', en: 'WASD Move · Shift Sprint · E / Click Silent EMP Takedown.' },
            objective: { tr: 'Nöbetçilerin görüş konisine yakalanmadan şifreli veri çekirdeklerini çalıp çıkışa ulaş.', en: 'Hack all vault terminals undetected and extract through the airlock endlessly.' }
        },
        {
            id: 'd3-galactic-conquest',
            category: 'tactics',
            engine: 'D3.js Engine',
            lang: 'JS',
            difficulty: 3,
            hasLevels: false,
            maxLevel: 1,
            accent: '#60a5fa',
            sprite: 'missile_pod',
            storyChapter: 19,
            isFlagship: true,
            title: { tr: 'D3 Galaktik Fethiyye RTS', en: 'D3 Galactic Conquest RTS' },
            tagline: { tr: 'D3.js güç-grafı yıldız ağları ve gerçek zamanlı filo sevkiyatıyla gezegen fethi.', en: 'Real-time star-cluster conquest powered by D3.js force graphs, Voronoi territories & fleet waves.' },
            controls: { tr: 'Mavi yıldızına tıkla → Hedef yıldıza tıkla (%50 Filo Sevk Et) · Sürükle Çoklu Seç.', en: 'Click Owned Star → Click Target Star to launch 50% fleet · Shift+Click Multi-Send.' },
            objective: { tr: 'Rakip yapay zekâ fraksiyonlarını kuşatıp galaksi sektörünü fethet ve yeni haritaya geç.', en: 'Capture every star node across procedurally escalating D3 galaxy networks.' }
        },
        {
            id: 'glsl-synthwave-surf',
            category: 'reflex',
            engine: 'GLSL Raymarch',
            lang: 'GLSL',
            difficulty: 4,
            hasLevels: false,
            maxLevel: 1,
            accent: '#f43f5e',
            sprite: 'tactical_mech',
            storyChapter: 14,
            isFlagship: true,
            title: { tr: 'GLSL Raymarch Hiper Sörf', en: 'GLSL Synthwave Tunnel Surf' },
            tagline: { tr: 'Saf WebGL2 fragment shader raymarching tünelinde ses senkronlu yüksek hızlı sörf.', en: 'Pure WebGL2 fragment shader SDF raymarching corridor synced with procedural synth beats.' },
            controls: { tr: 'A/D veya Sol/Sağ Şerit Değiştir · Space Faz Zıplaması (Kalkan Kırıcı).', en: 'A/D or Left/Right Steer Tunnel Angle · Space Phase Jump.' },
            objective: { tr: 'Neon plazma kapılarından geç, kızıl lazer bariyerlerden kaç ve ışık hızını katla.', en: 'Surf through procedural SDF shader tunnels, stack beat multipliers indefinitely.' }
        },
        {
            id: 'phaser-crimson-colossus',
            category: 'arcade',
            engine: 'Phaser 3',
            lang: 'JS',
            difficulty: 5,
            hasLevels: true,
            maxLevel: 4,
            accent: '#ef4444',
            sprite: 'colossus_boss',
            storyChapter: 23,
            isFlagship: true,
            title: { tr: 'Kızıl Kolossus: Boss Baskını', en: 'Crimson Colossus: Boss Raid' },
            tagline: { tr: 'Phaser 3 çok aşamalı dev Titan bossları, zayıf nokta kırma ve mermi zamanı savuşturması.', en: 'Cuphead-inspired multi-phase mecha boss raid in Phaser 3 with bullet-time parry.' },
            controls: { tr: 'WASD / Fare Kaçış · Otomatik/Tık Ateş · Space Mermi Savuşturma (Pembe Mermiler!).', en: 'WASD Move · Mouse/Auto Fire · Space Dash-Parry on Pink Orbs.' },
            objective: { tr: 'Amiral Kaelen’in Kızıl Kolossus zırhını parçala ve Sonsuz Boss Akınında hayatta kal.', en: 'Shatter weakpoints across escalating Crimson Titan phases and Boss Rush loops.' }
        }
    ];

    const COSMIC_ARCADE_GAMES = Object.freeze(
        RAW_GAMES.map((g, index) => Object.freeze({
            index: index + 1,
            ...g,
            spritePath: `assets/v11/sprites/${g.sprite}.png`
        }))
    );

    const GAME_BY_ID = new Map(COSMIC_ARCADE_GAMES.map((g) => [g.id, g]));

    function createDefaultStore() {
        return {
            version: 12,
            games: {},
            updatedAt: null
        };
    }

    function normalizeRecord(raw) {
        const r = raw && typeof raw === 'object' ? raw : {};
        return {
            highScore: Math.max(0, Math.floor(Number(r.highScore) || 0)),
            bestLevel: Math.max(0, Math.floor(Number(r.bestLevel) || 0)),
            stars: Math.min(3, Math.max(0, Math.floor(Number(r.stars) || 0))),
            plays: Math.max(0, Math.floor(Number(r.plays) || 0)),
            lastPlayed: typeof r.lastPlayed === 'string' ? r.lastPlayed : null
        };
    }

    function normalizeStore(raw) {
        const base = createDefaultStore();
        if (!raw || typeof raw !== 'object') return base;
        base.updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : null;
        if (raw.games && typeof raw.games === 'object') {
            for (const [id, rec] of Object.entries(raw.games)) {
                if (GAME_BY_ID.has(id)) {
                    base.games[id] = normalizeRecord(rec);
                }
            }
        }
        return base;
    }

    let memoryFallbackStore = null;

    function readRawStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : null;
            }
        } catch (_) {
            // Fall back to in-memory storage
        }
        return memoryFallbackStore;
    }

    function writeRawStorage(data) {
        memoryFallbackStore = data;
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }
        } catch (_) {
            // Ignore quota / restricted storage errors
        }
        return data;
    }

    const CosmicArcadeStore = {
        STORAGE_KEY,

        load() {
            return normalizeStore(readRawStorage());
        },

        save(store) {
            const safe = normalizeStore(store);
            safe.updatedAt = new Date().toISOString();
            return writeRawStorage(safe);
        },

        getGameStats(gameId) {
            const store = this.load();
            return normalizeRecord(store.games[gameId]);
        },

        getTotalStars() {
            const store = this.load();
            let total = 0;
            for (const rec of Object.values(store.games)) {
                total += Math.min(3, Math.max(0, Number(rec.stars) || 0));
            }
            return total;
        },

        getPlayedCount() {
            const store = this.load();
            let count = 0;
            for (const rec of Object.values(store.games)) {
                if ((Number(rec.plays) || 0) > 0) count++;
            }
            return count;
        },

        getStats() {
            const store = this.load();
            let totalStars = 0;
            let playedCount = 0;
            let totalPlays = 0;
            let totalHighScore = 0;

            for (const rec of Object.values(store.games)) {
                const n = normalizeRecord(rec);
                totalStars += n.stars;
                if (n.plays > 0) playedCount++;
                totalPlays += n.plays;
                totalHighScore += n.highScore;
            }

            return {
                games: store.games,
                totalStars,
                maxPossibleStars: COSMIC_ARCADE_GAMES.length * 3,
                playedCount,
                totalGames: COSMIC_ARCADE_GAMES.length,
                totalPlays,
                totalHighScore,
                updatedAt: store.updatedAt
            };
        },

        recordRun(gameId, result) {
            if (!GAME_BY_ID.has(gameId)) {
                return { ok: false, reason: 'unknown_game', gameId };
            }

            const payload = result && typeof result === 'object' ? result : {};
            const score = Math.max(0, Math.floor(Number(payload.score) || 0));
            const level = Math.max(0, Math.floor(Number(payload.level) || 0));
            const stars = Math.min(3, Math.max(0, Math.floor(Number(payload.stars) || 0)));

            const store = this.load();
            const prev = normalizeRecord(store.games[gameId]);
            const isNewHighScore = score > prev.highScore;
            const isNewBestLevel = level > prev.bestLevel;

            const updated = {
                highScore: Math.max(prev.highScore, score),
                bestLevel: Math.max(prev.bestLevel, level),
                stars: Math.max(prev.stars, stars),
                plays: prev.plays + 1,
                lastPlayed: new Date().toISOString()
            };

            store.games[gameId] = updated;
            this.save(store);

            let creditsAwarded = 0;
            if (Number.isFinite(Number(payload.credits)) && payload.credits !== undefined) {
                creditsAwarded = Math.max(0, Math.floor(Number(payload.credits)));
            } else if (score > 0 || level > 0 || stars > 0) {
                creditsAwarded = Math.min(250, Math.max(5, Math.floor(score / 25) + level * 8 + stars * 15));
            }

            if (
                creditsAwarded > 0 &&
                global.CosmicPersistence &&
                typeof global.CosmicPersistence.addCredits === 'function'
            ) {
                global.CosmicPersistence.addCredits(creditsAwarded);
            }

            return {
                ok: true,
                gameId,
                record: updated,
                isNewHighScore,
                isNewBestLevel,
                creditsAwarded,
                totalStars: this.getTotalStars(),
                playedCount: this.getPlayedCount()
            };
        },

        reset() {
            const empty = createDefaultStore();
            writeRawStorage(empty);
            return empty;
        }
    };

    global.COSMIC_ARCADE_GAMES = COSMIC_ARCADE_GAMES;
    global.CosmicArcadeStore = CosmicArcadeStore;
})(typeof window !== 'undefined' ? window : globalThis);
