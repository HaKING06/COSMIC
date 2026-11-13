// =============================================================================
// COSMIC UNIVERSE v12.0 — 24-CHAPTER SEASON 1 STORY & CUTSCENE CONTROLLER (js/story.js)
// =============================================================================
(function (global) {
    'use strict';

    const state = {
        selectedChapterId: 1,
        activeAct: 1,
        dialogueIdx: 0,
        autoPlay: true,
        resetArmed: false,
        resetTimer: null,
        cutscene: null,
        finaleDismissed: false,
        resizeObserver: null
    };

    const ROMAN_ACTS = ['', 'I', 'II', 'III', 'IV'];

    const COPY = {
        tr: {
            pageTitle: 'COSMIC UNIVERSE v12.0 — Kaptan Nova Vex: Sezon 1 (24 Bölüm)',
            eyebrow: 'PARÇALANAN SONSUZLUK · SEZON 1 (24 BÖLÜM)',
            heading: 'Çoklu Evren Hikâye Seferi',
            sub: '4 perdelik 60 FPS çok katmanlı ara sahneler ve her bölümde değişen oyun evrenleriyle destanı tamamla.',
            audioOn: 'Ses Açık',
            audioOff: 'Sessiz',
            resumeBtn: (ch) => `Kaldığın Yerden Devam Et (Böl.${ch})`,
            resumeStat: (ch, done) => done ? 'SEZON 1 TAMAMLANDI ✓' : `OTOMATİK KAYIT · BÖL.${ch}`,
            unlockAll: 'Tüm 24 Bölümü Aç',
            unlockDone: '24 Bölüm Açıldı ✓',
            reset: 'Sıfırla',
            resetConfirm: 'Emin misin?',
            nextLine: 'Devam Et',
            skipIntro: 'Hemen Başla',
            autoOn: '▶ OTO SAHNE: AÇIK',
            autoOff: '⏸ OTO SAHNE: KAPALI',
            beatLabel: 'SAHNE',
            replayBtn: 'Tekrar',
            replayTitle: 'Ara Sahneyi Baştan Oynat',
            actLabel: (n) => `PERDE ${ROMAN_ACTS[n] || n}`,
            actProgress: 'Perde İlerlemesi',
            roleNova: 'PİLOT · NOVA VEX',
            roleSara: 'TAKTİK YZ · S.A.R.A.',
            roleKaelen: 'ANTAGONİST · AMİRAL KAELEN',
            roleArchitect: 'ANTAGONİST · MİMAR',
            keyHint: '[SPACE / ENTER]',
            chapterStamp: (id) => {
                const p = String(id).padStart(2, '0');
                return `BÖL.${p} // SEKTÖR ${p}`;
            },
            lblGame: 'OYNANACAK EVREN / OYUN',
            lblObjective: 'BÖLÜM KİLİT AÇMA HEDEFİ',
            lblReward: 'TAMAMLAMA ÖDÜLÜ',
            launch: (id) => `Bölüm ${id} Görevini Başlat`,
            replay: (id) => `Bölüm ${id} Tekrar Oyna`,
            launchAlt: 'Tam Ölçek Cosmic Survivors Aç',
            badgesHeading: 'Kaptan Nova Vex Sezon 1 Nişanları',
            chShort: (id) => `BÖL.${id}`,
            targetScore: (n) => `${n}+ puana ulaşarak boyut kilidini aç.`,
            targetLevel: (n) => `Seviye ${n}'i tamamlayarak sonraki kapıyı aç.`,
            finaleEyebrow: 'SEZON 1 TRAJEDİK FİNAL · BÖLÜM 24 TAMAMLANDI',
            finaleTitle: 'S.A.R.A. AI Çekirdeğini Feda Etti — Kaptan Vex Zaman Yarığına Sürüklendi…',
            finaleSub: 'Amiral Kaelen’in tekillik bombası filoyu ikiye yardı. Nova Vex bilinmeyen paralel bir galakside uyandı. İlerlemen otomatik kaydedildi — Sezon 2 çok yakında!'
        },
        en: {
            pageTitle: 'COSMIC UNIVERSE v12.0 — Captain Nova Vex: Season 1 (24 Chapters)',
            eyebrow: 'THE SHATTERED INFINITY · SEASON 1 (24 CHAPTERS)',
            heading: 'Multiverse Story Campaign',
            sub: 'Experience 4-Act 60 FPS multi-layer animated cutscenes and master a fresh game engine each chapter toward the tragic Season Finale.',
            audioOn: 'Audio On',
            audioOff: 'Muted',
            resumeBtn: (ch) => `Resume Journey (Ch.${ch})`,
            resumeStat: (ch, done) => done ? 'SEASON 1 COMPLETE ✓' : `AUTO-SAVED · CH.${ch}`,
            unlockAll: 'Unlock All 24 Chapters',
            unlockDone: 'All 24 Unlocked ✓',
            reset: 'Reset',
            resetConfirm: 'Confirm Reset?',
            nextLine: 'Next Beat',
            skipIntro: 'Launch Mission',
            autoOn: '▶ AUTO SCENE: ON',
            autoOff: '⏸ AUTO SCENE: PAUSED',
            beatLabel: 'BEAT',
            replayBtn: 'Replay',
            replayTitle: 'Replay Cutscene From Start',
            actLabel: (n) => `ACT ${ROMAN_ACTS[n] || n}`,
            actProgress: 'Act Progression',
            roleNova: 'PILOT · NOVA VEX',
            roleSara: 'TACTICAL AI · S.A.R.A.',
            roleKaelen: 'ANTAGONIST · ADMIRAL KAELEN',
            roleArchitect: 'ANTAGONIST · THE ARCHITECT',
            keyHint: '[SPACE / ENTER]',
            chapterStamp: (id) => {
                const p = String(id).padStart(2, '0');
                return `CH.${p} // SECTOR ${p}`;
            },
            lblGame: 'ASSIGNED UNIVERSE / GAME',
            lblObjective: 'CHAPTER UNLOCK OBJECTIVE',
            lblReward: 'COMPLETION REWARD',
            launch: (id) => `Launch Chapter ${id} Mission`,
            replay: (id) => `Replay Chapter ${id}`,
            launchAlt: 'Open Full Cosmic Survivors',
            badgesHeading: 'Captain Nova Vex Season 1 Commendations',
            chShort: (id) => `CH.${id}`,
            targetScore: (n) => `Reach ${n}+ score to stabilize this rift sector.`,
            targetLevel: (n) => `Complete Level ${n} to unlock the next dimension.`,
            finaleEyebrow: 'SEASON 1 TRAGIC FINALE · CHAPTER 24 CLEARED',
            finaleTitle: 'S.A.R.A. AI Sacrificed Her Core — Captain Vex Drifts Into an Unknown Rift…',
            finaleSub: 'Kaelen’s omega detonation tore space apart. Shielded in S.A.R.A.’s final surge, battered Nova enters a parallel sector. Progress saved — Season 2 Coming Soon!'
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
        return (global.COSMIC_ARCADE_GAMES || []).find((g) => g.id === gameId) || null;
    }

    function speakerProfile(speaker, lineMood, chId) {
        const copy = c();
        const sp = String(speaker || '').toLowerCase();
        const mood = lineMood || '';
        if (sp.includes('kaelen') || mood === 'kaelen') {
            return {
                key: 'kaelen',
                portrait: 'assets/v11/cast/admiral_kaelen.png',
                role: copy.roleKaelen
            };
        }
        if (sp.includes('architect') || sp.includes('mimar') || mood === 'architect') {
            return {
                key: 'architect',
                portrait: 'assets/v11/sprites/boss_core.png',
                role: copy.roleArchitect
            };
        }
        if (sp.includes('s.a.r.a') || sp.includes('sara') || mood === 'sara') {
            return {
                key: 'sara',
                portrait: 'assets/v11/cast/sara_ai.png',
                role: copy.roleSara
            };
        }
        return {
            key: 'nova',
            portrait: (mood === 'nova_damaged' || Number(chId) >= 21)
                ? 'assets/v11/cast/nova_damaged.png'
                : 'assets/v11/cast/nova_tactical.png',
            role: copy.roleNova
        };
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
            const resumeStatEl = document.getElementById('storyResumeStat');
            if (resumeStatEl) {
                resumeStatEl.textContent = c().resumeStat(st.unlockedChapter || 1, st.season1Completed);
            }
            const resumeLbl = document.getElementById('btnResumeStoryLabel');
            if (resumeLbl) {
                resumeLbl.textContent = c().resumeBtn(st.unlockedChapter || 1);
            }
        }
    }

    function renderActTabs() {
        const row = document.getElementById('actTabsRow');
        const acts = (global.COSMIC_STORY_META && global.COSMIC_STORY_META.acts) || [];
        if (!row || !acts.length || !global.CosmicStoryStore) return;
        const lang = getLang();
        const storyState = global.CosmicStoryStore.load();
        row.innerHTML = '';

        acts.forEach((act) => {
            const unlockedInAct = storyState.unlockedChapter >= act.range[0];
            let clearedInAct = 0;
            for (let cid = act.range[0]; cid <= act.range[1]; cid++) {
                if (storyState.completedChapters[cid]) clearedInAct++;
            }

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'act-tab-btn'
                + (act.id === state.activeAct ? ' active' : '')
                + (act.id === 4 ? ' act-finale' : '');
            const actTitle = act.title[lang] || act.title.tr;
            btn.innerHTML = `
                <span>${actTitle} <span style="opacity:.7">(${act.range[0]}–${act.range[1]})</span>${unlockedInAct ? '' : ' 🔒'}</span>
                <span class="act-tab-progress">${clearedInAct}/6</span>
            `;
            btn.addEventListener('click', () => {
                if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
                state.activeAct = act.id;
                if (state.selectedChapterId < act.range[0] || state.selectedChapterId > act.range[1]) {
                    const candidate = Math.min(storyState.unlockedChapter, act.range[0]);
                    if (candidate >= act.range[0] && candidate <= storyState.unlockedChapter) {
                        state.selectedChapterId = candidate;
                        state.dialogueIdx = 0;
                    }
                }
                renderAll();
            });
            row.appendChild(btn);
        });
    }

    function drawConstellationHyperlanes() {
        const track = document.getElementById('chapterMapTrack');
        const svg = document.getElementById('constellationSvg');
        if (!track || !svg) return;

        const nodes = Array.from(track.querySelectorAll('.chapter-node-btn'));
        if (nodes.length < 2) {
            svg.innerHTML = '';
            return;
        }

        const trackW = track.clientWidth;
        const trackH = track.clientHeight;
        if (!trackW || !trackH) return;

        svg.setAttribute('viewBox', `0 0 ${trackW} ${trackH}`);

        const pts = nodes.map((el) => ({
            x: el.offsetLeft + el.offsetWidth * 0.5,
            y: el.offsetTop + Math.min(el.offsetHeight * 0.42, 54),
            unlocked: el.dataset.unlocked === '1',
            cleared: el.dataset.cleared === '1'
        }));

        const parts = [];
        for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i];
            const b = pts[i + 1];
            const sameRow = Math.abs(a.y - b.y) < 24;
            let d;
            if (sameRow) {
                const mx = (a.x + b.x) * 0.5;
                const arc = i % 2 === 0 ? -12 : 12;
                d = `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${(a.y + arc).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
            } else {
                const my = (a.y + b.y) * 0.5;
                d = `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
            }

            if (a.cleared && b.unlocked) {
                parts.push(`<path class="hyperlane-cleared" d="${d}"></path>`);
                parts.push(`<path class="hyperlane-flow is-cleared" d="${d}"></path>`);
            } else if (a.unlocked && b.unlocked) {
                parts.push(`<path class="hyperlane-unlocked" d="${d}"></path>`);
                parts.push(`<path class="hyperlane-flow" d="${d}"></path>`);
            } else {
                parts.push(`<path class="hyperlane-locked" d="${d}"></path>`);
            }
        }

        pts.forEach((p) => {
            const fill = p.cleared ? '#34d399' : (p.unlocked ? 'var(--act-accent)' : 'rgba(148, 163, 184, 0.35)');
            parts.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${fill}" />`);
        });

        svg.innerHTML = parts.join('');
    }

    function renderChapterMap() {
        const panel = document.getElementById('chapterMapPanel');
        const track = document.getElementById('chapterMapTrack');
        if (!track || !global.COSMIC_STORY_CHAPTERS || !global.CosmicStoryStore) return;
        const lang = getLang();
        const copy = c();
        const storyState = global.CosmicStoryStore.load();
        const acts = (global.COSMIC_STORY_META && global.COSMIC_STORY_META.acts) || [];
        const actObj = acts.find((a) => a.id === state.activeAct) || { id: 1, range: [1, 6] };

        if (panel) panel.setAttribute('data-act', String(actObj.id || state.activeAct));

        const actChapters = global.COSMIC_STORY_CHAPTERS
            .filter((ch) => ch.id >= actObj.range[0] && ch.id <= actObj.range[1]);

        let actCleared = 0;
        actChapters.forEach((ch) => {
            if (storyState.completedChapters[ch.id]) actCleared++;
        });

        // Update Act Progress Meter
        const codeEl = document.getElementById('actProgressCode');
        const labelEl = document.getElementById('actProgressLabel');
        const meterEl = document.getElementById('actProgressMeter');
        const fillEl = document.getElementById('actProgressFill');
        const countEl = document.getElementById('actProgressCount');
        if (codeEl) codeEl.textContent = copy.actLabel(actObj.id || state.activeAct);
        if (labelEl) labelEl.textContent = copy.actProgress;
        if (meterEl) meterEl.setAttribute('aria-valuenow', String(actCleared));
        if (fillEl) fillEl.style.width = `${Math.round((actCleared / 6) * 100)}%`;
        if (countEl) countEl.textContent = `${actCleared} / 6`;

        track.innerHTML = '<svg class="constellation-svg" id="constellationSvg" aria-hidden="true"></svg>';

        actChapters.forEach((ch) => {
            const unlocked = ch.id <= storyState.unlockedChapter;
            const rec = storyState.completedChapters[ch.id] || null;
            const padded = String(ch.id).padStart(2, '0');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.dataset.unlocked = unlocked ? '1' : '0';
            btn.dataset.cleared = rec ? '1' : '0';
            btn.className = 'chapter-node-btn'
                + (ch.id === state.selectedChapterId ? ' active' : '')
                + (rec ? ' cleared' : '')
                + (!unlocked ? ' locked' : '');
            btn.innerHTML = `
                <div class="ch-thumb-wrap">
                    <img src="${ch.image}" alt="">
                    <span class="ch-orbital-beacon">${padded}</span>
                    ${!unlocked ? '<div class="ch-lock-badge"><i data-lucide="lock"></i></div>' : ''}
                </div>
                <div class="ch-node-top">
                    <span>${copy.chShort(ch.id)}</span>
                    <span class="ch-node-stars">${rec ? starsStr(rec.stars) : (unlocked ? '●' : '—')}</span>
                </div>
                <div class="ch-node-title">${ch.title[lang] || ch.title.tr}</div>
            `;
            btn.addEventListener('click', () => {
                if (!unlocked) return;
                if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
                state.selectedChapterId = ch.id;
                state.activeAct = Math.ceil(ch.id / 6);
                state.dialogueIdx = 0;
                state.finaleDismissed = false;
                global.CosmicStoryStore.setLastChapter?.(ch.id);
                renderAll();
            });
            track.appendChild(btn);
        });

        requestAnimationFrame(drawConstellationHyperlanes);
    }

    function renderBeatStepper(lines) {
        const stepper = document.getElementById('cinemaBeatStepper');
        if (!stepper) return;
        const copy = c();
        const total = lines.length;
        if (!total) {
            stepper.innerHTML = '';
            return;
        }
        stepper.innerHTML = `<span class="beat-stepper-label">${copy.beatLabel}</span>`;
        for (let i = 0; i < total; i++) {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'beat-step-pill'
                + (i === state.dialogueIdx ? ' active' : '')
                + (i < state.dialogueIdx ? ' visited' : '');
            pill.textContent = String(i + 1);
            pill.setAttribute('aria-label', `${copy.beatLabel} ${i + 1}`);
            pill.setAttribute('aria-pressed', i === state.dialogueIdx ? 'true' : 'false');
            pill.addEventListener('click', () => {
                if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
                state.dialogueIdx = i;
                renderSelectedChapter(true);
                refreshIcons();
            });
            stepper.appendChild(pill);
        }
    }

    function renderSelectedChapter(skipSceneReset, forceSlam) {
        const ch = global.CosmicStoryStore && global.CosmicStoryStore.getChapter(state.selectedChapterId);
        if (!ch) return;
        const lang = getLang();
        const copy = c();
        const storyState = global.CosmicStoryStore.load();
        const rec = storyState.completedChapters[ch.id] || null;
        const gMeta = findGameMeta(ch.gameId);

        document.getElementById('cinemaBiomeImg').src = ch.image;
        document.getElementById('cinemaChapterBadge').textContent = `${copy.chShort(ch.id)} / 24`;
        document.getElementById('cinemaSectorBadge').textContent = ch.sector[lang] || ch.sector.tr;
        document.getElementById('cinemaEngineBadge').textContent = gMeta ? `${gMeta.engine} · ${gMeta.lang}` : 'Neo-Pixel';

        const lines = ch.dialogue || [];
        if (state.dialogueIdx >= lines.length) state.dialogueIdx = Math.max(0, lines.length - 1);
        const line = lines[state.dialogueIdx] || lines[lines.length - 1];

        const dialogueBox = document.getElementById('vnDialogueBox');
        const portraitWrap = document.getElementById('vnPortraitWrap');
        const speakerImg = document.getElementById('vnSpeakerImg');
        const aiHolo = document.getElementById('vnAiHolo');
        const speakerNameEl = document.getElementById('vnSpeakerName');
        const speakerRoleEl = document.getElementById('vnSpeakerRole');
        const stepCountEl = document.getElementById('vnStepCount');
        const dialogueTextEl = document.getElementById('vnDialogueText');

        const profile = speakerProfile(line?.speaker, line?.mood, ch.id);
        const beatMood = line?.fx || ch.heroMood || 'focused';

        if (dialogueBox) dialogueBox.setAttribute('data-speaker', profile.key);
        if (portraitWrap) {
            portraitWrap.setAttribute('data-mood', beatMood);
            portraitWrap.setAttribute('data-speaker', profile.key);
        }
        if (speakerImg) {
            speakerImg.classList.remove('hidden');
            speakerImg.src = profile.portrait;
        }
        if (aiHolo) aiHolo.classList.add('hidden');

        if (speakerNameEl) speakerNameEl.textContent = (line?.speaker || 'CAPTAIN NOVA VEX').toUpperCase();
        if (speakerRoleEl) speakerRoleEl.textContent = profile.role;
        if (stepCountEl) stepCountEl.textContent = `${Math.min(lines.length, state.dialogueIdx + 1)} / ${lines.length}`;

        renderBeatStepper(lines);

        const sceneMeta = {
            speaker: line?.speaker || 'Captain Nova Vex',
            mood: beatMood,
            stamp: copy.chapterStamp(ch.id),
            title: ch.title[lang] || ch.title.tr,
            forceSlam: Boolean(forceSlam)
        };

        const lineText = line?.text ? (line.text[lang] || line.text.tr) : '';
        if (state.cutscene) {
            if (!skipSceneReset) {
                state.cutscene.setScene(ch.id, ch.image, beatMood, sceneMeta);
            } else {
                state.cutscene.setBeat(sceneMeta);
                if (line?.fx === 'shake' || line?.fx === 'tragic') {
                    state.cutscene.triggerImpact(line.fx === 'tragic' ? '#f43f5e' : '#38bdf8');
                }
            }
            state.cutscene.typeDialogue(lineText, dialogueTextEl, () => {
                if (global.CosmicAudio && state.dialogueIdx > 0) global.CosmicAudio.play('uiClick', 0.4);
            });
        } else if (dialogueTextEl) {
            dialogueTextEl.textContent = lineText;
        }

        const isLastLine = state.dialogueIdx >= lines.length - 1;
        document.getElementById('btnNextDialogueLabel').textContent = isLastLine ? copy.skipIntro : copy.nextLine;

        // Finale banner when Chapter 24 Season 1 is cleared & user is viewing Ch.24
        const finaleEl = document.getElementById('seasonFinaleBanner');
        if (finaleEl) {
            const showFinale = Boolean(ch.id === 24 && storyState.season1Completed && !state.finaleDismissed);
            finaleEl.classList.toggle('hidden', !showFinale);
            if (showFinale) {
                document.getElementById('finaleEyebrow').textContent = copy.finaleEyebrow;
                document.getElementById('finaleTitle').textContent = copy.finaleTitle;
                document.getElementById('finaleSub').textContent = copy.finaleSub;
            }
        }

        // Right Dossier
        document.getElementById('dossierTitle').textContent = ch.title[lang] || ch.title.tr;
        document.getElementById('dossierStars').textContent = starsStr(rec ? rec.stars : 0);
        document.getElementById('dossierLore').textContent = ch.lore[lang] || ch.lore.tr;
        document.getElementById('linkedGameLogo').src = gMeta ? `assets/v11/thumbs/${gMeta.id}.png` : 'assets/v11/sprites/exo_trooper.png';
        document.getElementById('linkedGameLogo').onerror = function () {
            if (gMeta) this.src = `assets/v11/sprites/${gMeta.sprite}.png`;
        };
        document.getElementById('linkedGameTitle').textContent = gMeta ? (gMeta.title[lang] || gMeta.title.tr) : ch.gameId;
        document.getElementById('linkedGameMeta').textContent = gMeta ? `${gMeta.engine} · ${gMeta.lang} · ★${gMeta.difficulty}` : 'Neo-Pixel';

        document.getElementById('objectiveBoxText').textContent = ch.targetType === 'score'
            ? copy.targetScore(ch.targetValue)
            : copy.targetLevel(ch.targetValue);
        document.getElementById('rewardCreditsBadge').textContent = `+${ch.reward.credits} CRD`;
        document.getElementById('rewardTitleBadge').textContent = ch.reward.badgeTitle[lang] || ch.reward.badgeTitle.tr;

        const launchBtn = document.getElementById('btnLaunchChapter');
        const launchHref = `games/${encodeURIComponent(ch.gameId)}/index.html?chapter=${ch.id}`;
        launchBtn.href = launchHref;
        document.getElementById('btnLaunchChapterLabel').textContent = rec ? copy.replay(ch.id) : copy.launch(ch.id);

        const altSurvivors = document.getElementById('btnLaunchAltSurvivors');
        if (altSurvivors) {
            altSurvivors.classList.toggle('hidden', ch.id !== 3 && ch.id !== 24);
        }
    }

    function renderBadgesGrid() {
        const grid = document.getElementById('storyBadgesGrid');
        if (!grid || !global.COSMIC_STORY_CHAPTERS || !global.CosmicStoryStore) return;
        const copy = c();
        const lang = getLang();
        const storyState = global.CosmicStoryStore.load();

        let earnedCount = 0;
        grid.innerHTML = '';
        global.COSMIC_STORY_CHAPTERS.forEach((ch) => {
            const rec = storyState.completedChapters[ch.id] || null;
            if (rec) earnedCount++;
            const actNum = Math.ceil(ch.id / 6);
            const gMeta = findGameMeta(ch.gameId);
            const card = document.createElement('div');
            card.className = 'badge-item' + (rec ? ' earned' : ' locked');
            card.setAttribute('data-act', String(actNum));
            card.innerHTML = `
                <div class="badge-icon-slot">
                    <img src="${gMeta ? `assets/v11/sprites/${gMeta.sprite}.png` : 'assets/v11/sprites/exo_trooper.png'}" alt="">
                </div>
                <div class="badge-info">
                    <div class="badge-name">${ch.reward.badgeTitle[lang] || ch.reward.badgeTitle.tr}</div>
                    <div class="badge-meta-row">
                        <span class="badge-act-tag">${copy.actLabel(actNum)}</span>
                        <span class="badge-ch">${copy.chShort(ch.id)} · ${rec ? starsStr(rec.stars) : '🔒'}</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        const countPill = document.getElementById('badgesCountPill');
        if (countPill) {
            countPill.textContent = `${earnedCount} / ${global.COSMIC_STORY_CHAPTERS.length}`;
        }
    }

    function syncStaticTexts() {
        const lang = getLang();
        const copy = c();
        document.documentElement.lang = lang;
        document.title = copy.pageTitle;
        document.getElementById('storyTopbarSub').textContent = 'V12.0 SEASON 1 SAGA';
        document.getElementById('sagaEyebrow').textContent = copy.eyebrow;
        document.getElementById('storyPageTitle').textContent = copy.heading;
        document.getElementById('storyPageSub').textContent = copy.sub;
        document.getElementById('lblMissionGame').textContent = copy.lblGame;
        document.getElementById('lblObjectiveTarget').textContent = copy.lblObjective;
        document.getElementById('lblRewardBox').textContent = copy.lblReward;
        document.getElementById('btnLaunchAltLabel').textContent = copy.launchAlt;
        document.getElementById('badgesHeading').textContent = copy.badgesHeading;
        document.getElementById('btnSkipDialogueLabel').textContent = copy.skipIntro;

        const keyHintEl = document.getElementById('vnKeyHint');
        if (keyHintEl) keyHintEl.textContent = copy.keyHint;

        const replayBtn = document.getElementById('btnReplayCutscene');
        const replayLbl = document.getElementById('btnReplayCutsceneLabel');
        if (replayBtn) replayBtn.title = copy.replayTitle;
        if (replayLbl) replayLbl.textContent = copy.replayBtn;

        const autoBtn = document.getElementById('btnCutsceneAutoplay');
        if (autoBtn) autoBtn.textContent = state.autoPlay ? copy.autoOn : copy.autoOff;

        const st = global.CosmicStoryStore ? global.CosmicStoryStore.load() : { unlockedChapter: 1 };
        document.getElementById('btnUnlockAllLabel').textContent = st.unlockedChapter >= 24 ? copy.unlockDone : copy.unlockAll;
        document.getElementById('btnResetStoryLabel').textContent = state.resetArmed ? copy.resetConfirm : copy.reset;

        const muted = Boolean(global.CosmicAudio && global.CosmicAudio.prefs && global.CosmicAudio.prefs.muted);
        const audioLbl = document.getElementById('audioToggleLabel');
        if (audioLbl) audioLbl.textContent = muted ? copy.audioOff : copy.audioOn;
    }

    function advanceDialogueOrStay() {
        const ch = global.CosmicStoryStore.getChapter(state.selectedChapterId);
        if (!ch) return;
        if (state.dialogueIdx < ch.dialogue.length - 1) {
            state.dialogueIdx++;
            renderSelectedChapter(true);
            refreshIcons();
        } else {
            global.CosmicStoryStore.markCutsceneSeen?.(ch.id);
        }
    }

    function advanceOrFinishDialogue() {
        if (state.cutscene && state.cutscene.skipTypewriter()) return;
        const ch = global.CosmicStoryStore.getChapter(state.selectedChapterId);
        if (!ch) return;
        if (state.dialogueIdx < ch.dialogue.length - 1) {
            state.dialogueIdx++;
            if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
            renderSelectedChapter(true);
            refreshIcons();
        } else {
            global.CosmicStoryStore.markCutsceneSeen?.(ch.id);
            const href = document.getElementById('btnLaunchChapter')?.href;
            if (href) location.href = href;
        }
    }

    function renderAll() {
        updateCreditsAndStats();
        syncStaticTexts();
        renderActTabs();
        renderChapterMap();
        renderSelectedChapter(false);
        renderBadgesGrid();
        refreshIcons();
    }

    function bindEvents() {
        document.getElementById('btnNextDialogue')?.addEventListener('click', advanceOrFinishDialogue);

        document.getElementById('btnSkipDialogue')?.addEventListener('click', () => {
            const href = document.getElementById('btnLaunchChapter')?.href;
            if (href) location.href = href;
        });

        document.getElementById('btnReplayCutscene')?.addEventListener('click', () => {
            if (global.CosmicAudio) global.CosmicAudio.play('uiClick');
            state.dialogueIdx = 0;
            renderSelectedChapter(false, true);
            refreshIcons();
        });

        document.getElementById('btnCutsceneAutoplay')?.addEventListener('click', () => {
            state.autoPlay = !state.autoPlay;
            if (state.cutscene) state.cutscene.setAutoPlay(state.autoPlay);
            syncStaticTexts();
        });

        document.getElementById('btnResumeStory')?.addEventListener('click', () => {
            const st = global.CosmicStoryStore ? global.CosmicStoryStore.load() : { unlockedChapter: 1 };
            state.selectedChapterId = Math.min(24, Math.max(1, st.unlockedChapter || 1));
            state.activeAct = Math.ceil(state.selectedChapterId / 6);
            state.dialogueIdx = 0;
            renderAll();
        });

        document.getElementById('btnCloseFinaleBanner')?.addEventListener('click', () => {
            state.finaleDismissed = true;
            document.getElementById('seasonFinaleBanner')?.classList.add('hidden');
        });

        document.getElementById('btnUnlockAllStory')?.addEventListener('click', () => {
            if (!global.CosmicStoryStore) return;
            global.CosmicStoryStore.unlockChapter(24);
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
            state.activeAct = 1;
            state.dialogueIdx = 0;
            state.finaleDismissed = false;
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

        document.addEventListener('keydown', (evt) => {
            if (evt.ctrlKey || evt.metaKey || evt.altKey) return;
            if (evt.key !== ' ' && evt.key !== 'Enter') return;
            const target = evt.target;
            if (target && target.closest && target.closest('input, textarea, select, button, a, [contenteditable="true"]')) {
                return;
            }
            evt.preventDefault();
            advanceOrFinishDialogue();
        });

        const track = document.getElementById('chapterMapTrack');
        if (track && typeof global.ResizeObserver === 'function') {
            state.resizeObserver = new global.ResizeObserver(() => {
                drawConstellationHyperlanes();
            });
            state.resizeObserver.observe(track);
        } else {
            global.addEventListener('resize', drawConstellationHyperlanes);
        }

        global.addEventListener('cosmic:langchange', renderAll);
    }

    function init() {
        const params = new URLSearchParams(location.search);
        const reqCh = parseInt(params.get('chapter') || '0', 10);
        const st = global.CosmicStoryStore ? global.CosmicStoryStore.load() : { unlockedChapter: 1, lastSelectedChapter: 1 };
        if (reqCh >= 1 && reqCh <= 24 && reqCh <= st.unlockedChapter) {
            state.selectedChapterId = reqCh;
        } else {
            state.selectedChapterId = Math.min(st.unlockedChapter || 1, Math.max(1, st.lastSelectedChapter || st.unlockedChapter || 1));
        }
        state.activeAct = Math.min(4, Math.max(1, Math.ceil(state.selectedChapterId / 6)));

        const cnv = document.getElementById('cutsceneCanvas');
        if (cnv && global.CosmicCutscenePlayer) {
            state.cutscene = new global.CosmicCutscenePlayer({
                canvas: cnv,
                onAutoNext: advanceDialogueOrStay,
                onTypeStateChange: (isTyping) => {
                    document.getElementById('vnDialogueBox')?.classList.toggle('is-typing', Boolean(isTyping));
                }
            });
            state.cutscene.setAutoPlay(state.autoPlay);
            state.cutscene.start();
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
