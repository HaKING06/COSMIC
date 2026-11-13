// =============================================================================
// COSMIC UNIVERSE v12.0 — CLEAN STOREFRONT & 60-GAME PORTAL CONTROLLER (js/portal.js)
// Renders 60 Games (Clean Text-Free Posters + Corner Logos), 4-Act Story Jump & Fuse Search
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
            pageTitle: 'COSMIC UNIVERSE v12.0 — 60 Uzay Oyunu & 24 Bölümlük Hikâye Portalı',
            topbarSub: 'V12.0 MULTIVERSE PORTAL',
            eyebrow: 'TEK KAHRAMAN · 60 KOZMİK DÜNYA',
            heroTitle: 'Cosmic Universe Arcade',
            heroSub: 'Kaptan Nova Vex\'in 24 bölümlük Sezon 1 destanını oyna veya 11 farklı oyun motoruyla geliştirilmiş 60 sonsuz tarayıcı oyunundan birini hemen başlat.',
            heroStory: 'Hikâye Modu (24 Bölüm)',
            heroSurvivors: 'Cosmic Survivors',
            random: 'Şanslı Oyun',
            audioOn: 'Ses Açık',
            audioOff: 'Sessiz',
            telemetryEyebrow: 'PİLOT PROFİLİ & ARŞİV',
            kpiGames: 'Oynanan',
            kpiStars: 'Yıldızlar',
            kpiStory: 'Hikâye',
            kpiScore: 'Toplam Skor',
            featuredNew: 'V12.0 AMİRAL GEMİSİ OYUNLAR',
            storyStripTitle: 'Kaptan Nova Vex — Sezon 1 Perdeleri (24 Bölüm)',
            storyMore: 'Hikâye Haritasına Git',
            searchPlaceholder: '60 oyun ara (Phaser, Lua, WASM, 3D, gizem...)',
            sortIndex: 'Katalog (#01 – #60)',
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
            allEngines: 'Motor: Tümü',
            flagshipTag: 'V12.0',
            storyBadge: (n) => `BÖL.${n}`,
            playCta: 'OYNA →',
            hangarCta: 'HANGAR →',
            bestPrefix: 'Rekor'
        },
        en: {
            pageTitle: 'COSMIC UNIVERSE v12.0 — 60 Space Games & 24-Chapter Story Portal',
            topbarSub: 'V12.0 MULTIVERSE PORTAL',
            eyebrow: 'ONE HERO · 60 COSMIC WORLDS',
            heroTitle: 'Cosmic Universe Arcade',
            heroSub: 'Follow Captain Nova Vex across a 24-Chapter Season 1 saga or launch any of 60 endless browser games powered by 11 distinct engines.',
            heroStory: 'Story Saga (24 Ch.)',
            heroSurvivors: 'Cosmic Survivors',
            random: 'Random Game',
            audioOn: 'Audio On',
            audioOff: 'Muted',
            telemetryEyebrow: 'PILOT PROFILE & VAULT',
            kpiGames: 'Explored',
            kpiStars: 'Stars Earned',
            kpiStory: 'Story Progress',
            kpiScore: 'Total Score',
            featuredNew: 'V12.0 FLAGSHIP RELEASES',
            storyStripTitle: 'Captain Nova Vex — Season 1 Acts (24 Chapters)',
            storyMore: 'Open Story Map',
            searchPlaceholder: 'Search all 60 games (Phaser, Lua, WASM, 3D, mystery...)',
            sortIndex: 'Catalog (#01 – #60)',
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
            allEngines: 'Engine: All',
            flagshipTag: 'V12.0',
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
            const prefix = lang === 'en' ? 'CH' : 'BÖL';
            document.getElementById('telemetryChapterBadge').textContent = `${prefix} ${sst.unlockedChapter} / ${sst.totalChapters}`;
        }
    }

    function renderStoryStrip() {
        const row = document.getElementById('portalStoryRow');
        const acts = (global.COSMIC_STORY_META && global.COSMIC_STORY_META.acts) || [];
        if (!row || !global.CosmicStoryStore || !acts.length) return;
        const lang = getLang();
        const st = global.CosmicStoryStore.load();
        const thumbs = [1, 9, 15, 24];

        row.innerHTML = acts.map((act, idx) => {
            const chStart = act.range[0];
            const chEnd = act.range[1];
            let doneCount = 0;
            for (let k = chStart; k <= chEnd; k++) {
                if (st.completedChapters[k]) doneCount++;
            }
            const targetCh = Math.min(chEnd, Math.max(chStart, st.unlockedChapter <= chEnd ? st.unlockedChapter : chStart));
            const locked = st.unlockedChapter < chStart;
            return `
                <a href="story.html?chapter=${locked ? st.unlockedChapter : targetCh}" class="act-quick-card">
                    <img src="assets/v11/chapters/ch${thumbs[idx] || chStart}.jpg" alt="" class="act-quick-img" loading="lazy">
                    <div class="act-quick-info">
                        <div class="act-quick-title">${act.title[lang] || act.title.tr}</div>
                        <div class="act-quick-sub">${doneCount} / 6 ★ · ${locked ? '🔒' : '▶'}</div>
                    </div>
                </a>
            `;
        }).join('');
    }

    function renderEngineSelect() {
        const sel = document.getElementById('engineFilterSelect');
        if (!sel || !global.COSMIC_ARCADE_GAMES) return;
        const unique = ['all', ...new Set(global.COSMIC_ARCADE_GAMES.map((g) => g.engine))];
        sel.innerHTML = '';
        unique.forEach((eng) => {
            const count = eng === 'all'
                ? global.COSMIC_ARCADE_GAMES.length
                : global.COSMIC_ARCADE_GAMES.filter((g) => g.engine === eng).length;
            const opt = document.createElement('option');
            opt.value = eng;
            opt.textContent = eng === 'all' ? `${c().allEngines} (${count})` : `${eng} (${count})`;
            sel.appendChild(opt);
        });
        sel.value = state.engine;
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
                : global.COSMIC_ARCADE_GAMES.filter((g) => g.category === cat).length;
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
        const all = (global.COSMIC_ARCADE_GAMES || []).map((g, idx) => ({ ...g, _idx: idx + 1 }));
        let list = all;
        const q = state.query.trim();

        if (q.length > 0) {
            if (state.fuse) {
                const hits = new Set(state.fuse.search(q).map((r) => r.item.id));
                list = list.filter((g) => hits.has(g.id));
            } else {
                const low = q.toLowerCase();
                list = list.filter((g) =>
                    g.id.includes(low) ||
                    g.title.tr.toLowerCase().includes(low) ||
                    g.title.en.toLowerCase().includes(low) ||
                    g.engine.toLowerCase().includes(low)
                );
            }
        }

        if (state.category !== 'all') {
            list = list.filter((g) => g.category === state.category);
        }
        if (state.engine !== 'all') {
            list = list.filter((g) => g.engine === state.engine);
        }

        const getStats = (id) => (global.CosmicArcadeStore ? global.CosmicArcadeStore.getGameStats(id) : { stars: 0 });
        if (state.sort === 'stars') {
            list.sort((a, b) => (getStats(b.id).stars - getStats(a.id).stars) || (a._idx - b._idx));
        } else if (state.sort === 'story') {
            list.sort((a, b) => ((a.storyChapter || 999) - (b.storyChapter || 999)) || (a._idx - b._idx));
        } else if (state.sort === 'diff') {
            list.sort((a, b) => (a.difficulty - b.difficulty) || (a._idx - b._idx));
        } else {
            list.sort((a, b) => a._idx - b._idx);
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
            const isMainHangar = g.id === 'cosmic-survivors';
            const targetHref = isMainHangar ? 'hangar.html' : `games/${encodeURIComponent(g.id)}/index.html`;
            const bannerSrc = `assets/v11/banners/${g.id}.jpg`;
            const thumbSrc = `assets/v11/thumbs/${g.id}.png`;
            const storyTag = g.storyChapter
                ? `<span class="card-meta-story">${copy.storyBadge(g.storyChapter)}</span>`
                : (g._idx > 50 ? `<span class="card-meta-story">${copy.flagshipTag}</span>` : '');

            return `
                <a href="${targetHref}" class="game-portal-card ${g.isFlagship ? 'is-flagship' : ''}" style="--card-accent:${g.accent};">
                    <div class="card-banner-wrap">
                        <img src="${bannerSrc}" alt="${g.title[lang] || g.title.tr}" class="card-banner-img" loading="lazy" onerror="this.src='assets/v11/portal_keyart.jpg'">
                        <img src="${thumbSrc}" alt="" class="card-logo-badge" loading="lazy" onerror="this.src='assets/v11/sprites/${g.sprite}.png'">
                    </div>
                    <div class="card-body">
                        <div class="card-meta-strip">
                            <div class="card-meta-left">
                                <span class="card-meta-num">#${String(g._idx).padStart(2, '0')}</span>
                                <span class="card-meta-eng">${g.engine}</span>
                            </div>
                            ${storyTag}
                        </div>
                        <h3 class="card-title">${g.title[lang] || g.title.tr}</h3>
                        <p class="card-tagline">${g.tagline[lang] || g.tagline.tr}</p>
                        <div class="card-footer-row">
                            <span class="card-stars">${starHtml}</span>
                            <span class="card-best-score">${rec.highScore > 0 ? `${copy.bestPrefix}: ${rec.highScore}` : `Lv.${g.difficulty}/5`}</span>
                            <span class="card-play-pill">${isMainHangar ? copy.hangarCta : copy.playCta}</span>
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
            btnRandomLabel: copy.random,
            lblTelemetryEyebrow: copy.telemetryEyebrow,
            lblKpiGames: copy.kpiGames,
            lblKpiStars: copy.kpiStars,
            lblKpiStory: copy.kpiStory,
            lblKpiScore: copy.kpiScore,
            lblFeaturedNewTitle: copy.featuredNew,
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
        renderEngineSelect();
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

        document.getElementById('engineFilterSelect')?.addEventListener('change', (e) => {
            state.engine = e.target.value || 'all';
            if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
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
            renderEngineSelect();
            renderCategoryTabs();
            renderGamesGrid();
        });

        document.getElementById('btnRandomLaunch')?.addEventListener('click', () => {
            const list = (global.COSMIC_ARCADE_GAMES || []).filter((g) => g.id !== 'cosmic-survivors');
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
        const params = new URLSearchParams(location.search);
        const qParam = params.get('q') || '';
        if (qParam) {
            state.query = qParam;
            const searchEl = document.getElementById('portalSearchInput');
            if (searchEl) searchEl.value = qParam;
            document.getElementById('portalSearchClear')?.classList.remove('hidden');
        }
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
