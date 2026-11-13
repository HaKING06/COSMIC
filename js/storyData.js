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
        totalChapters: 8
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
                        tr: 'Sonsuzluk çekirdeği yeniden senkronize oluyor. Bütün sektörlerde yıldız fenerleri tekrar parladı, Kaptan!',
                        en: 'Infinity Core resynchronized. Star beacons are lighting across every sector, Captain!'
                    }
                }
            ],
            reward: {
                credits: 1000,
                badgeTitle: { tr: 'Sonsuzluk Muhafızı', en: 'Guardian of Infinity' }
            }
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
            } else {
                state.unlockedChapter = Math.max(state.unlockedChapter, TOTAL_CHAPTERS);
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
                updatedAt: state.updatedAt
            };
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
