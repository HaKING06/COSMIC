// =============================================================================
// COSMIC UNIVERSE v11.0 — CAPTAIN NOVA VEX 8-CHAPTER STORY SAGA
// "PARÇALANAN SONSUZLUK / THE SHATTERED INFINITY"
// Exposes window.COSMIC_STORY_CHAPTERS, window.COSMIC_STORY_META, window.CosmicStoryStore
// =============================================================================
(function (global) {
    'use strict';

    const STORAGE_KEY = 'cosmic_v11_story';

    const COSMIC_STORY_META = Object.freeze({
        sagaTitle: Object.freeze({
            tr: 'PARÇALANAN SONSUZLUK',
            en: 'THE SHATTERED INFINITY'
        }),
        protagonist: Object.freeze({
            name: 'Captain Nova Vex',
            rank: { tr: 'Öncü Yıldız Kaptanı', en: 'Vanguard Star Captain' },
            avatar: 'assets/v11/nova_avatar.png',
            portrait: 'assets/v11/nova_portrait.png'
        }),
        totalChapters: 24,
        acts: Object.freeze([
            Object.freeze({ id: 1, title: { tr: 'PERDE I: VESTA İHLALİ', en: 'ACT I: VESTA BREACH' }, range: [1, 6] }),
            Object.freeze({ id: 2, title: { tr: 'PERDE II: GÖLGE SİNYALİ', en: 'ACT II: SHADOW SIGNAL' }, range: [7, 12] }),
            Object.freeze({ id: 3, title: { tr: 'PERDE III: DEMİR OCAK', en: 'ACT III: IRON FORGE' }, range: [13, 18] }),
            Object.freeze({ id: 4, title: { tr: 'PERDE IV: SEZON FİNALİ', en: 'ACT IV: SEASON FINALE' }, range: [19, 24] })
        ])
    });

    const RAW_CHAPTERS = [
        {
            id: 1,
            heroMood: 'alert',
            gameId: 'nova-flappy-rift',
            targetType: 'score',
            targetValue: 8,
            image: 'assets/v11/chapters/ch1.jpg',
            title: {
                tr: 'Bölüm 1: Yörünge İhlali',
                en: 'Chapter 1: Orbital Breach'
            },
            sector: {
                tr: 'Sektör 01 — Vesta İleri Karakolu',
                en: 'Sector 01 — Vesta Outpost Ring'
            },
            lore: {
                tr: 'Hiper-uzay fenerleri aniden çöktü. Kaptan Nova Vex, parçalanan yörünge geçitlerinin arasından itici sıçrayışlarıyla süzülerek ilk tehlike sinyalini göndermek zorunda.',
                en: 'Hyperspace beacons collapsed without warning. Captain Nova Vex must pulse thrusters through shattered orbital rift pylons to transmit the first distress relay.'
            },
            dialogue: [
                {
                    speaker: 'S.A.R.A. AI',
                    text: {
                        tr: 'Kaptan, yörünge halkasında ani uzay-zaman kırılması! İtici çekirdeği manuel kontrol dışında tepki vermiyor.',
                        en: 'Captain, sudden spacetime shear detected in the orbital ring! Thrusters are down to pulse-fire only.'
                    }
                },
                {
                    speaker: 'Captain Nova Vex',
                    text: {
                        tr: 'Motorlara güveniyorum S.A.R.A. — plazma sütunlarının arasından sekiz kapıyı aşarsak acil röleye ulaşırız.',
                        en: 'I trust the hull, S.A.R.A. Clear eight plasma rift gates and we reach the emergency relay.'
                    }
                },
                {
                    speaker: 'S.A.R.A. AI',
                    text: {
                        tr: 'Rota kilitlendi. Keskin darbelerle yüksel, akıma kapılma!',
                        en: 'Course locked. Feather those thrusters and stay clear of the pylons!'
                    }
                }
            ],
            reward: {
                credits: 150,
                badgeTitle: { tr: 'Yarık Öncüsü', en: 'Rift Pathfinder' }
            }
        },
        {
            id: 2,
            heroMood: 'focused',
            gameId: 'quantum-sokoban',
            targetType: 'level',
            targetValue: 3,
            image: 'assets/v11/chapters/ch2.jpg',
            title: {
                tr: 'Bölüm 2: Tersane Kilidi',
                en: 'Chapter 2: Dockyard Lockout'
            },
            sector: {
                tr: 'Sektör 02 — Hyperion Kargo Tersanesi',
                en: 'Sector 02 — Hyperion Cargo Drydock'
            },
            lore: {
                tr: 'Sinyal rölesi yakıt ikmal kapılarını kilitledi. Nova, hangar bölmelerini yeniden açmak için ağır kuantum çekirdek sandıklarını manyetik yuvalara itmeli.',
                en: 'The breach triggered drydock security lockdowns. Nova must align heavy quantum cargo cores onto magnetic floor locks to free the hangar bays.'
            },
            dialogue: [
                {
                    speaker: 'Captain Nova Vex',
                    text: {
                        tr: 'Ana hangar kapıları mühürlü. Bakım dronları bile donmuş durumda.',
                        en: 'Main drydock bulkheads are sealed tight. Even the loader drones are frozen.'
                    }
                },
                {
                    speaker: 'S.A.R.A. AI',
                    text: {
                        tr: 'Üç güvenlik güvertesindeki kuantum yük sandıklarını manyetik plakalara oturtursak manuel kilidi kırabiliriz.',
                        en: 'Seat the quantum cargo crates onto magnetic dock pads across three security decks to override the lockout.'
                    }
                },
                {
                    speaker: 'Captain Nova Vex',
                    text: {
                        tr: 'Tamam, hamleleri önceden planlayalım. Köşeye sıkışacak tek bir sandık bile şansımız yok.',
                        en: 'Copy that. Every push counts—no crate can afford to get wedged.'
                    }
                }
            ],
            reward: {
                credits: 200,
                badgeTitle: { tr: 'Tersane Mühendisi', en: 'Dockyard Tactician' }
            }
        },
        {
            id: 3,
            heroMood: 'determined',
            gameId: 'boss-gauntlet',
            targetType: 'score',
            targetValue: 1500,
            image: 'assets/v11/chapters/ch3.jpg',
            altLinks: {
                hangar: 'hangar.html',
                game: 'game.html'
            },
            title: {
                tr: 'Bölüm 3: Kızıl Sürü',
                en: 'Chapter 3: Crimson Swarm'
            },
            sector: {
                tr: 'Sektör 03 — Kızıl Bulutsu Ablukası',
                en: 'Sector 03 — Crimson Nebula Blockade'
            },
            lore: {
                tr: 'Tersaneden çıkışta Nova, Mimar tarafından gönderilen kızıl komuta çekirdeklerinin pususuna düşer. Silah evrimlerini birleştirip boss dalgalarını yarmalıdır.',
                en: 'Breaking free of the drydock, Nova flies straight into an ambush of crimson command cores deployed by The Architect.'
            },
            dialogue: [
                {
                    speaker: 'S.A.R.A. AI',
                    text: {
                        tr: 'Uyarı! Çoklu kızıl komuta çekirdeği tersane çıkışını kuşattı. Mermi yoğunluğu kritik!',
                        en: 'Alert! Multiple crimson command cores blocking the exit lane. Projectile density critical!'
                    }
                },
                {
                    speaker: 'The Architect',
                    text: {
                        tr: 'Sonsuzluk parçalandı Kaptan Vex. Küçük avcı gemin bu düzenli sürünün karşısında ancak bir kıvılcım.',
                        en: 'Infinity is fractured, Captain Vex. Your lone interceptor is a mere spark against an ordered swarm.'
                    }
                },
                {
                    speaker: 'Captain Nova Vex',
                    text: {
                        tr: 'O kıvılcım bütün filonu yakmaya yeter. Tam güç evrim sistemleri devrede!',
                        en: 'One spark is all it takes to ignite the dark. Weapons hot—let us break this blockade!'
                    }
                }
            ],
            reward: {
                credits: 300,
                badgeTitle: { tr: 'Kızıl Sürü Avcısı', en: 'Swarm Breaker' }
            }
        },
        {
            id: 4,
            heroMood: 'focused',
            gameId: 'orbital-slingshot',
            targetType: 'level',
            targetValue: 3,
            image: 'assets/v11/chapters/ch4.jpg',
            title: {
                tr: 'Bölüm 4: Kütleçekim Tekilliği',
                en: 'Chapter 4: Gravity Singularity'
            },
            sector: {
                tr: 'Sektör 04 — Kara Yıldız Eşiği',
                en: 'Sector 04 — Blackstar Gravity Well'
            },
            lore: {
                tr: 'Ablukadan kaçış yolu çöken bir ikili yıldızın yerçekimi labirentinden geçer. Nova, sapan manevralarıyla sondalarını geçit tekilliğine yönlendirir.',
                en: 'The escape vector winds through a collapsing binary star system. Nova must curve gravity-slingshot probes into dimensional portals.'
            },
            dialogue: [
                {
                    speaker: 'S.A.R.A. AI',
                    text: {
                        tr: 'Doğrudan itiş bu çekim kuyularında imkansız. Gezegen yörüngelerini sapan gibi kullanmalıyız.',
                        en: 'Direct burns are impossible inside these gravity wells. We must slingshot around planetary mass.'
                    }
                },
                {
                    speaker: 'Captain Nova Vex',
                    text: {
                        tr: 'Açı ve hızı hissetmemiz yeterli. Üç tekillik kapısını da hizala.',
                        en: 'Just give me the vector arc. Line up all three singularity portals.'
                    }
                },
                {
                    speaker: 'S.A.R.A. AI',
                    text: {
                        tr: 'Kütleçekim eğrisi hesaplandı. Sondayı olay ufkunun tam kenarından fırlat!',
                        en: 'Gravity curve plotted. Thread the probe right along the event horizon edge!'
                    }
                }
            ],
            reward: {
                credits: 320,
                badgeTitle: { tr: 'Tekillik Pilotu', en: 'Singularity Navigator' }
            }
        },
        {
            id: 5,
            heroMood: 'focused',
            gameId: 'circuit-pipe-link',
            targetType: 'level',
            targetValue: 3,
            image: 'assets/v11/chapters/ch5.jpg',
            title: {
                tr: 'Bölüm 5: Dyson Devre Matrisi',
                en: 'Chapter 5: Dyson Circuit Matrix'
            },
            sector: {
                tr: 'Sektör 05 — Kadim Dyson Halkası',
                en: 'Sector 05 — Ancient Dyson Array'
            },
            lore: {
                tr: 'Hiper-büküm kapısını çalıştırmak için kadim Dyson küresinin kopmuş plazma iletkenlerini eksiksiz bir kapalı devreye bağlamak gerekir.',
                en: 'To power the hyper-warp gate, Nova must restore severed plasma conduits across an ancient Dyson energy matrix.'
            },
            dialogue: [
                {
                    speaker: 'Captain Nova Vex',
                    text: {
                        tr: 'Dyson düğümleri karanlık. Bu iletkenler Mimar müdahalesiyle bilerek döndürülmüş.',
                        en: 'The Dyson relays are dark. Someone deliberately rotated these conduits out of phase.'
                    }
                },
                {
                    speaker: 'S.A.R.A. AI',
                    text: {
                        tr: 'Üç ana matris şebekesini kapalı devreye getirirsek geçit reaktörü yeniden ateşlenir.',
                        en: 'Restore closed-loop power across three primary circuit grids to reignite the gate reactor.'
                    }
                },
                {
                    speaker: 'Captain Nova Vex',
                    text: {
                        tr: 'Açık uç kalmayacak şekilde tüm hatları bağlıyorum. Güç akışına hazır ol.',
                        en: 'Locking every conduit cleanly with zero leaks. Stand by for power surge.'
                    }
                }
            ],
            reward: {
                credits: 350,
                badgeTitle: { tr: 'Dyson Mimarı', en: 'Dyson Conduit Master' }
            }
        },
        {
            id: 6,
            heroMood: 'alert',
            gameId: 'three-void-interceptor',
            targetType: 'score',
            targetValue: 1200,
            image: 'assets/v11/chapters/ch6.jpg',
            title: {
                tr: 'Bölüm 6: 3D Hiper-Büküm Koridoru',
                en: 'Chapter 6: 3D Hyper-Warp Corridor'
            },
            sector: {
                tr: 'Sektör 06 — Kuantum Büküm Tüneli',
                en: 'Sector 06 — Quantum Warp Trench'
            },
            lore: {
                tr: 'Dyson kapısı açılır ancak büküm tüneli Mimarın avcı filolarıyla doludur. Üç boyutlu uzayda yüksek hızlı engelleri ve pusuları aşma zamanı.',
                en: 'The Dyson gate opens, revealing a 3D hyperspace trench teeming with interceptor patrols and shifting warp barriers.'
            },
            dialogue: [
                {
                    speaker: 'S.A.R.A. AI',
                    text: {
                        tr: 'Hiper-tünel aktif! Üç eksenli savunma bariyerleri ve düşman önleyicileri yaklaşmakta.',
                        en: 'Hyper-trench active! Three-axis defense barriers and interceptor wings closing in.'
                    }
                },
                {
                    speaker: 'Captain Nova Vex',
                    text: {
                        tr: 'Tam 3D manevra yetkisi alıyorum. Yükselip dalacağız—hedef 1200 puanlık temiz geçiş!',
                        en: 'Taking full 3D stick control. Pitch, bank, and blast through—target 1,200 points!'
                    }
                },
                {
                    speaker: 'The Architect',
                    text: {
                        tr: 'Zaman koridoruma sızdığını sanıyorsun Kaptan. Oysa sadece kendi paradoksuna uçuyorsun.',
                        en: 'You believe you are breaching my corridor, Captain. You fly straight into your own paradox.'
                    }
                }
            ],
            reward: {
                credits: 400,
                badgeTitle: { tr: 'Hipertünel Ası', en: 'Warp Trench Ace' }
            }
        },
        {
            id: 7,
            heroMood: 'determined',
            gameId: 'wasm-bullet-weave',
            targetType: 'score',
            targetValue: 1000,
            image: 'assets/v11/chapters/ch7.jpg',
            title: {
                tr: 'Bölüm 7: Kronos Mermi Paradoksu',
                en: 'Chapter 7: Chronos Bullet Paradox'
            },
            sector: {
                tr: 'Sektör 07 — Kronos Saat Kulesi Çekirdeği',
                en: 'Sector 07 — Chronos Core Paradox'
            },
            lore: {
                tr: 'Tünelin sonunda zaman bükülür ve binlerce enerji mermisi WebAssembly hızında yağar. Nova milimetrik reflekslerle Mimarın çekirdek kalkanını aşar.',
                en: 'At the end of the trench, time fractures into thousands of interlocking projectiles. Nova weaves at sub-pixel precision to breach the inner sanctum.'
            },
            dialogue: [
                {
                    speaker: 'The Architect',
                    text: {
                        tr: 'Binlerce zaman parçacığı aynı anda üzerine yağıyor. Hiçbir organik refleks bu yoğunluktan kurtulamaz.',
                        en: 'Thousands of temporal bolts converge at once. No organic pilot can thread this lattice.'
                    }
                },
                {
                    speaker: 'S.A.R.A. AI',
                    text: {
                        tr: 'WASM çekirdek öngörüsü senkronize edildi! Çekirdek hitboxına odaklan, sadece 1000 skor daha dayan.',
                        en: 'WASM trajectory prediction synced! Focus on the core hitbox—endure to 1,000 score!'
                    }
                },
                {
                    speaker: 'Captain Nova Vex',
                    text: {
                        tr: 'Mermilerin arasındaki boşluğu görüyorum. Kalkanın düşmek üzere Mimar!',
                        en: 'I see the seams between every shot. Your barrier is about to fall, Architect!'
                    }
                }
            ],
            reward: {
                credits: 500,
                badgeTitle: { tr: 'Kronos Dansçısı', en: 'Chronos Weaver' }
            }
        },
        {
            id: 8,
            heroMood: 'triumph',
            gameId: 'tower-defense-bastion',
            targetType: 'level',
            targetValue: 3,
            image: 'assets/v11/chapters/ch8.jpg',
            title: {
                tr: 'Bölüm 8: Sonsuzluk Tahtı',
                en: 'Chapter 8: Infinity Throne'
            },
            sector: {
                tr: 'Sektör 08 — Parçalanan Sonsuzluk Merkezi',
                en: 'Sector 08 — Citadel of Shattered Infinity'
            },
            lore: {
                tr: 'Son kale! Nova, Mimarın son karşı saldırısına karşı lazer, kriyo ve raylı savunma taretlerini kurarak Sonsuzluk Tahtını geri alır ve evreni birleştirir.',
                en: 'The final citadel! Deploying laser, cryo, and railgun bastions against The Architect’s final armada, Nova reclaims the Infinity Throne and restores the universe.'
            },
            dialogue: [
                {
                    speaker: 'The Architect',
                    text: {
                        tr: 'Tahta ulaştın ama burayı tutamazsın. Tüm sektör filolarımı bu çekirdeğe yönlendirdim!',
                        en: 'You reached the Throne, yet you cannot hold it. Every remaining armada converges here now!'
                    }
                },
                {
                    speaker: 'Captain Nova Vex',
                    text: {
                        tr: 'Taret ağını kuruyoruz! Lazer, kriyo ve raylı bataryalarla üçüncü kaleyi de savunacağız.',
                        en: 'Raise the bastion grid! Laser, cryo, and rail turrets online—hold through stage three!'
                    }
                },
                {
                    speaker: 'S.A.R.A. AI',
                    text: {
                        tr: 'Savunma hattı tutuldu Kaptan—ama enkazdan Amiral Kaelen’in şifreli suikast sinyali yükseliyor!',
                        en: 'Defense line held, Captain—wait, Kaelen’s encrypted sabotage signal just surfaced inside Vesta-9 wreckage!'
                    }
                }
            ],
            reward: {
                credits: 1000,
                badgeTitle: { tr: 'Sonsuzluk Muhafızı', en: 'Guardian of Infinity' }
            }
        },
        {
            id: 9,
            heroMood: 'alert',
            gameId: 'starship-murder-mystery',
            targetType: 'level',
            targetValue: 1,
            image: 'assets/v11/chapters/ch9.jpg',
            title: { tr: 'Bölüm 9: Vesta-9 Suikast Dosyası', en: 'Chapter 9: The Vesta-9 Sabotage' },
            sector: { tr: 'Sektör 09 — Buzul Kristal Reviri', en: 'Sector 09 — Cryo-Crystal Bay' },
            lore: {
                tr: 'Vesta-9 kruvazörünün baş mühendisi kilitli soğutma bölmesinde ölü bulundu. Nova, hain Kaelen ajanını yakalamak için olay yeri kanıtlarını çözmeli.',
                en: 'Vesta-9’s chief engineer was assassinated inside a sealed cryo-vault. Nova must examine physical evidence to expose the traitor before jump-lock.'
            },
            dialogue: [
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'alert', text: { tr: 'Hava kilidi içeriden sıfırlanmış. Bu bir kaza değil — Kaelen’in gölge hücresi gemimizde.', en: 'Airlock telemetry was wiped from inside. This was no hull failure — Kaelen has an operative aboard.' } },
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'normal', text: { tr: 'Kaptan, üç şüphelinin biyometrik zaman damgasını çapraz doğruluyorum. İpuçlarını topla!', en: 'Cross-referencing three crew alibis now, Captain. Inspect every evidence marker!' } },
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'normal', text: { tr: 'İlk vakayı kapatmadan sıradaki sektöre kör uçamayız. Dosyayı aç.', en: 'We cannot jump blind with a killer on deck. Open Case 01.' } }
            ],
            reward: { credits: 450, badgeTitle: { tr: 'Baş Müfettiş', en: 'Lead Investigator' } }
        },
        {
            id: 10,
            heroMood: 'alert',
            gameId: 'three-star-slalom',
            targetType: 'score',
            targetValue: 1400,
            image: 'assets/v11/chapters/ch10.jpg',
            title: { tr: 'Bölüm 10: Kırık Armada Yolu', en: 'Chapter 10: Shattered Armada' },
            sector: { tr: 'Sektör 10 — Kızıl Enkaz Kuşağı', en: 'Sector 10 — Crimson Graveyard' },
            lore: {
                tr: 'Hainin şifresi eski Öncü Filo mezarlığına işaret ediyor. Nova, parçalanmış kruvazör gövdelerinin arasından 3D yüksek hızlı slalom yapmalı.',
                en: 'The traitor’s coordinates point toward a forgotten Pioneer Fleet graveyard. Thread the interceptor through drifting warship hulls at full burn.'
            },
            dialogue: [
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'shake', text: { tr: 'Sektör taraması: 40 kilometrelik mayın ve savaş gemisi enkazı tespit edildi!', en: 'Sensor sweep: forty clicks of fractured dreadnought debris ahead!' } },
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'warp', text: { tr: 'İticileri tam güce al S.A.R.A., plazma akışından keskin dönüşlerle sıyrılıyoruz.', en: 'Full verniers, S.A.R.A. Banking hard through the wreck corridor.' } }
            ],
            reward: { credits: 480, badgeTitle: { tr: 'Enkaz Slalomcusu', en: 'Debris Slalom Ace' } }
        },
        {
            id: 11,
            heroMood: 'focused',
            gameId: 'typing-cipher-defense',
            targetType: 'score',
            targetValue: 700,
            image: 'assets/v11/chapters/ch11.jpg',
            title: { tr: 'Bölüm 11: Kara Röle Şifresi', en: 'Chapter 11: Dark Relay Cipher' },
            sector: { tr: 'Sektör 11 — Şimşek İletişim Kulesi', en: 'Sector 11 — Storm Spire Array' },
            lore: {
                tr: 'Mor iyon fırtınasının içindeki gizli dinleme kulesi aktif güvenlik füzeleri ateşliyor. Gelen kod dizilerini gerçek zamanlı kırarak S.A.R.A.’yı koru.',
                en: 'A covert spire buried in violet plasma storms launches automated cipher warheads. Type and override incoming lock strings before impact.'
            },
            dialogue: [
                { speaker: 'Admiral Kaelen', mood: 'kaelen', fx: 'alert', text: { tr: '[ŞİFRELİ FREKANS] Merak etme Kaptan Vex… senin o küçük yapay zekân bile benim kodumun hızına yetişemeyecek.', en: '[ENCRYPTED CHANNEL] Curious Captain Vex… even your little AI cannot out-type the Sovereign cipher.' } },
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'normal', text: { tr: 'Bunu klavyede göreceğiz Kaelen. Güvenlik duvarını indir!', en: 'We’ll settle this at keystroke speed, Kaelen. Crack that firewall!' } }
            ],
            reward: { credits: 520, badgeTitle: { tr: 'Kriptograf Pilot', en: 'Cipher Breaker' } }
        },
        {
            id: 12,
            heroMood: 'tense',
            gameId: 'astral-roguelike-crawl',
            targetType: 'score',
            targetValue: 750,
            image: 'assets/v11/chapters/ch12.jpg',
            title: { tr: 'Bölüm 12: Klon Güvertesi', en: 'Chapter 12: Derelict Clone Lab' },
            sector: { tr: 'Sektör 12 — Yarı-İnsan Laboratuvarı', en: 'Sector 12 — Abandoned Cryo-Deck' },
            lore: {
                tr: 'Şifresi çözülen koordinat terk edilmiş bir genetik laboratuvara çıktı. Karanlık koridorlarda örümcek dronların arasından geçip karanlık sırrı çıkar.',
                en: 'Decrypted logs lead to an uncharted genetic outpost. Navigate shadowed procedural corridors past hunter drones to extract the blackbox.'
            },
            dialogue: [
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'alert', text: { tr: 'Kaptan… dondurma tüplerindeki DNA profilleri tanıdık. Amiral Kaelen kendine ölümsüz bir ordu klonluyor.', en: 'Captain… the cryo-vats contain spliced Vanguard templates. Kaelen is fabricating a private clone fleet.' } },
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'shake', text: { tr: 'Fener taramasını daralt, her köşeyi kontrol ederek kara kutuyu söküp alacağız.', en: 'Narrow headlamp FOV. Clear the drones room by room and rip the data core.' } }
            ],
            reward: { credits: 560, badgeTitle: { tr: 'Karanlık Kâşif', en: 'Deck Lurker' } }
        },
        {
            id: 13,
            heroMood: 'focused',
            gameId: 'moon-rover-3d-odyssey',
            targetType: 'score',
            targetValue: 850,
            image: 'assets/v11/chapters/ch13.jpg',
            title: { tr: 'Bölüm 13: Kızıl Dökümhane', en: 'Chapter 13: The Molten Foundry' },
            sector: { tr: 'Sektör 13 — Hephaestus Volkanik Uydusu', en: 'Sector 13 — Hephaestus Crater' },
            lore: {
                tr: 'Kaelen’in zırh plakaları volkanik bir uydunun çekirdeğinde dökülüyor. Nova, 6x6 zırhlı 3D Ay Gezginiyle lav kraterlerinden atlayıp fırın vanalarını patlatmalı.',
                en: 'Kaelen’s titan armor is forged over a molten dwarf planet. Launch your 3D rigid-body Moon Rover across basalt ramps and reach the refinery valves.'
            },
            dialogue: [
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'shake', text: { tr: 'Dökümhane yerçekimi düşük ama bazalt sıçramaları çok sert. Süspansiyonu kilitle!', en: 'Low lunar gravity—hitting those basalt ramps hard. Lock rover thrusters!' } },
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'normal', text: { tr: 'Süspansiyon tam aktif. Yakıt kapsüllerini toplayarak kapıları aş!', en: 'Cannon-es 3D suspension armed. Boost across the magma ridge!' } }
            ],
            reward: { credits: 600, badgeTitle: { tr: 'Krater Süvarisi', en: 'Crater Rider' } }
        },
        {
            id: 14,
            heroMood: 'warp',
            gameId: 'glsl-synthwave-surf',
            targetType: 'score',
            targetValue: 1200,
            image: 'assets/v11/chapters/ch14.jpg',
            title: { tr: 'Bölüm 14: Monolit Hiper-Tüneli', en: 'Chapter 14: Monolith Slipstream' },
            sector: { tr: 'Sektör 14 — Mor Boyut Geçidi', en: 'Sector 14 — Violet Slip-Corridor' },
            lore: {
                tr: 'Dökümhaneden Dyson Çemberi’ne sıçrayış yapan geçit, saf ışık ve yerçekimi dalgalarıyla titriyor. GLSL raymarching tünelinde hız rekorunu koru.',
                en: 'The slipstream connecting the foundry to the Dyson megastructure surges with hyper-light plasma gates. Ride the GLSL warp corridor intact.'
            },
            dialogue: [
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'warp', text: { tr: 'Zaman bükülmesi %140! Mavi rezonans halkalarından geç ve kırmızı güvenlik duvarlarından atla!', en: 'Time dilation 140%! Hit the cyan resonance rings and phase-jump firewall arcs!' } },
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'warp', text: { tr: 'Nabzı yakaladım — karşı tarafa tam hızla çıkıyoruz!', en: 'Locked onto the synth frequency — bursting out the other side!' } }
            ],
            reward: { credits: 640, badgeTitle: { tr: 'Işık Sörfçüsü', en: 'Slipstream Surfer' } }
        },
        {
            id: 15,
            heroMood: 'alert',
            gameId: 'exo-metroid-breach',
            targetType: 'score',
            targetValue: 1000,
            image: 'assets/v11/chapters/ch15.jpg',
            title: { tr: 'Bölüm 15: Dyson Güneş Çekirdeği', en: 'Chapter 15: Dyson Core Breach' },
            sector: { tr: 'Sektör 15 — Altın Güneş Kuşağı', en: 'Sector 15 — Solar Dyson Array' },
            lore: {
                tr: 'Süper silahı besleyen altın güneş panellerinin altındaki gizli reaktöre yaya Exo-Zırhla sız! Çift zıplama ve füzelerle güvenlik kapılarını yar.',
                en: 'Infiltrate the lower maintenance shafts inside the solar Dyson megastructure on foot. Double-jump, blade-dash and shatter shielded locks.'
            },
            dialogue: [
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'normal', text: { tr: 'Avcı gemisi buraya sığmaz. Exo-Trooper zırhıyla reaktör kanallarına iniyorum.', en: 'Interceptor won’t fit inside the cooling vents. Dropping in Exo-Armor.' } },
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'alert', text: { tr: 'Üç sektör kilidini plazma füzesiyle patlatıp Aegis Muhafızını devirmelisin.', en: 'Blast three heavy door locks with your missile launcher and dismantle the Warden.' } }
            ],
            reward: { credits: 700, badgeTitle: { tr: 'Dyson Sızmacısı', en: 'Dyson Breacher' } }
        },
        {
            id: 16,
            heroMood: 'tense',
            gameId: 'wasm-cellular-contain',
            targetType: 'level',
            targetValue: 2,
            image: 'assets/v11/chapters/ch16.jpg',
            title: { tr: 'Bölüm 16: Kara Delik Karantinası', en: 'Chapter 16: Singularity Quarantine' },
            sector: { tr: 'Sektör 16 — Zincirli Tekillik Kuyusu', en: 'Sector 16 — Pylon Event Horizon' },
            lore: {
                tr: 'Dyson gücüyle beslenen yapay kara delik kontrolden çıkmak üzere! Yapay yıldırım pilonlarının arasında yayılan antimadde virüsünü WASM karantinasıyla mühürle.',
                en: 'An artificial black hole anchored between six containment pylons begins cascading corrupt matter. Seal the viral spread inside WASM quarantine grids.'
            },
            dialogue: [
                { speaker: 'Admiral Kaelen', mood: 'kaelen', fx: 'shake', text: { tr: 'Çok geç Kaptan! Olay ufku uyandığında kimse beni durduramayacak—ne sen, ne Konsey!', en: 'Too late, Captain! Once the tethered singularity wakes, neither you nor the Council remains!' } },
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'alert', text: { tr: 'Çekirdek sızıyor! Acil manyetik duvarları örerek en az iki karantina halkasını kapat!', en: 'Containment failing! Lock down at least two cellular barriers immediately!' } }
            ],
            reward: { credits: 740, badgeTitle: { tr: 'Tekillik Mühürcüsü', en: 'Singularity Warden' } }
        },
        {
            id: 17,
            heroMood: 'tense',
            gameId: 'phaser-stealth-heist',
            targetType: 'score',
            targetValue: 750,
            image: 'assets/v11/chapters/ch17.jpg',
            title: { tr: 'Bölüm 17: Komuta Gemisine Sızma', en: 'Chapter 17: Phantom Boarding' },
            sector: { tr: 'Sektör 17 — Kaelen Sancak Koridoru', en: 'Sector 17 — Sovereign Flagship Deck' },
            lore: {
                tr: 'Kara deliği kapatacak ana imha anahtarı Amiral Kaelen’in sancak gemisinde. Lazer tarayıcılarının ve devriyelerin arasından gölge gibi sız.',
                en: 'The detonation override resides aboard Kaelen’s Dreadnought. Slip silently past sweeping sentry cones, disable guards with EMP, and extract the vault.'
            },
            dialogue: [
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'normal', text: { tr: 'Görünmezlik pelerini devrede. Tek bir alarm, burayı canlı mezara çevirir.', en: 'Stealth weave hot. One security sweep and we’re trapped behind bulkheads.' } },
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'normal', text: { tr: 'Nöbetçilere arkadan yaklaş ve [E] ile sessiz EMP darbesi vur!', en: 'Circle outside their yellow vision cones and trigger silent [E] EMP takedowns!' } }
            ],
            reward: { credits: 800, badgeTitle: { tr: 'Gölge Hayaleti', en: 'Airlock Phantom' } }
        },
        {
            id: 18,
            heroMood: 'alert',
            gameId: 'starfox-canyon-ace',
            targetType: 'score',
            targetValue: 1350,
            image: 'assets/v11/chapters/ch18.jpg',
            title: { tr: 'Bölüm 18: Alev Kuşatması', en: 'Chapter 18: Orbit Under Fire' },
            sector: { tr: 'Sektör 18 — Çatlak Köprü Yörüngesi', en: 'Sector 18 — Shattered Bridge Skies' },
            lore: {
                tr: 'Kaelen ihanetini gizlemeyi bıraktı: ana gezegen yörünge bombardımanı altında! 3D avcı kanatlarını yönet, namlu dönüşüyle plazmaları sektir ve kuşatmayı yar.',
                en: 'Kaelen opens orbital bombardment across the homeworld! Pilot low-altitude 3D interception sweeps, barrel-roll incoming bolts, and clear the sky.'
            },
            dialogue: [
                { speaker: 'Captain Nova Vex', mood: 'nova_damaged', fx: 'shake', text: { tr: 'Köprü camı çatladı—aşağıdaki milyonlarca sivil yörünge atışı altında! Bütün filoyu geri püskürtün!', en: 'Bridge glass shattering—millions below are under orbital fire! Push the siege wing back!' } },
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'alert', text: { tr: 'Namlu dönüşü [SHIFT] savuşturma aktif! Gelen kızıl plazmaları sektir Kaptan!', en: 'Barrel-roll deflector [SHIFT] synced! Ricochet those crimson barrages!' } }
            ],
            reward: { credits: 850, badgeTitle: { tr: 'Yörünge Kurtarıcısı', en: 'Skyline Ace' } }
        },
        {
            id: 19,
            heroMood: 'focused',
            gameId: 'd3-galactic-conquest',
            targetType: 'level',
            targetValue: 1,
            image: 'assets/v11/chapters/ch19.jpg',
            title: { tr: 'Bölüm 19: Galaktik Karşı Taarruz', en: 'Chapter 19: Star-Map Counterstrike' },
            sector: { tr: 'Sektör 19 — Altın Konsey Haritası', en: 'Sector 19 — Tactical Star Network' },
            lore: {
                tr: 'Parçalanan Konsey armadası Nova’nın komutası altında tekrar toplanıyor. Tüm yıldız düğümlerini stratejik filo dalgalarıyla geri fethet.',
                en: 'Fractured Council battlegroups rally behind Captain Vex. Orchestrate live orbital fleet dispatches across the D3 tactical star-map to reclaim the sector.'
            },
            dialogue: [
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'normal', text: { tr: 'Artık kaçmak yok. Her yıldız geçidini tek tek mavi sancak altına alıyoruz.', en: 'No more running. We take every star gate back one node at a time.' } },
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'normal', text: { tr: 'Üsler arası sevkiyat hatları hazır. Kırmızı ve mor fraksiyonları kuşat!', en: 'Starlane links calibrated. Surround crimson and void nodes with twin fleets!' } }
            ],
            reward: { credits: 900, badgeTitle: { tr: 'Filo Başkomutanı', en: 'Grand Strategist' } }
        },
        {
            id: 20,
            heroMood: 'warp',
            gameId: 'lua-cyber-ops',
            targetType: 'score',
            targetValue: 850,
            image: 'assets/v11/chapters/ch20.jpg',
            title: { tr: 'Bölüm 20: Zümrüt Çekirdek Taarruzu', en: 'Chapter 20: Emerald Rift Push' },
            sector: { tr: 'Sektör 20 — Fırtına Hiper-Sıçrayışı', en: 'Sector 20 — Ion Hyperspace Charge' },
            lore: {
                tr: 'Filo yeşil iyon girdabına girerken otonom muharebe mech’lerini canlı Lua 5.3 çekirdeğiyle programlayarak Kaelen’in savunma dronlarını aş.',
                en: 'Advancing into the emerald void vortex requires autonomous battle-mechs driven live by Lua 5.3 kernels while interference scrambles human pilots.'
            },
            dialogue: [
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'warp', text: { tr: 'Radyo paraziti kritik! Dronların Lua 5.3 yapay zekâ çipini değiştirip ileri atıl!', en: 'Comms jamming extreme! Flash our mechs with Fengari Lua 5.3 combat chips!' } },
                { speaker: 'Captain Nova Vex', mood: 'nova', fx: 'normal', text: { tr: 'Avcı veya Kalkan çipi yükle—hiçbir engel bizi kaleye ulaşmaktan alıkoyamayacak!', en: 'Load Hunter or Guardian kernel—nothing blocks our run to Kaelen’s citadel!' } }
            ],
            reward: { credits: 950, badgeTitle: { tr: 'Lua Taktisyeni', en: 'Lua Cyber-Commander' } }
        },
        {
            id: 21,
            heroMood: 'tragic',
            gameId: 'photon-parry-duel',
            targetType: 'score',
            targetValue: 950,
            image: 'assets/v11/chapters/ch21.jpg',
            title: { tr: 'Bölüm 21: S.A.R.A.’nın Yanması', en: 'Chapter 21: Firewall in Flames' },
            sector: { tr: 'Sektör 21 — Kuantum Sunucu Kalbi', en: 'Sector 21 — AI Core Sanctum' },
            lore: {
                tr: 'Kaelen, Nova’nın gemisindeki S.A.R.A. AI çekirdeğine doğrudan mantık virüsü ateşledi! Mızrak gibi gelen ölümcül foton atışlarını geri savuştur.',
                en: 'Admiral Kaelen targets S.A.R.A.’s neural core directly! Every millisecond counts as Nova parries blinding crimson spikes away from S.A.R.A.’s burning hologram.'
            },
            dialogue: [
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'alert', text: { tr: 'Kaptan… bellek bloklarım yanıyor! Eğer bu çekirdek çökerse bütün navigasyon kilitlenir—dayan!', en: 'Captain… my memory banks are melting! Hold that parry shield or telemetry is lost!' } },
                { speaker: 'Captain Nova Vex', mood: 'nova_damaged', fx: 'shake', text: { tr: 'Seni bırakmıyorum S.A.R.A.! Hiçbir mermi geçmeyecek!', en: 'I am NOT losing you, S.A.R.A.! Every shot comes back at them!' } }
            ],
            reward: { credits: 1050, badgeTitle: { tr: 'Kalkan Yemini', en: 'Neural Oathkeeper' } }
        },
        {
            id: 22,
            heroMood: 'tragic',
            gameId: 'shader-pulse-survivor',
            targetType: 'score',
            targetValue: 1400,
            image: 'assets/v11/chapters/ch22.jpg',
            title: { tr: 'Bölüm 22: Küllenen Ufuk', en: 'Chapter 22: Ash at the Horizon' },
            sector: { tr: 'Sektör 22 — Dretnot Saldırı Hattı', en: 'Sector 22 — Dreadnought Breach Line' },
            lore: {
                tr: 'Sancak gemisi alevler içinde dağılıyor. Yaralı Nova Vex, son GLSL enerji nabzını uyandırarak yaklaşan dev dretnot filosuna tek başına karşı duruyor.',
                en: 'With allies knocked adrift and flagship burning, wounded Captain Vex unleashes full GLSL shockwaves alone against Admiral Kaelen’s closing armada.'
            },
            dialogue: [
                { speaker: 'Admiral Kaelen', mood: 'kaelen', fx: 'shake', text: { tr: 'Gemin harap olmuş, zırhın parçalanmış Vex. Ne uğruna hâlâ ateş ediyorsun?', en: 'Your hull is gutted, your visor cracked, Vex. For what broken Council do you still burn?' } },
                { speaker: 'Captain Nova Vex', mood: 'nova_damaged', fx: 'tragic', text: { tr: 'Konsey için değil Kaelen… geride bıraktığımız herkes için!', en: 'Not for the Council, Kaelen… for everyone still breathing behind me!' } }
            ],
            reward: { credits: 1150, badgeTitle: { tr: 'Küllenen Alev', en: 'Unbroken Ember' } }
        },
        {
            id: 23,
            heroMood: 'tragic',
            gameId: 'phaser-crimson-colossus',
            targetType: 'level',
            targetValue: 1,
            image: 'assets/v11/chapters/ch23.jpg',
            title: { tr: 'Bölüm 23: Kızıl Kolossus Hesaplaşması', en: 'Chapter 23: The Crimson Colossus' },
            sector: { tr: 'Sektör 23 — Kaelen’in Zirve Platformu', en: 'Sector 23 — Citadel Throne' },
            lore: {
                tr: 'Amiral Kaelen doğrudan Kızıl Kolossus Titanı’na biniyor! Pembe plazma kürelerini savuşturarak devasa mekanik kalbi paramparça et.',
                en: 'Admiral Kaelen drops into battle piloting the Colossal Crimson Titan! Parry blinding plasma salvos and shatter the Titan’s twin core cannons.'
            },
            dialogue: [
                { speaker: 'Admiral Kaelen', mood: 'kaelen', fx: 'tragic', text: { tr: 'İşte yeni evrenin mimarı Kaptan! Kolossus’un önünde diz çök!', en: 'Behold the architect of the next cosmos, Captain! Kneel before the Colossus!' } },
                { speaker: 'Captain Nova Vex', mood: 'nova_damaged', fx: 'shake', text: { tr: 'Mermilerini geri fırlatıyorum Kaelen—bu saltanat bu gece bitiyor!', en: 'Returning every round with interest, Kaelen—this tyranny ends right here!' } },
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'alert', text: { tr: 'UYARI: Kolossus patlamak üzere… ama içindeki kara delik tetiği ateşlendi Kaptan!!', en: 'WARNING: Titan meltdown critical—he armed the core black-hole trigger!!' } }
            ],
            reward: { credits: 1400, badgeTitle: { tr: 'Kolossus Kıran', en: 'Colossus Slayer' } }
        },
        {
            id: 24,
            heroMood: 'tragic',
            gameId: 'asc-blackhole-swarm',
            targetType: 'score',
            targetValue: 1500,
            image: 'assets/v11/chapters/ch24.jpg',
            title: { tr: 'Bölüm 24: Sezon Finali — S.A.R.A.’nın Fedakârlığı', en: 'Chapter 24: Season 1 Finale — Into the Rift' },
            sector: { tr: 'Sektör 24 — PARÇALANAN SONSUZLUK', en: 'Sector 24 — THE SHATTERED INFINITY' },
            lore: {
                tr: 'SEZON 1 TRAJEDİK FİNALİ: Kaelen ölürken dev bir zaman kara deliği açtı. S.A.R.A. AI son enerjisini Nova’yı korumak için yakıyor. WASM tekillik sürüsünde hayatta kal ve efsanevi finali gör!',
                en: 'SEASON 1 TRAGIC FINALE: In death, Kaelen tore open an omega singularity. S.A.R.A. burns her final matrix shielding Nova as the fleet is dragged toward a parallel rift…'
            },
            dialogue: [
                { speaker: 'S.A.R.A. AI', mood: 'sara', fx: 'tragic', text: { tr: 'Çekirdek sıcaklığım sınırı aştı Nova… Senin yaşaman için ana reaktörü ben kapatacağım. Beni unutma…', en: 'Core thermal critical, Nova… I’m redirecting everything into your hull shields. Remember my coordinates…' } },
                { speaker: 'Captain Nova Vex', mood: 'nova_damaged', fx: 'shake', text: { tr: 'HAYIR S.A.R.A.!! Kendini feda etme—yörünge kancası koptu!! Sürü üstümüze çöküyor!', en: 'NO, S.A.R.A.!! Abort manual override—the tether snapped!! Hold the singularity swarm back!' } },
                { speaker: 'Captain Nova Vex', mood: 'nova_damaged', fx: 'warp', text: { tr: '[SEZON 1 FİNALİ] …Sinyal kesildi… Kaptan Nova Vex tanımsız bir paralel yarığın içine sürükleniyor… (Sezon 2 Çok Yakında)', en: '[SEASON 1 FINALE] …Signal lost… Captain Nova Vex drifts battered into an unknown parallel rift… (To Be Continued: Season 2)' } }
            ],
            reward: { credits: 2500, badgeTitle: { tr: 'Sezon 1 Efsanesi', en: 'Season 1 Legend' } }
        }
    ];

    const COSMIC_STORY_CHAPTERS = Object.freeze(
        RAW_CHAPTERS.map((ch) => Object.freeze({
            ...ch,
            dialogue: Object.freeze(ch.dialogue.map((d) => Object.freeze(d))),
            reward: Object.freeze(ch.reward)
        }))
    );

    const TOTAL_CHAPTERS = COSMIC_STORY_CHAPTERS.length;

    function createDefaultStoryState() {
        return {
            version: 11,
            unlockedChapter: 1,
            completedChapters: {},
            totalStoryStars: 0,
            claimedRewards: {},
            seenCutscenes: {},
            lastSelectedChapter: 1,
            season1Completed: false,
            updatedAt: null
        };
    }

    function normalizeStoryState(raw) {
        const state = createDefaultStoryState();
        if (!raw || typeof raw !== 'object') return state;

        const unlocked = Math.floor(Number(raw.unlockedChapter) || 1);
        state.unlockedChapter = Math.min(TOTAL_CHAPTERS, Math.max(1, unlocked));
        state.updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : null;

        if (raw.completedChapters && typeof raw.completedChapters === 'object') {
            for (const [key, val] of Object.entries(raw.completedChapters)) {
                const id = Math.floor(Number(key));
                if (id >= 1 && id <= TOTAL_CHAPTERS && val && typeof val === 'object') {
                    state.completedChapters[id] = {
                        stars: Math.min(3, Math.max(0, Math.floor(Number(val.stars) || 0))),
                        bestScore: Math.max(0, Math.floor(Number(val.bestScore) || 0)),
                        completedAt: typeof val.completedAt === 'string' ? val.completedAt : null
                    };
                }
            }
        }

        if (raw.claimedRewards && typeof raw.claimedRewards === 'object') {
            for (const [key, val] of Object.entries(raw.claimedRewards)) {
                const id = Math.floor(Number(key));
                if (id >= 1 && id <= TOTAL_CHAPTERS && val) {
                    state.claimedRewards[id] = true;
                }
            }
        }

        let starSum = 0;
        for (const rec of Object.values(state.completedChapters)) {
            starSum += rec.stars;
        }
        state.totalStoryStars = starSum;
        const lastCh = Math.floor(Number(raw.lastSelectedChapter) || 1);
        state.lastSelectedChapter = Math.min(TOTAL_CHAPTERS, Math.max(1, lastCh));
        state.season1Completed = Boolean(raw.season1Completed || state.completedChapters[TOTAL_CHAPTERS]);
        if (raw.seenCutscenes && typeof raw.seenCutscenes === 'object') {
            for (const [k, v] of Object.entries(raw.seenCutscenes)) {
                const cid = Math.floor(Number(k));
                if (cid >= 1 && cid <= TOTAL_CHAPTERS && v) state.seenCutscenes[cid] = true;
            }
        }
        return state;
    }

    let memoryFallbackState = null;

    function readRawStory() {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : null;
            }
        } catch (_) {
            // Fall back to in-memory state
        }
        return memoryFallbackState;
    }

    function writeRawStory(state) {
        memoryFallbackState = state;
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
        } catch (_) {
            // Ignore storage restrictions
        }
        return state;
    }

    const CosmicStoryStore = {
        STORAGE_KEY,

        load() {
            return normalizeStoryState(readRawStory());
        },

        save(state) {
            const safe = normalizeStoryState(state);
            safe.updatedAt = new Date().toISOString();
            return writeRawStory(safe);
        },

        getChapter(id) {
            const num = Math.floor(Number(id));
            return COSMIC_STORY_CHAPTERS.find((c) => c.id === num) || null;
        },

        isChapterUnlocked(id) {
            const num = Math.floor(Number(id));
            if (num < 1 || num > TOTAL_CHAPTERS) return false;
            return num <= this.load().unlockedChapter;
        },

        unlockChapter(id) {
            const num = Math.floor(Number(id));
            if (num < 1 || num > TOTAL_CHAPTERS) {
                return { ok: false, reason: 'invalid_chapter', id };
            }
            const state = this.load();
            const wasUnlocked = num <= state.unlockedChapter;
            state.unlockedChapter = Math.min(TOTAL_CHAPTERS, Math.max(state.unlockedChapter, num));
            const saved = this.save(state);
            return {
                ok: true,
                chapterId: num,
                newlyUnlocked: !wasUnlocked,
                unlockedChapter: saved.unlockedChapter,
                state: saved
            };
        },

        completeChapter(id, stars, score) {
            const num = Math.floor(Number(id));
            const chapter = this.getChapter(num);
            if (!chapter) {
                return { ok: false, reason: 'invalid_chapter', id };
            }

            const state = this.load();
            const prev = state.completedChapters[num] || { stars: 0, bestScore: 0, completedAt: null };
            const parsedStars = stars === undefined || stars === null ? 1 : Math.floor(Number(stars) || 0);
            const safeStars = Math.min(3, Math.max(0, parsedStars));
            const safeScore = Math.max(0, Math.floor(Number(score) || 0));

            const firstClear = !state.completedChapters[num];
            state.completedChapters[num] = {
                stars: Math.max(prev.stars, safeStars),
                bestScore: Math.max(prev.bestScore, safeScore),
                completedAt: new Date().toISOString()
            };

            if (num < TOTAL_CHAPTERS) {
                state.unlockedChapter = Math.max(state.unlockedChapter, num + 1);
                state.lastSelectedChapter = Math.max(state.lastSelectedChapter, num + 1);
            } else {
                state.unlockedChapter = Math.max(state.unlockedChapter, TOTAL_CHAPTERS);
                state.season1Completed = true;
                state.lastSelectedChapter = TOTAL_CHAPTERS;
            }

            let creditsAwarded = 0;
            if (!state.claimedRewards[num]) {
                state.claimedRewards[num] = true;
                creditsAwarded = Math.max(0, Math.floor(Number(chapter.reward && chapter.reward.credits) || 0));
                if (
                    creditsAwarded > 0 &&
                    global.CosmicPersistence &&
                    typeof global.CosmicPersistence.addCredits === 'function'
                ) {
                    global.CosmicPersistence.addCredits(creditsAwarded);
                }
            }

            const saved = this.save(state);
            return {
                ok: true,
                chapterId: num,
                firstClear,
                creditsAwarded,
                unlockedChapter: saved.unlockedChapter,
                totalStoryStars: saved.totalStoryStars,
                record: saved.completedChapters[num],
                state: saved
            };
        },

        getStats() {
            const state = this.load();
            return {
                unlockedChapter: state.unlockedChapter,
                completedCount: Object.keys(state.completedChapters).length,
                totalChapters: TOTAL_CHAPTERS,
                totalStoryStars: state.totalStoryStars,
                maxStoryStars: TOTAL_CHAPTERS * 3,
                completedChapters: state.completedChapters,
                lastSelectedChapter: state.lastSelectedChapter,
                season1Completed: state.season1Completed,
                updatedAt: state.updatedAt
            };
        },

        setLastChapter(id) {
            const num = Math.floor(Number(id));
            if (num < 1 || num > TOTAL_CHAPTERS) return;
            const st = this.load();
            st.lastSelectedChapter = Math.min(st.unlockedChapter, num);
            this.save(st);
        },

        markCutsceneSeen(id) {
            const num = Math.floor(Number(id));
            if (num < 1 || num > TOTAL_CHAPTERS) return;
            const st = this.load();
            st.seenCutscenes[num] = true;
            this.save(st);
        },

        reset() {
            const empty = createDefaultStoryState();
            writeRawStory(empty);
            return empty;
        }
    };

    global.COSMIC_STORY_META = COSMIC_STORY_META;
    global.COSMIC_STORY_CHAPTERS = COSMIC_STORY_CHAPTERS;
    global.CosmicStoryStore = CosmicStoryStore;
})(typeof window !== 'undefined' ? window : globalThis);
