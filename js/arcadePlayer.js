// =============================================================================
// COSMIC UNIVERSE v12.0 — UNIVERSAL 60-GAME ARCADE PLAYER SHELL (js/arcadePlayer.js)
// Mounts Three.js 3D, PixiJS v8, Matter.js, WebAssembly, TypeScript, GLSL & Pixel engines.
// =============================================================================
(function (global) {
    'use strict';

    const SPRITE_KEYS = [
        'fighter', 'astronaut', 'ufo', 'asteroid',
        'warp_ring', 'laser_turret', 'cryo_crystal', 'energy_prism',
        'alien_drone', 'plasma_bomb', 'cargo_crate', 'portal_vortex',
        'coin_star', 'boss_core', 'moon_lander', 'shield_battery',
        'exo_trooper', 'tactical_mech', 'moon_rover', 'colossus_boss',
        'stealth_jet', 'carrier_ship', 'reactor_node', 'spider_bot', 'missile_pod'
    ];

    const CAST_KEYS = ['nova_tactical', 'nova_damaged', 'sara_ai', 'admiral_kaelen'];

    const state = {
        gameId: 'nova-flappy-rift',
        meta: null,
        indexNum: 1,
        chapterId: null,
        chapterMeta: null,
        playMode: 'endless',
        difficultyMult: 1,
        menuVisible: true,
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
            portalBtn: 'Portal (60 Oyun)',
            storyBtn: 'Hikâye Haritası',
            menuBtn: 'Oyun Menüsü',
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
            viewAll: 'Tüm 60 Oyunu Gör',
            modeLabel: 'OYUN MODU SEÇİMİ',
            diffLabel: 'ZORLUK SEVİYESİ',
            endlessBtn: '♾ Sonsuz / Serbest Mod',
            storyModeBtn: (ch) => `📖 Hikâye Görevi (Böl.${ch})`,
            launchMenuBtn: 'OYUNA BAŞLA',
            backCatalog: 'Tüm Oyunlar',
            flagshipBadge: 'ANA OYUN · PIXIJS V8 ROGUELIKE',
            flagshipTitle: 'Cosmic Survivors v12.0 — Tam Ölçek Uzay Arenası',
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
            storyNext: (id) => id < 24 ? `Bölüm ${id + 1}'e Geç` : 'Sezon Finalini Gör',
            chapterClearedMsg: (id) => `Bölüm ${id} başarıyla tamamlandı ve hikâye kilidi açıldı!`,
            ovScore: 'Skor',
            ovBest: 'Rekor',
            ovCreds: 'Ödül',
            readyStatus: 'Hazır'
        },
        en: {
            portalBtn: 'Portal (60 Games)',
            storyBtn: 'Story Map',
            menuBtn: 'Game Menu',
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
            viewAll: 'View All 60 Games',
            modeLabel: 'GAME MODE',
            diffLabel: 'DIFFICULTY',
            endlessBtn: '♾ Endless / Free Play',
            storyModeBtn: (ch) => `📖 Story Mission (Ch.${ch})`,
            launchMenuBtn: 'PLAY NOW',
            backCatalog: 'All Games',
            flagshipBadge: 'FLAGSHIP TITLE · PIXIJS V8 ROGUELIKE',
            flagshipTitle: 'Cosmic Survivors v12.0 — Full Space Survival Arena',
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
            storyNext: (id) => id < 24 ? `Continue to Ch.${id + 1}` : 'View Season Finale',
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
            CAST_KEYS.forEach(c => entries.push([c, asset(`assets/v11/cast/${c}.png`)]));
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

    function focusStageCanvas() {
        const cnv = document.querySelector('#arcadeStage canvas');
        if (cnv && typeof cnv.focus === 'function') {
            try { cnv.focus({ preventScroll: true }); } catch (_) {}
        }
    }

    function blurControl(el) {
        if (el && typeof el.blur === 'function') el.blur();
    }

    function getEndlessLevel(meta = state.meta) {
        if (!meta || !meta.hasLevels) return 0;
        const maxLv = Math.max(1, Number(meta.maxLevel) || 1);
        if (Number.isFinite(Number(meta.endlessLevel)) && Number(meta.endlessLevel) > 0) {
            return Number(meta.endlessLevel);
        }
        if (meta.hasEndless || meta.id === 'exo-metroid-breach') {
            return maxLv + 1;
        }
        return 0;
    }

    function syncStorySelectionFromMode() {
        const linkedCh = state.chapterId || (state.meta && state.meta.storyChapter);
        if (state.playMode === 'story' && linkedCh && global.CosmicStoryStore && typeof global.CosmicStoryStore.getChapter === 'function') {
            const chObj = global.CosmicStoryStore.getChapter(linkedCh);
            if (chObj) {
                state.chapterId = chObj.id;
                state.chapterMeta = chObj;
                return;
            }
        }
        state.chapterMeta = null;
        if (state.playMode === 'story') state.playMode = 'endless';
    }

    function hidePreGameMenu() {
        state.menuVisible = false;
        document.getElementById('preGameMenuOverlay')?.classList.add('hidden');
        syncTouchControlsVisibility();
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
            blurControl(btn);
            if (!global.CosmicAudio) return;
            global.CosmicAudio.unlock();
            const cur = Boolean(global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            global.CosmicAudio.setMuted(!cur);
            sync();
            refreshIcons();
            if (cur) global.CosmicAudio.play('uiClick');
            focusStageCanvas();
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
            btnMenuLabel: c.menuBtn,
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
            document.title = `${titleStr} — COSMIC UNIVERSE v12.0`;
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
            const saraAvatar = document.getElementById('storySaraAvatar');
            if (saraAvatar) saraAvatar.src = asset('assets/v11/cast/sara_ai.png');
        }

        if (state.playMode === 'story' && state.chapterMeta) {
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
            updateStoryMissionProgress(state.currentScore, state.currentLevel, state.chapterAwarded);
        } else {
            document.getElementById('storyMissionBanner')?.classList.add('hidden');
            document.getElementById('gameChapterBadge')?.classList.add('hidden');
            document.getElementById('backStoryLink')?.classList.toggle('hidden', !state.chapterId);
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

    function updateActiveLevelPill() {
        const wrap = document.getElementById('levelPillsWrap');
        if (!wrap) return;
        wrap.querySelectorAll('.level-pill-btn').forEach((btn) => {
            btn.classList.toggle('active', Number(btn.dataset.level) === state.currentLevel);
        });
    }

    function renderLevelPills() {
        const bar = document.getElementById('levelSelectorBar');
        const wrap = document.getElementById('levelPillsWrap');
        if (!bar || !wrap || !state.meta) return;
        const maxLv = Math.max(1, Number(state.meta.maxLevel) || 1);
        const endlessLv = getEndlessLevel(state.meta);
        if (!state.meta.hasLevels || (maxLv <= 1 && !endlessLv)) {
            bar.classList.add('hidden');
            return;
        }
        bar.classList.remove('hidden');
        const rec = global.CosmicArcadeStore ? global.CosmicArcadeStore.getGameStats(state.gameId) : { bestLevel: 0 };
        wrap.innerHTML = '';
        const appendPill = (lv, labelText, titleText) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.dataset.level = String(lv);
            btn.className = 'level-pill-btn' + (lv === state.currentLevel ? ' active' : '') + (lv <= (rec.bestLevel || 0) ? ' cleared' : '');
            btn.textContent = labelText;
            if (titleText) btn.title = titleText;
            btn.addEventListener('click', () => {
                blurControl(btn);
                if (global.CosmicAudio) {
                    global.CosmicAudio.unlock();
                    global.CosmicAudio.play('uiClick');
                }
                jumpToLevel(lv);
            });
            wrap.appendChild(btn);
        };
        for (let lv = 1; lv <= maxLv; lv++) {
            const isEndlessSlot = endlessLv > 0 && lv === endlessLv;
            appendPill(lv, isEndlessSlot ? '∞' : String(lv), isEndlessSlot ? t('Sonsuz Sektör', 'Endless Sector') : '');
        }
        if (endlessLv > maxLv) {
            appendPill(endlessLv, '∞', t('Sonsuz Sektör', 'Endless Sector'));
        }
    }

    function renderRelatedGames() {
        const grid = document.getElementById('relatedGamesGrid');
        if (!grid || !state.meta || !global.COSMIC_ARCADE_GAMES) return;
        const lang = getLang();
        const others = global.COSMIC_ARCADE_GAMES.filter(g => g.id !== state.gameId && (g.category === state.meta.category || g.engine === state.meta.engine));
        const picks = others.slice(0, 4);
        grid.innerHTML = picks.map(g => `
            <a href="${g.id === 'cosmic-survivors' ? asset('hangar.html') : asset(`games/${encodeURIComponent(g.id)}/index.html`)}" class="related-card">
                <img src="${asset(`assets/v11/thumbs/${g.id}.png`)}" onerror="this.src='${asset(`assets/v11/sprites/${g.sprite}.png`)}'" alt="">
                <div class="related-card-info">
                    <div class="related-card-name">${g.title[lang] || g.title.tr}</div>
                    <div class="related-card-meta">${g.engine} · ${g.lang}</div>
                </div>
            </a>
        `).join('');
    }

    function pickRandomGameUrl() {
        const list = (global.COSMIC_ARCADE_GAMES || []).filter(g => g.id !== 'cosmic-survivors' && g.id !== state.gameId);
        if (!list.length) return asset('index.html');
        const pick = list[Math.floor(Math.random() * list.length)];
        return asset(`games/${encodeURIComponent(pick.id)}/index.html`);
    }

    function updateStoryMissionProgress(scoreVal, levelVal, completed = false) {
        if (state.playMode !== 'story' || !state.chapterMeta) return;
        const ch = state.chapterMeta;
        const lang = getLang();
        const isDone = Boolean(completed || state.chapterAwarded);
        const target = Math.max(1, Number(ch.targetValue) || 1);
        let pct = 0;
        let counterText = '';

        if (ch.targetType === 'score') {
            const cur = Math.max(0, Math.floor(Number(scoreVal) || 0));
            pct = isDone ? 100 : Math.min(100, Math.max(0, (cur / target) * 100));
            counterText = `${Math.min(cur, target).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')} / ${target.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')} · ${Math.round(pct)}%`;
        } else {
            const cur = Math.max(1, Math.floor(Number(levelVal) || 1));
            pct = isDone ? 100 : Math.min(96, Math.max(8, ((cur - 1) / target) * 100 + 8));
            const lvLbl = lang === 'en' ? 'LV' : 'SV';
            counterText = `${lvLbl} ${Math.min(cur, target)} / ${target} · ${Math.round(pct)}%`;
        }

        const banner = document.getElementById('storyMissionBanner');
        const fill = document.getElementById('storyMissionProgressFill');
        const counterEl = document.getElementById('storyMissionCounter');
        const stEl = document.getElementById('storyMissionStatus');
        if (banner) banner.classList.toggle('is-complete', isDone);
        if (fill) fill.style.width = `${pct.toFixed(1)}%`;
        if (counterEl) counterEl.textContent = counterText;
        if (stEl) stEl.textContent = isDone ? copy().missionDone : copy().missionActive;
    }

    function checkStoryCompletion(score, level, explicitWin) {
        if (state.playMode !== 'story' || !state.chapterMeta || state.chapterAwarded || !global.CosmicStoryStore) return false;
        const ch = state.chapterMeta;
        const met = ch.targetType === 'score'
            ? (Number(score) >= ch.targetValue)
            : (explicitWin ? Number(level) >= ch.targetValue : Number(level) > ch.targetValue);
        if (!met) return false;

        state.chapterAwarded = true;
        const stars = Math.min(3, Math.max(1, Number(score) >= ch.targetValue * 2 ? 3 : 2));
        global.CosmicStoryStore.completeChapter(ch.id, stars, Math.floor(Number(score) || 0));
        updateStoryMissionProgress(score, level, true);
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

        const maxLv = Math.max(1, Number(state.meta && state.meta.maxLevel) || 1);
        const endlessLv = getEndlessLevel(state.meta);
        if (isWin && state.meta && state.meta.hasLevels && level < maxLv) {
            btnNext.classList.remove('hidden');
            document.getElementById('ovBtnNextText').textContent = c.nextLevel;
            btnNext.onclick = () => {
                ov.classList.add('hidden');
                jumpToLevel(level + 1);
            };
        } else if (isWin && endlessLv > maxLv && level === maxLv && state.playMode !== 'story') {
            btnNext.classList.remove('hidden');
            document.getElementById('ovBtnNextText').textContent = t('Sonsuz Sektör (∞)', 'Endless Sector (∞)');
            btnNext.onclick = () => {
                ov.classList.add('hidden');
                jumpToLevel(endlessLv);
            };
        } else {
            btnNext.classList.add('hidden');
        }

        if (state.playMode === 'story' && state.chapterMeta) {
            btnStory.classList.remove('hidden');
            const nextCh = state.chapterMeta.id < 24 ? state.chapterMeta.id + 1 : state.chapterMeta.id;
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
        syncTouchControlsVisibility();
        refreshIcons();
    }

    function showPauseOverlay(show) {
        if (state.ended || (show && state.menuVisible)) return;
        const c = copy();
        const ov = document.getElementById('stageOverlay');
        if (!show) {
            ov.classList.add('hidden');
            syncTouchControlsVisibility();
            focusStageCanvas();
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
        document.getElementById('ovLblScore').textContent = c.ovScore;
        document.getElementById('ovLblBest').textContent = c.ovBest;
        document.getElementById('ovLblCreds').textContent = c.ovCreds;
        document.getElementById('ovBtnPortalText').textContent = 'Portal';
        document.getElementById('ovBtnNext').classList.add('hidden');
        document.getElementById('overlayStoryNote').classList.add('hidden');

        const btnStory = document.getElementById('ovBtnStory');
        const hasStory = Boolean(state.playMode === 'story' && state.chapterMeta);
        if (btnStory) {
            btnStory.classList.toggle('hidden', !hasStory);
            if (hasStory) {
                btnStory.href = asset(`story.html?chapter=${state.chapterMeta.id}`);
                const stTxt = document.getElementById('ovBtnStoryText');
                if (stTxt) stTxt.textContent = c.storyBtn;
            }
        }
        document.getElementById('ovBtnPrimaryText').textContent = c.resumeBtn;
        document.getElementById('ovBtnPrimary').onclick = () => {
            blurControl(document.getElementById('ovBtnPrimary'));
            togglePause();
        };
        ov.classList.remove('hidden');
        syncTouchControlsVisibility();
        refreshIcons();
    }

    function destroyActiveController() {
        if (state.controller && typeof state.controller.destroy === 'function') {
            try { state.controller.destroy(); } catch (err) { console.warn('Engine destroy warning:', err); }
        }
        state.controller = null;
        const stage = document.getElementById('arcadeStage');
        if (stage) stage.innerHTML = '';
    }

    function resetHudBaseline() {
        const rec = global.CosmicArcadeStore ? global.CosmicArcadeStore.getGameStats(state.gameId) : { highScore: 0, stars: 0 };
        const endlessLv = getEndlessLevel(state.meta);
        document.getElementById('valHudBest').textContent = String(rec.highScore || 0);
        document.getElementById('valBestStars').textContent = formatStars(rec.stars || 0);
        document.getElementById('valHudScore').textContent = '0';
        document.getElementById('valHudLevel').textContent = (endlessLv > 0 && state.currentLevel === endlessLv) ? '∞' : String(state.currentLevel);
        document.getElementById('valHudLives').textContent = '3';
        document.getElementById('valHudStatus').textContent = copy().readyStatus;
    }

    function mountGame(targetLevel) {
        destroyActiveController();
        state.paused = false;
        state.ended = false;
        state.currentScore = 0;
        state.chapterAwarded = false;
        state.currentLevel = targetLevel || state.initialLevel || 1;
        document.getElementById('stageOverlay').classList.add('hidden');
        syncStaticChrome();
        resetHudBaseline();
        syncTouchControlsVisibility();

        const stageEl = document.getElementById('arcadeStage');

        // Special Flagship Hangar Card ONLY for #01 cosmic-survivors
        if (state.gameId === 'cosmic-survivors') {
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
            isStory: Boolean(state.playMode === 'story' && state.chapterMeta),
            chapterId: state.playMode === 'story' ? state.chapterId : null,
            chapterTarget: (state.playMode === 'story' && state.chapterMeta) ? state.chapterMeta.targetValue : null,
            difficultyMult: state.difficultyMult || 1,
            initialLevel: state.currentLevel,
            getPaused: () => state.paused,
            setHud(hud) {
                if (!hud) return;
                if (hud.score !== undefined) {
                    state.currentScore = Math.floor(Number(hud.score) || 0);
                    document.getElementById('valHudScore').textContent = String(state.currentScore);
                    if (state.playMode === 'story' && state.chapterMeta && state.chapterMeta.targetType === 'score') {
                        checkStoryCompletion(state.currentScore, state.currentLevel, false);
                    }
                }
                if (hud.level !== undefined) {
                    const prevLv = state.currentLevel;
                    state.currentLevel = Math.max(1, Math.floor(Number(hud.level) || 1));
                    const endlessLv = getEndlessLevel(state.meta);
                    const lvDisplay = (endlessLv > 0 && state.currentLevel === endlessLv)
                        ? '∞'
                        : (hud.maxLevel ? `${state.currentLevel}/${hud.maxLevel}` : String(state.currentLevel));
                    document.getElementById('valHudLevel').textContent = lvDisplay;
                    if (prevLv !== state.currentLevel) updateActiveLevelPill();
                    if (state.playMode === 'story' && state.chapterMeta && state.chapterMeta.targetType === 'level') {
                        checkStoryCompletion(state.currentScore, state.currentLevel, false);
                    }
                }
                if (state.playMode === 'story' && state.chapterMeta && (hud.score !== undefined || hud.level !== undefined)) {
                    updateStoryMissionProgress(state.currentScore, state.currentLevel, state.chapterAwarded);
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

    function resetActiveGame(targetLevel) {
        const wasMenuVisible = state.menuVisible;
        if (wasMenuVisible) {
            syncStorySelectionFromMode();
            hidePreGameMenu();
        }
        state.paused = false;
        state.ended = false;
        state.currentScore = 0;
        state.chapterAwarded = false;
        state.currentLevel = targetLevel || state.currentLevel || state.initialLevel || 1;
        document.getElementById('stageOverlay')?.classList.add('hidden');
        if (!wasMenuVisible && state.controller && typeof state.controller.restart === 'function') {
            state.controller.restart(state.currentLevel);
            syncStaticChrome();
            resetHudBaseline();
            syncTouchControlsVisibility();
            focusStageCanvas();
        } else {
            mountGame(state.currentLevel);
        }
    }

    function jumpToLevel(lv) {
        resetActiveGame(lv);
    }

    function restartCurrentGame() {
        resetActiveGame(state.currentLevel);
    }

    function togglePause() {
        if (state.ended || state.menuVisible) return;
        state.paused = !state.paused;
        showPauseOverlay(state.paused);
        syncStaticChrome();
    }

    function toggleFullscreen() {
        const wrap = document.getElementById('stageFrameWrap');
        if (!wrap) return;
        if (document.fullscreenElement) {
            Promise.resolve(document.exitFullscreen?.()).catch(() => {});
        } else {
            Promise.resolve(wrap.requestFullscreen?.()).catch(() => {});
        }
    }

    function syncPreGameMenu() {
        const ov = document.getElementById('preGameMenuOverlay');
        if (!ov || !state.meta) return;
        const lang = getLang();
        const c = copy();
        const rec = global.CosmicArcadeStore ? global.CosmicArcadeStore.getGameStats(state.gameId) : { highScore: 0, stars: 0 };

        const bg = document.getElementById('preGameBgImg');
        if (bg) bg.style.backgroundImage = `url('${asset(`assets/v11/banners/${state.gameId}.jpg`)}')`;
        const logo = document.getElementById('preGameLogo');
        if (logo) {
            logo.onerror = () => { logo.src = asset(`assets/v11/sprites/${state.meta.sprite}.png`); };
            logo.src = asset(`assets/v11/thumbs/${state.gameId}.png`);
        }

        document.getElementById('preGameEnginePill').textContent = `${state.meta.engine} · ${state.meta.lang}`;
        document.getElementById('preGameBestPill').textContent = `${c.best}: ${rec.highScore || 0}`;
        document.getElementById('preGameStarsPill').textContent = formatStars(rec.stars || 0);
        document.getElementById('preGameTitle').textContent = state.meta.title[lang] || state.meta.title.tr;
        document.getElementById('preGameTagline').textContent = state.meta.tagline[lang] || state.meta.tagline.tr;
        document.getElementById('preGameControlsHint').textContent = `${c.controls}: ${state.meta.controls[lang] || state.meta.controls.tr}`;
        document.getElementById('lblModeSelect').textContent = c.modeLabel;
        document.getElementById('lblDiffSelect').textContent = c.diffLabel;
        document.getElementById('btnLaunchFromMenuText').textContent = c.launchMenuBtn;
        document.getElementById('btnBackToCatalogText').textContent = c.backCatalog;

        const btnEndless = document.getElementById('btnModeEndless');
        const btnStory = document.getElementById('btnModeStory');
        if (btnEndless) {
            btnEndless.textContent = c.endlessBtn;
            btnEndless.classList.toggle('active', state.playMode === 'endless');
        }
        const linkedCh = state.chapterId || state.meta.storyChapter;
        if (btnStory) {
            if (linkedCh && global.CosmicStoryStore) {
                btnStory.classList.remove('hidden');
                btnStory.textContent = c.storyModeBtn(linkedCh);
                btnStory.classList.toggle('active', state.playMode === 'story');
            } else {
                btnStory.classList.add('hidden');
            }
        }
        document.querySelectorAll('#diffToggleRow .mode-pill').forEach((btn) => {
            btn.classList.toggle('active', Math.abs(parseFloat(btn.dataset.diff) - state.difficultyMult) < 0.05);
        });
    }

    let touchControlsState = { el: null, activeCodes: new Set(), hiddenByUser: false, initialized: false, coarse: false };

    function dispatchTouchKey(code, key, isDown) {
        const ev = new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
            code,
            key,
            bubbles: true,
            cancelable: true
        });
        window.dispatchEvent(ev);
    }

    function releaseAllTouchKeys() {
        if (!touchControlsState.activeCodes.size) return;
        touchControlsState.activeCodes.forEach((entry) => {
            const [code, key] = entry.split('|');
            dispatchTouchKey(code, key, false);
        });
        touchControlsState.activeCodes.clear();
        if (touchControlsState.el) {
            touchControlsState.el.querySelectorAll('.arcade-vbtn.is-down').forEach(b => b.classList.remove('is-down'));
        }
    }

    function syncTouchControlsVisibility() {
        if (!touchControlsState.el) return;
        const hideForGame = state.gameId === 'cosmic-survivors' || state.gameId === 'typing-cipher-defense' || state.gameId === 'lua-cyber-ops';
        const show = touchControlsState.coarse && !touchControlsState.hiddenByUser && !state.menuVisible && !state.paused && !state.ended && !hideForGame;
        touchControlsState.el.style.display = show ? 'flex' : 'none';
        if (!show) releaseAllTouchKeys();
    }

    function ensureTouchControlsDom() {
        if (touchControlsState.initialized) return;
        const wrap = document.getElementById('stageFrameWrap');
        if (!wrap) return;
        touchControlsState.initialized = true;

        const bar = document.createElement('div');
        bar.id = 'arcadeTouchControls';
        bar.setAttribute('aria-label', 'Touch Controls');
        bar.style.cssText = 'position:absolute;left:12px;right:12px;bottom:12px;display:none;justify-content:space-between;align-items:flex-end;pointer-events:none;z-index:18;user-select:none;-webkit-user-select:none;touch-action:none;';

        const makeBtn = (label, code, key, extraCss = '') => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'arcade-vbtn';
            b.textContent = label;
            b.style.cssText = 'pointer-events:auto;min-width:44px;height:44px;border-radius:12px;border:1px solid rgba(56,189,248,0.45);background:rgba(15,23,42,0.72);color:#e2e8f0;font:700 15px/1 Inter,system-ui,sans-serif;display:inline-flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);touch-action:none;' + extraCss;
            const entry = `${code}|${key}`;
            const press = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (global.CosmicAudio) global.CosmicAudio.unlock();
                if (!touchControlsState.activeCodes.has(entry)) {
                    touchControlsState.activeCodes.add(entry);
                    b.classList.add('is-down');
                    b.style.background = 'rgba(56,189,248,0.35)';
                    dispatchTouchKey(code, key, true);
                }
            };
            const release = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                if (touchControlsState.activeCodes.has(entry)) {
                    touchControlsState.activeCodes.delete(entry);
                    b.classList.remove('is-down');
                    b.style.background = 'rgba(15,23,42,0.72)';
                    dispatchTouchKey(code, key, false);
                }
            };
            b.addEventListener('pointerdown', press);
            b.addEventListener('pointerup', release);
            b.addEventListener('pointercancel', release);
            b.addEventListener('pointerleave', release);
            return b;
        };

        const dpad = document.createElement('div');
        dpad.style.cssText = 'display:grid;grid-template-columns:repeat(3,44px);grid-template-rows:repeat(2,44px);gap:6px;pointer-events:none;';
        const empty = document.createElement('div');
        dpad.appendChild(empty);
        dpad.appendChild(makeBtn('▲', 'ArrowUp', 'ArrowUp'));
        dpad.appendChild(document.createElement('div'));
        dpad.appendChild(makeBtn('◀', 'ArrowLeft', 'ArrowLeft'));
        dpad.appendChild(makeBtn('▼', 'ArrowDown', 'ArrowDown'));
        dpad.appendChild(makeBtn('▶', 'ArrowRight', 'ArrowRight'));

        const rightCluster = document.createElement('div');
        rightCluster.style.cssText = 'display:flex;align-items:flex-end;gap:8px;pointer-events:none;';
        rightCluster.appendChild(makeBtn('ACT', 'Space', ' ', 'min-width:66px;height:54px;border-radius:14px;border-color:rgba(244,63,94,0.55);font-size:13px;letter-spacing:0.05em;'));

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = '×';
        closeBtn.title = t('Dokunmatik Tuşları Gizle', 'Hide Touch Pad');
        closeBtn.style.cssText = 'pointer-events:auto;width:28px;height:28px;border-radius:999px;border:1px solid rgba(148,163,184,0.35);background:rgba(15,23,42,0.7);color:#cbd5e1;font:700 14px/1 sans-serif;touch-action:manipulation;';
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            touchControlsState.hiddenByUser = true;
            syncTouchControlsVisibility();
        });
        rightCluster.appendChild(closeBtn);

        bar.appendChild(dpad);
        bar.appendChild(rightCluster);
        wrap.appendChild(bar);
        touchControlsState.el = bar;
        syncTouchControlsVisibility();
    }

    function showPreGameMenu() {
        destroyActiveController();
        state.paused = false;
        state.ended = false;
        state.chapterAwarded = false;
        state.menuVisible = true;
        document.getElementById('stageOverlay')?.classList.add('hidden');
        syncTouchControlsVisibility();
        syncStaticChrome();
        syncPreGameMenu();
        document.getElementById('preGameMenuOverlay')?.classList.remove('hidden');
        refreshIcons();
    }

    function launchFromMenu() {
        if (global.CosmicAudio) {
            global.CosmicAudio.unlock();
            global.CosmicAudio.play('uiClick');
        }
        syncStorySelectionFromMode();
        hidePreGameMenu();
        mountGame(state.currentLevel || state.initialLevel);
    }

    function bindEvents() {
        const unlockOnGesture = () => {
            if (global.CosmicAudio) global.CosmicAudio.unlock();
        };
        window.addEventListener('pointerdown', unlockOnGesture, { once: true, passive: true });
        window.addEventListener('keydown', unlockOnGesture, { once: true, passive: true });

        if (global.matchMedia && global.matchMedia('(pointer: coarse)').matches) {
            touchControlsState.coarse = true;
            ensureTouchControlsDom();
        } else {
            window.addEventListener('touchstart', () => {
                touchControlsState.coarse = true;
                ensureTouchControlsDom();
                syncTouchControlsVisibility();
            }, { once: true, passive: true });
        }

        document.getElementById('btnShowGameMenu')?.addEventListener('click', () => {
            blurControl(document.getElementById('btnShowGameMenu'));
            showPreGameMenu();
        });
        document.getElementById('btnLaunchFromMenu')?.addEventListener('click', launchFromMenu);
        document.getElementById('btnModeEndless')?.addEventListener('click', () => {
            state.playMode = 'endless';
            if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
            syncPreGameMenu();
        });
        document.getElementById('btnModeStory')?.addEventListener('click', () => {
            state.playMode = 'story';
            if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
            syncPreGameMenu();
        });
        document.querySelectorAll('#diffToggleRow .mode-pill').forEach((btn) => {
            btn.addEventListener('click', () => {
                state.difficultyMult = parseFloat(btn.dataset.diff) || 1;
                if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
                syncPreGameMenu();
            });
        });
        document.getElementById('btnPauseGame')?.addEventListener('click', () => {
            blurControl(document.getElementById('btnPauseGame'));
            togglePause();
        });
        document.getElementById('btnRestartGame')?.addEventListener('click', () => {
            blurControl(document.getElementById('btnRestartGame'));
            restartCurrentGame();
        });
        document.getElementById('btnFullscreen')?.addEventListener('click', () => {
            blurControl(document.getElementById('btnFullscreen'));
            toggleFullscreen();
        });
        document.addEventListener('fullscreenchange', () => {
            const btn = document.getElementById('btnFullscreen');
            if (btn) btn.classList.toggle('active', Boolean(document.fullscreenElement));
            focusStageCanvas();
        });
        const randBtn = document.getElementById('btnRandomGame');
        if (randBtn) {
            randBtn.href = pickRandomGameUrl();
        }

        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
            if (state.menuVisible && e.key === 'Enter') {
                if (e.repeat) return;
                e.preventDefault();
                launchFromMenu();
                return;
            }
            // Don't hijack typing game keystrokes!
            if (state.gameId === 'typing-cipher-defense' || state.gameId === 'lua-cyber-ops') return;
            if (e.key === 'p' || e.key === 'P') {
                if (e.repeat || state.menuVisible) return;
                e.preventDefault();
                togglePause();
            } else if (e.key === 'r' || e.key === 'R') {
                // Allow games like Sokoban to handle R themselves if active, except when overlay is open
                if (!e.repeat && state.ended) {
                    e.preventDefault();
                    restartCurrentGame();
                }
            } else if (e.key === 'f' || e.key === 'F') {
                if (!e.repeat && state.gameId !== 'nebula-minesweeper' && state.gameId !== 'starlight-rhythm-pulse') {
                    toggleFullscreen();
                }
            }
        });

        window.addEventListener('blur', releaseAllTouchKeys);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                releaseAllTouchKeys();
                if (!state.menuVisible && !state.ended && !state.paused && state.gameId !== 'cosmic-survivors') {
                    togglePause();
                }
            }
        });

        global.addEventListener('cosmic:langchange', () => {
            syncStaticChrome();
            if (state.menuVisible) {
                syncPreGameMenu();
            } else {
                mountGame(state.currentLevel);
            }
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

        const levelRaw = (params.get('level') || '').trim().toLowerCase();
        const endlessLv = getEndlessLevel(state.meta);
        if (levelRaw === 'endless') {
            state.initialLevel = endlessLv || ((state.meta && Number(state.meta.maxLevel) || 1) + 1);
        } else {
            state.initialLevel = Math.max(1, parseInt(levelRaw || '1', 10) || 1);
        }
        state.currentLevel = state.initialLevel;

        const chParam = parseInt(params.get('chapter') || '0', 10);
        const modeParam = (params.get('mode') || '').trim().toLowerCase();
        const resolvedCh = (chParam >= 1 && global.CosmicStoryStore && typeof global.CosmicStoryStore.getChapter === 'function')
            ? global.CosmicStoryStore.getChapter(chParam)
            : null;
        if (resolvedCh) {
            state.chapterId = resolvedCh.id;
            state.chapterMeta = resolvedCh;
            state.playMode = (modeParam === 'endless' || levelRaw === 'endless') ? 'endless' : 'story';
        } else if (modeParam === 'story' && state.meta && state.meta.storyChapter && global.CosmicStoryStore && typeof global.CosmicStoryStore.getChapter === 'function') {
            const fallbackCh = global.CosmicStoryStore.getChapter(state.meta.storyChapter);
            if (fallbackCh) {
                state.chapterId = fallbackCh.id;
                state.chapterMeta = fallbackCh;
                state.playMode = 'story';
            } else {
                state.chapterId = null;
                state.chapterMeta = null;
                state.playMode = 'endless';
            }
        } else {
            state.chapterId = null;
            state.chapterMeta = null;
            state.playMode = 'endless';
        }

        const wasmPromise = (global.CosmicWasm && typeof global.CosmicWasm.ready === 'function')
            ? global.CosmicWasm.ready().then(b => { state.wasmBridge = b || null; }).catch(() => {})
            : Promise.resolve();
        await Promise.all([preloadSprites(), wasmPromise]);
        updateCreditsPill();
        setupAudioControl();
        bindEvents();

        if (state.gameId === 'cosmic-survivors' || params.get('autostart') === '1') {
            syncStorySelectionFromMode();
            hidePreGameMenu();
            mountGame(state.initialLevel);
        } else {
            showPreGameMenu();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
