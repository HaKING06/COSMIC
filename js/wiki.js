// =============================================================================
// COSMIC SURVIVORS v9.0 — ENCYCLOPEDIA & SYNTHESIS SIMULATOR (js/wiki.js)
// Covers all 53 canonical modules, synergy tables, Chart.js DPS comparisons,
// PNG Bestiary dossiers and live dark-styled Synthesis & Decay Simulator.
// =============================================================================
(function (global) {
    'use strict';

    const DATA = global.COSMIC_DATA;
    const PERSIST = global.CosmicPersistence;

    const state = {
        activeTab: 'tab-database',
        dbCat: 'all',
        dbQuery: '',
        chartMode: 'mixed',
        dpsChart: null
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

    function setupHeader() {
        const profile = PERSIST.load();
        const creditsEl = document.getElementById('creditsDisplay');
        if (creditsEl) creditsEl.textContent = profile.credits.toLocaleString('tr-TR');

        const btn = document.getElementById('audioToggleBtn');
        const label = document.getElementById('audioToggleLabel');
        if (!btn) return;

        const syncUi = () => {
            const muted = Boolean(global.CosmicAudio && global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            btn.classList.toggle('is-muted', muted);
            const iconEl = document.getElementById('audioToggleIcon');
            if (iconEl) iconEl.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
            if (label) label.textContent = muted ? 'Sessiz' : 'Ses Açık';
            refreshIcons();
        };

        syncUi();
        btn.addEventListener('click', () => {
            if (!global.CosmicAudio) return;
            global.CosmicAudio.unlock();
            const cur = Boolean(global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            global.CosmicAudio.setMuted(!cur);
            syncUi();
            if (cur) global.CosmicAudio.play('uiClick');
        });
    }

    // -------------------------------------------------------------------------
    // Tab Switching & GSAP Safe Animation
    // -------------------------------------------------------------------------
    function animatePanel(panel) {
        if (!panel || !global.gsap) return;
        const cards = panel.querySelectorAll('.module-card, .bestiary-card, .meta-combo-card, .sim-panel');
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
    // Tab 1: 53-Module Database
    // -------------------------------------------------------------------------
    function getKindMeta(kind) {
        if (kind === 'weapon') return { label: 'SİLAH', cls: 'cs-badge-sky' };
        if (kind === 'trinket') return { label: 'DESTEK', cls: 'cs-badge-mint' };
        if (kind === 'evolution') return { label: 'EVRİM', cls: 'cs-badge-violet' };
        return { label: 'MEGA EVRİM', cls: 'cs-badge-amber' };
    }

    function renderModuleDatabase() {
        const grid = document.getElementById('wikiModuleGrid');
        if (!grid) return;

        const q = state.dbQuery.trim().toLowerCase();
        const items = DATA.getAllModules().filter(mod => {
            if (state.dbCat !== 'all' && mod.kind !== state.dbCat) return false;
            if (!q) return true;
            const shipName = mod.shipExclusive ? DATA.SHIPS[mod.shipExclusive].name.toLowerCase() : '';
            return (
                mod.name.toLowerCase().includes(q) ||
                mod.id.toLowerCase().includes(q) ||
                mod.desc.toLowerCase().includes(q) ||
                (mod.formula && mod.formula.toLowerCase().includes(q)) ||
                shipName.includes(q)
            );
        });

        if (!items.length) {
            grid.innerHTML = `<div class="cs-card" style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Aramanızla eşleşen modül bulunamadı.</div>`;
            return;
        }

        grid.innerHTML = items.map(mod => {
            const km = getKindMeta(mod.kind);
            const shipTag = mod.shipExclusive ? DATA.SHIPS[mod.shipExclusive].name : 'Evrensel';
            const subLine = mod.formula || mod.statLabel || (mod.stats ? `${mod.stats.dps} Tahmini DPS · CD ${mod.stats.cd}s` : '');

            return `
                <article class="module-card">
                    <div class="module-card-head">
                        <div class="module-icon-badge" style="color:${mod.color || '#38bdf8'};">
                            <i data-lucide="${mod.icon || 'cpu'}"></i>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-family:var(--font-display);font-weight:600;font-size:15px;">${mod.name}</div>
                            <div style="font-size:12px;color:var(--text-secondary);">${shipTag}</div>
                        </div>
                        <span class="cs-badge ${km.cls} font-mono">${mod.tier || km.label}</span>
                    </div>

                    ${subLine ? `<div class="module-formula-line">${subLine}</div>` : ''}

                    <p style="font-size:13px;margin:0;flex:1;">${mod.desc}</p>

                    <div style="display:flex;align-items:center;justify-content:space-between;padding-top:0.35rem;border-top:1px solid rgba(148,163,184,0.08);">
                        <span class="font-mono" style="font-size:11.5px;color:var(--text-muted);">${mod.id}</span>
                        <a href="tree.html?node=${encodeURIComponent(mod.id)}" class="cs-btn cs-btn-ghost" style="padding:0.34rem 0.68rem;font-size:12px;">
                            <i data-lucide="git-branch"></i>
                            <span>Ağaçta Aç</span>
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
    // Tab 2: Sector & Ship Synergy
    // -------------------------------------------------------------------------
    function renderSynergyTab() {
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
                    .map(m => m.name)
                    .join(' · ');

                return `
                    <tr>
                        <td>
                            <div class="synergy-ship-cell">
                                <img src="${ship.asset}" alt="${ship.name}">
                                <div>
                                    <div style="font-family:var(--font-display);font-weight:600;color:var(--text-primary);">${ship.name}</div>
                                    <div style="font-size:11.5px;color:var(--text-muted);">${ship.tag}</div>
                                </div>
                            </div>
                        </td>
                        <td>${startW ? startW.name : ship.starterWeapon}</td>
                        <td>
                            <div style="color:var(--text-primary);font-weight:500;">${sigW.name} + ${sigT.name}</div>
                            <div style="font-size:12px;color:var(--accent-sky);">→ ${sigE.name}</div>
                        </td>
                        <td><span class="cs-badge cs-badge-amber">${sigM.name}</span></td>
                        <td style="font-size:12.5px;">${idealMaps || 'Tüm Sektörler'}</td>
                        <td>
                            <a href="tree.html?ship=${ship.id}&node=${ship.sigEvo}" class="cs-btn cs-btn-ghost" style="padding:0.35rem 0.68rem;font-size:12px;">
                                Ağacı Aç
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
                    <img src="${map.asset}" alt="${map.name}" style="width:100%;height:130px;object-fit:cover;border-bottom:1px solid var(--border-subtle);">
                    <div style="padding:1rem;display:flex;flex-direction:column;gap:0.55rem;">
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                            <h3 style="font-size:16px;">${map.name}</h3>
                            <span class="cs-badge cs-badge-sky font-mono">${map.scoreMult}x SKOR</span>
                        </div>
                        <p style="font-size:12.5px;margin:0;">${map.subtitle}</p>
                        ${map.arenaEvents.map(ev => `
                            <div class="module-formula-line">
                                <strong style="color:${ev.type === 'hazard' ? 'var(--accent-coral)' : 'var(--accent-mint)'};">${ev.name}:</strong> ${ev.desc}
                            </div>
                        `).join('')}
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

        const curated = [
            {
                title: 'Hyperion Kritik Işık Fırtınası',
                shipId: 'interceptor',
                nodeId: 'hyperionApex',
                tier: 'MEGA · S+',
                recipe: 'Foton Raylı Top + Hiper-İvme Çekirdeği + Gatling Fırtınası',
                summary: 'Dalga 20+ elit temizliğinde yüksek kritik çarpanı ve 8 yönlü delici ışın kapsamı sunar.'
            },
            {
                title: 'Zırhlı Kıyamet Kuşatma Kalesi',
                shipId: 'dreadnought',
                nodeId: 'ironDreadnought',
                tier: 'MEGA · S+',
                recipe: 'Balistik Flak Topu + Reaktif Zırh + Titan Koronası',
                summary: 'Kara Delik ve Hiçlik modunda yüksek gövde bütünlüğüyle 360° kesintisiz patlama halkası oluşturur.'
            },
            {
                title: 'Tutulma Tanrısı Suikast Zinciri',
                shipId: 'phantom',
                nodeId: 'eclipseSingularity',
                tier: 'MEGA · S+',
                recipe: 'Hiper-Uzay Tırpanı + Gölge Pelerini + Kozmik Süpernova',
                summary: 'Tek hedef Boss eritme şampiyonu: arkadan +%65 kritik ile Boss HP eşiklerini hızla geçer.'
            },
            {
                title: 'Omega Seraphim Komuta Filosu',
                shipId: 'valkyrie',
                nodeId: 'omegaJudgement',
                tier: 'MEGA · S',
                recipe: 'Otonom Dronelar / Füze Sürüsü + Kuantum Nişangah + Titan Koronası',
                summary: 'Dyson Mega-Küre sütunlarıyla birleştiğinde tüm ekrana kesintisiz güdümlü mızrak yağdırır.'
            },
            {
                title: 'Olay Ufku Kriyo-Kalkan Kilidi',
                shipId: 'tempest',
                nodeId: 'eventHorizon',
                tier: 'MEGA · S',
                recipe: 'Kriyo-Buzul Küresi / Enerji Diski + Kozmik Süpernova',
                summary: 'Sürekli yavaşlatma ve çifte tekillik kontrolüyle kalabalık Kamikaze dalgalarını durdurur.'
            }
        ];

        list.innerHTML = curated.map(c => {
            const ship = DATA.SHIPS[c.shipId];
            return `
                <article class="meta-combo-card">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                        <strong style="font-family:var(--font-display);font-size:15px;">${c.title}</strong>
                        <span class="cs-badge cs-badge-amber font-mono">${c.tier}</span>
                    </div>
                    <div style="font-size:12px;color:var(--accent-sky);font-family:var(--font-mono);">${ship.name} · ${c.recipe}</div>
                    <p style="font-size:13px;margin:0;">${c.summary}</p>
                    <div>
                        <a href="tree.html?ship=${c.shipId}&node=${c.nodeId}" class="cs-btn cs-btn-ghost" style="padding:0.32rem 0.65rem;font-size:12px;">
                            <i data-lucide="git-branch"></i>
                            <span>Evrim Ağacında Aç</span>
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderMetaDpsChart() {
        const canvas = document.getElementById('metaDpsChartCanvas');
        if (!canvas || typeof global.Chart === 'undefined') return;

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

        const labels = sorted.map(m => m.name);
        const values = sorted.map(m => m.stats.dps || 0);
        const colors = sorted.map(m => m.kind === 'superEvolution' ? 'rgba(245, 158, 11, 0.82)' : 'rgba(56, 189, 248, 0.78)');

        if (state.dpsChart) {
            state.dpsChart.data.labels = labels;
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
                    label: 'Tahmini Sürdürülebilir DPS',
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
    // Tab 4: Bestiary (PNG Enemies & Bosses)
    // -------------------------------------------------------------------------
    function renderBestiary() {
        const bossGrid = document.getElementById('bestiaryBossGrid');
        if (bossGrid) {
            bossGrid.innerHTML = DATA.BOSSES.map(boss => `
                <article class="bestiary-card">
                    <div class="bestiary-head">
                        <img src="${boss.asset}" alt="${boss.name}" class="bestiary-sprite">
                        <div>
                            <h3 style="font-size:16px;">${boss.name}</h3>
                            <div style="font-size:12px;color:var(--text-secondary);">${boss.subtitle}</div>
                            <span class="cs-badge cs-badge-coral font-mono" style="margin-top:0.3rem;">${boss.spawnWave}</span>
                        </div>
                    </div>
                    <ul style="margin:0;padding-left:1.15rem;font-size:12.5px;color:var(--text-secondary);display:flex;flex-direction:column;gap:0.28rem;">
                        ${boss.mechanics.map(m => `<li>${m}</li>`).join('')}
                    </ul>
                    <div class="module-formula-line" style="color:var(--accent-mint);">
                        Taktik: ${boss.tactics}
                    </div>
                </article>
            `).join('');
        }

        const enemyGrid = document.getElementById('bestiaryEnemyGrid');
        if (enemyGrid) {
            enemyGrid.innerHTML = DATA.ENEMIES.map(en => `
                <article class="bestiary-card">
                    <div class="bestiary-head">
                        <img src="${en.asset}" alt="${en.name}" class="bestiary-sprite">
                        <div>
                            <h3 style="font-size:15.5px;">${en.name}</h3>
                            <div style="font-size:12px;color:var(--text-secondary);">${en.hpNote} · Hız: ${en.speedNote}</div>
                            <span class="cs-badge ${en.threat === 'KRİTİK' || en.threat === 'YÜKSEK' ? 'cs-badge-coral' : 'cs-badge-sky'} font-mono" style="margin-top:0.3rem;">
                                TEHDİT: ${en.threat}
                            </span>
                        </div>
                    </div>
                    <p style="font-size:13px;margin:0;">${en.behavior}</p>
                    <div class="module-formula-line">
                        <strong style="color:var(--text-primary);">Karşı Önlem:</strong> ${en.counter}
                    </div>
                </article>
            `).join('');
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
            wSel.innerHTML = Object.values(DATA.WEAPONS).map(w => {
                const owner = w.shipExclusive ? ` · ${DATA.SHIPS[w.shipExclusive].codeName}` : ' · EVRENSEL';
                return `<option value="${w.id}">${w.name}${owner}</option>`;
            }).join('');

            tSel.innerHTML = Object.values(DATA.TRINKETS).map(t => {
                const owner = t.shipExclusive ? ` · ${DATA.SHIPS[t.shipExclusive].codeName}` : ' · EVRENSEL';
                return `<option value="${t.id}">${t.name}${owner}</option>`;
            }).join('');

            const updateSynth = () => {
                const w = DATA.WEAPONS[wSel.value];
                const t = DATA.TRINKETS[tSel.value];
                const evo = DATA.findEvolutionForPair(wSel.value, tSel.value);

                if (evo) {
                    const nextMegas = Object.values(DATA.SUPER_EVOLUTIONS).filter(m => (m.evoPool || []).includes(evo.id));
                    outEl.innerHTML = `
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                            <strong style="font-size:16px;color:var(--accent-mint);">Sentez Sonucu: ${evo.name}</strong>
                            <span class="cs-badge cs-badge-violet font-mono">${evo.tier} · ${evo.stats.dps} DPS</span>
                        </div>
                        <div style="font-size:12.5px;color:var(--text-secondary);">${evo.desc}</div>
                        ${nextMegas.length ? `
                            <div class="module-formula-line" style="color:var(--accent-amber);">
                                Mega Zinciri: ${nextMegas.map(m => m.name).join(' · ')}
                            </div>
                        ` : ''}
                        <div>
                            <a href="tree.html?node=${evo.id}" class="cs-btn cs-btn-primary" style="font-size:13px;">
                                <i data-lucide="git-branch"></i>
                                <span>Evrim Ağacında İncele</span>
                            </a>
                        </div>
                    `;
                } else {
                    const pairT = w && w.pairTrinket ? DATA.TRINKETS[w.pairTrinket] : null;
                    outEl.innerHTML = `
                        <div style="font-weight:600;color:var(--accent-coral);">Sentez Eşleşmesi Yok</div>
                        <p style="font-size:13px;margin:0;">${w.name} ile ${t.name} doğrudan evrim oluşturmaz.</p>
                        ${pairT ? `
                            <div class="module-formula-line">
                                Önerilen eşleşme: <strong style="color:var(--accent-sky);">${w.name} + ${pairT.name}</strong>
                            </div>
                        ` : ''}
                    `;
                }
                refreshIcons();
            };

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
            shipSel.innerHTML = Object.values(DATA.SHIPS).map(s =>
                `<option value="${s.id}">${s.name} (${s.codeName})</option>`
            ).join('');

            diffSel.innerHTML = Object.values(DATA.DIFFICULTIES).map(d =>
                `<option value="${d.id}">${d.label}</option>`
            ).join('');
            diffSel.value = 'normal';

            const computeCombatSim = () => {
                const ship = DATA.SHIPS[shipSel.value] || DATA.SHIPS.interceptor;
                const diff = DATA.DIFFICULTIES[diffSel.value] || DATA.DIFFICULTIES.normal;
                const wave = Math.max(1, parseInt(waveSlider.value, 10) || 1);
                const bonuses = PERSIST.getBonuses();

                if (waveLabel) waveLabel.textContent = `Dalga ${wave}`;

                const effHp = Math.round(ship.hp * bonuses.hpMult);
                const effSh = Math.round(ship.sh * bonuses.hpMult);
                const ehp = Math.round(effHp / Math.max(0.25, 1 - ship.armor) + effSh);

                // Exact game.js Cosmic Decay formula (lines 708-711)
                const decay = wave < 25 ? 1.0 : Math.max(0.15, Math.pow(0.96, wave - 24));
                const decayPct = Math.round(decay * 100);

                // Wave Boss HP benchmark from game.js line 1938
                const bw = Math.max(1, Math.floor(wave / 5));
                const estBossHp = Math.round((4200 + Math.pow(bw, 1.55) * 3800) * diff.bhm);

                kpiBox.innerHTML = `
                    <div class="sim-kpi">
                        <span>Efektif EHP</span>
                        <strong style="color:var(--accent-sky);">${ehp} EHP</strong>
                    </div>
                    <div class="sim-kpi">
                        <span>Şifa/Kalkan Verimi</span>
                        <strong style="color:${decayPct < 60 ? 'var(--accent-coral)' : 'var(--accent-mint)'};">%${decayPct}</strong>
                    </div>
                    <div class="sim-kpi">
                        <span>Skor Çarpanı</span>
                        <strong style="color:var(--accent-amber);">${diff.sm.toFixed(1)}x</strong>
                    </div>
                `;

                decayBox.innerHTML = `
                    <div style="font-weight:600;color:var(--text-primary);">Atölye Bonusları Dahil Analiz</div>
                    <div>• Aktif Atölye Çarpanları: <strong>Hasar ${bonuses.dmgMult.toFixed(2)}x</strong>, <strong>Gövde ${bonuses.hpMult.toFixed(2)}x</strong>, <strong>Hız ${bonuses.spdMult.toFixed(2)}x</strong></div>
                    <div>• Dalga ${wave} tahmini Boss havuzu (<em>${diff.label}</em>): <strong>${estBossHp.toLocaleString('tr-TR')} HP</strong></div>
                    <div>• ${wave < 25
                        ? 'Dalga 25 öncesinde Kozmik Çürüme aktif değildir (%100 şifa verimliliği).'
                        : `Kozmik Çürüme aktif! Şifa ve kalkan yenileme hızı %${decayPct} kapasiteyle çalışır (taban %15).`
                    }</div>
                `;
            };

            shipSel.addEventListener('change', computeCombatSim);
            diffSel.addEventListener('change', computeCombatSim);
            waveSlider.addEventListener('input', computeCombatSim);
            computeCombatSim();
        }
    }

    function init() {
        setupHeader();
        setupTabs();
        setupDatabaseFilters();
        setupChartFilters();

        renderModuleDatabase();
        renderSynergyTab();
        renderMetaCombos();
        renderBestiary();
        setupSimulator();

        // Check URL hash/tab deep link
        const params = new URLSearchParams(global.location.search);
        const tabParam = params.get('tab');
        if (tabParam && document.getElementById(tabParam)) {
            switchTab(tabParam);
        }

        refreshIcons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
