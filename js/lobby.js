// =============================================================================
// COSMIC SURVIVORS v10.0 — GENESIS EDITION HANGAR & COCKPIT CONTROLLER
// 8-Ship Deck, Skin Livery Switcher, 5 Game Modes + Daily Seeded Protocol,
// Live Turntable Preview, Chart.js Telemetry, 10-Module Workshop, Sector Atlas,
// 100% Local Pilot Records & Personal Bests, 12 Achievements & EN/TR i18n.
// =============================================================================
(function (global) {
    'use strict';

    const DATA = global.COSMIC_DATA;
    const PERSIST = global.CosmicPersistence;

    const state = {
        selectedShipId: 'interceptor',
        selectedMapId: 'sector9',
        selectedDiff: 'normal',
        selectedModeId: 'survival',
        selectedSkinId: 'standard',
        activeView: 'view-cockpit',
        recordModeFilter: 'all',
        clearRecordsArmed: false,
        clearRecordsTimer: null,
        radarChart: null,
        turntableHandle: null,
        tintedSpriteCache: {}
    };

    const COPY = {
        tr: {
            pageTitle: 'COSMIC SURVIVORS v11.0 — Komuta Hangarı | COSMIC UNIVERSE',
            nav: { portal: 'Portal', story: 'Hikâye', hangar: 'Survivors', tree: 'Evrim Ağacı', armory: 'Cephanelik', modes: 'Modlar', wiki: 'Ansiklopedi', about: 'Hakkında' },
            audioOn: 'Ses Açık',
            audioOff: 'Sessiz',
            railArmory: 'Cephanelik & Kaplamalar',
            railModes: 'Modlar & Günlük Tohum',
            selectedBadge: 'SEÇİLİ',
            scoreUnit: 'SKOR',
            hpLabel: 'HP',
            coverTag: '5600×5600 · Siper Engelli',
            arenaEventsTitle: 'Aktif Arena Olayları',
            fixedDailyNote: 'Günlük Protokol sabit sektör ve tohum kullanır.',
            switchedToClassic: 'Özel sektör seçildiği için Klasik Sefer moduna geçildi.',
            dailySeedLabel: 'GÜNÜN TOHUMU',
            dailySectorLabel: 'Hedef Sektör',
            launchBtnShort: 'GÖREVE ÇIK',
            launchWithShip: (ship, code) => `${ship.toUpperCase()} · ${code} GÖREVİNE ÇIK`,
            skinLockedToast: (name, cost) => `${name} kilitli (${cost} CRD). Cephanelik sayfasından açabilirsiniz.`,
            skinEquippedToast: (name) => `${name} kaplaması kuşanıldı.`,
            armoryBtn: 'Cephanelik & Kaplamalar',
            workshopSummary: 'Aktif Hangar Çarpanları:',
            dmgLabel: 'Hasar',
            hullShieldLabel: 'Gövde/Kalkan',
            spdLabel: 'Hız',
            critLabel: 'Kritik',
            cdrLabel: 'CDR',
            rerollLabel: 'Reroll',
            overdriveLabel: 'Overdrive',
            revivalLabel: 'Yeniden Doğuş',
            maxLevel: 'MAKSİMUM SEVİYE',
            upgradeBtn: (cost) => `Yükselt (${cost} CRD)`,
            upgradeDoneToast: (lvl) => `Kalibrasyon Lv.${lvl} tamamlandı.`,
            insufficientCreditsToast: 'Yetersiz araştırma kredisi.',
            refundToast: (amount) => `${amount} CRD atölyeden iade edildi.`,
            atlasBossHeading: 'Kozmik Boss Dosyaları (5 Ana Tehdit)',
            atlasBossSub: 'Bossların %50 HP altında açtığı Öfke Fazı II ve zayıf nokta mekaniklerini inceleyin.',
            atlasTacticsLabel: 'Taktik:',
            atlasCounterLabel: 'Karşı Taktik:',
            atlasDeployBtn: 'Bu Sektörü Kokpitte Seç',
            atlasDeployToast: (name) => `${name} konuşlanma rotasına alındı.`,
            radarLabels: ['Hız', 'Ateş Gücü', 'Savunma', 'Kontrol', 'Kapasite'],
            starterLabel: 'Başlangıç',
            coreSynthLabel: 'Kök Sentez',
            sigEvoLabel: 'İmza Evrim',
            targetMegaLabel: 'Hedef Mega',
            recordsBadge: '5 MOD + GÜNLÜK',
            dailyBestTitle: 'Bugünün Günlük Protokol Rekoru',
            noRecordYet: 'Henüz kayıt yok',
            waveShort: 'D.',
            allModesFilter: 'Tümü',
            clearConfirmBtn: 'Onaylamak için tekrar tıklayın',
            recordsClearedToast: 'Tüm yerel uçuş kayıtları temizlendi.',
            tableEmpty: 'Seçili filtre için yerel uçuş kaydı bulunamadı.',
            thRank: '#',
            thPilot: 'Pilot',
            thMode: 'Mod',
            thShip: 'Gemi',
            thSector: 'Sektör',
            thWave: 'Dalga',
            thScore: 'Skor',
            thTime: 'Süre',
            rewardLabel: 'ÖDÜL',
            claimBtn: (r) => `Ödülü Al (+${r} CRD)`,
            claimedBtn: 'Ödül Tahsil Edildi',
            lockedBtn: 'Kilitli — Görevi Tamamla',
            achClaimedToast: (r) => `+${r} CRD başarımdan tahsil edildi!`
        },
        en: {
            pageTitle: 'COSMIC SURVIVORS v11.0 — Command Hangar | COSMIC UNIVERSE',
            nav: { portal: 'Portal', story: 'Story Saga', hangar: 'Survivors', tree: 'Evolution Tree', armory: 'Armory', modes: 'Modes', wiki: 'Encyclopedia', about: 'About' },
            audioOn: 'Audio On',
            audioOff: 'Muted',
            railArmory: 'Armory & Liveries',
            railModes: 'Modes & Daily Seed',
            selectedBadge: 'ACTIVE',
            scoreUnit: 'SCORE',
            hpLabel: 'HP',
            coverTag: '5600×5600 · Cover Obstacles',
            arenaEventsTitle: 'Active Arena Events',
            fixedDailyNote: 'Daily Protocol locks sector & deterministic seed.',
            switchedToClassic: 'Switched to Classic Campaign for custom sector selection.',
            dailySeedLabel: 'DAILY SEED',
            dailySectorLabel: 'Target Sector',
            launchBtnShort: 'DEPLOY TO SECTOR',
            launchWithShip: (ship, code) => `DEPLOY ${ship.toUpperCase()} · ${code}`,
            skinLockedToast: (name, cost) => `${name} is locked (${cost} CRD). Unlock it in the Armory.`,
            skinEquippedToast: (name) => `Equipped ${name} hull livery.`,
            armoryBtn: 'Armory & Liveries',
            workshopSummary: 'Active Hangar Multipliers:',
            dmgLabel: 'Damage',
            hullShieldLabel: 'Hull/Shield',
            spdLabel: 'Speed',
            critLabel: 'Crit',
            cdrLabel: 'CDR',
            rerollLabel: 'Rerolls',
            overdriveLabel: 'Overdrive',
            revivalLabel: 'Revivals',
            maxLevel: 'MAX LEVEL',
            upgradeBtn: (cost) => `Upgrade (${cost} CRD)`,
            upgradeDoneToast: (lvl) => `Calibration Lv.${lvl} complete.`,
            insufficientCreditsToast: 'Insufficient research credits.',
            refundToast: (amount) => `Refunded ${amount} CRD from Workshop.`,
            atlasBossHeading: 'Cosmic Boss Dossiers (5 Core Threats)',
            atlasBossSub: 'Inspect Rage Phase II behaviors (<50% HP) and weakpoint mechanics.',
            atlasTacticsLabel: 'Tactics:',
            atlasCounterLabel: 'Counterplay:',
            atlasDeployBtn: 'Select Sector in Cockpit',
            atlasDeployToast: (name) => `${name} locked as deployment sector.`,
            radarLabels: ['Speed', 'Firepower', 'Defense', 'Control', 'Capacity'],
            starterLabel: 'Starter',
            coreSynthLabel: 'Core Combo',
            sigEvoLabel: 'Signature Evo',
            targetMegaLabel: 'Target Mega',
            recordsBadge: '5 MODES + DAILY',
            dailyBestTitle: "Today's Daily Protocol Best",
            noRecordYet: 'No record yet',
            waveShort: 'W.',
            allModesFilter: 'All Modes',
            clearConfirmBtn: 'Click again to confirm reset',
            recordsClearedToast: 'All local flight logs cleared.',
            tableEmpty: 'No local flight logs found for this filter.',
            thRank: '#',
            thPilot: 'Pilot',
            thMode: 'Mode',
            thShip: 'Ship',
            thSector: 'Sector',
            thWave: 'Wave',
            thScore: 'Score',
            thTime: 'Time',
            rewardLabel: 'REWARD',
            claimBtn: (r) => `Claim Reward (+${r} CRD)`,
            claimedBtn: 'Reward Claimed',
            lockedBtn: 'Locked — Complete Milestone',
            achClaimedToast: (r) => `Claimed +${r} CRD achievement reward!`
        }
    };

    function getLang() {
        if (global.CosmicI18n && typeof global.CosmicI18n.getLang === 'function') {
            return global.CosmicI18n.getLang() === 'en' ? 'en' : 'tr';
        }
        return (document.documentElement.lang || '').toLowerCase().startsWith('en') ? 'en' : 'tr';
    }

    function tCopy() {
        return COPY[getLang()] || COPY.tr;
    }

    function loc(obj, field) {
        if (DATA && typeof DATA.getLocalized === 'function') {
            return DATA.getLocalized(obj, field, getLang());
        }
        return (obj && obj[field]) || '';
    }

    function formatNum(num) {
        const locale = getLang() === 'en' ? 'en-US' : 'tr-TR';
        return Number(num || 0).toLocaleString(locale);
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

    function triggerCelebration(accentColor) {
        if (typeof global.confetti !== 'function') return;
        try {
            global.confetti({
                particleCount: 55,
                spread: 68,
                origin: { y: 0.74 },
                colors: accentColor ? [accentColor, '#38bdf8', '#34d399', '#f59e0b'] : ['#38bdf8', '#34d399', '#f59e0b', '#a78bfa'],
                disableForReducedMotion: true
            });
        } catch (err) {
            // Ignore canvas-confetti environment failures
        }
    }

    let toastTimer = null;
    function showToast(msg) {
        const toast = document.getElementById('csToast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('visible'), 2700);
    }

    function getShortSkinName(skin) {
        if (!skin) return 'Standard';
        const full = loc(skin, 'name');
        return full.split(' ')[0] || full;
    }

    // -------------------------------------------------------------------------
    // Deployment Preferences & Query Param Sync
    // -------------------------------------------------------------------------
    function loadSavedDeployment() {
        const profile = PERSIST.load();
        state.selectedSkinId = profile.selectedSkin || 'standard';

        try {
            const qs = new URLSearchParams(global.location.search || '');
            const qShip = qs.get('ship');
            const qMap = qs.get('map');
            const qDiff = qs.get('diff');
            const qMode = qs.get('mode');
            const qSkin = qs.get('skin');
            const qView = qs.get('view');

            const sShip = qShip || sessionStorage.getItem('cosmic_ship') || localStorage.getItem('cosmic_ship_pref');
            const sMap = qMap || sessionStorage.getItem('cosmic_map') || localStorage.getItem('cosmic_map_pref');
            const sDiff = qDiff || sessionStorage.getItem('cosmic_diff') || localStorage.getItem('cosmic_diff_pref');
            const sMode = qMode || sessionStorage.getItem('cosmic_mode') || localStorage.getItem('cosmic_mode_pref');
            const callsign = sessionStorage.getItem('cosmic_p1') || localStorage.getItem('cosmic_pilot_name') || (getLang() === 'en' ? 'PILOT-01' : 'PİLOT-01');

            if (sShip && DATA.SHIPS[sShip]) state.selectedShipId = sShip;
            if (sMap && DATA.MAPS[sMap]) state.selectedMapId = sMap;
            if (sDiff && DATA.DIFFICULTIES[sDiff]) state.selectedDiff = sDiff;
            if (sMode && DATA.GAME_MODES && DATA.GAME_MODES[sMode]) state.selectedModeId = sMode;
            if (qSkin && DATA.SHIP_SKINS && DATA.SHIP_SKINS[qSkin] && PERSIST.isSkinUnlocked(qSkin)) {
                PERSIST.selectSkin(qSkin);
                state.selectedSkinId = qSkin;
            }
            if (state.selectedModeId === 'daily' && typeof DATA.getDailyProtocol === 'function') {
                state.selectedMapId = DATA.getDailyProtocol().mapId;
            }
            if (qView && document.getElementById(qView)) {
                state.activeView = qView;
            }

            const input = document.getElementById('pilotCallsignInput');
            if (input) input.value = callsign;
        } catch (err) {
            // Safe storage fallback
        }
    }

    function saveDeploymentPrefs() {
        try {
            const input = document.getElementById('pilotCallsignInput');
            const fallbackCallsign = getLang() === 'en' ? 'PILOT-01' : 'PİLOT-01';
            const callsign = (input && input.value.trim()) ? input.value.trim() : fallbackCallsign;

            sessionStorage.setItem('cosmic_ship', state.selectedShipId);
            sessionStorage.setItem('cosmic_p1_ship', state.selectedShipId);
            sessionStorage.setItem('cosmic_map', state.selectedMapId);
            sessionStorage.setItem('cosmic_diff', state.selectedDiff);
            sessionStorage.setItem('cosmic_mode', state.selectedModeId);
            sessionStorage.setItem('cosmic_skin', state.selectedSkinId);
            sessionStorage.setItem('cosmic_p1', callsign);

            const cfg = {
                ship: state.selectedShipId,
                map: state.selectedMapId,
                diff: state.selectedDiff,
                mode: state.selectedModeId,
                skin: state.selectedSkinId,
                pilot: callsign
            };
            if (state.selectedModeId === 'daily' && typeof DATA.getDailyProtocol === 'function') {
                cfg.seed = DATA.getDailyProtocol().seed;
            }
            sessionStorage.setItem('cosmic_launch_cfg', JSON.stringify(cfg));

            localStorage.setItem('cosmic_ship_pref', state.selectedShipId);
            localStorage.setItem('cosmic_map_pref', state.selectedMapId);
            localStorage.setItem('cosmic_diff_pref', state.selectedDiff);
            localStorage.setItem('cosmic_mode_pref', state.selectedModeId);
            localStorage.setItem('cosmic_pilot_name', callsign);
        } catch (err) {
            // Ignore private mode restrictions
        }
    }

    // -------------------------------------------------------------------------
    // Topbar, Credits, Audio & Language Sync
    // -------------------------------------------------------------------------
    function updateHeaderCredits() {
        const profile = PERSIST.load();
        const el = document.getElementById('creditsDisplay');
        if (el) el.textContent = formatNum(profile.credits);

        const runsEl = document.getElementById('railRunsVal');
        const waveEl = document.getElementById('railBestWaveVal');
        const achEl = document.getElementById('railAchVal');
        const unlockedCount = DATA.ACHIEVEMENTS.filter(a => profile.achievements && profile.achievements[a.id]).length;

        if (runsEl) runsEl.textContent = formatNum(profile.stats.runs || 0);
        if (waveEl) waveEl.textContent = profile.stats.bestWave || 0;
        if (achEl) achEl.textContent = `${unlockedCount} / ${DATA.ACHIEVEMENTS.length}`;
    }

    function syncAudioUI() {
        const btn = document.getElementById('audioToggleBtn');
        const label = document.getElementById('audioToggleLabel');
        if (!btn) return;
        const muted = Boolean(global.CosmicAudio && global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
        btn.classList.toggle('is-muted', muted);
        const iconEl = document.getElementById('audioToggleIcon');
        if (iconEl) iconEl.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
        if (label) label.textContent = muted ? tCopy().audioOff : tCopy().audioOn;
    }

    function setupAudioControl() {
        const btn = document.getElementById('audioToggleBtn');
        if (!btn) return;
        syncAudioUI();
        btn.addEventListener('click', () => {
            if (!global.CosmicAudio) return;
            global.CosmicAudio.unlock();
            const currentMuted = Boolean(global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            global.CosmicAudio.setMuted(!currentMuted);
            syncAudioUI();
            refreshIcons();
            if (currentMuted) global.CosmicAudio.play('uiClick');
        });
    }

    function syncTopbarLabels() {
        const copy = tCopy();
        const lang = getLang();
        document.title = copy.pageTitle;
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-topbar-label]').forEach(el => {
            const key = el.getAttribute('data-topbar-label');
            if (key && copy.nav[key]) el.textContent = copy.nav[key];
        });

        const railArmory = document.getElementById('railArmoryLinkLabel');
        if (railArmory) railArmory.textContent = copy.railArmory;
        const railModes = document.getElementById('railModesLinkLabel');
        if (railModes) railModes.textContent = copy.railModes;

        const langBtn = document.getElementById('langToggleBtn');
        if (langBtn) {
            langBtn.setAttribute('data-lang', lang);
            langBtn.querySelectorAll('.lang-seg').forEach(seg => {
                seg.classList.toggle('active', seg.getAttribute('data-lang') === lang);
            });
        }
    }

    // -------------------------------------------------------------------------
    // Navigation & GSAP Stagger
    // -------------------------------------------------------------------------
    function animateViewCards(viewEl) {
        if (!viewEl || !global.gsap) return;
        const targets = viewEl.querySelectorAll('.cockpit-panel, .workshop-card, .atlas-sector-card, .atlas-boss-card, .record-stat-card, .achievement-card, .personal-best-card');
        if (!targets.length) return;
        global.gsap.killTweensOf(targets);
        global.gsap.fromTo(
            targets,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.25, stagger: 0.025, ease: 'power2.out', clearProps: 'transform,opacity' }
        );
    }

    function switchView(viewId) {
        state.activeView = viewId;
        document.querySelectorAll('.rail-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewId);
        });
        let activeEl = null;
        document.querySelectorAll('.lobby-view').forEach(view => {
            const isMatch = view.id === viewId;
            view.classList.toggle('active', isMatch);
            if (isMatch) activeEl = view;
        });
        if (viewId === 'view-workshop') renderWorkshop();
        if (viewId === 'view-maps') renderSectorAtlas();
        if (viewId === 'view-records') renderRecordsView();
        if (viewId === 'view-achievements') renderAchievementsView();
        animateViewCards(activeEl);
        refreshIcons();
    }

    function setupRailNavigation() {
        document.querySelectorAll('.rail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                playUiSound('uiClick');
                switchView(btn.dataset.view);
            });
        });
    }

    // -------------------------------------------------------------------------
    // View 1: Cockpit — Ship Deck, Skin Pills, 5 Modes, Sectors, Diffs & Radar
    // -------------------------------------------------------------------------
    function renderShipDeck() {
        const container = document.getElementById('shipDeckList');
        if (!container) return;
        const copy = tCopy();

        container.innerHTML = Object.values(DATA.SHIPS).map(ship => {
            const selected = ship.id === state.selectedShipId;
            const unlocked = PERSIST.isShipUnlocked(ship.id);
            const name = loc(ship, 'name');
            const role = loc(ship, 'role');
            const tag = loc(ship, 'tag');
            return `
                <button type="button" class="ship-deck-card ${selected ? 'selected' : ''}" data-ship-id="${ship.id}">
                    <div class="ship-deck-thumb">
                        <img src="${ship.asset}" alt="${name}">
                    </div>
                    <div class="ship-deck-meta">
                        <div class="ship-deck-name">${name}</div>
                        <div class="ship-deck-role">${role}</div>
                    </div>
                    <span class="cs-badge cs-badge-sm ${selected ? 'cs-badge-sky' : 'cs-badge-mint'}" style="font-size:9.5px;">
                        ${unlocked ? (selected ? copy.selectedBadge : tag) : `${ship.unlockCost} CRD`}
                    </span>
                </button>
            `;
        }).join('');

        container.querySelectorAll('.ship-deck-card').forEach(btn => {
            btn.addEventListener('click', () => {
                state.selectedShipId = btn.dataset.shipId;
                playUiSound('uiClick');
                saveDeploymentPrefs();
                renderShipDeck();
                updateCockpitTelemetry();
            });
        });
    }

    function renderSkinPills() {
        const container = document.getElementById('skinPillSwitcher');
        if (!container || !DATA.SHIP_SKINS) return;
        const profile = PERSIST.load();
        const copy = tCopy();

        container.innerHTML = Object.values(DATA.SHIP_SKINS).map(skin => {
            const unlocked = !skin.cost || skin.cost <= 0 || Boolean(profile.unlockedSkins && profile.unlockedSkins[skin.id]);
            const selected = skin.id === state.selectedSkinId;
            const titleText = unlocked
                ? loc(skin, 'name')
                : `${loc(skin, 'name')} (${skin.cost} CRD)`;
            return `
                <button type="button"
                    class="skin-pill-btn ${selected ? 'selected' : ''} ${!unlocked ? 'is-locked' : ''}"
                    data-skin-id="${skin.id}"
                    title="${titleText}">
                    <span class="skin-swatch-dot" style="background:${skin.accent};"></span>
                    <span>${getShortSkinName(skin)}</span>
                    ${!unlocked ? '<i data-lucide="lock" style="width:10px;height:10px;"></i>' : ''}
                </button>
            `;
        }).join('');

        container.querySelectorAll('.skin-pill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const skinId = btn.dataset.skinId;
                const skin = DATA.SHIP_SKINS[skinId];
                if (!skin) return;
                const res = PERSIST.selectSkin(skinId);
                if (res.ok) {
                    state.selectedSkinId = skinId;
                    playUiSound('uiClick');
                    saveDeploymentPrefs();
                    renderSkinPills();
                    showToast(copy.skinEquippedToast(loc(skin, 'name')));
                } else {
                    playUiSound('uiBack');
                    showToast(copy.skinLockedToast(loc(skin, 'name'), skin.cost));
                }
            });
        });
        refreshIcons();
    }

    function renderModePicker() {
        const grid = document.getElementById('modePickerGrid');
        if (!grid || !DATA.GAME_MODES) return;

        grid.innerHTML = Object.values(DATA.GAME_MODES).map(mode => {
            const selected = mode.id === state.selectedModeId;
            const name = loc(mode, 'name');
            const tag = loc(mode, 'shortTag');
            return `
                <button type="button" class="mode-pill-btn ${selected ? 'selected' : ''}" data-mode-id="${mode.id}" title="${loc(mode, 'desc')}">
                    <div class="mode-pill-head">
                        <i data-lucide="${mode.icon}" style="width:13px;height:13px;color:${mode.color};"></i>
                        <span>${name}</span>
                    </div>
                    <div class="mode-pill-tag" style="color:${selected ? mode.color : 'var(--text-secondary)'};">${tag}</div>
                </button>
            `;
        }).join('');

        grid.querySelectorAll('.mode-pill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const modeId = btn.dataset.modeId;
                state.selectedModeId = modeId;
                if (modeId === 'daily' && typeof DATA.getDailyProtocol === 'function') {
                    state.selectedMapId = DATA.getDailyProtocol().mapId;
                }
                playUiSound('uiClick');
                saveDeploymentPrefs();
                renderModePicker();
                renderDailyProtocolBanner();
                renderSectorPicker();
                updateLaunchLabel();
            });
        });

        renderDailyProtocolBanner();
        refreshIcons();
    }

    function renderDailyProtocolBanner() {
        const banner = document.getElementById('dailyProtocolBanner');
        const modeTag = document.getElementById('selectedModeTag');
        const modeObj = DATA.GAME_MODES && DATA.GAME_MODES[state.selectedModeId];

        if (modeTag && modeObj) {
            modeTag.textContent = loc(modeObj, 'shortTag');
            modeTag.style.color = modeObj.color;
        }
        if (!banner) return;

        if (state.selectedModeId !== 'daily' || typeof DATA.getDailyProtocol !== 'function') {
            banner.hidden = true;
            banner.innerHTML = '';
            return;
        }

        const daily = DATA.getDailyProtocol();
        const copy = tCopy();
        const mutHtml = (daily.mutators || []).map(mut => `
            <div class="daily-mutator-chip">
                <i data-lucide="${mut.icon}" style="width:14px;height:14px;color:${mut.color};margin-top:2px;"></i>
                <div>
                    <div style="font-weight:600;color:${mut.color};">${loc(mut, 'name')}</div>
                    <div style="color:var(--text-secondary);">${loc(mut, 'desc')}</div>
                </div>
            </div>
        `).join('');

        banner.hidden = false;
        banner.innerHTML = `
            <div class="daily-protocol-head">
                <span class="cs-badge cs-badge-mint cs-badge-sm font-mono">${copy.dailySeedLabel}: ${daily.seed}</span>
                <span class="font-mono" style="color:var(--text-secondary);font-size:11px;">
                    ${copy.dailySectorLabel}: <strong style="color:var(--text-primary);">${loc(daily.map, 'name')}</strong> · ${copy.fixedDailyNote}
                </span>
            </div>
            <div class="daily-mutators-row">${mutHtml}</div>
        `;
        refreshIcons();
    }

    function renderSectorPicker() {
        const grid = document.getElementById('sectorPickerGrid');
        if (!grid) return;
        const copy = tCopy();

        grid.innerHTML = Object.values(DATA.MAPS).map(map => {
            const selected = map.id === state.selectedMapId;
            const name = loc(map, 'name');
            const eventSummary = map.arenaEvents.map(ev => loc(ev, 'name')).join(' + ');
            const multText = `${map.scoreMult.toFixed(2).replace(/\.00$/, '.0')}x ${copy.scoreUnit}`;
            return `
                <button type="button" class="sector-pick-card ${selected ? 'selected' : ''}" data-map-id="${map.id}">
                    <div class="sector-pick-banner">
                        <img src="${map.asset}" alt="${name}">
                        <span class="sector-mult-badge">${multText}</span>
                    </div>
                    <div class="sector-pick-title">
                        <span>${name}</span>
                        <span class="sector-pick-meta">${map.code}</span>
                    </div>
                    <div class="sector-pick-meta">${copy.coverTag}</div>
                    <div class="sector-pick-event">${eventSummary}</div>
                </button>
            `;
        }).join('');

        grid.querySelectorAll('.sector-pick-card').forEach(card => {
            card.addEventListener('click', () => {
                const pickedId = card.dataset.mapId;
                state.selectedMapId = pickedId;
                if (state.selectedModeId === 'daily' && typeof DATA.getDailyProtocol === 'function') {
                    const dailyMap = DATA.getDailyProtocol().mapId;
                    if (pickedId !== dailyMap) {
                        state.selectedModeId = 'survival';
                        renderModePicker();
                        showToast(copy.switchedToClassic);
                    }
                }
                playUiSound('uiClick');
                saveDeploymentPrefs();
                renderSectorPicker();
                updateActiveSectorBrief();
            });
        });

        updateActiveSectorBrief();
    }

    function updateActiveSectorBrief() {
        const map = DATA.MAPS[state.selectedMapId] || DATA.MAPS.sector9;
        const copy = tCopy();
        const codeEl = document.getElementById('selectedSectorCode');
        const briefEl = document.getElementById('activeSectorBrief');
        if (codeEl) codeEl.textContent = `${map.code} · 5600×5600 · ${map.scoreMult}x ${copy.scoreUnit}`;
        if (briefEl) {
            const eventsList = map.arenaEvents.map(e => `<strong>${loc(e, 'name')}:</strong> ${loc(e, 'desc')}`).join('<br>');
            briefEl.innerHTML = `
                <div style="margin-bottom:0.2rem;font-weight:600;color:var(--accent-sky);">
                    ${copy.arenaEventsTitle} — ${loc(map, 'name')} (${copy.coverTag})
                </div>
                <div>${eventsList}</div>
            `;
        }
        updateLaunchLabel();
    }

    function renderDifficulties() {
        const grid = document.getElementById('difficultyGrid');
        if (!grid) return;
        const copy = tCopy();

        grid.innerHTML = Object.values(DATA.DIFFICULTIES).map(diff => {
            const selected = diff.id === state.selectedDiff;
            const title = loc(diff, 'shortLabel');
            return `
                <button type="button" class="diff-pill ${selected ? 'selected' : ''}" data-diff-id="${diff.id}" title="${loc(diff, 'desc')}">
                    <span class="diff-pill-title">${title}</span>
                    <span class="diff-pill-mult" style="color:${diff.color};">${diff.sm.toFixed(1)}x ${copy.scoreUnit} · ${Math.round(diff.ehm * 100)}% ${copy.hpLabel}</span>
                </button>
            `;
        }).join('');

        grid.querySelectorAll('.diff-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                state.selectedDiff = btn.dataset.diffId;
                playUiSound('uiClick');
                saveDeploymentPrefs();
                renderDifficulties();
                updateDiffReadout();
            });
        });

        updateDiffReadout();
    }

    function updateDiffReadout() {
        const diff = DATA.DIFFICULTIES[state.selectedDiff] || DATA.DIFFICULTIES.normal;
        const copy = tCopy();
        const el = document.getElementById('selectedDiffMult');
        if (el) {
            el.textContent = `${diff.sm.toFixed(1)}x ${copy.scoreUnit}`;
            el.style.color = diff.color;
        }
        updateLaunchLabel();
    }

    function updateLaunchLabel() {
        const ship = DATA.SHIPS[state.selectedShipId] || DATA.SHIPS.interceptor;
        const map = DATA.MAPS[state.selectedMapId] || DATA.MAPS.sector9;
        const diff = DATA.DIFFICULTIES[state.selectedDiff] || DATA.DIFFICULTIES.normal;
        const mode = (DATA.GAME_MODES && DATA.GAME_MODES[state.selectedModeId]) || { name: 'Klasik Sefer', nameEn: 'Classic', scoreMult: 1, color: '#38bdf8' };
        const copy = tCopy();

        const modePill = document.getElementById('launchSummaryMode');
        if (modePill) {
            modePill.textContent = loc(mode, 'name').toUpperCase();
            modePill.style.color = mode.color || '#38bdf8';
        }

        const totalMult = (diff.sm * map.scoreMult * (mode.scoreMult || 1)).toFixed(2).replace(/\.00$/, '.0');
        const summaryEl = document.getElementById('launchSummaryText');
        if (summaryEl) {
            summaryEl.textContent = `${map.code} · ${loc(diff, 'shortLabel')} · ${totalMult}x ${copy.scoreUnit}`;
        }

        const btnText = document.getElementById('launchBtnText');
        if (btnText) btnText.textContent = copy.launchWithShip(loc(ship, 'name'), map.code);
    }

    function updateShipRadarChart(ship) {
        const canvas = document.getElementById('shipRadarCanvas');
        if (!canvas || typeof global.Chart === 'undefined') return;

        const r = ship.radar || { speed: 70, firepower: 70, defense: 70, control: 70, capacity: 70 };
        const values = [r.speed, r.firepower, r.defense, r.control, r.capacity];
        const color = ship.color || '#38bdf8';
        const labels = tCopy().radarLabels;
        const shipName = loc(ship, 'name');

        if (state.radarChart) {
            state.radarChart.data.labels = labels;
            state.radarChart.data.datasets[0].label = shipName;
            state.radarChart.data.datasets[0].data = values;
            state.radarChart.data.datasets[0].borderColor = color;
            state.radarChart.data.datasets[0].backgroundColor = color + '33';
            state.radarChart.data.datasets[0].pointBackgroundColor = color;
            state.radarChart.update('none');
            return;
        }

        state.radarChart = new global.Chart(canvas.getContext('2d'), {
            type: 'radar',
            data: {
                labels,
                datasets: [{
                    label: shipName,
                    data: values,
                    borderColor: color,
                    backgroundColor: color + '33',
                    borderWidth: 2,
                    pointBackgroundColor: color,
                    pointBorderColor: '#070b12',
                    pointRadius: 3
                }]
            },
            options: {
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
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { display: false, stepSize: 25 },
                        grid: { color: 'rgba(148, 163, 184, 0.14)' },
                        angleLines: { color: 'rgba(148, 163, 184, 0.16)' },
                        pointLabels: {
                            color: '#94a3b8',
                            font: { family: 'Inter, sans-serif', size: 10.5, weight: '600' }
                        }
                    }
                }
            }
        });
    }

    function updateCockpitTelemetry() {
        const ship = DATA.SHIPS[state.selectedShipId] || DATA.SHIPS.interceptor;
        const bonuses = PERSIST.getBonuses();
        const copy = tCopy();

        const setEl = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setEl('stageShipName', `${loc(ship, 'name')} (${ship.codeName})`);
        setEl('stageShipRole', loc(ship, 'role'));
        setEl('telemetryTagBadge', loc(ship, 'tag'));

        const effHp = Math.round(ship.hp * bonuses.hpMult);
        const effSh = Math.round(ship.sh * bonuses.hpMult);
        const effSp = Math.round(ship.sp * bonuses.spdMult);
        const effCrit = Math.round((ship.crit + bonuses.critAdd) * 100);

        setEl('kpiHp', `${effHp}`);
        setEl('kpiSh', `${effSh}`);
        setEl('kpiSpdArmor', `${effSp} / %${Math.round(ship.armor * 100)}`);
        setEl('kpiCrit', `%${effCrit}`);

        setEl('passiveTitle', loc(ship, 'passiveName'));
        setEl('passiveDesc', loc(ship, 'passiveDesc'));
        setEl('abilityTitle', loc(ship, 'abilityName'));
        setEl('abilityCdBadge', `${ship.abilityCd.toFixed(1)}s CD`);
        setEl('abilityDesc', loc(ship, 'abilityDesc'));

        const starterW = DATA.WEAPONS[ship.starterWeapon];
        const sigW = DATA.WEAPONS[ship.sigWeapon];
        const sigT = DATA.TRINKETS[ship.sigTrinket];
        const sigE = DATA.EVOLUTIONS[ship.sigEvo];
        const sigM = DATA.SUPER_EVOLUTIONS[ship.sigMega];

        const comboEl = document.getElementById('signatureComboChain');
        if (comboEl && sigW && sigT && sigE && sigM) {
            comboEl.innerHTML = `
                <div>${copy.starterLabel}: <strong>${starterW ? loc(starterW, 'name') : ship.starterWeapon}</strong></div>
                <div>${copy.coreSynthLabel}: <strong>${loc(sigW, 'name')}</strong> + <strong>${loc(sigT, 'name')}</strong></div>
                <div>${copy.sigEvoLabel}: <strong style="color:var(--accent-sky);">${loc(sigE, 'name')}</strong></div>
                <div>${copy.targetMegaLabel}: <strong style="color:var(--accent-amber);">${loc(sigM, 'name')}</strong></div>
            `;
        }

        const treeLink = document.getElementById('stageTreeLink');
        if (treeLink) treeLink.href = `tree.html?ship=${ship.id}`;
        const navTreeLink = document.getElementById('navTreeLink');
        if (navTreeLink) navTreeLink.href = `tree.html?ship=${ship.id}`;

        updateLaunchLabel();
        updateShipRadarChart(ship);
    }

    function getTintedShipSprite(shipId, skin) {
        if (!skin || skin.id === 'standard' || !global.CosmicModels || typeof global.CosmicModels.getShipImage !== 'function') {
            return null;
        }
        const img = global.CosmicModels.getShipImage(shipId);
        if (!img || !img.complete || !img.naturalWidth) return null;

        const key = `${shipId}_${skin.id}`;
        if (state.tintedSpriteCache[key]) return state.tintedSpriteCache[key];

        const off = document.createElement('canvas');
        off.width = img.naturalWidth;
        off.height = img.naturalHeight;
        const octx = off.getContext('2d');
        octx.drawImage(img, 0, 0);
        octx.globalCompositeOperation = 'multiply';
        octx.fillStyle = skin.hex;
        octx.fillRect(0, 0, off.width, off.height);
        octx.globalCompositeOperation = 'destination-in';
        octx.drawImage(img, 0, 0);

        state.tintedSpriteCache[key] = off;
        return off;
    }

    function startTurntableLoop() {
        const canvas = document.getElementById('turntableCanvas');
        if (!canvas || !global.CosmicModels) return;

        const renderFrame = (nowMs) => {
            if (state.activeView === 'view-cockpit') {
                const t = nowMs * 0.001;
                const ship = DATA.SHIPS[state.selectedShipId] || DATA.SHIPS.interceptor;
                const skin = (DATA.SHIP_SKINS && DATA.SHIP_SKINS[state.selectedSkinId]) || null;
                const stageColor = skin && skin.id !== 'standard' ? skin.accent : ship.color;

                global.CosmicModels.renderTurntable(canvas, state.selectedShipId, t, { color: stageColor });

                const tinted = getTintedShipSprite(state.selectedShipId, skin);
                if (tinted) {
                    const ctx = canvas.getContext('2d');
                    const dpr = Math.min(global.devicePixelRatio || 1, 2);
                    const w = canvas.clientWidth || canvas.width || 320;
                    const h = canvas.clientHeight || canvas.height || 128;
                    const baseR = Math.min(w, h) * 0.34;
                    const r = Math.max(8, baseR * 0.62);
                    const size = r * 2.2;
                    const cx = w * 0.5;
                    const cy = h * 0.52 - 6 + Math.sin(t * 2.1) * 5;
                    const rot = Math.sin(t * 0.85) * 0.18;

                    ctx.save();
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    ctx.translate(cx, cy);
                    ctx.rotate(rot);
                    ctx.drawImage(tinted, -size * 0.5, -size * 0.5, size, size);
                    ctx.restore();
                }
            }
            state.turntableHandle = requestAnimationFrame(renderFrame);
        };
        if (state.turntableHandle) cancelAnimationFrame(state.turntableHandle);
        state.turntableHandle = requestAnimationFrame(renderFrame);
    }

    function setupLaunchButton() {
        const btn = document.getElementById('launchSortieBtn');
        const input = document.getElementById('pilotCallsignInput');
        if (input) {
            input.addEventListener('change', saveDeploymentPrefs);
        }
        if (!btn) return;
        btn.addEventListener('click', () => {
            playUiSound('uiConfirm');
            saveDeploymentPrefs();
            const targetUrl = `game.html?ship=${encodeURIComponent(state.selectedShipId)}&map=${encodeURIComponent(state.selectedMapId)}&diff=${encodeURIComponent(state.selectedDiff)}&mode=${encodeURIComponent(state.selectedModeId)}&skin=${encodeURIComponent(state.selectedSkinId)}`;
            global.location.href = targetUrl;
        });
    }

    // -------------------------------------------------------------------------
    // View 2: Research Workshop (All 10 Modules)
    // -------------------------------------------------------------------------
    function renderWorkshop() {
        const profile = PERSIST.load();
        const bonuses = PERSIST.getBonuses();
        const copy = tCopy();

        const summaryEl = document.getElementById('workshopSummaryLabel');
        if (summaryEl) summaryEl.textContent = copy.workshopSummary;
        const armoryBtnEl = document.getElementById('workshopArmoryBtnLabel');
        if (armoryBtnEl) armoryBtnEl.textContent = copy.armoryBtn;

        const bonusPills = document.getElementById('workshopBonusPills');
        if (bonusPills) {
            bonusPills.innerHTML = `
                <span class="cs-badge cs-badge-coral font-mono">${copy.dmgLabel} ${bonuses.dmgMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-amber font-mono">${copy.hullShieldLabel} ${bonuses.hpMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-sky font-mono">${copy.spdLabel} ${bonuses.spdMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-violet font-mono">${copy.critLabel} +%${Math.round(bonuses.critAdd * 100)}</span>
                <span class="cs-badge cs-badge-mint font-mono">${copy.cdrLabel} -%${Math.round(bonuses.cdrAdd * 100)}</span>
                <span class="cs-badge cs-badge-sky font-mono">${copy.rerollLabel} +${bonuses.extraRerolls}</span>
                <span class="cs-badge cs-badge-violet font-mono">${copy.overdriveLabel} ${(bonuses.overdriveMult || 1).toFixed(2)}x</span>
                <span class="cs-badge cs-badge-coral font-mono">${copy.revivalLabel} +${bonuses.revivals || 0}</span>
            `;
        }

        const grid = document.getElementById('workshopGrid');
        if (!grid) return;

        grid.innerHTML = DATA.WORKSHOP_UPGRADES.map(upg => {
            const lvl = profile.upgrades[upg.id] || 0;
            const maxed = lvl >= upg.maxLevel;
            const cost = maxed ? 0 : PERSIST.getUpgradeCost(upg.id, lvl);
            const canAfford = !maxed && profile.credits >= cost;

            const pips = Array.from({ length: upg.maxLevel }, (_, idx) =>
                `<span class="level-pip ${idx < lvl ? 'filled' : ''}" style="${idx < lvl ? `background:${upg.color};` : ''}"></span>`
            ).join('');

            return `
                <article class="workshop-card">
                    <div class="workshop-card-top">
                        <div class="workshop-icon-box" style="color:${upg.color};">
                            <i data-lucide="${upg.icon}"></i>
                        </div>
                        <div style="min-width:0;flex:1;">
                            <div style="font-family:var(--font-display);font-weight:600;font-size:15px;">${loc(upg, 'name')}</div>
                            <div style="font-size:12.5px;color:var(--text-secondary);">${loc(upg, 'perLevelLabel')}</div>
                        </div>
                        <span class="cs-badge font-mono">Lv.${lvl}/${upg.maxLevel}</span>
                    </div>

                    <div class="level-pips">${pips}</div>

                    <button type="button" class="cs-btn ${maxed ? 'cs-btn-mint' : (canAfford ? 'cs-btn-primary' : '')} workshop-buy-btn"
                        data-upg-id="${upg.id}" ${maxed || !canAfford ? 'disabled' : ''}>
                        <i data-lucide="${maxed ? 'check' : 'arrow-up-circle'}"></i>
                        <span>${maxed ? copy.maxLevel : copy.upgradeBtn(formatNum(cost))}</span>
                    </button>
                </article>
            `;
        }).join('');

        grid.querySelectorAll('.workshop-buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const upgId = btn.dataset.upgId;
                const upg = DATA.WORKSHOP_UPGRADES.find(u => u.id === upgId);
                const res = PERSIST.buyUpgrade(upgId);
                if (res.ok) {
                    playUiSound('uiConfirm');
                    updateHeaderCredits();
                    renderWorkshop();
                    updateCockpitTelemetry();
                    showToast(copy.upgradeDoneToast(res.level));
                    if (upg && res.level >= upg.maxLevel) {
                        triggerCelebration(upg.color);
                    }
                } else {
                    playUiSound('uiBack');
                    showToast(copy.insufficientCreditsToast);
                }
            });
        });

        refreshIcons();
    }

    function setupWorkshopReset() {
        const btn = document.getElementById('resetWorkshopBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const res = PERSIST.resetUpgrades();
            playUiSound('uiBack');
            updateHeaderCredits();
            renderWorkshop();
            updateCockpitTelemetry();
            showToast(tCopy().refundToast(formatNum(res.refunded)));
        });
    }

    // -------------------------------------------------------------------------
    // View 3: Sector Atlas & Boss Intel
    // -------------------------------------------------------------------------
    function renderSectorAtlas() {
        const copy = tCopy();
        const bossHeading = document.getElementById('atlasBossHeading');
        const bossSub = document.getElementById('atlasBossSub');
        if (bossHeading) bossHeading.textContent = copy.atlasBossHeading;
        if (bossSub) bossSub.textContent = copy.atlasBossSub;

        const secGrid = document.getElementById('atlasSectorGrid');
        if (secGrid) {
            secGrid.innerHTML = Object.values(DATA.MAPS).map(map => {
                const name = loc(map, 'name');
                const eventsHtml = map.arenaEvents.map(ev => `
                    <div class="atlas-event-item">
                        <div style="font-weight:600;color:${ev.type === 'hazard' ? 'var(--accent-coral)' : 'var(--accent-mint)'};margin-bottom:0.15rem;">
                            ${loc(ev, 'name')}
                        </div>
                        <div style="color:var(--text-secondary);line-height:1.42;">${loc(ev, 'desc')}</div>
                    </div>
                `).join('');

                return `
                    <article class="atlas-sector-card">
                        <div class="atlas-sector-media">
                            <img src="${map.asset}" alt="${name}">
                            <span class="sector-mult-badge">${loc(map, 'hazardTag')}</span>
                        </div>
                        <div class="atlas-sector-body">
                            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                                <h3 style="font-size:16.5px;">${name}</h3>
                                <span class="cs-badge cs-badge-sky font-mono">${map.code}</span>
                            </div>
                            <div class="font-mono" style="font-size:11px;color:var(--accent-teal);">${copy.coverTag}</div>
                            <p style="font-size:12.5px;margin:0;">${loc(map, 'subtitle')}</p>
                            ${eventsHtml}
                            <div style="font-size:12px;color:var(--text-secondary);margin-top:auto;">
                                <strong style="color:var(--text-primary);">${copy.atlasTacticsLabel}</strong> ${loc(map, 'tactics')}
                            </div>
                            <button type="button" class="cs-btn cs-btn-primary atlas-deploy-btn" data-map-id="${map.id}">
                                <i data-lucide="crosshair"></i>
                                <span>${copy.atlasDeployBtn}</span>
                            </button>
                        </div>
                    </article>
                `;
            }).join('');

            secGrid.querySelectorAll('.atlas-deploy-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const mapId = btn.dataset.mapId;
                    state.selectedMapId = mapId;
                    if (state.selectedModeId === 'daily' && typeof DATA.getDailyProtocol === 'function' && mapId !== DATA.getDailyProtocol().mapId) {
                        state.selectedModeId = 'survival';
                        renderModePicker();
                    }
                    saveDeploymentPrefs();
                    renderSectorPicker();
                    playUiSound('uiConfirm');
                    switchView('view-cockpit');
                    showToast(copy.atlasDeployToast(loc(DATA.MAPS[mapId], 'name')));
                });
            });
        }

        const bossGrid = document.getElementById('atlasBossGrid');
        if (bossGrid) {
            bossGrid.innerHTML = DATA.BOSSES.map(boss => `
                <article class="atlas-boss-card">
                    <div class="atlas-boss-head">
                        <img src="${boss.asset}" alt="${boss.name}" class="atlas-boss-thumb">
                        <div>
                            <h3 style="font-size:15.5px;">${boss.name}</h3>
                            <div style="font-size:12px;color:var(--text-secondary);">${loc(boss, 'subtitle')}</div>
                            <span class="cs-badge cs-badge-coral font-mono" style="margin-top:0.32rem;">${loc(boss, 'spawnWave')}</span>
                        </div>
                    </div>
                    <ul class="boss-mechanics-list">
                        ${(getLang() === 'en' && boss.mechanicsEn ? boss.mechanicsEn : boss.mechanics).map(m => `<li>${m}</li>`).join('')}
                    </ul>
                    <div style="font-size:12px;color:var(--text-secondary);padding-top:0.35rem;border-top:1px solid var(--border-subtle);margin-top:auto;">
                        <strong style="color:var(--accent-mint);">${copy.atlasCounterLabel}</strong> ${loc(boss, 'tactics')}
                    </div>
                </article>
            `).join('');
        }

        refreshIcons();
    }

    // -------------------------------------------------------------------------
    // View 4: 100% Local Pilot Flight Logs & Personal Bests Hub
    // -------------------------------------------------------------------------
    function renderPersonalBests(bests) {
        const copy = tCopy();
        const sectorGrid = document.getElementById('sectorBestsGrid');
        if (sectorGrid) {
            sectorGrid.innerHTML = Object.values(DATA.MAPS).map(map => {
                const rec = bests.byMap && bests.byMap[map.id];
                const shipObj = rec && DATA.SHIPS[rec.shipId];
                return `
                    <article class="personal-best-card">
                        <div class="personal-best-top">
                            <span>${loc(map, 'name')}</span>
                            <span class="cs-badge cs-badge-sky cs-badge-sm font-mono">${map.code}</span>
                        </div>
                        <div class="personal-best-score">${rec ? formatNum(rec.score) : '—'}</div>
                        <div class="personal-best-meta">
                            ${rec ? `${copy.waveShort}${rec.wave || 1} · ${shipObj ? loc(shipObj, 'name') : rec.shipId} · ${rec.time || '00:00'}` : copy.noRecordYet}
                        </div>
                    </article>
                `;
            }).join('');
        }

        const modeHeaderBadge = document.getElementById('dailyBestHeaderBadge');
        if (modeHeaderBadge) modeHeaderBadge.textContent = copy.recordsBadge;

        const modeGrid = document.getElementById('modeBestsGrid');
        if (modeGrid && DATA.GAME_MODES) {
            const daily = typeof DATA.getDailyProtocol === 'function' ? DATA.getDailyProtocol() : null;
            const cardsHtml = Object.values(DATA.GAME_MODES).map(mode => {
                const rec = bests.byMode && bests.byMode[mode.id];
                const shipObj = rec && DATA.SHIPS[rec.shipId];
                const isDaily = mode.id === 'daily';
                const dailyRec = isDaily ? (bests.todayDailyBest || rec) : rec;
                return `
                    <article class="personal-best-card ${isDaily ? 'is-daily' : ''}">
                        <div class="personal-best-top">
                            <span style="display:inline-flex;align-items:center;gap:0.3rem;">
                                <i data-lucide="${mode.icon}" style="width:13px;height:13px;color:${mode.color};"></i>
                                <span>${isDaily ? copy.dailyBestTitle : loc(mode, 'name')}</span>
                            </span>
                        </div>
                        <div class="personal-best-score" style="color:${mode.color};">
                            ${dailyRec ? formatNum(dailyRec.score) : '—'}
                        </div>
                        <div class="personal-best-meta">
                            ${dailyRec
                                ? `${copy.waveShort}${dailyRec.wave || 1} · ${shipObj ? loc(shipObj, 'name') : dailyRec.shipId}`
                                : (isDaily && daily ? daily.seed : copy.noRecordYet)}
                        </div>
                    </article>
                `;
            }).join('');
            modeGrid.innerHTML = cardsHtml;
        }
    }

    function renderRecordFilterPills() {
        const container = document.getElementById('recordsModeFilters');
        if (!container || !DATA.GAME_MODES) return;
        const copy = tCopy();

        const filters = [{ id: 'all', label: copy.allModesFilter }].concat(
            Object.values(DATA.GAME_MODES).map(m => ({ id: m.id, label: loc(m, 'name') }))
        );

        container.innerHTML = filters.map(f => `
            <button type="button" class="record-filter-btn ${state.recordModeFilter === f.id ? 'active' : ''}" data-filter-mode="${f.id}">
                ${f.label}
            </button>
        `).join('');

        container.querySelectorAll('.record-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.recordModeFilter = btn.dataset.filterMode;
                playUiSound('uiClick');
                renderRecordsView();
            });
        });
    }

    function renderLocalScoreRows(tbody, scores) {
        if (!tbody) return;
        const copy = tCopy();

        if (!scores || !scores.length) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:1.4rem;">${copy.tableEmpty}</td></tr>`;
            return;
        }

        tbody.innerHTML = scores.slice(0, 20).map((row, idx) => {
            const pilot = row.players || 'PİLOT-01';
            const modeObj = DATA.GAME_MODES && DATA.GAME_MODES[row.gameMode || 'survival'];
            const shipObj = DATA.SHIPS[row.shipId];
            const mapObj = DATA.MAPS[row.mapId];
            const diffObj = DATA.DIFFICULTIES[row.difficulty];

            const modeLabel = modeObj ? loc(modeObj, 'name') : (row.gameMode || 'survival');
            const shipLabel = shipObj ? loc(shipObj, 'name') : (row.shipId || 'interceptor');
            const sectorLabel = mapObj ? mapObj.code : (row.mapId || 'SEC-09');
            const diffColor = diffObj ? diffObj.color : '#38bdf8';

            return `
                <tr>
                    <td class="font-mono">#${idx + 1}</td>
                    <td style="color:var(--text-primary);font-weight:500;">${pilot}</td>
                    <td>
                        <span class="cs-badge cs-badge-sm" style="color:${modeObj ? modeObj.color : 'var(--accent-sky)'};">
                            ${modeLabel}
                        </span>
                    </td>
                    <td>${shipLabel}</td>
                    <td class="font-mono">${sectorLabel}</td>
                    <td class="font-mono" style="color:${diffColor};">${copy.waveShort}${row.wave || 1}</td>
                    <td class="font-mono" style="color:var(--accent-sky);font-weight:600;">${formatNum(row.score || 0)}</td>
                    <td class="font-mono">${row.time || '00:00'}</td>
                </tr>
            `;
        }).join('');
    }

    function renderRecordsView() {
        const profile = PERSIST.load();
        const s = profile.stats;
        const copy = tCopy();

        const setTh = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        setTh('thRank', copy.thRank);
        setTh('thPilot', copy.thPilot);
        setTh('thMode', copy.thMode);
        setTh('thShip', copy.thShip);
        setTh('thSector', copy.thSector);
        setTh('thWave', copy.thWave);
        setTh('thScore', copy.thScore);
        setTh('thTime', copy.thTime);

        const statsGrid = document.getElementById('recordsStatsGrid');
        const label = (key, fallback) => (global.CosmicI18n ? global.CosmicI18n.t(key) : fallback);
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="record-stat-card">
                    <div style="font-size:12px;color:var(--text-secondary);">${label('records.totalRuns', 'Toplam Uçuş')}</div>
                    <div class="record-stat-val">${formatNum(s.runs || 0)}</div>
                </div>
                <div class="record-stat-card">
                    <div style="font-size:12px;color:var(--text-secondary);">${label('records.bestScore', 'En Yüksek Skor')}</div>
                    <div class="record-stat-val" style="color:var(--accent-sky);">${formatNum(s.bestScore || 0)}</div>
                </div>
                <div class="record-stat-card">
                    <div style="font-size:12px;color:var(--text-secondary);">${label('records.bestWave', 'En Yüksek Dalga')}</div>
                    <div class="record-stat-val" style="color:var(--accent-mint);">${s.bestWave || 0}</div>
                </div>
                <div class="record-stat-card">
                    <div style="font-size:12px;color:var(--text-secondary);">${label('records.totalKills', 'Toplam İmha')}</div>
                    <div class="record-stat-val">${formatNum(s.totalKills || 0)}</div>
                </div>
                <div class="record-stat-card">
                    <div style="font-size:12px;color:var(--text-secondary);">${label('records.evosMegas', 'Evrim / Mega')}</div>
                    <div class="record-stat-val" style="color:var(--accent-amber);">${s.totalEvos || 0} / ${s.totalMegas || 0}</div>
                </div>
            `;
        }

        const LB = global.CosmicLeaderboard;
        const bests = LB && typeof LB.getPersonalBests === 'function'
            ? LB.getPersonalBests()
            : { overallBest: null, byMap: {}, byMode: {}, todayDailyBest: null, totalRuns: 0 };

        renderPersonalBests(bests);
        renderRecordFilterPills();

        const localBody = document.getElementById('localLeaderboardBody');
        const scores = LB && typeof LB.getLocalScores === 'function'
            ? LB.getLocalScores(state.recordModeFilter === 'all' ? {} : { gameMode: state.recordModeFilter })
            : [];
        renderLocalScoreRows(localBody, scores);
        refreshIcons();
    }

    function setupRecordsClear() {
        const btn = document.getElementById('clearLocalRecordsBtn');
        const labelEl = document.getElementById('clearRecordsLabel');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const copy = tCopy();
            if (!state.clearRecordsArmed) {
                state.clearRecordsArmed = true;
                if (labelEl) labelEl.textContent = copy.clearConfirmBtn;
                playUiSound('uiClick');
                clearTimeout(state.clearRecordsTimer);
                state.clearRecordsTimer = setTimeout(() => {
                    state.clearRecordsArmed = false;
                    if (global.CosmicI18n) {
                        if (labelEl) labelEl.textContent = global.CosmicI18n.t('records.clear');
                    }
                }, 4000);
                return;
            }

            state.clearRecordsArmed = false;
            clearTimeout(state.clearRecordsTimer);
            if (global.CosmicLeaderboard && typeof global.CosmicLeaderboard.clearLocalScores === 'function') {
                global.CosmicLeaderboard.clearLocalScores();
            }
            if (labelEl && global.CosmicI18n) labelEl.textContent = global.CosmicI18n.t('records.clear');
            playUiSound('uiBack');
            renderRecordsView();
            showToast(copy.recordsClearedToast);
        });
    }

    // -------------------------------------------------------------------------
    // View 5: Career Achievements (12 Milestones + Confetti)
    // -------------------------------------------------------------------------
    function renderAchievementsView() {
        const profile = PERSIST.load();
        const grid = document.getElementById('achievementsGrid');
        const badge = document.getElementById('achievementCounterBadge');
        if (!grid) return;
        const copy = tCopy();

        let unlockedTotal = 0;
        grid.innerHTML = DATA.ACHIEVEMENTS.map(ach => {
            const isUnlocked = Boolean(profile.achievements && profile.achievements[ach.id]);
            const isClaimed = Boolean(profile.claimedAchievements && profile.claimedAchievements[ach.id]);
            if (isUnlocked) unlockedTotal++;

            return `
                <article class="achievement-card ${isUnlocked ? 'is-unlocked' : ''}">
                    <div class="achievement-head">
                        <div class="workshop-icon-box" style="color:${isUnlocked ? ach.color : 'var(--text-muted)'};">
                            <i data-lucide="${ach.icon}"></i>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-family:var(--font-display);font-weight:600;font-size:15px;">${loc(ach, 'name')}</div>
                            <span class="cs-badge ${isUnlocked ? 'cs-badge-mint' : ''} font-mono" style="margin-top:0.2rem;">
                                ${copy.rewardLabel}: ${ach.reward} CRD
                            </span>
                        </div>
                    </div>
                    <p style="font-size:13px;margin:0;">${loc(ach, 'desc')}</p>
                    <button type="button" class="cs-btn ${isUnlocked && !isClaimed ? 'cs-btn-mint' : 'cs-btn-ghost'} ach-claim-btn"
                        data-ach-id="${ach.id}" ${!isUnlocked || isClaimed ? 'disabled' : ''}>
                        <i data-lucide="${isClaimed ? 'check-circle-2' : (isUnlocked ? 'gift' : 'lock')}"></i>
                        <span>${isClaimed ? copy.claimedBtn : (isUnlocked ? copy.claimBtn(ach.reward) : copy.lockedBtn)}</span>
                    </button>
                </article>
            `;
        }).join('');

        if (badge) badge.textContent = `${unlockedTotal} / ${DATA.ACHIEVEMENTS.length}`;

        grid.querySelectorAll('.ach-claim-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const achId = btn.dataset.achId;
                const ach = DATA.ACHIEVEMENTS.find(a => a.id === achId);
                const res = PERSIST.claimAchievement(achId);
                if (res.ok) {
                    playUiSound('uiConfirm');
                    updateHeaderCredits();
                    renderAchievementsView();
                    triggerCelebration(ach ? ach.color : '#34d399');
                    showToast(copy.achClaimedToast(res.reward));
                }
            });
        });

        refreshIcons();
    }

    // -------------------------------------------------------------------------
    // Dynamic Re-Render on Language Change (EN / TR)
    // -------------------------------------------------------------------------
    function renderAllLocalized() {
        syncTopbarLabels();
        syncAudioUI();
        updateHeaderCredits();
        renderShipDeck();
        renderSkinPills();
        renderModePicker();
        renderSectorPicker();
        renderDifficulties();
        updateCockpitTelemetry();

        if (state.activeView === 'view-workshop') renderWorkshop();
        if (state.activeView === 'view-maps') renderSectorAtlas();
        if (state.activeView === 'view-records') renderRecordsView();
        if (state.activeView === 'view-achievements') renderAchievementsView();
        refreshIcons();
    }

    // -------------------------------------------------------------------------
    // Init
    // -------------------------------------------------------------------------
    function init() {
        loadSavedDeployment();
        setupAudioControl();
        setupRailNavigation();
        setupLaunchButton();
        setupWorkshopReset();
        setupRecordsClear();

        if (global.CosmicI18n && typeof global.CosmicI18n.applyTranslations === 'function') {
            global.CosmicI18n.applyTranslations();
        }
        renderAllLocalized();
        if (state.activeView !== 'view-cockpit') {
            switchView(state.activeView);
        } else {
            animateViewCards(document.getElementById('view-cockpit'));
        }
        startTurntableLoop();

        global.addEventListener('cosmic:langchange', () => {
            if (global.CosmicI18n && typeof global.CosmicI18n.applyTranslations === 'function') {
                global.CosmicI18n.applyTranslations();
            }
            renderAllLocalized();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
