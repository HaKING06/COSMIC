// =============================================================================
// COSMIC SURVIVORS v9.0 — INTERACTIVE EVOLUTION BLUEPRINT LAB (js/tree.js)
// Panzoom-powered DAG canvas, animated SVG Bezier synthesis edges,
// URL deep-linking (?ship=...&node=...) and holographic weapon telemetry.
// =============================================================================
(function (global) {
    'use strict';

    const DATA = global.COSMIC_DATA;
    const PERSIST = global.CosmicPersistence;

    const state = {
        shipId: 'interceptor',
        selectedNodeId: 'tachyonLance',
        showAllSignatures: false,
        panzoom: null,
        scale: 1,
        holoTimer: null
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

    function getModuleById(id) {
        return DATA.WEAPONS[id] || DATA.TRINKETS[id] || DATA.EVOLUTIONS[id] || DATA.SUPER_EVOLUTIONS[id] || null;
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

    function parseUrlParams() {
        const params = new URLSearchParams(global.location.search);
        const shipParam = params.get('ship');
        const nodeParam = params.get('node');

        if (shipParam && DATA.SHIPS[shipParam]) {
            state.shipId = shipParam;
        }

        if (nodeParam && getModuleById(nodeParam)) {
            const mod = getModuleById(nodeParam);
            if (mod.shipExclusive && DATA.SHIPS[mod.shipExclusive] && !shipParam) {
                state.shipId = mod.shipExclusive;
            }
            state.selectedNodeId = nodeParam;
            if (mod.shipExclusive && mod.shipExclusive !== state.shipId) {
                state.showAllSignatures = true;
            }
        } else {
            const ship = DATA.SHIPS[state.shipId];
            state.selectedNodeId = ship ? ship.sigEvo : 'tachyonLance';
        }
    }

    function syncUrl() {
        try {
            const url = new URL(global.location.href);
            url.searchParams.set('ship', state.shipId);
            url.searchParams.set('node', state.selectedNodeId);
            global.history.replaceState({}, '', url.toString());
        } catch (err) {
            // Safe fallback
        }
    }

    // -------------------------------------------------------------------------
    // Ship Selector Bar
    // -------------------------------------------------------------------------
    function renderShipSelector() {
        const bar = document.getElementById('shipSelectorBar');
        if (!bar) return;

        bar.innerHTML = Object.values(DATA.SHIPS).map(ship => `
            <button type="button" class="ship-pill-btn ${ship.id === state.shipId ? 'active' : ''}" data-ship-id="${ship.id}">
                <img src="${ship.asset}" alt="${ship.name}">
                <span>${ship.name}</span>
            </button>
        `).join('');

        bar.querySelectorAll('.ship-pill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.shipId = btn.dataset.shipId;
                const ship = DATA.SHIPS[state.shipId];
                state.selectedNodeId = ship.sigEvo;
                playUiSound('uiClick');
                syncUrl();
                renderShipSelector();
                renderTreeColumns();
                selectNode(state.selectedNodeId);
            });
        });

        const toggleBtn = document.getElementById('toggleAllSigsBtn');
        const toggleLabel = document.getElementById('toggleAllSigsLabel');
        if (toggleLabel) {
            toggleLabel.textContent = state.showAllSignatures ? 'Tüm 53 Modül Açık' : 'Seçili Gemi Görünümü';
        }
        if (toggleBtn && !toggleBtn.dataset.bound) {
            toggleBtn.dataset.bound = '1';
            toggleBtn.addEventListener('click', () => {
                state.showAllSignatures = !state.showAllSignatures;
                playUiSound('uiClick');
                renderShipSelector();
                renderTreeColumns();
                selectNode(state.selectedNodeId);
            });
        }
    }

    // -------------------------------------------------------------------------
    // Tree Node Rendering (4 Columns) & SVG Edges
    // -------------------------------------------------------------------------
    function buildNodeHtml(item, extraTag = '') {
        const isSig = item.scope === 'signature';
        const isMega = item.kind === 'superEvolution';
        const itemDps = item.stats && typeof item.stats.dps === 'number' ? item.stats.dps : 340;
        let subText = extraTag || '';
        if (!subText) {
            if (item.kind === 'weapon') {
                subText = item.shipExclusive ? `${DATA.SHIPS[item.shipExclusive].name} Kökü` : `Evrensel · ${itemDps} DPS`;
            } else if (item.kind === 'trinket') {
                subText = item.statLabel;
            } else if (item.kind === 'evolution') {
                const w = DATA.WEAPONS[item.weaponReq];
                const t = DATA.TRINKETS[item.trinketReq];
                subText = `${w ? w.name : ''} + ${t ? t.name : ''}`;
            } else if (item.kind === 'superEvolution') {
                subText = `${itemDps} DPS · +1 Slot`;
            }
        }

        const tierText = item.tier || (item.kind === 'weapon' ? `${itemDps}` : (isSig ? 'İMZA' : 'PASİF'));

        return `
            <div class="tree-node ${isSig ? 'is-signature' : ''} ${isMega ? 'is-mega' : ''}"
                 data-node-id="${item.id}" role="button" tabindex="0">
                <div class="node-icon-box" style="color:${item.color || '#38bdf8'};">
                    <i data-lucide="${item.icon || 'cpu'}"></i>
                </div>
                <div class="node-body">
                    <div class="node-name">${item.name}</div>
                    <div class="node-sub">${subText}</div>
                </div>
                <span class="node-tier-tag">${tierText}</span>
            </div>
        `;
    }

    function getVisibleFilter(item) {
        if (state.showAllSignatures) return true;
        if (item.scope !== 'signature') return true;
        return item.shipExclusive === state.shipId;
    }

    function computeEdges() {
        const edges = [];
        const ship = DATA.SHIPS[state.shipId];

        Object.values(DATA.EVOLUTIONS).forEach(evo => {
            if (!getVisibleFilter(evo)) return;
            if (evo.weaponReq) edges.push({ from: evo.weaponReq, to: evo.id, kind: 'evo' });
            if (evo.altWeaponReq && DATA.WEAPONS[evo.altWeaponReq]) {
                edges.push({ from: evo.altWeaponReq, to: evo.id, kind: 'alt' });
            }
            if (evo.trinketReq) edges.push({ from: evo.trinketReq, to: evo.id, kind: 'evo' });
        });

        Object.values(DATA.SUPER_EVOLUTIONS).forEach(mega => {
            if (!getVisibleFilter(mega)) return;
            const seenPairs = new Set();
            (mega.evoReqs || []).forEach(eId => {
                edges.push({ from: eId, to: mega.id, kind: 'mega' });
                seenPairs.add(eId);
            });
            // Also show signature bridge if current ship utilizes this mega via alt signature evo
            if (ship && ship.sigMega === mega.id && ship.sigEvo && !seenPairs.has(ship.sigEvo)) {
                edges.push({ from: ship.sigEvo, to: mega.id, kind: 'mega' });
            }
        });

        return edges;
    }

    function renderTreeColumns() {
        const ship = DATA.SHIPS[state.shipId];
        const colW = document.getElementById('colWeapons');
        const colT = document.getElementById('colTrinkets');
        const colE = document.getElementById('colEvolutions');
        const colM = document.getElementById('colMegaEvolutions');

        const allWeapons = Object.values(DATA.WEAPONS).filter(getVisibleFilter);
        const sigWeapons = allWeapons.filter(w => w.scope === 'signature');
        const uniWeapons = allWeapons.filter(w => w.scope !== 'signature');

        colW.innerHTML = `
            <div class="tree-col-head">1 · KÖK &amp; EVRENSEL SİLAHLAR</div>
            <div class="tree-col-divider">İmza Silahları</div>
            ${sigWeapons.map(w => buildNodeHtml(w, w.id === ship.sigWeapon ? `${ship.name} İmza Silahı` : '')).join('')}
            <div class="tree-col-divider">Evrensel Havuz (6)</div>
            ${uniWeapons.map(w => buildNodeHtml(w, w.id === ship.starterWeapon ? `${ship.name} Başlangıç` : '')).join('')}
        `;

        const allTrinkets = Object.values(DATA.TRINKETS).filter(getVisibleFilter);
        const sigTrinkets = allTrinkets.filter(t => t.scope === 'signature');
        const uniTrinkets = allTrinkets.filter(t => t.scope !== 'signature');

        colT.innerHTML = `
            <div class="tree-col-head">2 · DESTEK MODÜLLERİ (TRİNKET)</div>
            <div class="tree-col-divider">İmza Katalizörleri</div>
            ${sigTrinkets.map(t => buildNodeHtml(t)).join('')}
            <div class="tree-col-divider">Evrensel Modüller (6)</div>
            ${uniTrinkets.map(t => buildNodeHtml(t)).join('')}
        `;

        const allEvos = Object.values(DATA.EVOLUTIONS).filter(getVisibleFilter);
        const sigEvos = allEvos.filter(e => e.scope === 'signature');
        const uniEvos = allEvos.filter(e => e.scope !== 'signature');

        colE.innerHTML = `
            <div class="tree-col-head">3 · EVRİMLER (LV.5 SENTEZ)</div>
            <div class="tree-col-divider">Gemi İmza Evrimi</div>
            ${sigEvos.map(e => buildNodeHtml(e)).join('')}
            <div class="tree-col-divider">Çapraz Evrim Matrisi (11)</div>
            ${uniEvos.map(e => buildNodeHtml(e)).join('')}
        `;

        const megas = Object.values(DATA.SUPER_EVOLUTIONS).filter(getVisibleFilter);
        colM.innerHTML = `
            <div class="tree-col-head">4 · MEGA EVRİMLER (SUPER)</div>
            <div class="tree-col-divider">Çift Evrim Birleşimi (+1 Slot)</div>
            ${megas.map(m => buildNodeHtml(m, (ship && ship.sigMega === m.id) ? `${ship.name} Mega Hedefi` : '')).join('')}
        `;

        document.querySelectorAll('.tree-node').forEach(node => {
            node.addEventListener('click', () => {
                playUiSound('uiClick');
                selectNode(node.dataset.nodeId);
            });
            node.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectNode(node.dataset.nodeId);
                }
            });
        });

        refreshIcons();
        requestAnimationFrame(drawSvgConnections);
    }

    // Offset calculation strictly in #treeCanvas local unscaled layout space!
    function getOffsetWithinStage(el, stage) {
        let x = 0;
        let y = 0;
        let cur = el;
        while (cur && cur !== stage) {
            x += cur.offsetLeft;
            y += cur.offsetTop;
            cur = cur.offsetParent;
        }
        return { x, y, w: el.offsetWidth, h: el.offsetHeight };
    }

    function drawSvgConnections() {
        const svg = document.getElementById('svgConnections');
        const stage = document.getElementById('treeCanvas');
        if (!svg || !stage) return;

        svg.setAttribute('width', stage.scrollWidth);
        svg.setAttribute('height', stage.scrollHeight);

        const edges = computeEdges();
        const highlightedChain = getChainNodeSet(state.selectedNodeId);

        const pathsHtml = edges.map(edge => {
            const fromEl = stage.querySelector(`.tree-node[data-node-id="${edge.from}"]`);
            const toEl = stage.querySelector(`.tree-node[data-node-id="${edge.to}"]`);
            if (!fromEl || !toEl) return '';

            const a = getOffsetWithinStage(fromEl, stage);
            const b = getOffsetWithinStage(toEl, stage);
            const x1 = a.x + a.w;
            const y1 = a.y + a.h * 0.5;
            const x2 = b.x;
            const y2 = b.y + b.h * 0.5;
            const cx1 = x1 + Math.max(38, (x2 - x1) * 0.45);
            const cx2 = x2 - Math.max(38, (x2 - x1) * 0.45);

            const isRelated = highlightedChain.has(edge.from) && highlightedChain.has(edge.to);
            const cls = [
                'tree-edge',
                isRelated ? (edge.kind === 'mega' ? 'is-mega' : 'is-highlighted') : 'is-dimmed'
            ].join(' ');

            return `<path class="${cls}" d="M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}" />`;
        }).join('');

        svg.innerHTML = pathsHtml;
    }

    // -------------------------------------------------------------------------
    // Chain Highlighting & Right Inspector
    // -------------------------------------------------------------------------
    function getChainNodeSet(rootId) {
        const set = new Set();
        const edges = computeEdges();
        const walkUp = (id) => {
            if (set.has(id)) return;
            set.add(id);
            edges.filter(e => e.to === id).forEach(e => walkUp(e.from));
        };
        const walkDown = (id) => {
            set.add(id);
            edges.filter(e => e.from === id).forEach(e => walkDown(e.to));
        };
        walkUp(rootId);
        walkDown(rootId);
        return set;
    }

    function selectNode(nodeId) {
        const mod = getModuleById(nodeId);
        if (!mod) return;
        state.selectedNodeId = nodeId;
        syncUrl();

        const chain = getChainNodeSet(nodeId);
        document.querySelectorAll('.tree-node').forEach(el => {
            const id = el.dataset.nodeId;
            el.classList.toggle('is-selected', id === nodeId);
            el.classList.toggle('is-chain', id !== nodeId && chain.has(id));
            el.classList.toggle('is-dimmed', !chain.has(id));
        });

        drawSvgConnections();
        renderInspector(mod);
    }

    function renderInspector(mod) {
        const scopeBadge = document.getElementById('inspectorScopeBadge');
        const tierBadge = document.getElementById('inspectorTierBadge');
        const titleEl = document.getElementById('inspectorTitle');
        const descEl = document.getElementById('inspectorDesc');
        const statsGrid = document.getElementById('inspectorStatsGrid');
        const formulaBox = document.getElementById('inspectorFormulaBox');

        if (scopeBadge) {
            scopeBadge.textContent = mod.shipExclusive
                ? `${DATA.SHIPS[mod.shipExclusive].name.toUpperCase()} İMZA`
                : 'EVRENSEL MODÜL';
        }
        if (tierBadge) {
            tierBadge.textContent = mod.tier || (mod.kind === 'trinket' ? 'DESTEK' : 'KÖK');
        }
        if (titleEl) titleEl.textContent = mod.name;
        if (descEl) descEl.textContent = mod.desc;

        if (statsGrid) {
            const s = mod.stats || {};
            if (mod.kind === 'trinket') {
                statsGrid.innerHTML = `
                    <div class="inspector-stat-cell" style="grid-column:1/-1;">
                        <span>Kazanım Etkisi</span>
                        <strong style="color:var(--accent-mint);">${mod.statLabel}</strong>
                    </div>
                `;
            } else {
                statsGrid.innerHTML = `
                    <div class="inspector-stat-cell">
                        <span>Tahmini DPS</span>
                        <strong style="color:var(--accent-sky);">${s.dps || 120} DPS</strong>
                    </div>
                    <div class="inspector-stat-cell">
                        <span>Taban Hasar / CD</span>
                        <strong>${s.baseDmg || 35} · ${s.cd ? s.cd + 's' : 'Pasif'}</strong>
                    </div>
                `;
            }
        }

        if (formulaBox) {
            const items = [];
            if (mod.kind === 'weapon') {
                if (mod.pairTrinket && mod.evoId) {
                    const t = DATA.TRINKETS[mod.pairTrinket];
                    const e = DATA.EVOLUTIONS[mod.evoId];
                    items.push(`<strong>Ana Sentez:</strong> ${mod.name} + <button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;" data-jump="${t.id}">${t.name}</button> → <button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;color:var(--accent-sky);" data-jump="${e.id}">${e.name}</button>`);
                }
                if (mod.altTrinket && mod.altEvoId) {
                    const t2 = DATA.TRINKETS[mod.altTrinket];
                    const e2 = DATA.EVOLUTIONS[mod.altEvoId];
                    items.push(`<strong>Çapraz Dal:</strong> ${mod.name} + <button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;" data-jump="${t2.id}">${t2.name}</button> → <button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;color:var(--accent-mint);" data-jump="${e2.id}">${e2.name}</button>`);
                }
            } else if (mod.kind === 'trinket') {
                const pw = DATA.WEAPONS[mod.pairWeapon];
                const pe = DATA.EVOLUTIONS[mod.evoId];
                if (pw && pe) {
                    items.push(`<strong>Birincil Evrim:</strong> <button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;" data-jump="${pw.id}">${pw.name}</button> + ${mod.name} → <button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;color:var(--accent-sky);" data-jump="${pe.id}">${pe.name}</button>`);
                }
                if (mod.altWeapon && mod.altEvoId) {
                    const aw = DATA.WEAPONS[mod.altWeapon];
                    const ae = DATA.EVOLUTIONS[mod.altEvoId];
                    items.push(`<strong>Çapraz Bağ:</strong> <button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;" data-jump="${aw.id}">${aw.name}</button> → <button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;color:var(--accent-mint);" data-jump="${ae.id}">${ae.name}</button>`);
                }
            } else if (mod.kind === 'evolution') {
                const w = DATA.WEAPONS[mod.weaponReq];
                const t = DATA.TRINKETS[mod.trinketReq];
                items.push(`<strong>Sentez Reçetesi:</strong> <button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;" data-jump="${w.id}">${w.name}</button> + <button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;" data-jump="${t.id}">${t.name}</button>`);
                const nextMegas = Object.values(DATA.SUPER_EVOLUTIONS).filter(m => (m.evoPool || []).includes(mod.id));
                if (nextMegas.length) {
                    items.push(`<strong>Mega Yükseltme:</strong> ${nextMegas.map(m => `<button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;color:var(--accent-amber);" data-jump="${m.id}">${m.name}</button>`).join(' ')}`);
                }
            } else if (mod.kind === 'superEvolution') {
                const reqBtns = (mod.evoReqs || []).map(eid => {
                    const ev = DATA.EVOLUTIONS[eid];
                    return ev ? `<button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;color:var(--accent-sky);" data-jump="${ev.id}">${ev.name}</button>` : '';
                }).join(' + ');
                items.push(`<strong>Mega Çekirdek:</strong> ${reqBtns}`);
                items.push(`<span style="font-size:12px;color:var(--accent-mint);">İki evrim tek Mega slotta birleşir (+1 Silah Slotu açılır).</span>`);
            }

            formulaBox.innerHTML = items.join('<div style="height:4px;"></div>');
            formulaBox.querySelectorAll('.jump-node-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    playUiSound('uiClick');
                    const targetId = btn.dataset.jump;
                    const target = getModuleById(targetId);
                    if (target && target.shipExclusive && target.shipExclusive !== state.shipId) {
                        state.showAllSignatures = true;
                        renderShipSelector();
                        renderTreeColumns();
                    }
                    selectNode(targetId);
                });
            });
        }
    }

    // -------------------------------------------------------------------------
    // Holographic Weapon Preview Canvas
    // -------------------------------------------------------------------------
    function startHoloPreview() {
        const canvas = document.getElementById('holoEffectCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const drawFrame = (nowMs) => {
            const t = nowMs * 0.001;
            const mod = getModuleById(state.selectedNodeId) || DATA.EVOLUTIONS.tachyonLance;
            const color = mod.color || '#38bdf8';
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#070b12';
            ctx.fillRect(0, 0, w, h);

            // Subtle radar grid
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
            ctx.lineWidth = 1;
            for (let gx = 32; gx < w; gx += 32) {
                ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
            }
            for (let gy = 32; gy < h; gy += 32) {
                ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
            }

            const cx = 66;
            const cy = h * 0.5;

            // Stylized trajectory based on module kind/id
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;

            if (mod.kind === 'trinket') {
                // Concentric telemetry waves
                for (let i = 0; i < 3; i++) {
                    const rad = ((t * 44 + i * 26) % 76) + 12;
                    ctx.globalAlpha = Math.max(0.05, 1 - rad / 90);
                    ctx.beginPath();
                    ctx.arc(w * 0.5, cy, rad, 0, Math.PI * 2);
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            } else if (mod.id.includes('Disc') || mod.id.includes('aegis') || mod.id.includes('cryoVortex') || mod.id.includes('eventHorizon') || mod.id.includes('eternityLoop')) {
                const orbitR = 46;
                ctx.globalAlpha = 0.25;
                ctx.beginPath();
                ctx.arc(w * 0.5, cy, orbitR, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
                const count = mod.kind === 'superEvolution' ? 6 : 4;
                for (let i = 0; i < count; i++) {
                    const a = t * 3.1 + (Math.PI * 2 * i) / count;
                    const px = w * 0.5 + Math.cos(a) * orbitR;
                    const py = cy + Math.sin(a) * orbitR;
                    ctx.beginPath();
                    ctx.arc(px, py, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (mod.id.includes('Railgun') || mod.id.includes('tachyon') || mod.id.includes('hyperion')) {
                const pulse = 0.55 + Math.sin(t * 8) * 0.45;
                ctx.globalAlpha = pulse;
                ctx.lineWidth = mod.kind === 'superEvolution' ? 5 : 3;
                ctx.beginPath();
                ctx.moveTo(cx + 12, cy);
                ctx.lineTo(w - 22, cy);
                ctx.stroke();
                if (mod.kind === 'superEvolution') {
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.moveTo(cx + 12, cy); ctx.lineTo(w - 30, cy - 36);
                    ctx.moveTo(cx + 12, cy); ctx.lineTo(w - 30, cy + 36);
                    ctx.stroke();
                }
            } else {
                // Multi-projectile fan / swarm burst
                const rays = mod.kind === 'superEvolution' ? 7 : 5;
                for (let i = 0; i < rays; i++) {
                    const prog = (t * 1.45 + i * 0.14) % 1;
                    const spread = (i - (rays - 1) / 2) * 0.16;
                    const px = cx + 16 + prog * (w - 110);
                    const py = cy + Math.sin(spread) * prog * 130;
                    ctx.globalAlpha = 1 - prog * 0.35;
                    ctx.beginPath();
                    ctx.arc(px, py, mod.kind === 'superEvolution' ? 4.5 : 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();

            // Core emitter marker
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(mod.kind === 'trinket' ? w * 0.5 : cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '600 10px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(148, 163, 184, 0.78)';
            ctx.fillText(`SIM // ${mod.id.toUpperCase()}`, 12, 18);

            state.holoTimer = requestAnimationFrame(drawFrame);
        };

        if (state.holoTimer) cancelAnimationFrame(state.holoTimer);
        state.holoTimer = requestAnimationFrame(drawFrame);
    }

    // -------------------------------------------------------------------------
    // Quick Synthesis Calculator
    // -------------------------------------------------------------------------
    function setupQuickSynthCalculator() {
        const wSel = document.getElementById('calcWeaponSelect');
        const tSel = document.getElementById('calcTrinketSelect');
        const outEl = document.getElementById('calcSynthResult');
        if (!wSel || !tSel || !outEl) return;

        wSel.innerHTML = Object.values(DATA.WEAPONS).map(w => {
            const tag = w.shipExclusive ? ` · ${DATA.SHIPS[w.shipExclusive].codeName}` : ' · Evrensel';
            return `<option value="${w.id}">${w.name}${tag}</option>`;
        }).join('');

        tSel.innerHTML = Object.values(DATA.TRINKETS).map(t => {
            const tag = t.shipExclusive ? ` · ${DATA.SHIPS[t.shipExclusive].codeName}` : ' · Evrensel';
            return `<option value="${t.id}">${t.name}${tag}</option>`;
        }).join('');

        const evaluate = () => {
            const evo = DATA.findEvolutionForPair(wSel.value, tSel.value);
            if (evo) {
                outEl.innerHTML = `
                    <div style="color:var(--accent-mint);font-weight:600;margin-bottom:0.2rem;">Sentez Başarılı: ${evo.name}</div>
                    <div style="font-size:12px;color:var(--text-secondary);">${evo.formula}</div>
                    <button type="button" class="cs-btn cs-btn-primary" id="synthFocusBtn" style="margin-top:0.5rem;width:100%;padding:0.42rem;font-size:12.5px;">
                        Ağaçta Göster
                    </button>
                `;
                const btn = document.getElementById('synthFocusBtn');
                if (btn) {
                    btn.addEventListener('click', () => {
                        if (evo.shipExclusive && evo.shipExclusive !== state.shipId) {
                            state.shipId = evo.shipExclusive;
                            renderShipSelector();
                            renderTreeColumns();
                        }
                        selectNode(evo.id);
                    });
                }
            } else {
                const wObj = DATA.WEAPONS[wSel.value];
                const expectedT = wObj && wObj.pairTrinket ? DATA.TRINKETS[wObj.pairTrinket] : null;
                outEl.innerHTML = `
                    <div style="color:var(--text-secondary);font-weight:500;">Doğrudan evrim eşleşmesi yok.</div>
                    ${expectedT ? `<div style="font-size:12px;color:var(--accent-sky);margin-top:0.2rem;">İpucu: ${wObj.name} + ${expectedT.name}</div>` : ''}
                `;
            }
        };

        wSel.addEventListener('change', evaluate);
        tSel.addEventListener('change', evaluate);
        evaluate();
    }

    // -------------------------------------------------------------------------
    // Panzoom Integration (vendor/panzoom.min.js)
    // -------------------------------------------------------------------------
    function setupPanzoom() {
        const viewport = document.getElementById('treeViewport');
        const stage = document.getElementById('treeCanvas');
        const readout = document.getElementById('zoomReadout');
        if (!viewport || !stage) return;

        if (typeof global.Panzoom === 'function') {
            state.panzoom = global.Panzoom(stage, {
                maxScale: 1.85,
                minScale: 0.45,
                step: 0.14,
                contain: false,
                startScale: 0.92,
                startX: 18,
                startY: 16
            });

            viewport.addEventListener('wheel', event => {
                event.preventDefault();
                state.panzoom.zoomWithWheel(event);
            }, { passive: false });

            stage.addEventListener('panzoomchange', e => {
                state.scale = (e && e.detail && e.detail.scale) || 1;
                if (readout) readout.textContent = `${Math.round(state.scale * 100)}%`;
            });
        }

        const zIn = document.getElementById('zoomInBtn');
        const zOut = document.getElementById('zoomOutBtn');
        const zReset = document.getElementById('zoomResetBtn');

        if (zIn) zIn.addEventListener('click', () => { playUiSound('uiClick'); state.panzoom && state.panzoom.zoomIn(); });
        if (zOut) zOut.addEventListener('click', () => { playUiSound('uiClick'); state.panzoom && state.panzoom.zoomOut(); });
        if (zReset) zReset.addEventListener('click', () => { playUiSound('uiClick'); state.panzoom && state.panzoom.reset(); });

        global.addEventListener('resize', () => requestAnimationFrame(drawSvgConnections));
    }

    function init() {
        parseUrlParams();
        setupHeader();
        renderShipSelector();
        renderTreeColumns();
        setupQuickSynthCalculator();
        setupPanzoom();
        selectNode(state.selectedNodeId);
        startHoloPreview();
        refreshIcons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
