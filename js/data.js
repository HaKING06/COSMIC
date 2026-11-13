// =============================================================================
// COSMIC SURVIVORS v10.0 — GENESIS EDITION CANONICAL DATA & PERSISTENCE ENGINE
// Single Source of Truth for Portal, Tree, Encyclopedia, Modes & Arena Engine
// =============================================================================
(function (global) {
    'use strict';

    const SHIPS = {
        interceptor: {
            id: 'interceptor',
            name: 'Avcı',
            nameEn: 'Interceptor',
            codeName: 'INTERCEPTOR',
            role: 'Yüksek Hız · Kritik Delici',
            roleEn: 'High Speed · Critical Piercer',
            tag: 'SALDIRI',
            tagEn: 'STRIKER',
            color: '#38bdf8',
            asset: 'assets/ships/interceptor.png',
            starterWeapon: 'dualLaser',
            sigWeapon: 'photonRailgun',
            sigTrinket: 'overdriveCore',
            sigEvo: 'tachyonLance',
            sigMega: 'hyperionApex',
            hp: 105,
            sh: 55,
            sp: 354,
            crit: 0.20,
            armor: 0.05,
            radar: { speed: 94, firepower: 86, defense: 45, control: 62, capacity: 75 },
            passiveName: 'Hiper-İtici & Kritik Kalibrasyon',
            passiveNameEn: 'Hyper-Thruster & Critical Calibration',
            passiveDesc: '+%20 hareket hızı ve +%15 taban kritik vuruş şansı.',
            passiveDescEn: '+20% movement speed and +15% base critical hit chance.',
            abilityName: 'WARP DASH',
            abilityNameEn: 'WARP DASH',
            abilityCd: 7.0,
            abilityDesc: '1.2 sn dokunulmaz faz atılması gerçekleştirir ve arkasında yakıcı foton izi bırakır.',
            abilityDescEn: 'Performs a 1.2s invulnerable phase dash, leaving behind a scorching photon trail.',
            unlockCost: 0
        },
        dreadnought: {
            id: 'dreadnought',
            name: 'Kruvazör',
            nameEn: 'Dreadnought',
            codeName: 'DREADNOUGHT',
            role: 'Ağır Zırh · Kuşatma Bataryası',
            roleEn: 'Heavy Armor · Siege Battery',
            tag: 'TANK',
            tagEn: 'TANK',
            color: '#f59e0b',
            asset: 'assets/ships/dreadnought.png',
            starterWeapon: 'heavyPlasma',
            sigWeapon: 'flakArtillery',
            sigTrinket: 'reactiveArmor',
            sigEvo: 'siegeBehemoth',
            sigMega: 'ironDreadnought',
            hp: 185,
            sh: 90,
            sp: 239,
            crit: 0.08,
            armor: 0.32,
            radar: { speed: 48, firepower: 90, defense: 96, control: 68, capacity: 82 },
            passiveName: 'Katmanlı Titanyum Gövde',
            passiveNameEn: 'Layered Titanium Hull',
            passiveDesc: '+%32 zırh hasar azaltımı ve yüksek başlangıç gövde bütünlüğü (185 HP).',
            passiveDescEn: '+32% armor damage reduction and heavy starting hull integrity (185 HP).',
            abilityName: 'MİKRO FÜZE SALVOSU',
            abilityNameEn: 'MICRO MISSILE BARRAGE',
            abilityCd: 10.0,
            abilityDesc: '3 sn boyunca 360° her yöne zırh delici mikro füze yaylımı ateşler.',
            abilityDescEn: 'Unleashes an omnidirectional armor-piercing micro-missile salvo for 3 seconds.',
            unlockCost: 0
        },
        aegis: {
            id: 'aegis',
            name: 'Aegis',
            nameEn: 'Aegis',
            codeName: 'SHIELD GUARDIAN',
            role: 'Kalkan Mühendisi · EMP Savunma',
            roleEn: 'Shield Engineer · EMP Defense',
            tag: 'SAVUNMA',
            tagEn: 'DEFENSE',
            color: '#34d399',
            asset: 'assets/ships/aegis.png',
            starterWeapon: 'energyDisc',
            sigWeapon: 'teslaPrism',
            sigTrinket: 'harmonicCapacitor',
            sigEvo: 'sanctuaryMaelstrom',
            sigMega: 'eventHorizon',
            hp: 130,
            sh: 125,
            sp: 280,
            crit: 0.10,
            armor: 0.18,
            radar: { speed: 68, firepower: 70, defense: 92, control: 88, capacity: 84 },
            passiveName: 'Periyodik Kalkan Deşarjı',
            passiveNameEn: 'Periodic Shield Discharge',
            passiveDesc: 'Her 6 saniyede bir kalkan enerjisiyle otomatik elektro-şok halkası yayar.',
            passiveDescEn: 'Emits an automatic electro-shock ring powered by shield energy every 6 seconds.',
            abilityName: 'EMP ŞOK DALGASI',
            abilityNameEn: 'EMP SHOCKWAVE',
            abilityCd: 9.0,
            abilityDesc: 'Ekrandaki düşman mermilerini nötralize eder ve absorbe edilen enerjiyi kalkana çevirir.',
            abilityDescEn: 'Neutralizes nearby enemy projectiles and converts absorbed energy into shields.',
            unlockCost: 0
        },
        phantom: {
            id: 'phantom',
            name: 'Gölge',
            nameEn: 'Void Phantom',
            codeName: 'VOID PHANTOM',
            role: 'Suikastçı · Faz Gizliliği',
            roleEn: 'Assassin · Phase Stealth',
            tag: 'SUİKAST',
            tagEn: 'ASSASSIN',
            color: '#a78bfa',
            asset: 'assets/ships/phantom.png',
            starterWeapon: 'quantumDagger',
            sigWeapon: 'voidScythe',
            sigTrinket: 'phaseCloak',
            sigEvo: 'abyssalReaper',
            sigMega: 'eclipseSingularity',
            hp: 95,
            sh: 55,
            sp: 335,
            crit: 0.25,
            armor: 0.05,
            radar: { speed: 92, firepower: 94, defense: 42, control: 72, capacity: 74 },
            passiveName: 'Faz Perdesi & Arkadan İnfaz',
            passiveNameEn: 'Phase Veil & Backstab Execution',
            passiveDesc: 'Her 10 sn’de 1.5 sn görünmezlik kazanır; arkadan vuruşlarda +%65 kritik çarpanı uygular.',
            passiveDescEn: 'Gains 1.5s cloak every 10s; applies +65% critical multiplier on rear strikes.',
            abilityName: 'GÖLGE SIÇRAMASI',
            abilityNameEn: 'SHADOW BLINK',
            abilityCd: 6.5,
            abilityDesc: 'İmleç yönüne kuantum sıçraması yapar, 1.8 sn görünmezlik ve infaz gücü açar.',
            abilityDescEn: 'Blinks toward the cursor, granting 1.8s invisibility and lethal execution power.',
            unlockCost: 0
        },
        solarflare: {
            id: 'solarflare',
            name: 'Solar Flare',
            nameEn: 'Solar Flare',
            codeName: 'HELIOS CRUISER',
            role: 'Alan Yakımı · Termal Çekirdek',
            roleEn: 'Area Burn · Thermal Core',
            tag: 'ALAN HASARI',
            tagEn: 'AOE BURN',
            color: '#fb7185',
            asset: 'assets/ships/solarflare.png',
            starterWeapon: 'flameLine',
            sigWeapon: 'solarMortar',
            sigTrinket: 'fusionHeart',
            sigEvo: 'heliosCataclysm',
            sigMega: 'infernoGatling',
            hp: 125,
            sh: 70,
            sp: 295,
            crit: 0.14,
            armor: 0.12,
            radar: { speed: 74, firepower: 88, defense: 66, control: 82, capacity: 80 },
            passiveName: 'Korona Radyasyon Aurası',
            passiveNameEn: 'Corona Radiation Aura',
            passiveDesc: 'Yakın menzildeki düşmanları sürekli yakan ve zincirleme patlamaya hazırlayan termal aura.',
            passiveDescEn: 'Thermal aura that continuously scorches nearby foes and primes chain detonations.',
            abilityName: 'GÜNEŞ PATLAMASI',
            abilityNameEn: 'SOLAR ERUPTION',
            abilityCd: 9.5,
            abilityDesc: 'Geniş çapta korona novası patlatarak çevredeki tüm hedeflere ağır yanma hasarı uygular.',
            abilityDescEn: 'Detonates a wide corona nova, inflicting heavy burn damage to all nearby enemies.',
            unlockCost: 0
        },
        tempest: {
            id: 'tempest',
            name: 'Tempest',
            nameEn: 'Tempest',
            codeName: 'CRYO-STORM',
            role: 'Kitle Kontrol · İyonik Fırtına',
            roleEn: 'Crowd Control · Ionic Storm',
            tag: 'KONTROL',
            tagEn: 'CONTROL',
            color: '#38bdf8',
            asset: 'assets/ships/tempest.png',
            starterWeapon: 'dualLaser',
            sigWeapon: 'cryoNova',
            sigTrinket: 'teslaCoil',
            sigEvo: 'absoluteZero',
            sigMega: 'eventHorizon',
            hp: 115,
            sh: 85,
            sp: 310,
            crit: 0.16,
            armor: 0.14,
            radar: { speed: 82, firepower: 80, defense: 72, control: 96, capacity: 82 },
            passiveName: 'Mutlak Sıfır İyonizasyonu',
            passiveNameEn: 'Absolute Zero Ionization',
            passiveDesc: 'Yıldırım ve buzul etkileri düşmanları yavaşlatır, donmuş hedeflere kritik hasarı artırır.',
            passiveDescEn: 'Lightning and frost effects slow enemies and amplify critical damage on chilled foes.',
            abilityName: 'KRİYO-TESLA FIRTINASI',
            abilityNameEn: 'CRYO-TESLA STORM',
            abilityCd: 8.5,
            abilityDesc: 'Arena geneline zincirleme ark düşürür ve düşmanları 2.5 sn dondurur.',
            abilityDescEn: 'Calls down arena-wide chain lightning and freezes enemies for 2.5 seconds.',
            unlockCost: 0
        },
        valkyrie: {
            id: 'valkyrie',
            name: 'Valkyrie',
            nameEn: 'Valkyrie',
            codeName: 'DRONE CARRIER',
            role: 'Otonom Filo · Güdümlü Batarya',
            roleEn: 'Autonomous Fleet · Guided Battery',
            tag: 'FİLO',
            tagEn: 'CARRIER',
            color: '#f59e0b',
            asset: 'assets/ships/valkyrie.png',
            starterWeapon: 'swarmMissiles',
            sigWeapon: 'droneSwarm',
            sigTrinket: 'neuralLink',
            sigEvo: 'seraphFleet',
            sigMega: 'omegaJudgement',
            hp: 145,
            sh: 95,
            sp: 280,
            crit: 0.15,
            armor: 0.22,
            radar: { speed: 70, firepower: 87, defense: 80, control: 86, capacity: 95 },
            passiveName: 'Otonom Muhafız Eskortu',
            passiveNameEn: 'Autonomous Escort Wing',
            passiveDesc: 'Gemi çevresinde devriye gezen destek droneları ve güçlendirilmiş güdümlü mühimmat.',
            passiveDescEn: 'Combat escort drones orbiting the hull alongside enhanced guided ordnance.',
            abilityName: 'RAILGUN OVERDRIVE',
            abilityNameEn: 'RAILGUN OVERDRIVE',
            abilityCd: 9.0,
            abilityDesc: 'Tüm droneları aşırı yükler ve hedef doğrultusuna elektromanyetik salvoyla vurur.',
            abilityDescEn: 'Overcharges all drones and fires a focused electromagnetic volley along your aim.',
            unlockCost: 0
        },
        chronos: {
            id: 'chronos',
            name: 'Chronos',
            nameEn: 'Chronos',
            codeName: 'TIME WEAVER',
            role: 'Cooldown Uzmanı · Zaman Bükücü',
            roleEn: 'Cooldown Specialist · Time Weaver',
            tag: 'TEKNOLOJİ',
            tagEn: 'TECH',
            color: '#2dd4bf',
            asset: 'assets/ships/chronos.png',
            starterWeapon: 'energyDisc',
            sigWeapon: 'chronoRift',
            sigTrinket: 'fluxCapacitor',
            sigEvo: 'eternityLoop',
            sigMega: 'omegaJudgement',
            hp: 110,
            sh: 105,
            sp: 305,
            crit: 0.18,
            armor: 0.15,
            radar: { speed: 80, firepower: 83, defense: 74, control: 94, capacity: 92 },
            passiveName: 'Relativistik Zaman Genleşmesi',
            passiveNameEn: 'Relativistic Time Dilation',
            passiveDesc: '+%15 kalıcı bekleme süresi (Cooldown) hızlandırması sağlar.',
            passiveDescEn: 'Provides a permanent +15% weapon cooldown acceleration.',
            abilityName: 'ZAMAN DURDURMA',
            abilityNameEn: 'CHRONO STASIS',
            abilityCd: 11.0,
            abilityDesc: 'Düşmanları ve mermileri yavaşlatır, geminin ateş hızını geçici olarak ikiye katlar.',
            abilityDescEn: 'Slows hostile ships and projectiles while temporarily doubling your fire rate.',
            unlockCost: 0
        }
    };

    const MAPS = {
        sector9: {
            id: 'sector9',
            name: 'Sektör 9 Enkazı',
            nameEn: 'Sector 9 Wreckage',
            code: 'SEC-09',
            subtitle: 'Sürüklenen enkaz koridorları ve taktiksel Overdrive röleleri.',
            subtitleEn: 'Drifting debris corridors and tactical Overdrive relays.',
            asset: 'assets/maps/sector9.png',
            color: '#38bdf8',
            scoreMult: 1.0,
            hazardTag: 'Düşük Tehlike · Dengeli',
            hazardTagEn: 'Low Hazard · Balanced',
            arenaEvents: [
                {
                    name: 'Sürüklenen Enkaz Koridoru',
                    nameEn: 'Drifting Debris Corridor',
                    type: 'hazard',
                    desc: 'Haritayı çapraz kesen dönen hurda kütleleri temas halinde gövde hasarı ve geri itme uygular.',
                    descEn: 'Spinning scrap clusters cutting across the sector inflict hull damage and knockback on impact.'
                },
                {
                    name: 'Overdrive Rölesi',
                    nameEn: 'Overdrive Relay',
                    type: 'buff',
                    desc: 'Periyodik inen enerji direklerinin menzilinde kalarak geçici atış hızı ve hasar artışı elde edilir.',
                    descEn: 'Stay inside periodic power relay zones to gain temporary fire rate and damage boosts.'
                }
            ],
            tactics: 'Enkaz koridorlarının hareket yönünü okuyup Overdrive rölelerini Boss veya Elite dalgalarına saklayın.',
            tacticsEn: 'Read debris lanes early and save Overdrive relay captures for Boss or Elite waves.',
            recommendedShips: ['interceptor', 'aegis', 'valkyrie']
        },
        nebula: {
            id: 'nebula',
            name: 'Kuantum Nebulası',
            nameEn: 'Quantum Nebula',
            code: 'NEB-04',
            subtitle: 'Göç eden plazma akıntıları ve iyonik EMP hücreleri.',
            subtitleEn: 'Migrating plasma currents and ionic EMP cells.',
            asset: 'assets/maps/nebula.png',
            color: '#a78bfa',
            scoreMult: 1.25,
            hazardTag: 'Orta Tehlike · +%25 Skor',
            hazardTagEn: 'Moderate Hazard · +25% Score',
            arenaEvents: [
                {
                    name: 'Göç Eden Plazma Akıntıları',
                    nameEn: 'Migrating Plasma Currents',
                    type: 'dynamic',
                    desc: 'Yönü ve konumu değişen gaz cepleri gemiye itki ve geçici hasar artışı veya yoğun sürtünme uygular.',
                    descEn: 'Shifting nebula pockets apply thrust vectors along with power surges or heavy drag.'
                },
                {
                    name: 'EMP Hücreleri',
                    nameEn: 'EMP Cells',
                    type: 'buff',
                    desc: 'Şarjlı EMP düğümleri tetiklendiğinde yakındaki düşman mermilerini ve parazit kalkanlarını boşaltır.',
                    descEn: 'Charged EMP nodes discharge on trigger, clearing nearby enemy bullets and stripping shields.'
                }
            ],
            tactics: 'Phantom ve Kamikaze sürüleri görünürlük sınırında hızlanır; EMP hücrelerini yoğun kurşun anlarında patlatın.',
            tacticsEn: 'Phantom and Kamikaze packs accelerate in nebula pockets; detonate EMP cells during dense bullet storms.',
            recommendedShips: ['phantom', 'tempest', 'chronos']
        },
        blackhole: {
            id: 'blackhole',
            name: 'Kara Delik Çevresi',
            nameEn: 'Event Horizon Perimeter',
            code: 'BH-X1',
            subtitle: 'Yörünge çekim anomalisi ve uyarı işaretli lav meteor yağmuru.',
            subtitleEn: 'Orbital gravity anomalies and telegraphed magma meteor showers.',
            asset: 'assets/maps/blackhole.png',
            color: '#fb7185',
            scoreMult: 1.5,
            hazardTag: 'Yüksek Tehlike · +%50 Skor',
            hazardTagEn: 'High Hazard · +50% Score',
            arenaEvents: [
                {
                    name: 'Yörünge Çekim Anomalisi',
                    nameEn: 'Orbital Gravity Anomaly',
                    type: 'hazard',
                    desc: 'Merkezi ve gezici tekillikler hem oyuncuyu hem de sürüleri içeri çekerek çarpışma yoğunluğunu artırır.',
                    descEn: 'Wandering singularities pull both your ship and enemy swarms inward, intensifying close-quarters combat.'
                },
                {
                    name: 'Lav Meteor Yağmuru',
                    nameEn: 'Magma Meteor Shower',
                    type: 'hazard',
                    desc: 'Kırmızı hedef halkalarıyla önceden uyarılan yüksek enerjili meteorlar düştüğü alanda kalıcı krater açar.',
                    descEn: 'Telegraphed crimson warning rings precede high-energy meteors that leave burning craters.'
                }
            ],
            tactics: 'Yüksek mobilite veya ağır zırh şarttır. Graviton ve Kara Delik çekimlerinde dash zamanlamasını koruyun.',
            tacticsEn: 'High mobility or heavy armor is essential. Time your dash carefully to break free from gravity wells.',
            recommendedShips: ['dreadnought', 'solarflare', 'phantom']
        },
        dyson: {
            id: 'dyson',
            name: 'Dyson Mega-Küre Reaktörü',
            nameEn: 'Dyson Mega-Sphere Reactor',
            code: 'DYS-99',
            subtitle: 'Dönen iletken halkaları, enerji sütunları ve Dyson süpürme lazeri.',
            subtitleEn: 'Rotating conductor rings, energy pylons, and the Dyson sweep beam.',
            asset: 'assets/maps/dyson.png',
            color: '#34d399',
            scoreMult: 1.75,
            hazardTag: 'Aşırı Tehlike · +%75 Skor',
            hazardTagEn: 'Extreme Hazard · +75% Score',
            arenaEvents: [
                {
                    name: 'Dönen İletken Halkaları',
                    nameEn: 'Rotating Conductor Rings',
                    type: 'buff',
                    desc: 'Aktif reaktör halkaları ve sütunları menzil içindeyken silahlara +%30 hasar güçlendirmesi verir.',
                    descEn: 'Active reactor conduits grant +30% weapon damage while piloting within their resonance ring.'
                },
                {
                    name: 'Dyson Süpürme Lazeri',
                    nameEn: 'Dyson Sweep Laser',
                    type: 'hazard',
                    desc: 'Uyarı çizgisi sonrası arenayı tarayan yüksek güçlü odaklanmış plazma ışını; faz atlama ile aşılır.',
                    descEn: 'After a telegraph line, a sweeping plasma beam cuts across the arena; cross through with phase dashes.'
                }
            ],
            tactics: 'Lazer süpürme uyarısında dik açıyla kaçın; ardından iletken halkanın içinde kalarak Boss HP’sini eritin.',
            tacticsEn: 'Evade perpendicularly when the sweep laser telegraphs, then hold inside conductor rings to melt bosses.',
            recommendedShips: ['valkyrie', 'chronos', 'tempest']
        }
    };

    const DIFFICULTIES = {
        easy: {
            id: 'easy',
            label: 'Keşif / Kolay',
            labelEn: 'Scout / Easy',
            shortLabel: 'KEŞİF',
            shortLabelEn: 'SCOUT',
            color: '#34d399',
            desc: 'Yeni pilotlar ve evrim dizilimlerini test etmek için dengeli tempo.',
            descEn: 'Balanced pace for new pilots and testing evolution synergies.',
            ehm: 1.0, esm: 0.95, edm: 1.0, sdm: 1.12, bhm: 1.45, pdm: 1.15, sm: 1.0
        },
        normal: {
            id: 'normal',
            label: 'Standart / Normal',
            labelEn: 'Standard / Normal',
            shortLabel: 'STANDART',
            shortLabelEn: 'STANDARD',
            color: '#38bdf8',
            desc: 'Önerilen temel Cosmic Survivors deneyimi. Sıkı sürü ve Boss ölçeklemesi.',
            descEn: 'Recommended Cosmic Survivors experience with tense swarm and Boss scaling.',
            ehm: 1.35, esm: 1.08, edm: 1.32, sdm: 0.98, bhm: 2.35, pdm: 1.00, sm: 1.5
        },
        hard: {
            id: 'hard',
            label: 'Komutan / Zor',
            labelEn: 'Commander / Hard',
            shortLabel: 'KOMUTAN',
            shortLabelEn: 'COMMANDER',
            color: '#f59e0b',
            desc: 'Hızlı elit dalgaları, sert Boss fazları ve 2.2x skor katsayısı.',
            descEn: 'Aggressive elite packs, punishing Boss phases, and a 2.2x score multiplier.',
            ehm: 1.90, esm: 1.24, edm: 1.75, sdm: 0.80, bhm: 3.60, pdm: 0.88, sm: 2.2
        },
        nightmare: {
            id: 'nightmare',
            label: 'Hiçlik / Kabus',
            labelEn: 'Abyss / Nightmare',
            shortLabel: 'HİÇLİK',
            shortLabelEn: 'ABYSS',
            color: '#fb7185',
            desc: 'Acımasız düşman yoğunluğu ve Kozmik Çürüme altında nihai hayatta kalma sınavı (3.2x Skor).',
            descEn: 'Relentless swarm density and ultimate survival gauntlet under Void Corruption (3.2x Score).',
            ehm: 2.75, esm: 1.42, edm: 2.35, sdm: 0.70, bhm: 5.40, pdm: 0.75, sm: 3.2
        }
    };

    // 5 Playable Game Modes (v10.0)
    const GAME_MODES = {
        survival: {
            id: 'survival',
            name: 'Klasik Sefer',
            nameEn: 'Classic Campaign',
            shortTag: '15 DALGA · FİNAL BOSS',
            shortTagEn: '15 WAVES · APEX BOSS',
            icon: 'shield',
            color: '#38bdf8',
            desc: '15 dalgalık klasik sefer. Sektör Kasa POI hedeflerini ele geçirip Dalga 15 Apex Dreadnought Boss’unu alt edin.',
            descEn: '15-wave tactical campaign. Capture Sector Vault POIs and defeat the Wave 15 Final Apex Boss.',
            waveCap: 15,
            timeLimitSec: null,
            xpMult: 1.0,
            scoreMult: 1.0,
            creditMult: 1.0,
            features: ['15 Dalga Hedefi', 'Sektör Kasa POI Noktaları', 'Dalga 15 Final Apex Boss'],
            featuresEn: ['15-Wave Campaign', 'Sector Vault POIs', 'Wave 15 Apex Boss Climax']
        },
        endless: {
            id: 'endless',
            name: 'Sonsuz Overdrive',
            nameEn: 'Endless Overdrive',
            shortTag: 'SINIRSIZ · +%35 SKOR',
            shortTagEn: 'NO CAP · +35% SCORE',
            icon: 'infinity',
            color: '#a78bfa',
            desc: 'Dalga sınırı olmadan sonsuza dek savaşın. Dalga 15 sonrasında Hiçlik Çürümesi devreye girer ve ganimet katlanır.',
            descEn: 'Fight without a wave cap. Void Corruption escalates past Wave 15 with amplified rewards.',
            waveCap: null,
            timeLimitSec: null,
            xpMult: 1.15,
            scoreMult: 1.35,
            creditMult: 1.30,
            features: ['Sınırsız Dalga Ölçeklemesi', 'Dalga 15+ Hiçlik Çürümesi', '1.35x Skor / 1.30x CRD'],
            featuresEn: ['Uncapped Wave Scaling', 'Wave 15+ Void Corruption', '1.35x Score / 1.30x CRD']
        },
        bossrush: {
            id: 'bossrush',
            name: 'Boss Akını',
            nameEn: 'Boss Rush',
            shortTag: 'HER ~25SN BOSS · +%85 SKOR',
            shortTagEn: 'BOSS EVERY ~25S · +85% SCORE',
            icon: 'skull',
            color: '#fb7185',
            desc: 'Her ~25 saniyede bir ardışık çok fazlı Dreadnought Boss’lar arenaya iner. Hızlandırılmış XP ve takviye sandıkları içerir.',
            descEn: 'Sequential multi-phase Dreadnought Bosses spawn roughly every 25s with accelerated XP and supply drops.',
            waveCap: null,
            timeLimitSec: null,
            xpMult: 1.65,
            scoreMult: 1.85,
            creditMult: 1.80,
            features: ['~25sn Aralıklarla Dreadnought', 'Hızlandırılmış XP & Sandıklar', '1.85x Skor / 1.80x CRD'],
            featuresEn: ['Dreadnought Every ~25s', 'Accelerated XP & Supply Drops', '1.85x Score / 1.80x CRD']
        },
        timeattack: {
            id: 'timeattack',
            name: 'Zamana Karşı Tahliye',
            nameEn: 'Time Attack Blitz',
            shortTag: '5:00 GERİ SAYIM · 2.4x XP',
            shortTagEn: '5:00 BLITZ · 2.4x XP',
            icon: 'timer',
            color: '#f59e0b',
            desc: '5 dakikalık (300 sn) yüksek tempolu tahliye akını. 2.4x XP kazanımı ile hiper-sürülere karşı rekor puan toplayın.',
            descEn: '300-second extraction blitz with 2.4x XP gain and relentless hyper-swarms.',
            waveCap: null,
            timeLimitSec: 300,
            xpMult: 2.40,
            scoreMult: 1.60,
            creditMult: 1.50,
            features: ['300 Saniye Geri Sayım', '2.4x XP & Hiper-Sürüler', '1.60x Skor / 1.50x CRD'],
            featuresEn: ['300s Extraction Countdown', '2.4x XP & Hyper-Swarms', '1.60x Score / 1.50x CRD']
        },
        daily: {
            id: 'daily',
            name: 'Günlük Protokol',
            nameEn: 'Daily Seeded Protocol',
            shortTag: 'TOHUMLU · 2.20x SKOR',
            shortTagEn: 'SEEDED · 2.20x SCORE',
            icon: 'calendar-check',
            color: '#34d399',
            desc: 'Her gün takvime bağlı deterministik tohum, sabit sektör ve çift mutatör kombinasyonu ile en yüksek günlük skoru hedefleyin.',
            descEn: 'Deterministic daily seed pairing a fixed sector with two daily mutators for high-stakes mastery.',
            waveCap: 15,
            timeLimitSec: null,
            xpMult: 1.25,
            scoreMult: 2.20,
            creditMult: 2.00,
            features: ['Deterministik Günlük Tohum', '2 Aktif Savaş Mutatörü', '2.20x Skor / 2.00x CRD'],
            featuresEn: ['Deterministic Daily Seed', '2 Active Combat Mutators', '2.20x Score / 2.00x CRD']
        }
    };

    // 8 Deterministic Combat Mutators (v10.0)
    const MUTATORS = {
        glassCannon: {
            id: 'glassCannon',
            name: 'Cam Topçu',
            nameEn: 'Glass Cannon',
            icon: 'flame',
            color: '#fb7185',
            desc: '+%65 oyuncu hasarı, ancak maksimum gövde canı %40 azalır.',
            descEn: '+65% player damage, but maximum hull HP is reduced by 40%.',
            playerDmg: 1.65, playerHp: 0.60, cdrMult: 0.90, enemyHp: 1.00, enemySp: 1.05, xpMult: 1.25, magnetMult: 1.00,
            modifiers: { playerDmg: 1.65, playerHp: 0.60, cdrMult: 0.90, enemyHp: 1.00, enemySp: 1.05, xpMult: 1.25, magnetMult: 1.00 }
        },
        hyperCooldown: {
            id: 'hyperCooldown',
            name: 'Aşırı Soğutma',
            nameEn: 'Hyper Cooldown',
            icon: 'zap',
            color: '#38bdf8',
            desc: 'Silah bekleme süreleri %35 kısalır; düşman dayanıklılığı +%15 artar.',
            descEn: 'Weapon cooldowns are 35% shorter while enemy HP increases by 15%.',
            playerDmg: 0.92, playerHp: 1.00, cdrMult: 0.65, enemyHp: 1.15, enemySp: 1.10, xpMult: 1.15, magnetMult: 1.00,
            modifiers: { playerDmg: 0.92, playerHp: 1.00, cdrMult: 0.65, enemyHp: 1.15, enemySp: 1.10, xpMult: 1.15, magnetMult: 1.00 }
        },
        bloodMoon: {
            id: 'bloodMoon',
            name: 'Kızıl Ay İstilası',
            nameEn: 'Blood Moon Swarm',
            icon: 'moon',
            color: '#f43f5e',
            desc: 'Düşmanlar %25 daha hızlı ve %35 daha dayanıklıdır; +%40 XP kazancı verir.',
            descEn: 'Enemies are 25% faster and 35% tougher, granting +40% bonus XP.',
            playerDmg: 1.20, playerHp: 1.00, cdrMult: 1.00, enemyHp: 1.35, enemySp: 1.25, xpMult: 1.40, magnetMult: 1.10,
            modifiers: { playerDmg: 1.20, playerHp: 1.00, cdrMult: 1.00, enemyHp: 1.35, enemySp: 1.25, xpMult: 1.40, magnetMult: 1.10 }
        },
        zeroFriction: {
            id: 'zeroFriction',
            name: 'Sıfır Sürtünme',
            nameEn: 'Zero Friction',
            icon: 'wind',
            color: '#2dd4bf',
            desc: 'Uzay sürtünmesi düşer: düşman ve ganimet akışı +%22 hızlanır.',
            descEn: 'Low-drag space physics: swarm speed rises +22% with +25% pickup magnet.',
            playerDmg: 1.05, playerHp: 0.90, cdrMult: 0.95, enemyHp: 1.00, enemySp: 1.22, xpMult: 1.15, magnetMult: 1.25,
            modifiers: { playerDmg: 1.05, playerHp: 0.90, cdrMult: 0.95, enemyHp: 1.00, enemySp: 1.22, xpMult: 1.15, magnetMult: 1.25 }
        },
        titaniumSwarm: {
            id: 'titaniumSwarm',
            name: 'Titanyum Sürü',
            nameEn: 'Titanium Swarm',
            icon: 'shield',
            color: '#f59e0b',
            desc: 'Düşman gövdeleri %55 daha kalın ama %8 daha yavaştır (+%35 XP).',
            descEn: 'Hostile hulls gain +55% HP but move 8% slower (+35% XP).',
            playerDmg: 1.15, playerHp: 1.15, cdrMult: 1.00, enemyHp: 1.55, enemySp: 0.92, xpMult: 1.35, magnetMult: 1.00,
            modifiers: { playerDmg: 1.15, playerHp: 1.15, cdrMult: 1.00, enemyHp: 1.55, enemySp: 0.92, xpMult: 1.35, magnetMult: 1.00 }
        },
        magnetOverload: {
            id: 'magnetOverload',
            name: 'Manyetik Aşırı Yük',
            nameEn: 'Magnet Overload',
            icon: 'magnet',
            color: '#34d399',
            desc: 'Çekim alanı 2.25x genişler ve +%30 XP sağlar; düşmanlar %12 hızlanır.',
            descEn: 'Pickup radius surges to 2.25x with +30% XP while enemies move 12% faster.',
            playerDmg: 1.00, playerHp: 0.90, cdrMult: 1.00, enemyHp: 1.10, enemySp: 1.12, xpMult: 1.30, magnetMult: 2.25,
            modifiers: { playerDmg: 1.00, playerHp: 0.90, cdrMult: 1.00, enemyHp: 1.10, enemySp: 1.12, xpMult: 1.30, magnetMult: 2.25 }
        },
        overdriveSurge: {
            id: 'overdriveSurge',
            name: 'Overdrive Dalgalanması',
            nameEn: 'Overdrive Surge',
            icon: 'bolt',
            color: '#a78bfa',
            desc: '+%30 silah hasarı ve -%18 dolum süresi; düşmanlar +%25 HP ile güçlenir.',
            descEn: '+30% weapon damage and -18% cooldowns against +25% tougher enemies.',
            playerDmg: 1.30, playerHp: 0.85, cdrMult: 0.82, enemyHp: 1.25, enemySp: 1.15, xpMult: 1.20, magnetMult: 1.00,
            modifiers: { playerDmg: 1.30, playerHp: 0.85, cdrMult: 0.82, enemyHp: 1.25, enemySp: 1.15, xpMult: 1.20, magnetMult: 1.00 }
        },
        blindAmbush: {
            id: 'blindAmbush',
            name: 'Kör Pusu Protokolü',
            nameEn: 'Blind Ambush',
            icon: 'eye-off',
            color: '#c084fc',
            desc: 'Çekim menzili daralır ama XP +%45 ve hasar +%25 artar; hızlı sürü pusuları.',
            descEn: 'Reduced magnet range and faster ambushes in exchange for +45% XP and +25% damage.',
            playerDmg: 1.25, playerHp: 0.80, cdrMult: 0.90, enemyHp: 1.20, enemySp: 1.28, xpMult: 1.45, magnetMult: 0.85,
            modifiers: { playerDmg: 1.25, playerHp: 0.80, cdrMult: 0.90, enemyHp: 1.20, enemySp: 1.28, xpMult: 1.45, magnetMult: 0.85 }
        }
    };

    // 4 Unlockable Fleet Liveries (Skins) usable across any ship
    const SHIP_SKINS = {
        standard: {
            id: 'standard',
            name: 'Standart Filo',
            nameEn: 'Standard Fleet',
            cost: 0,
            unlockCost: 0,
            tint: 0xffffff,
            hex: '#ffffff',
            accent: '#38bdf8',
            desc: 'Orijinal Birleşik Filo titanyum gövde kaplaması.',
            descEn: 'Original United Fleet titanium hull livery.'
        },
        solaris: {
            id: 'solaris',
            name: 'Solaris Altını',
            nameEn: 'Solaris Gold',
            cost: 350,
            unlockCost: 350,
            tint: 0xfde68a,
            hex: '#fde68a',
            accent: '#f59e0b',
            desc: 'Güneş koronası alaşımlı yüksek görünürlüklü altın kaplama.',
            descEn: 'Solar corona alloy high-visibility gold hull plating.'
        },
        crimson: {
            id: 'crimson',
            name: 'Kızıl Öncü',
            nameEn: 'Crimson Vanguard',
            cost: 550,
            unlockCost: 550,
            tint: 0xfda4af,
            hex: '#fda4af',
            accent: '#fb7185',
            desc: 'Yakın muharebe öncü filoları için kızıl titanyum kamuflajı.',
            descEn: 'Crimson titanium finish forged for vanguard strike wings.'
        },
        eclipse: {
            id: 'eclipse',
            name: 'Tutulma Moru',
            nameEn: 'Eclipse Void',
            cost: 850,
            unlockCost: 850,
            tint: 0xd8b4fe,
            hex: '#d8b4fe',
            accent: '#a78bfa',
            desc: 'Karanlık madde rezonanslı derin uzay hayalet kaplaması.',
            descEn: 'Dark-matter resonant deep-space phantom hull finish.'
        }
    };

    // 14 Canonical Weapons (6 Universal + 8 Signature)
    const WEAPONS = {
        dualLaser: {
            id: 'dualLaser', kind: 'weapon', scope: 'universal',
            name: 'Çift Lazer', nameEn: 'Dual Laser',
            icon: 'zap', color: '#38bdf8', pairTrinket: 'coolant', altTrinket: 'targetMatrix',
            evoId: 'gatlingStorm', altEvoId: 'prismOverload',
            stats: { baseDmg: 22, cd: 0.42, projectiles: 2, pierce: 1, dps: 105 },
            desc: 'Paralel foton namlularından yüksek hızlı enerji darbeleri ateşler. İki çapraz evrim yoluna açılır.',
            descEn: 'Fires high-velocity photon bolts from twin barrels. Branches into two cross-evolution paths.'
        },
        heavyPlasma: {
            id: 'heavyPlasma', kind: 'weapon', scope: 'universal',
            name: 'Ağır Plazma Topu', nameEn: 'Heavy Plasma Cannon',
            icon: 'flame', color: '#f59e0b', pairTrinket: 'bioreactor', altTrinket: 'magnet',
            evoId: 'bloodHarvest', altEvoId: 'gravitonImploder',
            stats: { baseDmg: 48, cd: 0.95, projectiles: 1, pierce: 2, dps: 112 },
            desc: 'Çarpışma noktasında alansal şok dalgası bırakan yüksek kütleli plazma gülleleri.',
            descEn: 'Launches high-mass plasma shells that trigger localized shockwaves on impact.'
        },
        energyDisc: {
            id: 'energyDisc', kind: 'weapon', scope: 'universal',
            name: 'Dönen Enerji Diski', nameEn: 'Orbiting Energy Disc',
            icon: 'disc', color: '#a78bfa', pairTrinket: 'thruster', altTrinket: 'coolant',
            evoId: 'aegisResonance', altEvoId: 'cryoVortex',
            stats: { baseDmg: 28, cd: 0.35, projectiles: 3, pierce: 99, dps: 118 },
            desc: 'Gemi yörüngesinde sürekli dönerek yaklaşan sürüleri dilimleyen savunma testereleri.',
            descEn: 'Defensive energy blades orbiting your hull, slicing through approaching swarms.'
        },
        quantumDagger: {
            id: 'quantumDagger', kind: 'weapon', scope: 'universal',
            name: 'Kuantum Hançeri', nameEn: 'Quantum Dagger',
            icon: 'crosshair', color: '#fb7185', pairTrinket: 'magnet', altTrinket: 'targetMatrix',
            evoId: 'cosmicSupernova', altEvoId: 'phantomExecutioner',
            stats: { baseDmg: 30, cd: 0.50, projectiles: 3, pierce: 3, dps: 135 },
            desc: 'Yüksek kritik şanslı ve seri delici faz bıçakları fırlatır.',
            descEn: 'Throws rapid piercing phase blades with elevated critical strike chance.'
        },
        flameLine: {
            id: 'flameLine', kind: 'weapon', scope: 'universal',
            name: 'Alev Hattı', nameEn: 'Flame Line',
            icon: 'sun', color: '#f97316', pairTrinket: 'shieldMatrix', altTrinket: 'bioreactor',
            evoId: 'titanCore', altEvoId: 'necroticNapalm',
            stats: { baseDmg: 18, cd: 0.25, projectiles: 2, pierce: 99, dps: 120 },
            desc: 'Geminin ön ve arka hattında sürekli yakıcı plazma koridoru oluşturur.',
            descEn: 'Projects continuous scorching plasma corridors ahead and behind your ship.'
        },
        swarmMissiles: {
            id: 'swarmMissiles', kind: 'weapon', scope: 'universal',
            name: 'Füze Sürüsü', nameEn: 'Swarm Missiles',
            icon: 'navigation', color: '#34d399', pairTrinket: 'targetMatrix', altTrinket: 'thruster',
            evoId: 'quantumArbiter',
            stats: { baseDmg: 34, cd: 0.72, projectiles: 4, pierce: 1, dps: 142 },
            desc: 'En yakın yüksek tehdit hedeflerine otomatik kilitlenen güdümlü mikro füzeler ateşler.',
            descEn: 'Launches homing micro-missiles that automatically lock onto high-threat targets.'
        },
        photonRailgun: {
            id: 'photonRailgun', kind: 'weapon', scope: 'signature', shipExclusive: 'interceptor',
            name: 'Foton Raylı Top', nameEn: 'Photon Railgun',
            icon: 'arrow-up-right', color: '#38bdf8',
            pairTrinket: 'overdriveCore', evoId: 'tachyonLance',
            stats: { baseDmg: 72, cd: 0.85, projectiles: 1, pierce: 12, dps: 168 },
            desc: 'Avcı özel kök silahı. Hat üzerindeki tüm hedefleri delen yüksek hızlı elektromanyetik ray.',
            descEn: 'Interceptor signature weapon. High-velocity electromagnetic rail piercing entire enemy lines.'
        },
        flakArtillery: {
            id: 'flakArtillery', kind: 'weapon', scope: 'signature', shipExclusive: 'dreadnought',
            name: 'Balistik Flak Topu', nameEn: 'Ballistic Flak Cannon',
            icon: 'bomb', color: '#f59e0b',
            pairTrinket: 'reactiveArmor', evoId: 'siegeBehemoth',
            stats: { baseDmg: 56, cd: 0.90, projectiles: 5, pierce: 2, dps: 162 },
            desc: 'Kruvazör özel kök silahı. Çarpışmada zırh delici şarapnel konisine ayrılan ağır batarya.',
            descEn: 'Dreadnought signature weapon. Heavy artillery bursting into armor-shredding shrapnel cones.'
        },
        teslaPrism: {
            id: 'teslaPrism', kind: 'weapon', scope: 'signature', shipExclusive: 'aegis',
            name: 'Tesla Kalkan Prizması', nameEn: 'Tesla Shield Prism',
            icon: 'shield-alert', color: '#34d399',
            pairTrinket: 'harmonicCapacitor', evoId: 'sanctuaryMaelstrom',
            stats: { baseDmg: 38, cd: 0.62, projectiles: 4, pierce: 4, dps: 152 },
            desc: 'Aegis özel kök silahı. Aktif kalkan enerjisine oranla zincirleme yıldırım arkları çakar.',
            descEn: 'Aegis signature weapon. Arcs chain lightning scaled by active shield energy.'
        },
        voidScythe: {
            id: 'voidScythe', kind: 'weapon', scope: 'signature', shipExclusive: 'phantom',
            name: 'Hiper-Uzay Tırpanı', nameEn: 'Hyperspace Void Scythe',
            icon: 'moon', color: '#a78bfa',
            pairTrinket: 'phaseCloak', evoId: 'abyssalReaper',
            stats: { baseDmg: 64, cd: 0.78, projectiles: 2, pierce: 8, dps: 174 },
            desc: 'Gölge özel kök silahı. Geniş hilal yarığı açar ve arkadan vuruşlarda kritik infaz uygular.',
            descEn: 'Phantom signature weapon. Sweeps wide crescent rifts with critical rear execution power.'
        },
        solarMortar: {
            id: 'solarMortar', kind: 'weapon', scope: 'signature', shipExclusive: 'solarflare',
            name: 'Plazma Havanı', nameEn: 'Solar Plasma Mortar',
            icon: 'circle-dot', color: '#fb7185',
            pairTrinket: 'fusionHeart', evoId: 'heliosCataclysm',
            stats: { baseDmg: 58, cd: 0.92, projectiles: 2, pierce: 99, dps: 165 },
            desc: 'Solar Flare özel kök silahı. Düştüğü noktada sürekli yakıcı güneş kraterleri açar.',
            descEn: 'Solar Flare signature weapon. Lobbed shells carve persistent burning solar craters.'
        },
        cryoNova: {
            id: 'cryoNova', kind: 'weapon', scope: 'signature', shipExclusive: 'tempest',
            name: 'Kriyo-Buzul Küresi', nameEn: 'Cryo-Glacial Orb',
            icon: 'snowflake', color: '#38bdf8',
            pairTrinket: 'teslaCoil', evoId: 'absoluteZero',
            stats: { baseDmg: 42, cd: 0.80, projectiles: 3, pierce: 4, dps: 155 },
            desc: 'Tempest özel kök silahı. Patlayarak düşmanları yavaşlatan ve buz şarapnelleri saçan küre.',
            descEn: 'Tempest signature weapon. Detonates into chilling shockwaves and freezing ice shards.'
        },
        droneSwarm: {
            id: 'droneSwarm', kind: 'weapon', scope: 'signature', shipExclusive: 'valkyrie',
            name: 'Otonom Savaş Droneları', nameEn: 'Autonomous Combat Drones',
            icon: 'radar', color: '#f59e0b',
            pairTrinket: 'neuralLink', evoId: 'seraphFleet',
            stats: { baseDmg: 26, cd: 0.38, projectiles: 4, pierce: 2, dps: 164 },
            desc: 'Valkyrie özel kök silahı. Hedefleri bağımsız takip edip seri lazer ateşi açan dronelar.',
            descEn: 'Valkyrie signature weapon. Independent wing drones tracking targets with rapid laser fire.'
        },
        chronoRift: {
            id: 'chronoRift', kind: 'weapon', scope: 'signature', shipExclusive: 'chronos',
            name: 'Zaman Yarığı Projektörü', nameEn: 'Chrono Rift Projector',
            icon: 'hourglass', color: '#2dd4bf',
            pairTrinket: 'fluxCapacitor', evoId: 'eternityLoop',
            stats: { baseDmg: 46, cd: 0.88, projectiles: 2, pierce: 99, dps: 158 },
            desc: 'Chronos özel kök silahı. İçindeki düşmanları yavaşlatıp zaman kırılmasıyla patlatan yarık.',
            descEn: 'Chronos signature weapon. Projects temporal rifts that slow enemies before detonating.'
        }
    };

    // 14 Canonical Trinkets (6 Universal + 8 Signature)
    const TRINKETS = {
        magnet: {
            id: 'magnet', kind: 'trinket', scope: 'universal',
            name: 'Mıknatıs Çekirdeği', nameEn: 'Magnet Core',
            icon: 'magnet', color: '#34d399', pairWeapon: 'quantumDagger', altWeapon: 'heavyPlasma',
            evoId: 'cosmicSupernova', altEvoId: 'gravitonImploder',
            statLabel: '+%35 Çekim Çapı · +%15 Menzil',
            statLabelEn: '+35% Pickup Radius · +15% Range',
            stats: { magnetBonus: 0.35, rangeBonus: 0.15 },
            desc: 'XP kristalleri ve ganimet çekim alanını genişletir, mermi/etki menzilini uzatır.',
            descEn: 'Expands XP crystal and loot attraction radius while extending projectile range.'
        },
        coolant: {
            id: 'coolant', kind: 'trinket', scope: 'universal',
            name: 'Kriyo Soğutucu', nameEn: 'Cryo Coolant',
            icon: 'thermometer-snowflake', color: '#38bdf8', pairWeapon: 'dualLaser', altWeapon: 'energyDisc',
            evoId: 'gatlingStorm', altEvoId: 'cryoVortex',
            statLabel: '-%14 Bekleme Süresi (CDR)',
            statLabelEn: '-14% Weapon Cooldown (CDR)',
            stats: { cdrBonus: 0.14 },
            desc: 'Tüm aktif silahların ateşleme aralığını ve bekleme süresini azaltır.',
            descEn: 'Reduces firing intervals and cooldown delays across all equipped weapons.'
        },
        thruster: {
            id: 'thruster', kind: 'trinket', scope: 'universal',
            name: 'Kinetik İtici', nameEn: 'Kinetic Thruster',
            icon: 'wind', color: '#a78bfa', pairWeapon: 'energyDisc', altWeapon: 'swarmMissiles',
            evoId: 'aegisResonance',
            statLabel: '+%12 Hız · +%6 Zırh',
            statLabelEn: '+12% Speed · +6% Armor',
            stats: { speedBonus: 0.12, armorBonus: 0.06 },
            desc: 'Gemi manevra hızını ve gövde çarpışma direncini artırır.',
            descEn: 'Boosts ship maneuvering velocity and hull impact resistance.'
        },
        bioreactor: {
            id: 'bioreactor', kind: 'trinket', scope: 'universal',
            name: 'Biyo-Reaktör', nameEn: 'Bio-Reactor',
            icon: 'heart-pulse', color: '#fb7185', pairWeapon: 'heavyPlasma', altWeapon: 'flameLine',
            evoId: 'bloodHarvest', altEvoId: 'necroticNapalm',
            statLabel: '+30 Maks HP · +2.5 HP/sn',
            statLabelEn: '+30 Max HP · +2.5 HP/s',
            stats: { hpBonus: 30, regenBonus: 2.5 },
            desc: 'Maksimum gövde bütünlüğünü yükseltir ve sürekli biyolojik onarım sağlar.',
            descEn: 'Raises maximum hull capacity and provides continuous nanite repair.'
        },
        targetMatrix: {
            id: 'targetMatrix', kind: 'trinket', scope: 'universal',
            name: 'Kuantum Nişangah', nameEn: 'Quantum Targeting Matrix',
            icon: 'target', color: '#f59e0b', pairWeapon: 'swarmMissiles', altWeapon: 'dualLaser',
            evoId: 'quantumArbiter', altEvoId: 'prismOverload',
            statLabel: '+%9 Kritik · +%15 Hasar',
            statLabelEn: '+9% Crit · +15% Damage',
            stats: { critBonus: 0.09, dmgBonus: 0.15 },
            desc: 'Kritik vuruş ihtimalini ve tüm silahların taban hasar çıktısını artırır.',
            descEn: 'Increases critical hit probability and base damage output of all weapons.'
        },
        shieldMatrix: {
            id: 'shieldMatrix', kind: 'trinket', scope: 'universal',
            name: 'Deflektör Matrisi', nameEn: 'Deflector Matrix',
            icon: 'shield', color: '#38bdf8', pairWeapon: 'flameLine',
            evoId: 'titanCore',
            statLabel: '+35 Maks Kalkan · +%20 Dolum',
            statLabelEn: '+35 Max Shield · +20% Recharge',
            stats: { shieldBonus: 35, shieldRegenBonus: 0.20 },
            desc: 'Enerji kalkanı kapasitesini genişletir ve yenilenme hızını artırır.',
            descEn: 'Expands energy shield capacity and accelerates shield regeneration.'
        },
        overdriveCore: {
            id: 'overdriveCore', kind: 'trinket', scope: 'signature', shipExclusive: 'interceptor',
            name: 'Hiper-İvme Çekirdeği', nameEn: 'Hyper-Overdrive Core',
            icon: 'gauge', color: '#38bdf8',
            pairWeapon: 'photonRailgun', evoId: 'tachyonLance',
            statLabel: '+%15 Ateş Hızı · +%20 Kritik Çarpan',
            statLabelEn: '+15% Fire Rate · +20% Crit Multiplier',
            stats: { cdrBonus: 0.15, critDmgBonus: 0.20 },
            desc: 'Avcı imza modülü. Takyon Mızrağı sentezinin zorunlu katalizörüdür.',
            descEn: 'Interceptor signature module. Essential catalyst for Tachyon Lance synthesis.'
        },
        reactiveArmor: {
            id: 'reactiveArmor', kind: 'trinket', scope: 'signature', shipExclusive: 'dreadnought',
            name: 'Reaktif Zırh Plakası', nameEn: 'Reactive Armor Plating',
            icon: 'shield-check', color: '#f59e0b',
            pairWeapon: 'flakArtillery', evoId: 'siegeBehemoth',
            statLabel: '+%8 Zırh · Karşı Şok Patlaması',
            statLabelEn: '+8% Armor · Counter-Shock Blast',
            stats: { armorBonus: 0.08 },
            desc: 'Kruvazör imza modülü. Darbe alındığında çevredeki düşmanlara karşı-şok patlatır.',
            descEn: 'Dreadnought signature module. Unleashes a counter-shock blast upon taking hits.'
        },
        harmonicCapacitor: {
            id: 'harmonicCapacitor', kind: 'trinket', scope: 'signature', shipExclusive: 'aegis',
            name: 'Harmonik Kondansatör', nameEn: 'Harmonic Capacitor',
            icon: 'battery-charging', color: '#34d399',
            pairWeapon: 'teslaPrism', evoId: 'sanctuaryMaelstrom',
            statLabel: '+45 Kalkan · +%12 Alan Çapı',
            statLabelEn: '+45 Shield · +12% Area Radius',
            stats: { shieldBonus: 45, areaBonus: 0.12 },
            desc: 'Aegis imza modülü. Kutsal İyon Fırtınası sentezinin zorunlu katalizörüdür.',
            descEn: 'Aegis signature module. Required catalyst for Sanctuary Ion Maelstrom synthesis.'
        },
        phaseCloak: {
            id: 'phaseCloak', kind: 'trinket', scope: 'signature', shipExclusive: 'phantom',
            name: 'Kuantum Gölge Pelerini', nameEn: 'Quantum Phase Cloak',
            icon: 'eye-off', color: '#a78bfa',
            pairWeapon: 'voidScythe', evoId: 'abyssalReaper',
            statLabel: '+%25 Suikast Kritiği & Gizlilik',
            statLabelEn: '+25% Ambush Crit & Stealth',
            stats: { critBonus: 0.12, cloakBonus: 0.25 },
            desc: 'Gölge imza modülü. Hiçlik Biçicisi sentezinin zorunlu katalizörüdür.',
            descEn: 'Phantom signature module. Required catalyst for Abyssal Reaper synthesis.'
        },
        fusionHeart: {
            id: 'fusionHeart', kind: 'trinket', scope: 'signature', shipExclusive: 'solarflare',
            name: 'Termonükleer Kalp', nameEn: 'Thermonuclear Heart',
            icon: 'flame-kindling', color: '#fb7185',
            pairWeapon: 'solarMortar', evoId: 'heliosCataclysm',
            statLabel: '+%25 Yanma Hasarı · Geniş Aura',
            statLabelEn: '+25% Burn Damage · Wider Aura',
            stats: { dmgBonus: 0.15, burnBonus: 0.25 },
            desc: 'Solar Flare imza modülü. Helios Kıyameti sentezinin zorunlu katalizörüdür.',
            descEn: 'Solar Flare signature module. Required catalyst for Helios Cataclysm synthesis.'
        },
        teslaCoil: {
            id: 'teslaCoil', kind: 'trinket', scope: 'signature', shipExclusive: 'tempest',
            name: 'Süper-İletken Bobin', nameEn: 'Superconducting Coil',
            icon: 'bolt', color: '#38bdf8',
            pairWeapon: 'cryoNova', evoId: 'absoluteZero',
            statLabel: '+%14 Ateş Hızı · +%30 Yavaşlatma',
            statLabelEn: '+14% Fire Rate · +30% Slow Power',
            stats: { cdrBonus: 0.14, slowBonus: 0.30 },
            desc: 'Tempest imza modülü. Mutlak Sıfır sentezinin zorunlu katalizörüdür.',
            descEn: 'Tempest signature module. Required catalyst for Absolute Zero synthesis.'
        },
        neuralLink: {
            id: 'neuralLink', kind: 'trinket', scope: 'signature', shipExclusive: 'valkyrie',
            name: 'Nöral Komuta Ağı', nameEn: 'Neural Command Link',
            icon: 'cpu', color: '#f59e0b',
            pairWeapon: 'droneSwarm', evoId: 'seraphFleet',
            statLabel: '+%20 Drone & Füze Hasarı',
            statLabelEn: '+20% Drone & Missile Damage',
            stats: { dmgBonus: 0.20 },
            desc: 'Valkyrie imza modülü. Seraphim Filosu sentezinin zorunlu katalizörüdür.',
            descEn: 'Valkyrie signature module. Required catalyst for Seraph Fleet synthesis.'
        },
        fluxCapacitor: {
            id: 'fluxCapacitor', kind: 'trinket', scope: 'signature', shipExclusive: 'chronos',
            name: 'Zaman Akı Çekirdeği', nameEn: 'Temporal Flux Core',
            icon: 'clock', color: '#2dd4bf',
            pairWeapon: 'chronoRift', evoId: 'eternityLoop',
            statLabel: '-%15 Tüm Dolum Süreleri',
            statLabelEn: '-15% All Cooldowns',
            stats: { cdrBonus: 0.15 },
            desc: 'Chronos imza modülü. Sonsuzluk Döngüsü sentezinin zorunlu katalizörüdür.',
            descEn: 'Chronos signature module. Required catalyst for Eternity Loop synthesis.'
        }
    };

    // 19 Canonical Evolutions (11 Universal/Cross + 8 Signature)
    const EVOLUTIONS = {
        gatlingStorm: {
            id: 'gatlingStorm', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Gatling Fırtınası', nameEn: 'Gatling Storm', icon: 'wind', color: '#34d399',
            weaponReq: 'dualLaser', trinketReq: 'coolant',
            formula: 'Çift Lazer Lv.5 + Kriyo Soğutucu Lv.5',
            formulaEn: 'Dual Laser Lv.5 + Cryo Coolant Lv.5',
            stats: { baseDmg: 36, cd: 0.11, dps: 650, ricochet: 3 },
            desc: 'Lazerler hiper-hızla yağar ve isabet ettiği düşmanlar arasında otomatik olarak 3 kez seker.',
            descEn: 'Unleashes hyper-rapid laser barrages that automatically ricochet up to 3 times between targets.'
        },
        prismOverload: {
            id: 'prismOverload', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Prizma Kırılması', nameEn: 'Prism Overload', icon: 'sparkles', color: '#38bdf8',
            weaponReq: 'dualLaser', trinketReq: 'targetMatrix',
            formula: 'Çift Lazer Lv.5 + Kuantum Nişangah Lv.5',
            formulaEn: 'Dual Laser Lv.5 + Quantum Targeting Matrix Lv.5',
            stats: { baseDmg: 42, cd: 0.22, dps: 615, split: 5 },
            desc: 'Çift Lazerin çapraz evrimi. Kritik lazer vuruşları 5 yöne kırılan yüksek enerjili fotonlara bölünür.',
            descEn: 'Dual Laser cross-evolution. Critical hits refract into 5 high-energy photon beams.'
        },
        bloodHarvest: {
            id: 'bloodHarvest', kind: 'evolution', scope: 'universal', tier: 'A+',
            name: 'Kan Hasadı', nameEn: 'Crimson Harvest', icon: 'droplets', color: '#fb7185',
            weaponReq: 'heavyPlasma', trinketReq: 'bioreactor',
            formula: 'Ağır Plazma Topu Lv.5 + Biyo-Reaktör Lv.5',
            formulaEn: 'Heavy Plasma Cannon Lv.5 + Bio-Reactor Lv.5',
            stats: { baseDmg: 95, cd: 0.65, dps: 540, lifesteal: 0.10 },
            desc: 'Kızıl plazma şok dalgaları yayar ve verilen hasarın %10’unu doğrudan gemi canına dönüştürür.',
            descEn: 'Emits crimson plasma shockwaves and converts 10% of damage dealt directly into hull repair.'
        },
        gravitonImploder: {
            id: 'gravitonImploder', kind: 'evolution', scope: 'universal', tier: 'A+',
            name: 'Graviton Çökertici', nameEn: 'Graviton Imploder', icon: 'orbit', color: '#f59e0b',
            weaponReq: 'heavyPlasma', trinketReq: 'magnet',
            formula: 'Ağır Plazma Topu Lv.5 + Mıknatıs Çekirdeği Lv.5',
            formulaEn: 'Heavy Plasma Cannon Lv.5 + Magnet Core Lv.5',
            stats: { baseDmg: 108, cd: 0.72, dps: 560, pullRadius: 190 },
            desc: 'Ağır Plazmanın çapraz evrimi. Patlama noktasında düşmanları merkeze çekip birbirine çarptırır.',
            descEn: 'Heavy Plasma cross-evolution. Implodes nearby enemies into the detonation center.'
        },
        aegisResonance: {
            id: 'aegisResonance', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Aegis Rezonansı', nameEn: 'Aegis Resonance', icon: 'shield-plus', color: '#38bdf8',
            weaponReq: 'energyDisc', trinketReq: 'thruster',
            formula: 'Dönen Enerji Diski Lv.5 + Kinetik İtici Lv.5',
            formulaEn: 'Orbiting Energy Disc Lv.5 + Kinetic Thruster Lv.5',
            stats: { baseDmg: 52, cd: 0.18, dps: 590, discs: 6 },
            desc: '6 adet dev kesici disk yörüngede döner; hareket ettikçe kalkan dolar, kalkan kırıldığında EMP patlar.',
            descEn: '6 giant resonance blades orbit your ship, recharging shields on movement and pulsing EMP on break.'
        },
        cryoVortex: {
            id: 'cryoVortex', kind: 'evolution', scope: 'universal', tier: 'A+',
            name: 'Kriyo Kasırgası', nameEn: 'Cryo Vortex', icon: 'snowflake', color: '#7dd3fc',
            weaponReq: 'energyDisc', trinketReq: 'coolant',
            formula: 'Dönen Enerji Diski Lv.5 + Kriyo Soğutucu Lv.5',
            formulaEn: 'Orbiting Energy Disc Lv.5 + Cryo Coolant Lv.5',
            stats: { baseDmg: 48, cd: 0.20, dps: 555, slowPct: 60 },
            desc: 'Enerji Diskinin çapraz evrimi. Sıfır-altı buz testereleri temas ettiği düşmanları dondurur ve parçalar.',
            descEn: 'Energy Disc cross-evolution. Sub-zero frost sawblades chill and shatter incoming swarms.'
        },
        cosmicSupernova: {
            id: 'cosmicSupernova', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Kozmik Süpernova', nameEn: 'Cosmic Supernova', icon: 'aperture', color: '#a78bfa',
            weaponReq: 'quantumDagger', trinketReq: 'magnet',
            formula: 'Kuantum Hançeri Lv.5 + Mıknatıs Çekirdeği Lv.5',
            formulaEn: 'Quantum Dagger Lv.5 + Magnet Core Lv.5',
            stats: { baseDmg: 68, cd: 0.34, dps: 680, singularity: true },
            desc: 'Kritik hançer vuruşları alansal bir Kara Delik açar ve çevredeki düşmanları içine çekip ezer.',
            descEn: 'Critical dagger hits tear open localized Black Holes that crush nearby hostiles.'
        },
        phantomExecutioner: {
            id: 'phantomExecutioner', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Hayalet İnfazcı', nameEn: 'Phantom Executioner', icon: 'swords', color: '#fb7185',
            weaponReq: 'quantumDagger', trinketReq: 'targetMatrix',
            formula: 'Kuantum Hançeri Lv.5 + Kuantum Nişangah Lv.5',
            formulaEn: 'Quantum Dagger Lv.5 + Quantum Targeting Matrix Lv.5',
            stats: { baseDmg: 74, cd: 0.32, dps: 705, chain: 5 },
            desc: 'Kuantum Hançerinin çapraz evrimi. Hedefler arasında sıçrayan bıçaklar yaralı düşmanları anında infaz eder.',
            descEn: 'Quantum Dagger cross-evolution. Blades chain between enemies and instantly execute wounded targets.'
        },
        titanCore: {
            id: 'titanCore', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Titan Koronası', nameEn: 'Titan Corona', icon: 'sun', color: '#f59e0b',
            weaponReq: 'flameLine', trinketReq: 'shieldMatrix',
            formula: 'Alev Hattı Lv.5 + Deflektör Matrisi Lv.5',
            formulaEn: 'Flame Line Lv.5 + Deflector Matrix Lv.5',
            stats: { baseDmg: 45, cd: 0.16, dps: 625, novaInterval: 2.5 },
            desc: 'Devasa güneş halkasına dönüşür ve her 2.5 sn’de bir ekran çapında yakıcı Termal Nova yayar.',
            descEn: 'Transforms into a massive solar ring that pulses a scorching Thermal Nova every 2.5 seconds.'
        },
        necroticNapalm: {
            id: 'necroticNapalm', kind: 'evolution', scope: 'universal', tier: 'A+',
            name: 'Biyo-Napalm Seli', nameEn: 'Bio-Napalm Flood', icon: 'flask-conical', color: '#34d399',
            weaponReq: 'flameLine', trinketReq: 'bioreactor',
            formula: 'Alev Hattı Lv.5 + Biyo-Reaktör Lv.5',
            formulaEn: 'Flame Line Lv.5 + Bio-Reactor Lv.5',
            stats: { baseDmg: 42, cd: 0.18, dps: 570, healPool: true },
            desc: 'Alev Hattının çapraz evrimi. Yanan düşmanlar eriyerek pilota can yenileyen biyo-plazma alanı bırakır.',
            descEn: 'Flame Line cross-evolution. Scorched foes dissolve into restorative bio-plasma pools.'
        },
        quantumArbiter: {
            id: 'quantumArbiter', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Kuantum Yargıç', nameEn: 'Quantum Arbiter', icon: 'crosshair', color: '#f59e0b',
            weaponReq: 'swarmMissiles', trinketReq: 'targetMatrix',
            formula: 'Füze Sürüsü Lv.5 + Kuantum Nişangah Lv.5',
            formulaEn: 'Swarm Missiles Lv.5 + Quantum Targeting Matrix Lv.5',
            stats: { baseDmg: 82, cd: 0.45, dps: 690, pierceScaling: 0.25 },
            desc: 'Füzeler düşmanları delip geçen kuantum mızraklarına dönüşür; her delmede +%25 güçlenir.',
            descEn: 'Missiles evolve into piercing quantum spears that gain +25% damage per enemy pierced.'
        },
        tachyonLance: {
            id: 'tachyonLance', kind: 'evolution', scope: 'signature', shipExclusive: 'interceptor', tier: 'S+',
            name: 'Takyon Mızrağı', nameEn: 'Tachyon Lance', icon: 'zap', color: '#38bdf8',
            weaponReq: 'photonRailgun', altWeaponReq: 'dualLaser', trinketReq: 'overdriveCore',
            formula: 'Foton Raylı Top (veya Çift Lazer) Lv.5 + Hiper-İvme Çekirdeği Lv.5',
            formulaEn: 'Photon Railgun (or Dual Laser) Lv.5 + Hyper-Overdrive Core Lv.5',
            stats: { baseDmg: 148, cd: 0.46, dps: 840, infinitePierce: true },
            desc: 'Avcı özel evrimi. Ekranı boydan boya delen sonsuz hızlı takyon ışını ve patlayan foton izi.',
            descEn: 'Interceptor signature evolution. Infinite-pierce tachyon beams leaving explosive photon wakes.'
        },
        siegeBehemoth: {
            id: 'siegeBehemoth', kind: 'evolution', scope: 'signature', shipExclusive: 'dreadnought', tier: 'S+',
            name: 'Kıyamet Bataryası', nameEn: 'Siege Behemoth Battery', icon: 'bomb', color: '#f59e0b',
            weaponReq: 'flakArtillery', altWeaponReq: 'heavyPlasma', trinketReq: 'reactiveArmor',
            formula: 'Balistik Flak Topu (veya Ağır Plazma) Lv.5 + Reaktif Zırh Plakası Lv.5',
            formulaEn: 'Ballistic Flak Cannon (or Heavy Plasma) Lv.5 + Reactive Armor Plating Lv.5',
            stats: { baseDmg: 135, cd: 0.58, dps: 820, shrapnel: 12 },
            desc: 'Kruvazör özel evrimi. Zırh delici nükleer havan yaylımı ve 12 yöne parça tesirli patlama.',
            descEn: 'Dreadnought signature evolution. Armor-piercing siege shells exploding into 12 shrapnel blasts.'
        },
        sanctuaryMaelstrom: {
            id: 'sanctuaryMaelstrom', kind: 'evolution', scope: 'signature', shipExclusive: 'aegis', tier: 'S+',
            name: 'Kutsal İyon Fırtınası', nameEn: 'Sanctuary Ion Maelstrom', icon: 'shield-alert', color: '#34d399',
            weaponReq: 'teslaPrism', altWeaponReq: 'energyDisc', trinketReq: 'harmonicCapacitor',
            formula: 'Tesla Kalkan Prizması (veya Enerji Diski) Lv.5 + Harmonik Kondansatör Lv.5',
            formulaEn: 'Tesla Shield Prism (or Energy Disc) Lv.5 + Harmonic Capacitor Lv.5',
            stats: { baseDmg: 92, cd: 0.32, dps: 790, shieldConvert: true },
            desc: 'Aegis özel evrimi. Yörüngedeki düğümler arasında yıldırım ağı örer ve mermileri kalkana çevirir.',
            descEn: 'Aegis signature evolution. Weaves lightning webs between orbital nodes and converts bullets to shields.'
        },
        abyssalReaper: {
            id: 'abyssalReaper', kind: 'evolution', scope: 'signature', shipExclusive: 'phantom', tier: 'S+',
            name: 'Hiçlik Biçicisi', nameEn: 'Abyssal Reaper', icon: 'moon', color: '#a78bfa',
            weaponReq: 'voidScythe', altWeaponReq: 'quantumDagger', trinketReq: 'phaseCloak',
            formula: 'Hiper-Uzay Tırpanı (veya Kuantum Hançeri) Lv.5 + Kuantum Gölge Pelerini Lv.5',
            formulaEn: 'Void Scythe (or Quantum Dagger) Lv.5 + Quantum Phase Cloak Lv.5',
            stats: { baseDmg: 142, cd: 0.44, dps: 860, executeThreshold: 0.25 },
            desc: 'Gölge özel evrimi. Gölge klonları fırlatan boyutsal tırpan; düşük canlı hedefleri anında infaz eder.',
            descEn: 'Phantom signature evolution. Dimensional scythes with shadow clones that execute weakened targets.'
        },
        heliosCataclysm: {
            id: 'heliosCataclysm', kind: 'evolution', scope: 'signature', shipExclusive: 'solarflare', tier: 'S+',
            name: 'Helios Güneş Kıyameti', nameEn: 'Helios Cataclysm', icon: 'flame', color: '#fb7185',
            weaponReq: 'solarMortar', altWeaponReq: 'flameLine', trinketReq: 'fusionHeart',
            formula: 'Plazma Havanı (veya Alev Hattı) Lv.5 + Termonükleer Kalp Lv.5',
            formulaEn: 'Solar Mortar (or Flame Line) Lv.5 + Thermonuclear Heart Lv.5',
            stats: { baseDmg: 128, cd: 0.54, dps: 815, chainDetonate: true },
            desc: 'Solar Flare özel evrimi. Dev güneş kraterleri açar ve yanan her hedefi zincirleme patlatır.',
            descEn: 'Solar Flare signature evolution. Ignites massive solar craters and triggers chain-reaction blasts.'
        },
        absoluteZero: {
            id: 'absoluteZero', kind: 'evolution', scope: 'signature', shipExclusive: 'tempest', tier: 'S+',
            name: 'Mutlak Sıfır Fırtınası', nameEn: 'Absolute Zero Tempest', icon: 'snowflake', color: '#38bdf8',
            weaponReq: 'cryoNova', altWeaponReq: 'dualLaser', trinketReq: 'teslaCoil',
            formula: 'Kriyo-Buzul Küresi (veya Çift Lazer) Lv.5 + Süper-İletken Bobin Lv.5',
            formulaEn: 'Cryo-Glacial Orb (or Dual Laser) Lv.5 + Superconducting Coil Lv.5',
            stats: { baseDmg: 112, cd: 0.48, dps: 795, freezeSec: 2.0 },
            desc: 'Tempest özel evrimi. Ekran çapında dondurucu buzul ve zincirleme yıldırım fırtınası koparır.',
            descEn: 'Tempest signature evolution. Unleashes arena-wide glacial freezes and chaining lightning arcs.'
        },
        seraphFleet: {
            id: 'seraphFleet', kind: 'evolution', scope: 'signature', shipExclusive: 'valkyrie', tier: 'S+',
            name: 'Seraphim Drone Filosu', nameEn: 'Seraph Drone Fleet', icon: 'radar', color: '#f59e0b',
            weaponReq: 'droneSwarm', altWeaponReq: 'swarmMissiles', trinketReq: 'neuralLink',
            formula: 'Otonom Savaş Droneları (veya Füze Sürüsü) Lv.5 + Nöral Komuta Ağı Lv.5',
            formulaEn: 'Combat Drones (or Swarm Missiles) Lv.5 + Neural Command Link Lv.5',
            stats: { baseDmg: 48, cd: 0.16, dps: 830, drones: 6 },
            desc: 'Valkyrie özel evrimi. 6 adet elit Seraphim dronu yörüngede döner ve kesintisiz lazer yağdırır.',
            descEn: 'Valkyrie signature evolution. Deploys 6 elite Seraph drones delivering relentless laser fire.'
        },
        eternityLoop: {
            id: 'eternityLoop', kind: 'evolution', scope: 'signature', shipExclusive: 'chronos', tier: 'S+',
            name: 'Sonsuzluk Döngüsü', nameEn: 'Eternity Loop', icon: 'infinity', color: '#2dd4bf',
            weaponReq: 'chronoRift', altWeaponReq: 'energyDisc', trinketReq: 'fluxCapacitor',
            formula: 'Zaman Yarığı Projektörü (veya Enerji Diski) Lv.5 + Zaman Akı Çekirdeği Lv.5',
            formulaEn: 'Chrono Rift Projector (or Energy Disc) Lv.5 + Temporal Flux Core Lv.5',
            stats: { baseDmg: 118, cd: 0.50, dps: 805, dualRings: true },
            desc: 'Chronos özel evrimi. Düşmanları zaman döngüsüne hapseden çifte tekillik halkaları açar.',
            descEn: 'Chronos signature evolution. Generates twin temporal singularity loops that trap and collapse foes.'
        }
    };

    // 6 Canonical Super / Mega Evolutions
    const SUPER_EVOLUTIONS = {
        infernoGatling: {
            id: 'infernoGatling', kind: 'superEvolution', scope: 'universal', tier: 'MEGA',
            name: 'Cehennem Gatling’i', nameEn: 'Inferno Gatling', icon: 'flame', color: '#fb7185',
            shipSynergies: ['solarflare', 'interceptor'],
            evoReqs: ['bloodHarvest', 'gatlingStorm'],
            evoPool: ['bloodHarvest', 'gatlingStorm', 'heliosCataclysm', 'necroticNapalm'],
            formula: 'Kan Hasadı + Gatling Fırtınası (+1 Silah Slotu Açar)',
            formulaEn: 'Crimson Harvest + Gatling Storm (+1 Weapon Slot)',
            stats: { baseDmg: 86, cd: 0.08, dps: 1620 },
            desc: 'Seken cehennem mermileri yağdırır; her sekmede plazma patlaması yaratır ve pilotu sürekli iyileştirir.',
            descEn: 'Sprays ricocheting hellfire rounds that detonate plasma bursts and continuously leech hull health.'
        },
        eventHorizon: {
            id: 'eventHorizon', kind: 'superEvolution', scope: 'universal', tier: 'MEGA',
            name: 'Olay Ufku Tekilliği', nameEn: 'Event Horizon Singularity', icon: 'orbit', color: '#38bdf8',
            stats: { baseDmg: 245, cd: 0.58, dps: 422 },
            shipSynergies: ['aegis', 'tempest', 'phantom'],
            evoReqs: ['cosmicSupernova', 'aegisResonance'],
            evoPool: ['cosmicSupernova', 'aegisResonance', 'sanctuaryMaelstrom', 'cryoVortex', 'absoluteZero'],
            formula: 'Kozmik Süpernova + Aegis Rezonansı / Kalkan Fırtınası (+1 Silah Slotu Açar)',
            formulaEn: 'Cosmic Supernova + Aegis Resonance / Shield Maelstrom (+1 Weapon Slot)',
            desc: 'Yörüngede olay ufku testereleri dönerken her kritikte EMP şoklu çifte Kara Delik açar.',
            descEn: 'Orbits event-horizon blades while critical hits open twin EMP-pulsing Black Holes.'
        },
        omegaJudgement: {
            id: 'omegaJudgement', kind: 'superEvolution', scope: 'universal', tier: 'MEGA',
            name: 'Omega Kıyamet Reaktörü', nameEn: 'Omega Judgement Reactor', icon: 'crown', color: '#f59e0b',
            stats: { baseDmg: 265, cd: 0.62, dps: 427 },
            shipSynergies: ['valkyrie', 'chronos'],
            evoReqs: ['titanCore', 'quantumArbiter'],
            evoPool: ['titanCore', 'quantumArbiter', 'prismOverload', 'seraphFleet', 'eternityLoop'],
            formula: 'Titan Koronası + Kuantum Yargıç / Filo (+1 Silah Slotu Açar)',
            formulaEn: 'Titan Corona + Quantum Arbiter / Fleet (+1 Weapon Slot)',
            desc: 'Sürekli güneş koronası yayarken tüm ekrana delici termonükleer kuantum mızrakları yağdırır.',
            descEn: 'Radiates an endless solar corona while raining piercing thermonuclear quantum spears.'
        },
        hyperionApex: {
            id: 'hyperionApex', kind: 'superEvolution', scope: 'signature', shipExclusive: 'interceptor', tier: 'MEGA',
            shipSynergies: ['interceptor'],
            name: 'Hyperion Işık Hükümdarı', nameEn: 'Hyperion Light Sovereign', icon: 'zap', color: '#38bdf8',
            stats: { baseDmg: 155, cd: 0.34, dps: 456 },
            evoReqs: ['tachyonLance', 'gatlingStorm'],
            evoPool: ['tachyonLance', 'gatlingStorm', 'prismOverload'],
            formula: 'Takyon Mızrağı + Gatling Fırtınası (Avcı Mega Evrimi)',
            formulaEn: 'Tachyon Lance + Gatling Storm (Interceptor Mega Evo)',
            desc: 'Ekranı 8 yönde kesen yörüngesel takyon lazer ağı ve sınırsız sekme kapasiteli ışık fırtınası.',
            descEn: '8-way orbital tachyon laser matrix paired with limitless ricocheting light storms.'
        },
        ironDreadnought: {
            id: 'ironDreadnought', kind: 'superEvolution', scope: 'signature', shipExclusive: 'dreadnought', tier: 'MEGA',
            shipSynergies: ['dreadnought'],
            name: 'Zırhlı Kıyamet Kalesi', nameEn: 'Iron Fortress Cataclysm', icon: 'shield', color: '#f59e0b',
            stats: { baseDmg: 310, cd: 0.72, dps: 431 },
            evoReqs: ['siegeBehemoth', 'titanCore'],
            evoPool: ['siegeBehemoth', 'titanCore', 'gravitonImploder'],
            formula: 'Kıyamet Bataryası + Titan Koronası (Kruvazör Mega Evrimi)',
            formulaEn: 'Siege Behemoth + Titan Corona (Dreadnought Mega Evo)',
            desc: 'Reaktif kale zırhı ve 360° kesintisiz nükleer-graviton havan bombardımanı.',
            descEn: 'Reactive fortress plating with 360° nuclear-graviton mortar bombardment.'
        },
        eclipseSingularity: {
            id: 'eclipseSingularity', kind: 'superEvolution', scope: 'signature', shipExclusive: 'phantom', tier: 'MEGA',
            shipSynergies: ['phantom'],
            name: 'Tutulma Tanrısı', nameEn: 'Eclipse Singularity Sovereign', icon: 'moon', color: '#a78bfa',
            stats: { baseDmg: 290, cd: 0.65, dps: 446 },
            evoReqs: ['abyssalReaper', 'cosmicSupernova'],
            evoPool: ['abyssalReaper', 'cosmicSupernova', 'phantomExecutioner'],
            formula: 'Hiçlik Biçicisi + Kozmik Süpernova (Gölge Mega Evrimi)',
            formulaEn: 'Abyssal Reaper + Cosmic Supernova (Phantom Mega Evo)',
            desc: 'Karanlık madde klonları ve boyutsal kara delik tırpanlarıyla ekran çapında mutlak suikast yıkımı.',
            descEn: 'Dark-matter shadow clones and singularity scythes delivering arena-wide assassination.'
        }
    };

    // 8 Canonical Enemy Archetypes
    const ENEMIES = [
        {
            id: 'swarmer',
            name: 'Drone Sürüsü', nameEn: 'Swarmer Drone',
            gameTypes: ['drone', 'speeder'],
            asset: 'assets/enemies/swarmer.png',
            threat: 'DÜŞÜK', threatEn: 'LOW',
            hpNote: '45 – 85 HP',
            speedNote: 'Yüksek', speedNoteEn: 'High',
            color: '#38bdf8',
            behavior: 'Yüksek sayılarda sürü halinde oyuncunun doğrudan rotasına kapanır; erken dalga XP kaynağıdır.',
            behaviorEn: 'Rushes your flight path in dense packs; primary early-wave XP crystal source.',
            counter: 'Enerji Diski, Çift Lazer ve Alev Hattı ile güvenli çember açın.',
            counterEn: 'Carve safe space using Orbiting Discs, Dual Lasers, or Flame Line.'
        },
        {
            id: 'kamikaze',
            name: 'İntihar Bombacısı', nameEn: 'Kamikaze Striker',
            gameTypes: ['kamikaze', 'sweeper'],
            asset: 'assets/enemies/kamikaze.png',
            threat: 'YÜKSEK', threatEn: 'HIGH',
            hpNote: '90 – 130 HP',
            speedNote: 'Çok Yüksek', speedNoteEn: 'Very High',
            color: '#fb7185',
            behavior: 'Yakın mesafeye girince hızlanıp kalkanı delen yüksek patlama şokuna dönüşür.',
            behaviorEn: 'Surges at close range to detonate in a shield-piercing blast.',
            counter: 'Kuantum Nişangahlı güdümlü füzelerle veya Foton Raylı Top ile menzile girmeden durdurun.',
            counterEn: 'Intercept early with homing Swarm Missiles or piercing Photon Railgun.'
        },
        {
            id: 'shooter',
            name: 'Plazma Nişancısı', nameEn: 'Plasma Marksman',
            gameTypes: ['shooter', 'orbiter'],
            asset: 'assets/enemies/shooter.png',
            threat: 'ORTA', threatEn: 'MEDIUM',
            hpNote: '110 – 160 HP',
            speedNote: 'Orta', speedNoteEn: 'Medium',
            color: '#a78bfa',
            behavior: 'Orta menzilde yörüngeye oturup oyuncuya kilitlenen enerji mermileri ateşler.',
            behaviorEn: 'Holds mid-range orbit while firing targeted plasma bolts.',
            counter: 'Aegis EMP Şok Dalgası mermilerini temizleyip kalkana dönüştürebilir.',
            counterEn: 'Aegis EMP Shockwave clears incoming shots and converts them into shields.'
        },
        {
            id: 'phantom',
            name: 'Faz Hayaleti', nameEn: 'Phase Phantom',
            gameTypes: ['phantom'],
            asset: 'assets/enemies/phantom.png',
            threat: 'YÜKSEK', threatEn: 'HIGH',
            hpNote: '140 HP',
            speedNote: 'Faz Sıçramalı', speedNoteEn: 'Phase Blink',
            color: '#a78bfa',
            behavior: 'Periyodik görünmezlik fazına geçip oyuncunun yan açısına kısa ışınlanma gerçekleştirir.',
            behaviorEn: 'Cycles into stealth phase and blinks onto your flank angles.',
            counter: 'Görünürlük parıltısı sırasında alan hasarı (Alev Hattı / Kriyo-Buzul) ile yakalayın.',
            counterEn: 'Tag it during shimmer windows with AoE Flame Line or Cryo-Glacial blasts.'
        },
        {
            id: 'tank',
            name: 'Zırhlı Kalkan Taşıyıcı', nameEn: 'Armored Bastion',
            gameTypes: ['tank', 'shielder'],
            asset: 'assets/enemies/tank.png',
            threat: 'YÜKSEK', threatEn: 'HIGH',
            hpNote: '320 – 480 HP',
            speedNote: 'Ağır', speedNoteEn: 'Heavy',
            color: '#f59e0b',
            behavior: 'Yüksek zırh katsayısına sahiptir; Elit varyantları çevresindeki sürülere koruma sağlar.',
            behaviorEn: 'Heavily armored bruiser; Elite variants project protective shielding to nearby packs.',
            counter: 'Delici (Pierce) ve Zırh Kırıcı silahlar (Foton Rayı, Flak, Kuantum Yargıç) ile eritin.',
            counterEn: 'Break through with high-pierce weapons like Railgun, Flak, or Quantum Arbiter.'
        },
        {
            id: 'splitter',
            name: 'Bölünen Parazit', nameEn: 'Mitosis Splitter',
            gameTypes: ['splitter'],
            asset: 'assets/enemies/splitter.png',
            threat: 'ORTA', threatEn: 'MEDIUM',
            hpNote: '180 HP -> 2x Mini',
            speedNote: 'Orta', speedNoteEn: 'Medium',
            color: '#34d399',
            behavior: 'Yok edildiğinde 2 adet hızlı alt birime ayrılarak XP akışını ve kalabalık baskısını artırır.',
            behaviorEn: 'Splits into two agile sub-units on death, increasing crowd pressure and XP yield.',
            counter: 'Graviton Çökertici veya Kozmik Süpernova ile ayrılan parçaları tek merkezde toplayın.',
            counterEn: 'Cluster split spawns together with Graviton Imploder or Cosmic Supernova.'
        },
        {
            id: 'sniper',
            name: 'Takyon Keskin Nişancı', nameEn: 'Tachyon Sniper',
            gameTypes: ['sniper'],
            asset: 'assets/enemies/sniper.png',
            threat: 'KRİTİK', threatEn: 'CRITICAL',
            hpNote: '150 HP',
            speedNote: 'Sabit Pozisyon', speedNoteEn: 'Stationary',
            color: '#fb7185',
            behavior: 'Uzun kırmızı lazer nişan hattı çizdikten sonra ekranı aşan yüksek hızlı delici atış yapar.',
            behaviorEn: 'Projects a crimson targeting laser before firing a screen-wide high-velocity shot.',
            counter: 'Nişan lazeri kilitlenmeden önce dikey yönde manevra yapın veya Warp Dash kullanın.',
            counterEn: 'Strafe perpendicularly or Warp Dash before the targeting laser locks on.'
        },
        {
            id: 'queen',
            name: 'Kovan Şifacısı / Kraliçe', nameEn: 'Hive Matriarch / Healer',
            gameTypes: ['healer', 'queen'],
            asset: 'assets/enemies/queen.png',
            threat: 'YÜKSEK', threatEn: 'HIGH',
            hpNote: '360 – 650 HP',
            speedNote: 'Orta', speedNoteEn: 'Medium',
            color: '#34d399',
            behavior: 'Çevresindeki elit ve zırhlı birimlere sürekli can yenileme darbesi ve destek takviyesi yayar.',
            behaviorEn: 'Radiates healing pulses and reinforcement buffs to nearby elite units.',
            counter: 'Sürü içindeki yüksek öncelikli hedeftir; güdümlü Füze/Drone saldırısını doğrudan üzerine çekin.',
            counterEn: 'Priority target inside packs—focus homing Swarm Missiles or Combat Drones on it.'
        }
    ];

    // 5 Canonical Boss Archetypes
    const BOSSES = [
        {
            id: 'behemoth',
            name: 'Oblivion Behemoth',
            subtitle: 'Zırhlı Yıkıcı · Ön Plaka Koruması',
            subtitleEn: 'Armored Juggernaut · Frontal Shield Plate',
            gameBossType: 'behemoth',
            spawnWave: 'Dalga 15 / 30+ (ve Boss Akını)',
            spawnWaveEn: 'Wave 15 / 30+ (and Boss Rush)',
            asset: 'assets/bosses/behemoth.png',
            color: '#f59e0b',
            mechanics: [
                'Ön 1.75 radyanlık ağır zırh yayı doğrudan mermileri tamamen engeller.',
                'Arka çekirdek açısına yapılan isabetler zayıf nokta olarak %175 Kritik Hasar uygular.',
                '≤ %50 HP’de Öfke Fazı II açılır: +%32 hız, çift salvo ve şok atılması.'
            ],
            mechanicsEn: [
                'Front 1.75-radian armor arc blocks frontal projectiles completely.',
                'Hits to its exposed rear reactor core deal 175% weakpoint critical damage.',
                'Enters Rage Phase II below 50% HP: +32% speed, twin salvos, and shock dashes.'
            ],
            tactics: 'Behemoth’un dönüş hızından hızlı manevra yaparak yan/arka açısına geçin veya yörünge/alan silahları kullanın.',
            tacticsEn: 'Out-flank its turn rate to strike the rear core, or bypass the shield with AoE and orbital weapons.'
        },
        {
            id: 'leviathan',
            name: 'Void Leviathan',
            subtitle: 'Amansız Takipçi · Şok Atılması',
            subtitleEn: 'Relentless Pursuer · Shock Dash',
            gameBossType: 'chaser',
            spawnWave: 'Her 5. Dalga Rotasyonu',
            spawnWaveEn: 'Every 5th Wave Rotation',
            asset: 'assets/bosses/leviathan.png',
            color: '#fb7185',
            mechanics: [
                '4.6 sn aralıklarla yüksek hızlı şok atılması (Dash) yaparak mesafeyi kapatır.',
                'Tek vuruşta maks HP’nin %12’sinden fazlasını koruyan Faz Kalkanına sahiptir.',
                '≤ %50 HP’de Öfke Fazı II ile atılma bekleme süresi kısalır ve çift salvo ateşler.'
            ],
            mechanicsEn: [
                'Executes high-speed shock dashes every 4.6 seconds to close distance.',
                'Phase armor caps single-hit damage bursts at 12% of its maximum HP.',
                'Rage Phase II below 50% HP shortens dash cooldowns and fires twin barrages.'
            ],
            tactics: 'Atılma animasyonunu gördüğünüz anda 90° dik açı verip kriyo/yavaşlatma etkilerini aktif tutun.',
            tacticsEn: 'Break 90 degrees when it telegraphs a charge and keep cryo/slow debuffs active.'
        },
        {
            id: 'hivemind',
            name: 'Hivemind Dreadcore',
            subtitle: 'Mermi Cehennemi · 360° Plazma Halkaları',
            subtitleEn: 'Bullet Storm · 360° Plasma Rings',
            gameBossType: 'bullethell',
            spawnWave: 'Her 5. Dalga Rotasyonu',
            spawnWaveEn: 'Every 5th Wave Rotation',
            asset: 'assets/bosses/hivemind.png',
            color: '#a78bfa',
            mechanics: [
                'Dönerek yayılan yoğun mermi perdeleri ve radyal plazma dalgaları üretir.',
                'Sürü birimleriyle koordineli baskı kurarak güvenli manevra koridorlarını daraltır.',
                '≤ %50 HP Öfke Fazı II altında mermi yoğunluğu iki katına çıkar.'
            ],
            mechanicsEn: [
                'Generates rotating spiral bullet curtains and radial plasma shockwaves.',
                'Coordinates with surrounding swarms to compress safe dodging lanes.',
                'Projectile density doubles under Rage Phase II below 50% HP.'
            ],
            tactics: 'Mermi koridorlarında kısa mikro-dokunuşlarla süzülün; Aegis EMP veya uzun menzilli raylı silahlar çok etkilidir.',
            tacticsEn: 'Micro-dodge through spiral lanes; Aegis EMP or long-range railguns excel here.'
        },
        {
            id: 'chronovore',
            name: 'Chronos Weaver',
            subtitle: 'Zaman Dokuyucu · Çekim Yarıkları',
            subtitleEn: 'Time Weaver · Gravity Rifts',
            gameBossType: 'chronos',
            spawnWave: 'Dalga 20+ (ve Boss Akını)',
            spawnWaveEn: 'Wave 20+ (and Boss Rush)',
            asset: 'assets/bosses/chronovore.png',
            color: '#2dd4bf',
            mechanics: [
                'Oyuncunun çevresinde (90px sapmayla) kalıcı zaman/çekim yarıkları (Rift) açar.',
                'Öfke Fazı II’de yarık üretimi 3.0 sn’den 2.2 sn’ye düşerek arenayı kilitler.',
                'Geniş çekim halkaları kaçış rotalarını bozarken menzilli salvo sürdürür.'
            ],
            mechanicsEn: [
                'Spawns persistent temporal gravity rifts near your flight trajectory.',
                'Rage Phase II accelerates rift deployment from 3.0s to 2.2s.',
                'Wide pull rings disrupt kiting paths while maintaining ranged salvos.'
            ],
            tactics: 'Asla aynı noktada daire çizmeyin; yarıklar 4.5 sn sürdüğü için geniş sekiz çizerek temiz alana çıkın.',
            tacticsEn: 'Never orbit one spot tightly; kite in wide figure-eights to outlast 4.5s rifts.'
        },
        {
            id: 'seraphim',
            name: 'Astral Seraphim',
            subtitle: 'Tekillik Hakimi · Çekim & Havan Baskısı',
            subtitleEn: 'Singularity Sovereign · Gravity & Mortar Pressure',
            gameBossType: 'gravity',
            spawnWave: 'Her 5. Dalga Rotasyonu',
            spawnWaveEn: 'Every 5th Wave Rotation',
            asset: 'assets/bosses/seraphim.png',
            color: '#38bdf8',
            mechanics: [
                'Yüksek basınçlı çekim dalgaları ve önceden uyarılmış yörünge havan atışları uygular.',
                'Faz II (%50 HP altı) tetiklendiğinde ekran çapında şok dalgası ve çift salvo başlatır.',
                'Dalga 15+/25+ Kozmik Çürüme devredeyken kalkan ve şifa verimliliğini zorlar.'
            ],
            mechanicsEn: [
                'Applies high-pressure gravity waves and telegraphed orbital mortar strikes.',
                'Phase II (<50% HP) triggers an arena-wide shockwave and dual barrages.',
                'Tests shield and sustain efficiency under high-wave Void Corruption.'
            ],
            tactics: 'Hız ve menzil avantajınızı koruyun; özellikle Füze Sürüsü ve Takyon Mızrağı yüksek kesintisiz DPS sağlar.',
            tacticsEn: 'Maintain speed and range advantage; Swarm Missiles and Tachyon Lance deliver steady DPS.'
        }
    ];

    // 10 Permanent Workshop Upgrades (8 core + Overdrive Gain + Emergency Reboot Revival)
    const WORKSHOP_UPGRADES = [
        {
            id: 'might',
            name: 'Plazma Reaktörü',
            nameEn: 'Plasma Reactor',
            icon: 'flame',
            color: '#fb7185',
            maxLevel: 8,
            baseCost: 120,
            costScale: 1.55,
            perLevelLabel: '+%8 Silah Hasarı',
            perLevelLabelEn: '+8% Weapon Damage',
            statKey: 'dmgMult',
            calcValue: lvl => 1 + lvl * 0.08
        },
        {
            id: 'hull',
            name: 'Titanyum Gövde Zırhı',
            nameEn: 'Titanium Hull Plating',
            icon: 'shield',
            color: '#f59e0b',
            maxLevel: 8,
            baseCost: 110,
            costScale: 1.50,
            perLevelLabel: '+%10 Maks Can & Kalkan',
            perLevelLabelEn: '+10% Max Hull & Shield',
            statKey: 'hpMult',
            calcValue: lvl => 1 + lvl * 0.10
        },
        {
            id: 'thrusters',
            name: 'İyon İtici Kalibrasyonu',
            nameEn: 'Ion Thruster Calibration',
            icon: 'wind',
            color: '#38bdf8',
            maxLevel: 6,
            baseCost: 130,
            costScale: 1.55,
            perLevelLabel: '+%6 Hareket Hızı',
            perLevelLabelEn: '+6% Movement Speed',
            statKey: 'spdMult',
            calcValue: lvl => 1 + lvl * 0.06
        },
        {
            id: 'crit',
            name: 'Hedefleme Optikleri',
            nameEn: 'Targeting Optics',
            icon: 'crosshair',
            color: '#a78bfa',
            maxLevel: 6,
            baseCost: 150,
            costScale: 1.60,
            perLevelLabel: '+%3 Kritik Şans',
            perLevelLabelEn: '+3% Critical Chance',
            statKey: 'critAdd',
            calcValue: lvl => lvl * 0.03
        },
        {
            id: 'cooldown',
            name: 'Kriyo Soğutma Döngüsü',
            nameEn: 'Cryo Cooling Cycle',
            icon: 'clock',
            color: '#2dd4bf',
            maxLevel: 6,
            baseCost: 160,
            costScale: 1.65,
            perLevelLabel: '+%4 Ateşleme Hızı',
            perLevelLabelEn: '+4% Cooldown Haste',
            statKey: 'cdrAdd',
            calcValue: lvl => lvl * 0.04
        },
        {
            id: 'magnet',
            name: 'Kütle Çekim Bobini',
            nameEn: 'Gravity Well Coil',
            icon: 'magnet',
            color: '#34d399',
            maxLevel: 6,
            baseCost: 100,
            costScale: 1.45,
            perLevelLabel: '+%15 XP Çekim Çapı',
            perLevelLabelEn: '+15% XP Pickup Radius',
            statKey: 'magnetMult',
            calcValue: lvl => 1 + lvl * 0.15
        },
        {
            id: 'reroll',
            name: 'Taktiksel Yenileme Modülü',
            nameEn: 'Tactical Reroll Module',
            icon: 'refresh-cw',
            color: '#38bdf8',
            maxLevel: 4,
            baseCost: 220,
            costScale: 1.85,
            perLevelLabel: '+1 Seviye Atlamada Reroll',
            perLevelLabelEn: '+1 Level-Up Reroll',
            statKey: 'rerollBonus',
            calcValue: lvl => lvl
        },
        {
            id: 'greed',
            name: 'Kuantum Veri Hasadı',
            nameEn: 'Quantum Data Harvest',
            icon: 'coins',
            color: '#f59e0b',
            maxLevel: 6,
            baseCost: 140,
            costScale: 1.60,
            perLevelLabel: '+%12 XP & Kredi Kazanımı',
            perLevelLabelEn: '+12% XP & Credit Gain',
            statKey: 'greedMult',
            calcValue: lvl => 1 + lvl * 0.12
        },
        {
            id: 'overdriveGain',
            name: 'Overdrive Şarj Hızı',
            nameEn: 'Overdrive Charge Rate',
            icon: 'zap',
            color: '#a78bfa',
            maxLevel: 5,
            baseCost: 145,
            costScale: 1.58,
            perLevelLabel: '+%15 Overdrive Dolum Hızı',
            perLevelLabelEn: '+15% Overdrive Charge Rate',
            statKey: 'overdriveMult',
            calcValue: lvl => 1 + lvl * 0.15
        },
        {
            id: 'revival',
            name: 'Acil Çekirdek Yeniden Başlatma',
            nameEn: 'Emergency Core Reboot',
            icon: 'heart-handshake',
            color: '#fb7185',
            maxLevel: 1,
            baseCost: 900,
            costScale: 1.0,
            perLevelLabel: '+1 Görevde Yeniden Doğuş',
            perLevelLabelEn: '+1 Revival Per Sortie',
            statKey: 'revivals',
            calcValue: lvl => lvl
        }
    ];

    // 12 Career Achievements
    const ACHIEVEMENTS = [
        {
            id: 'first_sortie',
            name: 'İlk Kozmik Çıkış',
            nameEn: 'First Cosmic Sortie',
            icon: 'rocket',
            color: '#38bdf8',
            reward: 150,
            desc: 'İlk kez bir keşif veya savaş görevini tamamlayın (1 koşu kaydı).',
            descEn: 'Complete your first combat sortie in any sector (1 recorded run).'
        },
        {
            id: 'wave_10',
            name: 'Hattı Tut',
            nameEn: 'Hold the Line',
            icon: 'shield-check',
            color: '#34d399',
            reward: 250,
            desc: 'Tek bir oyunda Dalga 10 veya üzerine ulaşın.',
            descEn: 'Reach Wave 10 or higher in a single sortie.'
        },
        {
            id: 'wave_20',
            name: 'Zaman Dokuyucu Katili',
            nameEn: 'Weaver Slayer',
            icon: 'hourglass',
            color: '#2dd4bf',
            reward: 500,
            desc: 'Dalga 20 barajını aşarak Chronos Weaver ile yüzleşin.',
            descEn: 'Survive past Wave 20 to confront the Chronos Weaver.'
        },
        {
            id: 'wave_30',
            name: 'Kozmik Çürüme Gazisi',
            nameEn: 'Void Corruption Veteran',
            icon: 'flame',
            color: '#fb7185',
            reward: 900,
            desc: 'Hiçlik Çürümesi altında Dalga 30’a kadar hayatta kalın.',
            descEn: 'Survive to Wave 30 under escalating Void Corruption.'
        },
        {
            id: 'evo_architect',
            name: 'Sentez Mimarı',
            nameEn: 'Synthesis Architect',
            icon: 'git-merge',
            color: '#a78bfa',
            reward: 350,
            desc: 'Kariyer toplamında en az 5 adet Evrimleşmiş silah sentezleyin.',
            descEn: 'Synthesize at least 5 Evolved weapons across your career.'
        },
        {
            id: 'mega_awakening',
            name: 'Mega Evrim Uyanışı',
            nameEn: 'Mega Awakening',
            icon: 'crown',
            color: '#f59e0b',
            reward: 750,
            desc: 'İki gelişmiş evrimi birleştirerek ilk Mega Evrimi (SUPER) açın.',
            descEn: 'Fuse two evolved weapons to unlock your first Mega Evolution.'
        },
        {
            id: 'swarm_slayer',
            name: 'Yörünge Temizleyici',
            nameEn: 'Orbital Exterminator',
            icon: 'crosshair',
            color: '#fb7185',
            reward: 400,
            desc: 'Toplamda 5.000 veya daha fazla düşman paraziti imha edin.',
            descEn: 'Eliminate 5,000 or more hostile units across all runs.'
        },
        {
            id: 'high_roller',
            name: 'Efsanevi Komutan',
            nameEn: 'Legendary Commander',
            icon: 'trophy',
            color: '#f59e0b',
            reward: 1000,
            desc: 'Tek bir oyunda 50.000 veya daha yüksek skor elde edin.',
            descEn: 'Score 50,000 points or higher in a single run.'
        },
        {
            id: 'bossrush_clear',
            name: 'Dreadnought Kasabı',
            nameEn: 'Dreadnought Slayer',
            icon: 'skull',
            color: '#fb7185',
            reward: 450,
            desc: 'Boss Akını (Boss Rush) modunda tek koşuda en az 3 Boss imha edin.',
            descEn: 'Defeat at least 3 Bosses in a single Boss Rush sortie.'
        },
        {
            id: 'timeattack_master',
            name: 'Tahliye Ustası',
            nameEn: 'Blitz Extraction Ace',
            icon: 'timer',
            color: '#f59e0b',
            reward: 500,
            desc: 'Zamana Karşı (Time Attack) modunda 5 dakikalık tahliyeyi tamamlayın veya 15.000+ skor yapın.',
            descEn: 'Complete the 5-minute Time Attack blitz or score 15,000+ points in Time Attack.'
        },
        {
            id: 'daily_pilot',
            name: 'Günlük Protokol Pilotu',
            nameEn: 'Daily Protocol Pilot',
            icon: 'calendar-check',
            color: '#34d399',
            reward: 400,
            desc: 'Herhangi bir Günlük Protokol (Daily Seeded) görevini tamamlayın.',
            descEn: 'Complete at least one Daily Seeded Protocol sortie.'
        },
        {
            id: 'skin_collector',
            name: 'Filo Boyacısı',
            nameEn: 'Fleet Livery Collector',
            icon: 'palette',
            color: '#a78bfa',
            reward: 350,
            desc: 'Cephanelikten en az 1 özel filo kaplaması (toplam 2+ kaplama) açın.',
            descEn: 'Unlock at least 1 custom fleet livery in the Armory (2+ total liveries).'
        }
    ];

    // -------------------------------------------------------------------------
    // Deterministic Daily Seeded Protocol Helpers
    // -------------------------------------------------------------------------
    function normalizeDateString(input) {
        if (typeof input === 'string') {
            const match = input.trim().match(/^(\d{4}-\d{2}-\d{2})/);
            if (match) return match[1];
            const parsed = new Date(input);
            if (!Number.isNaN(parsed.getTime())) {
                return normalizeDateString(parsed);
            }
        }
        const d = input instanceof Date && !Number.isNaN(input.getTime()) ? input : new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function hashStringFNV1a(str) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h >>> 0;
    }

    function mulberry32(seedInt) {
        let a = seedInt >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function getDailyProtocol(dateInput) {
        const dateStr = normalizeDateString(dateInput);
        const seedNum = hashStringFNV1a('COSMIC-GENESIS-DAILY-' + dateStr);
        const rng = mulberry32(seedNum);

        const mapKeys = Object.keys(MAPS);
        const mapId = mapKeys[Math.floor(rng() * mapKeys.length)] || 'sector9';
        const mapObj = MAPS[mapId] || MAPS.sector9;

        const mutatorKeys = Object.keys(MUTATORS);
        const idx1 = Math.floor(rng() * mutatorKeys.length);
        let idx2 = Math.floor(rng() * (mutatorKeys.length - 1));
        if (idx2 >= idx1) idx2 += 1;

        const mId1 = mutatorKeys[idx1];
        const mId2 = mutatorKeys[idx2];
        const mut1 = MUTATORS[mId1];
        const mut2 = MUTATORS[mId2];

        const modKeys = ['playerDmg', 'playerHp', 'cdrMult', 'enemyHp', 'enemySp', 'xpMult', 'magnetMult'];
        const combinedModifiers = {};
        for (let i = 0; i < modKeys.length; i++) {
            const k = modKeys[i];
            const v1 = mut1 && typeof mut1[k] === 'number' ? mut1[k] : 1;
            const v2 = mut2 && typeof mut2[k] === 'number' ? mut2[k] : 1;
            combinedModifiers[k] = Math.round(v1 * v2 * 1000) / 1000;
        }

        const recPool = Array.isArray(mapObj.recommendedShips) && mapObj.recommendedShips.length
            ? mapObj.recommendedShips
            : Object.keys(SHIPS);
        const recommendedShip = recPool[Math.floor(rng() * recPool.length)] || 'interceptor';

        const hexTag = seedNum.toString(16).toUpperCase().padStart(8, '0').slice(0, 6);
        const seed = 'CS-' + dateStr.replace(/-/g, '') + '-' + hexTag;

        return {
            date: dateStr,
            seed,
            seedNum,
            mapId,
            map: mapObj,
            difficulty: 'normal',
            mutatorIds: [mId1, mId2],
            mutators: [mut1, mut2],
            combinedModifiers,
            recommendedShip
        };
    }

    // -------------------------------------------------------------------------
    // Helper Lookup & Localization Builders
    // -------------------------------------------------------------------------
    function getLocalized(obj, field, lang) {
        if (!obj || typeof obj !== 'object' || !field) return '';
        let resolvedLang = lang;
        if (!resolvedLang) {
            if (global.CosmicI18n && typeof global.CosmicI18n.getLang === 'function') {
                resolvedLang = global.CosmicI18n.getLang();
            } else {
                resolvedLang = 'tr';
            }
        }
        const isEn = String(resolvedLang).toLowerCase().startsWith('en');
        if (isEn) {
            const enKey = field + 'En';
            if (obj[enKey] !== undefined && obj[enKey] !== null && obj[enKey] !== '') {
                return obj[enKey];
            }
        }
        return obj[field] !== undefined && obj[field] !== null ? obj[field] : (obj[field + 'En'] || '');
    }

    function findEvolutionForPair(weaponId, trinketId) {
        if (!weaponId || !trinketId) return null;
        return Object.values(EVOLUTIONS).find(ev =>
            (ev.weaponReq === weaponId || ev.altWeaponReq === weaponId) && ev.trinketReq === trinketId
        ) || null;
    }

    function findSuperForEvolutions(evoA, evoB) {
        if (!evoA || !evoB || evoA === evoB) return null;
        return Object.values(SUPER_EVOLUTIONS).find(se => {
            const pool = se.evoPool || se.evoReqs || [];
            const hasPrimary = se.evoReqs && se.evoReqs.includes(evoA) && se.evoReqs.includes(evoB);
            const hasPool = pool.includes(evoA) && pool.includes(evoB);
            return hasPrimary || hasPool;
        }) || null;
    }

    function getAllModules() {
        return []
            .concat(Object.values(WEAPONS))
            .concat(Object.values(TRINKETS))
            .concat(Object.values(EVOLUTIONS))
            .concat(Object.values(SUPER_EVOLUTIONS));
    }

    global.COSMIC_DATA = {
        VERSION: '10.0',
        SHIPS,
        MAPS,
        DIFFICULTIES,
        GAME_MODES,
        MUTATORS,
        SHIP_SKINS,
        WEAPONS,
        TRINKETS,
        EVOLUTIONS,
        SUPER_EVOLUTIONS,
        WORKSHOP_UPGRADES,
        ACHIEVEMENTS,
        ENEMIES,
        BOSSES,
        getDailyProtocol,
        getLocalized,
        findEvolutionForPair,
        findSuperForEvolutions,
        getAllModules
    };

    // =========================================================================
    // PERSISTENCE LAYER — STORAGE_KEY = 'cosmic_v8_profile'
    // Backward-compatible with v8/v9 while adding v10 Skins, Modes & RunHistory
    // =========================================================================
    const STORAGE_KEY = 'cosmic_v8_profile';

    function createDefaultProfile() {
        return {
            credits: 600,
            upgrades: {},
            unlockedShips: Object.keys(SHIPS),
            unlockedSkins: { standard: true },
            selectedSkin: 'standard',
            achievements: {},
            claimedAchievements: {},
            stats: {
                runs: 0,
                bestScore: 0,
                bestWave: 0,
                totalKills: 0,
                totalEvos: 0,
                totalMegas: 0,
                bossesKilled: 0,
                dailyRuns: 0,
                bossRushBestBosses: 0,
                timeAttackClears: 0,
                timeAttackBestScore: 0
            },
            runHistory: [],
            history: []
        };
    }

    function normalizeSkinsMap(rawSkins) {
        const skins = { standard: true };
        if (Array.isArray(rawSkins)) {
            rawSkins.forEach(id => {
                if (SHIP_SKINS[id]) skins[id] = true;
            });
        } else if (rawSkins && typeof rawSkins === 'object') {
            Object.keys(rawSkins).forEach(id => {
                if (SHIP_SKINS[id] && rawSkins[id]) skins[id] = true;
            });
        }
        return skins;
    }

    function normalizeProfile(raw) {
        const def = createDefaultProfile();
        if (!raw || typeof raw !== 'object') return def;

        const unlockedSkins = normalizeSkinsMap(raw.unlockedSkins);
        const candidateSkin = typeof raw.selectedSkin === 'string' && SHIP_SKINS[raw.selectedSkin] && unlockedSkins[raw.selectedSkin]
            ? raw.selectedSkin
            : 'standard';

        const sourceHistory = Array.isArray(raw.runHistory)
            ? raw.runHistory
            : (Array.isArray(raw.history) ? raw.history : []);
        const runHistory = sourceHistory.slice(0, 20);

        const profile = {
            credits: Number.isFinite(Number(raw.credits)) ? Math.max(0, Math.floor(Number(raw.credits))) : def.credits,
            upgrades: raw.upgrades && typeof raw.upgrades === 'object' ? Object.assign({}, raw.upgrades) : {},
            unlockedShips: Array.isArray(raw.unlockedShips) && raw.unlockedShips.length > 0
                ? Array.from(new Set(def.unlockedShips.concat(raw.unlockedShips)))
                : def.unlockedShips.slice(),
            unlockedSkins,
            selectedSkin: candidateSkin,
            achievements: {},
            claimedAchievements: raw.claimedAchievements && typeof raw.claimedAchievements === 'object'
                ? Object.assign({}, raw.claimedAchievements)
                : {},
            stats: Object.assign({}, def.stats, raw.stats && typeof raw.stats === 'object' ? raw.stats : {}),
            runHistory: runHistory.slice(),
            history: runHistory.slice()
        };

        if (Array.isArray(raw.achievements)) {
            raw.achievements.forEach(id => { profile.achievements[id] = true; });
        } else if (raw.achievements && typeof raw.achievements === 'object') {
            Object.assign(profile.achievements, raw.achievements);
        }

        return profile;
    }

    function evaluateAchievements(profile) {
        const s = profile.stats || {};
        const skinCount = Object.keys(profile.unlockedSkins || {}).filter(id => Boolean(profile.unlockedSkins[id])).length;
        const newlyUnlocked = [];
        const checks = {
            first_sortie: (s.runs || 0) >= 1,
            wave_10: (s.bestWave || 0) >= 10,
            wave_20: (s.bestWave || 0) >= 20,
            wave_30: (s.bestWave || 0) >= 30,
            evo_architect: (s.totalEvos || 0) >= 5,
            mega_awakening: (s.totalMegas || 0) >= 1,
            swarm_slayer: (s.totalKills || 0) >= 5000,
            high_roller: (s.bestScore || 0) >= 50000,
            bossrush_clear: (s.bossRushBestBosses || 0) >= 3,
            timeattack_master: (s.timeAttackClears || 0) >= 1 || (s.timeAttackBestScore || 0) >= 15000,
            daily_pilot: (s.dailyRuns || 0) >= 1,
            skin_collector: skinCount >= 2
        };
        ACHIEVEMENTS.forEach(ach => {
            if (checks[ach.id] && !profile.achievements[ach.id]) {
                profile.achievements[ach.id] = true;
                newlyUnlocked.push(ach);
            }
        });
        return newlyUnlocked;
    }

    const CosmicPersistence = {
        STORAGE_KEY,

        load() {
            try {
                const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
                const parsed = raw ? JSON.parse(raw) : null;
                const profile = normalizeProfile(parsed);
                evaluateAchievements(profile);
                return profile;
            } catch (err) {
                return createDefaultProfile();
            }
        },

        save(profile) {
            try {
                const safe = normalizeProfile(profile);
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
                }
                return safe;
            } catch (err) {
                return profile;
            }
        },

        addCredits(amount) {
            const profile = this.load();
            const delta = Math.floor(Number(amount) || 0);
            profile.credits = Math.max(0, profile.credits + delta);
            this.save(profile);
            return profile.credits;
        },

        isShipUnlocked(shipId) {
            const ship = SHIPS[shipId];
            if (!ship) return false;
            if (!ship.unlockCost || ship.unlockCost <= 0) return true;
            const profile = this.load();
            return profile.unlockedShips.includes(shipId);
        },

        unlockShip(shipId) {
            const ship = SHIPS[shipId];
            if (!ship) return { ok: false, reason: 'invalid_ship' };
            const profile = this.load();
            if (profile.unlockedShips.includes(shipId)) {
                return { ok: true, alreadyUnlocked: true, credits: profile.credits };
            }
            const cost = Number(ship.unlockCost || 0);
            if (profile.credits < cost) {
                return { ok: false, reason: 'insufficient_credits', needed: cost };
            }
            profile.credits -= cost;
            profile.unlockedShips.push(shipId);
            this.save(profile);
            return { ok: true, credits: profile.credits };
        },

        isSkinUnlocked(skinId) {
            const skin = SHIP_SKINS[skinId];
            if (!skin) return false;
            if (!skin.cost || skin.cost <= 0) return true;
            const profile = this.load();
            return Boolean(profile.unlockedSkins && profile.unlockedSkins[skinId]);
        },

        buySkin(skinId) {
            const skin = SHIP_SKINS[skinId];
            if (!skin) return { ok: false, reason: 'invalid_skin' };
            const profile = this.load();
            if (!profile.unlockedSkins) profile.unlockedSkins = { standard: true };

            if (profile.unlockedSkins[skinId]) {
                return {
                    ok: true,
                    alreadyUnlocked: true,
                    skinId,
                    credits: profile.credits,
                    unlockedSkins: profile.unlockedSkins,
                    selectedSkin: profile.selectedSkin
                };
            }

            const cost = Math.max(0, Math.floor(Number(skin.cost) || 0));
            if (profile.credits < cost) {
                return { ok: false, reason: 'insufficient_credits', needed: cost, credits: profile.credits };
            }

            profile.credits -= cost;
            profile.unlockedSkins[skinId] = true;
            profile.selectedSkin = skinId;
            const newlyUnlocked = evaluateAchievements(profile);
            this.save(profile);

            return {
                ok: true,
                skinId,
                credits: profile.credits,
                unlockedSkins: profile.unlockedSkins,
                selectedSkin: profile.selectedSkin,
                newlyUnlocked
            };
        },

        selectSkin(skinId) {
            const skin = SHIP_SKINS[skinId];
            if (!skin) return { ok: false, reason: 'invalid_skin' };
            const profile = this.load();
            const isFree = !skin.cost || skin.cost <= 0;
            const unlocked = isFree || Boolean(profile.unlockedSkins && profile.unlockedSkins[skinId]);
            if (!unlocked) {
                return { ok: false, reason: 'locked', skinId };
            }
            if (isFree) {
                if (!profile.unlockedSkins) profile.unlockedSkins = { standard: true };
                profile.unlockedSkins[skinId] = true;
            }
            profile.selectedSkin = skinId;
            this.save(profile);
            return { ok: true, selectedSkin: skinId };
        },

        getUpgradeCost(upgId, currentLevel) {
            const upg = WORKSHOP_UPGRADES.find(u => u.id === upgId);
            if (!upg) return 999999;
            const lvl = currentLevel !== undefined ? currentLevel : (this.load().upgrades[upgId] || 0);
            if (lvl >= upg.maxLevel) return Infinity;
            return Math.round(upg.baseCost * Math.pow(upg.costScale, lvl));
        },

        buyUpgrade(upgId) {
            const upg = WORKSHOP_UPGRADES.find(u => u.id === upgId);
            if (!upg) return { ok: false, reason: 'invalid_upgrade' };
            const profile = this.load();
            const curLvl = profile.upgrades[upgId] || 0;
            if (curLvl >= upg.maxLevel) return { ok: false, reason: 'max_level' };
            const cost = Math.round(upg.baseCost * Math.pow(upg.costScale, curLvl));
            if (profile.credits < cost) return { ok: false, reason: 'insufficient_credits', cost };

            profile.credits -= cost;
            profile.upgrades[upgId] = curLvl + 1;
            this.save(profile);
            return { ok: true, level: curLvl + 1, credits: profile.credits };
        },

        resetUpgrades() {
            const profile = this.load();
            let refunded = 0;
            WORKSHOP_UPGRADES.forEach(upg => {
                const lvl = profile.upgrades[upg.id] || 0;
                for (let i = 0; i < lvl; i++) {
                    refunded += Math.round(upg.baseCost * Math.pow(upg.costScale, i));
                }
            });
            profile.upgrades = {};
            profile.credits += refunded;
            this.save(profile);
            return { ok: true, refunded, credits: profile.credits };
        },

        getBonuses() {
            const profile = this.load();
            const ups = profile.upgrades || {};
            const greedLvl = ups.greed || 0;
            const greedMult = 1 + greedLvl * 0.12;
            const rerollCount = ups.reroll || 0;
            return {
                dmgMult: 1 + (ups.might || 0) * 0.08,
                hpMult: 1 + (ups.hull || 0) * 0.10,
                spdMult: 1 + (ups.thrusters || 0) * 0.06,
                critAdd: (ups.crit || 0) * 0.03,
                cdrAdd: (ups.cooldown || 0) * 0.04,
                magnetMult: 1 + (ups.magnet || 0) * 0.15,
                extraRerolls: rerollCount,
                rerollBonus: rerollCount,
                xpMult: greedMult,
                creditMult: greedMult,
                greedMult,
                overdriveMult: 1 + (ups.overdriveGain || 0) * 0.15,
                revivals: ups.revival || 0
            };
        },

        getWorkshopBonuses() {
            return this.getBonuses();
        },

        unlockAchievement(id, autoClaim = false) {
            const ach = ACHIEVEMENTS.find(a => a.id === id);
            if (!ach) return { ok: false };
            const profile = this.load();
            const wasUnlocked = Boolean(profile.achievements[id]);
            profile.achievements[id] = true;
            let awarded = 0;
            if (autoClaim && !profile.claimedAchievements[id]) {
                profile.claimedAchievements[id] = true;
                profile.credits += ach.reward;
                awarded = ach.reward;
            }
            this.save(profile);
            return { ok: true, newlyUnlocked: !wasUnlocked, awarded, credits: profile.credits };
        },

        claimAchievement(id) {
            const ach = ACHIEVEMENTS.find(a => a.id === id);
            if (!ach) return { ok: false, reason: 'not_found' };
            const profile = this.load();
            if (!profile.achievements[id]) return { ok: false, reason: 'locked' };
            if (profile.claimedAchievements[id]) return { ok: false, reason: 'already_claimed' };
            profile.claimedAchievements[id] = true;
            profile.credits += ach.reward;
            this.save(profile);
            return { ok: true, reward: ach.reward, credits: profile.credits };
        },

        recordMatchResult(result = {}) {
            const profile = this.load();
            const score = Math.max(0, Math.floor(Number(result.score) || 0));
            const wave = Math.max(0, Math.floor(Number(result.wave) || 0));
            const kills = Math.max(0, Math.floor(Number(result.kills) || 0));
            const evos = Math.max(0, Math.floor(Number(result.evos) || 0));
            const megas = Math.max(0, Math.floor(Number(result.megas) || 0));
            const bosses = Math.max(0, Math.floor(Number(result.bosses) || 0));
            const duration = Math.max(0, Math.floor(Number(result.duration !== undefined ? result.duration : result.time) || 0));
            const shipId = result.shipId || result.ship || 'interceptor';
            const mapId = result.mapId || result.map || 'sector9';
            const diff = result.difficulty || result.diff || 'normal';
            const rawMode = result.gameMode || result.mode || 'survival';
            const gameMode = GAME_MODES[rawMode] ? rawMode : 'survival';

            const mapObj = MAPS[mapId] || MAPS.sector9;
            const modeObj = GAME_MODES[gameMode] || GAME_MODES.survival;
            const bonuses = this.getBonuses();
            const rawCredits = Math.floor(
                (score / 110 + wave * 18 + kills * 0.15 + bosses * 45) *
                (mapObj.scoreMult || 1) *
                (modeObj.creditMult || 1)
            );
            const earnedCredits = Math.max(15, Math.round(rawCredits * (bonuses.greedMult || bonuses.creditMult || 1)));

            profile.credits += earnedCredits;
            profile.stats.runs = (profile.stats.runs || 0) + 1;
            profile.stats.bestScore = Math.max(profile.stats.bestScore || 0, score);
            profile.stats.bestWave = Math.max(profile.stats.bestWave || 0, wave);
            profile.stats.totalKills = (profile.stats.totalKills || 0) + kills;
            profile.stats.totalEvos = (profile.stats.totalEvos || 0) + evos;
            profile.stats.totalMegas = (profile.stats.totalMegas || 0) + megas;
            profile.stats.bossesKilled = (profile.stats.bossesKilled || 0) + bosses;

            if (gameMode === 'daily') {
                profile.stats.dailyRuns = (profile.stats.dailyRuns || 0) + 1;
            } else if (gameMode === 'bossrush') {
                profile.stats.bossRushBestBosses = Math.max(profile.stats.bossRushBestBosses || 0, bosses);
            } else if (gameMode === 'timeattack') {
                profile.stats.timeAttackBestScore = Math.max(profile.stats.timeAttackBestScore || 0, score);
                if (result.victory || duration >= 300) {
                    profile.stats.timeAttackClears = (profile.stats.timeAttackClears || 0) + 1;
                }
            }

            const runEntry = {
                id: 'run_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
                date: new Date().toISOString(),
                shipId,
                mapId,
                gameMode,
                diff,
                difficulty: diff,
                skinId: result.skinId || profile.selectedSkin || 'standard',
                score,
                wave,
                kills,
                bosses,
                evos,
                megas,
                duration,
                victory: Boolean(result.victory),
                seed: result.seed || null,
                earnedCredits
            };

            if (!Array.isArray(profile.runHistory)) profile.runHistory = [];
            profile.runHistory.unshift(runEntry);
            if (profile.runHistory.length > 20) profile.runHistory.length = 20;
            profile.history = profile.runHistory.slice();

            const newlyUnlocked = evaluateAchievements(profile);
            this.save(profile);

            return {
                earnedCredits,
                totalCredits: profile.credits,
                newlyUnlocked,
                runEntry
            };
        },

        recordRunResult(runStats) {
            return this.recordMatchResult(runStats);
        },

        recordRun(result) {
            return this.recordMatchResult(result);
        }
    };

    global.CosmicPersistence = CosmicPersistence;
})(typeof window !== 'undefined' ? window : globalThis);
