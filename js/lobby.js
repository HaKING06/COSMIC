// =============================================================================
// COSMIC SURVIVORS v9.0 — HANGAR & COCKPIT CONTROLLER (js/lobby.js)
// Coordinates 8-Ship Deck, Live PNG Turntable, Chart.js Telemetry Radar,
// Workshop Calibration, Sector Atlas, Leaderboard & GSAP Transitions.
// =============================================================================
(function (global) {
    'use strict';

    const DATA = global.COSMIC_DATA;
    const PERSIST = global.CosmicPersistence;

    const state = {
        selectedShipId: 'interceptor',
        selectedMapId: 'sector9',
        selectedDiff: 'normal',
        activeView: 'view-cockpit',
        radarChart: null,
        turntableHandle: null
    };

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

    let toastTimer = null;
    function showToast(msg) {
        const toast = document.getElementById('csToast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
    }

    function loadSavedDeployment() {
        try {
            const sShip = sessionStorage.getItem('cosmic_ship') || localStorage.getItem('cosmic_ship_pref');
            const sMap = sessionStorage.getItem('cosmic_map') || localStorage.getItem('cosmic_map_pref');
            const sDiff = sessionStorage.getItem('cosmic_diff') || localStorage.getItem('cosmic_diff_pref');
            const callsign = sessionStorage.getItem('cosmic_p1') || localStorage.getItem('cosmic_pilot_name') || 'PİLOT-01';

            if (sShip && DATA.SHIPS[sShip]) state.selectedShipId = sShip;
            if (sMap && DATA.MAPS[sMap]) state.selectedMapId = sMap;
            if (sDiff && DATA.DIFFICULTIES[sDiff]) state.selectedDiff = sDiff;

            const input = document.getElementById('pilotCallsignInput');
            if (input) input.value = callsign;
        } catch (err) {
            // Safe storage fallback
        }
    }

    function saveDeploymentPrefs() {
        try {
            const input = document.getElementById('pilotCallsignInput');
            const callsign = (input && input.value.trim()) ? input.value.trim() : 'PİLOT-01';
            sessionStorage.setItem('cosmic_ship', state.selectedShipId);
            sessionStorage.setItem('cosmic_p1_ship', state.selectedShipId);
            sessionStorage.setItem('cosmic_map', state.selectedMapId);
            sessionStorage.setItem('cosmic_diff', state.selectedDiff);
            sessionStorage.setItem('cosmic_p1', callsign);
            localStorage.setItem('cosmic_ship_pref', state.selectedShipId);
            localStorage.setItem('cosmic_map_pref', state.selectedMapId);
            localStorage.setItem('cosmic_diff_pref', state.selectedDiff);
            localStorage.setItem('cosmic_pilot_name', callsign);
        } catch (err) {
            // Ignore private mode restrictions
        }
    }

    // -------------------------------------------------------------------------
    // Topbar Credits & Howler Audio Toggle
    // -------------------------------------------------------------------------
    function updateHeaderCredits() {
        const profile = PERSIST.load();
        const el = document.getElementById('creditsDisplay');
        if (el) el.textContent = profile.credits.toLocaleString('tr-TR');

        const runsEl = document.getElementById('railRunsVal');
        const waveEl = document.getElementById('railBestWaveVal');
        const achEl = document.getElementById('railAchVal');
        const unlockedCount = DATA.ACHIEVEMENTS.filter(a => profile.achievements && profile.achievements[a.id]).length;

        if (runsEl) runsEl.textContent = profile.stats.runs || 0;
        if (waveEl) waveEl.textContent = profile.stats.bestWave || 0;
        if (achEl) achEl.textContent = `${unlockedCount} / ${DATA.ACHIEVEMENTS.length}`;
    }

    function setupAudioControl() {
        const btn = document.getElementById('audioToggleBtn');
        const label = document.getElementById('audioToggleLabel');
        if (!btn) return;

        const syncUi = () => {
            const muted = global.CosmicAudio && global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted;
            btn.classList.toggle('is-muted', Boolean(muted));
            const iconEl = document.getElementById('audioToggleIcon');
            if (iconEl) iconEl.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
            if (label) label.textContent = muted ? 'Sessiz' : 'Ses Açık';
            refreshIcons();
        };

        syncUi();
        btn.addEventListener('click', () => {
            if (!global.CosmicAudio) return;
            global.CosmicAudio.unlock();
            const currentMuted = Boolean(global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            global.CosmicAudio.setMuted(!currentMuted);
            syncUi();
            if (currentMuted) global.CosmicAudio.play('uiClick');
        });
    }

    // -------------------------------------------------------------------------
    // Navigation & GSAP Stagger
    // -------------------------------------------------------------------------
    function animateViewCards(viewEl) {
        if (!viewEl || !global.gsap) return;
        const targets = viewEl.querySelectorAll('.cockpit-panel, .workshop-card, .atlas-sector-card, .atlas-boss-card, .record-stat-card, .achievement-card');
        if (!targets.length) return;
        global.gsap.killTweensOf(targets);
        global.gsap.fromTo(
            targets,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.28, stagger: 0.03, ease: 'power2.out', clearProps: 'transform,opacity' }
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
    // View 1: Cockpit — Ship Deck, Sector Cards, Difficulties & Chart.js Radar
    // -------------------------------------------------------------------------
    function renderShipDeck() {
        const container = document.getElementById('shipDeckList');
        if (!container) return;

        const html = Object.values(DATA.SHIPS).map(ship => {
            const selected = ship.id === state.selectedShipId;
            const unlocked = PERSIST.isShipUnlocked(ship.id);
            return `
                <button type="button" class="ship-deck-card ${selected ? 'selected' : ''}" data-ship-id="${ship.id}">
                    <div class="ship-deck-thumb">
                        <img src="${ship.asset}" alt="${ship.name}">
                    </div>
                    <div class="ship-deck-meta">
                        <div class="ship-deck-name">${ship.name}</div>
                        <div class="ship-deck-role">${ship.role}</div>
                    </div>
                    <span class="cs-badge ${selected ? 'cs-badge-sky' : 'cs-badge-mint'}" style="font-size:10px;">
                        ${unlocked ? (selected ? 'SEÇİLİ' : ship.tag) : `${ship.unlockCost} CRD`}
                    </span>
                </button>
            `;
        }).join('');

        container.innerHTML = html;
        container.querySelectorAll('.ship-deck-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const shipId = btn.dataset.shipId;
                state.selectedShipId = shipId;
                playUiSound('uiClick');
                saveDeploymentPrefs();
                renderShipDeck();
                updateCockpitTelemetry();
            });
        });
    }

    function renderSectorPicker() {
        const grid = document.getElementById('sectorPickerGrid');
        if (!grid) return;

        grid.innerHTML = Object.values(DATA.MAPS).map(map => {
            const selected = map.id === state.selectedMapId;
            const eventSummary = map.arenaEvents.map(ev => ev.name).join(' + ');
            return `
                <button type="button" class="sector-pick-card ${selected ? 'selected' : ''}" data-map-id="${map.id}">
                    <div class="sector-pick-banner">
                        <img src="${map.asset}" alt="${map.name}">
                        <span class="sector-mult-badge">${map.scoreMult.toFixed(2).replace(/\.00$/, '.0')}x SKOR</span>
                    </div>
                    <div class="sector-pick-title">${map.name}</div>
                    <div class="sector-pick-event">${eventSummary}</div>
                </button>
            `;
        }).join('');

        grid.querySelectorAll('.sector-pick-card').forEach(card => {
            card.addEventListener('click', () => {
                state.selectedMapId = card.dataset.mapId;
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
        const codeEl = document.getElementById('selectedSectorCode');
        const briefEl = document.getElementById('activeSectorBrief');
        if (codeEl) codeEl.textContent = `${map.code} · ${map.scoreMult}x SKOR`;
        if (briefEl) {
            const eventsList = map.arenaEvents.map(e => `<strong>${e.name}:</strong> ${e.desc}`).join('<br>');
            briefEl.innerHTML = `
                <div style="margin-bottom:0.28rem;font-weight:600;color:var(--accent-sky);">
                    Aktif Arena Olayları — ${map.name}
                </div>
                <div>${eventsList}</div>
            `;
        }
        updateLaunchLabel();
    }

    function renderDifficulties() {
        const grid = document.getElementById('difficultyGrid');
        if (!grid) return;

        grid.innerHTML = Object.values(DATA.DIFFICULTIES).map(diff => {
            const selected = diff.id === state.selectedDiff;
            return `
                <button type="button" class="diff-pill ${selected ? 'selected' : ''}" data-diff-id="${diff.id}">
                    <span class="diff-pill-title">${diff.label}</span>
                    <span class="diff-pill-mult" style="color:${diff.color};">${diff.sm.toFixed(1)}x Skor · ${Math.round(diff.ehm * 100)}% HP</span>
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
        const el = document.getElementById('selectedDiffMult');
        if (el) {
            el.textContent = `${diff.sm.toFixed(1)}x SKOR`;
            el.style.color = diff.color;
        }
        updateLaunchLabel();
    }

    function updateLaunchLabel() {
        const ship = DATA.SHIPS[state.selectedShipId] || DATA.SHIPS.interceptor;
        const map = DATA.MAPS[state.selectedMapId] || DATA.MAPS.sector9;
        const btnText = document.getElementById('launchBtnText');
        if (btnText) btnText.textContent = `${ship.name.toUpperCase()} İLE ${map.code} GÖREVİNE ÇIK`;
    }

    function updateShipRadarChart(ship) {
        const canvas = document.getElementById('shipRadarCanvas');
        if (!canvas || typeof global.Chart === 'undefined') return;

        const r = ship.radar || { speed: 70, firepower: 70, defense: 70, control: 70, capacity: 70 };
        const values = [r.speed, r.firepower, r.defense, r.control, r.capacity];
        const color = ship.color || '#38bdf8';

        if (state.radarChart) {
            state.radarChart.data.datasets[0].label = ship.name;
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
                labels: ['Hız', 'Ateş Gücü', 'Savunma', 'Kontrol', 'Kapasite'],
                datasets: [{
                    label: ship.name,
                    data: values,
                    borderColor: color,
                    backgroundColor: color + '33',
                    borderWidth: 2,
                    pointBackgroundColor: color,
                    pointBorderColor: '#070b12',
                    pointRadius: 3.5
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
                            font: { family: 'Inter, sans-serif', size: 11.5, weight: '600' }
                        }
                    }
                }
            }
        });
    }

    function updateCockpitTelemetry() {
        const ship = DATA.SHIPS[state.selectedShipId] || DATA.SHIPS.interceptor;
        const bonuses = PERSIST.getBonuses();

        const setEl = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setEl('stageShipName', `${ship.name} (${ship.codeName})`);
        setEl('stageShipRole', ship.role);
        setEl('telemetryTagBadge', ship.tag);

        const effHp = Math.round(ship.hp * bonuses.hpMult);
        const effSh = Math.round(ship.sh * bonuses.hpMult);
        const effSp = Math.round(ship.sp * bonuses.spdMult);
        const effCrit = Math.round((ship.crit + bonuses.critAdd) * 100);

        setEl('kpiHp', `${effHp}`);
        setEl('kpiSh', `${effSh}`);
        setEl('kpiSpdArmor', `${effSp} / %${Math.round(ship.armor * 100)}`);
        setEl('kpiCrit', `%${effCrit}`);

        setEl('passiveTitle', ship.passiveName);
        setEl('passiveDesc', ship.passiveDesc);
        setEl('abilityTitle', ship.abilityName);
        setEl('abilityCdBadge', `${ship.abilityCd.toFixed(1)}s CD`);
        setEl('abilityDesc', ship.abilityDesc);

        const starterW = DATA.WEAPONS[ship.starterWeapon];
        const sigW = DATA.WEAPONS[ship.sigWeapon];
        const sigT = DATA.TRINKETS[ship.sigTrinket];
        const sigE = DATA.EVOLUTIONS[ship.sigEvo];
        const sigM = DATA.SUPER_EVOLUTIONS[ship.sigMega];

        const comboEl = document.getElementById('signatureComboChain');
        if (comboEl && sigW && sigT && sigE && sigM) {
            comboEl.innerHTML = `
                <div>Başlangıç: <strong>${starterW ? starterW.name : ship.starterWeapon}</strong></div>
                <div>Kök Sentez: <strong>${sigW.name}</strong> + <strong>${sigT.name}</strong></div>
                <div>İmza Evrim: <strong style="color:var(--accent-sky);">${sigE.name}</strong></div>
                <div>Hedef Mega: <strong style="color:var(--accent-amber);">${sigM.name}</strong></div>
            `;
        }

        const treeLink = document.getElementById('stageTreeLink');
        if (treeLink) treeLink.href = `tree.html?ship=${ship.id}`;
        const navTreeLink = document.getElementById('navTreeLink');
        if (navTreeLink) navTreeLink.href = `tree.html?ship=${ship.id}`;

        updateLaunchLabel();
        updateShipRadarChart(ship);
    }

    function startTurntableLoop() {
        const canvas = document.getElementById('turntableCanvas');
        if (!canvas || !global.CosmicModels) return;

        const renderFrame = (nowMs) => {
            if (state.activeView === 'view-cockpit') {
                global.CosmicModels.renderTurntable(canvas, state.selectedShipId, nowMs * 0.001);
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
            const targetUrl = `game.html?ship=${encodeURIComponent(state.selectedShipId)}&map=${encodeURIComponent(state.selectedMapId)}&diff=${encodeURIComponent(state.selectedDiff)}`;
            global.location.href = targetUrl;
        });
    }

    // -------------------------------------------------------------------------
    // View 2: Research Workshop
    // -------------------------------------------------------------------------
    function renderWorkshop() {
        const profile = PERSIST.load();
        const bonuses = PERSIST.getBonuses();

        const bonusPills = document.getElementById('workshopBonusPills');
        if (bonusPills) {
            bonusPills.innerHTML = `
                <span class="cs-badge cs-badge-coral font-mono">Hasar ${bonuses.dmgMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-amber font-mono">Gövde/Kalkan ${bonuses.hpMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-sky font-mono">Hız ${bonuses.spdMult.toFixed(2)}x</span>
                <span class="cs-badge cs-badge-violet font-mono">Kritik +%${Math.round(bonuses.critAdd * 100)}</span>
                <span class="cs-badge cs-badge-mint font-mono">CDR -%${Math.round(bonuses.cdrAdd * 100)}</span>
                <span class="cs-badge cs-badge-sky font-mono">Reroll +${bonuses.extraRerolls}</span>
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
                `<span class="level-pip ${idx < lvl ? 'filled' : ''}"></span>`
            ).join('');

            return `
                <article class="workshop-card">
                    <div class="workshop-card-top">
                        <div class="workshop-icon-box" style="color:${upg.color};">
                            <i data-lucide="${upg.icon}"></i>
                        </div>
                        <div style="min-width:0;flex:1;">
                            <div style="font-family:var(--font-display);font-weight:600;font-size:15px;">${upg.name}</div>
                            <div style="font-size:12.5px;color:var(--text-secondary);">${upg.perLevelLabel}</div>
                        </div>
                        <span class="cs-badge font-mono">Lv.${lvl}/${upg.maxLevel}</span>
                    </div>

                    <div class="level-pips">${pips}</div>

                    <button type="button" class="cs-btn ${maxed ? 'cs-btn-mint' : (canAfford ? 'cs-btn-primary' : '')} workshop-buy-btn"
                        data-upg-id="${upg.id}" ${maxed || !canAfford ? 'disabled' : ''}>
                        <i data-lucide="${maxed ? 'check' : 'arrow-up-circle'}"></i>
                        <span>${maxed ? 'MAKSİMUM SEVİYE' : `Yükselt (${cost.toLocaleString('tr-TR')} CRD)`}</span>
                    </button>
                </article>
            `;
        }).join('');

        grid.querySelectorAll('.workshop-buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const res = PERSIST.buyUpgrade(btn.dataset.upgId);
                if (res.ok) {
                    playUiSound('uiConfirm');
                    updateHeaderCredits();
                    renderWorkshop();
                    updateCockpitTelemetry();
                    showToast(`Kalibrasyon Lv.${res.level} tamamlandı.`);
                } else {
                    playUiSound('uiBack');
                    showToast('Yetersiz araştırma kredisi.');
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
            showToast(`${res.refunded.toLocaleString('tr-TR')} CRD atölyeden iade edildi.`);
        });
    }

    // -------------------------------------------------------------------------
    // View 3: Sector Atlas & Boss Intel
    // -------------------------------------------------------------------------
    function renderSectorAtlas() {
        const secGrid = document.getElementById('atlasSectorGrid');
        if (secGrid) {
            secGrid.innerHTML = Object.values(DATA.MAPS).map(map => {
                const eventsHtml = map.arenaEvents.map(ev => `
                    <div class="atlas-event-item">
                        <div style="font-weight:600;color:${ev.type === 'hazard' ? 'var(--accent-coral)' : 'var(--accent-mint)'};margin-bottom:0.18rem;">
                            ${ev.name}
                        </div>
                        <div style="color:var(--text-secondary);line-height:1.42;">${ev.desc}</div>
                    </div>
                `).join('');

                return `
                    <article class="atlas-sector-card">
                        <div class="atlas-sector-media">
                            <img src="${map.asset}" alt="${map.name}">
                            <span class="sector-mult-badge">${map.hazardTag}</span>
                        </div>
                        <div class="atlas-sector-body">
                            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                                <h3 style="font-size:17px;">${map.name}</h3>
                                <span class="cs-badge cs-badge-sky font-mono">${map.code}</span>
                            </div>
                            <p style="font-size:13px;margin:0;">${map.subtitle}</p>
                            ${eventsHtml}
                            <div style="font-size:12.5px;color:var(--text-secondary);">
                                <strong style="color:var(--text-primary);">Taktik:</strong> ${map.tactics}
                            </div>
                            <button type="button" class="cs-btn cs-btn-primary atlas-deploy-btn" data-map-id="${map.id}">
                                <i data-lucide="crosshair"></i>
                                <span>Bu Sektörü Kokpitte Seç</span>
                            </button>
                        </div>
                    </article>
                `;
            }).join('');

            secGrid.querySelectorAll('.atlas-deploy-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.selectedMapId = btn.dataset.mapId;
                    saveDeploymentPrefs();
                    renderSectorPicker();
                    playUiSound('uiConfirm');
                    switchView('view-cockpit');
                    showToast(`${DATA.MAPS[state.selectedMapId].name} konuşlanma rotasına alındı.`);
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
                            <h3 style="font-size:16px;">${boss.name}</h3>
                            <div style="font-size:12px;color:var(--text-secondary);">${boss.subtitle}</div>
                            <span class="cs-badge cs-badge-coral font-mono" style="margin-top:0.35rem;">${boss.spawnWave}</span>
                        </div>
                    </div>
                    <ul class="boss-mechanics-list">
                        ${boss.mechanics.map(m => `<li>${m}</li>`).join('')}
                    </ul>
                    <div style="font-size:12.5px;color:var(--text-secondary);padding-top:0.35rem;border-top:1px solid var(--border-subtle);">
                        <strong style="color:var(--accent-mint);">Karşı Taktik:</strong> ${boss.tactics}
                    </div>
                </article>
            `).join('');
        }

        refreshIcons();
    }

    // -------------------------------------------------------------------------
    // View 4: Records & Leaderboards (uses CosmicLeaderboard local & async global)
    // -------------------------------------------------------------------------
    function renderScoreRows(tbody, scores) {
        if (!tbody) return;
        if (!scores || !scores.length) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:1.4rem;">Henüz kayıt bulunamadı. İlk uçuşunuzla rekor başlatın.</td></tr>`;
            return;
        }
        tbody.innerHTML = scores.slice(0, 12).map((row, idx) => {
            const pilot = row.players || 'PİLOT';
            const diffObj = DATA.DIFFICULTIES[row.difficulty];
            const diffLabel = diffObj ? diffObj.shortLabel : String(row.difficulty || 'NORMAL').toUpperCase();
            return `
                <tr>
                    <td class="font-mono">#${idx + 1}</td>
                    <td style="color:var(--text-primary);font-weight:500;">${pilot}</td>
                    <td class="font-mono">${diffLabel}</td>
                    <td class="font-mono">D.${row.wave || 1}</td>
                    <td class="font-mono" style="color:var(--accent-sky);font-weight:600;">${Number(row.score || 0).toLocaleString('tr-TR')}</td>
                </tr>
            `;
        }).join('');
    }

    async function renderRecordsView() {
        const profile = PERSIST.load();
        const s = profile.stats;
        const statsGrid = document.getElementById('recordsStatsGrid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="record-stat-card">
                    <div style="font-size:12px;color:var(--text-secondary);">Toplam Uçuş</div>
                    <div class="record-stat-val">${s.runs || 0}</div>
                </div>
                <div class="record-stat-card">
                    <div style="font-size:12px;color:var(--text-secondary);">En Yüksek Skor</div>
                    <div class="record-stat-val" style="color:var(--accent-sky);">${Number(s.bestScore || 0).toLocaleString('tr-TR')}</div>
                </div>
                <div class="record-stat-card">
                    <div style="font-size:12px;color:var(--text-secondary);">En Yüksek Dalga</div>
                    <div class="record-stat-val" style="color:var(--accent-mint);">${s.bestWave || 0}</div>
                </div>
                <div class="record-stat-card">
                    <div style="font-size:12px;color:var(--text-secondary);">Toplam İmha</div>
                    <div class="record-stat-val">${Number(s.totalKills || 0).toLocaleString('tr-TR')}</div>
                </div>
                <div class="record-stat-card">
                    <div style="font-size:12px;color:var(--text-secondary);">Evrim / Mega</div>
                    <div class="record-stat-val" style="color:var(--accent-amber);">${s.totalEvos || 0} / ${s.totalMegas || 0}</div>
                </div>
            `;
        }

        const localBody = document.getElementById('localLeaderboardBody');
        const globalBody = document.getElementById('globalLeaderboardBody');
        const statusBadge = document.getElementById('globalBoardStatus');

        if (global.CosmicLeaderboard && typeof global.CosmicLeaderboard.getLocalScores === 'function') {
            renderScoreRows(localBody, global.CosmicLeaderboard.getLocalScores());
        }

        if (globalBody && global.CosmicLeaderboard && typeof global.CosmicLeaderboard.getGlobalScores === 'function') {
            if (statusBadge) statusBadge.textContent = 'YÜKLENİYOR';
            globalBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:1.4rem;">Küresel veriler alınıyor...</td></tr>`;
            try {
                const remoteScores = await global.CosmicLeaderboard.getGlobalScores();
                renderScoreRows(globalBody, remoteScores);
                if (statusBadge) statusBadge.textContent = 'ÇEVRİMİÇİ';
            } catch (err) {
                renderScoreRows(globalBody, []);
                if (statusBadge) statusBadge.textContent = 'ÇEVRİMDIŞI';
            }
        }
    }

    // -------------------------------------------------------------------------
    // View 5: Achievements
    // -------------------------------------------------------------------------
    function renderAchievementsView() {
        const profile = PERSIST.load();
        const grid = document.getElementById('achievementsGrid');
        const badge = document.getElementById('achievementCounterBadge');
        if (!grid) return;

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
                            <div style="font-family:var(--font-display);font-weight:600;font-size:15px;">${ach.name}</div>
                            <span class="cs-badge ${isUnlocked ? 'cs-badge-mint' : ''} font-mono" style="margin-top:0.2rem;">
                                ÖDÜL: ${ach.reward} CRD
                            </span>
                        </div>
                    </div>
                    <p style="font-size:13px;margin:0;">${ach.desc}</p>
                    <button type="button" class="cs-btn ${isUnlocked && !isClaimed ? 'cs-btn-mint' : 'cs-btn-ghost'} ach-claim-btn"
                        data-ach-id="${ach.id}" ${!isUnlocked || isClaimed ? 'disabled' : ''}>
                        <i data-lucide="${isClaimed ? 'check-circle-2' : (isUnlocked ? 'gift' : 'lock')}"></i>
                        <span>${isClaimed ? 'Ödül Tahsil Edildi' : (isUnlocked ? `Ödülü Al (+${ach.reward} CRD)` : 'Kilitli — Görevi Tamamla')}</span>
                    </button>
                </article>
            `;
        }).join('');

        if (badge) badge.textContent = `${unlockedTotal} / ${DATA.ACHIEVEMENTS.length}`;

        grid.querySelectorAll('.ach-claim-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const res = PERSIST.claimAchievement(btn.dataset.achId);
                if (res.ok) {
                    playUiSound('uiConfirm');
                    updateHeaderCredits();
                    renderAchievementsView();
                    showToast(`+${res.reward} CRD başarımdan tahsil edildi!`);
                }
            });
        });

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

        updateHeaderCredits();
        renderShipDeck();
        renderSectorPicker();
        renderDifficulties();
        updateCockpitTelemetry();
        startTurntableLoop();

        refreshIcons();
        animateViewCards(document.getElementById('view-cockpit'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
