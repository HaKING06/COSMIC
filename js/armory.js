// =============================================================================
// COSMIC SURVIVORS v10.0 — FLEET ARMORY & R&D BAY CONTROLLER (js/armory.js)
// Interactive 8-Ship Skin Customizer, Live Canvas Turntable Preview,
// 10 Permanent R&D Modules + Total Refund, Chart.js Bar/Radar Impact Graph,
// Local Pilot Combat History & Dynamic EN/TR Localization.
// =============================================================================
(function (global) {
    'use strict';

    const DATA = global.COSMIC_DATA;
    const PERSIST = global.CosmicPersistence;

    const state = {
        selectedShipId: 'interceptor',
        previewSkinId: 'standard',
        chartType: 'bar',
        impactChart: null,
        turntableHandle: null,
        tintedSpriteCache: {}
    };

    const COPY = {
        tr: {
            pageTitle: 'COSMIC SURVIVORS v10.0 — Cephanelik & Filo Kalibrasyon Merkezi',
            nav: { hangar: 'Hangar', tree: 'Evrim Ağacı', armory: 'Cephanelik', modes: 'Modlar', wiki: 'Ansiklopedi', about: 'Hakkında' },
            audioOn: 'Ses Açık',
            audioOff: 'Sessiz',
            heroBadge: 'V10.0 FİLO CEPHANELİĞİ',
            hangarDeployBtn: 'Hangarda Konuşlandır',
            quickLaunchBtn: 'Hızlı Göreve Çık',
            treeBtn: 'Evrim Ağacı',
            statHp: 'Gövde (HP)',
            statSh: 'Kalkan (SH)',
            statSpeed: 'Hız',
            statArmor: 'Zırh',
            statCrit: 'Kritik',
            statOverdrive: 'Overdrive / Diriliş',
            equipped: 'KUŞANILDI',
            unlocked: 'AÇIK',
            equip: 'Kuşan',
            unlock: (cost) => `Kilidi Aç (${cost} CRD)`,
            previewBtn: 'Önizle',
            previewing: 'Önizleniyor',
            skinUnlockedToast: (name) => `${name} açıldı ve tüm filoya kuşandırıldı!`,
            skinEquippedToast: (name) => `${name} kaplaması aktif edildi.`,
            insufficientCredits: 'Yetersiz araştırma kredisi!',
            achUnlockedToast: (name) => `Başarım Açıldı: ${name}!`,
            rdSub: 'Tüm filoya kalıcı güçlendirme uygular. İstediğiniz an %100 kredi iadesiyle sıfırlayabilirsiniz.',
            rdBonusesLabel: 'Aktif Ar-Ge Bonusu:',
            dmgLabel: 'Hasar',
            hullLabel: 'Gövde/Kalkan',
            spdLabel: 'Hız',
            critLabel: 'Kritik',
            cdrLabel: 'CDR',
            magnetLabel: 'Çekim',
            rerollLabel: 'Reroll',
            greedLabel: 'XP/CRD',
            overdriveLabel: 'Overdrive',
            revivalLabel: 'Yeniden Doğuş',
            maxLevel: 'MAKSİMUM',
            upgradeBtn: (cost) => `Yükselt (${cost} CRD)`,
            upgradeToast: (name, lvl) => `${name} Lv.${lvl} kalibre edildi.`,
            refundToast: (amt) => `${amt} CRD tam iade ile cüzdana aktarıldı.`,
            chartTitle: 'Filo Ar-Ge Etki Grafiği',
            chartSub: 'HP, DPS, Hız, Kritik, CDR, Çekim ve Overdrive artışı',
            chartAxes: ['Gövde HP', 'Silah DPS', 'İtici Hız', 'Kritik', 'CDR Hızı', 'Çekim', 'Overdrive'],
            chartDatasetBonus: 'Ar-Ge Kazancı (%)',
            chartDatasetBase: 'Temel Gemi (100%)',
            chartDatasetBoosted: 'Kalibre Filo (%)',
            historyTitle: 'Son Pilot Savaş Geçmişi',
            historySub: 'Bu cihazda kaydedilen son seferlerin detaylı telemetri kartları.',
            historyAllLogs: 'Tüm Uçuş Kayıtları',
            historyEmptyTitle: 'Henüz kayıtlı savaş telemetrisi bulunmuyor',
            historyEmptyDesc: 'İlk görevinizi tamamladığınızda skor, dalga, evrim ve kredi verileriniz burada görünecektir.',
            historyStartBtn: 'Hangara Git ve Başlat',
            victory: 'ZAFER',
            sortieEnd: 'SONA ERDİ',
            scoreLbl: 'Skor',
            waveLbl: 'Dalga',
            killsLbl: 'İmha',
            timeLbl: 'Süre',
            bossLbl: 'Boss',
            evoMegaLbl: 'Evrim/Mega',
            earnedLbl: 'Kazanç'
        },
        en: {
            pageTitle: 'COSMIC SURVIVORS v10.0 — Fleet Armory & R&D Bay',
            nav: { hangar: 'Hangar', tree: 'Evolution Tree', armory: 'Armory', modes: 'Modes', wiki: 'Encyclopedia', about: 'About' },
            audioOn: 'Audio On',
            audioOff: 'Muted',
            heroBadge: 'V10.0 FLEET ARMORY',
            hangarDeployBtn: 'Configure in Hangar',
            quickLaunchBtn: 'Quick Deploy',
            treeBtn: 'Evolution Tree',
            statHp: 'Hull (HP)',
            statSh: 'Shield (SH)',
            statSpeed: 'Speed',
            statArmor: 'Armor',
            statCrit: 'Crit',
            statOverdrive: 'Overdrive / Revive',
            equipped: 'EQUIPPED',
            unlocked: 'UNLOCKED',
            equip: 'Equip Livery',
            unlock: (cost) => `Unlock (${cost} CRD)`,
            previewBtn: 'Preview',
            previewing: 'Previewing',
            skinUnlockedToast: (name) => `Unlocked and equipped ${name} across the fleet!`,
            skinEquippedToast: (name) => `${name} livery equipped.`,
            insufficientCredits: 'Insufficient research credits!',
            achUnlockedToast: (name) => `Achievement Unlocked: ${name}!`,
            rdSub: 'Applies permanent upgrades across all 8 starships. Refund 100% of spent credits anytime.',
            rdBonusesLabel: 'Active R&D Multipliers:',
            dmgLabel: 'Damage',
            hullLabel: 'Hull/Shield',
            spdLabel: 'Speed',
            critLabel: 'Crit',
            cdrLabel: 'CDR',
            magnetLabel: 'Magnet',
            rerollLabel: 'Rerolls',
            greedLabel: 'XP/CRD',
            overdriveLabel: 'Overdrive',
            revivalLabel: 'Revivals',
            maxLevel: 'MAXED',
            upgradeBtn: (cost) => `Upgrade (${cost} CRD)`,
            upgradeToast: (name, lvl) => `Calibrated ${name} to Lv.${lvl}.`,
            refundToast: (amt) => `Refunded ${amt} CRD back to wallet.`,
            chartTitle: 'Fleet R&D Impact Graph',
            chartSub: 'Permanent scaling across HP, DPS, Speed, Crit, CDR, Magnet & Overdrive',
            chartAxes: ['Fleet HP', 'Weapon DPS', 'Speed', 'Crit', 'CDR Haste', 'Magnet', 'Overdrive'],
            chartDatasetBonus: 'R&D Bonus Gain (%)',
            chartDatasetBase: 'Base Hull (100%)',
            chartDatasetBoosted: 'Calibrated Fleet (%)',
            historyTitle: 'Recent Pilot Combat History',
            historySub: 'Detailed local telemetry cards for your latest sorties on this device.',
            historyAllLogs: 'All Flight Logs',
            historyEmptyTitle: 'No recorded combat sorties yet',
            historyEmptyDesc: 'Complete your first sortie to inspect score, waves, evolutions, and credit earnings here.',
            historyStartBtn: 'Open Hangar & Deploy',
            victory: 'VICTORY',
            sortieEnd: 'COMPLETE',
            scoreLbl: 'Score',
            waveLbl: 'Wave',
            killsLbl: 'Kills',
            timeLbl: 'Time',
            bossLbl: 'Bosses',
            evoMegaLbl: 'Evo/Mega',
            earnedLbl: 'Earned'
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

    function formatNum(n) {
        return Number(n || 0).toLocaleString(getLang() === 'en' ? 'en-US' : 'tr-TR');
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
                particleCount: 65,
                spread: 72,
                origin: { y: 0.7 },
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

    function formatDurationSec(secOrStr) {
        if (typeof secOrStr === 'string' && secOrStr.includes(':')) return secOrStr;
        const sec = Math.max(0, Math.floor(Number(secOrStr) || 0));
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // -------------------------------------------------------------------------
    // Init Query Params & Topbar Sync
    // -------------------------------------------------------------------------
    function loadInitialSelection() {
        const profile = PERSIST.load();
        state.previewSkinId = profile.selectedSkin || 'standard';

        try {
            const qs = new URLSearchParams(global.location.search || '');
            const qShip = qs.get('ship') || sessionStorage.getItem('cosmic_ship') || localStorage.getItem('cosmic_ship_pref');
            const qSkin = qs.get('skin');
            if (qShip && DATA.SHIPS[qShip]) state.selectedShipId = qShip;
            if (qSkin && DATA.SHIP_SKINS[qSkin]) state.previewSkinId = qSkin;
        } catch (err) {
            // Ignore storage errors
        }
    }

    function syncTopbarAndCredits() {
        const profile = PERSIST.load();
        const copy = tCopy();
        const lang = getLang();

        document.title = copy.pageTitle;
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-topbar-label]').forEach(el => {
            const k = el.getAttribute('data-topbar-label');
            if (k && copy.nav[k]) el.textContent = copy.nav[k];
        });

        const creditsEl = document.getElementById('creditsDisplay');
        if (creditsEl) creditsEl.textContent = formatNum(profile.credits);

        const walletBadge = document.getElementById('armoryWalletBadge');
        if (walletBadge) walletBadge.textContent = `${formatNum(profile.credits)} CRD`;

        const heroBadge = document.getElementById('armoryHeroBadge');
        if (heroBadge) heroBadge.textContent = copy.heroBadge;

        const langBtn = document.getElementById('langToggleBtn');
        if (langBtn) {
            langBtn.setAttribute('data-lang', lang);
            langBtn.querySelectorAll('.lang-seg').forEach(seg => {
                seg.classList.toggle('active', seg.getAttribute('data-lang') === lang);
            });
        }

        const hangarBtnText = document.getElementById('armoryHangarBtnText');
        if (hangarBtnText) hangarBtnText.textContent = copy.hangarDeployBtn;
        const launchBtnText = document.getElementById('armoryLaunchBtnText');
        if (launchBtnText) launchBtnText.textContent = copy.quickLaunchBtn;

        syncDeployLinks();
        syncAudioUI();
    }

    function syncDeployLinks() {
        const profile = PERSIST.load();
        const activeSkin = profile.selectedSkin || 'standard';
        const hangarBtn = document.getElementById('armoryHangarBtn');
        const launchBtn = document.getElementById('armoryLaunchBtn');
        const treeBtn = document.getElementById('previewTreeLink');
        const navTree = document.getElementById('navTreeLink');

        if (hangarBtn) {
            hangarBtn.href = `index.html?ship=${encodeURIComponent(state.selectedShipId)}&skin=${encodeURIComponent(activeSkin)}`;
        }
        if (launchBtn) {
            let map = 'sector9';
            let diff = 'normal';
            let mode = 'survival';
            try {
                map = sessionStorage.getItem('cosmic_map') || localStorage.getItem('cosmic_map_pref') || map;
                diff = sessionStorage.getItem('cosmic_diff') || localStorage.getItem('cosmic_diff_pref') || diff;
                mode = sessionStorage.getItem('cosmic_mode') || localStorage.getItem('cosmic_mode_pref') || mode;
            } catch (err) { /* ignore */ }
            launchBtn.href = `game.html?ship=${encodeURIComponent(state.selectedShipId)}&map=${encodeURIComponent(map)}&diff=${encodeURIComponent(diff)}&mode=${encodeURIComponent(mode)}&skin=${encodeURIComponent(activeSkin)}`;
        }
        if (treeBtn) treeBtn.href = `tree.html?ship=${encodeURIComponent(state.selectedShipId)}`;
        if (navTree) navTree.href = `tree.html?ship=${encodeURIComponent(state.selectedShipId)}`;
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
            const cur = Boolean(global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            global.CosmicAudio.setMuted(!cur);
            syncAudioUI();
            refreshIcons();
            if (cur) global.CosmicAudio.play('uiClick');
        });
    }

    // -------------------------------------------------------------------------
    // Section 1: 8-Ship Tabs, Live Canvas Turntable & 4 Unlockable Liveries
    // -------------------------------------------------------------------------
    function renderShipTabs() {
        const container = document.getElementById('armoryShipTabs');
        if (!container) return;

        container.innerHTML = Object.values(DATA.SHIPS).map(ship => {
            const selected = ship.id === state.selectedShipId;
            const name = loc(ship, 'name');
            return `
                <button type="button" class="armory-ship-tab ${selected ? 'selected' : ''}" data-ship-id="${ship.id}" role="tab" aria-selected="${selected ? 'true' : 'false'}">
                    <img src="${ship.asset}" alt="${name}">
                    <div class="armory-ship-tab-meta">
                        <div class="armory-ship-tab-name">${name}</div>
                        <div class="armory-ship-tab-tag" style="color:${ship.color};">${loc(ship, 'tag')}</div>
                    </div>
                </button>
            `;
        }).join('');

        container.querySelectorAll('.armory-ship-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                state.selectedShipId = btn.dataset.shipId;
                try {
                    sessionStorage.setItem('cosmic_ship', state.selectedShipId);
                    localStorage.setItem('cosmic_ship_pref', state.selectedShipId);
                } catch (err) { /* ignore */ }
                playUiSound('uiClick');
                renderShipTabs();
                renderPreviewDetails();
                syncDeployLinks();
            });
        });
    }

    function renderPreviewDetails() {
        const ship = DATA.SHIPS[state.selectedShipId] || DATA.SHIPS.interceptor;
        const skin = DATA.SHIP_SKINS[state.previewSkinId] || DATA.SHIP_SKINS.standard;
        const bonuses = PERSIST.getBonuses();
        const copy = tCopy();

        const setEl = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setEl('previewShipName', `${loc(ship, 'name')} (${ship.codeName})`);
        setEl('previewShipRole', loc(ship, 'role'));
        setEl('previewShipTag', loc(ship, 'tag'));
        setEl('previewTreeBtnText', copy.treeBtn);

        const skinTag = document.getElementById('previewSkinTag');
        if (skinTag) {
            skinTag.textContent = loc(skin, 'name');
            skinTag.style.color = skin.accent;
            skinTag.style.borderColor = skin.accent + '55';
        }

        const effHp = Math.round(ship.hp * bonuses.hpMult);
        const effSh = Math.round(ship.sh * bonuses.hpMult);
        const effSpd = Math.round(ship.sp * bonuses.spdMult);
        const effCrit = Math.round((ship.crit + bonuses.critAdd) * 100);
        const hpDelta = effHp - ship.hp;
        const shDelta = effSh - ship.sh;
        const spdDelta = effSpd - ship.sp;
        const critDelta = Math.round(bonuses.critAdd * 100);

        const statsGrid = document.getElementById('previewStatsGrid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="preview-stat-box">
                    <div class="preview-stat-label">${copy.statHp}</div>
                    <div class="preview-stat-val">${effHp}${hpDelta > 0 ? `<span class="preview-stat-delta">+${hpDelta}</span>` : ''}</div>
                </div>
                <div class="preview-stat-box">
                    <div class="preview-stat-label">${copy.statSh}</div>
                    <div class="preview-stat-val">${effSh}${shDelta > 0 ? `<span class="preview-stat-delta">+${shDelta}</span>` : ''}</div>
                </div>
                <div class="preview-stat-box">
                    <div class="preview-stat-label">${copy.statSpeed}</div>
                    <div class="preview-stat-val">${effSpd}${spdDelta > 0 ? `<span class="preview-stat-delta">+${spdDelta}</span>` : ''}</div>
                </div>
                <div class="preview-stat-box">
                    <div class="preview-stat-label">${copy.statArmor}</div>
                    <div class="preview-stat-val">%${Math.round(ship.armor * 100)}</div>
                </div>
                <div class="preview-stat-box">
                    <div class="preview-stat-label">${copy.statCrit}</div>
                    <div class="preview-stat-val">%${effCrit}${critDelta > 0 ? `<span class="preview-stat-delta">+${critDelta}%</span>` : ''}</div>
                </div>
                <div class="preview-stat-box">
                    <div class="preview-stat-label">${copy.statOverdrive}</div>
                    <div class="preview-stat-val">${(bonuses.overdriveMult || 1).toFixed(2)}x / +${bonuses.revivals || 0}</div>
                </div>
            `;
        }
    }

    function renderSkinCards() {
        const grid = document.getElementById('armorySkinsGrid');
        const collectionBadge = document.getElementById('skinCollectionBadge');
        if (!grid) return;

        const profile = PERSIST.load();
        const copy = tCopy();
        const skins = Object.values(DATA.SHIP_SKINS);
        let unlockedCount = 0;

        grid.innerHTML = skins.map(skin => {
            const unlocked = !skin.cost || skin.cost <= 0 || Boolean(profile.unlockedSkins && profile.unlockedSkins[skin.id]);
            if (unlocked) unlockedCount++;
            const equipped = profile.selectedSkin === skin.id;
            const previewing = state.previewSkinId === skin.id;
            const canAfford = profile.credits >= (skin.cost || 0);
            const name = loc(skin, 'name');

            let badgeClass = 'cs-badge-slate';
            let badgeText = `${skin.cost} CRD`;
            if (equipped) {
                badgeClass = 'cs-badge-sky';
                badgeText = copy.equipped;
            } else if (unlocked) {
                badgeClass = 'cs-badge-mint';
                badgeText = copy.unlocked;
            }

            const primaryBtn = equipped
                ? `<button type="button" class="cs-btn cs-btn-mint" disabled>
                        <i data-lucide="check"></i>
                        <span>${copy.equipped}</span>
                   </button>`
                : unlocked
                    ? `<button type="button" class="cs-btn cs-btn-primary skin-equip-btn" data-skin-id="${skin.id}">
                            <i data-lucide="sparkles"></i>
                            <span>${copy.equip}</span>
                       </button>`
                    : `<button type="button" class="cs-btn ${canAfford ? 'cs-btn-primary' : ''} skin-buy-btn" data-skin-id="${skin.id}" ${!canAfford ? 'disabled' : ''}>
                            <i data-lucide="lock"></i>
                            <span>${copy.unlock(formatNum(skin.cost))}</span>
                       </button>`;

            return `
                <article class="skin-livery-card ${equipped ? 'is-equipped' : ''} ${previewing ? 'is-previewing' : ''}">
                    <div class="skin-card-head">
                        <div class="skin-swatch-emblem" style="background:radial-gradient(circle at 35% 35%, ${skin.hex}, ${skin.accent});">
                            <i data-lucide="palette" style="color:#070b12;"></i>
                        </div>
                        <div class="skin-card-meta">
                            <div class="skin-card-title">${name}</div>
                            <span class="cs-badge cs-badge-sm font-mono ${badgeClass}" style="margin-top:0.2rem;">${badgeText}</span>
                        </div>
                    </div>
                    <p class="skin-card-desc">${loc(skin, 'desc')}</p>
                    <div class="skin-card-actions">
                        <button type="button" class="cs-btn cs-btn-ghost skin-preview-btn" data-skin-id="${skin.id}">
                            <i data-lucide="eye"></i>
                            <span>${previewing ? copy.previewing : copy.previewBtn}</span>
                        </button>
                        ${primaryBtn}
                    </div>
                </article>
            `;
        }).join('');

        if (collectionBadge) {
            collectionBadge.textContent = `${unlockedCount} / ${skins.length}`;
        }

        grid.querySelectorAll('.skin-preview-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.previewSkinId = btn.dataset.skinId;
                playUiSound('uiClick');
                renderSkinCards();
                renderPreviewDetails();
            });
        });

        grid.querySelectorAll('.skin-equip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const skinId = btn.dataset.skinId;
                const res = PERSIST.selectSkin(skinId);
                if (res.ok) {
                    state.previewSkinId = skinId;
                    try { sessionStorage.setItem('cosmic_skin', skinId); } catch (err) { /* ignore */ }
                    playUiSound('uiConfirm');
                    syncDeployLinks();
                    renderSkinCards();
                    renderPreviewDetails();
                    showToast(copy.skinEquippedToast(loc(DATA.SHIP_SKINS[skinId], 'name')));
                }
            });
        });

        grid.querySelectorAll('.skin-buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const skinId = btn.dataset.skinId;
                const skin = DATA.SHIP_SKINS[skinId];
                const res = PERSIST.buySkin(skinId);
                if (res.ok) {
                    state.previewSkinId = skinId;
                    try { sessionStorage.setItem('cosmic_skin', skinId); } catch (err) { /* ignore */ }
                    playUiSound('uiConfirm');
                    syncTopbarAndCredits();
                    renderSkinCards();
                    renderPreviewDetails();
                    triggerCelebration(skin ? skin.accent : '#38bdf8');
                    showToast(copy.skinUnlockedToast(loc(skin, 'name')));
                    if (res.newlyUnlocked && res.newlyUnlocked.length) {
                        res.newlyUnlocked.forEach(a => showToast(copy.achUnlockedToast(loc(a, 'name'))));
                    }
                } else {
                    playUiSound('uiBack');
                    showToast(copy.insufficientCredits);
                }
            });
        });

        refreshIcons();
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
        const canvas = document.getElementById('armoryTurntableCanvas');
        if (!canvas || !global.CosmicModels) return;

        const renderFrame = (nowMs) => {
            const t = nowMs * 0.001;
            const ship = DATA.SHIPS[state.selectedShipId] || DATA.SHIPS.interceptor;
            const skin = (DATA.SHIP_SKINS && DATA.SHIP_SKINS[state.previewSkinId]) || DATA.SHIP_SKINS.standard;
            const stageColor = skin && skin.id !== 'standard' ? skin.accent : ship.color;

            global.CosmicModels.renderTurntable(canvas, state.selectedShipId, t, { color: stageColor });

            const tinted = getTintedShipSprite(state.selectedShipId, skin);
            if (tinted) {
                const ctx = canvas.getContext('2d');
                const dpr = Math.min(global.devicePixelRatio || 1, 2);
                const w = canvas.clientWidth || canvas.width || 560;
                const h = canvas.clientHeight || canvas.height || 235;
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

            state.turntableHandle = requestAnimationFrame(renderFrame);
        };

        if (state.turntableHandle) cancelAnimationFrame(state.turntableHandle);
        state.turntableHandle = requestAnimationFrame(renderFrame);
    }

    // -------------------------------------------------------------------------
    // Section 2: 10 Permanent R&D Modules + Chart.js Horizontal Bar / Radar Graph
    // -------------------------------------------------------------------------
    function renderRdUpgrades() {
        const profile = PERSIST.load();
        const bonuses = PERSIST.getBonuses();
        const copy = tCopy();

        const subEl = document.getElementById('rdSectionSub');
        if (subEl) subEl.textContent = copy.rdSub;
        const lblEl = document.getElementById('rdBonusesLabel');
        if (lblEl) lblEl.textContent = copy.rdBonusesLabel;

        const pillsEl = document.getElementById('armoryBonusPills');
        if (pillsEl) {
            pillsEl.innerHTML = `
                <span class="cs-badge cs-badge-coral font-mono">${copy.dmgLabel} ${bonuses.dmgMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-amber font-mono">${copy.hullLabel} ${bonuses.hpMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-sky font-mono">${copy.spdLabel} ${bonuses.spdMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-violet font-mono">${copy.critLabel} +%${Math.round(bonuses.critAdd * 100)}</span>
                <span class="cs-badge cs-badge-mint font-mono">${copy.cdrLabel} -%${Math.round(bonuses.cdrAdd * 100)}</span>
                <span class="cs-badge cs-badge-mint font-mono">${copy.magnetLabel} ${bonuses.magnetMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-sky font-mono">${copy.rerollLabel} +${bonuses.extraRerolls}</span>
                <span class="cs-badge cs-badge-amber font-mono">${copy.greedLabel} ${bonuses.greedMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-violet font-mono">${copy.overdriveLabel} ${(bonuses.overdriveMult || 1).toFixed(2)}x</span>
                <span class="cs-badge cs-badge-coral font-mono">${copy.revivalLabel} +${bonuses.revivals || 0}</span>
            `;
        }

        const grid = document.getElementById('armoryUpgradesGrid');
        if (!grid) return;

        grid.innerHTML = DATA.WORKSHOP_UPGRADES.map(upg => {
            const lvl = profile.upgrades[upg.id] || 0;
            const maxed = lvl >= upg.maxLevel;
            const pct = Math.round((lvl / upg.maxLevel) * 100);
            const cost = maxed ? 0 : PERSIST.getUpgradeCost(upg.id, lvl);
            const canAfford = !maxed && profile.credits >= cost;
            const name = loc(upg, 'name');

            const pips = Array.from({ length: upg.maxLevel }, (_, i) =>
                `<span class="rd-pip ${i < lvl ? 'filled' : ''}" style="${i < lvl ? `background:${upg.color};` : ''}"></span>`
            ).join('');

            return `
                <article class="rd-upgrade-card ${maxed ? 'is-maxed' : ''}">
                    <div class="rd-card-top">
                        <div class="rd-icon-box" style="color:${upg.color};">
                            <i data-lucide="${upg.icon}"></i>
                        </div>
                        <div style="min-width:0;flex:1;">
                            <div style="font-family:var(--font-display);font-weight:600;font-size:14.5px;color:var(--text-primary);">${name}</div>
                            <div style="font-size:12px;color:var(--text-secondary);">${loc(upg, 'perLevelLabel')}</div>
                        </div>
                        <span class="cs-badge font-mono">Lv.${lvl}/${upg.maxLevel}</span>
                    </div>

                    <div class="rd-progress-row">
                        <div class="rd-progress-track">
                            <div class="rd-progress-fill" style="width:${pct}%;background:${upg.color};"></div>
                        </div>
                        <div class="rd-pips-row">${pips}</div>
                    </div>

                    <button type="button" class="cs-btn ${maxed ? 'cs-btn-mint' : (canAfford ? 'cs-btn-primary' : '')} rd-buy-btn"
                        data-upg-id="${upg.id}" ${maxed || !canAfford ? 'disabled' : ''}>
                        <i data-lucide="${maxed ? 'check' : 'arrow-up-circle'}"></i>
                        <span>${maxed ? copy.maxLevel : copy.upgradeBtn(formatNum(cost))}</span>
                    </button>
                </article>
            `;
        }).join('');

        grid.querySelectorAll('.rd-buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const upgId = btn.dataset.upgId;
                const upg = DATA.WORKSHOP_UPGRADES.find(u => u.id === upgId);
                const res = PERSIST.buyUpgrade(upgId);
                if (res.ok) {
                    playUiSound('uiConfirm');
                    syncTopbarAndCredits();
                    renderPreviewDetails();
                    renderRdUpgrades();
                    renderImpactChart();
                    showToast(copy.upgradeToast(loc(upg, 'name'), res.level));
                    if (upg && res.level >= upg.maxLevel) {
                        triggerCelebration(upg.color);
                    }
                } else {
                    playUiSound('uiBack');
                    showToast(copy.insufficientCredits);
                }
            });
        });

        refreshIcons();
    }

    function renderImpactChart() {
        const canvas = document.getElementById('armoryImpactCanvas');
        if (!canvas || typeof global.Chart === 'undefined') return;

        const bonuses = PERSIST.getBonuses();
        const copy = tCopy();

        const titleEl = document.getElementById('chartPanelTitle');
        const subEl = document.getElementById('chartPanelSub');
        if (titleEl) titleEl.textContent = copy.chartTitle;
        if (subEl) subEl.textContent = copy.chartSub;

        const gainPct = [
            Math.round((bonuses.hpMult - 1) * 100),
            Math.round((bonuses.dmgMult - 1) * 100),
            Math.round((bonuses.spdMult - 1) * 100),
            Math.round(bonuses.critAdd * 100),
            Math.round(bonuses.cdrAdd * 100),
            Math.round((bonuses.magnetMult - 1) * 100),
            Math.round(((bonuses.overdriveMult || 1) - 1) * 100)
        ];

        const summaryBox = document.getElementById('rdImpactSummaryBox');
        if (summaryBox) {
            summaryBox.innerHTML = copy.chartAxes.map((axis, idx) => `
                <div class="rd-impact-item">
                    <span>${axis}</span>
                    <strong style="color:${gainPct[idx] > 0 ? 'var(--accent-mint)' : 'var(--text-secondary)'};">+${gainPct[idx]}%</strong>
                </div>
            `).join('');
        }

        if (state.impactChart) {
            state.impactChart.destroy();
            state.impactChart = null;
        }

        if (state.chartType === 'radar') {
            const baseVals = [100, 100, 100, 100, 100, 100, 100];
            const boostedVals = gainPct.map(v => 100 + v);
            state.impactChart = new global.Chart(canvas.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: copy.chartAxes,
                    datasets: [
                        {
                            label: copy.chartDatasetBase,
                            data: baseVals,
                            borderColor: 'rgba(148, 163, 184, 0.45)',
                            backgroundColor: 'rgba(148, 163, 184, 0.08)',
                            borderWidth: 1.5,
                            pointRadius: 2
                        },
                        {
                            label: copy.chartDatasetBoosted,
                            data: boostedVals,
                            borderColor: '#38bdf8',
                            backgroundColor: 'rgba(56, 189, 248, 0.24)',
                            borderWidth: 2,
                            pointBackgroundColor: '#38bdf8',
                            pointRadius: 3.5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#94a3b8', font: { size: 11 } }
                        }
                    },
                    scales: {
                        r: {
                            min: 0,
                            suggestedMax: 190,
                            ticks: { display: false, stepSize: 30 },
                            grid: { color: 'rgba(148, 163, 184, 0.14)' },
                            angleLines: { color: 'rgba(148, 163, 184, 0.16)' },
                            pointLabels: { color: '#94a3b8', font: { size: 11, weight: '600' } }
                        }
                    }
                }
            });
            return;
        }

        // Default: Horizontal Bar Chart
        state.impactChart = new global.Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: copy.chartAxes,
                datasets: [{
                    label: copy.chartDatasetBonus,
                    data: gainPct,
                    backgroundColor: [
                        'rgba(245, 158, 11, 0.72)',
                        'rgba(251, 113, 133, 0.72)',
                        'rgba(56, 189, 248, 0.72)',
                        'rgba(167, 139, 250, 0.72)',
                        'rgba(45, 212, 191, 0.72)',
                        'rgba(52, 211, 153, 0.72)',
                        'rgba(192, 132, 252, 0.72)'
                    ],
                    borderColor: ['#f59e0b', '#fb7185', '#38bdf8', '#a78bfa', '#2dd4bf', '#34d399', '#c084fc'],
                    borderWidth: 1,
                    borderRadius: 6
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
                        borderColor: 'rgba(148, 163, 184, 0.2)',
                        borderWidth: 1,
                        callbacks: {
                            label: ctx => ` +${ctx.parsed.x}%`
                        }
                    }
                },
                scales: {
                    x: {
                        min: 0,
                        suggestedMax: 90,
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8', callback: v => `+${v}%` }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#e2e8f0', font: { size: 11.5, weight: '600' } }
                    }
                }
            }
        });
    }

    function setupRdControls() {
        const resetBtn = document.getElementById('armoryResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const res = PERSIST.resetUpgrades();
                playUiSound('uiBack');
                syncTopbarAndCredits();
                renderPreviewDetails();
                renderRdUpgrades();
                renderImpactChart();
                showToast(tCopy().refundToast(formatNum(res.refunded)));
            });
        }

        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.chartType = btn.dataset.chartType || 'bar';
                document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.toggle('active', b === btn));
                playUiSound('uiClick');
                renderImpactChart();
            });
        });
    }

    // -------------------------------------------------------------------------
    // Section 3: Recent Pilot Combat History
    // -------------------------------------------------------------------------
    function renderCombatHistory() {
        const copy = tCopy();
        const titleEl = document.getElementById('historySectionTitle');
        const subEl = document.getElementById('historySectionSub');
        const allBtnEl = document.getElementById('historyAllLogsLabel');
        if (titleEl) titleEl.textContent = copy.historyTitle;
        if (subEl) subEl.textContent = copy.historySub;
        if (allBtnEl) allBtnEl.textContent = copy.historyAllLogs;

        const grid = document.getElementById('armoryHistoryGrid');
        if (!grid) return;

        const profile = PERSIST.load();
        let runs = Array.isArray(profile.runHistory) && profile.runHistory.length > 0
            ? profile.runHistory.slice(0, 12)
            : [];

        if (!runs.length && global.CosmicLeaderboard && typeof global.CosmicLeaderboard.getLocalScores === 'function') {
            runs = global.CosmicLeaderboard.getLocalScores().slice(0, 12).map(r => ({
                shipId: r.shipId,
                mapId: r.mapId,
                gameMode: r.gameMode,
                difficulty: r.difficulty,
                score: r.score,
                wave: r.wave,
                kills: r.kills || 0,
                duration: r.time,
                date: r.date,
                bosses: 0,
                evos: 0,
                megas: 0,
                earnedCredits: null,
                victory: false
            }));
        }

        if (!runs.length) {
            grid.innerHTML = `
                <article class="history-empty-card">
                    <i data-lucide="compass" style="width:28px;height:28px;color:var(--accent-sky);"></i>
                    <div style="font-family:var(--font-display);font-size:16px;font-weight:600;">${copy.historyEmptyTitle}</div>
                    <p style="font-size:13px;max-width:460px;margin:0;">${copy.historyEmptyDesc}</p>
                    <a href="index.html" class="cs-btn cs-btn-primary">
                        <i data-lucide="play"></i>
                        <span>${copy.historyStartBtn}</span>
                    </a>
                </article>
            `;
            refreshIcons();
            return;
        }

        const dateLocale = getLang() === 'en' ? 'en-US' : 'tr-TR';

        grid.innerHTML = runs.map(run => {
            const ship = DATA.SHIPS[run.shipId] || DATA.SHIPS.interceptor;
            const map = DATA.MAPS[run.mapId] || DATA.MAPS.sector9;
            const mode = (DATA.GAME_MODES && DATA.GAME_MODES[run.gameMode]) || DATA.GAME_MODES.survival;
            const diff = DATA.DIFFICULTIES[run.difficulty || run.diff] || DATA.DIFFICULTIES.normal;
            const skin = (run.skinId && DATA.SHIP_SKINS[run.skinId]) || null;

            const dateStr = run.date
                ? new Date(run.date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '';

            return `
                <article class="history-run-card ${run.victory ? 'is-victory' : ''}">
                    <div class="history-run-head">
                        <img src="${ship.asset}" alt="${loc(ship, 'name')}" class="history-ship-thumb">
                        <div style="flex:1;min-width:0;">
                            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.4rem;">
                                <strong style="font-family:var(--font-display);font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                    ${loc(ship, 'name')}
                                </strong>
                                <span class="cs-badge cs-badge-sm font-mono ${run.victory ? 'cs-badge-mint' : 'cs-badge-slate'}">
                                    ${run.victory ? copy.victory : copy.sortieEnd}
                                </span>
                            </div>
                            <div style="font-size:11.5px;color:var(--text-secondary);display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;margin-top:0.15rem;">
                                <span style="color:${mode.color};font-weight:600;">${loc(mode, 'name')}</span>
                                <span>·</span>
                                <span class="font-mono">${map.code}</span>
                                <span>·</span>
                                <span style="color:${diff.color};">${loc(diff, 'shortLabel')}</span>
                                ${skin && skin.id !== 'standard' ? `<span>·</span><span style="color:${skin.accent};">${loc(skin, 'name')}</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="history-metrics-grid">
                        <div class="history-metric-box">
                            <div class="history-metric-label">${copy.scoreLbl}</div>
                            <div class="history-metric-val" style="color:var(--accent-sky);">${formatNum(run.score || 0)}</div>
                        </div>
                        <div class="history-metric-box">
                            <div class="history-metric-label">${copy.waveLbl}</div>
                            <div class="history-metric-val">${run.wave || 1}</div>
                        </div>
                        <div class="history-metric-box">
                            <div class="history-metric-label">${copy.killsLbl}</div>
                            <div class="history-metric-val">${formatNum(run.kills || 0)}</div>
                        </div>
                        <div class="history-metric-box">
                            <div class="history-metric-label">${copy.timeLbl}</div>
                            <div class="history-metric-val">${formatDurationSec(run.duration)}</div>
                        </div>
                    </div>

                    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;font-size:11.5px;color:var(--text-secondary);border-top:1px solid rgba(148,163,184,0.1);padding-top:0.45rem;">
                        <span class="font-mono">
                            ${copy.bossLbl}: ${run.bosses || 0} · ${copy.evoMegaLbl}: ${run.evos || 0}/${run.megas || 0}
                        </span>
                        <span class="font-mono" style="color:var(--accent-amber);">
                            ${run.earnedCredits !== null && run.earnedCredits !== undefined ? `+${formatNum(run.earnedCredits)} CRD` : dateStr}
                        </span>
                    </div>
                </article>
            `;
        }).join('');

        refreshIcons();
    }

    // -------------------------------------------------------------------------
    // Render All + Language Switch Sync
    // -------------------------------------------------------------------------
    function renderAll() {
        if (global.CosmicI18n && typeof global.CosmicI18n.applyTranslations === 'function') {
            global.CosmicI18n.applyTranslations();
        }
        syncTopbarAndCredits();
        renderShipTabs();
        renderPreviewDetails();
        renderSkinCards();
        renderRdUpgrades();
        renderImpactChart();
        renderCombatHistory();
        refreshIcons();
    }

    function animateEntrance() {
        if (!global.gsap) return;
        const targets = document.querySelectorAll('.armory-hero, .preview-stage-card, .skin-livery-card, .rd-upgrade-card, .rd-chart-panel');
        if (!targets.length) return;
        global.gsap.fromTo(
            targets,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.28, stagger: 0.025, ease: 'power2.out', clearProps: 'transform,opacity' }
        );
    }

    function init() {
        loadInitialSelection();
        setupAudioControl();
        setupRdControls();
        renderAll();
        startTurntableLoop();
        animateEntrance();

        global.addEventListener('cosmic:langchange', () => {
            renderAll();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
