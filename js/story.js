// =============================================================================
// COSMIC UNIVERSE v11.0 — CAPTAIN NOVA VEX STORY SAGA CONTROLLER (js/story.js)
// =============================================================================
(function (global) {
    'use strict';

    const state = {
        selectedChapterId: 1,
        dialogueIdx: 0,
        resetArmed: false,
        resetTimer: null
    };

    const COPY = {
        tr: {
            pageTitle: 'COSMIC UNIVERSE v11.0 — Kaptan Nova Vex: Hikâye Modu',
            eyebrow: 'PARÇALANAN SONSUZLUK · KAPTAN NOVA VEX',
            heading: 'Çoklu Evren Hikâye Seferi',
            sub: 'Her bölümde farklı bir evren ve oyun mekaniğinde ustalaşarak 8 boyutsal mührü çöz.',
            audioOn: 'Ses Açık',
            audioOff: 'Sessiz',
            unlockAll: 'Tüm Bölümleri Önizle',
            unlockDone: '8 Bölüm Açıldı ✓',
            reset: 'Sıfırla',
            resetConfirm: 'Emin misin?',
            nextLine: 'Devam Et',
            skipIntro: 'Hemen Başla',
            dialogueReady: 'Sinyal kilitlendi — göreve hazır!',
            lblGame: 'OYNANACAK EVREN / OYUN',
            lblObjective: 'BÖLÜM KİLİT AÇMA HEDEFİ',
            lblReward: 'TAMAMLAMA ÖDÜLÜ',
            launch: (id) => `Bölüm ${id} Görevini Başlat`,
            replay: (id) => `Bölüm ${id} Tekrar Oyna`,
            launchAlt: 'Tam Ölçek Cosmic Survivors Aç',
            badgesHeading: 'Kaptan Nova Vex Nişanları',
            chShort: (id) => `BÖL.${id}`,
            targetScore: (n) => `${n}+ puana ulaşarak boyut kilidini aç.`,
            targetLevel: (n) => `Seviye ${n}'i tamamlayarak sonraki kapıyı aç.`
        },
        en: {
            pageTitle: 'COSMIC UNIVERSE v11.0 — Captain Nova Vex Story Saga',
            eyebrow: 'THE SHATTERED INFINITY · CAPTAIN NOVA VEX',
            heading: 'Multiverse Story Campaign',
            sub: 'Master a distinct universe and genre in each chapter to break all 8 dimensional seals.',
            audioOn: 'Audio On',
            audioOff: 'Muted',
            unlockAll: 'Preview All Chapters',
            unlockDone: 'All 8 Unlocked ✓',
            reset: 'Reset',
            resetConfirm: 'Confirm Reset?',
            nextLine: 'Next Line',
            skipIntro: 'Launch Now',
            dialogueReady: 'Telemetry locked — ready for deployment!',
            lblGame: 'ASSIGNED UNIVERSE / GAME',
            lblObjective: 'CHAPTER UNLOCK OBJECTIVE',
            lblReward: 'COMPLETION REWARD',
            launch: (id) => `Launch Chapter ${id} Mission`,
            replay: (id) => `Replay Chapter ${id}`,
            launchAlt: 'Open Full Cosmic Survivors',
            badgesHeading: 'Captain Nova Vex Commendations',
            chShort: (id) => `CH.${id}`,
            targetScore: (n) => `Reach ${n}+ score to stabilize this rift sector.`,
            targetLevel: (n) => `Complete Level ${n} to unlock the next dimension.`
        }
    };

    function getLang() {
        return (global.CosmicI18n && global.CosmicI18n.getLang()) || 'tr';
    }

    function c() {
        return COPY[getLang()] || COPY.tr;
    }

    function starsStr(n) {
        const s = Math.min(3, Math.max(0, Number(n) || 0));
        return '★'.repeat(s) + '☆'.repeat(3 - s);
    }

    function refreshIcons() {
        if (global.lucide && typeof global.lucide.createIcons === 'function') {
            global.lucide.createIcons();
        }
    }

    function findGameMeta(gameId) {
        return (global.COSMIC_ARCADE_GAMES || []).find(g => g.id === gameId) || null;
    }

    function updateCreditsAndStats() {
        const lang = getLang();
        const creditsEl = document.getElementById('creditsDisplay');
        if (creditsEl && global.CosmicPersistence) {
            creditsEl.textContent = Number(global.CosmicPersistence.load().credits || 0).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR');
        }
        if (global.CosmicStoryStore) {
            const st = global.CosmicStoryStore.getStats();
            document.getElementById('storyStarsStat').textContent = `${st.totalStoryStars} / ${st.maxStoryStars} ★`;
            document.getElementById('storyClearedStat').textContent = `${st.completedCount} / ${st.totalChapters}`;
        }
    }

    function renderChapterMap() {
        const track = document.getElementById('chapterMapTrack');
        if (!track || !global.COSMIC_STORY_CHAPTERS || !global.CosmicStoryStore) return;
        const lang = getLang();
        const storyState = global.CosmicStoryStore.load();

        track.innerHTML = '';
        global.COSMIC_STORY_CHAPTERS.forEach((ch) => {
            const unlocked = ch.id <= storyState.unlockedChapter;
            const rec = storyState.completedChapters[ch.id] || null;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'chapter-node-btn'
                + (ch.id === state.selectedChapterId ? ' active' : '')
                + (rec ? ' cleared' : '')
                + (!unlocked ? ' locked' : '');
            btn.innerHTML = `
                <div class="ch-thumb-wrap">
                    <img src="${ch.image}" alt="">
                    ${!unlocked ? '<div class="ch-lock-badge"><i data-lucide="lock"></i></div>' : ''}
                </div>
                <div class="ch-node-top">
                    <span>${c().chShort(ch.id)}</span>
                    <span class="ch-node-stars">${rec ? starsStr(rec.stars) : (unlocked ? '●' : '—')}</span>
                </div>
                <div class="ch-node-title">${ch.title[lang] || ch.title.tr}</div>
            `;
            btn.addEventListener('click', () => {
                if (!unlocked) return;
                if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
                state.selectedChapterId = ch.id;
                state.dialogueIdx = 0;
                renderAll();
            });
            track.appendChild(btn);
        });
    }

    function renderSelectedChapter() {
        const ch = global.CosmicStoryStore && global.CosmicStoryStore.getChapter(state.selectedChapterId);
        if (!ch) return;
        const lang = getLang();
        const copy = c();
        const storyState = global.CosmicStoryStore.load();
        const rec = storyState.completedChapters[ch.id] || null;
        const gMeta = findGameMeta(ch.gameId);

        document.getElementById('cinemaBiomeImg').src = ch.image;
        document.getElementById('cinemaChapterBadge').textContent = `${copy.chShort(ch.id)} / 8`;
        document.getElementById('cinemaSectorBadge').textContent = ch.sector[lang] || ch.sector.tr;
        document.getElementById('cinemaEngineBadge').textContent = gMeta ? `${gMeta.engine} · ${gMeta.lang}` : 'Neo-Pixel';

        // Visual Novel Dialogue
        const lines = ch.dialogue || [];
        const line = lines[state.dialogueIdx] || lines[lines.length - 1];
        const portraitWrap = document.getElementById('vnPortraitWrap');
        const speakerImg = document.getElementById('vnSpeakerImg');
        const aiHolo = document.getElementById('vnAiHolo');
        const speakerNameEl = document.getElementById('vnSpeakerName');
        const stepCountEl = document.getElementById('vnStepCount');
        const dialogueTextEl = document.getElementById('vnDialogueText');

        if (portraitWrap) portraitWrap.setAttribute('data-mood', ch.heroMood || 'focused');
        if (line) {
            const isNova = line.speaker.toLowerCase().includes('nova');
            speakerImg.classList.toggle('hidden', !isNova);
            aiHolo.classList.toggle('hidden', isNova);
            speakerNameEl.textContent = line.speaker.toUpperCase();
            stepCountEl.textContent = `${Math.min(state.dialogueIdx + 1, lines.length)} / ${lines.length}`;
            dialogueTextEl.textContent = line.text[lang] || line.text.tr;
        }

        const atEnd = state.dialogueIdx >= lines.length - 1;
        document.getElementById('btnNextDialogueLabel').textContent = atEnd ? copy.dialogueReady : copy.nextLine;
        document.getElementById('btnSkipDialogueLabel').textContent = copy.skipIntro;

        // Right Dossier
        document.getElementById('dossierTitle').textContent = ch.title[lang] || ch.title.tr;
        document.getElementById('dossierStars').textContent = rec ? starsStr(rec.stars) : '☆☆☆';
        document.getElementById('dossierLore').textContent = ch.lore[lang] || ch.lore.tr;
        document.getElementById('lblMissionGame').textContent = copy.lblGame;
        document.getElementById('lblObjectiveTarget').textContent = copy.lblObjective;
        document.getElementById('lblRewardBox').textContent = copy.lblReward;

        if (gMeta) {
            const logo = document.getElementById('linkedGameLogo');
            logo.src = `assets/v11/thumbs/${gMeta.id}.png`;
            logo.onerror = () => { logo.src = `assets/v11/sprites/${gMeta.sprite}.png`; };
            document.getElementById('linkedGameTitle').textContent = gMeta.title[lang] || gMeta.title.tr;
            document.getElementById('linkedGameMeta').textContent = `${gMeta.engine} · ${gMeta.lang}`;
        }

        document.getElementById('objectiveBoxText').textContent = ch.targetType === 'score'
            ? copy.targetScore(ch.targetValue)
            : copy.targetLevel(ch.targetValue);

        document.getElementById('rewardCreditsBadge').textContent = `+${ch.reward.credits} CRD`;
        document.getElementById('rewardTitleBadge').textContent = ch.reward.badgeTitle[lang] || ch.reward.badgeTitle.tr;

        const launchBtn = document.getElementById('btnLaunchChapter');
        launchBtn.href = `games/${encodeURIComponent(ch.gameId)}/index.html?chapter=${ch.id}`;
        document.getElementById('btnLaunchChapterLabel').textContent = rec ? copy.replay(ch.id) : copy.launch(ch.id);

        const altBtn = document.getElementById('btnLaunchAltSurvivors');
        altBtn.classList.toggle('hidden', ch.id !== 3);
        document.getElementById('btnLaunchAltLabel').textContent = copy.launchAlt;
    }

    function renderBadgesGrid() {
        const grid = document.getElementById('storyBadgesGrid');
        if (!grid || !global.COSMIC_STORY_CHAPTERS || !global.CosmicStoryStore) return;
        const lang = getLang();
        const st = global.CosmicStoryStore.load();
        grid.innerHTML = global.COSMIC_STORY_CHAPTERS.map((ch) => {
            const earned = Boolean(st.completedChapters[ch.id]);
            return `
                <div class="story-badge-tile ${earned ? 'earned' : ''}">
                    <i data-lucide="${earned ? 'award' : 'lock'}"></i>
                    <div>
                        <div class="badge-tile-name">${ch.reward.badgeTitle[lang] || ch.reward.badgeTitle.tr}</div>
                        <div class="badge-tile-ch">${c().chShort(ch.id)} · +${ch.reward.credits} CRD</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function syncStaticTexts() {
        const lang = getLang();
        const copy = c();
        document.title = copy.pageTitle;
        document.documentElement.lang = lang;
        document.getElementById('sagaEyebrow').textContent = copy.eyebrow;
        document.getElementById('storyPageTitle').textContent = copy.heading;
        document.getElementById('storyPageSub').textContent = copy.sub;
        document.getElementById('badgesHeading').textContent = copy.badgesHeading;
        document.getElementById('btnResetStoryLabel').textContent = state.resetArmed ? copy.resetConfirm : copy.reset;

        const unlockedAll = global.CosmicStoryStore && global.CosmicStoryStore.load().unlockedChapter >= 8;
        document.getElementById('btnUnlockAllLabel').textContent = unlockedAll ? copy.unlockDone : copy.unlockAll;

        const muted = Boolean(global.CosmicAudio && global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
        document.getElementById('audioToggleLabel').textContent = muted ? copy.audioOff : copy.audioOn;
        if (global.CosmicI18n && typeof global.CosmicI18n.applyTranslations === 'function') {
            global.CosmicI18n.applyTranslations();
        }
    }

    function renderAll() {
        syncStaticTexts();
        updateCreditsAndStats();
        renderChapterMap();
        renderSelectedChapter();
        renderBadgesGrid();
        refreshIcons();
    }

    function bindEvents() {
        document.getElementById('btnNextDialogue')?.addEventListener('click', () => {
            const ch = global.CosmicStoryStore.getChapter(state.selectedChapterId);
            if (!ch) return;
            if (state.dialogueIdx < ch.dialogue.length - 1) {
                state.dialogueIdx++;
                if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
                renderSelectedChapter();
                refreshIcons();
            } else {
                const href = document.getElementById('btnLaunchChapter')?.href;
                if (href) location.href = href;
            }
        });

        document.getElementById('btnSkipDialogue')?.addEventListener('click', () => {
            const href = document.getElementById('btnLaunchChapter')?.href;
            if (href) location.href = href;
        });

        document.getElementById('btnUnlockAllStory')?.addEventListener('click', () => {
            if (!global.CosmicStoryStore) return;
            global.CosmicStoryStore.unlockChapter(8);
            if (global.CosmicAudio) global.CosmicAudio.play('powerup');
            renderAll();
        });

        document.getElementById('btnResetStory')?.addEventListener('click', () => {
            if (!state.resetArmed) {
                state.resetArmed = true;
                syncStaticTexts();
                clearTimeout(state.resetTimer);
                state.resetTimer = setTimeout(() => { state.resetArmed = false; syncStaticTexts(); }, 3000);
                return;
            }
            state.resetArmed = false;
            clearTimeout(state.resetTimer);
            global.CosmicStoryStore?.reset();
            state.selectedChapterId = 1;
            state.dialogueIdx = 0;
            renderAll();
        });

        const audioBtn = document.getElementById('audioToggleBtn');
        audioBtn?.addEventListener('click', () => {
            if (!global.CosmicAudio) return;
            global.CosmicAudio.unlock();
            const cur = Boolean(global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
            global.CosmicAudio.setMuted(!cur);
            document.getElementById('audioToggleIcon')?.setAttribute('data-lucide', !cur ? 'volume-x' : 'volume-2');
            audioBtn.classList.toggle('is-muted', !cur);
            syncStaticTexts();
            refreshIcons();
        });

        global.addEventListener('cosmic:langchange', renderAll);
    }

    function init() {
        const params = new URLSearchParams(location.search);
        const reqCh = parseInt(params.get('chapter') || '0', 10);
        const st = global.CosmicStoryStore ? global.CosmicStoryStore.load() : { unlockedChapter: 1 };
        if (reqCh >= 1 && reqCh <= 8 && reqCh <= st.unlockedChapter) {
            state.selectedChapterId = reqCh;
        } else {
            state.selectedChapterId = Math.min(8, Math.max(1, st.unlockedChapter || 1));
        }

        bindEvents();
        renderAll();
        if (global.gsap) {
            global.gsap.from('.story-cinema-grid, .chapter-map-panel', {
                opacity: 0, y: 10, duration: 0.35, stagger: 0.08, ease: 'power2.out', clearProps: 'transform,opacity'
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
