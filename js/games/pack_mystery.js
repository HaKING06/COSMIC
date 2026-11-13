// =============================================================================
// COSMIC UNIVERSE v11.0 — STARSHIP MURDER MYSTERY ENGINE (js/games/pack_mystery.js)
// Multi-Case Sci-Fi Detective Investigation aboard USCS Vesta-9 (EN / TR)
// =============================================================================
(function (global) {
    'use strict';

    global.COSMIC_GAME_ENGINES = global.COSMIC_GAME_ENGINES || {};

    const CASES = [
        {
            id: 1,
            culprit: 'orin',
            weapon: 'cryo_injector',
            title: {
                tr: 'Vaka 01: Hava Kilidi 04 Sabotajı',
                en: 'Case 01: Airlock 04 Decompression'
            },
            brief: {
                tr: 'Baş Mühendis Dr. Kaelen 02:15\'te Hava Kilidi 04\'te ölü bulundu. Kapı dışarıdan tıbbi geçersiz kılma koduyla kilitlenmiş.',
                en: 'Chief Engineer Dr. Kaelen was found dead in Airlock 04 at 02:15. Logs show a medical override sealed the hatch.'
            },
            rooms: [
                { id: 'bridge', x: 56, y: 112, w: 155, h: 120, color: '#38bdf8', label: { tr: 'KÖPRÜ', en: 'BRIDGE' } },
                { id: 'medbay', x: 236, y: 112, w: 165, h: 120, color: '#34d399', label: { tr: 'REVİR', en: 'MED-BAY' } },
                { id: 'cryolab', x: 56, y: 262, w: 155, h: 125, color: '#a78bfa', label: { tr: 'KRİYO LAB', en: 'CRYO-LAB' } },
                { id: 'reactor', x: 236, y: 262, w: 165, h: 125, color: '#f59e0b', label: { tr: 'REAKTÖR', en: 'REACTOR' } },
                { id: 'airlock', x: 426, y: 170, w: 150, h: 160, color: '#fb7185', label: { tr: 'HAVA KİLİDİ', en: 'AIRLOCK 04' }, crime: true }
            ],
            evidence: [
                {
                    id: 'ev1', room: 'airlock', x: 488, y: 235, sprite: 'plasma_bomb',
                    name: { tr: 'Kırık Kapı Kilit Terminali', en: 'Overridden Hatch Terminal' },
                    clue: {
                        tr: 'LOG #02:14 -> Hava kilidi tıbbi acil yetkisi [MED-KEY-09] ile mühürlendi.',
                        en: 'LOG #02:14 -> Airlock sealed via medical emergency token [MED-KEY-09].'
                    },
                    breaks: 'orin'
                },
                {
                    id: 'ev2', room: 'medbay', x: 282, y: 170, sprite: 'cryo_crystal',
                    name: { tr: 'Eksik Kriyo-Enjektör Şarjörü', en: 'Missing Cryo-Injector Cartridge' },
                    clue: {
                        tr: 'Soğuk doz enjektörü 02:10\'da dolaptan alındı; şifreyi yalnızca Dr. Orin biliyor.',
                        en: 'Sub-zero tranquilizer injector pulled at 02:10; only Dr. Orin holds cabinet clearance.'
                    },
                    breaks: 'orin'
                },
                {
                    id: 'ev3', room: 'reactor', x: 298, y: 318, sprite: 'cargo_crate',
                    name: { tr: 'Vardiyalı Bakım Kaydı', en: 'Automated Shift Telemetry' },
                    clue: {
                        tr: 'Mühendis Vane 02:05 - 02:30 arası soğutma vanasını kalibre ederken sensör tarafından görüntülendi.',
                        en: 'Tech Vane logged calibrating coolant valve continuously from 02:05 to 02:30.'
                    },
                    breaks: null
                },
                {
                    id: 'ev4', room: 'bridge', x: 118, y: 165, sprite: 'warp_ring',
                    name: { tr: 'Köprü Seyir Defteri', en: 'Nav-Console Blackbox' },
                    clue: {
                        tr: 'Kaptan köprü kilidi Lyra\'nın avuç içi izini 02:15\'te doğruluyor.',
                        en: 'Bridge helm interlock verified Navigator Lyra\'s biometric scan at 02:15.'
                    },
                    breaks: null
                }
            ],
            suspects: [
                {
                    id: 'lyra', room: 'bridge', x: 165, y: 185, name: 'Navigator Lyra', role: { tr: 'Rota Subayı', en: 'Navigator' }, color: '#38bdf8',
                    alibi: { tr: '02:15\'te köprüden hiç ayrılmadım; kara kutu biometrim kontrol edilebilir.', en: 'Never left the Bridge at 02:15; blackbox biometrics back me up.' }
                },
                {
                    id: 'orin', room: 'medbay', x: 356, y: 185, name: 'Dr. Orin Vance', role: { tr: 'Baş Tabip', en: 'Chief Medic' }, color: '#34d399',
                    alibi: { tr: 'Revirde uyuyordum. Hava Kilidi yetkim bile yok, dolabım hep kilitlidir!', en: 'Asleep in Med-Bay. I have zero Airlock access and my cabinet stayed locked!' },
                    crackText: {
                        tr: 'İTİRAF: "Kaelen kaçak kriyo-stoklarımı rapor edecekti! MED-KEY-09 ile kilidi kapattım..."',
                        en: 'CRACKED: "Kaelen was reporting my black-market cryo vials! I used MED-KEY-09..."'
                    }
                },
                {
                    id: 'vane', room: 'reactor', x: 356, y: 332, name: 'Tech Vane', role: { tr: 'Reaktör Teknisyeni', en: 'Reactor Tech' }, color: '#f59e0b',
                    alibi: { tr: 'Reaktör pompasındaydım; basıncı dengelemem şarttı.', en: 'In Reactor core balancing primary coolant pressure.' }
                },
                {
                    id: 'korg', room: 'cryolab', x: 148, y: 332, name: 'Chief Korg', role: { tr: 'Güvenlik Şefi', en: 'Security Chief' }, color: '#a78bfa',
                    alibi: { tr: 'Kriyo Lab kapısındaki sensör kalibrasyonunu denetliyordum.', en: 'Checking Cryo-Lab perimeter sensors on deck 2.' }
                }
            ],
            weapons: [
                { id: 'cryo_injector', label: { tr: 'Kriyo-Enjektör + MED Override', en: 'Cryo-Injector + MED Override' } },
                { id: 'plasma_wrench', label: { tr: 'Ağır Plazma Anahtarı', en: 'Heavy Plasma Wrench' } },
                { id: 'reactor_arc', label: { tr: 'Yüksek Voltaj Reaktör Arkı', en: 'Reactor Arc Discharge' } }
            ]
        },
        {
            id: 2,
            culprit: 'lyra',
            weapon: 'nav_sabotage',
            title: {
                tr: 'Vaka 02: Kriyo Kapsülünde Sessiz İnfaz',
                en: 'Case 02: Silent Cryo-Pod Termination'
            },
            brief: {
                tr: 'Güvenlik Ajanı Rhea kendi kriyo kapsülünde termal şok ile donarak öldü. Veri diski silinmiş.',
                en: 'Security Agent Rhea died from thermal inversion inside Cryo-Pod B. Blackbox shard is missing.'
            },
            rooms: [
                { id: 'bridge', x: 56, y: 112, w: 155, h: 120, color: '#38bdf8', label: { tr: 'KÖPRÜ', en: 'BRIDGE' } },
                { id: 'medbay', x: 236, y: 112, w: 165, h: 120, color: '#34d399', label: { tr: 'REVİR', en: 'MED-BAY' } },
                { id: 'cryolab', x: 56, y: 262, w: 155, h: 125, color: '#a78bfa', label: { tr: 'KRİYO LAB', en: 'CRYO-LAB' }, crime: true },
                { id: 'reactor', x: 236, y: 262, w: 165, h: 125, color: '#f59e0b', label: { tr: 'REAKTÖR', en: 'REACTOR' } },
                { id: 'airlock', x: 426, y: 170, w: 150, h: 160, color: '#fb7185', label: { tr: 'KARGO', en: 'CARGO BAY' } }
            ],
            evidence: [
                {
                    id: 'ev1', room: 'cryolab', x: 105, y: 315, sprite: 'cryo_crystal',
                    name: { tr: 'Ters Çevrilmiş Termal Valf', en: 'Inverted Cryo Telemetry Chip' },
                    clue: {
                        tr: 'Kapsül kontrol komutu Köprü Nav-Terminal 02 üzerinden gönderilmiş!',
                        en: 'Pod kill command originated remotely from Bridge Nav-Terminal 02!'
                    },
                    breaks: 'lyra'
                },
                {
                    id: 'ev2', room: 'bridge', x: 112, y: 168, sprite: 'energy_prism',
                    name: { tr: 'Silinmiş Rota Şifresi Parçası', en: 'Recovered Nav-Cipher Shard' },
                    clue: {
                        tr: 'Lyra sahte koordinat satıyormuş; Rhea bunu köprü yedek diskinde yakalamış.',
                        en: 'Shard proves Lyra sold fleet coordinates; Agent Rhea flagged her account.'
                    },
                    breaks: 'lyra'
                },
                {
                    id: 'ev3', room: 'airlock', x: 501, y: 214, sprite: 'cargo_crate',
                    name: { tr: 'Kargo Envanter Mührü', en: 'Cargo Manifest Seal' },
                    clue: {
                        tr: 'Korg ve Orin o saatte mühürlü kargo envanterindeydi (çift imza kaydı).',
                        en: 'Dual keycard logs confirm Korg and Orin inventoried Cargo Bay together.'
                    },
                    breaks: null
                }
            ],
            suspects: [
                {
                    id: 'lyra', room: 'bridge', x: 165, y: 185, name: 'Navigator Lyra', role: { tr: 'Rota Subayı', en: 'Navigator' }, color: '#38bdf8',
                    alibi: { tr: 'Köprü terminallerimden asla Kriyo Lab\'a bağlanamam; yetkim sadece rotadır.', en: 'Bridge Nav-Terminals cannot reach Cryo-Lab; I only chart courses!' },
                    crackText: {
                        tr: 'İTİRAF: "Nav-Terminal 02 köprü alt devresinden kriyo valfine sızdım... Koordinatları biliyordu!"',
                        en: 'CRACKED: "I bridged Nav-02 over the maintenance bus... She knew about the stolen star charts!"'
                    }
                },
                {
                    id: 'orin', room: 'airlock', x: 462, y: 292, name: 'Dr. Orin Vance', role: { tr: 'Yardımcı Hekim', en: 'Ship Medic' }, color: '#34d399',
                    alibi: { tr: 'Kargo bölümünde Korg ile acil tıbbi sandık sayıyorduk.', en: 'Counting emergency cargo medkits alongside Chief Korg.' }
                },
                {
                    id: 'vane', room: 'reactor', x: 356, y: 332, name: 'Tech Vane', role: { tr: 'Mühendis', en: 'Engineer' }, color: '#f59e0b',
                    alibi: { tr: 'Güç dağıtım hattı arızasını onarıyordum.', en: 'Patching plasma conduit faults inside Reactor bay.' }
                },
                {
                    id: 'korg', room: 'airlock', x: 538, y: 292, name: 'Chief Korg', role: { tr: 'Güvenlik', en: 'Security' }, color: '#a78bfa',
                    alibi: { tr: 'Kargo kapısını Dr. Orin gözetiminde kontrol ettim.', en: 'Secured Cargo Bay seals with Dr. Orin present.' }
                }
            ],
            weapons: [
                { id: 'nav_sabotage', label: { tr: 'Nav-02 Uzaktan Kriyo İnfazı', en: 'Remote Nav-02 Cryo Kill-Switch' } },
                { id: 'plasma_wrench', label: { tr: 'Plazma Kaynak Torch\'u', en: 'Plasma Welder Torch' } },
                { id: 'cryo_injector', label: { tr: 'Nörotoksin Şırıngası', en: 'Neurotoxin Syringe' } }
            ]
        },
        {
            id: 3,
            culprit: 'korg',
            weapon: 'arc_baton',
            title: {
                tr: 'Vaka 03: Reaktör Çekirdeğinde İhanet',
                en: 'Case 03: Treason in the Reactor Core'
            },
            brief: {
                tr: 'Vesta-9\'un Amiral Temsilcisi Reaktör odasında yüksek voltajlı ark yanığıyla öldürüldü. Kamera 4 dakika karartılmış.',
                en: 'Fleet Envoy Valen was killed near the Reactor core via high-voltage arc discharge during a 4-minute camera blackout.'
            },
            rooms: [
                { id: 'bridge', x: 56, y: 112, w: 155, h: 120, color: '#38bdf8', label: { tr: 'KÖPRÜ', en: 'BRIDGE' } },
                { id: 'medbay', x: 236, y: 112, w: 165, h: 120, color: '#34d399', label: { tr: 'GÜVENLİK', en: 'SECURITY' } },
                { id: 'cryolab', x: 56, y: 262, w: 155, h: 125, color: '#a78bfa', label: { tr: 'KRİYO LAB', en: 'CRYO-LAB' } },
                { id: 'reactor', x: 236, y: 262, w: 165, h: 125, color: '#f59e0b', label: { tr: 'REAKTÖR', en: 'REACTOR CORE' }, crime: true },
                { id: 'airlock', x: 426, y: 170, w: 150, h: 160, color: '#fb7185', label: { tr: 'HAVA KİLİDİ', en: 'AIRLOCK' } }
            ],
            evidence: [
                {
                    id: 'ev1', room: 'reactor', x: 286, y: 326, sprite: 'shield_battery',
                    name: { tr: 'Yanmış Güvenlik Şok Copları', en: 'Discharged Arc-Baton Cell' },
                    clue: {
                        tr: 'Yüksek frekanslı sersemletme arkı yalnızca Güvenlik Şefi\'nin Arc-Baton silahından çıkabilir.',
                        en: 'High-frequency arc signature matches only the Security Chief\'s issued Arc-Baton.'
                    },
                    breaks: 'korg'
                },
                {
                    id: 'ev2', room: 'medbay', x: 295, y: 165, sprite: 'laser_turret',
                    name: { tr: 'Kamerayı Kapatan Master Şifre', en: 'Blackout Master Cipher' },
                    clue: {
                        tr: 'Güvenlik konsolunda [KORG-SEC-ZERO] komutu 03:40\'ta kayıtları silmiş.',
                        en: 'Security terminal shows [KORG-SEC-ZERO] wiped deck 3 cameras at 03:40.'
                    },
                    breaks: 'korg'
                },
                {
                    id: 'ev3', room: 'cryolab', x: 115, y: 315, sprite: 'coin_star',
                    name: { tr: 'İzotop Analiz Raporu', en: 'Encrypted Fleet Bounty Order' },
                    clue: {
                        tr: 'Amiral temsilcisi gizlice korsanlarla iş birliği yapan köstebeğin adını açıklamaya gelmişti.',
                        en: 'Envoy Valen carried sealed proof exposing the security chief\'s pirate syndicate.'
                    },
                    breaks: null
                }
            ],
            suspects: [
                {
                    id: 'korg', room: 'medbay', x: 356, y: 185, name: 'Chief Korg', role: { tr: 'Güvenlik Şefi', en: 'Security Chief' }, color: '#a78bfa',
                    alibi: { tr: 'Kameralar reaktör dalgalanması yüzünden kendiliğinden gitti; silahım dolabımda!', en: 'Reactor surge fried those cameras! My Arc-Baton never left its locker!' },
                    crackText: {
                        tr: 'İTİRAF: "KORG-SEC-ZERO ile kör nokta yaratıp Valen\'i susturdum!"',
                        en: 'CRACKED: "Yes, I tripped KORG-SEC-ZERO and silenced Valen with my Arc-Baton!"'
                    }
                },
                {
                    id: 'vane', room: 'reactor', x: 356, y: 342, name: 'Tech Vane', role: { tr: 'Baş Mühendis', en: 'Chief Tech' }, color: '#f59e0b',
                    alibi: { tr: 'Olay sırasında hava kilidi basıncını inceliyordum, reaktöre 03:45\'te döndüm.', en: 'Inspecting Airlock seals; returned to Reactor bay only at 03:45.' }
                },
                {
                    id: 'orin', room: 'cryolab', x: 162, y: 332, name: 'Dr. Orin Vance', role: { tr: 'Hekim', en: 'Medic' }, color: '#34d399',
                    alibi: { tr: 'Kriyo Lab örneklerini arşivliyordum.', en: 'Archiving cryo bio-samples all night.' }
                },
                {
                    id: 'lyra', room: 'bridge', x: 162, y: 185, name: 'Officer Rhea II', role: { tr: 'Haberleşme', en: 'Comms Officer' }, color: '#38bdf8',
                    alibi: { tr: 'Köprüde şifreli filo yayınını bekliyordum.', en: 'Monitoring encrypted fleet hail on the Bridge.' }
                }
            ],
            weapons: [
                { id: 'arc_baton', label: { tr: 'Arc-Baton + SEC-ZERO Karartması', en: 'Arc-Baton + SEC-ZERO Blackout' } },
                { id: 'reactor_melt', label: { tr: 'Reaktör Soğutma Sızıntısı', en: 'Coolant Manifold Sabotage' } },
                { id: 'nav_sabotage', label: { tr: 'Köprü Uzaktan Kilidi', en: 'Bridge Remote Lockout' } }
            ]
        }
    ];

    function generateEndlessCase(caseNum) {
        const seed = caseNum * 7919;
        const rng = (i) => ((seed + i * 2654435761) >>> 0) % 1000 / 1000;
        const crewTemplates = [
            { id: 'orin', name: 'Dr. Orin Vance', role: { tr: 'Baş Tabip', en: 'Chief Medic' }, color: '#34d399', home: 'medbay', token: 'MED-SIGMA', weaponId: 'cryo_toxin', weaponLabel: { tr: 'Biyo-Kriyo Aerosolü', en: 'Bio-Cryo Aerosol' }, fakeAlibi: { tr: 'Revirde stok sayıyordum; olay odasına adım atmadım.', en: 'Inventorying med-lockers; never stepped inside that deck.' } },
            { id: 'lyra', name: 'Navigator Lyra', role: { tr: 'Rota Subayı', en: 'Navigator' }, color: '#38bdf8', home: 'bridge', token: 'NAV-PROXY', weaponId: 'nav_override', weaponLabel: { tr: 'Nav-09 Uzaktan Hava Kilidi', en: 'Nav-09 Remote Venting' }, fakeAlibi: { tr: 'Köprüde yıldız haritalarını kalibre ediyordum.', en: 'Calibrating warp charts from Bridge helm all watch.' } },
            { id: 'vane', name: 'Tech Vane', role: { tr: 'Baş Mühendis', en: 'Chief Tech' }, color: '#f59e0b', home: 'reactor', token: 'ENG-BYPASS', weaponId: 'plasma_flare', weaponLabel: { tr: 'Plazma Valf Aşırı Basıncı', en: 'Plasma Manifold Surge' }, fakeAlibi: { tr: 'Reaktör soğutucu pompalarında arıza gideriyordum.', en: 'Patching primary coolant valves inside Reactor core.' } },
            { id: 'korg', name: 'Chief Korg', role: { tr: 'Güvenlik Şefi', en: 'Security Chief' }, color: '#a78bfa', home: 'cryolab', token: 'SEC-BLACKOUT', weaponId: 'arc_pulse', weaponLabel: { tr: 'Güvenlik Arc-Baton Boşalımı', en: 'Security Arc-Baton Discharge' }, fakeAlibi: { tr: 'Kriyo Lab kapı sensörlerini devriye geziyordum.', en: 'Patrolling Cryo-Lab bulkhead sensors on schedule.' } }
        ];
        const roomDefs = [
            { id: 'bridge', x: 56, y: 112, w: 155, h: 120, color: '#38bdf8', label: { tr: 'KÖPRÜ', en: 'BRIDGE' }, evPos: { x: 108, y: 162 }, spPos: { x: 166, y: 184 } },
            { id: 'medbay', x: 236, y: 112, w: 165, h: 120, color: '#34d399', label: { tr: 'REVİR', en: 'MED-BAY' }, evPos: { x: 286, y: 162 }, spPos: { x: 356, y: 184 } },
            { id: 'cryolab', x: 56, y: 262, w: 155, h: 125, color: '#a78bfa', label: { tr: 'KRİYO LAB', en: 'CRYO-LAB' }, evPos: { x: 108, y: 316 }, spPos: { x: 166, y: 334 } },
            { id: 'reactor', x: 236, y: 262, w: 165, h: 125, color: '#f59e0b', label: { tr: 'REAKTÖR', en: 'REACTOR' }, evPos: { x: 286, y: 316 }, spPos: { x: 356, y: 334 } },
            { id: 'airlock', x: 426, y: 170, w: 150, h: 160, color: '#fb7185', label: { tr: 'AMBAR 0' + ((caseNum % 8) + 1), en: 'BAY 0' + ((caseNum % 8) + 1) }, evPos: { x: 501, y: 224 }, spPos: { x: 501, y: 292 } }
        ];
        const culpritIdx = Math.floor(rng(1) * crewTemplates.length);
        const crimeRoomIdx = Math.floor(rng(2) * roomDefs.length);
        const culprit = crewTemplates[culpritIdx];
        const crimeRoom = roomDefs[crimeRoomIdx];
        const alibiWitnesses = crewTemplates.filter((_, idx) => idx !== culpritIdx);
        const clearedPair = [alibiWitnesses[0], alibiWitnesses[1]];
        const extraRoom = roomDefs.find((r) => r.id !== culprit.home && r.id !== crimeRoom.id) || roomDefs[4];
        const culpritHomeRoom = roomDefs.find((r) => r.id === culprit.home) || roomDefs[0];

        const rooms = roomDefs.map((r, idx) => ({
            id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, color: r.color, label: r.label, crime: idx === crimeRoomIdx
        }));

        const hour = `0${1 + (caseNum % 4)}:${12 + ((caseNum * 7) % 40)}`;
        const sprites = ['plasma_bomb', 'cryo_crystal', 'cargo_crate', 'energy_prism'];
        const crimeEv = {
            id: 'ev1',
            room: crimeRoom.id,
            x: crimeRoom.evPos.x,
            y: crimeRoom.evPos.y,
            sprite: sprites[caseNum % sprites.length],
            name: { tr: `${trStatic(crimeRoom.label, 'tr')} Adli Kalıntısı`, en: `${trStatic(crimeRoom.label, 'en')} Forensic Residue` },
            clue: {
                tr: `LOG #${hour} -> Olay yerinde [${culprit.token}] protokolü ve ${trStatic(culprit.weaponLabel, 'tr')} izi tespit edildi.`,
                en: `LOG #${hour} -> Scene scan matched [${culprit.token}] override and ${trStatic(culprit.weaponLabel, 'en')} trace.`
            },
            breaks: culprit.id
        };
        const originEv = {
            id: 'ev2',
            room: culpritHomeRoom.id === crimeRoom.id ? extraRoom.id : culpritHomeRoom.id,
            x: culpritHomeRoom.id === crimeRoom.id ? extraRoom.evPos.x : culpritHomeRoom.evPos.x,
            y: culpritHomeRoom.id === crimeRoom.id ? extraRoom.evPos.y : culpritHomeRoom.evPos.y,
            sprite: 'laser_turret',
            name: { tr: 'Şifreli Erişim Logu', en: 'Encrypted Access Audit' },
            clue: {
                tr: `${culprit.name} terminalinden ${hour}'de silinmiş [${culprit.token}] yetki paketi kurtarıldı!`,
                en: `Recovered wiped [${culprit.token}] packet from ${culprit.name}'s terminal at ${hour}!`
            },
            breaks: culprit.id
        };
        const clearRoom = roomDefs.find((r) => r.id !== crimeRoom.id && r.id !== originEv.room) || roomDefs[(crimeRoomIdx + 3) % roomDefs.length];
        const clearEv = {
            id: 'ev3',
            room: clearRoom.id,
            x: clearRoom.evPos.x,
            y: clearRoom.evPos.y,
            sprite: 'warp_ring',
            name: { tr: 'Çift Biometrik Devriye Kaydı', en: 'Dual Biometric Patrol Sync' },
            clue: {
                tr: `${clearedPair[0].name} ve ${clearedPair[1].name} ${hour}'de ortak sensör doğrulamasındaydı.`,
                en: `${clearedPair[0].name} and ${clearedPair[1].name} verified each other on bulkhead cams at ${hour}.`
            },
            breaks: null
        };

        const suspects = crewTemplates.map((c) => {
            const rm = roomDefs.find((r) => r.id === c.home) || roomDefs[0];
            const isCulprit = c.id === culprit.id;
            return {
                id: c.id,
                room: rm.id,
                x: rm.spPos.x,
                y: rm.spPos.y,
                name: c.name,
                role: c.role,
                color: c.color,
                alibi: c.fakeAlibi,
                crackText: isCulprit ? {
                    tr: `İTİRAF: "Evet! ${culprit.token} anahtarını ${trStatic(culprit.weaponLabel, 'tr')} ile birleştirip kanıtları sildim!"`,
                    en: `CRACKED: "Fine! I triggered ${culprit.token} with ${trStatic(culprit.weaponLabel, 'en')} and purged the logs!"`
                } : undefined
            };
        });

        const weapons = [culprit, alibiWitnesses[0], alibiWitnesses[1]]
            .map((c, idx) => ({ id: c.weaponId, label: c.weaponLabel, sortKey: rng(10 + idx) }))
            .sort((a, b) => a.sortKey - b.sortKey)
            .map(({ id, label }) => ({ id, label }));

        return {
            id: caseNum,
            culprit: culprit.id,
            weapon: culprit.weaponId,
            title: {
                tr: `Vaka ${String(caseNum).padStart(2, '0')}: ${trStatic(crimeRoom.label, 'tr')} Sabotajı`,
                en: `Case ${String(caseNum).padStart(2, '0')}: ${trStatic(crimeRoom.label, 'en')} Conspiracy`
            },
            brief: {
                tr: `Kurye Subayı Vesta-9 ${trStatic(crimeRoom.label, 'tr')} bölümünde ${hour}'de etkisiz bulundu. Sabotaj izlerini tara.`,
                en: `Courier Liaison was found downed in ${trStatic(crimeRoom.label, 'en')} at ${hour}. Scan forensic anomalies to expose the culprit.`
            },
            rooms,
            evidence: [crimeEv, originEv, clearEv],
            suspects,
            weapons
        };
    }

    function trStatic(obj, lang) {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return obj[lang] || obj.tr || obj.en || '';
    }

    global.COSMIC_GAME_ENGINES['starship-murder-mystery'] = function mountMystery(ctx) {
        const W = 960;
        const H = 540;
        const canvas = ctx.createCanvas('2d', W, H);
        const g = canvas.getContext('2d');

        let level = Math.max(1, Number(ctx.initialLevel || ctx.level) || 1);
        let lives = 3;
        let score = 0;
        let caseStartScore = 0;
        let wonCase = false;
        let ended = false;
        let destroyed = false;
        let rafId = 0;
        let time = 0;

        let scannedEv = new Set();
        let brokenSuspects = new Set();
        let interrogationLog = [];
        let selectedTarget = null; // { kind: 'brief' | 'evidence' | 'suspect', data }
        let selectedSuspectAccuse = null;
        let selectedWeaponAccuse = null;
        let toastText = '';
        let toastColor = '#38bdf8';
        let toastTimer = 0;
        let shakeTimer = 0;
        let hintRoomId = null;
        let hintTimer = 0;
        let kbNodeIdx = -1;
        let hoverPos = { x: -1, y: -1 };
        let hotboxes = [];
        const caseCache = new Map();

        function curCase() {
            if (level <= CASES.length) return CASES[level - 1];
            if (!caseCache.has(level)) caseCache.set(level, generateEndlessCase(level));
            return caseCache.get(level);
        }

        function tr(obj) {
            if (!obj) return '';
            if (typeof obj === 'string') return obj;
            return obj[ctx.lang] || obj.tr || '';
        }

        function setToast(txt, col) {
            toastText = txt;
            toastColor = col || '#38bdf8';
            toastTimer = 2.8;
        }

        function pushLog(msg) {
            if (!msg) return;
            if (interrogationLog[0] === msg) return;
            interrogationLog.unshift(msg);
            if (interrogationLog.length > 4) interrogationLog.pop();
        }

        function resetCaseState(newLvl) {
            const targetLvl = Math.max(1, Number(newLvl) || 1);
            if (targetLvl <= 1) {
                score = 0;
                caseStartScore = 0;
            } else if (wonCase && targetLvl > level) {
                caseStartScore = score;
            } else {
                score = caseStartScore;
            }
            wonCase = false;
            ended = false;
            level = targetLvl;
            lives = 3;
            scannedEv = new Set();
            brokenSuspects = new Set();
            interrogationLog = [];
            toastTimer = 0;
            shakeTimer = 0;
            hintRoomId = null;
            hintTimer = 0;
            kbNodeIdx = -1;
            const cs = curCase();
            selectedTarget = { kind: 'brief', data: cs };
            selectedSuspectAccuse = cs.suspects[0].id;
            selectedWeaponAccuse = cs.weapons[0].id;
            syncHud();
            drawFrame();
        }

        function syncHud() {
            const cs = curCase();
            ctx.setHud({
                score,
                level,
                maxLevel: Math.max(CASES.length, level),
                lives,
                statusText: `${tr(cs.title)} · ${scannedEv.size}/${cs.evidence.length} ${ctx.t('Delil', 'Clues')}`
            });
        }

        function wrapText(text, x, y, maxW, lineH, maxLines) {
            const words = String(text || '').split(' ');
            let line = '';
            let yy = y;
            let count = 0;
            for (let i = 0; i < words.length; i++) {
                const test = line ? `${line} ${words[i]}` : words[i];
                if (g.measureText(test).width > maxW && line) {
                    g.fillText(line, x, yy);
                    yy += lineH;
                    count++;
                    if (maxLines && count >= maxLines) return yy;
                    line = words[i];
                } else {
                    line = test;
                }
            }
            if (line) {
                g.fillText(line, x, yy);
                yy += lineH;
            }
            return yy;
        }

        function drawSpriteOrCircle(spriteKey, x, y, size, fallbackCol) {
            const img = ctx.sprites && ctx.sprites[spriteKey];
            if (img && img.complete && img.naturalWidth > 0) {
                g.drawImage(img, x - size / 2, y - size / 2, size, size);
            } else {
                g.fillStyle = fallbackCol || '#38bdf8';
                g.beginPath();
                g.arc(x, y, size * 0.4, 0, Math.PI * 2);
                g.fill();
            }
        }

        function triggerClueHint() {
            const cs = curCase();
            const nextEv = cs.evidence.find((ev) => !scannedEv.has(ev.id));
            if (nextEv) {
                hintRoomId = nextEv.room;
                hintTimer = 3.2;
                selectedTarget = { kind: 'brief', data: cs };
                ctx.audio?.play?.('powerup');
                const rm = cs.rooms.find((r) => r.id === nextEv.room);
                setToast(
                    ctx.t(`Tarayıcı Sinyali: ${rm ? tr(rm.label) : nextEv.room} odasını kontrol et!`, `Scanner Ping: Inspect ${rm ? tr(rm.label) : nextEv.room}!`),
                    '#fbbf24'
                );
            } else {
                const uncracked = cs.suspects.find((sp) => !brokenSuspects.has(sp.id) && cs.evidence.some((e) => e.breaks === sp.id));
                if (uncracked) {
                    selectedTarget = { kind: 'suspect', data: uncracked };
                    ctx.audio?.play?.('uiClick');
                    setToast(ctx.t(`${uncracked.name} ile çelişkiyi çürüt!`, `Present contradiction to ${uncracked.name}!`), '#38bdf8');
                } else {
                    ctx.audio?.play?.('uiClick');
                    setToast(ctx.t('Tüm deliller hazır — aşağıdan suçlamayı sun!', 'All clues verified — submit Verdict below!'), '#34d399');
                }
            }
        }

        function drawFrame() {
            hotboxes = [];
            const cs = curCase();

            g.save();
            if (shakeTimer > 0) {
                g.translate((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7);
            }

            // Noir Blueprint Backdrop
            g.fillStyle = '#060a14';
            g.fillRect(0, 0, W, H);
            g.strokeStyle = 'rgba(56, 189, 248, 0.06)';
            g.lineWidth = 1;
            for (let gx = 0; gx < W; gx += 30) {
                g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx, H); g.stroke();
            }
            for (let gy = 0; gy < H; gy += 30) {
                g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke();
            }

            // Header Banner
            g.fillStyle = 'rgba(13, 19, 32, 0.92)';
            g.fillRect(24, 18, 566, 70);
            g.strokeStyle = 'rgba(56, 189, 248, 0.25)';
            g.strokeRect(24, 18, 566, 70);

            g.fillStyle = '#fb7185';
            g.font = '700 11px JetBrains Mono, monospace';
            const fileTag = String(level).padStart(2, '0');
            g.fillText(ctx.t(`USCS VESTA-9 · ADLİ DOSYA ${fileTag}`, `USCS VESTA-9 · CASE FILE ${fileTag}`), 38, 38);

            g.fillStyle = '#f1f5f9';
            g.font = '700 17px Space Grotesk, sans-serif';
            g.fillText(tr(cs.title), 38, 56);

            g.fillStyle = '#94a3b8';
            g.font = '500 11px Inter, sans-serif';
            wrapText(tr(cs.brief), 38, 72, 535, 13, 2);

            // Station Hull Outline & Corridors
            g.strokeStyle = 'rgba(148, 163, 184, 0.28)';
            g.lineWidth = 10;
            g.beginPath();
            g.moveTo(135, 172); g.lineTo(318, 172); g.lineTo(318, 324); g.lineTo(135, 324); g.closePath();
            g.moveTo(318, 248); g.lineTo(498, 248);
            g.stroke();

            // Draw Rooms
            cs.rooms.forEach((rm) => {
                const isHinted = hintTimer > 0 && hintRoomId === rm.id;
                g.fillStyle = rm.crime ? 'rgba(251, 113, 133, 0.11)' : (isHinted ? 'rgba(251, 191, 36, 0.10)' : 'rgba(15, 23, 42, 0.88)');
                g.fillRect(rm.x, rm.y, rm.w, rm.h);
                g.strokeStyle = isHinted ? '#fbbf24' : rm.color;
                g.lineWidth = isHinted ? 2.6 : (rm.crime ? 2 : 1.3);
                g.strokeRect(rm.x, rm.y, rm.w, rm.h);

                g.fillStyle = isHinted ? '#fbbf24' : rm.color;
                g.font = '700 11px JetBrains Mono, monospace';
                g.fillText(tr(rm.label), rm.x + 10, rm.y + 18);

                if (rm.crime) {
                    const pulse = 0.5 + 0.5 * Math.sin(time * 5);
                    g.fillStyle = `rgba(251, 113, 133, ${0.4 + 0.5 * pulse})`;
                    g.font = '700 10px JetBrains Mono, monospace';
                    g.fillText(ctx.t('● OLAY YERİ', '● CRIME SCENE'), rm.x + 10, rm.y + rm.h - 10);
                }
            });

            // Evidence Nodes
            cs.evidence.forEach((ev) => {
                const isScanned = scannedEv.has(ev.id);
                const pulse = 18 + Math.sin(time * 4) * 3;
                g.strokeStyle = isScanned ? '#34d399' : '#fbbf24';
                g.lineWidth = isScanned ? 2 : 1.5;
                g.beginPath();
                g.arc(ev.x, ev.y, isScanned ? 17 : pulse, 0, Math.PI * 2);
                g.stroke();

                drawSpriteOrCircle(ev.sprite, ev.x, ev.y, 26, '#fbbf24');
                g.fillStyle = isScanned ? '#34d399' : '#fbbf24';
                g.font = '700 10px JetBrains Mono, monospace';
                g.fillText(isScanned ? '✓ SCAN' : '🔍 SCAN', ev.x - 20, ev.y + 27);

                hotboxes.push({
                    x: ev.x - 24, y: ev.y - 24, w: 48, h: 52,
                    onClick: () => {
                        if (!scannedEv.has(ev.id)) {
                            scannedEv.add(ev.id);
                            score += 120;
                            ctx.audio?.play?.('powerup');
                            setToast(ctx.t('Adli delil doğrulandı (+120)', 'Forensic clue logged (+120)'), '#34d399');
                        } else {
                            ctx.audio?.play?.('uiClick');
                        }
                        selectedTarget = { kind: 'evidence', data: ev };
                        syncHud();
                    }
                });
            });

            // Suspect Nodes
            cs.suspects.forEach((sp) => {
                const isBroken = brokenSuspects.has(sp.id);
                const isSel = selectedTarget && selectedTarget.kind === 'suspect' && selectedTarget.data.id === sp.id;
                g.fillStyle = isSel ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.85)';
                g.beginPath(); g.arc(sp.x, sp.y, 19, 0, Math.PI * 2); g.fill();
                g.strokeStyle = isBroken ? '#fb7185' : sp.color;
                g.lineWidth = isSel ? 2.5 : 1.6;
                g.stroke();

                drawSpriteOrCircle('astronaut', sp.x, sp.y, 26, sp.color);

                g.fillStyle = '#e2e8f0';
                g.font = '600 10.5px Inter, sans-serif';
                g.fillText(sp.name.split(' ').pop(), sp.x - 16, sp.y + 29);

                hotboxes.push({
                    x: sp.x - 22, y: sp.y - 22, w: 44, h: 50,
                    onClick: () => {
                        ctx.audio?.play?.('uiClick');
                        selectedTarget = { kind: 'suspect', data: sp };
                    }
                });
            });

            // Bottom Clue Checklist Strip (Left panel)
            g.fillStyle = 'rgba(13, 19, 32, 0.92)';
            g.fillRect(24, 412, 566, 108);
            g.strokeStyle = 'rgba(148, 163, 184, 0.22)';
            g.lineWidth = 1;
            g.strokeRect(24, 412, 566, 108);
            g.fillStyle = '#38bdf8';
            g.font = '700 11px JetBrains Mono, monospace';
            g.fillText(ctx.t('TOPLANAN ADLİ DELİLLER', 'COLLECTED FORENSIC CLUES'), 38, 432);

            // Scanner Hint Button [H]
            const hintHov = hoverPos.x >= 476 && hoverPos.x <= 578 && hoverPos.y >= 417 && hoverPos.y <= 439;
            g.fillStyle = hintHov ? 'rgba(251, 191, 36, 0.25)' : 'rgba(251, 191, 36, 0.12)';
            g.fillRect(476, 417, 102, 22);
            g.strokeStyle = '#fbbf24';
            g.strokeRect(476, 417, 102, 22);
            g.fillStyle = '#fde68a';
            g.font = '700 10px JetBrains Mono, monospace';
            g.fillText(ctx.t('[H] İPUCU TARA', '[H] SCAN HINT'), 484, 432);
            hotboxes.push({
                x: 476, y: 417, w: 102, h: 22,
                onClick: () => triggerClueHint()
            });

            let cy = 450;
            cs.evidence.forEach((ev) => {
                const got = scannedEv.has(ev.id);
                g.fillStyle = got ? '#e2e8f0' : '#475569';
                g.font = '500 11.5px Inter, sans-serif';
                let textLine = got ? `✓ ${tr(ev.clue)}` : `□ [ ${tr(ev.name)} ] — ${ctx.t('Taramak için haritada simgeye tıkla', 'Click node on map to scan')}`;
                if (typeof g.measureText === 'function') {
                    if (g.measureText(textLine).width > 536) {
                        while (textLine.length > 16 && g.measureText(textLine + '…').width > 536) {
                            textLine = textLine.slice(0, -1);
                        }
                        textLine += '…';
                    }
                } else if (textLine.length > 88) {
                    textLine = textLine.slice(0, 88) + '…';
                }
                g.fillText(textLine, 38, cy);
                cy += 17;
            });

            // Right Forensics & Accusation Panel (x: 610..936, y: 18..520)
            g.fillStyle = 'rgba(13, 19, 32, 0.95)';
            g.fillRect(610, 18, 326, 502);
            g.strokeStyle = 'rgba(56, 189, 248, 0.28)';
            g.strokeRect(610, 18, 326, 502);

            // Top Inspector Card (y: 30..255)
            g.fillStyle = '#38bdf8';
            g.font = '700 11px JetBrains Mono, monospace';
            g.fillText(ctx.t('SORGULAMA & TARAMA EKRANI', 'FORENSICS & INTERROGATION'), 626, 42);

            if (selectedTarget && selectedTarget.kind === 'evidence') {
                const ev = selectedTarget.data;
                drawSpriteOrCircle(ev.sprite, 650, 80, 42, '#fbbf24');
                g.fillStyle = '#f8fafc';
                g.font = '700 14px Space Grotesk, sans-serif';
                g.fillText(tr(ev.name), 682, 76);
                g.fillStyle = '#34d399';
                g.font = '600 11px JetBrains Mono, monospace';
                g.fillText(ctx.t('DELİL DOĞRULANDI', 'VERIFIED EVIDENCE'), 682, 95);
                g.fillStyle = '#cbd5e1';
                g.font = '500 12.5px Inter, sans-serif';
                wrapText(tr(ev.clue), 626, 128, 294, 18, 5);
            } else if (selectedTarget && selectedTarget.kind === 'suspect') {
                const sp = selectedTarget.data;
                const isBroken = brokenSuspects.has(sp.id);
                drawSpriteOrCircle('nova_avatar', 650, 80, 40, sp.color);
                g.fillStyle = sp.color;
                g.font = '700 15px Space Grotesk, sans-serif';
                g.fillText(sp.name, 682, 76);
                g.fillStyle = '#94a3b8';
                g.font = '500 11.5px JetBrains Mono, monospace';
                g.fillText(tr(sp.role), 682, 94);

                g.fillStyle = isBroken ? '#fda4af' : '#e2e8f0';
                g.font = '500 12.5px Inter, sans-serif';
                wrapText(isBroken ? tr(sp.crackText) : `"${tr(sp.alibi)}"`, 626, 124, 294, 17, 5);

                // Challenge Alibi button
                if (!isBroken) {
                    const hasProof = cs.evidence.some(e => e.breaks === sp.id && scannedEv.has(e.id));
                    g.fillStyle = hasProof ? 'rgba(244, 63, 94, 0.25)' : 'rgba(30, 41, 59, 0.7)';
                    g.fillRect(626, 212, 294, 34);
                    g.strokeStyle = hasProof ? '#f43f5e' : '#475569';
                    g.strokeRect(626, 212, 294, 34);
                    g.fillStyle = hasProof ? '#fecdd3' : '#94a3b8';
                    g.font = '700 12px JetBrains Mono, monospace';
                    g.fillText(hasProof ? ctx.t('⚡ ÇELİŞKİYİ ÇÜRÜT (KANIT SUN)', '⚡ PRESENT CONTRADICTION') : ctx.t('Önce İlgili Delili Tara', 'Scan Counter-Clue First'), 644, 233);

                    hotboxes.push({
                        x: 626, y: 212, w: 294, h: 34,
                        onClick: () => {
                            if (hasProof) {
                                brokenSuspects.add(sp.id);
                                score += 250;
                                selectedSuspectAccuse = sp.id;
                                ctx.audio?.play?.('levelup');
                                setToast(ctx.t('Yalan ifadesi çürütüldü! (+250)', 'Alibi shattered! (+250)'), '#fb7185');
                                syncHud();
                            } else {
                                ctx.audio?.play?.('uiClick');
                                setToast(ctx.t('Bu şüpheliye karşı henüz delil yok!', 'No counter-evidence scanned yet!'), '#f59e0b');
                            }
                        }
                    });
                }
            } else {
                drawSpriteOrCircle('nova_avatar', 650, 82, 42, '#38bdf8');
                g.fillStyle = '#f8fafc';
                g.font = '700 14px Space Grotesk, sans-serif';
                g.fillText('Captain Nova Vex', 682, 76);
                g.fillStyle = '#94a3b8';
                g.font = '500 11.5px JetBrains Mono, monospace';
                g.fillText(ctx.t('Baş Müfettiş', 'Lead Investigator'), 682, 95);
                g.fillStyle = '#cbd5e1';
                g.font = '500 12.5px Inter, sans-serif';
                wrapText(ctx.t(
                    'Haritadaki parlayan 🔍 delil tarayıcılarına tıkla, mürettebat ifadelerini dinle ve altta katili + silahı seçerek vakayı kapat.',
                    'Click glowing 🔍 evidence scanners across rooms, cross-examine crew alibis, then select Culprit + Weapon below to close the case.'
                ), 626, 128, 294, 18, 5);
            }

            // Divider
            g.strokeStyle = 'rgba(148, 163, 184, 0.2)';
            g.beginPath(); g.moveTo(626, 260); g.lineTo(920, 260); g.stroke();

            // Verdict Builder Section (y: 268..510)
            g.fillStyle = '#f59e0b';
            g.font = '700 11px JetBrains Mono, monospace';
            g.fillText(ctx.t('NİHAİ SUÇLAMA DOSYASI', 'FINAL ACCUSATION VERDICT'), 626, 280);

            // Suspect Selector Pills (2x2)
            cs.suspects.forEach((sp, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const bx = 626 + col * 149;
                const by = 290 + row * 34;
                const active = selectedSuspectAccuse === sp.id;
                g.fillStyle = active ? 'rgba(56, 189, 248, 0.2)' : 'rgba(7, 11, 18, 0.8)';
                g.fillRect(bx, by, 143, 28);
                g.strokeStyle = active ? '#38bdf8' : 'rgba(148, 163, 184, 0.22)';
                g.strokeRect(bx, by, 143, 28);
                g.fillStyle = active ? '#f8fafc' : '#94a3b8';
                g.font = '600 11px Inter, sans-serif';
                g.fillText(sp.name.slice(0, 17), bx + 8, by + 18);
                hotboxes.push({
                    x: bx, y: by, w: 143, h: 28,
                    onClick: () => { selectedSuspectAccuse = sp.id; ctx.audio?.play?.('uiClick'); }
                });
            });

            // Weapon Selector Pills (3 rows)
            g.fillStyle = '#94a3b8';
            g.font = '700 10px JetBrains Mono, monospace';
            g.fillText(ctx.t('CİNAYET YÖNTEMİ:', 'SABOTAGE WEAPON:'), 626, 372);
            cs.weapons.forEach((wp, i) => {
                const by = 380 + i * 28;
                const active = selectedWeaponAccuse === wp.id;
                g.fillStyle = active ? 'rgba(245, 158, 11, 0.2)' : 'rgba(7, 11, 18, 0.8)';
                g.fillRect(626, by, 294, 24);
                g.strokeStyle = active ? '#f59e0b' : 'rgba(148, 163, 184, 0.22)';
                g.strokeRect(626, by, 294, 24);
                g.fillStyle = active ? '#fde68a' : '#94a3b8';
                g.font = '600 11px Inter, sans-serif';
                g.fillText(tr(wp.label), 636, by + 16);
                hotboxes.push({
                    x: 626, y: by, w: 294, h: 24,
                    onClick: () => { selectedWeaponAccuse = wp.id; ctx.audio?.play?.('uiClick'); }
                });
            });

            // Final Submit Accusation Button
            const submitHov = hoverPos.x >= 626 && hoverPos.x <= 920 && hoverPos.y >= 470 && hoverPos.y <= 508;
            g.fillStyle = submitHov ? 'rgba(244, 63, 94, 1)' : 'rgba(244, 63, 94, 0.9)';
            g.fillRect(626, 470, 294, 38);
            g.strokeStyle = '#fda4af';
            g.strokeRect(626, 470, 294, 38);
            g.fillStyle = '#ffffff';
            g.font = '700 13px Space Grotesk, sans-serif';
            g.fillText(ctx.t('⚖ SUÇLAMAYI SUN & VAKAYI ÇÖZ', '⚖ ISSUE ARREST WARRANT'), 672, 494);
            hotboxes.push({
                x: 626, y: 470, w: 294, h: 38,
                onClick: () => {
                    if (ended) return;
                    if (selectedSuspectAccuse === cs.culprit && selectedWeaponAccuse === cs.weapon) {
                        wonCase = true;
                        ended = true;
                        score += 500 + lives * 150;
                        ctx.audio?.play?.('levelup');
                        const stars = lives === 3 ? 3 : (lives === 2 ? 2 : 1);
                        syncHud();
                        ctx.onWin({
                            score,
                            level,
                            stars,
                            reason: ctx.t(
                                `Tebrikler! ${tr(cs.title)} doğrulandı.`,
                                `Case Solved! ${tr(cs.title)} closed cleanly.`
                            )
                        });
                    } else {
                        lives = Math.max(0, lives - 1);
                        shakeTimer = 0.28;
                        ctx.audio?.play?.('playerHurt');
                        syncHud();
                        if (lives <= 0) {
                            ended = true;
                            ctx.onGameOver({
                                score,
                                level,
                                stars: 0,
                                reason: ctx.t('Yanlış suçlamalar yüzünden katil kaçtı!', 'Culprit escaped after false accusations!')
                            });
                        } else {
                            setToast(ctx.t(`Yanlış eşleşme! Kalan itibar hakkı: ${lives}`, `Wrong accusation! Remaining attempts: ${lives}`), '#fb7185');
                        }
                    }
                }
            });

            // Floating Toast
            if (toastTimer > 0 && toastText) {
                g.fillStyle = 'rgba(7, 11, 18, 0.94)';
                g.fillRect(50, 392, 515, 30);
                g.strokeStyle = toastColor;
                g.strokeRect(50, 392, 515, 30);
                g.fillStyle = toastColor;
                g.font = '600 12px JetBrains Mono, monospace';
                g.fillText(toastText, 64, 412);
            }
            g.restore();
        }

            function mapPointer(e) {
                const rect = canvas.getBoundingClientRect();
                const rw = Math.max(1, rect.width || W);
                const rh = Math.max(1, rect.height || H);
                const src = (e && e.touches && e.touches[0]) || (e && e.changedTouches && e.changedTouches[0]) || e || {};
                const cx = Number.isFinite(src.clientX) ? src.clientX : rect.left;
                const cy = Number.isFinite(src.clientY) ? src.clientY : rect.top;
                return {
                    x: Math.max(0, Math.min(W, ((cx - rect.left) / rw) * W)),
                    y: Math.max(0, Math.min(H, ((cy - rect.top) / rh) * H))
                };
            }

            function handlePointerMove(e) {
                if (ctx.getPaused() || destroyed || ended) {
                    hoverPos = { x: -1, y: -1 };
                    if (canvas.style) canvas.style.cursor = '';
                    return;
                }
                const p = mapPointer(e);
                hoverPos = p;
                let hit = false;
                for (let i = hotboxes.length - 1; i >= 0; i--) {
                    const hb = hotboxes[i];
                        if (p.x >= hb.x && p.x <= hb.x + hb.w && p.y >= hb.y && p.y <= hb.y + hb.h) {
                            hit = true;
                            break;
                        }
                    }
                    if (canvas.style) canvas.style.cursor = hit ? 'pointer' : 'default';
                }

                function handlePointerLeave() {
                    hoverPos = { x: -1, y: -1 };
                    if (canvas.style) canvas.style.cursor = '';
                }

                function handlePointer(e) {
                    if (ctx.getPaused() || destroyed || ended) return;
                    if (typeof e.button === 'number' && e.button !== 0) return;
                    if (typeof canvas.focus === 'function') {
                        try { canvas.focus({ preventScroll: true }); } catch (_) {}
                    }
                    const p = mapPointer(e);
                    hoverPos = p;
                    for (let i = hotboxes.length - 1; i >= 0; i--) {
                        const hb = hotboxes[i];
                        if (p.x >= hb.x && p.x <= hb.x + hb.w && p.y >= hb.y && p.y <= hb.y + hb.h) {
                            hb.onClick();
                            break;
                        }
                    }
                }

                function handleKeyDown(e) {
                    if (ctx.getPaused() || destroyed || ended) return;
                    const tag = typeof document !== 'undefined' && document.activeElement && document.activeElement.tagName;
                    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
                    const k = (e.key || '').toLowerCase();
                    if (k === 'h') {
                        triggerClueHint();
                    } else if (k >= '1' && k <= '4') {
                        const cs = curCase();
                        const sp = cs.suspects[Number(k) - 1];
                        if (sp) {
                            selectedTarget = { kind: 'suspect', data: sp };
                            ctx.audio?.play?.('uiClick');
                        }
                    }
                }

                canvas.tabIndex = 0;
                if (canvas.style) canvas.style.outline = 'none';
                canvas.addEventListener('pointerdown', handlePointer);
                canvas.addEventListener('pointermove', handlePointerMove);
                canvas.addEventListener('pointerleave', handlePointerLeave);
                if (typeof global.addEventListener === 'function') {
                    global.addEventListener('keydown', handleKeyDown);
                }

                let lastTs = performance.now();
                function loop(ts) {
                    if (destroyed) return;
                    const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
                    lastTs = ts;
                    if (!ctx.getPaused()) {
                        time += dt;
                        if (toastTimer > 0) toastTimer = Math.max(0, toastTimer - dt);
                        if (shakeTimer > 0) shakeTimer = Math.max(0, shakeTimer - dt);
                        if (hintTimer > 0) hintTimer = Math.max(0, hintTimer - dt);
                        drawFrame();
                    }
                    rafId = requestAnimationFrame(loop);
                }

                resetCaseState(level);
                rafId = requestAnimationFrame(loop);

                return {
                    destroy() {
                        destroyed = true;
                        cancelAnimationFrame(rafId);
                        canvas.removeEventListener('pointerdown', handlePointer);
                        canvas.removeEventListener('pointermove', handlePointerMove);
                        canvas.removeEventListener('pointerleave', handlePointerLeave);
                        if (typeof global.removeEventListener === 'function') {
                            global.removeEventListener('keydown', handleKeyDown);
                        }
                        if (canvas.style) canvas.style.cursor = '';
                        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
                    },
                    restart(nextLvl) {
                        resetCaseState(nextLvl || level);
                    }
                };
            };
        }) (typeof window !== 'undefined' ? window : globalThis);
