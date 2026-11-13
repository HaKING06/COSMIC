// =============================================================================
// COSMIC SURVIVORS v10.0 — INTERACTIVE EVOLUTION BLUEPRINT LAB (js/tree.js)
// Panzoom-powered DAG canvas, Fuse.js fuzzy search, animated SVG Bezier edges,
// EN/TR live localization, URL deep-linking & holographic weapon telemetry.
// =============================================================================
(function (global) {
    'use strict';

    const DATA = global.COSMIC_DATA;
    const PERSIST = global.CosmicPersistence;

    const TREE_I18N = {
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
            'tree.pageTitle': 'COSMIC SURVIVORS v11.0 — Evrim Ağacı & Sentez Laboratuvarı',
            'tree.topbarVersion': 'V11.0 EVOLUTION LAB',
            'tree.legend.sig': 'İmza Kök',
            'tree.legend.univ': 'Evrensel',
            'tree.legend.mega': 'Mega Evrim',
            'tree.viewShip': 'Seçili Gemi Görünümü',
            'tree.viewAll': 'Tüm 53 Modül Açık',
            'tree.zoomOut': 'Uzaklaş',
            'tree.zoomIn': 'Yakınlaş',
            'tree.reset': 'Sıfırla',
            'tree.searchPlaceholder': 'Bulanık ara: takyon, hyperion, gatling...',
            'tree.searchEmpty': 'Eşleşen modül bulunamadı.',
            'tree.hint': 'Sürükleyerek kaydırın · Fare tekerleğiyle yakınlaştırın · Sentez zinciri için düğüme tıklayın',
            'tree.quickSynthTitle': 'Hızlı Sentez Doğrulayıcı',
            'tree.colWeapons': '1 · KÖK & EVRENSEL SİLAHLAR',
            'tree.divSigWeapons': 'İmza Silahları',
            'tree.divUniWeapons': 'Evrensel Havuz (6)',
            'tree.colTrinkets': '2 · DESTEK MODÜLLERİ (TRİNKET)',
            'tree.divSigTrinkets': 'İmza Katalizörleri',
            'tree.divUniTrinkets': 'Evrensel Modüller (6)',
            'tree.colEvos': '3 · EVRİMLER (LV.5 SENTEZ)',
            'tree.divSigEvos': 'Gemi İmza Evrimi',
            'tree.divUniEvos': 'Çapraz Evrim Matrisi (11)',
            'tree.colMegas': '4 · MEGA EVRİMLER (SUPER)',
            'tree.divMegas': 'Çift Evrim Birleşimi (+1 Slot)'
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
            'tree.pageTitle': 'COSMIC SURVIVORS v11.0 — Evolution Tree & Synthesis Lab',
            'tree.topbarVersion': 'V11.0 EVOLUTION LAB',
            'tree.legend.sig': 'Signature Root',
            'tree.legend.univ': 'Universal',
            'tree.legend.mega': 'Mega Evolution',
            'tree.viewShip': 'Selected Ship View',
            'tree.viewAll': 'All 53 Modules Shown',
            'tree.zoomOut': 'Zoom Out',
            'tree.zoomIn': 'Zoom In',
            'tree.reset': 'Reset',
            'tree.searchPlaceholder': 'Fuzzy search: tachyon, hyperion, gatling...',
            'tree.searchEmpty': 'No matching modules found.',
            'tree.hint': 'Drag to pan · Scroll wheel to zoom · Click a node to inspect synthesis chain',
            'tree.quickSynthTitle': 'Quick Synthesis Verifier',
            'tree.colWeapons': '1 · ROOT & UNIVERSAL WEAPONS',
            'tree.divSigWeapons': 'Signature Weapons',
            'tree.divUniWeapons': 'Universal Pool (6)',
            'tree.colTrinkets': '2 · SUPPORT MODULES (TRINKETS)',
            'tree.divSigTrinkets': 'Signature Catalysts',
            'tree.divUniTrinkets': 'Universal Modules (6)',
            'tree.colEvos': '3 · EVOLUTIONS (LV.5 SYNTHESIS)',
            'tree.divSigEvos': 'Ship Signature Evolution',
            'tree.divUniEvos': 'Cross-Evolution Matrix (11)',
            'tree.colMegas': '4 · MEGA EVOLUTIONS (SUPER)',
            'tree.divMegas': 'Dual Evolution Fusion (+1 Slot)'
        }
    };

    const state = {
        shipId: 'interceptor',
        selectedNodeId: 'tachyonLance',
        showAllSignatures: false,
        panzoom: null,
        scale: 1,
        holoTimer: null,
        fuse: null,
        searchQuery: '',
        searchMatches: new Set(),
        activeResultIndex: 0
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
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.setAttribute('title', t(key, el.getAttribute('title'), el.getAttribute('title')));
        });
        document.title = t('tree.pageTitle', document.title, 'COSMIC SURVIVORS v10.0 — Evolution Tree & Synthesis Lab');
    }

    function registerI18n() {
        if (!global.CosmicI18n) return;
        if (global.CosmicI18n.dict) {
            Object.assign(global.CosmicI18n.dict.tr, TREE_I18N.tr);
            Object.assign(global.CosmicI18n.dict.en, TREE_I18N.en);
        }
        if (typeof global.CosmicI18n.applyTranslations === 'function') {
            global.CosmicI18n.applyTranslations();
        }
        syncLangTogglePills();
        applyAttributeTranslations();
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

    function getModuleById(id) {
        return DATA.WEAPONS[id] || DATA.TRINKETS[id] || DATA.EVOLUTIONS[id] || DATA.SUPER_EVOLUTIONS[id] || null;
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
        if (creditsEl) {
            const locale = getLang() === 'en' ? 'en-US' : 'tr-TR';
            creditsEl.textContent = profile.credits.toLocaleString(locale);
        }

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

        bar.innerHTML = Object.values(DATA.SHIPS).map(ship => {
            const shipName = loc(ship, 'name');
            return `
                <button type="button" class="ship-pill-btn ${ship.id === state.shipId ? 'active' : ''}" data-ship-id="${ship.id}">
                    <img src="${ship.asset}" alt="${shipName}">
                    <span>${shipName}</span>
                </button>
            `;
        }).join('');

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
            toggleLabel.textContent = state.showAllSignatures
                ? t('tree.viewAll', 'Tüm 53 Modül Açık', 'All 53 Modules Shown')
                : t('tree.viewShip', 'Seçili Gemi Görünümü', 'Selected Ship View');
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
        const lang = getLang();
        const isSig = item.scope === 'signature';
        const isMega = item.kind === 'superEvolution';
        const itemDps = item.stats && typeof item.stats.dps === 'number' ? item.stats.dps : 340;
        let subText = extraTag || '';
        if (!subText) {
            if (item.kind === 'weapon') {
                const uniWord = lang === 'en' ? 'Universal' : 'Evrensel';
                const rootWord = lang === 'en' ? 'Root' : 'Kökü';
                subText = item.shipExclusive ? `${loc(DATA.SHIPS[item.shipExclusive], 'name')} ${rootWord}` : `${uniWord} · ${itemDps} DPS`;
            } else if (item.kind === 'trinket') {
                subText = loc(item, 'statLabel');
            } else if (item.kind === 'evolution') {
                const w = DATA.WEAPONS[item.weaponReq];
                const tMod = DATA.TRINKETS[item.trinketReq];
                subText = `${loc(w, 'name')} + ${loc(tMod, 'name')}`;
            } else if (item.kind === 'superEvolution') {
                subText = `${itemDps} DPS · +1 Slot`;
            }
        }

        const tierText = item.tier || (item.kind === 'weapon' ? `${itemDps}` : (isSig ? (lang === 'en' ? 'SIG' : 'İMZA') : (lang === 'en' ? 'PASSIVE' : 'PASİF')));

        return `
            <div class="tree-node ${isSig ? 'is-signature' : ''} ${isMega ? 'is-mega' : ''}"
                 data-node-id="${item.id}" role="button" tabindex="0">
                <div class="node-icon-box" style="color:${item.color || '#38bdf8'};">
                    <i data-lucide="${item.icon || 'cpu'}"></i>
                </div>
                <div class="node-body">
                    <div class="node-name">${loc(item, 'name')}</div>
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
        const lang = getLang();
        const ship = DATA.SHIPS[state.shipId];
        const shipName = loc(ship, 'name');
        const colW = document.getElementById('colWeapons');
        const colT = document.getElementById('colTrinkets');
        const colE = document.getElementById('colEvolutions');
        const colM = document.getElementById('colMegaEvolutions');

        const allWeapons = Object.values(DATA.WEAPONS).filter(getVisibleFilter);
        const sigWeapons = allWeapons.filter(w => w.scope === 'signature');
        const uniWeapons = allWeapons.filter(w => w.scope !== 'signature');

        const sigWeapSuffix = lang === 'en' ? ' Signature' : ' İmza Silahı';
        const starterSuffix = lang === 'en' ? ' Starter' : ' Başlangıç';
        const megaTargetSuffix = lang === 'en' ? ' Mega Target' : ' Mega Hedefi';

        colW.innerHTML = `
            <div class="tree-col-head">${t('tree.colWeapons', '1 · KÖK & EVRENSEL SİLAHLAR', '1 · ROOT & UNIVERSAL WEAPONS')}</div>
            <div class="tree-col-divider">${t('tree.divSigWeapons', 'İmza Silahları', 'Signature Weapons')}</div>
            ${sigWeapons.map(w => buildNodeHtml(w, w.id === ship.sigWeapon ? `${shipName}${sigWeapSuffix}` : '')).join('')}
            <div class="tree-col-divider">${t('tree.divUniWeapons', 'Evrensel Havuz (6)', 'Universal Pool (6)')}</div>
            ${uniWeapons.map(w => buildNodeHtml(w, w.id === ship.starterWeapon ? `${shipName}${starterSuffix}` : '')).join('')}
        `;

        const allTrinkets = Object.values(DATA.TRINKETS).filter(getVisibleFilter);
        const sigTrinkets = allTrinkets.filter(tMod => tMod.scope === 'signature');
        const uniTrinkets = allTrinkets.filter(tMod => tMod.scope !== 'signature');

        colT.innerHTML = `
            <div class="tree-col-head">${t('tree.colTrinkets', '2 · DESTEK MODÜLLERİ (TRİNKET)', '2 · SUPPORT MODULES (TRINKETS)')}</div>
            <div class="tree-col-divider">${t('tree.divSigTrinkets', 'İmza Katalizörleri', 'Signature Catalysts')}</div>
            ${sigTrinkets.map(tMod => buildNodeHtml(tMod)).join('')}
            <div class="tree-col-divider">${t('tree.divUniTrinkets', 'Evrensel Modüller (6)', 'Universal Modules (6)')}</div>
            ${uniTrinkets.map(tMod => buildNodeHtml(tMod)).join('')}
        `;

        const allEvos = Object.values(DATA.EVOLUTIONS).filter(getVisibleFilter);
        const sigEvos = allEvos.filter(e => e.scope === 'signature');
        const uniEvos = allEvos.filter(e => e.scope !== 'signature');

        colE.innerHTML = `
            <div class="tree-col-head">${t('tree.colEvos', '3 · EVRİMLER (LV.5 SENTEZ)', '3 · EVOLUTIONS (LV.5 SYNTHESIS)')}</div>
            <div class="tree-col-divider">${t('tree.divSigEvos', 'Gemi İmza Evrimi', 'Ship Signature Evolution')}</div>
            ${sigEvos.map(e => buildNodeHtml(e)).join('')}
            <div class="tree-col-divider">${t('tree.divUniEvos', 'Çapraz Evrim Matrisi (11)', 'Cross-Evolution Matrix (11)')}</div>
            ${uniEvos.map(e => buildNodeHtml(e)).join('')}
        `;

        const megas = Object.values(DATA.SUPER_EVOLUTIONS).filter(getVisibleFilter);
        colM.innerHTML = `
            <div class="tree-col-head">${t('tree.colMegas', '4 · MEGA EVRİMLER (SUPER)', '4 · MEGA EVOLUTIONS (SUPER)')}</div>
            <div class="tree-col-divider">${t('tree.divMegas', 'Çift Evrim Birleşimi (+1 Slot)', 'Dual Evolution Fusion (+1 Slot)')}</div>
            ${megas.map(m => buildNodeHtml(m, (ship && ship.sigMega === m.id) ? `${shipName}${megaTargetSuffix}` : '')).join('')}
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

        applySearchHighlights();
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
        if (!mod) return;
        const lang = getLang();
        const isEn = lang === 'en';
        const scopeBadge = document.getElementById('inspectorScopeBadge');
        const tierBadge = document.getElementById('inspectorTierBadge');
        const titleEl = document.getElementById('inspectorTitle');
        const descEl = document.getElementById('inspectorDesc');
        const statsGrid = document.getElementById('inspectorStatsGrid');
        const formulaBox = document.getElementById('inspectorFormulaBox');

        if (scopeBadge) {
            scopeBadge.textContent = mod.shipExclusive
                ? `${loc(DATA.SHIPS[mod.shipExclusive], 'name').toUpperCase()} ${isEn ? 'SIGNATURE' : 'İMZA'}`
                : (isEn ? 'UNIVERSAL MODULE' : 'EVRENSEL MODÜL');
        }
        if (tierBadge) {
            tierBadge.textContent = mod.tier || (mod.kind === 'trinket' ? (isEn ? 'SUPPORT' : 'DESTEK') : (isEn ? 'ROOT' : 'KÖK'));
        }
        if (titleEl) titleEl.textContent = loc(mod, 'name');
        if (descEl) descEl.textContent = loc(mod, 'desc');

        if (statsGrid) {
            const s = mod.stats || {};
            if (mod.kind === 'trinket') {
                statsGrid.innerHTML = `
                    <div class="inspector-stat-cell" style="grid-column:1/-1;">
                        <span>${isEn ? 'Bonus Effect' : 'Kazanım Etkisi'}</span>
                        <strong style="color:var(--accent-mint);">${loc(mod, 'statLabel')}</strong>
                    </div>
                `;
            } else {
                statsGrid.innerHTML = `
                    <div class="inspector-stat-cell">
                        <span>${isEn ? 'Estimated DPS' : 'Tahmini DPS'}</span>
                        <strong style="color:var(--accent-sky);">${s.dps || 120} DPS</strong>
                    </div>
                    <div class="inspector-stat-cell">
                        <span>${isEn ? 'Base Dmg / CD' : 'Taban Hasar / CD'}</span>
                        <strong>${s.baseDmg || 35} · ${s.cd ? s.cd + 's' : (isEn ? 'Passive' : 'Pasif')}</strong>
                    </div>
                `;
            }
        }

        if (formulaBox) {
            const items = [];
            const jumpBtn = (target, colorCss = '') => {
                if (!target) return '';
                const styleColor = colorCss ? `color:${colorCss};` : '';
                return `<button type="button" class="cs-btn cs-btn-ghost jump-node-btn" style="padding:2px 6px;font-size:11.5px;${styleColor}" data-jump="${target.id}">${loc(target, 'name')}</button>`;
            };

            if (mod.kind === 'weapon') {
                if (mod.pairTrinket && mod.evoId) {
                    const tMod = DATA.TRINKETS[mod.pairTrinket];
                    const eMod = DATA.EVOLUTIONS[mod.evoId];
                    items.push(`<strong>${isEn ? 'Primary Synthesis' : 'Ana Sentez'}:</strong> ${loc(mod, 'name')} + ${jumpBtn(tMod)} → ${jumpBtn(eMod, 'var(--accent-sky)')}`);
                }
                if (mod.altTrinket && mod.altEvoId) {
                    const t2 = DATA.TRINKETS[mod.altTrinket];
                    const e2 = DATA.EVOLUTIONS[mod.altEvoId];
                    items.push(`<strong>${isEn ? 'Cross Branch' : 'Çapraz Dal'}:</strong> ${loc(mod, 'name')} + ${jumpBtn(t2)} → ${jumpBtn(e2, 'var(--accent-mint)')}`);
                }
            } else if (mod.kind === 'trinket') {
                const pw = DATA.WEAPONS[mod.pairWeapon];
                const pe = DATA.EVOLUTIONS[mod.evoId];
                if (pw && pe) {
                    items.push(`<strong>${isEn ? 'Primary Evolution' : 'Birincil Evrim'}:</strong> ${jumpBtn(pw)} + ${loc(mod, 'name')} → ${jumpBtn(pe, 'var(--accent-sky)')}`);
                }
                if (mod.altWeapon && mod.altEvoId) {
                    const aw = DATA.WEAPONS[mod.altWeapon];
                    const ae = DATA.EVOLUTIONS[mod.altEvoId];
                    items.push(`<strong>${isEn ? 'Cross Link' : 'Çapraz Bağ'}:</strong> ${jumpBtn(aw)} → ${jumpBtn(ae, 'var(--accent-mint)')}`);
                }
            } else if (mod.kind === 'evolution') {
                const wMod = DATA.WEAPONS[mod.weaponReq];
                const tMod = DATA.TRINKETS[mod.trinketReq];
                items.push(`<strong>${isEn ? 'Synthesis Recipe' : 'Sentez Reçetesi'}:</strong> ${jumpBtn(wMod)} + ${jumpBtn(tMod)}`);
                const nextMegas = Object.values(DATA.SUPER_EVOLUTIONS).filter(m => (m.evoPool || []).includes(mod.id));
                if (nextMegas.length) {
                    items.push(`<strong>${isEn ? 'Mega Upgrade' : 'Mega Yükseltme'}:</strong> ${nextMegas.map(m => jumpBtn(m, 'var(--accent-amber)')).join(' ')}`);
                }
            } else if (mod.kind === 'superEvolution') {
                const reqBtns = (mod.evoReqs || []).map(eid => jumpBtn(DATA.EVOLUTIONS[eid], 'var(--accent-sky)')).filter(Boolean).join(' + ');
                items.push(`<strong>${isEn ? 'Mega Core' : 'Mega Çekirdek'}:</strong> ${reqBtns}`);
                items.push(`<span style="font-size:12px;color:var(--accent-mint);">${isEn ? 'Two evolutions merge into one Mega slot (+1 Weapon Slot freed).' : 'İki evrim tek Mega slotta birleşir (+1 Silah Slotu açılır).'}</span>`);
            }

            formulaBox.innerHTML = items.join('<div style="height:4px;"></div>');
            formulaBox.querySelectorAll('.jump-node-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    playUiSound('uiClick');
                    jumpAndFocusModule(btn.dataset.jump, false);
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

        const prevW = wSel.value;
        const prevT = tSel.value;
        const isEn = getLang() === 'en';
        const uniSuffix = isEn ? ' · Universal' : ' · Evrensel';

        wSel.innerHTML = Object.values(DATA.WEAPONS).map(w => {
            const tag = w.shipExclusive ? ` · ${DATA.SHIPS[w.shipExclusive].codeName}` : uniSuffix;
            return `<option value="${w.id}">${loc(w, 'name')}${tag}</option>`;
        }).join('');

        tSel.innerHTML = Object.values(DATA.TRINKETS).map(tMod => {
            const tag = tMod.shipExclusive ? ` · ${DATA.SHIPS[tMod.shipExclusive].codeName}` : uniSuffix;
            return `<option value="${tMod.id}">${loc(tMod, 'name')}${tag}</option>`;
        }).join('');

        if (prevW && DATA.WEAPONS[prevW]) wSel.value = prevW;
        if (prevT && DATA.TRINKETS[prevT]) tSel.value = prevT;

        const evaluate = () => {
            const enNow = getLang() === 'en';
            const evo = DATA.findEvolutionForPair(wSel.value, tSel.value);
            if (evo) {
                outEl.innerHTML = `
                    <div style="color:var(--accent-mint);font-weight:600;margin-bottom:0.2rem;">${enNow ? 'Synthesis Match' : 'Sentez Başarılı'}: ${loc(evo, 'name')}</div>
                    <div style="font-size:12px;color:var(--text-secondary);">${loc(evo, 'formula')}</div>
                    <button type="button" class="cs-btn cs-btn-primary" id="synthFocusBtn" style="margin-top:0.5rem;width:100%;padding:0.42rem;font-size:12.5px;">
                        ${enNow ? 'Show in Tree' : 'Ağaçta Göster'}
                    </button>
                `;
                const btn = document.getElementById('synthFocusBtn');
                if (btn) {
                    btn.addEventListener('click', () => {
                        jumpAndFocusModule(evo.id, true);
                    });
                }
            } else {
                const wObj = DATA.WEAPONS[wSel.value];
                const expectedT = wObj && wObj.pairTrinket ? DATA.TRINKETS[wObj.pairTrinket] : null;
                outEl.innerHTML = `
                    <div style="color:var(--text-secondary);font-weight:500;">${enNow ? 'No direct evolution match.' : 'Doğrudan evrim eşleşmesi yok.'}</div>
                    ${expectedT ? `<div style="font-size:12px;color:var(--accent-sky);margin-top:0.2rem;">${enNow ? 'Hint' : 'İpucu'}: ${loc(wObj, 'name')} + ${loc(expectedT, 'name')}</div>` : ''}
                `;
            }
        };

        if (!wSel.dataset.bound) {
            wSel.dataset.bound = '1';
            wSel.addEventListener('change', evaluate);
            tSel.addEventListener('change', evaluate);
        }
        evaluate();
    }

    // -------------------------------------------------------------------------
    // Fuse.js Fuzzy Blueprint Search & Panzoom Viewport Jump
    // -------------------------------------------------------------------------
    function buildSearchRecords() {
        const modules = typeof DATA.getAllModules === 'function'
            ? DATA.getAllModules()
            : [
                ...Object.values(DATA.WEAPONS),
                ...Object.values(DATA.TRINKETS),
                ...Object.values(DATA.EVOLUTIONS),
                ...Object.values(DATA.SUPER_EVOLUTIONS)
            ];

        return modules.map(mod => {
            const ship = mod.shipExclusive ? DATA.SHIPS[mod.shipExclusive] : null;
            return {
                id: mod.id,
                kind: mod.kind,
                shipExclusive: mod.shipExclusive || null,
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
                tier: mod.tier || '',
                icon: mod.icon || 'cpu',
                color: mod.color || '#38bdf8',
                mod
            };
        });
    }

    function buildFuseSearchIndex() {
        const records = buildSearchRecords();
        state.searchRecords = records;
        if (typeof global.Fuse === 'function') {
            state.fuse = new global.Fuse(records, {
                keys: [
                    { name: 'name', weight: 2.2 },
                    { name: 'nameEn', weight: 2.2 },
                    { name: 'id', weight: 1.5 },
                    { name: 'shipName', weight: 1.1 },
                    { name: 'shipNameEn', weight: 1.1 },
                    { name: 'formula', weight: 0.9 },
                    { name: 'formulaEn', weight: 0.9 },
                    { name: 'statLabel', weight: 0.8 },
                    { name: 'statLabelEn', weight: 0.8 },
                    { name: 'desc', weight: 0.5 },
                    { name: 'descEn', weight: 0.5 }
                ],
                threshold: 0.36,
                ignoreLocation: true,
                includeScore: true,
                minMatchCharLength: 2
            });
        } else {
            state.fuse = null;
        }
    }

    function runTreeFuzzySearch(query) {
        const q = String(query || '').trim();
        if (!q) return [];
        if (state.fuse) {
            return state.fuse.search(q).map(hit => hit.item);
        }
        const low = q.toLowerCase();
        return (state.searchRecords || []).filter(r =>
            r.name.toLowerCase().includes(low) ||
            r.nameEn.toLowerCase().includes(low) ||
            r.id.toLowerCase().includes(low) ||
            r.desc.toLowerCase().includes(low) ||
            r.descEn.toLowerCase().includes(low)
        );
    }

    function applySearchHighlights() {
        const hasQuery = Boolean(state.searchQuery && state.searchQuery.trim());
        document.querySelectorAll('.tree-node').forEach(el => {
            if (!hasQuery) {
                el.classList.remove('is-search-match', 'is-search-dim');
                return;
            }
            const matched = state.searchMatches.has(el.dataset.nodeId);
            el.classList.toggle('is-search-match', matched);
            el.classList.toggle('is-search-dim', !matched);
        });
    }

    function focusNodeInViewport(nodeId) {
        const viewport = document.getElementById('treeViewport');
        const stage = document.getElementById('treeCanvas');
        if (!viewport || !stage || !state.panzoom) return;
        const nodeEl = stage.querySelector(`.tree-node[data-node-id="${nodeId}"]`);
        if (!nodeEl) return;

        const vpRect = viewport.getBoundingClientRect();
        const nodeRect = nodeEl.getBoundingClientRect();
        const scale = (typeof state.panzoom.getScale === 'function' ? state.panzoom.getScale() : state.scale) || 1;
        const pan = typeof state.panzoom.getPan === 'function' ? state.panzoom.getPan() : { x: 0, y: 0 };

        const targetX = vpRect.left + vpRect.width * 0.5;
        const targetY = vpRect.top + vpRect.height * 0.54;
        const nodeCenterX = nodeRect.left + nodeRect.width * 0.5;
        const nodeCenterY = nodeRect.top + nodeRect.height * 0.5;

        const dx = (targetX - nodeCenterX) / scale;
        const dy = (targetY - nodeCenterY) / scale;
        state.panzoom.pan(pan.x + dx, pan.y + dy, { animate: true });
    }

    function jumpAndFocusModule(nodeId, switchShipInsteadOfAll = true) {
        const target = getModuleById(nodeId);
        if (!target) return;

        let reRendered = false;
        if (target.shipExclusive && target.shipExclusive !== state.shipId && !state.showAllSignatures) {
            if (switchShipInsteadOfAll) {
                state.shipId = target.shipExclusive;
            } else {
                state.showAllSignatures = true;
            }
            reRendered = true;
        }

        if (reRendered) {
            renderShipSelector();
            renderTreeColumns();
        }

        selectNode(nodeId);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => focusNodeInViewport(nodeId));
        });
    }

    function getKindLabel(kind) {
        const isEn = getLang() === 'en';
        switch (kind) {
            case 'weapon': return isEn ? 'Weapon' : 'Silah';
            case 'trinket': return isEn ? 'Trinket' : 'Destek';
            case 'evolution': return isEn ? 'Evolution' : 'Evrim';
            case 'superEvolution': return isEn ? 'Mega Evo' : 'Mega Evrim';
            default: return kind;
        }
    }

    function renderTreeSearchDropdown(matches) {
        const resultsEl = document.getElementById('treeSearchResults');
        const countEl = document.getElementById('treeSearchCount');
        const clearEl = document.getElementById('treeSearchClearBtn');
        const hasQuery = Boolean(state.searchQuery && state.searchQuery.trim());

        if (countEl) {
            countEl.hidden = !hasQuery;
            countEl.textContent = String(matches.length);
        }
        if (clearEl) {
            clearEl.hidden = !hasQuery;
        }
        if (!resultsEl) return;

        if (!hasQuery) {
            resultsEl.hidden = true;
            resultsEl.innerHTML = '';
            return;
        }

        const top = matches.slice(0, 10);
        if (state.activeResultIndex >= top.length) state.activeResultIndex = 0;

        if (!top.length) {
            resultsEl.innerHTML = `<div class="tree-search-empty">${t('tree.searchEmpty', 'Eşleşen modül bulunamadı.', 'No matching modules found.')}</div>`;
            resultsEl.hidden = false;
            return;
        }

        resultsEl.innerHTML = top.map((rec, idx) => {
            const mod = rec.mod;
            const scopeText = rec.shipExclusive
                ? loc(DATA.SHIPS[rec.shipExclusive], 'name')
                : (getLang() === 'en' ? 'Universal' : 'Evrensel');
            return `
                <button type="button" class="tree-search-item ${idx === state.activeResultIndex ? 'is-active' : ''}" data-result-id="${rec.id}" role="option">
                    <span class="tree-search-item-icon" style="color:${rec.color};">
                        <i data-lucide="${rec.icon}"></i>
                    </span>
                    <span class="tree-search-item-body">
                        <div class="tree-search-item-title">${loc(mod, 'name')}</div>
                        <div class="tree-search-item-sub">${getKindLabel(rec.kind)} · ${scopeText}${rec.tier ? ` · ${rec.tier}` : ''}</div>
                    </span>
                </button>
            `;
        }).join('');

        resultsEl.hidden = false;
        refreshIcons();

        resultsEl.querySelectorAll('.tree-search-item').forEach(btn => {
            btn.addEventListener('click', () => {
                playUiSound('uiClick');
                const id = btn.dataset.resultId;
                resultsEl.hidden = true;
                jumpAndFocusModule(id, true);
            });
        });
    }

    function setupTreeSearch() {
        const input = document.getElementById('treeSearchInput');
        const clearBtn = document.getElementById('treeSearchClearBtn');
        const resultsEl = document.getElementById('treeSearchResults');
        const searchWrap = input ? input.closest('.tree-search-wrap') : null;
        if (!input) return;

        let lastMatches = [];

        const handleInput = () => {
            state.searchQuery = input.value;
            state.activeResultIndex = 0;
            lastMatches = runTreeFuzzySearch(state.searchQuery);
            state.searchMatches = new Set(lastMatches.map(m => m.id));
            applySearchHighlights();
            renderTreeSearchDropdown(lastMatches);
        };

        input.addEventListener('input', handleInput);
        input.addEventListener('focus', () => {
            if (state.searchQuery.trim()) {
                lastMatches = runTreeFuzzySearch(state.searchQuery);
                renderTreeSearchDropdown(lastMatches);
            }
        });

        input.addEventListener('keydown', e => {
            if (!lastMatches.length) {
                if (e.key === 'Escape') {
                    input.value = '';
                    handleInput();
                    input.blur();
                }
                return;
            }
            const visibleCount = Math.min(lastMatches.length, 10);
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                state.activeResultIndex = (state.activeResultIndex + 1) % visibleCount;
                renderTreeSearchDropdown(lastMatches);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                state.activeResultIndex = (state.activeResultIndex - 1 + visibleCount) % visibleCount;
                renderTreeSearchDropdown(lastMatches);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const chosen = lastMatches[state.activeResultIndex] || lastMatches[0];
                if (chosen) {
                    playUiSound('uiClick');
                    if (resultsEl) resultsEl.hidden = true;
                    jumpAndFocusModule(chosen.id, true);
                }
            } else if (e.key === 'Escape') {
                if (resultsEl && !resultsEl.hidden) {
                    resultsEl.hidden = true;
                } else {
                    input.value = '';
                    handleInput();
                }
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                playUiSound('uiClick');
                input.value = '';
                state.searchQuery = '';
                state.searchMatches = new Set();
                lastMatches = [];
                applySearchHighlights();
                renderTreeSearchDropdown([]);
                input.focus();
            });
        }

        document.addEventListener('click', e => {
            if (resultsEl && searchWrap && !searchWrap.contains(e.target)) {
                resultsEl.hidden = true;
            }
        });

        state.refreshSearchDropdown = () => {
            if (state.searchQuery.trim()) {
                lastMatches = runTreeFuzzySearch(state.searchQuery);
                state.searchMatches = new Set(lastMatches.map(m => m.id));
                applySearchHighlights();
                renderTreeSearchDropdown(lastMatches);
            }
        };
    }

    function onLanguageChange() {
        registerI18n();
        syncAudioHeaderUi();
        const creditsEl = document.getElementById('creditsDisplay');
        if (creditsEl) {
            const profile = PERSIST.load();
            creditsEl.textContent = profile.credits.toLocaleString(getLang() === 'en' ? 'en-US' : 'tr-TR');
        }
        renderShipSelector();
        renderTreeColumns();
        setupQuickSynthCalculator();
        selectNode(state.selectedNodeId);
        if (typeof state.refreshSearchDropdown === 'function' && document.getElementById('treeSearchResults') && !document.getElementById('treeSearchResults').hidden) {
            state.refreshSearchDropdown();
        }
        refreshIcons();
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
                if (event.target && event.target.closest('.tree-toolbar')) return;
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
        registerI18n();
        parseUrlParams();
        buildFuseSearchIndex();
        setupHeader();
        renderShipSelector();
        renderTreeColumns();
        setupQuickSynthCalculator();
        setupPanzoom();
        setupTreeSearch();
        selectNode(state.selectedNodeId);
        startHoloPreview();
        refreshIcons();
        global.addEventListener('cosmic:langchange', onLanguageChange);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
