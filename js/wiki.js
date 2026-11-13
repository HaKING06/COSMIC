// =============================================================================
// COSMIC SURVIVORS v10.0 — ENCYCLOPEDIA & SYNTHESIS SIMULATOR (js/wiki.js)
// Fuse.js EN/TR fuzzy search (53 modules + 8 enemies + 5 bosses), live i18n,
// v10.0 arena/pylon/Overdrive/[Q] Aim Mastery intel, Chart.js DPS & Simulator.
// =============================================================================
(function (global) {
    'use strict';

    const DATA = global.COSMIC_DATA;
    const PERSIST = global.CosmicPersistence;

    // Exact BOSS_CONFIGS base HP array from game.js (Oblivion Behemoth -> Dyson Seraph)
    const BOSS_BASE_HPS = [7200, 12800, 18500, 26500, 38000];

    const WIKI_I18N = {
        tr: {
            'nav.portalLink': 'Portal',
            'nav.story': 'Hikâye',
            'nav.hangar': 'Survivors',
            'nav.tree': 'Evrim Ağacı',
            'nav.armory': 'Cephanelik',
            'nav.modes': 'Modlar',
            'nav.wiki': 'Ansiklopedi',
            'nav.about': 'Hakkında',
            'common.audioOn': 'Ses Açık',
            'common.audioOff': 'Sessiz',
            'wiki.pageTitle': 'COSMIC SURVIVORS v11.0 — Taktik Ansiklopedi & Sentez Simülatörü',
            'wiki.topbarVersion': 'V11.0 TACTICAL ENCYCLOPEDIA',
            'wiki.hero.title': 'Taktik Ansiklopedi & Sentez Simülatörü',
            'wiki.hero.sub': 'Cosmic Survivors v10.0 Genesis Edition için tüm 53 savaş modülü, 5600×5600 siperli arenalar, 5 oyun modu, Boss Kalkan Pylonları, [E] Overdrive ve [Q] +%12 Nişan Ustalığı rehberi.',
            'wiki.hero.ctaModes': 'Modlar & Günlük',
            'wiki.hero.ctaTree': 'Evrim Laboratuvarına Git',
            'wiki.globalSearchPlaceholder': 'Global Hızlı Arama (Fuse.js): Modül, düşman veya boss yazın (ör. takyon, sentinel, kryos, pylon)...',
            'wiki.tab.db': 'Veritabanı (53 Modül)',
            'wiki.tab.synergy': 'Sektör & Gemi Sinerjisi',
            'wiki.tab.meta': 'Meta Kombolar & DPS Grafiği',
            'wiki.tab.bestiary': 'Düşman, Boss & v10 Mekanikleri',
            'wiki.tab.calc': 'Sentez Simülatörü',
            'wiki.cat.all': 'Tümü (53)',
            'wiki.cat.weapon': 'Silahlar (14)',
            'wiki.cat.trinket': 'Destek Modülleri (14)',
            'wiki.cat.evo': 'Evrimler (19)',
            'wiki.cat.mega': 'Mega Evrimler (6)',
            'wiki.dbSearchPlaceholder': 'Fuse.js ile ara (TR/EN): modül, gemi, formül...',
            'wiki.syn.thShip': 'Gemi',
            'wiki.syn.thStarter': 'Başlangıç',
            'wiki.syn.thSig': 'İmza Kök Sentezi',
            'wiki.syn.thMega': 'Mega Hedef',
            'wiki.syn.thSectors': 'İdeal Sektörler (5600×5600)',
            'wiki.syn.thAction': 'İşlem',
            'wiki.meta.chartTitle': 'Evrim & Mega DPS Karşılaştırması',
            'wiki.meta.chartSub': 'Tek hedef + alan sürdürülebilir DPS kıyaslaması.',
            'wiki.meta.all': 'Tümü (Üst 12)',
            'wiki.meta.evo': 'Evrimler',
            'wiki.meta.mega': 'Mega Evrimler',
            'wiki.bestiary.badge': 'V10.0 TAKTİK BRİFİNG',
            'wiki.bestiary.title': 'Boss Kalkan Pylonları, Faz II & Dalga 25+ Kozmik Çürüme',
            'wiki.bestiary.desc': 'Her 5. dalgada bir Ana Boss Kalkan Pylonları (boss hasarını %65 azaltır) ile sahneye çıkar. Canı %50 altına indiğinde Öfke Fazı II (+%32 hız ve çift salvo) başlar. Dalga 25’ten itibaren Kozmik Çürüme kalkan ve şifa verimini %15 tabanına kadar düşürür.',
            'wiki.bestiary.bossHeading': '5 Ana Kozmik Boss',
            'wiki.bestiary.enemyHeading': '8 Sürü Arketipi',
            'wiki.sim.leftTitle': 'Sentez Eşleştirici (X + Y = Z)',
            'wiki.sim.autoPair': 'Uyumlu Çift Bul',
            'wiki.sim.weaponLabel': 'Silah Modülü (Lv.5)',
            'wiki.sim.trinketLabel': 'Destek Modülü / Trinket (Lv.5)',
            'wiki.sim.rightTitle': 'Savaş Telemetrisi & Kozmik Çürüme',
            'wiki.sim.syncBadge': 'ATÖLYE SENKRON',
            'wiki.sim.shipLabel': 'Yıldız Gemisi',
            'wiki.sim.diffLabel': 'Zorluk Modu',
            'wiki.sim.waveLabel': 'Simüle Edilen Dalga'
        },
        en: {
            'nav.portalLink': 'Portal',
            'nav.story': 'Story Saga',
            'nav.hangar': 'Survivors',
            'nav.tree': 'Evolution Tree',
            'nav.armory': 'Armory',
            'nav.modes': 'Modes',
            'nav.wiki': 'Encyclopedia',
            'nav.about': 'About',
            'common.audioOn': 'Audio On',
            'common.audioOff': 'Muted',
            'wiki.pageTitle': 'COSMIC SURVIVORS v11.0 — Tactical Encyclopedia & Synthesis Simulator',
            'wiki.topbarVersion': 'V11.0 TACTICAL ENCYCLOPEDIA',
            'wiki.hero.title': 'Tactical Encyclopedia & Synthesis Simulator',
            'wiki.hero.sub': 'Complete v10.0 Genesis Edition reference: all 53 combat modules, 5600×5600 cover arenas, 5 Game Modes, Boss Shield Pylons, [E] Cosmic Overdrive and [Q] +12% Aim Mastery.',
            'wiki.hero.ctaModes': 'Modes & Daily',
            'wiki.hero.ctaTree': 'Open Evolution Lab',
            'wiki.globalSearchPlaceholder': 'Global Quick Search (Fuse.js): type any module, enemy or boss (e.g. tachyon, sentinel, kryos, pylon)...',
            'wiki.tab.db': 'Database (53 Modules)',
            'wiki.tab.synergy': 'Sector & Ship Synergy',
            'wiki.tab.meta': 'Meta Combos & DPS Chart',
            'wiki.tab.bestiary': 'Enemies, Bosses & v10 Systems',
            'wiki.tab.calc': 'Synthesis Simulator',
            'wiki.cat.all': 'All (53)',
            'wiki.cat.weapon': 'Weapons (14)',
            'wiki.cat.trinket': 'Support Modules (14)',
            'wiki.cat.evo': 'Evolutions (19)',
            'wiki.cat.mega': 'Mega Evolutions (6)',
            'wiki.dbSearchPlaceholder': 'Search with Fuse.js (EN/TR): module, ship, formula...',
            'wiki.syn.thShip': 'Starship',
            'wiki.syn.thStarter': 'Starter',
            'wiki.syn.thSig': 'Signature Root Chain',
            'wiki.syn.thMega': 'Mega Target',
            'wiki.syn.thSectors': 'Ideal Sectors (5600×5600)',
            'wiki.syn.thAction': 'Action',
            'wiki.meta.chartTitle': 'Evolution & Mega DPS Comparison',
            'wiki.meta.chartSub': 'Single-target + AoE sustained DPS benchmark.',
            'wiki.meta.all': 'All (Top 12)',
            'wiki.meta.evo': 'Evolutions',
            'wiki.meta.mega': 'Mega Evolutions',
            'wiki.bestiary.badge': 'V10.0 TACTICAL BRIEFING',
            'wiki.bestiary.title': 'Boss Shield Pylons, Phase II & Wave 25+ Cosmic Decay',
            'wiki.bestiary.desc': 'Every 5th wave deploys a dreadnought Boss guarded by Shield Pylons (-65% incoming damage while active). Below 50% HP, Rage Phase II (+32% speed & double salvos) activates. From Wave 25+, Cosmic Decay reduces shield & heal efficacy down to a 15% floor.',
            'wiki.bestiary.bossHeading': '5 Dreadnought Cosmic Bosses',
            'wiki.bestiary.enemyHeading': '8 Swarm Archetypes',
            'wiki.sim.leftTitle': 'Synthesis Matcher (X + Y = Z)',
            'wiki.sim.autoPair': 'Find Matching Pair',
            'wiki.sim.weaponLabel': 'Weapon Module (Lv.5)',
            'wiki.sim.trinketLabel': 'Support Module / Trinket (Lv.5)',
            'wiki.sim.rightTitle': 'Combat Telemetry & Cosmic Decay',
            'wiki.sim.syncBadge': 'WORKSHOP SYNCED',
            'wiki.sim.shipLabel': 'Starship',
            'wiki.sim.diffLabel': 'Difficulty',
            'wiki.sim.waveLabel': 'Simulated Wave'
        }
    };

    const state = {
        activeTab: 'tab-database',
        dbCat: 'all',
        dbQuery: '',
        chartMode: 'mixed',
        dpsChart: null,
        dbFuse: null,
        globalFuse: null,
        moduleRecords: [],
        globalRecords: [],
        highlightId: null
    };

    function getLang() {
        if (global.CosmicI18n && typeof global.CosmicI18n.getLang === 'function') {
            return global.CosmicI18n.getLang();
        }
        return 'tr';
    }

    function t(key, trFallback, enFallback) {
        if (global.CosmicI18n && typeof global.CosmicI18n.t === 'function') {
            const val = global.CosmicI18n.t(key);
            if (val && val !== key) return val;
        }
        return getLang() === 'en' ? (enFallback ?? trFallback ?? key) : (trFallback ?? key);
    }

    function loc(obj, field) {
        if (!obj) return '';
        if (DATA && typeof DATA.getLocalized === 'function') {
            return DATA.getLocalized(obj, field, getLang());
        }
        return obj[field] ?? '';
    }

    function refreshIcons() {
        if (global.lucide && typeof global.lucide.createIcons === 'function') {
            global.lucide.createIcons();
        }
    }

    function playUiSound(type = 'uiClick') {
        if (global.CosmicAudio) {
            if (typeof global.CosmicAudio.unlock === 'function') global.CosmicAudio.unlock();
            if (typeof global.CosmicAudio.play === 'function') global.CosmicAudio.play(type);
        }
    }

    function syncLangTogglePills(lang = getLang()) {
        const btn = document.getElementById('langToggleBtn');
        if (!btn) return;
        btn.setAttribute('data-lang', lang);
        btn.querySelectorAll('.lang-seg').forEach(seg => {
            const segLang = seg.getAttribute('data-lang');
            seg.textContent = segLang === 'en' ? 'EN' : 'TR';
            seg.classList.toggle('active', segLang === lang);
        });
    }

    function applyAttributeTranslations() {
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', t(key, el.getAttribute('placeholder'), el.getAttribute('placeholder')));
        });
        document.title = t('wiki.pageTitle', document.title, 'COSMIC SURVIVORS v10.0 — Tactical Encyclopedia & Synthesis Simulator');
    }

    function registerI18n() {
        if (!global.CosmicI18n) return;
        if (global.CosmicI18n.dict) {
            Object.assign(global.CosmicI18n.dict.tr, WIKI_I18N.tr);
            Object.assign(global.CosmicI18n.dict.en, WIKI_I18N.en);
        }
        if (typeof global.CosmicI18n.applyTranslations === 'function') {
            global.CosmicI18n.applyTranslations();
        }
        syncLangTogglePills();
        applyAttributeTranslations();
    }

    function syncAudioHeaderUi() {
        const btn = document.getElementById('audioToggleBtn');
        const label = document.getElementById('audioToggleLabel');
        if (!btn) return;
        const muted = Boolean(global.CosmicAudio && global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
        btn.classList.toggle('is-muted', muted);
        const iconEl = document.getElementById('audioToggleIcon');
        if (iconEl) iconEl.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
        if (label) label.textContent = muted ? t('common.audioOff', 'Sessiz', 'Muted') : t('common.audioOn', 'Ses Açık', 'Audio On');
        refreshIcons();
    }

    function setupHeader() {
        const profile = PERSIST.load();
        const creditsEl = document.getElementById('creditsDisplay');
        if (creditsEl) creditsEl.textContent = profile.credits.toLocaleString(getLang() === 'en' ? 'en-US' : 'tr-TR');

        const btn = document.getElementById('audioToggleBtn');
        if (!btn) return;

        syncAudioHeaderUi();
        btn.addEventListener('click', () => {
            if (!global.CosmicAudio) return;
            global.CosmicAudio.unlock();
            const cur = Boolean(global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            global.CosmicAudio.setMuted(!cur);
            syncAudioHeaderUi();
            if (cur) global.CosmicAudio.play('uiClick');
        });
    }

    // -------------------------------------------------------------------------
    // Fuse.js Bilingual Index Builders (53 Modules + 8 Enemies + 5 Bosses)
    // -------------------------------------------------------------------------
    function buildSearchIndexes() {
        state.moduleRecords = DATA.getAllModules().map(mod => {
            const ship = mod.shipExclusive ? DATA.SHIPS[mod.shipExclusive] : null;
            return {
                group: 'module',
                id: mod.id,
                kind: mod.kind,
                shipName: ship ? ship.name : 'Evrensel',
                shipNameEn: ship ? (ship.nameEn || ship.name) : 'Universal',
                name: mod.name || '',
                nameEn: mod.nameEn || mod.name || '',
                desc: mod.desc || '',
                descEn: mod.descEn || mod.desc || '',
                formula: mod.formula || '',
                formulaEn: mod.formulaEn || mod.formula || '',
                statLabel: mod.statLabel || '',
                statLabelEn: mod.statLabelEn || mod.statLabel || '',
                icon: mod.icon || 'cpu',
                color: mod.color || '#38bdf8',
                raw: mod
            };
        });

        const bossRecords = (DATA.BOSSES || []).map(boss => ({
            group: 'boss',
            id: boss.id,
            name: boss.name || '',
            nameEn: boss.name || '',
            subtitle: boss.subtitle || '',
            subtitleEn: boss.subtitleEn || boss.subtitle || '',
            desc: (boss.mechanics || []).join(' · '),
            descEn: (boss.mechanicsEn || boss.mechanics || []).join(' · '),
            tactics: boss.tactics || '',
            tacticsEn: boss.tacticsEn || boss.tactics || '',
            asset: boss.asset,
            color: boss.color || '#f43f5e',
            raw: boss
        }));

        const enemyRecords = (DATA.ENEMIES || []).map(en => ({
            group: 'enemy',
            id: en.id,
            name: en.name || '',
            nameEn: en.nameEn || en.name || '',
            subtitle: en.threat || '',
            subtitleEn: en.threatEn || en.threat || '',
            desc: en.behavior || '',
            descEn: en.behaviorEn || en.behavior || '',
            tactics: en.counter || '',
            tacticsEn: en.counterEn || en.counter || '',
            asset: en.asset,
            color: en.color || '#38bdf8',
            raw: en
        }));

        state.globalRecords = [...state.moduleRecords, ...bossRecords, ...enemyRecords];

        if (typeof global.Fuse === 'function') {
            state.dbFuse = new global.Fuse(state.moduleRecords, {
                keys: [
                    { name: 'name', weight: 2.2 },
                    { name: 'nameEn', weight: 2.2 },
                    { name: 'id', weight: 1.4 },
                    { name: 'shipName', weight: 1.1 },
                    { name: 'shipNameEn', weight: 1.1 },
                    { name: 'formula', weight: 0.9 },
                    { name: 'formulaEn', weight: 0.9 },
                    { name: 'statLabel', weight: 0.8 },
                    { name: 'statLabelEn', weight: 0.8 },
                    { name: 'desc', weight: 0.55 },
                    { name: 'descEn', weight: 0.55 }
                ],
                threshold: 0.36,
                ignoreLocation: true,
                includeScore: true,
                minMatchCharLength: 2
            });

            state.globalFuse = new global.Fuse(state.globalRecords, {
                keys: [
                    { name: 'name', weight: 2.3 },
                    { name: 'nameEn', weight: 2.3 },
                    { name: 'id', weight: 1.4 },
                    { name: 'subtitle', weight: 1.2 },
                    { name: 'subtitleEn', weight: 1.2 },
                    { name: 'shipName', weight: 1.0 },
                    { name: 'shipNameEn', weight: 1.0 },
                    { name: 'formula', weight: 0.85 },
                    { name: 'formulaEn', weight: 0.85 },
                    { name: 'tactics', weight: 0.7 },
                    { name: 'tacticsEn', weight: 0.7 },
                    { name: 'desc', weight: 0.55 },
                    { name: 'descEn', weight: 0.55 }
                ],
                threshold: 0.37,
                ignoreLocation: true,
                includeScore: true,
                minMatchCharLength: 2
            });
        }
    }

    function jumpToEntry(group, entryId) {
        state.highlightId = entryId;
        if (group === 'module') {
            if (state.dbCat !== 'all') {
                state.dbCat = 'all';
                document.querySelectorAll('#wikiCategoryPills .filter-pill').forEach(p => {
                    p.classList.toggle('active', p.dataset.cat === 'all');
                });
            }
            if (state.dbQuery) {
                state.dbQuery = '';
                const dbInput = document.getElementById('wikiSearchInput');
                if (dbInput) dbInput.value = '';
            }
            renderModuleDatabase();
            switchTab('tab-database');
        } else {
            switchTab('tab-bestiary');
        }

        requestAnimationFrame(() => {
            document.querySelectorAll('.is-wiki-highlight').forEach(el => el.classList.remove('is-wiki-highlight'));
            const card = document.querySelector(`[data-entry-id="${entryId}"]`);
            if (card) {
                card.classList.add('is-wiki-highlight');
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    function setupGlobalSearch() {
        const input = document.getElementById('wikiGlobalSearchInput');
        const resultsEl = document.getElementById('wikiGlobalResults');
        const clearBtn = document.getElementById('wikiGlobalSearchClearBtn');
        const countBadge = document.getElementById('wikiGlobalSearchCount');
        const wrap = input ? input.closest('.wiki-global-search-wrap') : null;
        if (!input || !resultsEl) return;

        const runQuery = (rawQ) => {
            const q = String(rawQ || '').trim();
            if (clearBtn) clearBtn.hidden = !q;

            if (!q) {
                resultsEl.hidden = true;
                resultsEl.innerHTML = '';
                if (countBadge) countBadge.textContent = `${state.moduleRecords.length}+${(DATA.BOSSES || []).length + (DATA.ENEMIES || []).length} INDEX`;
                return [];
            }

            let hits = [];
            if (state.globalFuse) {
                hits = state.globalFuse.search(q).map(h => h.item);
            } else {
                const low = q.toLowerCase();
                hits = state.globalRecords.filter(r =>
                    r.name.toLowerCase().includes(low) ||
                    r.nameEn.toLowerCase().includes(low) ||
                    r.desc.toLowerCase().includes(low) ||
                    r.descEn.toLowerCase().includes(low)
                );
            }

            const isEn = getLang() === 'en';
            if (countBadge) countBadge.textContent = `${hits.length} ${isEn ? 'HITS' : 'SONUÇ'}`;

            if (!hits.length) {
                resultsEl.innerHTML = `<div style="padding:0.75rem;text-align:center;font-size:13px;color:var(--text-muted);">${isEn ? 'No matching module, enemy, or boss found.' : 'Eşleşen modül, düşman veya boss bulunamadı.'}</div>`;
                resultsEl.hidden = false;
                return [];
            }

            const top = hits.slice(0, 12);
            resultsEl.innerHTML = top.map(rec => {
                const badgeText = rec.group === 'boss'
                    ? (isEn ? 'BOSS' : 'BOSS')
                    : rec.group === 'enemy'
                        ? (isEn ? 'ENEMY' : 'DÜŞMAN')
                        : getKindMeta(rec.kind).label;
                const titleText = rec.group === 'boss' ? rec.name : loc(rec.raw, 'name');
                const subText = rec.group === 'module'
                    ? (loc(rec.raw, 'formula') || loc(rec.raw, 'statLabel') || loc(rec.raw, 'desc'))
                    : (loc(rec.raw, 'subtitle') || loc(rec.raw, 'behavior'));
                const thumbHtml = rec.asset
                    ? `<img src="${rec.asset}" alt="${titleText}">`
                    : `<i data-lucide="${rec.icon || 'cpu'}"></i>`;

                return `
                    <button type="button" class="wiki-global-result-item" data-group="${rec.group}" data-entry-id="${rec.id}" role="option">
                        <span class="wiki-global-result-thumb" style="color:${rec.color};">${thumbHtml}</span>
                        <span class="wiki-global-result-body">
                            <div class="wiki-global-result-title">${titleText}</div>
                            <div class="wiki-global-result-sub">${subText}</div>
                        </span>
                        <span class="cs-badge ${rec.group === 'boss' ? 'cs-badge-coral' : (rec.group === 'enemy' ? 'cs-badge-sky' : getKindMeta(rec.kind).cls)} font-mono">${badgeText}</span>
                    </button>
                `;
            }).join('');

            resultsEl.hidden = false;
            refreshIcons();

            resultsEl.querySelectorAll('.wiki-global-result-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    playUiSound('uiClick');
                    resultsEl.hidden = true;
                    jumpToEntry(btn.dataset.group, btn.dataset.entryId);
                });
            });
            return top;
        };

        input.addEventListener('input', () => runQuery(input.value));
        input.addEventListener('focus', () => {
            if (input.value.trim()) runQuery(input.value);
        });
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const top = runQuery(input.value);
                if (top.length) {
                    e.preventDefault();
                    playUiSound('uiClick');
                    resultsEl.hidden = true;
                    jumpToEntry(top[0].group, top[0].id);
                }
            } else if (e.key === 'Escape') {
                resultsEl.hidden = true;
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                playUiSound('uiClick');
                input.value = '';
                runQuery('');
                input.focus();
            });
        }

        document.addEventListener('click', e => {
            if (wrap && !wrap.contains(e.target)) {
                resultsEl.hidden = true;
            }
        });

        state.refreshGlobalResults = () => {
            if (input.value.trim() && !resultsEl.hidden) {
                runQuery(input.value);
            } else if (!input.value.trim() && countBadge) {
                countBadge.textContent = `${state.moduleRecords.length}+${(DATA.BOSSES || []).length + (DATA.ENEMIES || []).length} INDEX`;
            }
        };
    }

    // -------------------------------------------------------------------------
    // Tab Switching & GSAP Safe Animation
    // -------------------------------------------------------------------------
    function animatePanel(panel) {
        if (!panel || !global.gsap) return;
        const cards = panel.querySelectorAll('.module-card, .bestiary-card, .meta-combo-card, .sim-panel, .v10-mechanic-card');
        if (!cards.length) return;
        global.gsap.killTweensOf(cards);
        global.gsap.fromTo(
            cards,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.24, stagger: 0.015, ease: 'power2.out', clearProps: 'transform,opacity' }
        );
    }

    function switchTab(tabId) {
        state.activeTab = tabId;
        document.querySelectorAll('.wiki-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        let activePanel = null;
        document.querySelectorAll('.wiki-panel').forEach(panel => {
            const match = panel.id === tabId;
            panel.classList.toggle('active', match);
            if (match) activePanel = panel;
        });

        if (tabId === 'tab-meta') {
            renderMetaDpsChart();
        }
        animatePanel(activePanel);
        refreshIcons();
    }

    function setupTabs() {
        document.querySelectorAll('.wiki-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                playUiSound('uiClick');
                switchTab(btn.dataset.tab);
            });
        });
    }

    // -------------------------------------------------------------------------
    // Tab 1: 53-Module Database (Fuse.js Fuzzy EN + TR Search)
    // -------------------------------------------------------------------------
    function getKindMeta(kind) {
        const isEn = getLang() === 'en';
        if (kind === 'weapon') return { label: isEn ? 'WEAPON' : 'SİLAH', cls: 'cs-badge-sky' };
        if (kind === 'trinket') return { label: isEn ? 'SUPPORT' : 'DESTEK', cls: 'cs-badge-mint' };
        if (kind === 'evolution') return { label: isEn ? 'EVOLUTION' : 'EVRİM', cls: 'cs-badge-violet' };
        return { label: isEn ? 'MEGA EVO' : 'MEGA EVRİM', cls: 'cs-badge-amber' };
    }

    function renderModuleDatabase() {
        const grid = document.getElementById('wikiModuleGrid');
        if (!grid) return;

        const isEn = getLang() === 'en';
        const q = state.dbQuery.trim();
        let candidateModules = [];

        if (!q) {
            candidateModules = DATA.getAllModules();
        } else if (state.dbFuse) {
            candidateModules = state.dbFuse.search(q).map(hit => hit.item.raw);
        } else {
            const low = q.toLowerCase();
            candidateModules = DATA.getAllModules().filter(mod => {
                const ship = mod.shipExclusive ? DATA.SHIPS[mod.shipExclusive] : null;
                const haystack = [
                    mod.name, mod.nameEn, mod.id, mod.desc, mod.descEn,
                    mod.formula, mod.formulaEn, mod.statLabel, mod.statLabelEn,
                    ship && ship.name, ship && ship.nameEn
                ].filter(Boolean).join(' ').toLowerCase();
                return haystack.includes(low);
            });
        }

        const items = candidateModules.filter(mod => state.dbCat === 'all' || mod.kind === state.dbCat);

        if (!items.length) {
            grid.innerHTML = `<div class="cs-card" style="grid-column:1/-1;text-align:center;color:var(--text-muted);">${isEn ? 'No modules matched your fuzzy query.' : 'Aramanızla eşleşen modül bulunamadı.'}</div>`;
            return;
        }

        grid.innerHTML = items.map(mod => {
            const km = getKindMeta(mod.kind);
            const shipTag = mod.shipExclusive ? loc(DATA.SHIPS[mod.shipExclusive], 'name') : (isEn ? 'Universal' : 'Evrensel');
            const dpsLabel = isEn ? 'Est. DPS' : 'Tahmini DPS';
            const subLine = loc(mod, 'formula') || loc(mod, 'statLabel') || (mod.stats ? `${mod.stats.dps} ${dpsLabel} · CD ${mod.stats.cd}s` : '');
            const isHighlighted = state.highlightId === mod.id;

            return `
                <article class="module-card ${isHighlighted ? 'is-wiki-highlight' : ''}" data-entry-id="${mod.id}">
                    <div class="module-card-head">
                        <div class="module-icon-badge" style="color:${mod.color || '#38bdf8'};">
                            <i data-lucide="${mod.icon || 'cpu'}"></i>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-family:var(--font-display);font-weight:600;font-size:15px;">${loc(mod, 'name')}</div>
                            <div style="font-size:12px;color:var(--text-secondary);">${shipTag}</div>
                        </div>
                        <span class="cs-badge ${km.cls} font-mono">${mod.tier || km.label}</span>
                    </div>

                    ${subLine ? `<div class="module-formula-line">${subLine}</div>` : ''}

                    <p style="font-size:13px;margin:0;flex:1;">${loc(mod, 'desc')}</p>

                    <div style="display:flex;align-items:center;justify-content:space-between;padding-top:0.35rem;border-top:1px solid rgba(148,163,184,0.08);">
                        <span class="font-mono" style="font-size:11.5px;color:var(--text-muted);">${mod.id}</span>
                        <a href="tree.html?node=${encodeURIComponent(mod.id)}" class="cs-btn cs-btn-ghost" style="padding:0.34rem 0.68rem;font-size:12px;">
                            <i data-lucide="git-branch"></i>
                            <span>${isEn ? 'Open in Tree' : 'Ağaçta Aç'}</span>
                        </a>
                    </div>
                </article>
            `;
        }).join('');

        refreshIcons();
    }

    function setupDatabaseFilters() {
        const pills = document.getElementById('wikiCategoryPills');
        const search = document.getElementById('wikiSearchInput');
        if (pills) {
            pills.querySelectorAll('.filter-pill').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.dbCat = btn.dataset.cat;
                    playUiSound('uiClick');
                    pills.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p === btn));
                    renderModuleDatabase();
                });
            });
        }
        if (search) {
            search.addEventListener('input', () => {
                state.dbQuery = search.value;
                renderModuleDatabase();
            });
        }
    }

    // -------------------------------------------------------------------------
    // Tab 2: Sector & Ship Synergy (5600x5600 Cover Sectors)
    // -------------------------------------------------------------------------
    function renderSynergyTab() {
        const isEn = getLang() === 'en';
        const tbody = document.getElementById('synergyTableBody');
        if (tbody) {
            tbody.innerHTML = Object.values(DATA.SHIPS).map(ship => {
                const startW = DATA.WEAPONS[ship.starterWeapon];
                const sigW = DATA.WEAPONS[ship.sigWeapon];
                const sigT = DATA.TRINKETS[ship.sigTrinket];
                const sigE = DATA.EVOLUTIONS[ship.sigEvo];
                const sigM = DATA.SUPER_EVOLUTIONS[ship.sigMega];

                const idealMaps = Object.values(DATA.MAPS)
                    .filter(m => (m.recommendedShips || []).includes(ship.id))
                    .map(m => loc(m, 'name'))
                    .join(' · ');

                return `
                    <tr>
                        <td>
                            <div class="synergy-ship-cell">
                                <img src="${ship.asset}" alt="${loc(ship, 'name')}">
                                <div>
                                    <div style="font-family:var(--font-display);font-weight:600;color:var(--text-primary);">${loc(ship, 'name')}</div>
                                    <div style="font-size:11.5px;color:var(--text-muted);">${loc(ship, 'tag')}</div>
                                </div>
                            </div>
                        </td>
                        <td>${startW ? loc(startW, 'name') : ship.starterWeapon}</td>
                        <td>
                            <div style="color:var(--text-primary);font-weight:500;">${loc(sigW, 'name')} + ${loc(sigT, 'name')}</div>
                            <div style="font-size:12px;color:var(--accent-sky);">→ ${loc(sigE, 'name')}</div>
                        </td>
                        <td><span class="cs-badge cs-badge-amber">${loc(sigM, 'name')}</span></td>
                        <td style="font-size:12.5px;">${idealMaps || (isEn ? 'All Sectors' : 'Tüm Sektörler')}</td>
                        <td>
                            <a href="tree.html?ship=${ship.id}&node=${ship.sigEvo}" class="cs-btn cs-btn-ghost" style="padding:0.35rem 0.68rem;font-size:12px;">
                                ${isEn ? 'Open Tree' : 'Ağacı Aç'}
                            </a>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        const secCards = document.getElementById('synergySectorCards');
        if (secCards) {
            secCards.innerHTML = Object.values(DATA.MAPS).map(map => `
                <article class="module-card" style="padding:0;overflow:hidden;">
                    <img src="${map.asset}" alt="${loc(map, 'name')}" style="width:100%;height:130px;object-fit:cover;border-bottom:1px solid var(--border-subtle);">
                    <div style="padding:1rem;display:flex;flex-direction:column;gap:0.55rem;">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.4rem;">
                            <h3 style="font-size:16px;">${loc(map, 'name')}</h3>
                            <span class="cs-badge cs-badge-sky font-mono">${map.scoreMult}x ${isEn ? 'SCORE' : 'SKOR'}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                            <span class="cs-badge cs-badge-mint font-mono">5600×5600</span>
                            <span class="cs-badge cs-badge-amber font-mono">${loc(map, 'hazardTag')}</span>
                        </div>
                        <p style="font-size:12.5px;margin:0;">${loc(map, 'subtitle')}</p>
                        ${(map.arenaEvents || []).map(ev => `
                            <div class="module-formula-line">
                                <strong style="color:${ev.type === 'hazard' ? 'var(--accent-coral)' : 'var(--accent-mint)'};">${loc(ev, 'name')}:</strong> ${loc(ev, 'desc')}
                            </div>
                        `).join('')}
                        <p style="font-size:12px;color:var(--text-secondary);margin:0;">
                            <strong style="color:var(--text-primary);">${isEn ? 'Tactics' : 'Taktik'}:</strong> ${loc(map, 'tactics')}
                        </p>
                    </div>
                </article>
            `).join('');
        }
    }

    // -------------------------------------------------------------------------
    // Tab 3: Meta Combos & Interactive Chart.js DPS Comparison
    // -------------------------------------------------------------------------
    function renderMetaCombos() {
        const list = document.getElementById('metaCombosList');
        if (!list) return;
        const isEn = getLang() === 'en';

        const curated = [
            {
                title: 'Hyperion Kritik Işık Fırtınası',
                titleEn: 'Hyperion Critical Lightstorm',
                shipId: 'interceptor',
                nodeId: 'hyperionApex',
                tier: 'MEGA · S+',
                recipe: 'Foton Raylı Top + Hiper-İvme Çekirdeği + Gatling Fırtınası',
                recipeEn: 'Photon Railgun + Hyper-Overdrive Core + Gatling Tempest',
                summary: 'Dalga 20+ elit temizliğinde yüksek kritik çarpanı ([Q] +%12 Nişan Ustalığı ile sinerjili) ve 8 yönlü delici ışın kapsamı sunar.',
                summaryEn: 'Delivers massive crit multipliers (synergizing with [Q] +12% Aim Mastery) and 8-way piercing beams for Wave 20+ elite clears.'
            },
            {
                title: 'Zırhlı Kıyamet Kuşatma Kalesi',
                titleEn: 'Iron Dreadnought Siege Bastion',
                shipId: 'dreadnought',
                nodeId: 'ironDreadnought',
                tier: 'MEGA · S+',
                recipe: 'Balistik Flak Topu + Reaktif Zırh + Titan Koronası',
                recipeEn: 'Ballistic Flak + Reactive Armor + Titan Corona',
                summary: 'Sonsuz Overdrive ve Uçurum zorluğunda yüksek gövde bütünlüğü ve 5600×5600 siper duvarları arkasında 360° kesintisiz patlama halkası kurar.',
                summaryEn: 'Builds extreme hull integrity behind 5600×5600 bulkhead cover with an uninterrupted 360° detonation ring.'
            },
            {
                title: 'Tutulma Tanrısı Suikast Zinciri',
                titleEn: 'Eclipse Singularity Assassin Chain',
                shipId: 'phantom',
                nodeId: 'eclipseSingularity',
                tier: 'MEGA · S+',
                recipe: 'Hiper-Uzay Tırpanı + Gölge Pelerini + Kozmik Süpernova',
                recipeEn: 'Void Scythe + Phase Cloak + Cosmic Supernova',
                summary: 'Tek hedef Boss & Kalkan Pylonu eritme şampiyonu: arkadan +%120 zayıf nokta kritiğiyle Faz II eşiklerini hızla geçer.',
                summaryEn: 'Single-target Boss & Shield Pylon shredder: exploits +120% rear weakspot crits to tear past Phase II thresholds.'
            },
            {
                title: 'Omega Seraphim Komuta Filosu',
                titleEn: 'Omega Seraphim Command Fleet',
                shipId: 'valkyrie',
                nodeId: 'omegaJudgement',
                tier: 'MEGA · S',
                recipe: 'Otonom Dronelar / Füze Sürüsü + Kuantum Nişangah + Titan Koronası',
                recipeEn: 'Autonomous Drones / Missile Swarm + Quantum Targeting + Titan Corona',
                summary: 'Otonom sürü ve füze salvosu, Pylon kalkanlarını kırarken tüm ekrana kesintisiz güdümlü mızrak yağdırır.',
                summaryEn: 'Autonomous drone & missile salvos strip Shield Pylons cleanly while blanketing the arena with homing spears.'
            },
            {
                title: 'Olay Ufku Kriyo-Kalkan Kilidi',
                titleEn: 'Event Horizon Cryo-Shield Lock',
                shipId: 'tempest',
                nodeId: 'eventHorizon',
                tier: 'MEGA · S',
                recipe: 'Kriyo-Buzul Küresi / Enerji Diski + Kozmik Süpernova',
                recipeEn: 'Cryo-Glacial Orb / Energy Disc + Cosmic Supernova',
                summary: 'Sürekli yavaşlatma ve çifte tekillik kontrolüyle 5600×5600 Kasa ve Reaktör bölgelerini korurken kalabalık sürüleri durdurur.',
                summaryEn: 'Chains persistent slow fields and dual singularities to lock down Vault & Reactor capture zones against heavy swarms.'
            }
        ];

        list.innerHTML = curated.map(c => {
            const ship = DATA.SHIPS[c.shipId];
            return `
                <article class="meta-combo-card">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                        <strong style="font-family:var(--font-display);font-size:15px;">${isEn ? c.titleEn : c.title}</strong>
                        <span class="cs-badge cs-badge-amber font-mono">${c.tier}</span>
                    </div>
                    <div style="font-size:12px;color:var(--accent-sky);font-family:var(--font-mono);">${loc(ship, 'name')} · ${isEn ? c.recipeEn : c.recipe}</div>
                    <p style="font-size:13px;margin:0;">${isEn ? c.summaryEn : c.summary}</p>
                    <div>
                        <a href="tree.html?ship=${c.shipId}&node=${c.nodeId}" class="cs-btn cs-btn-ghost" style="padding:0.32rem 0.65rem;font-size:12px;">
                            <i data-lucide="git-branch"></i>
                            <span>${isEn ? 'Open in Evolution Tree' : 'Evrim Ağacında Aç'}</span>
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderMetaDpsChart() {
        const canvas = document.getElementById('metaDpsChartCanvas');
        if (!canvas || typeof global.Chart === 'undefined') return;
        const isEn = getLang() === 'en';

        let datasetItems = [];
        if (state.chartMode === 'evo') {
            datasetItems = Object.values(DATA.EVOLUTIONS);
        } else if (state.chartMode === 'mega') {
            datasetItems = Object.values(DATA.SUPER_EVOLUTIONS);
        } else {
            datasetItems = Object.values(DATA.SUPER_EVOLUTIONS).concat(Object.values(DATA.EVOLUTIONS));
        }

        const sorted = datasetItems
            .slice()
            .sort((a, b) => (b.stats.dps || 0) - (a.stats.dps || 0))
            .slice(0, 12);

        const labels = sorted.map(m => loc(m, 'name'));
        const values = sorted.map(m => m.stats.dps || 0);
        const colors = sorted.map(m => m.kind === 'superEvolution' ? 'rgba(245, 158, 11, 0.82)' : 'rgba(56, 189, 248, 0.78)');
        const datasetLabel = isEn ? 'Estimated Sustained DPS' : 'Tahmini Sürdürülebilir DPS';

        if (state.dpsChart) {
            state.dpsChart.data.labels = labels;
            state.dpsChart.data.datasets[0].label = datasetLabel;
            state.dpsChart.data.datasets[0].data = values;
            state.dpsChart.data.datasets[0].backgroundColor = colors;
            state.dpsChart.update();
            return;
        }

        state.dpsChart = new global.Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: datasetLabel,
                    data: values,
                    backgroundColor: colors,
                    borderRadius: 6,
                    barThickness: 18
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0d1320',
                        titleColor: '#e2e8f0',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(148,163,184,0.2)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono, monospace', size: 11 } }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#e2e8f0', font: { family: 'Inter, sans-serif', size: 12, weight: '500' } }
                    }
                }
            }
        });
    }

    function setupChartFilters() {
        const container = document.getElementById('chartFilterPills');
        if (!container) return;
        container.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                state.chartMode = btn.dataset.chartMode;
                playUiSound('uiClick');
                container.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p === btn));
                renderMetaDpsChart();
            });
        });
    }

    // -------------------------------------------------------------------------
    // Tab 4: v10.0 Tactical Systems Briefing + PNG Bestiary
    // -------------------------------------------------------------------------
    function renderV10SystemsBriefing() {
        const container = document.getElementById('v10SystemsBriefing');
        if (!container) return;
        const isEn = getLang() === 'en';
        const modes = Object.values(DATA.GAME_MODES || {});

        container.innerHTML = `
            <div class="v10-mechanics-grid">
                <article class="v10-mechanic-card">
                    <div class="v10-mechanic-head">
                        <div class="v10-mechanic-icon" style="color:var(--accent-sky);">
                            <i data-lucide="compass"></i>
                        </div>
                        <div>
                            <strong style="font-size:14.5px;color:var(--text-primary);">${isEn ? '5600×5600 Cover Arenas & Radar [M]' : '5600×5600 Siperli Arenalar & Radar [M]'}</strong>
                            <div style="font-size:11.5px;color:var(--text-muted);" class="font-mono">CosmicMapDirector · WORLD 5600×5600</div>
                        </div>
                    </div>
                    <p style="font-size:12.5px;margin:0;">
                        ${isEn
                            ? 'Solid terrain blocks sniper bolts and shapes choke corridors. Capture Vault Bunkers (4.0s within 195px) for CRD & Overdrive surges, fight inside Reactor Cores (235px aura), and toggle Tactical Radar with [M].'
                            : 'Katı engeller düşman keskin nişancı atışlarını keser ve koridor oluşturur. Sığınak Kasalarını (195px alanda 4.0sn) ele geçirerek CRD + Overdrive kazanın, Reaktör Çekirdeği aurasında (235px) savaşın ve [M] ile Taktik Radarı açın.'}
                    </p>
                    <div class="v10-obstacle-pills">
                        <span class="cs-badge cs-badge-slate font-mono">${isEn ? 'Asteroid Cluster' : 'Asteroid Kümesi'}</span>
                        <span class="cs-badge cs-badge-slate font-mono">${isEn ? 'Bulkhead Wall H/V' : 'Perde Duvar Y/D'}</span>
                        <span class="cs-badge cs-badge-mint font-mono">${isEn ? 'Vault Bunker' : 'Kasa Sığınağı'}</span>
                        <span class="cs-badge cs-badge-amber font-mono">${isEn ? 'Reactor Core' : 'Reaktör Çekirdeği'}</span>
                    </div>
                </article>

                <article class="v10-mechanic-card">
                    <div class="v10-mechanic-head">
                        <div class="v10-mechanic-icon" style="color:var(--accent-coral);">
                            <i data-lucide="shield"></i>
                        </div>
                        <div>
                            <strong style="font-size:14.5px;color:var(--text-primary);">${isEn ? 'Boss Shield Pylons & Rage Phase II' : 'Boss Kalkan Pylonları & Öfke Fazı II'}</strong>
                            <div style="font-size:11.5px;color:var(--text-muted);" class="font-mono">2–3 Orbiting Pylons · -65% DMG</div>
                        </div>
                    </div>
                    <p style="font-size:12.5px;margin:0;">
                        ${isEn
                            ? 'Dreadnought Bosses deploy 2–3 orbiting Shield Pylons (boss.r + 74px) that cut incoming Boss damage by 65% until destroyed. Below 50% HP, Bosses enter Rage Phase II (+32% speed, double salvos).'
                            : 'Ana Bosslar yörüngede 2–3 Kalkan Pylonu (boss.r + 74px) açar; direkler sağlamken Boss’a giden hasar %65 azalır. Önce Pylonları kırın! %50 HP altında Öfke Fazı II (+%32 hız ve çift salvo) tetiklenir.'}
                    </p>
                </article>

                <article class="v10-mechanic-card">
                    <div class="v10-mechanic-head">
                        <div class="v10-mechanic-icon" style="color:var(--accent-amber);">
                            <i data-lucide="zap"></i>
                        </div>
                        <div>
                            <strong style="font-size:14.5px;color:var(--text-primary);">${isEn ? '[E] Overdrive & [Q] Aim Mastery' : '[E] Kozmik Overdrive & [Q] Nişan Ustalığı'}</strong>
                            <div style="font-size:11.5px;color:var(--text-muted);" class="font-mono">[E] 6.0s Surge · [Q] +12% CRIT</div>
                        </div>
                    </div>
                    <p style="font-size:12.5px;margin:0;">
                        ${isEn
                            ? 'Press [E] at 100% Overdrive charge for a 6.0s Cosmic Overdrive shockwave (+20% Damage, +45% Fire Rate, +25% Speed). Toggle [Q] to manual Mouse Twin-Stick aim for an instant +12% Crit Chance Aim Mastery bonus.'
                            : 'Overdrive %100 dolduğunda [E] tuşu 6.0sn Kozmik Overdrive patlaması başlatır (+%20 Hasar, +%45 Atış Hızı, +%25 Hız). [Q] ile manuel Fare Twin-Stick nişana geçerek +%12 Kritik Şans Nişan Ustalığı bonusu kazanın.'}
                    </p>
                </article>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;margin-top:0.2rem;">
                <h2 style="font-size:19px;">${isEn ? '5 v10.0 Playable Operation Modes' : '5 Oynanabilir v10.0 Operasyon Modu'}</h2>
                <a href="modes.html" class="cs-btn cs-btn-mint" style="padding:0.42rem 0.8rem;font-size:12.5px;">
                    <i data-lucide="gamepad-2"></i>
                    <span>${isEn ? 'Modes & Daily Decoder' : 'Modlar & Günlük Protokol Merkezi'}</span>
                </a>
            </div>

            <div class="v10-modes-strip">
                ${modes.map(m => {
                    const limitLabel = m.timeLimitSec
                        ? `${Math.round(m.timeLimitSec / 60)} ${isEn ? 'Min Cap' : 'Dk Süre'}`
                        : (m.waveCap ? `${isEn ? 'Wave' : 'Dalga'} ${m.waveCap}` : (isEn ? 'Infinite Waves' : 'Sonsuz Dalga'));
                    return `
                        <div class="v10-mode-chip" style="border-top:2px solid ${m.color || '#38bdf8'};">
                            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.4rem;">
                                <strong style="font-size:13.5px;color:var(--text-primary);">${loc(m, 'name')}</strong>
                                <span class="cs-badge cs-badge-sky font-mono" style="font-size:10px;">${loc(m, 'shortTag')}</span>
                            </div>
                            <div style="font-size:11.5px;color:var(--text-secondary);">${loc(m, 'desc')}</div>
                            <div class="font-mono" style="font-size:11px;color:${m.color || 'var(--accent-sky)'};margin-top:auto;">
                                ${limitLabel} · XP ${m.xpMult}x · CRD ${m.creditMult}x
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderBestiary() {
        const isEn = getLang() === 'en';
        const bossGrid = document.getElementById('bestiaryBossGrid');
        if (bossGrid) {
            bossGrid.innerHTML = DATA.BOSSES.map(boss => `
                <article class="bestiary-card ${state.highlightId === boss.id ? 'is-wiki-highlight' : ''}" data-entry-id="${boss.id}">
                    <div class="bestiary-head">
                        <img src="${boss.asset}" alt="${boss.name}" class="bestiary-sprite">
                        <div>
                            <h3 style="font-size:16px;">${boss.name}</h3>
                            <div style="font-size:12px;color:var(--text-secondary);">${loc(boss, 'subtitle')}</div>
                            <span class="cs-badge cs-badge-coral font-mono" style="margin-top:0.3rem;">${loc(boss, 'spawnWave')}</span>
                        </div>
                    </div>
                    <ul style="margin:0;padding-left:1.15rem;font-size:12.5px;color:var(--text-secondary);display:flex;flex-direction:column;gap:0.28rem;">
                        ${(isEn && boss.mechanicsEn ? boss.mechanicsEn : boss.mechanics).map(m => `<li>${m}</li>`).join('')}
                    </ul>
                    <div class="module-formula-line" style="color:var(--accent-mint);">
                        ${isEn ? 'Tactic' : 'Taktik'}: ${loc(boss, 'tactics')}
                    </div>
                </article>
            `).join('');
        }

        const enemyGrid = document.getElementById('bestiaryEnemyGrid');
        if (enemyGrid) {
            enemyGrid.innerHTML = DATA.ENEMIES.map(en => {
                const isHigh = en.threat === 'KRİTİK' || en.threat === 'YÜKSEK';
                return `
                    <article class="bestiary-card ${state.highlightId === en.id ? 'is-wiki-highlight' : ''}" data-entry-id="${en.id}">
                        <div class="bestiary-head">
                            <img src="${en.asset}" alt="${loc(en, 'name')}" class="bestiary-sprite">
                            <div>
                                <h3 style="font-size:15.5px;">${loc(en, 'name')}</h3>
                                <div style="font-size:12px;color:var(--text-secondary);">${en.hpNote} · ${isEn ? 'Speed' : 'Hız'}: ${loc(en, 'speedNote')}</div>
                                <span class="cs-badge ${isHigh ? 'cs-badge-coral' : 'cs-badge-sky'} font-mono" style="margin-top:0.3rem;">
                                    ${isEn ? 'THREAT' : 'TEHDİT'}: ${loc(en, 'threat')}
                                </span>
                            </div>
                        </div>
                        <p style="font-size:13px;margin:0;">${loc(en, 'behavior')}</p>
                        <div class="module-formula-line">
                            <strong style="color:var(--text-primary);">${isEn ? 'Counterplay' : 'Karşı Önlem'}:</strong> ${loc(en, 'counter')}
                        </div>
                    </article>
                `;
            }).join('');
        }
    }

    // -------------------------------------------------------------------------
    // Tab 5: Synthesis Simulator & Cosmic Decay Calculator
    // -------------------------------------------------------------------------
    function setupSimulator() {
        const wSel = document.getElementById('simWeaponSelect');
        const tSel = document.getElementById('simTrinketSelect');
        const outEl = document.getElementById('simSynthOutput');
        const autoBtn = document.getElementById('simAutoPairBtn');

        if (wSel && tSel && outEl) {
            const prevW = wSel.value;
            const prevT = tSel.value;
            const isEn = getLang() === 'en';
            const uniTag = isEn ? ' · UNIVERSAL' : ' · EVRENSEL';

            wSel.innerHTML = Object.values(DATA.WEAPONS).map(w => {
                const owner = w.shipExclusive ? ` · ${DATA.SHIPS[w.shipExclusive].codeName}` : uniTag;
                return `<option value="${w.id}">${loc(w, 'name')}${owner}</option>`;
            }).join('');

            tSel.innerHTML = Object.values(DATA.TRINKETS).map(tMod => {
                const owner = tMod.shipExclusive ? ` · ${DATA.SHIPS[tMod.shipExclusive].codeName}` : uniTag;
                return `<option value="${tMod.id}">${loc(tMod, 'name')}${owner}</option>`;
            }).join('');

            if (prevW && DATA.WEAPONS[prevW]) wSel.value = prevW;
            if (prevT && DATA.TRINKETS[prevT]) tSel.value = prevT;

            const updateSynth = () => {
                const enNow = getLang() === 'en';
                const w = DATA.WEAPONS[wSel.value];
                const tMod = DATA.TRINKETS[tSel.value];
                const evo = DATA.findEvolutionForPair(wSel.value, tSel.value);

                if (evo) {
                    const nextMegas = Object.values(DATA.SUPER_EVOLUTIONS).filter(m => (m.evoPool || []).includes(evo.id));
                    outEl.innerHTML = `
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                            <strong style="font-size:16px;color:var(--accent-mint);">${enNow ? 'Synthesis Result' : 'Sentez Sonucu'}: ${loc(evo, 'name')}</strong>
                            <span class="cs-badge cs-badge-violet font-mono">${evo.tier} · ${evo.stats.dps} DPS</span>
                        </div>
                        <div style="font-size:12.5px;color:var(--text-secondary);">${loc(evo, 'desc')}</div>
                        ${nextMegas.length ? `
                            <div class="module-formula-line" style="color:var(--accent-amber);">
                                ${enNow ? 'Mega Chain' : 'Mega Zinciri'}: ${nextMegas.map(m => loc(m, 'name')).join(' · ')}
                            </div>
                        ` : ''}
                        <div>
                            <a href="tree.html?node=${evo.id}" class="cs-btn cs-btn-primary" style="font-size:13px;">
                                <i data-lucide="git-branch"></i>
                                <span>${enNow ? 'Inspect in Evolution Tree' : 'Evrim Ağacında İncele'}</span>
                            </a>
                        </div>
                    `;
                } else {
                    const pairT = w && w.pairTrinket ? DATA.TRINKETS[w.pairTrinket] : null;
                    outEl.innerHTML = `
                        <div style="font-weight:600;color:var(--accent-coral);">${enNow ? 'No Synthesis Match' : 'Sentez Eşleşmesi Yok'}</div>
                        <p style="font-size:13px;margin:0;">${enNow ? `${loc(w, 'name')} + ${loc(tMod, 'name')} do not directly evolve.` : `${loc(w, 'name')} ile ${loc(tMod, 'name')} doğrudan evrim oluşturmaz.`}</p>
                        ${pairT ? `
                            <div class="module-formula-line">
                                ${enNow ? 'Recommended pair' : 'Önerilen eşleşme'}: <strong style="color:var(--accent-sky);">${loc(w, 'name')} + ${loc(pairT, 'name')}</strong>
                            </div>
                        ` : ''}
                    `;
                }
                refreshIcons();
            };

            if (!wSel.dataset.bound) {
                wSel.dataset.bound = '1';
                wSel.addEventListener('change', updateSynth);
                tSel.addEventListener('change', updateSynth);
                if (autoBtn) {
                    autoBtn.addEventListener('click', () => {
                        const w = DATA.WEAPONS[wSel.value];
                        if (w && w.pairTrinket) {
                            tSel.value = w.pairTrinket;
                            playUiSound('uiConfirm');
                            updateSynth();
                        }
                    });
                }
            }
            updateSynth();
        }

        // Right panel: Combat Telemetry & Cosmic Decay
        const shipSel = document.getElementById('simShipSelect');
        const diffSel = document.getElementById('simDiffSelect');
        const waveSlider = document.getElementById('simWaveSlider');
        const waveLabel = document.getElementById('simWaveLabel');
        const kpiBox = document.getElementById('simLiveKpis');
        const decayBox = document.getElementById('simDecayNotes');

        if (shipSel && diffSel && waveSlider && kpiBox && decayBox) {
            const prevShip = shipSel.value;
            const prevDiff = diffSel.value || 'normal';

            shipSel.innerHTML = Object.values(DATA.SHIPS).map(s =>
                `<option value="${s.id}">${loc(s, 'name')} (${s.codeName})</option>`
            ).join('');

            diffSel.innerHTML = Object.values(DATA.DIFFICULTIES).map(d =>
                `<option value="${d.id}">${loc(d, 'label')}</option>`
            ).join('');

            if (prevShip && DATA.SHIPS[prevShip]) shipSel.value = prevShip;
            diffSel.value = DATA.DIFFICULTIES[prevDiff] ? prevDiff : 'normal';

            const computeCombatSim = () => {
                const enNow = getLang() === 'en';
                const ship = DATA.SHIPS[shipSel.value] || DATA.SHIPS.interceptor;
                const diff = DATA.DIFFICULTIES[diffSel.value] || DATA.DIFFICULTIES.normal;
                const wave = Math.max(1, parseInt(waveSlider.value, 10) || 1);
                const bonuses = PERSIST.getBonuses();

                if (waveLabel) waveLabel.textContent = enNow ? `Wave ${wave}` : `Dalga ${wave}`;

                const effHp = Math.round(ship.hp * bonuses.hpMult);
                const effSh = Math.round(ship.sh * bonuses.hpMult);
                const ehp = Math.round(effHp / Math.max(0.25, 1 - ship.armor) + effSh);

                // Exact game.js Cosmic Decay formula (game.js line 386)
                const decay = wave < 25 ? 1.0 : Math.max(0.15, Math.pow(0.96, wave - 24));
                const decayPct = Math.round(decay * 100);

                // Exact game.js Boss HP scaling formula (game.js lines 151-177, 1035-1038)
                const bossIdx = wave < 5 ? 0 : ((Math.floor(wave / 5) - 1) % BOSS_BASE_HPS.length);
                const bossBase = BOSS_BASE_HPS[bossIdx];
                const waveScale = 1 + Math.max(0, wave - 5) * 0.16 + (wave > 15 ? (wave - 15) * 0.12 : 0);
                const estBossHp = Math.round(bossBase * (diff.bhm || 1) * waveScale);
                const locale = enNow ? 'en-US' : 'tr-TR';

                kpiBox.innerHTML = `
                    <div class="sim-kpi">
                        <span>${enNow ? 'Effective EHP' : 'Efektif EHP'}</span>
                        <strong style="color:var(--accent-sky);">${ehp} EHP</strong>
                    </div>
                    <div class="sim-kpi">
                        <span>${enNow ? 'Heal/Shield Efficacy' : 'Şifa/Kalkan Verimi'}</span>
                        <strong style="color:${decayPct < 60 ? 'var(--accent-coral)' : 'var(--accent-mint)'};">${enNow ? `${decayPct}%` : `%${decayPct}`}</strong>
                    </div>
                    <div class="sim-kpi">
                        <span>${enNow ? 'Score Multiplier' : 'Skor Çarpanı'}</span>
                        <strong style="color:var(--accent-amber);">${diff.sm.toFixed(1)}x</strong>
                    </div>
                `;

                decayBox.innerHTML = enNow ? `
                    <div style="font-weight:600;color:var(--text-primary);">Workshop-Synced Combat Analysis</div>
                    <div>• Active Workshop Multipliers: <strong>Dmg ${bonuses.dmgMult.toFixed(2)}x</strong>, <strong>Hull ${bonuses.hpMult.toFixed(2)}x</strong>, <strong>Speed ${bonuses.spdMult.toFixed(2)}x</strong>, <strong>Overdrive ${(bonuses.overdriveMult || 1).toFixed(2)}x</strong></div>
                    <div>• Wave ${wave} Boss Pool (<em>${loc(diff, 'label')}</em>): <strong>${estBossHp.toLocaleString(locale)} HP</strong> + 2–3 Shield Pylons (-65% DMG)</div>
                    <div>• ${wave < 25
                        ? 'Cosmic Decay is inactive before Wave 25 (100% heal & shield regen).'
                        : `Cosmic Decay active! Shield & healing operate at ${decayPct}% capacity (15% floor).`
                    }</div>
                ` : `
                    <div style="font-weight:600;color:var(--text-primary);">Atölye Bonusları Dahil Analiz</div>
                    <div>• Aktif Atölye Çarpanları: <strong>Hasar ${bonuses.dmgMult.toFixed(2)}x</strong>, <strong>Gövde ${bonuses.hpMult.toFixed(2)}x</strong>, <strong>Hız ${bonuses.spdMult.toFixed(2)}x</strong>, <strong>Overdrive ${(bonuses.overdriveMult || 1).toFixed(2)}x</strong></div>
                    <div>• Dalga ${wave} tahmini Boss havuzu (<em>${loc(diff, 'label')}</em>): <strong>${estBossHp.toLocaleString(locale)} HP</strong> + 2–3 Kalkan Pylonu (-%65 Hasar)</div>
                    <div>• ${wave < 25
                        ? 'Dalga 25 öncesinde Kozmik Çürüme aktif değildir (%100 şifa verimliliği).'
                        : `Kozmik Çürüme aktif! Şifa ve kalkan yenileme hızı %${decayPct} kapasiteyle çalışır (taban %15).`
                    }</div>
                `;
            };

            if (!shipSel.dataset.bound) {
                shipSel.dataset.bound = '1';
                shipSel.addEventListener('change', computeCombatSim);
                diffSel.addEventListener('change', computeCombatSim);
                waveSlider.addEventListener('input', computeCombatSim);
            }
            computeCombatSim();
        }
    }

    function onLanguageChange() {
        registerI18n();
        syncAudioHeaderUi();
        const creditsEl = document.getElementById('creditsDisplay');
        if (creditsEl) {
            creditsEl.textContent = PERSIST.load().credits.toLocaleString(getLang() === 'en' ? 'en-US' : 'tr-TR');
        }
        renderModuleDatabase();
        renderSynergyTab();
        renderMetaCombos();
        renderV10SystemsBriefing();
        renderBestiary();
        setupSimulator();
        if (state.dpsChart || state.activeTab === 'tab-meta') {
            renderMetaDpsChart();
        }
        if (typeof state.refreshGlobalResults === 'function') {
            state.refreshGlobalResults();
        }
        refreshIcons();
    }

    function init() {
        registerI18n();
        buildSearchIndexes();
        setupHeader();
        setupTabs();
        setupGlobalSearch();
        setupDatabaseFilters();
        setupChartFilters();

        renderModuleDatabase();
        renderSynergyTab();
        renderMetaCombos();
        renderV10SystemsBriefing();
        renderBestiary();
        setupSimulator();

        // Check URL hash/tab deep link
        const params = new URLSearchParams(global.location.search);
        const tabParam = params.get('tab');
        if (tabParam && document.getElementById(tabParam)) {
            switchTab(tabParam);
        }

        global.addEventListener('cosmic:langchange', onLanguageChange);
        refreshIcons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
