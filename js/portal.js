// =============================================================================
// COSMIC UNIVERSE v11.0 — MULTI-GAME PORTAL CONTROLLER (js/portal.js)
// Renders 50 Games with custom Logos, 16:9 Posters, Fuse.js search, Filters & Story Sync
// =============================================================================
(function (global) {
    'use strict';

    const state = {
        category: 'all',
        engine: 'all',
        query: '',
        sort: 'index',
        fuse: null
    };

    const COPY = {
        tr: {
            pageTitle: 'COSMIC UNIVERSE v11.0 — 50 Uzay Oyunu & Hikâye Portalı',
            topbarSub: 'V11.0 MULTIVERSE PORTAL',
            eyebrow: 'TEK KAHRAMAN · 50 KOZMİK DÜNYA',
            heroTitle: 'Cosmic Universe Arcade',
            heroSub: 'Kaptan Nova Vex\'in 8 bölümlü evrensel hikâyesini keşfet veya 7 farklı oyun motorunda geliştirilmiş 50 benzersiz tarayıcı oyunundan birini hemen başlat.',
            heroStory: 'Hikâye Modu (8 Bölüm)',
            heroSurvivors: 'Cosmic Survivors',
            heroMystery: 'Cinayet Dosyası',
            random: 'Şanslı Oyun',
            audioOn: 'Ses Açık',
            audioOff: 'Sessiz',
            telemetryEyebrow: 'PİLOT PROFİLİ & ARŞİV',
            kpiGames: 'Oynanan',
            kpiStars: 'Yıldızlar',
            kpiStory: 'Hikâye',
            kpiScore: 'Toplam Skor',
            engineStack: 'MOTOR & DİL YIĞINI FİLTRESİ',
            storyStripTitle: 'Kaptan Nova Vex — Parçalanan Sonsuzluk (8 Bölüm)',
            storyMore: 'Hikâye Haritasına Git',
            searchPlaceholder: '50 oyun arasında ara (3D, bulmaca, cinayet, flappy, WASM...)',
            sortIndex: 'Katalog (#01 – #50)',
            sortStars: 'En Yüksek Yıldızlarım',
            sortStory: 'Hikâye Bölümleri Önce',
            sortDiff: 'Zorluk (Kolay -> Zor)',
            resetFilters: 'Filtreleri Sıfırla',
            resultsCount: (shown, total) => `${shown} / ${total} OYUN`,
            emptyMsg: 'Aramanızla eşleşen kozmik oyun bulunamadı.',
            categories: {
                all: 'Tümü',
                survivors: 'Ana & 3D',
                reflex: 'Flappy & Refleks',
                arcade: 'Klasik Arcade',
                puzzle: 'Bulmaca & Şifre',
                physics: 'Fizik & Çekim',
                tactics: 'Taktik & Gizem'
            },
            allEngines: 'Tümü',
            flagshipTag: 'ANA OYUN',
            storyBadge: (n) => `BÖL.${n}`,
            playCta: 'OYNA →',
            hangarCta: 'HANGAR →',
            bestPrefix: 'Rekor'
        },
        en: {
            pageTitle: 'COSMIC UNIVERSE v11.0 — 50 Space Games & Story Portal',
            topbarSub: 'V11.0 MULTIVERSE PORTAL',
            eyebrow: 'ONE HERO · 50 COSMIC WORLDS',
            heroTitle: 'Cosmic Universe Arcade',
            heroSub: 'Follow Captain Nova Vex across an 8-Chapter multiverse story or launch any of 50 playable browser games spanning 7 engines.',
            heroStory: 'Story Saga (8 Ch.)',
            heroSurvivors: 'Cosmic Survivors',
            heroMystery: 'Murder Mystery',
            random: 'Random Game',
            audioOn: 'Audio On',
            audioOff: 'Muted',
            telemetryEyebrow: 'PILOT PROFILE & VAULT',
            kpiGames: 'Explored',
            kpiStars: 'Stars Earned',
            kpiStory: 'Story Progress',
            kpiScore: 'Total Score',
            engineStack: 'ENGINE & LANGUAGE STACK FILTER',
            storyStripTitle: 'Captain Nova Vex — The Shattered Infinity (8 Chapters)',
            storyMore: 'Open Story Map',
            searchPlaceholder: 'Search all 50 games (3D, puzzle, murder, flappy, WASM...)',
            sortIndex: 'Catalog (#01 – #50)',
            sortStars: 'My Highest Stars',
            sortStory: 'Story Chapters First',
            sortDiff: 'Difficulty (Easy -> Hard)',
            resetFilters: 'Reset Filters',
            resultsCount: (shown, total) => `${shown} / ${total} GAMES`,
            emptyMsg: 'No cosmic games matched your current filter.',
            categories: {
                all: 'All',
                survivors: 'Flagship & 3D',
                reflex: 'Flappy & Reflex',
                arcade: 'Classic Arcade',
                puzzle: 'Puzzle & Cipher',
                physics: 'Physics & Gravity',
                tactics: 'Tactics & Mystery'
            },
            allEngines: 'All Stacks',
            flagshipTag: 'FLAGSHIP',
            storyBadge: (n) => `CH.${n}`,
            playCta: 'PLAY →',
            hangarCta: 'HANGAR →',
            bestPrefix: 'Best'
        }
    };

    function getLang() {
        return (global.CosmicI18n && global.CosmicI18n.getLang()) || 'tr';
    }

    function c() {
        return COPY[getLang()] || COPY.tr;
    }

    function refreshIcons() {
        if (global.lucide && typeof global.lucide.createIcons === 'function') {
            global.lucide.createIcons();
        }
    }

    function initFuse() {
        const games = global.COSMIC_ARCADE_GAMES || [];
        if (typeof global.Fuse === 'function' && games.length) {
            state.fuse = new global.Fuse(games, {
                keys: [
                    { name: 'title.tr', weight: 0.4 },
                    { name: 'title.en', weight: 0.4 },
                    { name: 'tagline.tr', weight: 0.25 },
                    { name: 'tagline.en', weight: 0.25 },
                    { name: 'engine', weight: 0.2 },
                    { name: 'lang', weight: 0.15 },
                    { name: 'id', weight: 0.2 }
                ],
                threshold: 0.34,
                ignoreLocation: true
            });
        }
    }

    function updateTelemetry() {
        const lang = getLang();
        const creditsEl = document.getElementById('creditsDisplay');
        if (creditsEl && global.CosmicPersistence) {
            creditsEl.textContent = Number(global.CosmicPersistence.load().credits || 0).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR');
        }
        if (global.CosmicArcadeStore) {
            const st = global.CosmicArcadeStore.getStats();
            document.getElementById('valKpiGames').textContent = `${st.playedCount} / ${st.totalGames}`;
            document.getElementById('valKpiStars').textContent = `${st.totalStars} / ${st.maxPossibleStars} ★`;
            document.getElementById('valKpiScore').textContent = Number(st.totalHighScore || 0).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR');
        }
        if (global.CosmicStoryStore) {
            const sst = global.CosmicStoryStore.getStats();
            document.getElementById('valKpiStory').textContent = `${sst.completedCount} / ${sst.totalChapters}`;
            document.getElementById('telemetryChapterBadge').textContent = `CH ${sst.unlockedChapter} / ${sst.totalChapters}`;
        }
    }

    function renderStoryStrip() {
        const row = document.getElementById('portalStoryRow');
        if (!row || !global.COSMIC_STORY_CHAPTERS || !global.CosmicStoryStore) return;
        const st = global.CosmicStoryStore.load();
        row.innerHTML = global.COSMIC_STORY_CHAPTERS.map((ch) => {
            const rec = st.completedChapters[ch.id];
            const starTxt = rec ? '★'.repeat(rec.stars) : (ch.id <= st.unlockedChapter ? '●' : '🔒');
            return `
                <a href="story.html?chapter=${ch.id}" class="mini-chapter-card ${rec ? 'cleared' : ''}">
                    <img src="${ch.image}" alt="" class="mini-chapter-img" loading="lazy">
                    <div class="mini-chapter-meta">
                        <span>${c().storyBadge(ch.id)}</span>
                        <span class="mini-chapter-stars">${starTxt}</span>
                    </div>
                </a>
            `;
        }).join('');
    }

    function renderEngineFilters() {
        const wrap = document.getElementById('engineFilterChips');
        if (!wrap || !global.COSMIC_ARCADE_GAMES) return;
        const engines = ['all', 'Three.js 3D', 'PixiJS v8', 'Matter.js', 'WebAssembly', 'TypeScript', 'GLSL WebGL2', 'Neo-Pixel'];
        wrap.innerHTML = '';
        engines.forEach((eng) => {
            const count = eng === 'all'
                ? global.COSMIC_ARCADE_GAMES.length
                : global.COSMIC_ARCADE_GAMES.filter(g => g.engine === eng).length;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'engine-chip-btn' + (state.engine === eng ? ' active' : '');
            btn.textContent = eng === 'all' ? `${c().allEngines} (${count})` : `${eng} (${count})`;
            btn.addEventListener('click', () => {
                if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
                state.engine = eng;
                renderEngineFilters();
                renderGamesGrid();
            });
            wrap.appendChild(btn);
        });
    }

    function renderCategoryTabs() {
        const wrap = document.getElementById('categoryTabsWrap');
        if (!wrap || !global.COSMIC_ARCADE_GAMES) return;
        const order = ['all', 'survivors', 'reflex', 'arcade', 'puzzle', 'physics', 'tactics'];
        const labels = c().categories;
        wrap.innerHTML = '';
        order.forEach((cat) => {
            const count = cat === 'all'
                ? global.COSMIC_ARCADE_GAMES.length
                : global.COSMIC_ARCADE_GAMES.filter(g => g.category === cat).length;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cat-tab-btn' + (state.category === cat ? ' active' : '');
            btn.textContent = `${labels[cat] || cat} (${count})`;
            btn.addEventListener('click', () => {
                if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
                state.category = cat;
                renderCategoryTabs();
                renderGamesGrid();
            });
            wrap.appendChild(btn);
        });
    }

    function getFilteredGames() {
        const allGames = (global.COSMIC_ARCADE_GAMES || []).map((g, idx) => Object.assign({}, g, { _idx: idx + 1 }));
        let list = allGames;

        const q = state.query.trim();
        if (q) {
            if (state.fuse) {
                const matchedIds = new Set(state.fuse.search(q).map(r => r.item.id));
                list = list.filter(g => matchedIds.has(g.id));
            } else {
                const lq = q.toLowerCase();
                list = list.filter(g =>
                    g.id.toLowerCase().includes(lq) ||
                    (g.title.tr || '').toLowerCase().includes(lq) ||
                    (g.title.en || '').toLowerCase().includes(lq) ||
                    (g.tagline.tr || '').toLowerCase().includes(lq) ||
                    (g.tagline.en || '').toLowerCase().includes(lq) ||
                    (g.engine || '').toLowerCase().includes(lq)
                );
            }
        }

        if (state.category !== 'all') {
            list = list.filter(g => g.category === state.category);
        }
        if (state.engine !== 'all') {
            list = list.filter(g => g.engine === state.engine);
        }

        const store = global.CosmicArcadeStore;
        if (state.sort === 'stars' && store) {
            list = list.slice().sort((a, b) => {
                const sa = store.getGameStats(a.id);
                const sb = store.getGameStats(b.id);
                return (sb.stars - sa.stars) || (sb.highScore - sa.highScore) || (a._idx - b._idx);
            });
        } else if (state.sort === 'story') {
            list = list.slice().sort((a, b) => {
                const ca = a.storyChapter || 99;
                const cb = b.storyChapter || 99;
                return (ca - cb) || (a._idx - b._idx);
            });
        } else if (state.sort === 'diff') {
            list = list.slice().sort((a, b) => (a.difficulty - b.difficulty) || (a._idx - b._idx));
        }

        return list;
    }

    function renderGamesGrid() {
        const grid = document.getElementById('portalGamesGrid');
        if (!grid) return;
        const lang = getLang();
        const copy = c();
        const totalCount = (global.COSMIC_ARCADE_GAMES || []).length;
        const list = getFilteredGames();

        document.getElementById('resultsCountBadge').textContent = copy.resultsCount(list.length, totalCount);
        const hasFilter = state.category !== 'all' || state.engine !== 'all' || state.query.trim().length > 0;
        document.getElementById('btnResetFilters').classList.toggle('hidden', !hasFilter);

        if (!list.length) {
            grid.innerHTML = `<div class="portal-empty-box">${copy.emptyMsg}</div>`;
            return;
        }

        grid.innerHTML = list.map((g) => {
            const rec = global.CosmicArcadeStore ? global.CosmicArcadeStore.getGameStats(g.id) : { highScore: 0, stars: 0 };
            const starHtml = '★'.repeat(rec.stars || 0) + '☆'.repeat(3 - (rec.stars || 0));
            const targetHref = g.isFlagship ? 'hangar.html' : `games/${encodeURIComponent(g.id)}/index.html`;
            const bannerSrc = `assets/v11/banners/${g.id}.jpg`;
            const thumbSrc = `assets/v11/thumbs/${g.id}.png`;
            const badgeRight = g.storyChapter
                ? `<span class="card-story-tag">${copy.storyBadge(g.storyChapter)}</span>`
                : (g.isFlagship ? `<span class="card-story-tag">${copy.flagshipTag}</span>` : '');

            return `
                <a href="${targetHref}" class="game-portal-card ${g.isFlagship ? 'is-flagship' : ''}" style="--card-accent:${g.accent};">
                    <div class="card-banner-wrap">
                        <img src="${bannerSrc}" alt="${g.title[lang] || g.title.tr}" class="card-banner-img" loading="lazy" onerror="this.src='assets/v11/portal_keyart.jpg'">
                        <div class="card-banner-scrim"></div>
                        <div class="card-top-badges">
                            <span class="card-num-pill">#${String(g._idx).padStart(2, '0')}</span>
                            <span class="card-engine-pill">${g.engine} · ${g.lang}</span>
                        </div>
                        <img src="${thumbSrc}" alt="" class="card-logo-badge" loading="lazy" onerror="this.src='assets/v11/sprites/${g.sprite}.png'">
                        ${badgeRight}
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${g.title[lang] || g.title.tr}</h3>
                        <p class="card-tagline">${g.tagline[lang] || g.tagline.tr}</p>
                        <div class="card-footer-row">
                            <span class="card-stars">${starHtml}</span>
                            <span class="card-best-score">${rec.highScore > 0 ? `${copy.bestPrefix}: ${rec.highScore}` : `Lv.${g.difficulty}/5`}</span>
                            <span class="card-play-pill">${g.isFlagship ? copy.hangarCta : copy.playCta}</span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    }

    function syncCopy() {
        const copy = c();
        const lang = getLang();
        document.title = copy.pageTitle;
        document.documentElement.lang = lang;

        const map = {
            portalTopbarSub: copy.topbarSub,
            heroEyebrow: copy.eyebrow,
            heroMainTitle: copy.heroTitle,
            heroMainSub: copy.heroSub,
            heroStoryBtnLabel: copy.heroStory,
            heroSurvivorsLabel: copy.heroSurvivors,
            heroMysteryLabel: copy.heroMystery,
            btnRandomLabel: copy.random,
            lblTelemetryEyebrow: copy.telemetryEyebrow,
            lblKpiGames: copy.kpiGames,
            lblKpiStars: copy.kpiStars,
            lblKpiStory: copy.kpiStory,
            lblKpiScore: copy.kpiScore,
            lblEngineStackTitle: copy.engineStack,
            storyStripTitle: copy.storyStripTitle,
            storyStripMoreLabel: copy.storyMore,
            btnResetFiltersLabel: copy.resetFilters,
            optSortIndex: copy.sortIndex,
            optSortStars: copy.sortStars,
            optSortStory: copy.sortStory,
            optSortDiff: copy.sortDiff
        };
        Object.entries(map).forEach(([id, txt]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
        });

        const searchEl = document.getElementById('portalSearchInput');
        if (searchEl) searchEl.placeholder = copy.searchPlaceholder;

        const muted = Boolean(global.CosmicAudio && global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
        document.getElementById('audioToggleLabel').textContent = muted ? copy.audioOff : copy.audioOn;

        if (global.CosmicI18n && typeof global.CosmicI18n.applyTranslations === 'function') {
            global.CosmicI18n.applyTranslations();
        }
    }

    function renderAll() {
        syncCopy();
        updateTelemetry();
        renderStoryStrip();
        renderEngineFilters();
        renderCategoryTabs();
        renderGamesGrid();
        refreshIcons();
    }

    function bindEvents() {
        const searchEl = document.getElementById('portalSearchInput');
        const clearBtn = document.getElementById('portalSearchClear');

        searchEl?.addEventListener('input', () => {
            state.query = searchEl.value;
            clearBtn?.classList.toggle('hidden', !state.query);
            renderGamesGrid();
        });

        clearBtn?.addEventListener('click', () => {
            state.query = '';
            if (searchEl) searchEl.value = '';
            clearBtn.classList.add('hidden');
            renderGamesGrid();
        });

        document.getElementById('portalSortSelect')?.addEventListener('change', (e) => {
            state.sort = e.target.value || 'index';
            renderGamesGrid();
        });

        document.getElementById('btnResetFilters')?.addEventListener('click', () => {
            state.category = 'all';
            state.engine = 'all';
            state.query = '';
            state.sort = 'index';
            if (searchEl) searchEl.value = '';
            clearBtn?.classList.add('hidden');
            const sel = document.getElementById('portalSortSelect');
            if (sel) sel.value = 'index';
            renderEngineFilters();
            renderCategoryTabs();
            renderGamesGrid();
        });

        document.getElementById('btnRandomLaunch')?.addEventListener('click', () => {
            const list = (global.COSMIC_ARCADE_GAMES || []).filter(g => !g.isFlagship);
            if (!list.length) return;
            const pick = list[Math.floor(Math.random() * list.length)];
            location.href = `games/${encodeURIComponent(pick.id)}/index.html`;
        });

        const audioBtn = document.getElementById('audioToggleBtn');
        audioBtn?.addEventListener('click', () => {
            if (!global.CosmicAudio) return;
            global.CosmicAudio.unlock();
            const cur = Boolean(global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            global.CosmicAudio.setMuted(!cur);
            document.getElementById('audioToggleIcon')?.setAttribute('data-lucide', !cur ? 'volume-x' : 'volume-2');
            audioBtn.classList.toggle('is-muted', !cur);
            syncCopy();
            refreshIcons();
        });

        global.addEventListener('cosmic:langchange', renderAll);
    }

    function init() {
        initFuse();
        bindEvents();
        renderAll();
        if (global.gsap) {
            global.gsap.from('.portal-hero-grid, .portal-story-strip', {
                opacity: 0, y: 10, duration: 0.32, stagger: 0.06, ease: 'power2.out', clearProps: 'transform,opacity'
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
