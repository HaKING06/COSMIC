// =============================================================================
// COSMIC UNIVERSE v11.0 — UNIVERSAL 50-GAME ARCADE PLAYER SHELL (js/arcadePlayer.js)
// Mounts Three.js 3D, PixiJS v8, Matter.js, WebAssembly, TypeScript, GLSL & Pixel engines.
// =============================================================================
(function (global) {
    'use strict';

    const SPRITE_KEYS = [
        'fighter', 'astronaut', 'ufo', 'asteroid',
        'warp_ring', 'laser_turret', 'cryo_crystal', 'energy_prism',
        'alien_drone', 'plasma_bomb', 'cargo_crate', 'portal_vortex',
        'coin_star', 'boss_core', 'moon_lander', 'shield_battery'
    ];

    const state = {
        gameId: 'nova-flappy-rift',
        meta: null,
        indexNum: 1,
        chapterId: null,
        chapterMeta: null,
        initialLevel: 1,
        currentLevel: 1,
        currentScore: 0,
        paused: false,
        ended: false,
        sprites: {},
        wasmBridge: null,
        controller: null,
        chapterAwarded: false
    };

    const COPY = {
        tr: {
            portalBtn: 'Portal (50 Oyun)',
            storyBtn: 'Hikâye Haritası',
            pause: 'Duraklat [P]',
            resume: 'Devam Et [P]',
            restart: 'Yeniden [R]',
            fullscreen: 'Tam Ekran',
            random: 'Rastgele',
            audioOn: 'Ses Açık',
            audioOff: 'Sessiz',
            score: 'SKOR',
            best: 'EN İYİ',
            level: 'SEVİYE',
            lives: 'CAN / ENERJİ',
            objective: 'DURUM / GÖREV',
            levels: 'SEVİYELER:',
            controls: 'KONTROLLER',
            mech: 'HEDEF & MEKANİK',
            related: 'Benzer Kozmik Dünyalar',
            viewAll: 'Tüm 50 Oyunu Gör',
            flagshipBadge: 'ANA OYUN · PIXIJS V8 ROGUELIKE',
            flagshipTitle: 'Cosmic Survivors v11.0 — Tam Ölçek Uzay Arenası',
            flagshipDesc: '8 yıldız gemisi, 4 adet 5600×5600 engelli arena, çok katmanlı Mega Evrim ağacı ve 5 operasyon moduyla tam sürüm hayatta kalma savaşına geçin.',
            launchHangar: 'Komuta Hangarını Aç',
            launchInstant: 'Hemen Arenaya Atla',
            launchBossRush: 'Boss Arenası (Hızlı)',
            missionEyebrow: (ch) => `BÖLÜM ${ch} HİKÂYE GÖREVİ · KAPTAN NOVA VEX`,
            missionActive: 'DEVAM EDİYOR',
            missionDone: 'HEDEF TAMAMLANDI ✓',
            winBadge: 'OPERASYON BAŞARILI',
            winTitle: 'Görev Tamamlandı!',
            loseBadge: 'OTURUM SONA ERDİ',
            loseTitle: 'Uçuş Sonlandırıldı',
            pauseBadge: 'DURAKLATILDI',
            pauseTitle: 'Sistem Beklemede',
            pauseDesc: 'Devam etmek için [P] tuşuna veya Devam Et düğmesine basın.',
            playAgain: 'Tekrar Oyna',
            resumeBtn: 'Devam Et',
            nextLevel: 'Sonraki Seviye',
            storyNext: (id) => id < 8 ? `Bölüm ${id + 1}'e Geç` : 'Hikâyeye Dön',
            chapterClearedMsg: (id) => `Bölüm ${id} başarıyla tamamlandı ve hikâye kilidi açıldı!`,
            ovScore: 'Skor',
            ovBest: 'Rekor',
            ovCreds: 'Ödül',
            readyStatus: 'Hazır'
        },
        en: {
            portalBtn: 'Portal (50 Games)',
            storyBtn: 'Story Map',
            pause: 'Pause [P]',
            resume: 'Resume [P]',
            restart: 'Restart [R]',
            fullscreen: 'Fullscreen',
            random: 'Random',
            audioOn: 'Audio On',
            audioOff: 'Muted',
            score: 'SCORE',
            best: 'BEST',
            level: 'LEVEL',
            lives: 'HULL / LIVES',
            objective: 'STATUS / MISSION',
            levels: 'LEVELS:',
            controls: 'CONTROLS',
            mech: 'OBJECTIVE & MECHANICS',
            related: 'Similar Cosmic Worlds',
            viewAll: 'View All 50 Games',
            flagshipBadge: 'FLAGSHIP TITLE · PIXIJS V8 ROGUELIKE',
            flagshipTitle: 'Cosmic Survivors v11.0 — Full Space Survival Arena',
            flagshipDesc: 'Command 8 starships across four 5600×5600 cover arenas, multi-tier Mega Evolutions, and 5 operation modes in the full flagship arena.',
            launchHangar: 'Open Command Hangar',
            launchInstant: 'Deploy Now',
            launchBossRush: 'Play Boss Gauntlet',
            missionEyebrow: (ch) => `CHAPTER ${ch} STORY MISSION · CAPTAIN NOVA VEX`,
            missionActive: 'IN PROGRESS',
            missionDone: 'TARGET ACHIEVED ✓',
            winBadge: 'MISSION ACCOMPLISHED',
            winTitle: 'Sector Cleared!',
            loseBadge: 'RUN ENDED',
            loseTitle: 'Sortie Terminated',
            pauseBadge: 'PAUSED',
            pauseTitle: 'Systems on Standby',
            pauseDesc: 'Press [P] or click Resume to continue playing.',
            playAgain: 'Play Again',
            resumeBtn: 'Resume',
            nextLevel: 'Next Level',
            storyNext: (id) => id < 8 ? `Continue to Ch.${id + 1}` : 'Return to Story',
            chapterClearedMsg: (id) => `Chapter ${id} cleared! Next Story Universe unlocked.`,
            ovScore: 'Score',
            ovBest: 'Best',
            ovCreds: 'Reward',
            readyStatus: 'Ready'
        }
    };

    function getLang() {
        return (global.CosmicI18n && global.CosmicI18n.getLang()) || 'tr';
    }

    function t(tr, en) {
        return getLang() === 'en' ? en : tr;
    }

    function copy() {
        return COPY[getLang()] || COPY.tr;
    }

    function formatStars(count) {
        const n = Math.min(3, Math.max(0, Number(count) || 0));
        return '★'.repeat(n) + '☆'.repeat(3 - n);
    }

    function refreshIcons() {
        if (global.lucide && typeof global.lucide.createIcons === 'function') {
            global.lucide.createIcons();
        }
    }

    function asset(rel) {
        const base = (typeof global.COSMIC_BASE === 'string') ? global.COSMIC_BASE : '';
        return base + rel;
    }

    function preloadSprites() {
        return new Promise((resolve) => {
            const entries = SPRITE_KEYS.map(k => [k, asset(`assets/v11/sprites/${k}.png`)]);
            entries.push(['nova_avatar', asset('assets/v11/nova_avatar.png')]);
            let left = entries.length;
            const done = () => {
                left--;
                if (left <= 0) resolve(state.sprites);
            };
            entries.forEach(([key, src]) => {
                const img = new Image();
                img.onload = () => { state.sprites[key] = img; done(); };
                img.onerror = done;
                img.src = src;
            });
        });
    }

    function updateCreditsPill() {
        const el = document.getElementById('creditsDisplay');
        if (!el || !global.CosmicPersistence) return;
        const prof = global.CosmicPersistence.load();
        el.textContent = Number(prof.credits || 0).toLocaleString(getLang() === 'en' ? 'en-US' : 'tr-TR');
    }

    function setupAudioControl() {
        const btn = document.getElementById('audioToggleBtn');
        const label = document.getElementById('audioToggleLabel');
        const icon = document.getElementById('audioToggleIcon');
        if (!btn) return;
        const sync = () => {
            const muted = Boolean(global.CosmicAudio && global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            btn.classList.toggle('is-muted', muted);
            if (icon) icon.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
            if (label) label.textContent = muted ? copy().audioOff : copy().audioOn;
        };
        sync();
        btn.addEventListener('click', () => {
            if (!global.CosmicAudio) return;
            global.CosmicAudio.unlock();
            const cur = Boolean(global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            global.CosmicAudio.setMuted(!cur);
            sync();
            refreshIcons();
            if (cur) global.CosmicAudio.play('uiClick');
        });
    }

    function syncStaticChrome() {
        const c = copy();
        const lang = getLang();
        const meta = state.meta;
        document.documentElement.lang = lang;

        const map = {
            backPortalLabel: c.portalBtn,
            backStoryLabel: c.storyBtn,
            btnPauseLabel: state.paused ? c.resume : c.pause,
            btnRestartLabel: c.restart,
            btnFullscreenLabel: c.fullscreen,
            btnRandomLabel: c.random,
            lblHudScore: c.score,
            lblHudBest: c.best,
            lblHudLevel: c.level,
            lblHudLives: c.lives,
            lblHudObjective: c.objective,
            levelBarLabel: c.levels,
            lblControlsHead: c.controls,
            lblObjectiveHead: c.mech,
            relatedGamesTitle: c.related,
            relatedViewAllText: c.viewAll
        };
        Object.entries(map).forEach(([id, txt]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
        });

        const pauseIcon = document.getElementById('pauseIcon');
        if (pauseIcon) pauseIcon.setAttribute('data-lucide', state.paused ? 'play' : 'pause');

        if (meta) {
            const titleStr = meta.title[lang] || meta.title.tr;
            document.title = `${titleStr} — COSMIC UNIVERSE v11.0`;
            document.getElementById('gameTitleHeading').textContent = titleStr;
            document.getElementById('gameTaglineText').textContent = meta.tagline[lang] || meta.tagline.tr;
            document.getElementById('valControlsText').textContent = meta.controls[lang] || meta.controls.tr;
            document.getElementById('valObjectiveText').textContent = meta.objective[lang] || meta.objective.tr;
            document.getElementById('gameIndexBadge').textContent = `#${String(state.indexNum).padStart(2, '0')}`;
            document.getElementById('gameEngineBadge').textContent = meta.engine;
            document.getElementById('gameLangBadge').textContent = meta.lang;
            const thumb = document.getElementById('gameSpriteThumb');
            if (thumb) {
                thumb.onerror = () => { thumb.src = asset(`assets/v11/sprites/${meta.sprite}.png`); };
                thumb.src = asset(`assets/v11/thumbs/${meta.id}.png`);
            }
            const novaAvatar = document.querySelector('#storyMissionBanner .mission-nova-avatar');
            if (novaAvatar) novaAvatar.src = asset('assets/v11/nova_avatar.png');
        }

        if (state.chapterMeta) {
            const ch = state.chapterMeta;
            document.getElementById('storyMissionBanner').classList.remove('hidden');
            document.getElementById('backStoryLink').classList.remove('hidden');
            document.getElementById('gameChapterBadge').classList.remove('hidden');
            document.getElementById('gameChapterBadge').textContent = lang === 'en' ? `STORY CH.${ch.id}` : `HİKÂYE BÖL.${ch.id}`;
            document.getElementById('storyMissionTitle').textContent = c.missionEyebrow(ch.id);
            const targetDesc = ch.targetType === 'score'
                ? (lang === 'en' ? `Target: Reach ${ch.targetValue} points` : `Hedef: ${ch.targetValue} puana ulaş`)
                : (lang === 'en' ? `Target: Clear Level ${ch.targetValue}` : `Hedef: Seviye ${ch.targetValue}'i tamamla`);
            document.getElementById('storyMissionObjective').textContent = `${ch.title[lang]} — ${targetDesc}`;
            document.getElementById('storyMissionStatus').textContent = state.chapterAwarded ? c.missionDone : c.missionActive;
        }

        const audioLabel = document.getElementById('audioToggleLabel');
        if (audioLabel) {
            const muted = Boolean(global.CosmicAudio && global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            audioLabel.textContent = muted ? c.audioOff : c.audioOn;
        }

        if (global.CosmicI18n && typeof global.CosmicI18n.applyTranslations === 'function') {
            global.CosmicI18n.applyTranslations();
        }
        renderLevelPills();
        renderRelatedGames();
        refreshIcons();
    }

    function renderLevelPills() {
        const bar = document.getElementById('levelSelectorBar');
        const wrap = document.getElementById('levelPillsWrap');
        if (!bar || !wrap || !state.meta) return;
        if (!state.meta.hasLevels || (state.meta.maxLevel || 1) <= 1) {
            bar.classList.add('hidden');
            return;
        }
        bar.classList.remove('hidden');
        const rec = global.CosmicArcadeStore ? global.CosmicArcadeStore.getGameStats(state.gameId) : { bestLevel: 0 };
        wrap.innerHTML = '';
        for (let lv = 1; lv <= state.meta.maxLevel; lv++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'level-pill-btn' + (lv === state.currentLevel ? ' active' : '') + (lv <= (rec.bestLevel || 0) ? ' cleared' : '');
            btn.textContent = String(lv);
            btn.addEventListener('click', () => {
                if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
                jumpToLevel(lv);
            });
            wrap.appendChild(btn);
        }
    }

    function renderRelatedGames() {
        const grid = document.getElementById('relatedGamesGrid');
        if (!grid || !state.meta || !global.COSMIC_ARCADE_GAMES) return;
        const lang = getLang();
        const others = global.COSMIC_ARCADE_GAMES.filter(g => g.id !== state.gameId && (g.category === state.meta.category || g.engine === state.meta.engine));
        const picks = others.slice(0, 4);
        grid.innerHTML = picks.map(g => `
            <a href="${g.isFlagship ? asset('hangar.html') : asset(`games/${encodeURIComponent(g.id)}/index.html`)}" class="related-card">
                <img src="${asset(`assets/v11/thumbs/${g.id}.png`)}" onerror="this.src='${asset(`assets/v11/sprites/${g.sprite}.png`)}'" alt="">
                <div class="related-card-info">
                    <div class="related-card-name">${g.title[lang] || g.title.tr}</div>
                    <div class="related-card-meta">${g.engine} · ${g.lang}</div>
                </div>
            </a>
        `).join('');
    }

    function pickRandomGameUrl() {
        const list = (global.COSMIC_ARCADE_GAMES || []).filter(g => !g.isFlagship && g.id !== state.gameId);
        if (!list.length) return asset('index.html');
        const pick = list[Math.floor(Math.random() * list.length)];
        return asset(`games/${encodeURIComponent(pick.id)}/index.html`);
    }

    function checkStoryCompletion(score, level, explicitWin) {
        if (!state.chapterMeta || state.chapterAwarded || !global.CosmicStoryStore) return false;
        const ch = state.chapterMeta;
        const met = ch.targetType === 'score'
            ? (Number(score) >= ch.targetValue)
            : (explicitWin ? Number(level) >= ch.targetValue : Number(level) > ch.targetValue);
        if (!met) return false;

        state.chapterAwarded = true;
        const stars = Math.min(3, Math.max(1, Number(score) >= ch.targetValue * 2 ? 3 : 2));
        global.CosmicStoryStore.completeChapter(ch.id, stars, Math.floor(Number(score) || 0));
        const stEl = document.getElementById('storyMissionStatus');
        if (stEl) stEl.textContent = copy().missionDone;
        updateCreditsPill();
        if (typeof global.confetti === 'function') {
            global.confetti({ particleCount: 70, spread: 68, origin: { y: 0.65 } });
        }
        return true;
    }

    function showRunOverlay(isWin, payload) {
        const c = copy();
        const ov = document.getElementById('stageOverlay');
        const eyebrow = document.getElementById('overlayEyebrow');
        const title = document.getElementById('overlayTitle');
        const starsEl = document.getElementById('overlayStars');
        const reasonEl = document.getElementById('overlayReason');
        const btnPrimaryText = document.getElementById('ovBtnPrimaryText');
        const btnNext = document.getElementById('ovBtnNext');
        const btnStory = document.getElementById('ovBtnStory');
        const storyNote = document.getElementById('overlayStoryNote');

        const score = Math.max(0, Math.floor(Number(payload.score) || state.currentScore || 0));
        const level = Math.max(1, Math.floor(Number(payload.level) || state.currentLevel || 1));
        const stars = Math.min(3, Math.max(isWin ? 1 : 0, Number(payload.stars) || (isWin ? 2 : (score > 300 ? 1 : 0))));

        let runRec = { record: { highScore: score, stars }, creditsAwarded: 0 };
        if (global.CosmicArcadeStore) {
            runRec = global.CosmicArcadeStore.recordRun(state.gameId, { score, level, stars });
        }
        const chapterNowCleared = checkStoryCompletion(score, level, isWin) || state.chapterAwarded;

        document.getElementById('valHudBest').textContent = String(runRec.record ? runRec.record.highScore : score);
        document.getElementById('valBestStars').textContent = formatStars(runRec.record ? runRec.record.stars : stars);
        updateCreditsPill();
        renderLevelPills();

        eyebrow.textContent = isWin ? c.winBadge : c.loseBadge;
        title.textContent = isWin ? c.winTitle : c.loseTitle;
        starsEl.textContent = formatStars(stars);
        reasonEl.textContent = payload.reason || '';
        document.getElementById('ovValScore').textContent = String(score);
        document.getElementById('ovValBest').textContent = String(runRec.record ? runRec.record.highScore : score);
        document.getElementById('ovValCreds').textContent = `+${runRec.creditsAwarded || 0} CRD`;
        document.getElementById('ovLblScore').textContent = c.ovScore;
        document.getElementById('ovLblBest').textContent = c.ovBest;
        document.getElementById('ovLblCreds').textContent = c.ovCreds;
        btnPrimaryText.textContent = c.playAgain;
        document.getElementById('ovBtnPortalText').textContent = 'Portal';

        if (isWin && state.meta && state.meta.hasLevels && level < (state.meta.maxLevel || 1)) {
            btnNext.classList.remove('hidden');
            document.getElementById('ovBtnNextText').textContent = c.nextLevel;
            btnNext.onclick = () => {
                ov.classList.add('hidden');
                jumpToLevel(level + 1);
            };
        } else {
            btnNext.classList.add('hidden');
        }

        if (state.chapterMeta) {
            btnStory.classList.remove('hidden');
            const nextCh = state.chapterMeta.id < 8 ? state.chapterMeta.id + 1 : state.chapterMeta.id;
            btnStory.href = chapterNowCleared ? asset(`story.html?chapter=${nextCh}`) : asset(`story.html?chapter=${state.chapterMeta.id}`);
            document.getElementById('ovBtnStoryText').textContent = chapterNowCleared ? c.storyNext(state.chapterMeta.id) : c.storyBtn;
            if (chapterNowCleared) {
                storyNote.classList.remove('hidden');
                document.getElementById('overlayStoryText').textContent = c.chapterClearedMsg(state.chapterMeta.id);
            } else {
                storyNote.classList.add('hidden');
            }
        } else {
            btnStory.classList.add('hidden');
            storyNote.classList.add('hidden');
        }

        if (isWin && typeof global.confetti === 'function') {
            global.confetti({ particleCount: 55, spread: 60, origin: { y: 0.65 } });
        }

        document.getElementById('ovBtnPrimary').onclick = () => {
            ov.classList.add('hidden');
            restartCurrentGame();
        };
        ov.classList.remove('hidden');
        refreshIcons();
    }

    function showPauseOverlay(show) {
        if (state.ended) return;
        const c = copy();
        const ov = document.getElementById('stageOverlay');
        if (!show) {
            ov.classList.add('hidden');
            return;
        }
        document.getElementById('overlayEyebrow').textContent = c.pauseBadge;
        document.getElementById('overlayTitle').textContent = c.pauseTitle;
        document.getElementById('overlayStars').textContent = '⏸';
        document.getElementById('overlayReason').textContent = c.pauseDesc;
        document.getElementById('ovValScore').textContent = String(state.currentScore);
        const rec = global.CosmicArcadeStore ? global.CosmicArcadeStore.getGameStats(state.gameId) : { highScore: 0 };
        document.getElementById('ovValBest').textContent = String(rec.highScore || 0);
        document.getElementById('ovValCreds').textContent = '--';
        document.getElementById('ovBtnNext').classList.add('hidden');
        document.getElementById('overlayStoryNote').classList.add('hidden');
        document.getElementById('ovBtnStory').classList.toggle('hidden', !state.chapterMeta);
        document.getElementById('ovBtnPrimaryText').textContent = c.resumeBtn;
        document.getElementById('ovBtnPrimary').onclick = togglePause;
        ov.classList.remove('hidden');
    }

    function destroyActiveController() {
        if (state.controller && typeof state.controller.destroy === 'function') {
            try { state.controller.destroy(); } catch (err) { console.warn('Engine destroy warning:', err); }
        }
        state.controller = null;
        const stage = document.getElementById('arcadeStage');
        if (stage) stage.innerHTML = '';
    }

    function mountGame(targetLevel) {
        destroyActiveController();
        state.paused = false;
        state.ended = false;
        state.currentScore = 0;
        state.currentLevel = targetLevel || state.initialLevel || 1;
        document.getElementById('stageOverlay').classList.add('hidden');
        syncStaticChrome();

        const stageEl = document.getElementById('arcadeStage');
        const rec = global.CosmicArcadeStore ? global.CosmicArcadeStore.getGameStats(state.gameId) : { highScore: 0, stars: 0 };
        document.getElementById('valHudBest').textContent = String(rec.highScore || 0);
        document.getElementById('valBestStars').textContent = formatStars(rec.stars || 0);
        document.getElementById('valHudScore').textContent = '0';
        document.getElementById('valHudLevel').textContent = String(state.currentLevel);
        document.getElementById('valHudLives').textContent = '3';
        document.getElementById('valHudStatus').textContent = copy().readyStatus;

        // Special Flagship Hangar Card for #01 cosmic-survivors
        if (state.meta && state.meta.isFlagship) {
            const c = copy();
            stageEl.innerHTML = `
                <div class="flagship-stage-card">
                    <div>
                        <span class="cs-badge cs-badge-sky cs-badge-sm font-mono">${c.flagshipBadge}</span>
                        <h2 class="flagship-stage-title">${c.flagshipTitle}</h2>
                        <p class="flagship-stage-desc">${c.flagshipDesc}</p>
                        <div class="flagship-stage-actions">
                            <a href="${asset('hangar.html')}" class="cs-btn cs-btn-primary">
                                <i data-lucide="rocket"></i>
                                <span>${c.launchHangar}</span>
                            </a>
                            <a href="${asset('game.html?mode=survival')}" class="cs-btn cs-btn-mint">
                                <i data-lucide="play"></i>
                                <span>${c.launchInstant}</span>
                            </a>
                            <a href="${asset('games/boss-gauntlet/index.html')}" class="cs-btn cs-btn-ghost">
                                <i data-lucide="skull"></i>
                                <span>${c.launchBossRush}</span>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            refreshIcons();
            return;
        }

        const mountFn = global.COSMIC_GAME_ENGINES && global.COSMIC_GAME_ENGINES[state.gameId];
        if (typeof mountFn !== 'function') {
            stageEl.innerHTML = `<div style="padding:2rem;text-align:center;color:#fb7185;">Engine "${state.gameId}" not registered.</div>`;
            return;
        }

        const ctx = {
            gameId: state.gameId,
            meta: state.meta,
            stageEl,
            createCanvas(kind, w, h) {
                const cnv = document.createElement('canvas');
                cnv.width = w || 960;
                cnv.height = h || 540;
                cnv.tabIndex = 0;
                cnv.dataset.canvasKind = kind || '2d';
                stageEl.appendChild(cnv);
                cnv.addEventListener('pointerdown', () => { try { cnv.focus({ preventScroll: true }); } catch (_) {} });
                return cnv;
            },
            sprites: state.sprites,
            lang: getLang(),
            t,
            audio: global.CosmicAudio || null,
            wasm: state.wasmBridge || global.CosmicWasm || null,
            shaders: global.CosmicShaders || null,
            chapterId: state.chapterId,
            chapterTarget: state.chapterMeta ? state.chapterMeta.targetValue : null,
            initialLevel: state.currentLevel,
            getPaused: () => state.paused,
            setHud(hud) {
                if (!hud) return;
                if (hud.score !== undefined) {
                    state.currentScore = Math.floor(Number(hud.score) || 0);
                    document.getElementById('valHudScore').textContent = String(state.currentScore);
                    if (state.chapterMeta && state.chapterMeta.targetType === 'score') {
                        checkStoryCompletion(state.currentScore, state.currentLevel, false);
                    }
                }
                if (hud.level !== undefined) {
                    state.currentLevel = Math.max(1, Math.floor(Number(hud.level) || 1));
                    document.getElementById('valHudLevel').textContent = hud.maxLevel ? `${state.currentLevel}/${hud.maxLevel}` : String(state.currentLevel);
                }
                if (hud.lives !== undefined) {
                    document.getElementById('valHudLives').textContent = String(hud.lives);
                }
                if (hud.statusText !== undefined || hud.objectiveText !== undefined) {
                    document.getElementById('valHudStatus').textContent = hud.statusText || hud.objectiveText || '';
                }
            },
            onWin(payload = {}) {
                if (state.ended) return;
                state.ended = true;
                showRunOverlay(true, payload);
            },
            onGameOver(payload = {}) {
                if (state.ended) return;
                state.ended = true;
                showRunOverlay(false, payload);
            }
        };

        state.controller = mountFn(ctx);
        if (state.currentLevel > 1 && state.controller && typeof state.controller.restart === 'function') {
            try { state.controller.restart(state.currentLevel); } catch (_) {}
        }
        const firstCanvas = stageEl.querySelector('canvas');
        if (firstCanvas) {
            try { firstCanvas.focus({ preventScroll: true }); } catch (_) {}
        }
    }

    function jumpToLevel(lv) {
        state.paused = false;
        state.ended = false;
        state.currentLevel = lv;
        document.getElementById('stageOverlay').classList.add('hidden');
        if (state.controller && typeof state.controller.restart === 'function') {
            state.controller.restart(lv);
            syncStaticChrome();
        } else {
            mountGame(lv);
        }
    }

    function restartCurrentGame() {
        state.paused = false;
        state.ended = false;
        document.getElementById('stageOverlay').classList.add('hidden');
        if (state.controller && typeof state.controller.restart === 'function') {
            state.controller.restart(state.currentLevel);
            syncStaticChrome();
        } else {
            mountGame(state.currentLevel);
        }
    }

    function togglePause() {
        if (state.ended) return;
        state.paused = !state.paused;
        showPauseOverlay(state.paused);
        syncStaticChrome();
    }

    function toggleFullscreen() {
        const wrap = document.getElementById('stageFrameWrap');
        if (!wrap) return;
        if (document.fullscreenElement) {
            document.exitFullscreen?.();
        } else {
            wrap.requestFullscreen?.();
        }
    }

    function bindEvents() {
        document.getElementById('btnPauseGame')?.addEventListener('click', togglePause);
        document.getElementById('btnRestartGame')?.addEventListener('click', restartCurrentGame);
        document.getElementById('btnFullscreen')?.addEventListener('click', toggleFullscreen);
        const randBtn = document.getElementById('btnRandomGame');
        if (randBtn) {
            randBtn.href = pickRandomGameUrl();
        }

        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
            // Don't hijack typing game keystrokes!
            if (state.gameId === 'typing-cipher-defense') return;
            if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                togglePause();
            } else if (e.key === 'r' || e.key === 'R') {
                // Allow games like Sokoban to handle R themselves if active, except when overlay is open
                if (state.ended) {
                    e.preventDefault();
                    restartCurrentGame();
                }
            } else if (e.key === 'f' || e.key === 'F') {
                if (state.gameId !== 'nebula-minesweeper' && state.gameId !== 'starlight-rhythm-pulse') {
                    toggleFullscreen();
                }
            }
        });

        global.addEventListener('cosmic:langchange', () => {
            syncStaticChrome();
            mountGame(state.currentLevel);
        });

        window.addEventListener('beforeunload', destroyActiveController);
    }

    async function init() {
        const params = new URLSearchParams(location.search);
        const pageForcedId = document.body?.dataset?.gameId || (typeof global.COSMIC_GAME_ID === 'string' ? global.COSMIC_GAME_ID : '');
        const requestedId = pageForcedId || params.get('game') || 'nova-flappy-rift';
        const games = global.COSMIC_ARCADE_GAMES || [];
        let foundIdx = games.findIndex(g => g.id === requestedId);
        if (foundIdx < 0) foundIdx = games.findIndex(g => g.id === 'nova-flappy-rift');
        if (foundIdx < 0) foundIdx = 0;

        state.meta = games[foundIdx] || null;
        state.gameId = state.meta ? state.meta.id : requestedId;
        state.indexNum = foundIdx + 1;
        state.initialLevel = Math.max(1, parseInt(params.get('level') || '1', 10) || 1);

        const chParam = parseInt(params.get('chapter') || '0', 10);
        if (chParam >= 1 && global.CosmicStoryStore) {
            state.chapterId = chParam;
            state.chapterMeta = global.CosmicStoryStore.getChapter(chParam);
        }

        const wasmPromise = (global.CosmicWasm && typeof global.CosmicWasm.ready === 'function')
            ? global.CosmicWasm.ready().then(b => { state.wasmBridge = b || null; }).catch(() => {})
            : Promise.resolve();
        await Promise.all([preloadSprites(), wasmPromise]);
        updateCreditsPill();
        setupAudioControl();
        bindEvents();
        mountGame(state.initialLevel);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
