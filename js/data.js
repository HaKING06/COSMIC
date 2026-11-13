// =============================================================================
// COSMIC SURVIVORS v9.0 — UNIFIED CANONICAL PORTAL & GAME DATA ENGINE
// Single Source of Truth aligned 1:1 with game.js & js/mapEvents.js
// =============================================================================
(function (global) {
    'use strict';

    const SHIPS = {
        interceptor: {
            id: 'interceptor',
            name: 'Avcı',
            codeName: 'INTERCEPTOR',
            role: 'Yüksek Hız · Kritik Delici',
            tag: 'SALDIRI',
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
            passiveDesc: '+%20 hareket hızı ve +%15 taban kritik vuruş şansı.',
            abilityName: 'WARP DASH',
            abilityCd: 7.0,
            abilityDesc: '1.2 sn dokunulmaz faz atılması gerçekleştirir ve arkasında yakıcı foton izi bırakır.',
            unlockCost: 0
        },
        dreadnought: {
            id: 'dreadnought',
            name: 'Kruvazör',
            codeName: 'DREADNOUGHT',
            role: 'Ağır Zırh · Kuşatma Bataryası',
            tag: 'TANK',
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
            passiveDesc: '+%32 zırh hasar azaltımı ve yüksek başlangıç gövde bütünlüğü (185 HP).',
            abilityName: 'MİKRO FÜZE SALVOSU',
            abilityCd: 10.0,
            abilityDesc: '3 sn boyunca 360° her yöne zırh delici mikro füze yaylımı ateşler.',
            unlockCost: 0
        },
        aegis: {
            id: 'aegis',
            name: 'Aegis',
            codeName: 'SHIELD GUARDIAN',
            role: 'Kalkan Mühendisi · EMP Savunma',
            tag: 'SAVUNMA',
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
            passiveDesc: 'Her 6 saniyede bir kalkan enerjisiyle otomatik elektro-şok halkası yayar.',
            abilityName: 'EMP ŞOK DALGASI',
            abilityCd: 9.0,
            abilityDesc: 'Ekrandaki düşman mermilerini nötralize eder ve absorbe edilen enerjiyi kalkana çevirir.',
            unlockCost: 0
        },
        phantom: {
            id: 'phantom',
            name: 'Gölge',
            codeName: 'VOID PHANTOM',
            role: 'Suikastçı · Faz Gizliliği',
            tag: 'SUİKAST',
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
            passiveDesc: 'Her 10 sn’de 1.5 sn görünmezlik kazanır; arkadan vuruşlarda +%65 kritik çarpanı uygular.',
            abilityName: 'GÖLGE SIÇRAMASI',
            abilityCd: 6.5,
            abilityDesc: 'İmleç yönüne kuantum sıçraması yapar, 1.8 sn görünmezlik ve infaz gücü açar.',
            unlockCost: 0
        },
        solarflare: {
            id: 'solarflare',
            name: 'Solar Flare',
            codeName: 'HELIOS CRUISER',
            role: 'Alan Yakımı · Termal Çekirdek',
            tag: 'ALAN HASARI',
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
            passiveDesc: 'Yakın menzildeki düşmanları sürekli yakan ve zincirleme patlamaya hazırlayan termal aura.',
            abilityName: 'GÜNEŞ PATLAMASI',
            abilityCd: 9.5,
            abilityDesc: 'Geniş çapta korona novası patlatarak çevredeki tüm hedeflere ağır yanma hasarı uygular.',
            unlockCost: 0
        },
        tempest: {
            id: 'tempest',
            name: 'Tempest',
            codeName: 'CRYO-STORM',
            role: 'Kitle Kontrol · İyonik Fırtına',
            tag: 'KONTROL',
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
            passiveDesc: 'Yıldırım ve buzul etkileri düşmanları yavaşlatır, donmuş hedeflere kritik hasarı artırır.',
            abilityName: 'KRİYO-TESLA FIRTINASI',
            abilityCd: 8.5,
            abilityDesc: 'Arena geneline zincirleme ark düşürür ve düşmanları 2.5 sn dondurur.',
            unlockCost: 0
        },
        valkyrie: {
            id: 'valkyrie',
            name: 'Valkyrie',
            codeName: 'DRONE CARRIER',
            role: 'Otonom Filo · Güdümlü Batarya',
            tag: 'FİLO',
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
            passiveDesc: 'Gemi çevresinde devriye gezen destek droneları ve güçlendirilmiş güdümlü mühimmat.',
            abilityName: 'RAILGUN OVERDRIVE',
            abilityCd: 9.0,
            abilityDesc: 'Tüm droneları aşırı yükler ve hedef doğrultusuna elektromanyetik salvoyla vurur.',
            unlockCost: 0
        },
        chronos: {
            id: 'chronos',
            name: 'Chronos',
            codeName: 'TIME WEAVER',
            role: 'Cooldown Uzmanı · Zaman Bükücü',
            tag: 'TEKNOLOJİ',
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
            passiveDesc: '+%15 kalıcı bekleme süresi (Cooldown) hızlandırması sağlar.',
            abilityName: 'ZAMAN DURDURMA',
            abilityCd: 11.0,
            abilityDesc: 'Düşmanları ve mermileri yavaşlatır, geminin ateş hızını geçici olarak ikiye katlar.',
            unlockCost: 0
        }
    };

    const MAPS = {
        sector9: {
            id: 'sector9',
            name: 'Sektör 9 Enkazı',
            code: 'SEC-09',
            subtitle: 'Sürüklenen enkaz koridorları ve taktiksel Overdrive röleleri.',
            asset: 'assets/maps/sector9.png',
            color: '#38bdf8',
            scoreMult: 1.0,
            hazardTag: 'Düşük Tehlike · Dengeli',
            arenaEvents: [
                {
                    name: 'Sürüklenen Enkaz Koridoru',
                    type: 'hazard',
                    desc: 'Haritayı çapraz kesen dönen hurda kütleleri temas halinde gövde hasarı ve geri itme uygular.'
                },
                {
                    name: 'Overdrive Rölesi',
                    type: 'buff',
                    desc: 'Periyodik inen enerji direklerinin menzilinde kalarak geçici atış hızı ve hasar artışı elde edilir.'
                }
            ],
            tactics: 'Enkaz koridorlarının hareket yönünü okuyup Overdrive rölelerini Boss veya Elite dalgalarına saklayın.',
            recommendedShips: ['interceptor', 'aegis', 'valkyrie']
        },
        nebula: {
            id: 'nebula',
            name: 'Kuantum Nebulası',
            code: 'NEB-04',
            subtitle: 'Göç eden plazma akıntıları ve iyonik EMP hücreleri.',
            asset: 'assets/maps/nebula.png',
            color: '#a78bfa',
            scoreMult: 1.25,
            hazardTag: 'Orta Tehlike · +%25 Skor',
            arenaEvents: [
                {
                    name: 'Göç Eden Plazma Akıntıları',
                    type: 'dynamic',
                    desc: 'Yönü ve konumu değişen gaz cepleri gemiye itki ve geçici hasar artışı veya yoğun sürtünme uygular.'
                },
                {
                    name: 'EMP Hücreleri',
                    type: 'buff',
                    desc: 'Şarjlı EMP düğümleri tetiklendiğinde yakındaki düşman mermilerini ve parazit kalkanlarını boşaltır.'
                }
            ],
            tactics: 'Phantom ve Kamikaze sürüleri görünürlük sınırında hızlanır; EMP hücrelerini yoğun kurşun anlarında patlatın.',
            recommendedShips: ['phantom', 'tempest', 'chronos']
        },
        blackhole: {
            id: 'blackhole',
            name: 'Kara Delik Çevresi',
            code: 'BH-X1',
            subtitle: 'Yörünge çekim anomalisi ve uyarı işaretli lav meteor yağmuru.',
            asset: 'assets/maps/blackhole.png',
            color: '#fb7185',
            scoreMult: 1.5,
            hazardTag: 'Yüksek Tehlike · +%50 Skor',
            arenaEvents: [
                {
                    name: 'Yörünge Çekim Anomalisi',
                    type: 'hazard',
                    desc: 'Merkezi ve gezici tekillikler hem oyuncuyu hem de sürüleri içeri çekerek çarpışma yoğunluğunu artırır.'
                },
                {
                    name: 'Lav Meteor Yağmuru',
                    type: 'hazard',
                    desc: 'Kırmızı hedef halkalarıyla önceden uyarılan yüksek enerjili meteorlar düştüğü alanda kalıcı krater açar.'
                }
            ],
            tactics: 'Yüksek mobilite veya ağır zırh şarttır. Graviton ve Kara Delik çekimlerinde dash zamanlamasını koruyun.',
            recommendedShips: ['dreadnought', 'solarflare', 'phantom']
        },
        dyson: {
            id: 'dyson',
            name: 'Dyson Mega-Küre Reaktörü',
            code: 'DYS-99',
            subtitle: 'Dönen iletken halkaları, enerji sütunları ve Dyson süpürme lazeri.',
            asset: 'assets/maps/dyson.png',
            color: '#34d399',
            scoreMult: 1.75,
            hazardTag: 'Aşırı Tehlike · +%75 Skor',
            arenaEvents: [
                {
                    name: 'Dönen İletken Halkaları',
                    type: 'buff',
                    desc: 'Aktif reaktör halkaları ve sütunları menzil içindeyken silahlara +%30 hasar güçlendirmesi verir.'
                },
                {
                    name: 'Dyson Süpürme Lazeri',
                    type: 'hazard',
                    desc: 'Uyarı çizgisi sonrası arenayı tarayan yüksek güçlü odaklanmış plazma ışını; faz atlama ile aşılır.'
                }
            ],
            tactics: 'Lazer süpürme uyarısında dik açıyla kaçın; ardından iletken halkanın içinde kalarak Boss HP’sini eritin.',
            recommendedShips: ['valkyrie', 'chronos', 'tempest']
        }
    };

    const DIFFICULTIES = {
        easy: {
            id: 'easy',
            label: 'Keşif / Kolay',
            shortLabel: 'KEŞİF',
            color: '#34d399',
            desc: 'Yeni pilotlar ve evrim dizilimlerini test etmek için dengeli tempo.',
            ehm: 0.90, esm: 0.90, edm: 0.80, sdm: 1.12, bhm: 0.85, pdm: 1.15, sm: 1.0
        },
        normal: {
            id: 'normal',
            label: 'Standart / Normal',
            shortLabel: 'STANDART',
            color: '#38bdf8',
            desc: 'Önerilen temel Cosmic Survivors deneyimi. Dengeli sürü ve Boss ölçeklemesi.',
            ehm: 1.20, esm: 1.05, edm: 1.08, sdm: 0.98, bhm: 1.18, pdm: 1.00, sm: 1.4
        },
        hard: {
            id: 'hard',
            label: 'Komutan / Zor',
            shortLabel: 'KOMUTAN',
            color: '#f59e0b',
            desc: 'Hızlı elit dalgaları, sert Boss fazları ve +%50 üzeri skor katsayısı.',
            ehm: 1.65, esm: 1.25, edm: 1.45, sdm: 0.80, bhm: 1.70, pdm: 0.88, sm: 2.1
        },
        nightmare: {
            id: 'nightmare',
            label: 'Hiçlik / Abyss',
            shortLabel: 'HİÇLİK',
            color: '#fb7185',
            desc: 'Dalga 25+ Kozmik Çürüme altında maksimum hayatta kalma sınavı (3.0x Skor).',
            ehm: 2.30, esm: 1.42, edm: 1.85, sdm: 0.70, bhm: 2.45, pdm: 0.75, sm: 3.0
        }
    };

    // 14 Canonical Weapons (6 Universal + 8 Signature)
    const WEAPONS = {
        dualLaser: {
            id: 'dualLaser', kind: 'weapon', scope: 'universal', name: 'Çift Lazer',
            icon: 'zap', color: '#38bdf8', pairTrinket: 'coolant', altTrinket: 'targetMatrix',
            evoId: 'gatlingStorm', altEvoId: 'prismOverload',
            stats: { baseDmg: 22, cd: 0.42, projectiles: 2, pierce: 1, dps: 105 },
            desc: 'Paralel foton namlularından yüksek hızlı enerji darbeleri ateşler. İki çapraz evrim yoluna açılır.'
        },
        heavyPlasma: {
            id: 'heavyPlasma', kind: 'weapon', scope: 'universal', name: 'Ağır Plazma Topu',
            icon: 'flame', color: '#f59e0b', pairTrinket: 'bioreactor', altTrinket: 'magnet',
            evoId: 'bloodHarvest', altEvoId: 'gravitonImploder',
            stats: { baseDmg: 48, cd: 0.95, projectiles: 1, pierce: 2, dps: 112 },
            desc: 'Çarpışma noktasında alansal şok dalgası bırakan yüksek kütleli plazma gülleleri.'
        },
        energyDisc: {
            id: 'energyDisc', kind: 'weapon', scope: 'universal', name: 'Dönen Enerji Diski',
            icon: 'disc', color: '#a78bfa', pairTrinket: 'thruster', altTrinket: 'coolant',
            evoId: 'aegisResonance', altEvoId: 'cryoVortex',
            stats: { baseDmg: 28, cd: 0.35, projectiles: 3, pierce: 99, dps: 118 },
            desc: 'Gemi yörüngesinde sürekli dönerek yaklaşan sürüleri dilimleyen savunma testereleri.'
        },
        quantumDagger: {
            id: 'quantumDagger', kind: 'weapon', scope: 'universal', name: 'Kuantum Hançeri',
            icon: 'crosshair', color: '#fb7185', pairTrinket: 'magnet', altTrinket: 'targetMatrix',
            evoId: 'cosmicSupernova', altEvoId: 'phantomExecutioner',
            stats: { baseDmg: 30, cd: 0.50, projectiles: 3, pierce: 3, dps: 135 },
            desc: 'Yüksek kritik şanslı ve seri delici faz bıçakları fırlatır.'
        },
        flameLine: {
            id: 'flameLine', kind: 'weapon', scope: 'universal', name: 'Alev Hattı',
            icon: 'sun', color: '#f97316', pairTrinket: 'shieldMatrix', altTrinket: 'bioreactor',
            evoId: 'titanCore', altEvoId: 'necroticNapalm',
            stats: { baseDmg: 18, cd: 0.25, projectiles: 2, pierce: 99, dps: 120 },
            desc: 'Geminin ön ve arka hattında sürekli yakıcı plazma koridoru oluşturur.'
        },
        swarmMissiles: {
            id: 'swarmMissiles', kind: 'weapon', scope: 'universal', name: 'Füze Sürüsü',
            icon: 'navigation', color: '#34d399', pairTrinket: 'targetMatrix', altTrinket: 'thruster',
            evoId: 'quantumArbiter',
            stats: { baseDmg: 34, cd: 0.72, projectiles: 4, pierce: 1, dps: 142 },
            desc: 'En yakın yüksek tehdit hedeflerine otomatik kilitlenen güdümlü mikro füzeler ateşler.'
        },
        photonRailgun: {
            id: 'photonRailgun', kind: 'weapon', scope: 'signature', shipExclusive: 'interceptor',
            name: 'Foton Raylı Top', icon: 'arrow-up-right', color: '#38bdf8',
            pairTrinket: 'overdriveCore', evoId: 'tachyonLance',
            stats: { baseDmg: 72, cd: 0.85, projectiles: 1, pierce: 12, dps: 168 },
            desc: 'Avcı özel kök silahı. Hat üzerindeki tüm hedefleri delen yüksek hızlı elektromanyetik ray.'
        },
        flakArtillery: {
            id: 'flakArtillery', kind: 'weapon', scope: 'signature', shipExclusive: 'dreadnought',
            name: 'Balistik Flak Topu', icon: 'bomb', color: '#f59e0b',
            pairTrinket: 'reactiveArmor', evoId: 'siegeBehemoth',
            stats: { baseDmg: 56, cd: 0.90, projectiles: 5, pierce: 2, dps: 162 },
            desc: 'Kruvazör özel kök silahı. Çarpışmada zırh delici şarapnel konisine ayrılan ağır batarya.'
        },
        teslaPrism: {
            id: 'teslaPrism', kind: 'weapon', scope: 'signature', shipExclusive: 'aegis',
            name: 'Tesla Kalkan Prizması', icon: 'shield-alert', color: '#34d399',
            pairTrinket: 'harmonicCapacitor', evoId: 'sanctuaryMaelstrom',
            stats: { baseDmg: 38, cd: 0.62, projectiles: 4, pierce: 4, dps: 152 },
            desc: 'Aegis özel kök silahı. Aktif kalkan enerjisine oranla zincirleme yıldırım arkları çakar.'
        },
        voidScythe: {
            id: 'voidScythe', kind: 'weapon', scope: 'signature', shipExclusive: 'phantom',
            name: 'Hiper-Uzay Tırpanı', icon: 'moon', color: '#a78bfa',
            pairTrinket: 'phaseCloak', evoId: 'abyssalReaper',
            stats: { baseDmg: 64, cd: 0.78, projectiles: 2, pierce: 8, dps: 174 },
            desc: 'Gölge özel kök silahı. Geniş hilal yarığı açar ve arkadan vuruşlarda kritik infaz uygular.'
        },
        solarMortar: {
            id: 'solarMortar', kind: 'weapon', scope: 'signature', shipExclusive: 'solarflare',
            name: 'Plazma Havanı', icon: 'circle-dot', color: '#fb7185',
            pairTrinket: 'fusionHeart', evoId: 'heliosCataclysm',
            stats: { baseDmg: 58, cd: 0.92, projectiles: 2, pierce: 99, dps: 165 },
            desc: 'Solar Flare özel kök silahı. Düştüğü noktada sürekli yakıcı güneş kraterleri açar.'
        },
        cryoNova: {
            id: 'cryoNova', kind: 'weapon', scope: 'signature', shipExclusive: 'tempest',
            name: 'Kriyo-Buzul Küresi', icon: 'snowflake', color: '#38bdf8',
            pairTrinket: 'teslaCoil', evoId: 'absoluteZero',
            stats: { baseDmg: 42, cd: 0.80, projectiles: 3, pierce: 4, dps: 155 },
            desc: 'Tempest özel kök silahı. Patlayarak düşmanları yavaşlatan ve buz şarapnelleri saçan küre.'
        },
        droneSwarm: {
            id: 'droneSwarm', kind: 'weapon', scope: 'signature', shipExclusive: 'valkyrie',
            name: 'Otonom Savaş Droneları', icon: 'radar', color: '#f59e0b',
            pairTrinket: 'neuralLink', evoId: 'seraphFleet',
            stats: { baseDmg: 26, cd: 0.38, projectiles: 4, pierce: 2, dps: 164 },
            desc: 'Valkyrie özel kök silahı. Hedefleri bağımsız takip edip seri lazer ateşi açan dronelar.'
        },
        chronoRift: {
            id: 'chronoRift', kind: 'weapon', scope: 'signature', shipExclusive: 'chronos',
            name: 'Zaman Yarığı Projektörü', icon: 'hourglass', color: '#2dd4bf',
            pairTrinket: 'fluxCapacitor', evoId: 'eternityLoop',
            stats: { baseDmg: 46, cd: 0.88, projectiles: 2, pierce: 99, dps: 158 },
            desc: 'Chronos özel kök silahı. İçindeki düşmanları yavaşlatıp zaman kırılmasıyla patlatan yarık.'
        }
    };

    // 14 Canonical Trinkets (6 Universal + 8 Signature)
    const TRINKETS = {
        magnet: {
            id: 'magnet', kind: 'trinket', scope: 'universal', name: 'Mıknatıs Çekirdeği',
            icon: 'magnet', color: '#34d399', pairWeapon: 'quantumDagger', altWeapon: 'heavyPlasma',
            evoId: 'cosmicSupernova', altEvoId: 'gravitonImploder',
            statLabel: '+%35 Çekim Çapı · +%15 Menzil',
            stats: { magnetBonus: 0.35, rangeBonus: 0.15 },
            desc: 'XP kristalleri ve ganimet çekim alanını genişletir, mermi/etki menzilini uzatır.'
        },
        coolant: {
            id: 'coolant', kind: 'trinket', scope: 'universal', name: 'Kriyo Soğutucu',
            icon: 'thermometer-snowflake', color: '#38bdf8', pairWeapon: 'dualLaser', altWeapon: 'energyDisc',
            evoId: 'gatlingStorm', altEvoId: 'cryoVortex',
            statLabel: '-%14 Bekleme Süresi (CDR)',
            stats: { cdrBonus: 0.14 },
            desc: 'Tüm aktif silahların ateşleme aralığını ve bekleme süresini azaltır.'
        },
        thruster: {
            id: 'thruster', kind: 'trinket', scope: 'universal', name: 'Kinetik İtici',
            icon: 'wind', color: '#a78bfa', pairWeapon: 'energyDisc', altWeapon: 'swarmMissiles',
            evoId: 'aegisResonance',
            statLabel: '+%12 Hız · +%6 Zırh',
            stats: { speedBonus: 0.12, armorBonus: 0.06 },
            desc: 'Gemi manevra hızını ve gövde çarpışma direncini artırır.'
        },
        bioreactor: {
            id: 'bioreactor', kind: 'trinket', scope: 'universal', name: 'Biyo-Reaktör',
            icon: 'heart-pulse', color: '#fb7185', pairWeapon: 'heavyPlasma', altWeapon: 'flameLine',
            evoId: 'bloodHarvest', altEvoId: 'necroticNapalm',
            statLabel: '+30 Maks HP · +2.5 HP/sn',
            stats: { hpBonus: 30, regenBonus: 2.5 },
            desc: 'Maksimum gövde bütünlüğünü yükseltir ve sürekli biyolojik onarım sağlar.'
        },
        targetMatrix: {
            id: 'targetMatrix', kind: 'trinket', scope: 'universal', name: 'Kuantum Nişangah',
            icon: 'target', color: '#f59e0b', pairWeapon: 'swarmMissiles', altWeapon: 'dualLaser',
            evoId: 'quantumArbiter', altEvoId: 'prismOverload',
            statLabel: '+%9 Kritik · +%15 Hasar',
            stats: { critBonus: 0.09, dmgBonus: 0.15 },
            desc: 'Kritik vuruş ihtimalini ve tüm silahların taban hasar çıktısını artırır.'
        },
        shieldMatrix: {
            id: 'shieldMatrix', kind: 'trinket', scope: 'universal', name: 'Deflektör Matrisi',
            icon: 'shield', color: '#38bdf8', pairWeapon: 'flameLine',
            evoId: 'titanCore',
            statLabel: '+35 Maks Kalkan · +%20 Dolum',
            stats: { shieldBonus: 35, shieldRegenBonus: 0.20 },
            desc: 'Enerji kalkanı kapasitesini genişletir ve yenilenme hızını artırır.'
        },
        overdriveCore: {
            id: 'overdriveCore', kind: 'trinket', scope: 'signature', shipExclusive: 'interceptor',
            name: 'Hiper-İvme Çekirdeği', icon: 'gauge', color: '#38bdf8',
            pairWeapon: 'photonRailgun', evoId: 'tachyonLance',
            statLabel: '+%15 Ateş Hızı · +%20 Kritik Çarpan',
            stats: { cdrBonus: 0.15, critDmgBonus: 0.20 },
            desc: 'Avcı imza modülü. Takyon Mızrağı sentezinin zorunlu katalizörüdür.'
        },
        reactiveArmor: {
            id: 'reactiveArmor', kind: 'trinket', scope: 'signature', shipExclusive: 'dreadnought',
            name: 'Reaktif Zırh Plakası', icon: 'shield-check', color: '#f59e0b',
            pairWeapon: 'flakArtillery', evoId: 'siegeBehemoth',
            statLabel: '+%8 Zırh · Karşı Şok Patlaması',
            stats: { armorBonus: 0.08 },
            desc: 'Kruvazör imza modülü. Darbe alındığında çevredeki düşmanlara karşı-şok patlatır.'
        },
        harmonicCapacitor: {
            id: 'harmonicCapacitor', kind: 'trinket', scope: 'signature', shipExclusive: 'aegis',
            name: 'Harmonik Kondansatör', icon: 'battery-charging', color: '#34d399',
            pairWeapon: 'teslaPrism', evoId: 'sanctuaryMaelstrom',
            statLabel: '+45 Kalkan · +%12 Alan Çapı',
            stats: { shieldBonus: 45, areaBonus: 0.12 },
            desc: 'Aegis imza modülü. Kutsal İyon Fırtınası sentezinin zorunlu katalizörüdür.'
        },
        phaseCloak: {
            id: 'phaseCloak', kind: 'trinket', scope: 'signature', shipExclusive: 'phantom',
            name: 'Kuantum Gölge Pelerini', icon: 'eye-off', color: '#a78bfa',
            pairWeapon: 'voidScythe', evoId: 'abyssalReaper',
            statLabel: '+%25 Suikast Kritiği & Gizlilik',
            stats: { critBonus: 0.12, cloakBonus: 0.25 },
            desc: 'Gölge imza modülü. Hiçlik Biçicisi sentezinin zorunlu katalizörüdür.'
        },
        fusionHeart: {
            id: 'fusionHeart', kind: 'trinket', scope: 'signature', shipExclusive: 'solarflare',
            name: 'Termonükleer Kalp', icon: 'flame-kindling', color: '#fb7185',
            pairWeapon: 'solarMortar', evoId: 'heliosCataclysm',
            statLabel: '+%25 Yanma Hasarı · Geniş Aura',
            stats: { dmgBonus: 0.15, burnBonus: 0.25 },
            desc: 'Solar Flare imza modülü. Helios Kıyameti sentezinin zorunlu katalizörüdür.'
        },
        teslaCoil: {
            id: 'teslaCoil', kind: 'trinket', scope: 'signature', shipExclusive: 'tempest',
            name: 'Süper-İletken Bobin', icon: 'bolt', color: '#38bdf8',
            pairWeapon: 'cryoNova', evoId: 'absoluteZero',
            statLabel: '+%14 Ateş Hızı · +%30 Yavaşlatma',
            stats: { cdrBonus: 0.14, slowBonus: 0.30 },
            desc: 'Tempest imza modülü. Mutlak Sıfır sentezinin zorunlu katalizörüdür.'
        },
        neuralLink: {
            id: 'neuralLink', kind: 'trinket', scope: 'signature', shipExclusive: 'valkyrie',
            name: 'Nöral Komuta Ağı', icon: 'cpu', color: '#f59e0b',
            pairWeapon: 'droneSwarm', evoId: 'seraphFleet',
            statLabel: '+%20 Drone & Füze Hasarı',
            stats: { dmgBonus: 0.20 },
            desc: 'Valkyrie imza modülü. Seraphim Filosu sentezinin zorunlu katalizörüdür.'
        },
        fluxCapacitor: {
            id: 'fluxCapacitor', kind: 'trinket', scope: 'signature', shipExclusive: 'chronos',
            name: 'Zaman Akı Çekirdeği', icon: 'clock', color: '#2dd4bf',
            pairWeapon: 'chronoRift', evoId: 'eternityLoop',
            statLabel: '-%15 Tüm Dolum Süreleri',
            stats: { cdrBonus: 0.15 },
            desc: 'Chronos imza modülü. Sonsuzluk Döngüsü sentezinin zorunlu katalizörüdür.'
        }
    };

    // 19 Canonical Evolutions (11 Universal/Cross + 8 Signature)
    const EVOLUTIONS = {
        gatlingStorm: {
            id: 'gatlingStorm', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Gatling Fırtınası', icon: 'wind', color: '#34d399',
            weaponReq: 'dualLaser', trinketReq: 'coolant',
            formula: 'Çift Lazer Lv.5 + Kriyo Soğutucu Lv.5',
            stats: { baseDmg: 36, cd: 0.11, dps: 650, ricochet: 3 },
            desc: 'Lazerler hiper-hızla yağar ve isabet ettiği düşmanlar arasında otomatik olarak 3 kez seker.'
        },
        prismOverload: {
            id: 'prismOverload', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Prizma Kırılması', icon: 'sparkles', color: '#38bdf8',
            weaponReq: 'dualLaser', trinketReq: 'targetMatrix',
            formula: 'Çift Lazer Lv.5 + Kuantum Nişangah Lv.5',
            stats: { baseDmg: 42, cd: 0.22, dps: 615, split: 5 },
            desc: 'Çift Lazerin çapraz evrimi. Kritik lazer vuruşları 5 yöne kırılan yüksek enerjili fotonlara bölünür.'
        },
        bloodHarvest: {
            id: 'bloodHarvest', kind: 'evolution', scope: 'universal', tier: 'A+',
            name: 'Kan Hasadı', icon: 'droplets', color: '#fb7185',
            weaponReq: 'heavyPlasma', trinketReq: 'bioreactor',
            formula: 'Ağır Plazma Topu Lv.5 + Biyo-Reaktör Lv.5',
            stats: { baseDmg: 95, cd: 0.65, dps: 540, lifesteal: 0.10 },
            desc: 'Kızıl plazma şok dalgaları yayar ve verilen hasarın %10’unu doğrudan gemi canına dönüştürür.'
        },
        gravitonImploder: {
            id: 'gravitonImploder', kind: 'evolution', scope: 'universal', tier: 'A+',
            name: 'Graviton Çökertici', icon: 'orbit', color: '#f59e0b',
            weaponReq: 'heavyPlasma', trinketReq: 'magnet',
            formula: 'Ağır Plazma Topu Lv.5 + Mıknatıs Çekirdeği Lv.5',
            stats: { baseDmg: 108, cd: 0.72, dps: 560, pullRadius: 190 },
            desc: 'Ağır Plazmanın çapraz evrimi. Patlama noktasında düşmanları merkeze çekip birbirine çarptırır.'
        },
        aegisResonance: {
            id: 'aegisResonance', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Aegis Rezonansı', icon: 'shield-plus', color: '#38bdf8',
            weaponReq: 'energyDisc', trinketReq: 'thruster',
            formula: 'Dönen Enerji Diski Lv.5 + Kinetik İtici Lv.5',
            stats: { baseDmg: 52, cd: 0.18, dps: 590, discs: 6 },
            desc: '6 adet dev kesici disk yörüngede döner; hareket ettikçe kalkan dolar, kalkan kırıldığında EMP patlar.'
        },
        cryoVortex: {
            id: 'cryoVortex', kind: 'evolution', scope: 'universal', tier: 'A+',
            name: 'Kriyo Kasırgası', icon: 'snowflake', color: '#7dd3fc',
            weaponReq: 'energyDisc', trinketReq: 'coolant',
            formula: 'Dönen Enerji Diski Lv.5 + Kriyo Soğutucu Lv.5',
            stats: { baseDmg: 48, cd: 0.20, dps: 555, slowPct: 60 },
            desc: 'Enerji Diskinin çapraz evrimi. Sıfır-altı buz testereleri temas ettiği düşmanları dondurur ve parçalar.'
        },
        cosmicSupernova: {
            id: 'cosmicSupernova', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Kozmik Süpernova', icon: 'aperture', color: '#a78bfa',
            weaponReq: 'quantumDagger', trinketReq: 'magnet',
            formula: 'Kuantum Hançeri Lv.5 + Mıknatıs Çekirdeği Lv.5',
            stats: { baseDmg: 68, cd: 0.34, dps: 680, singularity: true },
            desc: 'Kritik hançer vuruşları alansal bir Kara Delik açar ve çevredeki düşmanları içine çekip ezer.'
        },
        phantomExecutioner: {
            id: 'phantomExecutioner', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Hayalet İnfazcı', icon: 'swords', color: '#fb7185',
            weaponReq: 'quantumDagger', trinketReq: 'targetMatrix',
            formula: 'Kuantum Hançeri Lv.5 + Kuantum Nişangah Lv.5',
            stats: { baseDmg: 74, cd: 0.32, dps: 705, chain: 5 },
            desc: 'Kuantum Hançerinin çapraz evrimi. Hedefler arasında sıçrayan bıçaklar yaralı düşmanları anında infaz eder.'
        },
        titanCore: {
            id: 'titanCore', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Titan Koronası', icon: 'sun', color: '#f59e0b',
            weaponReq: 'flameLine', trinketReq: 'shieldMatrix',
            formula: 'Alev Hattı Lv.5 + Deflektör Matrisi Lv.5',
            stats: { baseDmg: 45, cd: 0.16, dps: 625, novaInterval: 2.5 },
            desc: 'Devasa güneş halkasına dönüşür ve her 2.5 sn’de bir ekran çapında yakıcı Termal Nova yayar.'
        },
        necroticNapalm: {
            id: 'necroticNapalm', kind: 'evolution', scope: 'universal', tier: 'A+',
            name: 'Biyo-Napalm Seli', icon: 'flask-conical', color: '#34d399',
            weaponReq: 'flameLine', trinketReq: 'bioreactor',
            formula: 'Alev Hattı Lv.5 + Biyo-Reaktör Lv.5',
            stats: { baseDmg: 42, cd: 0.18, dps: 570, healPool: true },
            desc: 'Alev Hattının çapraz evrimi. Yanan düşmanlar eriyerek pilota can yenileyen biyo-plazma alanı bırakır.'
        },
        quantumArbiter: {
            id: 'quantumArbiter', kind: 'evolution', scope: 'universal', tier: 'S',
            name: 'Kuantum Yargıç', icon: 'crosshair', color: '#f59e0b',
            weaponReq: 'swarmMissiles', trinketReq: 'targetMatrix',
            formula: 'Füze Sürüsü Lv.5 + Kuantum Nişangah Lv.5',
            stats: { baseDmg: 82, cd: 0.45, dps: 690, pierceScaling: 0.25 },
            desc: 'Füzeler düşmanları delip geçen kuantum mızraklarına dönüşür; her delmede +%25 güçlenir.'
        },
        tachyonLance: {
            id: 'tachyonLance', kind: 'evolution', scope: 'signature', shipExclusive: 'interceptor', tier: 'S+',
            name: 'Takyon Mızrağı', icon: 'zap', color: '#38bdf8',
            weaponReq: 'photonRailgun', altWeaponReq: 'dualLaser', trinketReq: 'overdriveCore',
            formula: 'Foton Raylı Top (veya Çift Lazer) Lv.5 + Hiper-İvme Çekirdeği Lv.5',
            stats: { baseDmg: 148, cd: 0.46, dps: 840, infinitePierce: true },
            desc: 'Avcı özel evrimi. Ekranı boydan boya delen sonsuz hızlı takyon ışını ve patlayan foton izi.'
        },
        siegeBehemoth: {
            id: 'siegeBehemoth', kind: 'evolution', scope: 'signature', shipExclusive: 'dreadnought', tier: 'S+',
            name: 'Kıyamet Bataryası', icon: 'bomb', color: '#f59e0b',
            weaponReq: 'flakArtillery', altWeaponReq: 'heavyPlasma', trinketReq: 'reactiveArmor',
            formula: 'Balistik Flak Topu (veya Ağır Plazma) Lv.5 + Reaktif Zırh Plakası Lv.5',
            stats: { baseDmg: 135, cd: 0.58, dps: 820, shrapnel: 12 },
            desc: 'Kruvazör özel evrimi. Zırh delici nükleer havan yaylımı ve 12 yöne parça tesirli patlama.'
        },
        sanctuaryMaelstrom: {
            id: 'sanctuaryMaelstrom', kind: 'evolution', scope: 'signature', shipExclusive: 'aegis', tier: 'S+',
            name: 'Kutsal İyon Fırtınası', icon: 'shield-alert', color: '#34d399',
            weaponReq: 'teslaPrism', altWeaponReq: 'energyDisc', trinketReq: 'harmonicCapacitor',
            formula: 'Tesla Kalkan Prizması (veya Enerji Diski) Lv.5 + Harmonik Kondansatör Lv.5',
            stats: { baseDmg: 92, cd: 0.32, dps: 790, shieldConvert: true },
            desc: 'Aegis özel evrimi. Yörüngedeki düğümler arasında yıldırım ağı örer ve mermileri kalkana çevirir.'
        },
        abyssalReaper: {
            id: 'abyssalReaper', kind: 'evolution', scope: 'signature', shipExclusive: 'phantom', tier: 'S+',
            name: 'Hiçlik Biçicisi', icon: 'moon', color: '#a78bfa',
            weaponReq: 'voidScythe', altWeaponReq: 'quantumDagger', trinketReq: 'phaseCloak',
            formula: 'Hiper-Uzay Tırpanı (veya Kuantum Hançeri) Lv.5 + Kuantum Gölge Pelerini Lv.5',
            stats: { baseDmg: 142, cd: 0.44, dps: 860, executeThreshold: 0.25 },
            desc: 'Gölge özel evrimi. Gölge klonları fırlatan boyutsal tırpan; düşük canlı hedefleri anında infaz eder.'
        },
        heliosCataclysm: {
            id: 'heliosCataclysm', kind: 'evolution', scope: 'signature', shipExclusive: 'solarflare', tier: 'S+',
            name: 'Helios Güneş Kıyameti', icon: 'flame', color: '#fb7185',
            weaponReq: 'solarMortar', altWeaponReq: 'flameLine', trinketReq: 'fusionHeart',
            formula: 'Plazma Havanı (veya Alev Hattı) Lv.5 + Termonükleer Kalp Lv.5',
            stats: { baseDmg: 128, cd: 0.54, dps: 815, chainDetonate: true },
            desc: 'Solar Flare özel evrimi. Dev güneş kraterleri açar ve yanan her hedefi zincirleme patlatır.'
        },
        absoluteZero: {
            id: 'absoluteZero', kind: 'evolution', scope: 'signature', shipExclusive: 'tempest', tier: 'S+',
            name: 'Mutlak Sıfır Fırtınası', icon: 'snowflake', color: '#38bdf8',
            weaponReq: 'cryoNova', altWeaponReq: 'dualLaser', trinketReq: 'teslaCoil',
            formula: 'Kriyo-Buzul Küresi (veya Çift Lazer) Lv.5 + Süper-İletken Bobin Lv.5',
            stats: { baseDmg: 112, cd: 0.48, dps: 795, freezeSec: 2.0 },
            desc: 'Tempest özel evrimi. Ekran çapında dondurucu buzul ve zincirleme yıldırım fırtınası koparır.'
        },
        seraphFleet: {
            id: 'seraphFleet', kind: 'evolution', scope: 'signature', shipExclusive: 'valkyrie', tier: 'S+',
            name: 'Seraphim Drone Filosu', icon: 'radar', color: '#f59e0b',
            weaponReq: 'droneSwarm', altWeaponReq: 'swarmMissiles', trinketReq: 'neuralLink',
            formula: 'Otonom Savaş Droneları (veya Füze Sürüsü) Lv.5 + Nöral Komuta Ağı Lv.5',
            stats: { baseDmg: 48, cd: 0.16, dps: 830, drones: 6 },
            desc: 'Valkyrie özel evrimi. 6 adet elit Seraphim dronu yörüngede döner ve kesintisiz lazer yağdırır.'
        },
        eternityLoop: {
            id: 'eternityLoop', kind: 'evolution', scope: 'signature', shipExclusive: 'chronos', tier: 'S+',
            name: 'Sonsuzluk Döngüsü', icon: 'infinity', color: '#2dd4bf',
            weaponReq: 'chronoRift', altWeaponReq: 'energyDisc', trinketReq: 'fluxCapacitor',
            formula: 'Zaman Yarığı Projektörü (veya Enerji Diski) Lv.5 + Zaman Akı Çekirdeği Lv.5',
            stats: { baseDmg: 118, cd: 0.50, dps: 805, dualRings: true },
            desc: 'Chronos özel evrimi. Düşmanları zaman döngüsüne hapseden çifte tekillik halkaları açar.'
        }
    };

    // 6 Canonical Super / Mega Evolutions
    const SUPER_EVOLUTIONS = {
        infernoGatling: {
            id: 'infernoGatling', kind: 'superEvolution', scope: 'universal', tier: 'MEGA',
            name: 'Cehennem Gatling’i', icon: 'flame', color: '#fb7185',
            shipSynergies: ['solarflare', 'interceptor'],
            evoReqs: ['bloodHarvest', 'gatlingStorm'],
            evoPool: ['bloodHarvest', 'gatlingStorm', 'heliosCataclysm', 'necroticNapalm'],
            formula: 'Kan Hasadı + Gatling Fırtınası (+1 Silah Slotu Açar)',
            stats: { baseDmg: 86, cd: 0.08, dps: 1620 },
            desc: 'Seken cehennem mermileri yağdırır; her sekmede plazma patlaması yaratır ve pilotu sürekli iyileştirir.'
        },
        eventHorizon: {
            id: 'eventHorizon', kind: 'superEvolution', scope: 'universal', tier: 'MEGA',
            name: 'Olay Ufku Tekilliği', icon: 'orbit', color: '#38bdf8',
            stats: { baseDmg: 245, cd: 0.58, dps: 422 },
            shipSynergies: ['aegis', 'tempest', 'phantom'],
            evoReqs: ['cosmicSupernova', 'aegisResonance'],
            evoPool: ['cosmicSupernova', 'aegisResonance', 'sanctuaryMaelstrom', 'cryoVortex', 'absoluteZero'],
            formula: 'Kozmik Süpernova + Aegis Rezonansı / Kalkan Fırtınası (+1 Silah Slotu Açar)',
            desc: 'Yörüngede olay ufku testereleri dönerken her kritikte EMP şoklu çifte Kara Delik açar.'
        },
        omegaJudgement: {
            id: 'omegaJudgement', kind: 'superEvolution', scope: 'universal', tier: 'MEGA',
            name: 'Omega Kıyamet Reaktörü', icon: 'crown', color: '#f59e0b',
            stats: { baseDmg: 265, cd: 0.62, dps: 427 },
            shipSynergies: ['valkyrie', 'chronos'],
            evoReqs: ['titanCore', 'quantumArbiter'],
            evoPool: ['titanCore', 'quantumArbiter', 'prismOverload', 'seraphFleet', 'eternityLoop'],
            formula: 'Titan Koronası + Kuantum Yargıç / Filo (+1 Silah Slotu Açar)',
            desc: 'Sürekli güneş koronası yayarken tüm ekrana delici termonükleer kuantum mızrakları yağdırır.'
        },
        hyperionApex: {
            id: 'hyperionApex', kind: 'superEvolution', scope: 'signature', shipExclusive: 'interceptor', tier: 'MEGA',
            shipSynergies: ['interceptor'],
            name: 'Hyperion Işık Hükümdarı', icon: 'zap', color: '#38bdf8',
            stats: { baseDmg: 155, cd: 0.34, dps: 456 },
            evoReqs: ['tachyonLance', 'gatlingStorm'],
            evoPool: ['tachyonLance', 'gatlingStorm', 'prismOverload'],
            formula: 'Takyon Mızrağı + Gatling Fırtınası (Avcı Mega Evrimi)',
            desc: 'Ekranı 8 yönde kesen yörüngesel takyon lazer ağı ve sınırsız sekme kapasiteli ışık fırtınası.'
        },
        ironDreadnought: {
            id: 'ironDreadnought', kind: 'superEvolution', scope: 'signature', shipExclusive: 'dreadnought', tier: 'MEGA',
            shipSynergies: ['dreadnought'],
            name: 'Zırhlı Kıyamet Kalesi', icon: 'shield', color: '#f59e0b',
            stats: { baseDmg: 310, cd: 0.72, dps: 431 },
            evoReqs: ['siegeBehemoth', 'titanCore'],
            evoPool: ['siegeBehemoth', 'titanCore', 'gravitonImploder'],
            formula: 'Kıyamet Bataryası + Titan Koronası (Kruvazör Mega Evrimi)',
            desc: 'Reaktif kale zırhı ve 360° kesintisiz nükleer-graviton havan bombardımanı.'
        },
        eclipseSingularity: {
            id: 'eclipseSingularity', kind: 'superEvolution', scope: 'signature', shipExclusive: 'phantom', tier: 'MEGA',
            shipSynergies: ['phantom'],
            name: 'Tutulma Tanrısı', icon: 'moon', color: '#a78bfa',
            stats: { baseDmg: 290, cd: 0.65, dps: 446 },
            evoReqs: ['abyssalReaper', 'cosmicSupernova'],
            evoPool: ['abyssalReaper', 'cosmicSupernova', 'phantomExecutioner'],
            formula: 'Hiçlik Biçicisi + Kozmik Süpernova (Gölge Mega Evrimi)',
            desc: 'Karanlık madde klonları ve boyutsal kara delik tırpanlarıyla ekran çapında mutlak suikast yıkımı.'
        }
    };

    // 8 Enemy archetypes mapped to canonical PNGs & game.js enemyPool
    const ENEMIES = [
        {
            id: 'swarmer',
            name: 'Drone Sürüsü',
            gameTypes: ['drone', 'speeder'],
            asset: 'assets/enemies/swarmer.png',
            threat: 'DÜŞÜK',
            hpNote: '45 – 85 HP',
            speedNote: 'Yüksek',
            color: '#38bdf8',
            behavior: 'Yüksek sayılarda sürü halinde oyuncunun doğrudan rotasına kapanır; erken dalga XP kaynağıdır.',
            counter: 'Enerji Diski, Çift Lazer ve Alev Hattı ile güvenli çember açın.'
        },
        {
            id: 'kamikaze',
            name: 'İntihar Bombacısı',
            gameTypes: ['kamikaze', 'sweeper'],
            asset: 'assets/enemies/kamikaze.png',
            threat: 'YÜKSEK',
            hpNote: '90 – 130 HP',
            speedNote: 'Çok Yüksek',
            color: '#fb7185',
            behavior: 'Yakın mesafeye girince hızlanıp kalkanı delen yüksek patlama şokuna dönüşür.',
            counter: 'Kuantum Nişangahlı güdümlü füzelerle veya Foton Raylı Top ile menzile girmeden durdurun.'
        },
        {
            id: 'shooter',
            name: 'Plazma Nişancısı',
            gameTypes: ['shooter', 'orbiter'],
            asset: 'assets/enemies/shooter.png',
            threat: 'ORTA',
            hpNote: '110 – 160 HP',
            speedNote: 'Orta',
            color: '#a78bfa',
            behavior: 'Orta menzilde yörüngeye oturup oyuncuya kilitlenen enerji mermileri ateşler.',
            counter: 'Aegis EMP Şok Dalgası mermilerini temizleyip kalkana dönüştürebilir.'
        },
        {
            id: 'phantom',
            name: 'Faz Hayaleti',
            gameTypes: ['phantom'],
            asset: 'assets/enemies/phantom.png',
            threat: 'YÜKSEK',
            hpNote: '140 HP',
            speedNote: 'Faz Sıçramalı',
            color: '#a78bfa',
            behavior: 'Periyodik görünmezlik fazına geçip oyuncunun yan açısına kısa ışınlanma gerçekleştirir.',
            counter: 'Görünürlük parıltısı sırasında alan hasarı (Alev Hattı / Kriyo-Buzul) ile yakalayın.'
        },
        {
            id: 'tank',
            name: 'Zırhlı Kalkan Taşıyıcı',
            gameTypes: ['tank', 'shielder'],
            asset: 'assets/enemies/tank.png',
            threat: 'YÜKSEK',
            hpNote: '320 – 480 HP',
            speedNote: 'Ağır',
            color: '#f59e0b',
            behavior: 'Yüksek zırh katsayısına sahiptir; Elit varyantları çevresindeki sürülere koruma sağlar.',
            counter: 'Delici (Pierce) ve Zırh Kırıcı silahlar (Foton Rayı, Flak, Kuantum Yargıç) ile eritin.'
        },
        {
            id: 'splitter',
            name: 'Bölünen Parazit',
            gameTypes: ['splitter'],
            asset: 'assets/enemies/splitter.png',
            threat: 'ORTA',
            hpNote: '180 HP -> 2x Mini',
            speedNote: 'Orta',
            color: '#34d399',
            behavior: 'Yok edildiğinde 2 adet hızlı alt birime ayrılarak XP akışını ve kalabalık baskısını artırır.',
            counter: 'Graviton Çökertici veya Kozmik Süpernova ile ayrılan parçaları tek merkezde toplayın.'
        },
        {
            id: 'sniper',
            name: 'Takyon Keskin Nişancı',
            gameTypes: ['sniper'],
            asset: 'assets/enemies/sniper.png',
            threat: 'KRİTİK',
            hpNote: '150 HP',
            speedNote: 'Sabit Pozisyon',
            color: '#fb7185',
            behavior: 'Uzun kırmızı lazer nişan hattı çizdikten sonra ekranı aşan yüksek hızlı delici atış yapar.',
            counter: 'Nişan lazeri kilitlenmeden önce dikey yönde manevra yapın veya Warp Dash kullanın.'
        },
        {
            id: 'queen',
            name: 'Kovan Şifacısı / Kraliçe',
            gameTypes: ['healer', 'queen'],
            asset: 'assets/enemies/queen.png',
            threat: 'YÜKSEK',
            hpNote: '360 – 650 HP',
            speedNote: 'Orta',
            color: '#34d399',
            behavior: 'Çevresindeki elit ve zırhlı birimlere sürekli can yenileme darbesi ve destek takviyesi yayar.',
            counter: 'Sürü içindeki yüksek öncelikli hedeftir; güdümlü Füze/Drone saldırısını doğrudan üzerine çekin.'
        }
    ];

    // 5 Canonical Boss archetypes matching assets/bosses/*.png & game.js Boss mechanics
    const BOSSES = [
        {
            id: 'behemoth',
            name: 'Oblivion Behemoth',
            subtitle: 'Zırhlı Yıkıcı · Ön Plaka Koruması',
            gameBossType: 'behemoth',
            spawnWave: 'Dalga 30+ (ve Ağır Kuşatma)',
            asset: 'assets/bosses/behemoth.png',
            color: '#f59e0b',
            mechanics: [
                'Ön 1.75 radyanlık ağır zırh yayı doğrudan mermileri tamamen engeller.',
                'Arka çekirdek açısına yapılan isabetler zayıf nokta olarak %175 Kritik Hasar uygular.',
                '≤ %50 HP’de Öfke Fazı II açılır: +%32 hız, çift salvo ve şok atılması.'
            ],
            tactics: 'Behemoth’un dönüş hızından hızlı manevra yaparak yan/arka açısına geçin veya yörünge/alan silahları kullanın.'
        },
        {
            id: 'leviathan',
            name: 'Void Leviathan',
            subtitle: 'Amansız Takipçi · Şok Atılması',
            gameBossType: 'chaser',
            spawnWave: 'Her 5. Dalga Rotasyonu',
            asset: 'assets/bosses/leviathan.png',
            color: '#fb7185',
            mechanics: [
                '4.6 sn aralıklarla yüksek hızlı şok atılması (Dash) yaparak mesafeyi kapatır.',
                'Tek vuruşta maks HP’nin %12’sinden fazlasını koruyan Faz Kalkanına sahiptir.',
                '≤ %50 HP’de Öfke Fazı II ile atılma bekleme süresi kısalır ve çift salvo ateşler.'
            ],
            tactics: 'Atılma animasyonunu gördüğünüz anda 90° dik açı verip kriyo/yavaşlatma etkilerini aktif tutun.'
        },
        {
            id: 'hivemind',
            name: 'Hivemind Dreadcore',
            subtitle: 'Mermi Cehennemi · 360° Plazma Halkaları',
            gameBossType: 'bullethell',
            spawnWave: 'Her 5. Dalga Rotasyonu',
            asset: 'assets/bosses/hivemind.png',
            color: '#a78bfa',
            mechanics: [
                'Dönerek yayılan yoğun mermi perdeleri ve radyal plazma dalgaları üretir.',
                'Sürü birimleriyle koordineli baskı kurarak güvenli manevra koridorlarını daraltır.',
                '≤ %50 HP Öfke Fazı II altında mermi yoğunluğu iki katına çıkar.'
            ],
            tactics: 'Mermi koridorlarında kısa mikro-dokunuşlarla süzülün; Aegis EMP veya uzun menzilli raylı silahlar çok etkilidir.'
        },
        {
            id: 'chronovore',
            name: 'Chronos Weaver',
            subtitle: 'Zaman Dokuyucu · Çekim Yarıkları',
            gameBossType: 'chronos',
            spawnWave: 'Dalga 20+',
            asset: 'assets/bosses/chronovore.png',
            color: '#2dd4bf',
            mechanics: [
                'Oyuncunun çevresinde (90px sapmayla) kalıcı zaman/çekim yarıkları (Rift) açar.',
                'Öfke Fazı II’de yarık üretimi 3.0 sn’den 2.2 sn’ye düşerek arenayı kilitler.',
                'Geniş çekim halkaları kaçış rotalarını bozarken menzilli salvo sürdürür.'
            ],
            tactics: 'Asla aynı noktada daire çizmeyin; yarıklar 4.5 sn sürdüğü için geniş sekiz çizerek temiz alana çıkın.'
        },
        {
            id: 'seraphim',
            name: 'Astral Seraphim',
            subtitle: 'Tekillik Hakimi · Çekim & Havan Baskısı',
            gameBossType: 'gravity',
            spawnWave: 'Her 5. Dalga Rotasyonu',
            asset: 'assets/bosses/seraphim.png',
            color: '#38bdf8',
            mechanics: [
                'Yüksek basınçlı çekim dalgaları ve önceden uyarılmış yörünge havan atışları uygular.',
                'Faz II (%50 HP altı) tetiklendiğinde ekran çapında şok dalgası ve çift salvo başlatır.',
                'Dalga 25+ Kozmik Çürüme devredeyken kalkan ve şifa verimliliğini zorlar.'
            ],
            tactics: 'Hız ve menzil avantajınızı koruyun; özellikle Füze Sürüsü ve Takyon Mızrağı yüksek kesintisiz DPS sağlar.'
        }
    ];

    const WORKSHOP_UPGRADES = [
        {
            id: 'might',
            name: 'Plazma Reaktörü',
            icon: 'flame',
            color: '#fb7185',
            maxLevel: 8,
            baseCost: 120,
            costScale: 1.55,
            perLevelLabel: '+%8 Silah Hasarı',
            statKey: 'dmgMult',
            calcValue: lvl => 1 + lvl * 0.08
        },
        {
            id: 'hull',
            name: 'Titanyum Gövde Zırhı',
            icon: 'shield',
            color: '#f59e0b',
            maxLevel: 8,
            baseCost: 110,
            costScale: 1.50,
            perLevelLabel: '+%10 Maks Can & Kalkan',
            statKey: 'hpMult',
            calcValue: lvl => 1 + lvl * 0.10
        },
        {
            id: 'thrusters',
            name: 'İyon İtici Kalibrasyonu',
            icon: 'wind',
            color: '#38bdf8',
            maxLevel: 6,
            baseCost: 130,
            costScale: 1.55,
            perLevelLabel: '+%6 Hareket Hızı',
            statKey: 'spdMult',
            calcValue: lvl => 1 + lvl * 0.06
        },
        {
            id: 'crit',
            name: 'Hedefleme Optikleri',
            icon: 'crosshair',
            color: '#a78bfa',
            maxLevel: 6,
            baseCost: 150,
            costScale: 1.60,
            perLevelLabel: '+%3 Kritik Şans',
            statKey: 'critAdd',
            calcValue: lvl => lvl * 0.03
        },
        {
            id: 'cooldown',
            name: 'Kriyo Soğutma Döngüsü',
            icon: 'clock',
            color: '#2dd4bf',
            maxLevel: 6,
            baseCost: 160,
            costScale: 1.65,
            perLevelLabel: '+%4 Ateşleme Hızı',
            statKey: 'cdrAdd',
            calcValue: lvl => lvl * 0.04
        },
        {
            id: 'magnet',
            name: 'Kütle Çekim Bobini',
            icon: 'magnet',
            color: '#34d399',
            maxLevel: 6,
            baseCost: 100,
            costScale: 1.45,
            perLevelLabel: '+%15 XP Çekim Çapı',
            statKey: 'magnetMult',
            calcValue: lvl => 1 + lvl * 0.15
        },
        {
            id: 'reroll',
            name: 'Taktiksel Yenileme Modülü',
            icon: 'refresh-cw',
            color: '#38bdf8',
            maxLevel: 4,
            baseCost: 220,
            costScale: 1.85,
            perLevelLabel: '+1 Seviye Atlamada Reroll',
            statKey: 'extraRerolls',
            calcValue: lvl => lvl
        },
        {
            id: 'greed',
            name: 'Kuantum Veri Hasadı',
            icon: 'coins',
            color: '#f59e0b',
            maxLevel: 6,
            baseCost: 140,
            costScale: 1.60,
            perLevelLabel: '+%12 XP & Kredi Kazanımı',
            statKey: 'xpCreditMult',
            calcValue: lvl => 1 + lvl * 0.12
        }
    ];

    const ACHIEVEMENTS = [
        {
            id: 'first_sortie',
            name: 'İlk Kozmik Çıkış',
            icon: 'rocket',
            color: '#38bdf8',
            reward: 150,
            desc: 'İlk kez bir keşif veya savaş görevini tamamlayın (1 koşu kaydı).'
        },
        {
            id: 'wave_10',
            name: 'Hattı Tut',
            icon: 'shield-check',
            color: '#34d399',
            reward: 250,
            desc: 'Tek bir oyunda Dalga 10 veya üzerine ulaşın.'
        },
        {
            id: 'wave_20',
            name: 'Zaman Dokuyucu Katili',
            icon: 'hourglass',
            color: '#2dd4bf',
            reward: 500,
            desc: 'Dalga 20 barajını aşarak Chronos Weaver ile yüzleşin.'
        },
        {
            id: 'wave_30',
            name: 'Kozmik Çürüme Gazisi',
            icon: 'flame',
            color: '#fb7185',
            reward: 900,
            desc: 'Dalga 25+ Kozmik Çürüme altında Dalga 30’a kadar hayatta kalın.'
        },
        {
            id: 'evo_architect',
            name: 'Sentez Mimarı',
            icon: 'git-merge',
            color: '#a78bfa',
            reward: 350,
            desc: 'Kariyer toplamında en az 5 adet Evrimleşmiş silah sentezleyin.'
        },
        {
            id: 'mega_awakening',
            name: 'Mega Evrim Uyanışı',
            icon: 'crown',
            color: '#f59e0b',
            reward: 750,
            desc: 'İki gelişmiş evrimi birleştirerek ilk Mega Evrimi (SUPER) açın.'
        },
        {
            id: 'swarm_slayer',
            name: 'Yörünge Temizleyici',
            icon: 'crosshair',
            color: '#fb7185',
            reward: 400,
            desc: 'Toplamda 5.000 veya daha fazla düşman paraziti imha edin.'
        },
        {
            id: 'high_roller',
            name: 'Efsanevi Komutan',
            icon: 'trophy',
            color: '#f59e0b',
            reward: 1000,
            desc: 'Tek bir oyunda 50.000 veya daha yüksek skor elde edin.'
        }
    ];

    // Helper lookup builders
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
        VERSION: '9.0',
        SHIPS,
        MAPS,
        DIFFICULTIES,
        WEAPONS,
        TRINKETS,
        EVOLUTIONS,
        SUPER_EVOLUTIONS,
        WORKSHOP_UPGRADES,
        ACHIEVEMENTS,
        ENEMIES,
        BOSSES,
        findEvolutionForPair,
        findSuperForEvolutions,
        getAllModules
    };

    // =========================================================================
    // PERSISTENCE LAYER — STORAGE_KEY = 'cosmic_v8_profile'
    // Preserves full backward & forward compatibility with game.js and portal.
    // =========================================================================
    const STORAGE_KEY = 'cosmic_v8_profile';

    function createDefaultProfile() {
        return {
            credits: 600,
            upgrades: {},
            unlockedShips: Object.keys(SHIPS),
            achievements: {},
            claimedAchievements: {},
            stats: {
                runs: 0,
                bestScore: 0,
                bestWave: 0,
                totalKills: 0,
                totalEvos: 0,
                totalMegas: 0,
                bossesKilled: 0
            },
            history: []
        };
    }

    function normalizeProfile(raw) {
        const def = createDefaultProfile();
        if (!raw || typeof raw !== 'object') return def;

        const profile = {
            credits: Number.isFinite(Number(raw.credits)) ? Math.max(0, Math.floor(Number(raw.credits))) : def.credits,
            upgrades: raw.upgrades && typeof raw.upgrades === 'object' ? Object.assign({}, raw.upgrades) : {},
            unlockedShips: Array.isArray(raw.unlockedShips) && raw.unlockedShips.length > 0
                ? Array.from(new Set(def.unlockedShips.concat(raw.unlockedShips)))
                : def.unlockedShips.slice(),
            achievements: {},
            claimedAchievements: raw.claimedAchievements && typeof raw.claimedAchievements === 'object'
                ? Object.assign({}, raw.claimedAchievements)
                : {},
            stats: Object.assign({}, def.stats, raw.stats && typeof raw.stats === 'object' ? raw.stats : {}),
            history: Array.isArray(raw.history) ? raw.history.slice(0, 20) : []
        };

        if (Array.isArray(raw.achievements)) {
            raw.achievements.forEach(id => { profile.achievements[id] = true; });
        } else if (raw.achievements && typeof raw.achievements === 'object') {
            Object.assign(profile.achievements, raw.achievements);
        }

        // Ensure already-unlocked achievements that weren't explicitly tracked in old schemas remain claimable cleanly
        return profile;
    }

    function evaluateAchievements(profile) {
        const s = profile.stats || {};
        const newlyUnlocked = [];
        const checks = {
            first_sortie: (s.runs || 0) >= 1,
            wave_10: (s.bestWave || 0) >= 10,
            wave_20: (s.bestWave || 0) >= 20,
            wave_30: (s.bestWave || 0) >= 30,
            evo_architect: (s.totalEvos || 0) >= 5,
            mega_awakening: (s.totalMegas || 0) >= 1,
            swarm_slayer: (s.totalKills || 0) >= 5000,
            high_roller: (s.bestScore || 0) >= 50000
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
                const raw = localStorage.getItem(STORAGE_KEY);
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
                localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
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
            return {
                dmgMult: 1 + (ups.might || 0) * 0.08,
                hpMult: 1 + (ups.hull || 0) * 0.10,
                spdMult: 1 + (ups.thrusters || 0) * 0.06,
                critAdd: (ups.crit || 0) * 0.03,
                cdrAdd: (ups.cooldown || 0) * 0.04,
                extraRerolls: ups.reroll || 0,
                magnetMult: 1 + (ups.magnet || 0) * 0.15,
                xpMult: greedMult,
                creditMult: greedMult
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
            const mapId = result.mapId || 'sector9';

            const mapObj = MAPS[mapId] || MAPS.sector9;
            const bonuses = this.getBonuses();
            const rawCredits = Math.floor((score / 110 + wave * 18 + kills * 0.15 + bosses * 45) * mapObj.scoreMult);
            const earnedCredits = Math.max(15, Math.round(rawCredits * (bonuses.creditMult || 1)));

            profile.credits += earnedCredits;
            profile.stats.runs = (profile.stats.runs || 0) + 1;
            profile.stats.bestScore = Math.max(profile.stats.bestScore || 0, score);
            profile.stats.bestWave = Math.max(profile.stats.bestWave || 0, wave);
            profile.stats.totalKills = (profile.stats.totalKills || 0) + kills;
            profile.stats.totalEvos = (profile.stats.totalEvos || 0) + evos;
            profile.stats.totalMegas = (profile.stats.totalMegas || 0) + megas;
            profile.stats.bossesKilled = (profile.stats.bossesKilled || 0) + bosses;

            profile.history.unshift({
                date: new Date().toISOString(),
                shipId: result.shipId || 'interceptor',
                mapId,
                diff: result.diff || 'normal',
                score,
                wave,
                kills,
                evos,
                megas,
                earnedCredits
            });
            if (profile.history.length > 20) profile.history.length = 20;

            const newlyUnlocked = evaluateAchievements(profile);
            this.save(profile);

            return {
                earnedCredits,
                totalCredits: profile.credits,
                newlyUnlocked
            };
        },

        recordRun(result) {
            return this.recordMatchResult(result);
        }
    };

    global.CosmicPersistence = CosmicPersistence;
})(window);
