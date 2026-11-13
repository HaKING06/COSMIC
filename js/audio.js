/**
 * COSMIC SURVIVORS v9.0 — Audio Engine (Howler.js + Web Audio Ambient Synth + Procedural Fallback)
 * Handles SFX channels with rate-limiting so rapid firing never clips or fatigues the ears,
 * plus a subtle low-frequency spatial ambient drone that respects volume/mute preferences.
 */
(function (global) {
    'use strict';

    const PREF_KEY = 'cosmic_v9_audio_prefs';
    const DEFAULT_PREFS = {
        muted: false,
        sfxVol: 0.55,
        ambVol: 0.22
    };

    const SFX_FILES = {
        shootLaser:   { src: 'assets/audio/shoot_laser.ogg',   vol: 0.24, cooldown: 55 },
        shootPlasma:  { src: 'assets/audio/shoot_plasma.ogg',  vol: 0.30, cooldown: 85 },
        shootMissile: { src: 'assets/audio/shoot_missile.ogg', vol: 0.30, cooldown: 110 },
        hitMetal:     { src: 'assets/audio/hit_metal.ogg',     vol: 0.20, cooldown: 45 },
        hitShield:    { src: 'assets/audio/hit_shield.ogg',    vol: 0.26, cooldown: 65 },
        explodeSmall: { src: 'assets/audio/explode_small.ogg', vol: 0.30, cooldown: 60 },
        explodeBoss:  { src: 'assets/audio/explode_boss.ogg',  vol: 0.65, cooldown: 250 },
        xpPickup:     { src: 'assets/audio/xp_pickup.ogg',     vol: 0.16, cooldown: 50 },
        powerup:      { src: 'assets/audio/powerup.ogg',       vol: 0.45, cooldown: 120 },
        levelup:      { src: 'assets/audio/levelup.ogg',       vol: 0.58, cooldown: 300 },
        chestOpen:    { src: 'assets/audio/chest_open.ogg',    vol: 0.55, cooldown: 300 },
        dash:         { src: 'assets/audio/dash.ogg',          vol: 0.42, cooldown: 180 },
        emp:          { src: 'assets/audio/emp.ogg',           vol: 0.50, cooldown: 220 },
        bossAlarm:    { src: 'assets/audio/boss_alarm.ogg',    vol: 0.62, cooldown: 600 },
        playerHurt:   { src: 'assets/audio/player_hurt.ogg',   vol: 0.48, cooldown: 180 },
        uiClick:      { src: 'assets/audio/ui_click.ogg',      vol: 0.30, cooldown: 40 },
        uiConfirm:    { src: 'assets/audio/ui_confirm.ogg',    vol: 0.36, cooldown: 80 },
        uiBack:       { src: 'assets/audio/ui_back.ogg',       vol: 0.30, cooldown: 80 }
    };

    class CosmicAudioEngine {
        constructor() {
            this.prefs = this._loadPrefs();
            this.howls = {};
            this.lastPlayAt = {};
            this.ctx = null;
            this.ambNodes = null;
            this.initialized = false;
            this.ambientRunning = false;
        }

        _loadPrefs() {
            try {
                const raw = localStorage.getItem(PREF_KEY);
                if (raw) return Object.assign({}, DEFAULT_PREFS, JSON.parse(raw));
            } catch (e) { /* ignore storage errors */ }
            return Object.assign({}, DEFAULT_PREFS);
        }

        _savePrefs() {
            try {
                localStorage.setItem(PREF_KEY, JSON.stringify(this.prefs));
            } catch (e) { /* ignore */ }
        }

        init() {
            if (this.initialized) return;
            this.initialized = true;
            if (typeof global.Howl === 'function') {
                for (const [key, cfg] of Object.entries(SFX_FILES)) {
                    try {
                        this.howls[key] = new global.Howl({
                            src: [cfg.src],
                            volume: cfg.vol * (this.prefs.muted ? 0 : this.prefs.sfxVol),
                            preload: true
                        });
                    } catch (e) { /* safe ignore */ }
                }
            }
            this._applyVolumes();
        }

        unlock() {
            this.init();
            try {
                if (typeof global.Howler !== 'undefined' && global.Howler.ctx && global.Howler.ctx.state === 'suspended') {
                    global.Howler.ctx.resume();
                }
                const AC = global.AudioContext || global.webkitAudioContext;
                if (AC && !this.ctx) {
                    this.ctx = (global.Howler && global.Howler.ctx) ? global.Howler.ctx : new AC();
                }
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            } catch (e) { /* ignore autoplay restrictions */ }
        }

        startAmbient() {
            this.unlock();
            if (this.ambientRunning || !this.ctx || this.prefs.muted || this.prefs.ambVol <= 0.01) return;
            try {
                const ctx = this.ctx;
                const masterGain = ctx.createGain();
                masterGain.gain.value = Math.max(0.0001, this.prefs.ambVol * 0.14);

                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 185;
                filter.Q.value = 1.4;

                const osc1 = ctx.createOscillator();
                osc1.type = 'sawtooth';
                osc1.frequency.value = 55; // Deep calm A1 space pad

                const osc2 = ctx.createOscillator();
                osc2.type = 'triangle';
                osc2.frequency.value = 82.41; // Warm E2 fifth harmonic

                const lfo = ctx.createOscillator();
                const lfoGain = ctx.createGain();
                lfo.frequency.value = 0.09; // Slow 11s breathing filter sweep
                lfoGain.gain.value = 65;
                lfo.connect(lfoGain);
                lfoGain.connect(filter.frequency);

                osc1.connect(filter);
                osc2.connect(filter);
                filter.connect(masterGain);
                masterGain.connect(ctx.destination);

                osc1.start();
                osc2.start();
                lfo.start();

                this.ambNodes = { masterGain, filter, osc1, osc2, lfo, lfoGain };
                this.ambientRunning = true;
            } catch (e) { /* ignore Web Audio restrictions */ }
        }

        stopAmbient() {
            if (!this.ambientRunning || !this.ambNodes) return;
            try {
                this.ambNodes.osc1.stop();
                this.ambNodes.osc2.stop();
                this.ambNodes.lfo.stop();
                this.ambNodes.masterGain.disconnect();
            } catch (e) { /* ignore */ }
            this.ambNodes = null;
            this.ambientRunning = false;
        }

        setAmbientIntensity(tension) {
            if (!this.ambNodes || !this.ctx) return;
            const t = Math.max(0, Math.min(1, tension || 0));
            try {
                this.ambNodes.filter.frequency.setTargetAtTime(165 + t * 180, this.ctx.currentTime, 0.4);
            } catch (e) { /* ignore */ }
        }

        play(key, pitchJitter) {
            if (this.prefs.muted || this.prefs.sfxVol <= 0.01) return;
            const cfg = SFX_FILES[key];
            if (!cfg) return;
            const now = performance.now();
            if (this.lastPlayAt[key] && (now - this.lastPlayAt[key]) < cfg.cooldown) return;
            this.lastPlayAt[key] = now;

            if (!this.initialized) this.init();

            const howl = this.howls[key];
            if (howl && howl.state && howl.state() === 'loaded') {
                howl.volume(cfg.vol * this.prefs.sfxVol);
                const id = howl.play();
                if (pitchJitter) {
                    howl.rate(1 + (Math.random() - 0.5) * pitchJitter, id);
                }
                return;
            }
            this._playSynthFallback(key);
        }

        _playSynthFallback(key) {
            if (!this.ctx || this.ctx.state !== 'running') return;
            try {
                const ctx = this.ctx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const now = ctx.currentTime;
                let freq = 420;
                let endFreq = 180;
                let dur = 0.09;
                let type = 'triangle';

                if (key === 'xpPickup') { freq = 680; endFreq = 980; dur = 0.06; type = 'sine'; }
                else if (key === 'levelup' || key === 'chestOpen') { freq = 440; endFreq = 880; dur = 0.22; type = 'sine'; }
                else if (key === 'bossAlarm') { freq = 150; endFreq = 95; dur = 0.35; type = 'sawtooth'; }
                else if (key === 'explodeSmall' || key === 'explodeBoss') { freq = 135; endFreq = 42; dur = 0.20; type = 'sawtooth'; }

                osc.type = type;
                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.exponentialRampToValueAtTime(Math.max(25, endFreq), now + dur);

                gain.gain.setValueAtTime(Math.max(0.001, this.prefs.sfxVol * 0.14), now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + dur);
            } catch (e) { /* ignore */ }
        }

        setMuted(muted) {
            this.prefs.muted = !!muted;
            this._savePrefs();
            this._applyVolumes();
            if (this.prefs.muted) this.stopAmbient();
        }

        setSfxVolume(v) {
            this.prefs.sfxVol = Math.max(0, Math.min(1, Number(v)));
            this._savePrefs();
            this._applyVolumes();
        }

        setAmbientVolume(v) {
            this.prefs.ambVol = Math.max(0, Math.min(1, Number(v)));
            this._savePrefs();
            this._applyVolumes();
            if (this.prefs.ambVol <= 0.01) this.stopAmbient();
        }

        _applyVolumes() {
            const effSfx = this.prefs.muted ? 0 : this.prefs.sfxVol;
            for (const [key, cfg] of Object.entries(SFX_FILES)) {
                if (this.howls[key]) this.howls[key].volume(cfg.vol * effSfx);
            }
            if (typeof global.Howler !== 'undefined') {
                global.Howler.mute(this.prefs.muted);
            }
            if (this.ambNodes && this.ctx) {
                const effAmb = this.prefs.muted ? 0.0001 : Math.max(0.0001, this.prefs.ambVol * 0.14);
                try {
                    this.ambNodes.masterGain.gain.setTargetAtTime(effAmb, this.ctx.currentTime, 0.15);
                } catch (e) { /* ignore */ }
            }
        }
    }

    global.CosmicAudio = new CosmicAudioEngine();
})(window);

