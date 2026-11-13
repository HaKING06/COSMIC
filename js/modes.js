// =============================================================================
// COSMIC SURVIVORS v10.0 — TACTICAL OPERATIONS, DAILY PROTOCOL & ARENA HUB (js/modes.js)
// Daily Seeded Decoder, 5 Operation Modes, 5600x5600 Obstacle Arenas & Threat Curves
// =============================================================================
(function (global) {
    'use strict';

    const DATA = global.COSMIC_DATA;
    const PERSIST = global.CosmicPersistence;
    const LB = global.CosmicLeaderboard;

    const MODES_I18N = {
        tr: {
            'meta.title': 'COSMIC SURVIVORS v10.0 — Oyun Modları, Günlük Protokol & Taktik Harita Merkezi',
            'modes.topbarVersion': 'V10.0 TACTICAL OPERATIONS',
            'nav.hangar': 'Hangar',
            'nav.tree': 'Evrim Ağacı',
            'nav.armory': 'Cephanelik',
            'nav.modes': 'Modlar',
            'nav.wiki': 'Ansiklopedi',
            'nav.about': 'Hakkında',
            'common.audioOn': 'Ses Açık',
            'common.audioOff': 'Sessiz',
            'modes.hero.badge1': 'V10.0 GENESIS · 5 OPERASYON MODU',
            'modes.hero.badge2': '5600×5600 ENGELLİ ARENALAR',
            'modes.hero.badge3': 'GÜNLÜK TOHUM KOD ÇÖZÜCÜ',
            'modes.hero.title': 'Operasyon Modları, Günlük Protokol & Taktik Harita Merkezi',
            'modes.hero.sub': 'Günlük deterministik tohumlu görevleri çözün, 5 farklı savaş modunu geminize göre başlatın ve 5600×5600 siperli arenalar ile canlı zorluk eğrilerini analiz edin.',
            'modes.hero.ctaModes': '5 Operasyon Modu',
            'modes.hero.ctaArenas': '5600×5600 Siper & Sektörler',
            'modes.hero.ctaThreat': 'Zorluk Eğrisi',
            'modes.daily.eyebrow': 'BÖLÜM 01 · GÜNLÜK PROTOKOL KOD ÇÖZÜCÜ',
            'modes.daily.title': 'Bugünün Günlük Tohumlu Protokolü',
            'modes.daily.sub': 'Takvime bağlı deterministik tohum ile sabit sektör ve çift savaş mutatörü tüm pilotlar için eşittir.',
            'modes.daily.multPill': '2.20x SKOR · 2.00x CRD',
            'modes.daily.activeMutators': 'AKTİF GÜNLÜK MUTATÖRLER (2)',
            'modes.daily.combinedMods': 'BİRLEŞİK SAYISAL DEĞİŞTİRİCİLER',
            'modes.daily.chooseShip': 'GÜNLÜK GÖREV GEMİSİ',
            'modes.daily.launchBtn': 'GÜNLÜK PROTOKOLÜ BAŞLAT',
            'modes.daily.todaySector': 'BUGÜNÜN SEKTÖRÜ',
            'modes.daily.recShip': 'ÖNERİLEN YILDIZ GEMİSİ',
            'modes.daily.bestTitle': 'BUGÜNÜN YEREL GÜNLÜK REKORU',
            'modes.daily.noBest': 'Bugün henüz günlük protokol kaydı yok. İlk uçuşunla günlük rekoru belirle!',
            'modes.daily.waveShort': 'Dalga',
            'modes.daily.killsShort': 'İmha',
            'modes.grid.eyebrow': 'BÖLÜM 02 · OPERASYON PROTOKOLÜ SEÇİMİ',
            'modes.grid.title': '5 Oynanabilir Operasyon Modu',
            'modes.grid.sub': 'Dalga sınırları, çarpanlar, taktik kurallar ve her kartta 1 tıkla gemi seçip anında savaşa başlama bağlantısı.',
            'modes.grid.targetSector': 'Hedef Sektör',
            'modes.grid.targetDiff': 'Zorluk Seviyesi',
            'modes.grid.waveLimit': 'Dalga Sınırı',
            'modes.grid.unlimited': 'Sınırsız',
            'modes.grid.time5m': '5:00 (300sn)',
            'modes.grid.xp': 'XP',
            'modes.grid.score': 'Skor',
            'modes.grid.crd': 'CRD',
            'modes.grid.shipLabel': 'Görev Gemisi',
            'modes.grid.launchMode': 'Modu Başlat',
            'modes.grid.dailyLockedNote': 'Günlük Protokol bugünün sabit sektörünü ve Standart (Normal) zorluğu kullanır.',
            'modes.grid.personalBest': 'Kişisel Rekor',
            'modes.grid.noRecord': 'Kayıt yok',
            'modes.arenas.eyebrow': 'BÖLÜM 03 · 5600×5600 SEKTÖRLER & SİPER MEKANİKLERİ',
            'modes.arenas.title': '4 Açık Uzay Arenası & Fiziksel Siper Engelleri',
            'modes.arenas.sub': 'Her sektör 5600×5600 ölçekli taktik haritada fiziksel siperler, ele geçirilebilir Sığınaklar, Reaktör halkaları ve Taktik Radar içerir.',
            'modes.arenas.radarBadge': '[M] CANLI TAKTİK RADAR',
            'modes.arenas.deployHere': 'Bu Sektörde Başlat',
            'modes.arenas.tacticNote': 'Taktik Not',
            'modes.arenas.recShips': 'Önerilen Gemiler',
            'modes.obstacles.title': '5 Gerçek Arena Engel Türü & Taktik Siper Mekaniği',
            'modes.obstacles.sub': 'Siper yapıları düşman nişancı ışınlarını ve plazma atışlarını fiziksel olarak durdurur; Sığınak ve Reaktörler ise risk-ödül bölgeleri oluşturur.',
            'modes.threat.eyebrow': 'BÖLÜM 04 · CANLI TEHDİT ANALİTİĞİ',
            'modes.threat.title': 'Dalga 1–25 Canlı Tehdit & Zorluk Ölçekleme Eğrisi',
            'modes.threat.sub': 'Keşif (Easy), Standart, Komutan ve Hiçlik (Nightmare) zorluklarında Düşman HP %, Hasar % ve Boss HP ölçeklemesini karşılaştırın.',
            'modes.threat.metricHp': 'Düşman HP %',
            'modes.threat.metricDmg': 'Düşman Hasar %',
            'modes.threat.metricBoss': 'Boss HP Ölçeği'
        },
        en: {
            'meta.title': 'COSMIC SURVIVORS v10.0 — Tactical Operations, Daily Protocol & Arena Hub',
            'modes.topbarVersion': 'V10.0 TACTICAL OPERATIONS',
            'nav.hangar': 'Hangar',
            'nav.tree': 'Evolution Tree',
            'nav.armory': 'Armory',
            'nav.modes': 'Modes',
            'nav.wiki': 'Encyclopedia',
            'nav.about': 'About',
            'common.audioOn': 'Audio On',
            'common.audioOff': 'Muted',
            'modes.hero.badge1': 'V10.0 GENESIS · 5 OPERATION MODES',
            'modes.hero.badge2': '5600×5600 OBSTACLE ARENAS',
            'modes.hero.badge3': 'DAILY SEED DECODER',
            'modes.hero.title': 'Operation Modes, Daily Protocol & Tactical Arena Hub',
            'modes.hero.sub': 'Decode today’s deterministic Daily Seed, configure and launch all 5 combat modes in one click, and study 5600×5600 cover arenas & difficulty scaling curves.',
            'modes.hero.ctaModes': '5 Operation Modes',
            'modes.hero.ctaArenas': '5600×5600 Cover & Sectors',
            'modes.hero.ctaThreat': 'Difficulty Curve',
            'modes.daily.eyebrow': 'SECTION 01 · DAILY PROTOCOL DECODER',
            'modes.daily.title': "Today's Daily Seeded Protocol",
            'modes.daily.sub': 'Calendar-bound deterministic seed locking the identical sector and dual combat mutators for every pilot today.',
            'modes.daily.multPill': '2.20x SCORE · 2.00x CRD',
            'modes.daily.activeMutators': 'ACTIVE DAILY MUTATORS (2)',
            'modes.daily.combinedMods': 'COMBINED NUMERIC MODIFIERS',
            'modes.daily.chooseShip': 'DAILY DEPLOYMENT SHIP',
            'modes.daily.launchBtn': 'LAUNCH DAILY',
            'modes.daily.todaySector': "TODAY'S SECTOR",
            'modes.daily.recShip': 'RECOMMENDED STARSHIP',
            'modes.daily.bestTitle': "TODAY'S LOCAL DAILY BEST",
            'modes.daily.noBest': 'No Daily record logged today yet. Launch a sortie to set today’s benchmark!',
            'modes.daily.waveShort': 'Wave',
            'modes.daily.killsShort': 'Kills',
            'modes.grid.eyebrow': 'SECTION 02 · OPERATION PROTOCOL MATRIX',
            'modes.grid.title': '5 Playable Operation Modes',
            'modes.grid.sub': 'Compare wave caps, XP/Score/CRD multipliers, tactical rules, and launch directly with a 1-click ship selector on every card.',
            'modes.grid.targetSector': 'Target Sector',
            'modes.grid.targetDiff': 'Difficulty Tier',
            'modes.grid.waveLimit': 'Wave Cap',
            'modes.grid.unlimited': 'Unlimited',
            'modes.grid.time5m': '5:00 (300s)',
            'modes.grid.xp': 'XP',
            'modes.grid.score': 'Score',
            'modes.grid.crd': 'CRD',
            'modes.grid.shipLabel': 'Deployment Ship',
            'modes.grid.launchMode': 'Launch Mode',
            'modes.grid.dailyLockedNote': 'Daily Protocol locks today’s seeded sector and Standard (Normal) difficulty.',
            'modes.grid.personalBest': 'Personal Best',
            'modes.grid.noRecord': 'No record yet',
            'modes.arenas.eyebrow': 'SECTION 03 · 5600×5600 SECTORS & SOLID COVER',
            'modes.arenas.title': '4 Open-Space Arenas & Solid Cover Obstacles',
            'modes.arenas.sub': 'Every sector spans a 5600×5600 tactical grid with solid cover geometry, capturable Vault Bunkers, Reactor Cores, and live Tactical Radar.',
            'modes.arenas.radarBadge': '[M] LIVE TACTICAL RADAR',
            'modes.arenas.deployHere': 'Deploy to Sector',
            'modes.arenas.tacticNote': 'Tactical Intel',
            'modes.arenas.recShips': 'Recommended Ships',
            'modes.obstacles.title': '5 Real Arena Obstacle Sprites & Tactical Cover Mechanics',
            'modes.obstacles.sub': 'Solid structures block enemy sniper lines and plasma shots while Bunkers and Reactors create high-value capture & overdrive zones.',
            'modes.threat.eyebrow': 'SECTION 04 · LIVE THREAT TELEMETRY',
            'modes.threat.title': 'Wave 1–25 Live Threat & Difficulty Curve',
            'modes.threat.sub': 'Compare Enemy HP %, Enemy Damage %, and Boss HP Scaling across Scout (Easy), Standard, Commander, and Abyss (Nightmare).',
            'modes.threat.metricHp': 'Enemy HP %',
            'modes.threat.metricDmg': 'Enemy Damage %',
            'modes.threat.metricBoss': 'Boss HP Scaling'
        }
    };

    const OBSTACLES_META = [
        {
            id: 'asteroid_cluster',
            asset: 'assets/sprites/obstacles/asteroid_cluster.png',
            name: 'Asteroit Kümesi',
            nameEn: 'Asteroid Cluster',
            shape: 'Daire Çarpıştırıcı · r: 68–95px',
            shapeEn: 'Circle Collider · r: 68–95px',
            tag: 'FİZİKSEL SİPER',
            tagEn: 'SOLID COVER',
            badgeCls: 'cs-badge-sky',
            desc: 'Takyon Keskin Nişancı lazerlerini ve düşman plazma mermilerini keser; sürü manevralarında doğal kalkan koridoru oluşturur.',
            descEn: 'Intercepts Tachyon Sniper beams and hostile plasma shots while shaping natural kiting lanes.'
        },
        {
            id: 'bulkhead_h',
            asset: 'assets/sprites/obstacles/bulkhead_h.png',
            name: 'Yatay Zırhlı Perde Duvar',
            nameEn: 'Horizontal Armored Bulkhead',
            shape: 'AABB Dikdörtgen · 230×120px',
            shapeEn: 'AABB Rect · 230×120px',
            tag: 'AĞIR SİPER',
            tagEn: 'HEAVY WALL',
            badgeCls: 'cs-badge-slate',
            desc: '230px genişliğindeki yatay istasyon enkazı; yoğun Boss salvosu veya nişancı kilitlenmesi sırasında arkasında güvenli hat açar.',
            descEn: '230px wide station bulkhead providing reliable horizontal cover against heavy Boss barrages and sniper locks.'
        },
        {
            id: 'bulkhead_v',
            asset: 'assets/sprites/obstacles/bulkhead_v.png',
            name: 'Dikey Zırhlı Perde Duvar',
            nameEn: 'Vertical Armored Bulkhead',
            shape: 'AABB Dikdörtgen · 120×230px',
            shapeEn: 'AABB Rect · 120×230px',
            tag: 'DAR BOĞAZ',
            tagEn: 'CHOKE COVER',
            badgeCls: 'cs-badge-slate',
            desc: '230px yüksekliğindeki dikey zırh bloğu; kalabalık Kamikaze sürülerini bölerek yan kanat dönüşlerine zaman kazandırır.',
            descEn: '230px tall vertical armor barrier that splits rushing Kamikaze packs and protects flanking maneuvers.'
        },
        {
            id: 'vault_bunker',
            asset: 'assets/sprites/obstacles/vault_bunker.png',
            name: 'Sektör Kasa Sığınağı (Vault)',
            nameEn: 'Sector Vault Bunker',
            shape: 'Sığınak · Ele Geçirme r: 195px (4.0sn)',
            shapeEn: 'Bunker · Capture r: 195px (4.0s)',
            tag: 'GANİMET & BUFF',
            tagEn: 'CAPTURE POI',
            badgeCls: 'cs-badge-mint',
            desc: '195px halkası içinde 4.0sn kalarak mührü çözün: +30% Ateş Hızı taşması ve +350 Atölye Kredisi kazandırır; Taktik Radarda parlar.',
            descEn: 'Hold within its 195px capture ring for 4.0s to unlock +30% Fire Rate surge and +350 Credits; pinged on Tactical Radar.'
        },
        {
            id: 'reactor_core',
            asset: 'assets/sprites/obstacles/reactor_core.png',
            name: 'Taktik Reaktör Çekirdeği',
            nameEn: 'Tactical Reactor Core',
            shape: 'Aura r: 235px · Overdrive / Plazma Darbesi',
            shapeEn: 'Aura r: 235px · Overdrive / Pulse',
            tag: 'OVERDRIVE BÖLGESİ',
            tagEn: 'OVERDRIVE ZONE',
            badgeCls: 'cs-badge-amber',
            desc: 'Sektör 9 ve Nebulada 235px içinde +%22 Ateş Hızı & +%12 Hız verir; Kara Delik & Dysonda 6.4sn arayla çift taraflı plazma darbesi yayar.',
            descEn: 'Grants +22% Fire Rate & +12% Speed inside 235px in Sector 9 & Nebula; discharges 6.4s dual-damage plasma pulses in Black Hole & Dyson.'
        }
    ];

    const state = {
        selectedSector: 'sector9',
        selectedDiff: 'normal',
        selectedShipByMode: {},
        dailyShipId: 'interceptor',
        threatMetric: 'enemyHp',
        threatChart: null
    };

    function getLang() {
        if (global.CosmicI18n && typeof global.CosmicI18n.getLang === 'function') {
            return global.CosmicI18n.getLang() === 'en' ? 'en' : 'tr';
        }
        return 'tr';
    }

    function t(key) {
        if (global.CosmicI18n && typeof global.CosmicI18n.t === 'function') {
            return global.CosmicI18n.t(key);
        }
        const lang = getLang();
        return (MODES_I18N[lang] && MODES_I18N[lang][key]) || key;
    }

    function loc(obj, field) {
        if (!obj) return '';
        if (DATA && typeof DATA.getLocalized === 'function') {
            return DATA.getLocalized(obj, field, getLang());
        }
        return obj[field] || '';
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

    function registerTranslations() {
        if (global.CosmicI18n && global.CosmicI18n.dict) {
            Object.assign(global.CosmicI18n.dict.tr, MODES_I18N.tr);
            Object.assign(global.CosmicI18n.dict.en, MODES_I18N.en);
        }
    }

    function syncLangTogglePills(lang) {
        const btn = document.getElementById('langToggleBtn');
        if (!btn) return;
        btn.setAttribute('data-lang', lang);
        const enSeg = btn.querySelector('.lang-seg[data-lang="en"]');
        const trSeg = btn.querySelector('.lang-seg[data-lang="tr"]');
        if (enSeg) {
            enSeg.textContent = 'EN';
            enSeg.classList.toggle('active', lang === 'en');
        }
        if (trSeg) {
            trSeg.textContent = 'TR';
            trSeg.classList.toggle('active', lang === 'tr');
        }
    }

    function setupHeader() {
        const lang = getLang();
        const profile = PERSIST ? PERSIST.load() : { credits: 0 };
        const creditsEl = document.getElementById('creditsDisplay');
        if (creditsEl) {
            creditsEl.textContent = Number(profile.credits || 0).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR');
        }

        const btn = document.getElementById('audioToggleBtn');
        const label = document.getElementById('audioToggleLabel');
        const syncAudio = () => {
            const muted = Boolean(global.CosmicAudio && global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            if (btn) btn.classList.toggle('is-muted', muted);
            const iconEl = document.getElementById('audioToggleIcon');
            if (iconEl) iconEl.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
            if (label) label.textContent = t(muted ? 'common.audioOff' : 'common.audioOn');
            refreshIcons();
        };

        syncAudio();
        if (btn && !btn.dataset.bound) {
            btn.dataset.bound = '1';
            btn.addEventListener('click', () => {
                if (!global.CosmicAudio) return;
                global.CosmicAudio.unlock();
                const cur = Boolean(global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
                global.CosmicAudio.setMuted(!cur);
                syncAudio();
                if (cur) global.CosmicAudio.play('uiClick');
            });
        }
    }

    function loadPrefs() {
        try {
            const savedShip = sessionStorage.getItem('cosmic_ship') || localStorage.getItem('cosmic_ship_pref') || 'interceptor';
            const savedMap = sessionStorage.getItem('cosmic_map') || localStorage.getItem('cosmic_map_pref') || 'sector9';
            const savedDiff = sessionStorage.getItem('cosmic_diff') || localStorage.getItem('cosmic_diff_pref') || 'normal';

            if (DATA.MAPS[savedMap]) state.selectedSector = savedMap;
            if (DATA.DIFFICULTIES[savedDiff]) state.selectedDiff = savedDiff;

            const protocol = DATA.getDailyProtocol();
            state.dailyShipId = DATA.SHIPS[protocol.recommendedShip] ? protocol.recommendedShip : 'interceptor';

            Object.keys(DATA.GAME_MODES).forEach(modeId => {
                if (modeId === 'daily') {
                    state.selectedShipByMode[modeId] = state.dailyShipId;
                } else {
                    state.selectedShipByMode[modeId] = DATA.SHIPS[savedShip] ? savedShip : 'interceptor';
                }
            });
        } catch (err) {
            // Safe fallback
        }
    }

    function saveLaunchContext(modeId, shipId, mapId, diffId) {
        try {
            sessionStorage.setItem('cosmic_mode', modeId);
            sessionStorage.setItem('cosmic_ship', shipId);
            sessionStorage.setItem('cosmic_p1_ship', shipId);
            sessionStorage.setItem('cosmic_map', mapId);
            sessionStorage.setItem('cosmic_diff', diffId);
            sessionStorage.setItem('cosmic_launch_cfg', JSON.stringify({ mode: modeId, ship: shipId, map: mapId, diff: diffId }));
        } catch (err) {
            // Safe ignore
        }
    }

    function buildLaunchUrl(modeId, mapId, shipId, diffId) {
        return `game.html?mode=${encodeURIComponent(modeId)}&map=${encodeURIComponent(mapId)}&ship=${encodeURIComponent(shipId)}&diff=${encodeURIComponent(diffId)}`;
    }

    // -------------------------------------------------------------------------
    // Section 1: Today's Daily Seeded Protocol Decoder
    // -------------------------------------------------------------------------
    function formatModifierPill(key, val, lang) {
        const labels = {
            playerDmg: { tr: 'Oyuncu Hasarı', en: 'Player DMG', goodHigh: true },
            playerHp: { tr: 'Gövde HP', en: 'Hull HP', goodHigh: true },
            cdrMult: { tr: 'Bekleme (CD)', en: 'Cooldown', goodHigh: false },
            enemyHp: { tr: 'Düşman HP', en: 'Enemy HP', goodHigh: false },
            enemySp: { tr: 'Düşman Hızı', en: 'Enemy Speed', goodHigh: false },
            xpMult: { tr: 'XP Kazancı', en: 'XP Gain', goodHigh: true },
            magnetMult: { tr: 'Çekim Çapı', en: 'Magnet', goodHigh: true }
        };
        const meta = labels[key];
        if (!meta) return '';
        const pct = Math.round((val - 1) * 100);
        const sign = pct > 0 ? `+${pct}%` : `${pct}%`;
        let cls = 'is-neutral';
        if (pct !== 0) {
            const isBuff = meta.goodHigh ? pct > 0 : pct < 0;
            cls = isBuff ? 'is-buff' : 'is-nerf';
        }
        return `<span class="mod-stat-pill ${cls}">${meta[lang]} ${pct === 0 ? '1.00x' : sign}</span>`;
    }

    function renderDailyProtocol() {
        const lang = getLang();
        const protocol = DATA.getDailyProtocol();
        const map = protocol.map || DATA.MAPS.sector9;
        const recShip = DATA.SHIPS[protocol.recommendedShip] || DATA.SHIPS.interceptor;
        const utcDate = new Date().toISOString().slice(0, 10);

        const dateBadge = document.getElementById('dailyDateBadge');
        const seedBadge = document.getElementById('dailySeedBadge');
        if (dateBadge) {
            dateBadge.textContent = protocol.date === utcDate
                ? `${protocol.date} (UTC)`
                : `${protocol.date} · UTC ${utcDate}`;
        }
        if (seedBadge) seedBadge.textContent = protocol.seed;

        const sectorEl = document.getElementById('dailySectorCard');
        if (sectorEl) {
            sectorEl.innerHTML = `
                <img src="${map.asset}" alt="${loc(map, 'name')}" class="daily-sector-thumb">
                <div style="display:flex;flex-direction:column;gap:0.35rem;min-width:0;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;">
                        <span class="font-mono" style="font-size:11px;color:var(--accent-sky);font-weight:600;">${t('modes.daily.todaySector')} · ${map.code}</span>
                        <span class="cs-badge cs-badge-sm cs-badge-coral font-mono">${loc(map, 'hazardTag')}</span>
                    </div>
                    <h3 style="font-size:17px;">${loc(map, 'name')}</h3>
                    <p style="font-size:12.5px;margin:0;">${loc(map, 'subtitle')}</p>
                </div>
            `;
        }

        const mutGrid = document.getElementById('dailyMutatorsGrid');
        if (mutGrid) {
            mutGrid.innerHTML = (protocol.mutators || []).map(mut => {
                const modTags = [];
                if (mut.playerDmg !== 1) modTags.push(formatModifierPill('playerDmg', mut.playerDmg, lang));
                if (mut.playerHp !== 1) modTags.push(formatModifierPill('playerHp', mut.playerHp, lang));
                if (mut.cdrMult !== 1) modTags.push(formatModifierPill('cdrMult', mut.cdrMult, lang));
                if (mut.enemyHp !== 1) modTags.push(formatModifierPill('enemyHp', mut.enemyHp, lang));
                if (mut.enemySp !== 1) modTags.push(formatModifierPill('enemySp', mut.enemySp, lang));
                if (mut.xpMult !== 1) modTags.push(formatModifierPill('xpMult', mut.xpMult, lang));
                if (mut.magnetMult !== 1) modTags.push(formatModifierPill('magnetMult', mut.magnetMult, lang));

                return `
                    <article class="mutator-card" style="border-left:3px solid ${mut.color || '#38bdf8'};">
                        <div class="mutator-head">
                            <div class="mutator-icon-box" style="color:${mut.color || '#38bdf8'};">
                                <i data-lucide="${mut.icon || 'zap'}"></i>
                            </div>
                            <div style="min-width:0;">
                                <strong style="font-family:var(--font-display);font-size:14.5px;color:var(--text-primary);">${loc(mut, 'name')}</strong>
                                <div>
                                    <span class="cs-badge cs-badge-sm font-mono" style="color:${mut.color};border-color:${mut.color}44;">MUTATOR</span>
                                </div>
                            </div>
                        </div>
                        <p style="font-size:12.5px;margin:0;">${loc(mut, 'desc')}</p>
                        <div class="mutator-mods-row">${modTags.join('')}</div>
                    </article>
                `;
            }).join('');
        }

        const modBar = document.getElementById('dailyModifierBar');
        if (modBar && protocol.combinedModifiers) {
            const keys = ['playerDmg', 'playerHp', 'cdrMult', 'enemyHp', 'enemySp', 'xpMult', 'magnetMult'];
            modBar.innerHTML = keys.map(k => formatModifierPill(k, protocol.combinedModifiers[k], lang)).join('');
        }

        const recCard = document.getElementById('dailyRecShipCard');
        if (recCard) {
            const evo = DATA.EVOLUTIONS[recShip.sigEvo];
            recCard.innerHTML = `
                <img src="${recShip.asset}" alt="${loc(recShip, 'name')}" class="daily-rec-ship-img">
                <div style="min-width:0;flex:1;">
                    <div class="font-mono" style="font-size:10.5px;color:var(--accent-mint);font-weight:600;">${t('modes.daily.recShip')}</div>
                    <div style="font-family:var(--font-display);font-size:15.5px;font-weight:700;color:var(--text-primary);">${loc(recShip, 'name')}</div>
                    <div style="font-size:12px;color:var(--text-secondary);">${loc(recShip, 'role')}</div>
                    ${evo ? `<div class="font-mono" style="font-size:11px;color:var(--accent-sky);margin-top:2px;">→ ${loc(evo, 'name')}</div>` : ''}
                </div>
            `;
        }

        const dailyShipSel = document.getElementById('dailyShipSelect');
        if (dailyShipSel) {
            dailyShipSel.innerHTML = Object.values(DATA.SHIPS).map(s => {
                const isRec = s.id === protocol.recommendedShip;
                const labelSuffix = isRec ? (lang === 'en' ? ' ★ Recommended' : ' ★ Önerilen') : '';
                return `<option value="${s.id}">${loc(s, 'name')} (${s.codeName})${labelSuffix}</option>`;
            }).join('');
            dailyShipSel.value = state.dailyShipId;

            if (!dailyShipSel.dataset.bound) {
                dailyShipSel.dataset.bound = '1';
                dailyShipSel.addEventListener('change', () => {
                    state.dailyShipId = dailyShipSel.value;
                    playUiSound('uiClick');
                    syncDailyLaunchLinks(protocol);
                });
            }
        }

        const bestBox = document.getElementById('dailyBestBox');
        if (bestBox) {
            const pb = LB && typeof LB.getPersonalBests === 'function' ? LB.getPersonalBests() : null;
            const todayBest = pb ? pb.todayDailyBest : null;
            if (todayBest) {
                const usedShip = DATA.SHIPS[todayBest.shipId];
                const shipTitle = usedShip ? loc(usedShip, 'name') : todayBest.shipId;
                bestBox.innerHTML = `
                    <div class="daily-block-label" style="margin-bottom:0.2rem;">${t('modes.daily.bestTitle')}</div>
                    <div class="daily-best-row">
                        <span class="daily-best-score">${Number(todayBest.score || 0).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')}</span>
                        <span class="cs-badge cs-badge-mint font-mono">${t('modes.daily.waveShort')} ${todayBest.wave || 1} · ${todayBest.time || '00:00'}</span>
                    </div>
                    <div style="font-size:12px;color:var(--text-secondary);">
                        ${todayBest.players || 'PİLOT-01'} · ${shipTitle} · ${todayBest.kills || 0} ${t('modes.daily.killsShort')}
                    </div>
                `;
            } else {
                bestBox.innerHTML = `
                    <div class="daily-block-label" style="margin-bottom:0.2rem;">${t('modes.daily.bestTitle')}</div>
                    <div class="daily-best-row">
                        <span class="daily-best-score" style="color:var(--text-muted);">--</span>
                        <span class="cs-badge font-mono">00:00</span>
                    </div>
                    <div style="font-size:12px;color:var(--text-secondary);">${t('modes.daily.noBest')}</div>
                `;
            }
        }

        syncDailyLaunchLinks(protocol);
        refreshIcons();
    }

    function syncDailyLaunchLinks(protocol) {
        const url = buildLaunchUrl('daily', protocol.mapId, state.dailyShipId, 'normal');
        ['launchDailyBtn', 'heroDailyLaunchBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.href = url;
            if (!btn.dataset.bound) {
                btn.dataset.bound = '1';
                btn.addEventListener('click', () => {
                    playUiSound('uiConfirm');
                    const latestProto = DATA.getDailyProtocol();
                    saveLaunchContext('daily', state.dailyShipId, latestProto.mapId, 'normal');
                });
            }
        });
    }

    // -------------------------------------------------------------------------
    // Section 2: 5 Playable Operation Modes Interactive Cards
    // -------------------------------------------------------------------------
    function renderOperationModes() {
        const lang = getLang();
        const protocol = DATA.getDailyProtocol();
        const sectorSel = document.getElementById('modesSectorSelect');
        const diffSel = document.getElementById('modesDiffSelect');
        const grid = document.getElementById('operationModesGrid');
        if (!grid) return;

        if (sectorSel) {
            sectorSel.innerHTML = Object.values(DATA.MAPS).map(m =>
                `<option value="${m.id}">${loc(m, 'name')} (${m.scoreMult}x)</option>`
            ).join('');
            sectorSel.value = state.selectedSector;
            if (!sectorSel.dataset.bound) {
                sectorSel.dataset.bound = '1';
                sectorSel.addEventListener('change', () => {
                    state.selectedSector = sectorSel.value;
                    playUiSound('uiClick');
                    renderOperationModes();
                });
            }
        }

        if (diffSel) {
            diffSel.innerHTML = Object.values(DATA.DIFFICULTIES).map(d =>
                `<option value="${d.id}">${loc(d, 'label')} (${d.sm.toFixed(1)}x)</option>`
            ).join('');
            diffSel.value = state.selectedDiff;
            if (!diffSel.dataset.bound) {
                diffSel.dataset.bound = '1';
                diffSel.addEventListener('change', () => {
                    state.selectedDiff = diffSel.value;
                    playUiSound('uiClick');
                    renderOperationModes();
                });
            }
        }

        const pb = LB && typeof LB.getPersonalBests === 'function' ? LB.getPersonalBests() : { byMode: {} };
        const ships = Object.values(DATA.SHIPS);

        grid.innerHTML = Object.values(DATA.GAME_MODES).map(mode => {
            const isDaily = mode.id === 'daily';
            const chosenShip = state.selectedShipByMode[mode.id] || (isDaily ? protocol.recommendedShip : 'interceptor');
            const targetMap = isDaily ? protocol.mapId : state.selectedSector;
            const targetDiff = isDaily ? 'normal' : state.selectedDiff;
            const launchHref = buildLaunchUrl(mode.id, targetMap, chosenShip, targetDiff);

            const waveText = mode.waveCap
                ? `${mode.waveCap} ${t('modes.daily.waveShort')}`
                : (mode.timeLimitSec ? t('modes.grid.time5m') : t('modes.grid.unlimited'));
            const features = loc(mode, 'features') || [];
            const modeBest = pb.byMode ? pb.byMode[mode.id] : null;
            const pbText = modeBest
                ? `${Number(modeBest.score || 0).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')} · ${t('modes.daily.waveShort')} ${modeBest.wave || 1}`
                : t('modes.grid.noRecord');

            return `
                <article class="op-mode-card" style="--mode-accent:${mode.color || '#38bdf8'};">
                    <div class="op-mode-head">
                        <div class="op-mode-icon" style="color:${mode.color || '#38bdf8'};">
                            <i data-lucide="${mode.icon || 'gamepad-2'}"></i>
                        </div>
                        <div style="min-width:0;flex:1;">
                            <h3 style="font-size:17px;">${loc(mode, 'name')}</h3>
                            <span class="cs-badge cs-badge-sm font-mono" style="margin-top:0.25rem;color:${mode.color};border-color:${mode.color}44;">
                                ${loc(mode, 'shortTag')}
                            </span>
                        </div>
                    </div>

                    <p style="font-size:13px;margin:0;">${loc(mode, 'desc')}</p>

                    <div class="op-mode-mults">
                        <div class="op-mult-cell">
                            <span>${t('modes.grid.xp')}</span>
                            <strong style="color:var(--accent-sky);">${mode.xpMult.toFixed(2)}x</strong>
                        </div>
                        <div class="op-mult-cell">
                            <span>${t('modes.grid.score')}</span>
                            <strong style="color:var(--accent-mint);">${mode.scoreMult.toFixed(2)}x</strong>
                        </div>
                        <div class="op-mult-cell">
                            <span>${t('modes.grid.crd')}</span>
                            <strong style="color:var(--accent-amber);">${mode.creditMult.toFixed(2)}x</strong>
                        </div>
                    </div>

                    <ul class="op-mode-rules">
                        <li><strong>${t('modes.grid.waveLimit')}:</strong> ${waveText}</li>
                        ${features.map(f => `<li>${f}</li>`).join('')}
                    </ul>

                    <div class="op-mode-pb">
                        <span>${t('modes.grid.personalBest')}</span>
                        <strong style="color:${modeBest ? 'var(--accent-amber)' : 'var(--text-muted)'};">${pbText}</strong>
                    </div>

                    ${isDaily ? `<div style="font-size:11.5px;color:var(--accent-mint);">${t('modes.grid.dailyLockedNote')}</div>` : ''}

                    <div class="op-mode-footer">
                        <div style="display:flex;flex-direction:column;gap:0.28rem;">
                            <label class="font-mono" style="font-size:10.5px;color:var(--text-muted);text-transform:uppercase;">${t('modes.grid.shipLabel')}</label>
                            <select class="cs-select mode-ship-select" data-mode="${mode.id}" aria-label="${loc(mode, 'name')} ${t('modes.grid.shipLabel')}">
                                ${ships.map(s => `<option value="${s.id}" ${s.id === chosenShip ? 'selected' : ''}>${loc(s, 'name')} · ${s.codeName}</option>`).join('')}
                            </select>
                        </div>

                        <a href="${launchHref}" class="cs-btn ${isDaily ? 'cs-btn-mint' : 'cs-btn-primary'} op-mode-launch-btn"
                           data-mode="${mode.id}" data-map="${targetMap}" data-diff="${targetDiff}">
                            <i data-lucide="play"></i>
                            <span>${t('modes.grid.launchMode')}</span>
                        </a>
                    </div>
                </article>
            `;
        }).join('');

        grid.querySelectorAll('.mode-ship-select').forEach(sel => {
            sel.addEventListener('change', () => {
                const modeId = sel.dataset.mode;
                const shipId = sel.value;
                state.selectedShipByMode[modeId] = shipId;
                playUiSound('uiClick');

                const btn = grid.querySelector(`.op-mode-launch-btn[data-mode="${modeId}"]`);
                if (btn) {
                    btn.href = buildLaunchUrl(modeId, btn.dataset.map, shipId, btn.dataset.diff);
                }
            });
        });

        grid.querySelectorAll('.op-mode-launch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const modeId = btn.dataset.mode;
                const shipId = state.selectedShipByMode[modeId] || 'interceptor';
                playUiSound('uiConfirm');
                saveLaunchContext(modeId, shipId, btn.dataset.map, btn.dataset.diff);
            });
        });

        refreshIcons();
    }

    // -------------------------------------------------------------------------
    // Section 3: 4 x 5600x5600 Arenas & 5 Real Obstacle Sprites
    // -------------------------------------------------------------------------
    function renderArenasAndObstacles() {
        const lang = getLang();
        const arenasGrid = document.getElementById('arenasGrid');
        if (arenasGrid) {
            arenasGrid.innerHTML = Object.values(DATA.MAPS).map(map => {
                const recShips = (map.recommendedShips || [])
                    .map(sid => DATA.SHIPS[sid])
                    .filter(Boolean);
                const firstRec = recShips[0] ? recShips[0].id : 'interceptor';
                const deployUrl = buildLaunchUrl('survival', map.id, firstRec, state.selectedDiff);

                return `
                    <article class="arena-card">
                        <div class="arena-banner-wrap">
                            <img src="${map.asset}" alt="${loc(map, 'name')}">
                            <div class="arena-banner-overlay">
                                <div>
                                    <div class="font-mono" style="font-size:11px;color:${map.color};font-weight:600;">${map.code} · 5600×5600</div>
                                    <h3 style="font-size:18px;">${loc(map, 'name')}</h3>
                                </div>
                                <span class="cs-badge cs-badge-sky font-mono">${map.scoreMult}x ${t('modes.grid.score')}</span>
                            </div>
                        </div>

                        <div class="arena-card-body">
                            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;">
                                <span style="font-size:13px;color:var(--text-secondary);">${loc(map, 'subtitle')}</span>
                                <span class="cs-badge cs-badge-sm cs-badge-coral font-mono">${loc(map, 'hazardTag')}</span>
                            </div>

                            <div class="arena-events-list">
                                ${(map.arenaEvents || []).map(ev => `
                                    <div class="arena-event-item">
                                        <strong style="color:${ev.type === 'hazard' ? 'var(--accent-coral)' : 'var(--accent-mint)'};">${loc(ev, 'name')}:</strong>
                                        ${loc(ev, 'desc')}
                                    </div>
                                `).join('')}
                            </div>

                            <div class="arena-tactic-line">
                                <strong style="color:var(--text-primary);">${t('modes.arenas.tacticNote')}:</strong> ${loc(map, 'tactics')}
                            </div>

                            <div class="arena-rec-row">
                                <div class="arena-rec-chips">
                                    ${recShips.map(s => `
                                        <span class="arena-rec-chip">
                                            <img src="${s.asset}" alt="${loc(s, 'name')}">
                                            <span>${loc(s, 'name')}</span>
                                        </span>
                                    `).join('')}
                                </div>
                                <a href="${deployUrl}" class="cs-btn cs-btn-ghost arena-deploy-btn" data-map="${map.id}" data-ship="${firstRec}" style="padding:0.38rem 0.72rem;font-size:12px;">
                                    <i data-lucide="play"></i>
                                    <span>${t('modes.arenas.deployHere')}</span>
                                </a>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');

            arenasGrid.querySelectorAll('.arena-deploy-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    playUiSound('uiConfirm');
                    saveLaunchContext('survival', btn.dataset.ship, btn.dataset.map, state.selectedDiff);
                });
            });
        }

        const mechPills = document.getElementById('coverMechanicPills');
        if (mechPills) {
            const pills = lang === 'en'
                ? [
                    { text: 'Blocks Sniper & Plasma Fire', cls: 'cs-badge-sky' },
                    { text: 'Vault Capture: 4.0s → +350 CRD', cls: 'cs-badge-mint' },
                    { text: 'Reactor Aura: +22% Fire Rate', cls: 'cs-badge-amber' },
                    { text: '[M] Tactical Radar Tracking', cls: 'cs-badge-teal' }
                ]
                : [
                    { text: 'Nişancı & Plazma Atışını Keser', cls: 'cs-badge-sky' },
                    { text: 'Sığınak: 4.0sn → +350 CRD', cls: 'cs-badge-mint' },
                    { text: 'Reaktör Aurası: +%22 Ateş Hızı', cls: 'cs-badge-amber' },
                    { text: '[M] Taktik Radar Takibi', cls: 'cs-badge-teal' }
                ];
            mechPills.innerHTML = pills.map(p => `<span class="cs-badge ${p.cls} font-mono">${p.text}</span>`).join('');
        }

        const obsGrid = document.getElementById('obstacleGalleryGrid');
        if (obsGrid) {
            obsGrid.innerHTML = OBSTACLES_META.map(obs => `
                <article class="obstacle-card">
                    <div class="obstacle-preview-pad">
                        <img src="${obs.asset}" alt="${loc(obs, 'name')}">
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.4rem;">
                        <strong style="font-family:var(--font-display);font-size:14.5px;">${loc(obs, 'name')}</strong>
                        <span class="cs-badge cs-badge-sm ${obs.badgeCls} font-mono">${loc(obs, 'tag')}</span>
                    </div>
                    <div class="obstacle-meta-line">${loc(obs, 'shape')}</div>
                    <p style="font-size:12.5px;margin:0;">${loc(obs, 'desc')}</p>
                </article>
            `).join('');
        }

        refreshIcons();
    }

    // -------------------------------------------------------------------------
    // Section 4: Live Threat & Difficulty Curve (Chart.js, Waves 1–25)
    // Matches exact game.js v10.0 enemy & dreadnought boss scaling formulas.
    // -------------------------------------------------------------------------
    const BOSS_BASE_HPS = [7200, 12800, 18500, 26500, 38000];

    function calcWaveThreat(w, diff) {
        const waveHpScale = 1 + (w - 1) * 0.28 + (w > 15 ? (w - 15) * 0.22 : 0);
        const waveDmgScale = 1 + (w - 1) * 0.055;
        const bossIdx = w < 5 ? 0 : ((Math.floor(w / 5) - 1) % BOSS_BASE_HPS.length);
        const bossScale = 1 + Math.max(0, w - 5) * 0.16 + (w > 15 ? (w - 15) * 0.12 : 0);
        return {
            enemyHpPct: Math.round(diff.ehm * waveHpScale * 100),
            enemyDmgPct: Math.round(diff.edm * waveDmgScale * 100),
            bossHp: Math.round(BOSS_BASE_HPS[bossIdx] * diff.bhm * bossScale)
        };
    }

    function buildThreatSeries(metric) {
        const waves = [];
        for (let w = 1; w <= 25; w++) waves.push(w);

        const datasets = Object.values(DATA.DIFFICULTIES).map(diff => {
            const values = waves.map(w => {
                const stats = calcWaveThreat(w, diff);
                if (metric === 'enemyHp') return stats.enemyHpPct;
                if (metric === 'enemyDmg') return stats.enemyDmgPct;
                return stats.bossHp;
            });

            return {
                label: loc(diff, 'label'),
                data: values,
                borderColor: diff.color,
                backgroundColor: diff.color + '22',
                borderWidth: 2.5,
                pointRadius: w => (w.dataIndex + 1) % 5 === 0 ? 4 : 1.8,
                pointHoverRadius: 5.5,
                tension: 0.28,
                fill: false
            };
        });

        return { waves, datasets };
    }

    function renderThreatChart() {
        const canvas = document.getElementById('threatCurveCanvas');
        if (!canvas || typeof global.Chart === 'undefined') return;
        const lang = getLang();
        const { waves, datasets } = buildThreatSeries(state.threatMetric);
        const waveLabels = waves.map(w => (lang === 'en' ? `W${w}` : `D${w}`));

        const yUnit = state.threatMetric === 'bossHp' ? ' HP' : '%';

        if (state.threatChart) {
            state.threatChart.data.labels = waveLabels;
            state.threatChart.data.datasets = datasets;
            state.threatChart.options.scales.y.ticks.callback = (val) =>
                state.threatMetric === 'bossHp'
                    ? `${Math.round(val / 1000)}k`
                    : `${val}%`;
            state.threatChart.options.plugins.tooltip.callbacks.label = (ctx) =>
                `${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')}${yUnit}`;
            state.threatChart.update();
        } else {
            state.threatChart = new global.Chart(canvas.getContext('2d'), {
                type: 'line',
                data: {
                    labels: waveLabels,
                    datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#e2e8f0',
                                usePointStyle: true,
                                boxWidth: 8,
                                font: { family: 'Inter, sans-serif', size: 12, weight: '600' }
                            }
                        },
                        tooltip: {
                            backgroundColor: '#0d1320',
                            titleColor: '#e2e8f0',
                            bodyColor: '#cbd5e1',
                            borderColor: 'rgba(148,163,184,0.24)',
                            borderWidth: 1,
                            callbacks: {
                                label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')}${yUnit}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(148, 163, 184, 0.08)' },
                            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono, monospace', size: 11 } }
                        },
                        y: {
                            grid: { color: 'rgba(148, 163, 184, 0.1)' },
                            ticks: {
                                color: '#94a3b8',
                                font: { family: 'JetBrains Mono, monospace', size: 11 },
                                callback: (val) => state.threatMetric === 'bossHp' ? `${Math.round(val / 1000)}k` : `${val}%`
                            }
                        }
                    }
                }
            });
        }

        const summaryGrid = document.getElementById('threatSummaryGrid');
        if (summaryGrid) {
            summaryGrid.innerHTML = Object.values(DATA.DIFFICULTIES).map(diff => {
                const w25 = calcWaveThreat(25, diff);

                return `
                    <article class="threat-diff-card" style="--diff-color:${diff.color};">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.4rem;">
                            <strong style="font-family:var(--font-display);font-size:14.5px;">${loc(diff, 'label')}</strong>
                            <span class="cs-badge cs-badge-sm font-mono" style="color:${diff.color};">${diff.sm.toFixed(1)}x</span>
                        </div>
                        <div class="threat-kv-row">
                            <span>${lang === 'en' ? 'Base HP / DMG' : 'Taban HP / Hasar'}</span>
                            <strong>${Math.round(diff.ehm * 100)}% / ${Math.round(diff.edm * 100)}%</strong>
                        </div>
                        <div class="threat-kv-row">
                            <span>${lang === 'en' ? 'Wave 25 HP / DMG' : 'Dalga 25 HP / Hasar'}</span>
                            <strong>${w25.enemyHpPct}% / ${w25.enemyDmgPct}%</strong>
                        </div>
                        <div class="threat-kv-row">
                            <span>${lang === 'en' ? 'Wave 25 Boss HP' : 'Dalga 25 Boss HP'}</span>
                            <strong style="color:${diff.color};">${w25.bossHp.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')}</strong>
                        </div>
                    </article>
                `;
            }).join('');
        }
    }

    function setupThreatFilters() {
        const pills = document.getElementById('threatMetricPills');
        if (!pills) return;
        pills.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                state.threatMetric = btn.dataset.metric;
                playUiSound('uiClick');
                pills.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p === btn));
                renderThreatChart();
            });
        });
    }

    function applyPageLanguage() {
        const lang = getLang();
        if (global.CosmicI18n && typeof global.CosmicI18n.applyTranslations === 'function') {
            global.CosmicI18n.applyTranslations();
        }
        syncLangTogglePills(lang);
        document.title = t('meta.title');
        setupHeader();
        renderDailyProtocol();
        renderOperationModes();
        renderArenasAndObstacles();
        renderThreatChart();
        refreshIcons();
    }

    function animateInitial() {
        if (!global.gsap) return;
        const cards = document.querySelectorAll('.daily-decoder-card, .op-mode-card, .arena-card, .obstacle-card, .threat-curve-card');
        if (!cards.length) return;
        global.gsap.fromTo(
            cards,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.28, stagger: 0.025, ease: 'power2.out', clearProps: 'transform,opacity' }
        );
    }

    function init() {
        registerTranslations();
        loadPrefs();
        setupThreatFilters();

        if (!global.CosmicI18n) {
            const langBtn = document.getElementById('langToggleBtn');
            if (langBtn) {
                langBtn.addEventListener('click', () => {
                    const next = getLang() === 'tr' ? 'en' : 'tr';
                    document.documentElement.lang = next;
                    applyPageLanguage();
                });
            }
        }

        global.addEventListener('cosmic:langchange', applyPageLanguage);

        applyPageLanguage();
        animateInitial();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
