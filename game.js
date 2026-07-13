// ═══════════════════════════════════════════════════════
//  COSMIC SURVIVORS v5.0 — Premium Roguelike Engine
// ═══════════════════════════════════════════════════════

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize();
addEventListener('resize', resize);

// ── Oturum ve URL Parametreleri ──
const params = new URLSearchParams(location.search);
const MODE = params.get('mode') === '2p' ? '2p' : '1p';
const DIFFKEY = ['easy', 'medium', 'hard'].includes(params.get('diff')) ? params.get('diff') : 'easy';

const P1_NAME = sessionStorage.getItem('cosmic_p1_name') || 'Kaptan 1';
const P2_NAME = MODE === '2p' ? (sessionStorage.getItem('cosmic_p2_name') || 'Kaptan 2') : '';

// HUD Oyuncu İsim Güncellemeleri
document.getElementById('p1NameLabel').textContent = `◈ ${P1_NAME.toUpperCase()}`;
if (MODE === '2p') {
    document.getElementById('p2NameLabel').textContent = `${P2_NAME.toUpperCase()} ◈`;
} else {
    document.getElementById('p2Hud').style.display = 'none';
}

// ── Gelişmiş Ses ve Prosedürel Müzik Sentezleyici Engine ──
let aC;
let filterNode; // Lowpass filtre
let sfxVolume = 0.4;
let synthSoundActive = true;
let musicInterval = null;
let musicStep = 0;

// Basit Synthwave Akor Dizilimi
const bassNotes = [110, 110, 110, 110, 130, 130, 146, 146, 110, 110, 110, 110, 165, 165, 146, 146];
const leadNotes = [220, 220, 330, 220, 261, 261, 293, 349, 220, 220, 330, 440, 329, 329, 293, 220];

function eA() { 
    if (!aC) {
        aC = new (AudioContext || webkitAudioContext)();
        
        // Lowpass filtre oluştur ve çıkışa bağla
        filterNode = aC.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(20000, aC.currentTime);
        filterNode.connect(aC.destination);
        
        startProceduralMusic();
    } 
}

function tone(f, d, t = 'square', v = 0.06) {
    if (!synthSoundActive) return;
    try {
        eA();
        const o = aC.createOscillator(), g = aC.createGain();
        o.type = t;
        o.frequency.setValueAtTime(f, aC.currentTime);
        o.frequency.exponentialRampToValueAtTime(Math.max(f * 0.2, 10), aC.currentTime + d);
        g.gain.setValueAtTime(v * sfxVolume, aC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, aC.currentTime + d);
        
        // Ses filtresine yönlendir
        o.connect(g); g.connect(filterNode);
        o.start(); o.stop(aC.currentTime + d);
    } catch (e) {}
}

// Lowpass filtreyi yumuşak şekilde ayarla
function setSoundMuffled(muffled) {
    if (!aC || !filterNode) return;
    const targetFreq = muffled ? 420 : 20000;
    filterNode.frequency.exponentialRampToValueAtTime(targetFreq, aC.currentTime + 0.25);
}

// Oyun İçi Dinamik Müzik Döngüsü
function startProceduralMusic() {
    if (musicInterval) clearInterval(musicInterval);
    const tempo = DIFFKEY === 'hard' ? 140 : DIFFKEY === 'medium' ? 180 : 220;
    
    musicInterval = setInterval(() => {
        if ((gameState !== 'playing' && gameState !== 'levelChoice' && gameState !== 'bossReward') || !synthSoundActive) return;
        
        // Basline ritmi
        const bassFreq = bassNotes[musicStep % bassNotes.length];
        tone(bassFreq, 0.15, 'sawtooth', 0.05);
        
        // Rastgele melodi
        if (musicStep % 4 === 0 && Math.random() < 0.8) {
            const leadFreq = leadNotes[Math.floor(Math.random() * leadNotes.length)];
            tone(leadFreq, 0.35, 'triangle', 0.03);
        }
        
        // Davul
        if (musicStep % 2 === 0) {
            tone(50, 0.05, 'sine', 0.08);
        } else {
            tone(1000, 0.02, 'triangle', 0.015);
        }
        
        musicStep++;
    }, tempo);
}

const sfx = {
    shoot() { tone(700 + rand(0, 300), 0.04, 'square', 0.015); },
    hit() { tone(150, 0.08, 'sawtooth', 0.035); },
    kill() { tone(480, 0.1, 'square', 0.04); tone(780, 0.06, 'sine', 0.025); },
    pow() { tone(523, 0.06, 'sine', 0.05); setTimeout(() => tone(659, 0.06, 'sine', 0.05), 60); setTimeout(() => tone(784, 0.08, 'sine', 0.05), 120); },
    exp() { tone(70, 0.3, 'sawtooth', 0.07); tone(30, 0.35, 'square', 0.05); },
    wave() { tone(392, 0.08, 'sine', 0.05); setTimeout(() => tone(587, 0.08, 'sine', 0.05), 90); setTimeout(() => tone(784, 0.15, 'sine', 0.05), 180); },
    bWarn() { for (let i = 0; i < 4; i++) setTimeout(() => tone(130, 0.25, 'sawtooth', 0.07), i * 160); },
    bKill() { tone(523, 0.1, 'sine', 0.08); setTimeout(() => tone(659, 0.1, 'sine', 0.08), 80); setTimeout(() => tone(784, 0.1, 'sine', 0.08), 160); setTimeout(() => tone(1047, 0.2, 'sine', 0.1), 240); },
    lvl() { tone(880, 0.06, 'sine', 0.05); setTimeout(() => tone(1100, 0.1, 'sine', 0.05), 70); setTimeout(() => tone(1320, 0.15, 'sine', 0.05), 140); },
};

// ── Matematiksel Yardımcılar ──
const rand = (a, b) => Math.random() * (b - a) + a;
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const ang = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const P1 = '#00f0ff', P1D = '#006880', P2 = '#ff006a', P2D = '#801035', LINK = '#bf00ff', GOLD = '#ffd700';

// ── Partikül Sistemi ──
const particles = [];
class Particle {
    constructor(x, y, vx, vy, c, l, s, t = 'circle') {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.c = c; this.l = l; this.ml = l; this.s = s; this.t = t;
    }
    update(dt) {
        this.x += this.vx * dt; this.y += this.vy * dt;
        this.vx *= 0.96; this.vy *= 0.96;
        this.l -= dt; return this.l > 0;
    }
    draw(ctx) {
        const a = clamp(this.l / this.ml, 0, 1);
        ctx.globalAlpha = a * 0.85;
        ctx.fillStyle = this.c;
        if (this.t === 'circle') {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.s * a, 0, Math.PI * 2); ctx.fill();
        } else if (this.t === 'shockwave') {
            ctx.strokeStyle = this.c; ctx.lineWidth = 3 * a;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.s * (1 - a) * 3, 0, Math.PI * 2); ctx.stroke();
        } else {
            ctx.save(); ctx.translate(this.x, this.y);
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.fillRect(-this.s * 2, -this.s * 0.3, this.s * 4, this.s * 0.6);
            ctx.restore();
        }
        ctx.globalAlpha = 1;
    }
}
function spawnP(x, y, c, n, sp = 150, li = 0.5, sz = 3, type = 'circle') {
    for (let i = 0; i < n; i++) {
        const a = rand(0, Math.PI * 2), s = rand(sp * 0.3, sp);
        particles.push(new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, c, rand(li * 0.5, li), rand(sz * 0.5, sz), type));
    }
}
function spawnExp(x, y, c, sc = 1) {
    spawnP(x, y, c, Math.floor(25 * sc), 250 * sc, 0.8, 4 * sc);
    spawnP(x, y, '#fff', Math.floor(10 * sc), 150 * sc, 0.3, 2);
    particles.push(new Particle(x, y, 0, 0, c, 0.4, 40 * sc, 'shockwave'));
}

let shakeI = 0;
function shake(i) { shakeI = Math.max(shakeI, i); }
const floats = [];
function floatT(x, y, t, c, s = 18) { floats.push({ x, y, t, c, s, l: 1.2, ml: 1.2, vy: -55 }); }

// Arka plan Parallaks Yıldızlar ve Nebulalar
const starLayers = [
    { stars: [], speed: 0.1, size: 0.8, color: 'rgba(255,255,255,0.3)' },
    { stars: [], speed: 0.3, size: 1.5, color: 'rgba(255,255,255,0.6)' },
    { stars: [], speed: 0.7, size: 2.2, color: 'rgba(255,255,255,0.9)' }
];
for (const layer of starLayers) {
    for (let i = 0; i < 60; i++) {
        layer.stars.push({ x: rand(0, 2000), y: rand(0, 1500), tw: rand(1, 4) });
    }
}
const nebulae = []; for (let i = 0; i < 6; i++) nebulae.push({ x: rand(0, 1920), y: rand(0, 1080), r: rand(180, 450), h: rand(180, 320), a: rand(0.02, 0.05) });

// ── Zorluk Konfigürasyonu ──
const DIFF = {
    easy: { label: 'KOLAY', cls: 'easy', ehm: 0.75, esm: 0.75, edm: 0.65, wsr: 0.04, sd: 2.3, pc: 0.20, bhm: 0.7, bsr: 0.7, xm: 1.2, sm: 0.8, sr: 3.2, bwe: 5, mwe: 35 },
    medium: { label: 'ORTA', cls: 'medium', ehm: 1.05, esm: 1.0, edm: 1.0, wsr: 0.08, sd: 1.4, pc: 0.12, bhm: 1.0, bsr: 1.0, xm: 1.0, sm: 1.0, sr: 2.4, bwe: 7, mwe: 55 },
    hard: { label: 'ZOR', cls: 'hard', ehm: 1.85, esm: 1.45, edm: 1.85, wsr: 0.16, sd: 0.75, pc: 0.05, bhm: 1.9, bsr: 1.45, xm: 0.75, sm: 1.7, sr: 1.4, bwe: 9, mwe: 95 },
};
const DC = DIFF[DIFFKEY];

// ── Yetenek Geliştirme Kartları ──
const UPG = {
    atkUp: { icon: '⚔', name: 'Hasar+', color: '#ff8800', desc: 'Mermi hasarı +15%' },
    spdUp: { icon: '⚡', name: 'Hız+', color: '#00ccff', desc: 'Hareket hızı +10%' },
    fireUp: { icon: '»', name: 'Ateş Hızı+', color: '#ffff00', desc: 'Ateş hızı +12%' },
    hpUp: { icon: '♥', name: 'Can+', color: '#ff4444', desc: 'Maks can +20' },
    shieldUp: { icon: '◆', name: 'Kalkan+', color: '#bf00ff', desc: 'Maks kalkan +15' },
    rangeUp: { icon: '◎', name: 'Menzil+', color: '#44ff44', desc: 'Mermi menzili +15%' },
    multiUp: { icon: '⋮', name: 'Çoklu Atış', color: '#00ff88', desc: 'Ek mermi namlusu' },
    vampUp: { icon: '☽', name: 'Vampir', color: '#cc0044', desc: 'Öldürmede +3 can' },
    critUp: { icon: '✶', name: 'Kritik+', color: '#ffffff', desc: '%10 kritik şansı' },
};
const UPG_KEYS = Object.keys(UPG);

// ── Global Oyun Durumu ──
let gameState = 'playing';
let score = 0, wave = 1, gameTime = 0, totalKills = 0;
let comboC = 0, comboTm = 0, comboM = 1;
let waveTm = 0, waveEC = 0, waveSp = 0, waveDl = 0;
let linkDT = 0, screenFl = 0, screenFC = '#fff';
let bossActive = null, slowT = 0, slowF = 1;
let bossRewardTimer = 0, bossRewardActive = false;
let beamOverloadTimer = 0;
const bullets = [], eBullets = [], enemies = [], pickups = [], dangerZones = [];

// Seviye Atlama Kuyruğu
let levelUpQueue = [];
let levelingPlayer = null;

// ── Oyuncu Sınıfı ──
class Player {
    constructor(id, x, y, c, cd, name, shipClass) {
        this.id = id; this.x = x; this.y = y; this.c = c; this.cd = cd;
        this.name = name;
        this.shipClass = shipClass || 'interceptor';
        this.r = 14; this.vx = 0; this.vy = 0;
        
        // Gemi Sınıfına Göre Başlangıç Statları
        if (this.shipClass === 'dreadnought') {
            this.bmh = 145; this.bms = 45; this.bsp = 210; this.bbd = 14; this.bsr = 0.25; this.crit = 0.05;
        } else if (this.shipClass === 'aegis') {
            this.bmh = 100; this.bms = 60; this.bsp = 255; this.bbd = 9; this.bsr = 0.22; this.crit = 0.05;
        } else { // interceptor
            this.bmh = 85; this.bms = 30; this.bsp = 300; this.bbd = 10; this.bsr = 0.18; this.crit = 0.15;
        }
        
        this.mh = this.bmh; this.hp = this.mh;
        this.ms = this.bms; this.sh = 0;
        this.sp = this.bsp;
        this.sr = this.bsr;
        this.bd = this.bbd;
        this.bsp2 = 580; this.bs = 4; this.bbl = 1.2; this.bl = 1.2;
        
        this.alive = true; this.respT = 0; this.invT = 0;
        this.fac = 0; this.trail = []; this.aA = rand(0, Math.PI * 2); this.gl = 0;
        this.sT = 0; this.xp = 0; this.lv = 1; this.xpN = 50;
        this.pU = {}; this.tP = {};
        this.extraS = 0; this.vamp = 0; this.magR = 80;
    }
    reset(x, y) {
        this.x = x; this.y = y; this.vx = 0; this.vy = 0;
        this.hp = this.mh; this.sh = 0; this.alive = true;
        this.respT = 0; this.invT = 2.5; this.sT = 0;
        this.trail = [];
        this.recalc();
    }
    recalc() {
        const c = k => (this.pU[k] || 0);
        this.bd = this.bbd * (1 + c('atkUp') * 0.15);
        this.sp = this.bsp * (1 + c('spdUp') * 0.10);
        this.sr = this.bsr / (1 + c('fireUp') * 0.12);
        this.mh = this.bmh + c('hpUp') * 20;
        this.ms = this.bms + c('shieldUp') * 15;
        this.bl = this.bbl * (1 + c('rangeUp') * 0.15);
        this.extraS = Math.floor(c('multiUp'));
        this.vamp = c('vampUp') * 3;
        this.crit = (this.shipClass === 'interceptor' ? 0.15 : 0.05) + c('critUp') * 0.10;
        this.magR = 80 + c('spdUp') * 15; // Hız kartları mıknatısı da etkiler
        this.hp = Math.min(this.hp, this.mh);
        this.sh = Math.min(this.sh, this.ms);
    }
    addUpg(k) { this.pU[k] = (this.pU[k] || 0) + 1; this.recalc(); }
    gainXP(a) {
        if (!this.alive) return;
        this.xp += a * DC.xm;
        while (this.xp >= this.xpN) {
            this.xp -= this.xpN; this.lv++;
            this.xpN = Math.floor(50 * Math.pow(1.3, this.lv - 1));
            
            // Kuyruğa seviye atlama olayını ekle
            levelUpQueue.push({ player: this, lv: this.lv });
        }
    }
    update(dt, activeSynergy) {
        if (!this.alive) { this.respT -= dt; return; }
        this.aA += dt * 3; this.gl = (Math.sin(this.aA) + 1) * 0.5;
        
        let mx = 0, my = 0;
        if (this.id === 1) {
            if (keys.KeyW) my -= 1; if (keys.KeyS) my += 1;
            if (keys.KeyA) mx -= 1; if (keys.KeyD) mx += 1;
        } else {
            if (keys.ArrowUp) my -= 1; if (keys.ArrowDown) my += 1;
            if (keys.ArrowLeft) mx -= 1; if (keys.ArrowRight) mx += 1;
        }
        
        const mag = Math.hypot(mx, my);
        if (mag > 0) { mx /= mag; my /= mag; this.fac = Math.atan2(my, mx); }
        
        const spd = this.tP.speed ? this.sp * 1.45 : this.sp;
        this.vx = lerp(this.vx, mx * spd, 0.14); this.vy = lerp(this.vy, my * spd, 0.14);
        this.x += this.vx * dt; this.y += this.vy * dt;
        
        this.x = clamp(this.x, 25, canvas.width - 25);
        this.y = clamp(this.y, 25, canvas.height - 25);
        
        if (Math.hypot(this.vx, this.vy) > 25) this.trail.push({ x: this.x, y: this.y, a: 1 });
        this.trail = this.trail.filter(t => { t.a -= dt * 3; return t.a > 0; });
        
        this.sT -= dt;
        const rate = this.tP.rapidfire ? this.sr * 0.4 : this.sr;
        if (this.sT <= 0) { this.sT = rate; this.shoot(); }
        
        if (this.invT > 0) this.invT -= dt;
        for (const k in this.tP) { this.tP[k] -= dt; if (this.tP[k] <= 0) delete this.tP[k]; }
        
        // Kalkan yenilenmesi (Aegis %50 ekstra kalkan şarjı alır)
        if (this.sh < this.ms) {
            let regenFactor = activeSynergy ? 1.40 : 1.0;
            if (this.shipClass === 'aegis') regenFactor *= 1.5;
            this.sh = Math.min(this.ms, this.sh + DC.sr * regenFactor * dt);
        }
        
        for (const pu of pickups) {
            const d = dist(this, pu);
            if (d < this.magR && d > 0) {
                const a = ang(pu, this);
                pu.x += Math.cos(a) * 250 * dt;
                pu.y += Math.sin(a) * 250 * dt;
            }
        }
    }
    shoot() {
        if (!this.alive) return;
        let nr = null, nd = Infinity;
        for (const e of enemies) { if (!e.alive) continue; const d = dist(this, e); if (d < nd) { nd = d; nr = e; } }
        
        let sa = this.fac; if (nr && nd < 800) sa = ang(this, nr);
        const dmgB = this.tP.damage ? this.bd * 1.8 : this.bd;
        const sz = this.tP.damage ? this.bs * 1.4 : this.bs;
        const pi = !!this.tP.piercing; const li = this.bl;
        
        let shots = [{ a: sa }];
        const ext = this.extraS + (this.tP.tripleshot ? 2 : 0);
        for (let i = 1; i <= ext; i++) {
            shots.push({ a: sa + i * 0.18 });
            shots.push({ a: sa - i * 0.18 });
        }
        
        for (const sh of shots) {
            let dmg = dmgB, cr = false;
            if (Math.random() < this.crit) { dmg *= 2.5; cr = true; }
            
            // Kruvazör Çift Namlulu Ateş Eder
            if (this.shipClass === 'dreadnought') {
                const dx1 = Math.cos(sh.a + Math.PI/2) * 5;
                const dy1 = Math.sin(sh.a + Math.PI/2) * 5;
                const dx2 = Math.cos(sh.a - Math.PI/2) * 5;
                const dy2 = Math.sin(sh.a - Math.PI/2) * 5;
                
                bullets.push({
                    x: this.x + Math.cos(sh.a) * 20 + dx1, y: this.y + Math.sin(sh.a) * 20 + dy1,
                    vx: Math.cos(sh.a) * this.bsp2, vy: Math.sin(sh.a) * this.bsp2,
                    damage: dmg * 0.65, size: sz, color: this.c, owner: this.id, life: li, piercing: pi, crit: cr
                });
                bullets.push({
                    x: this.x + Math.cos(sh.a) * 20 + dx2, y: this.y + Math.sin(sh.a) * 20 + dy2,
                    vx: Math.cos(sh.a) * this.bsp2, vy: Math.sin(sh.a) * this.bsp2,
                    damage: dmg * 0.65, size: sz, color: this.c, owner: this.id, life: li, piercing: pi, crit: cr
                });
            } else {
                bullets.push({
                    x: this.x + Math.cos(sh.a) * 20, y: this.y + Math.sin(sh.a) * 20,
                    vx: Math.cos(sh.a) * this.bsp2, vy: Math.sin(sh.a) * this.bsp2,
                    damage: dmg, size: sz, color: this.c, owner: this.id, life: li, piercing: pi, crit: cr
                });
            }
        }
        sfx.shoot();
    }
    takeDmg(d) {
        if (!this.alive || this.invT > 0) return;
        
        // Dreadnought %15 zırh hasar azaltma alır
        if (this.shipClass === 'dreadnought') {
            d *= 0.85;
        }
        
        if (this.sh > 0) { const ab = Math.min(this.sh, d); this.sh -= ab; d -= ab; spawnP(this.x, this.y, LINK, 5, 100, 0.3, 2); }
        this.hp -= d; shake(4); spawnP(this.x, this.y, this.c, 8, 120, 0.4, 3);
        if (this.hp <= 0) this.die();
    }
    die() {
        this.alive = false;
        
        if (DIFFKEY === 'easy') {
            this.respT = 5;
        } else if (DIFFKEY === 'medium') {
            this.respT = 7;
            this.lv = Math.max(1, this.lv - 2);
            this.xp = 0;
            this.xpN = Math.floor(50 * Math.pow(1.3, this.lv - 1));
            
            // Delete up to 2 random upgrades
            let keys = Object.keys(this.pU).filter(k => this.pU[k] > 0);
            for (let i = 0; i < 2; i++) {
                if (keys.length > 0) {
                    const idx = randInt(0, keys.length - 1);
                    const k = keys[idx];
                    delete this.pU[k];
                    keys.splice(idx, 1);
                }
            }
            this.recalc();
            updateUpgDisplay();
        } else { // 'hard'
            this.respT = 10;
            this.pU = {};
            this.lv = 1;
            this.xp = 0;
            this.xpN = 50;
            this.recalc();
            updateUpgDisplay();
        }
        
        spawnExp(this.x, this.y, this.c, 1.5); sfx.exp(); shake(12);
        floatT(this.x, this.y - 20, `${this.name.toUpperCase()} DÜŞTÜ!`, this.c, 22);
    }
    draw(ctx) {
        if (!this.alive) return;
        for (const t of this.trail) {
            ctx.globalAlpha = t.a * 0.25; ctx.fillStyle = this.c;
            ctx.beginPath(); ctx.arc(t.x, t.y, this.r * t.a * 0.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (this.invT > 0 && Math.floor(this.invT * 10) % 2 === 0) return;
        
        const gs = this.r * 3 + this.gl * 8;
        ctx.save();
        ctx.shadowBlur = 15; ctx.shadowColor = this.c;
        const grd = ctx.createRadialGradient(this.x, this.y, this.r * 0.5, this.x, this.y, gs);
        grd.addColorStop(0, this.c + '25'); grd.addColorStop(1, this.c + '00');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(this.x, this.y, gs, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.fac);
        
        // ── Motor Egzoz Alevi ──
        if (Math.hypot(this.vx, this.vy) > 12) {
            ctx.save();
            ctx.shadowBlur = 12; ctx.shadowColor = this.c;
            const flicker = Math.random() * 6 + 12;
            if (this.shipClass === 'dreadnought') {
                const grd = ctx.createLinearGradient(-this.r * 0.8, 0, -this.r * 0.8 - flicker, 0);
                grd.addColorStop(0, '#fff'); grd.addColorStop(0.3, this.c); grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.beginPath(); ctx.moveTo(-this.r * 0.8, -this.r * 0.55); ctx.lineTo(-this.r * 0.8 - flicker, -this.r * 0.4); ctx.lineTo(-this.r * 0.8, -this.r * 0.25); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.moveTo(-this.r * 0.8, this.r * 0.25); ctx.lineTo(-this.r * 0.8 - flicker, this.r * 0.4); ctx.lineTo(-this.r * 0.8, this.r * 0.55); ctx.closePath(); ctx.fill();
            } else if (this.shipClass === 'interceptor') {
                const grd = ctx.createLinearGradient(-this.r * 0.6, 0, -this.r * 0.6 - flicker * 1.2, 0);
                grd.addColorStop(0, '#fff'); grd.addColorStop(0.2, this.c); grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.beginPath(); ctx.moveTo(-this.r * 0.4, -this.r * 0.2); ctx.lineTo(-this.r * 0.6 - flicker * 1.2, 0); ctx.lineTo(-this.r * 0.4, this.r * 0.2); ctx.closePath(); ctx.fill();
            } else {
                const grd = ctx.createLinearGradient(-this.r, 0, -this.r - flicker * 0.9, 0);
                grd.addColorStop(0, '#fff'); grd.addColorStop(0.3, this.c); grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.beginPath(); ctx.moveTo(-this.r * 0.8, -this.r * 0.35); ctx.lineTo(-this.r - flicker * 0.9, 0); ctx.lineTo(-this.r * 0.8, this.r * 0.35); ctx.closePath(); ctx.fill();
            }
            ctx.restore();
        }
        
        ctx.strokeStyle = this.c; ctx.fillStyle = this.cd; ctx.lineWidth = 2;
        
        // Gemi Sınıfına Göre Özgün Vektör Çizimi
        if (this.shipClass === 'interceptor') {
            // Avcı: Keskin kanatlar
            ctx.beginPath();
            ctx.moveTo(this.r + 6, 0);
            ctx.lineTo(-this.r * 0.6, -this.r * 0.9);
            ctx.lineTo(-this.r * 0.2, -this.r * 0.3);
            ctx.lineTo(-this.r * 0.6, 0);
            ctx.lineTo(-this.r * 0.2, this.r * 0.3);
            ctx.lineTo(-this.r * 0.6, this.r * 0.9);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else if (this.shipClass === 'dreadnought') {
            // Kruvazör: Zırh plakaları
            ctx.beginPath();
            ctx.moveTo(this.r + 2, -this.r * 0.3);
            ctx.lineTo(this.r + 2, this.r * 0.3);
            ctx.lineTo(-this.r * 0.2, this.r * 0.8);
            ctx.lineTo(-this.r * 0.8, this.r * 0.8);
            ctx.lineTo(-this.r * 0.5, 0);
            ctx.lineTo(-this.r * 0.8, -this.r * 0.8);
            ctx.lineTo(-this.r * 0.2, -this.r * 0.8);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            
            // Namlu detayları
            ctx.fillStyle = this.c;
            ctx.fillRect(this.r * 0.2, -this.r * 0.55, 6, 2.5);
            ctx.fillRect(this.r * 0.2, this.r * 0.45, 6, 2.5);
        } else {
            // Destek (Aegis): Hekzagonel gövde
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = i * Math.PI / 3;
                ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * (this.r + 2), Math.sin(a) * (this.r + 2));
            }
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        }
        
        ctx.restore();
        
        // Halka kalkan efekti
        if (this.sh > 0) {
            ctx.globalAlpha = (this.sh / this.ms) * 0.3; ctx.strokeStyle = LINK; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 10, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        }
    }
}

// ── Düşman Tanımları ──
const ET = {
    drone: { r: 12, hp: 20, spd: 110, dmg: 8, sc: 10, color: '#ff4444' },
    tank: { r: 22, hp: 80, spd: 55, dmg: 18, sc: 30, color: '#ff8800' },
    speeder: { r: 9, hp: 12, spd: 230, dmg: 5, sc: 15, color: '#44ff44' },
    shooter: { r: 15, hp: 35, spd: 75, dmg: 10, sc: 25, color: '#ffff00' },
    orbiter: { r: 10, hp: 25, spd: 140, dmg: 10, sc: 20, color: '#00ffcc' },
    splitter: { r: 16, hp: 45, spd: 90, dmg: 12, sc: 35, color: '#ff66ff' },
    shielder: { r: 18, hp: 60, spd: 65, dmg: 14, sc: 40, color: '#6666ff' },
    sniper: { r: 13, hp: 28, spd: 50, dmg: 15, sc: 30, color: '#ff3300' },
    kamikaze: { r: 11, hp: 18, spd: 200, dmg: 35, sc: 20, color: '#ff5500' },
    phantom: { r: 14, hp: 40, spd: 100, dmg: 12, sc: 30, color: '#bf00ff' },
    sweeper: { r: 17, hp: 70, spd: 45, dmg: 16, sc: 45, color: '#00f0ff' },
    healer: { r: 15, hp: 50, spd: 85, dmg: 6, sc: 35, color: '#00ff66' }
};

class Enemy {
    constructor(type, x, y) {
        this.type = type; this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.alive = true;
        this.aA = rand(0, Math.PI * 2); this.fl = 0;
        const d = ET[type] || ET.drone;
        this.r = d.r; this.hp = d.hp * DC.ehm; this.maxHp = this.hp;
        this.spd = d.spd * DC.esm; this.damage = d.dmg * DC.edm;
        this.sc = d.sc; this.color = d.color;
        this.sT = rand(1, 3);
        
        // Dengeli Orbiter
        this.oA = rand(0, Math.PI * 2);
        this.oD = type === 'orbiter' ? rand(170, 240) : rand(80, 150);
        this.orbitTimer = rand(2, 4);
        this.orbitPhase = 'orbit';
        
        this.shHp = type === 'shielder' ? 30 * DC.ehm : 0;
        this.isBoss = false;
        
        // Yeni Düşman Tanımları Aşamaları
        if (type === 'phantom') {
            this.teleportTimer = rand(2.0, 3.5);
        }
        if (type === 'healer') {
            this.sT = rand(1, 2);
        }
    }
    update(dt) {
        if (!this.alive) return false;
        this.aA += dt * 2; this.fl = Math.max(0, this.fl - dt);
        
        let tgt = null, td = Infinity;
        const lp = livePlayers();
        for (const p of lp) { const d = dist(this, p); if (d < td) { td = d; tgt = p; } }
        if (!tgt) return true;
        
        const a = ang(this, tgt);
        switch (this.type) {
            case 'drone': case 'tank': case 'kamikaze':
                this.vx = lerp(this.vx, Math.cos(a) * this.spd, 0.05);
                this.vy = lerp(this.vy, Math.sin(a) * this.spd, 0.05); break;
            case 'speeder':
                this.vx = lerp(this.vx, Math.cos(a) * this.spd, 0.08);
                this.vy = lerp(this.vy, Math.sin(a) * this.spd, 0.08); break;
            case 'shooter': case 'sniper':
                if (td > 250) {
                    this.vx = lerp(this.vx, Math.cos(a) * this.spd, 0.04);
                    this.vy = lerp(this.vy, Math.sin(a) * this.spd, 0.04);
                } else {
                    this.vx *= 0.94; this.vy *= 0.94;
                }
                this.sT -= dt;
                if (this.sT <= 0) {
                    this.sT = this.type === 'sniper' ? 2.5 : 2;
                    const sa = ang(this, tgt);
                    const sp = this.type === 'sniper' ? 450 : 280;
                    const dm = this.type === 'sniper' ? 15 : 8;
                    eBullets.push({ x: this.x, y: this.y, vx: Math.cos(sa) * sp, vy: Math.sin(sa) * sp, damage: dm * DC.edm, size: this.type === 'sniper' ? 4 : 5, color: this.color, life: 3 });
                    spawnP(this.x, this.y, this.color, 3, 60, 0.2, 2);
                }
                break;
            case 'orbiter':
                this.orbitTimer -= dt;
                if (this.orbitTimer <= 0) {
                    this.orbitPhase = this.orbitPhase === 'orbit' ? 'rush' : 'orbit';
                    this.orbitTimer = this.orbitPhase === 'rush' ? 1.2 : rand(3, 5);
                }
                
                if (this.orbitPhase === 'rush') {
                    this.vx = lerp(this.vx, Math.cos(a) * this.spd * 1.3, 0.06);
                    this.vy = lerp(this.vy, Math.sin(a) * this.spd * 1.3, 0.06);
                } else {
                    this.oA += dt * 0.5;
                    const tx = tgt.x + Math.cos(this.oA) * this.oD;
                    const ty = tgt.y + Math.sin(this.oA) * this.oD;
                    this.vx = lerp(this.vx, (tx - this.x) * 2.5, 0.05);
                    this.vy = lerp(this.vy, (ty - this.y) * 2.5, 0.05);
                }
                break;
            case 'splitter': case 'shielder':
                this.vx = lerp(this.vx, Math.cos(a) * this.spd, 0.05);
                this.vy = lerp(this.vy, Math.sin(a) * this.spd, 0.05); break;
            case 'phantom':
                this.vx = lerp(this.vx, Math.cos(a) * this.spd, 0.05);
                this.vy = lerp(this.vy, Math.sin(a) * this.spd, 0.05);
                
                this.teleportTimer -= dt;
                if (this.teleportTimer <= 0) {
                    this.teleportTimer = rand(2.2, 3.8);
                    spawnP(this.x, this.y, this.color, 8, 80, 0.3, 2);
                    this.x += Math.cos(a) * 165;
                    this.y += Math.sin(a) * 165;
                    spawnP(this.x, this.y, this.color, 8, 80, 0.3, 2);
                }
                break;
            case 'sweeper':
                this.vx = lerp(this.vx, Math.cos(a) * this.spd, 0.04);
                this.vy = lerp(this.vy, Math.sin(a) * this.spd, 0.04);
                
                if (this.laserAngle === undefined) {
                    this.laserAngle = rand(0, Math.PI * 2);
                    this.laserRotationSpeed = rand(0.6, 1.2) * (Math.random() < 0.5 ? 1 : -1);
                    this.laserDmgTimer = 0;
                }
                this.laserAngle += this.laserRotationSpeed * dt;
                
                this.laserDmgTimer -= dt;
                if (this.laserDmgTimer <= 0) {
                    this.laserDmgTimer = 0.15;
                    const len = 350;
                    const lx2 = this.x + Math.cos(this.laserAngle) * len;
                    const ly2 = this.y + Math.sin(this.laserAngle) * len;
                    
                    for (const p of livePlayers()) {
                        const dx = lx2 - this.x, dy = ly2 - this.y;
                        const l2 = dx * dx + dy * dy;
                        if (l2 === 0) continue;
                        let t = ((p.x - this.x) * dx + (p.y - this.y) * dy) / l2;
                        t = clamp(t, 0, 1);
                        const cx = this.x + t * dx, cy = this.y + t * dy;
                        if (dist(p, { x: cx, y: cy }) < p.r + 8) {
                            p.takeDmg(this.damage * 0.45);
                        }
                    }
                }
                break;
            case 'healer':
                let healTgt = null, hd = Infinity;
                for (const e of enemies) {
                    if (e !== this && e.alive && e.hp < e.maxHp && !e.isBoss) {
                        const d = dist(this, e);
                        if (d < hd) { hd = d; healTgt = e; }
                    }
                }
                if (healTgt) {
                    const hAngle = ang(this, healTgt);
                    this.vx = lerp(this.vx, Math.cos(hAngle) * this.spd, 0.06);
                    this.vy = lerp(this.vy, Math.sin(hAngle) * this.spd, 0.06);
                    
                    this.sT -= dt;
                    if (this.sT <= 0 && hd < 180) {
                        this.sT = 1.8;
                        healTgt.hp = Math.min(healTgt.maxHp, healTgt.hp + healTgt.maxHp * 0.25);
                        spawnP(healTgt.x, healTgt.y, '#00ff66', 6, 60, 0.3, 2);
                        floatT(healTgt.x, healTgt.y - 15, 'ŞİFA', '#00ff66', 10);
                    }
                } else {
                    this.vx = lerp(this.vx, Math.cos(a) * this.spd, 0.04);
                    this.vy = lerp(this.vy, Math.sin(a) * this.spd, 0.04);
                }
                break;
        }
        this.x += this.vx * dt; this.y += this.vy * dt;
        
        for (const p of lp) {
            if (dist(this, p) < this.r + p.r) {
                p.takeDmg(this.damage);
                if (this.type !== 'tank' && this.type !== 'sweeper' && this.type !== 'healer' && !this.isBoss) { this.hp = 0; this.die(); return false; }
            }
        }
        return true;
    }
    takeDmg(d, cr) {
        if (this.shHp > 0) {
            const ab = Math.min(this.shHp, d); this.shHp -= ab; d -= ab;
            spawnP(this.x, this.y, '#6666ff', 3, 60, 0.2, 2);
        }
        this.hp -= d; this.fl = 0.1;
        if (cr) {
            floatT(this.x, this.y - 15, 'KRİTİK!', '#fff', 14);
            shake(3);
        }
        if (this.hp <= 0) this.die();
    }
    die() {
        this.alive = false; 
        spawnExp(this.x, this.y, this.color, this.isBoss ? 4.5 : 1.2); 
        sfx.kill();
        shake(this.isBoss ? 25 : 5);
        
        const pts = Math.floor(this.sc * comboM * DC.sm); score += pts; totalKills++;
        floatT(this.x, this.y - 20, '+' + pts, GOLD);
        comboC++; comboTm = 3; comboM = Math.min(1 + Math.floor(comboC / 5) * 0.5, 10);
        
        livePlayers().forEach(p => { if (dist(this, p) < 500) p.gainXP(this.sc * 0.5); });
        
        if (Math.random() < DC.pc) spawnPickup(this.x, this.y);
        
        if (this.type === 'splitter' && !this.isBoss) {
            for (let i = 0; i < 3; i++) {
                const ne = new Enemy('speeder', this.x + rand(-20, 20), this.y + rand(-20, 20));
                ne.hp *= 0.5; ne.maxHp = ne.hp; enemies.push(ne);
            }
        }
        
        if (this.type === 'kamikaze') {
            spawnExp(this.x, this.y, '#ff4400', 1.4);
            for (const p of livePlayers()) {
                if (dist(this, p) < 95) {
                    p.takeDmg(this.damage * 0.7);
                }
            }
        }
        
        livePlayers().filter(p => p.vamp > 0).forEach(p => { p.hp = Math.min(p.mh, p.hp + p.vamp); });
    }
    draw(ctx) {
        if (!this.alive) return;
        const fl = this.fl > 0;
        const grd = ctx.createRadialGradient(this.x, this.y, this.r * 0.3, this.x, this.y, this.r * 2.2);
        grd.addColorStop(0, this.color + '12'); grd.addColorStop(1, this.color + '00');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 2.2, 0, Math.PI * 2); ctx.fill();
        
        ctx.save(); ctx.translate(this.x, this.y);
        ctx.fillStyle = fl ? '#fff' : this.color + '40'; ctx.strokeStyle = fl ? '#fff' : this.color; ctx.lineWidth = 2;
        switch (this.type) {
            case 'drone': ctx.rotate(this.aA * 0.5); ctx.beginPath(); ctx.moveTo(0, -this.r); ctx.lineTo(this.r, 0); ctx.lineTo(0, this.r); ctx.lineTo(-this.r, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
            case 'tank': ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + this.aA * 0.2; ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * this.r, Math.sin(a) * this.r) } ctx.closePath(); ctx.fill(); ctx.stroke(); break;
            case 'speeder': ctx.rotate(this.aA); ctx.beginPath(); ctx.moveTo(0, -this.r); ctx.lineTo(this.r * 0.866, this.r * 0.5); ctx.lineTo(-this.r * 0.866, this.r * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
            case 'shooter': ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2 + this.aA * 0.3; ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * this.r, Math.sin(a) * this.r) } ctx.closePath(); ctx.fill(); ctx.stroke(); break;
            case 'orbiter': ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); break;
            case 'splitter': ctx.rotate(this.aA * 0.3); ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * this.r, Math.sin(a) * this.r) } ctx.closePath(); ctx.fill(); ctx.stroke(); break;
            case 'shielder': ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); if (this.shHp > 0) { ctx.globalAlpha = 0.4; ctx.strokeStyle = '#aaf'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, this.r + 6, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1 } break;
            case 'sniper': ctx.rotate(this.aA * 0.2); ctx.beginPath(); ctx.moveTo(this.r, 0); ctx.lineTo(-this.r * 0.5, -this.r * 0.7); ctx.lineTo(-this.r * 0.5, this.r * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
            case 'kamikaze': ctx.rotate(this.aA * 0.8); ctx.beginPath(); ctx.moveTo(0, -this.r); ctx.lineTo(this.r * 0.7, this.r * 0.7); ctx.lineTo(-this.r * 0.7, this.r * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
            case 'phantom': ctx.rotate(this.aA * 0.4); ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, this.r * 0.5, 0, Math.PI * 2); ctx.stroke(); break;
            case 'sweeper': 
                ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); 
                if (this.laserAngle !== undefined) {
                    ctx.save();
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(this.laserAngle) * 350, Math.sin(this.laserAngle) * 350);
                    ctx.stroke();
                    ctx.restore();
                }
                break;
            case 'healer': ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#00ff66'; ctx.fillRect(-this.r * 0.5, -2, this.r, 4); ctx.fillRect(-2, -this.r * 0.5, 4, this.r); break;
        }
        ctx.restore();
    }
}

// ── Boss Sınıfı ──
const BOSS_NAMES = ['VOID WALKER', 'NEBULA LORD', 'STAR EATER', 'DARK NOVA', 'COSMIC DREAD', 'NOVA TYRANT', 'ENTROPY KING', 'VOID EMPEROR', 'GALAXY BANE', 'DEATH ORBIT'];
class Boss extends Enemy {
    constructor(bw, x, y, bossType = null) {
        super('drone', x, y); 
        this.isBoss = true; 
        this.type = 'boss'; 
        this.bw = bw;
        this.r = 44 + bw * 2;
        
        // Oyuncu gücüne göre dinamik HP ölçekleme (Player DPS ve Max HP)
        const lPlayers = livePlayers();
        const totalDps = lPlayers.reduce((sum, p) => sum + (p.bd / p.sr) * (1 + (p.extraS || 0) * 0.7), 0);
        const playerPowerMult = Math.max(1.0, totalDps / 25);
        const maxPlayerHp = lPlayers.length > 0 ? Math.max(...lPlayers.map(p => p.mh)) : 100;
        
        // Temel HP'yi aşırı güçlendirdik, canavar gücüne eşitledik
        const baseBossHp = 1500 + bw * 500;
        this.hp = baseBossHp * DC.bhm * playerPowerMult;
        this.maxHp = this.hp;
        
        this.spd = 35 + bw * 2.5;
        
        // Oyuncu can havuzuna göre hasar ölçekleme
        const baseBossDmg = 25 + bw * 6;
        this.damage = baseBossDmg * DC.edm * Math.max(1.0, maxPlayerHp / 100);
        
        this.sc = 300 + bw * 50;
        this.color = '#ff00ff'; 
        this.sT = 0; 
        this.pT = 0;
        this.enraged = false; 
        this.sumT = 8; 
        this.shHp = 0;
        this.overloadT = 0; // Boss özel lazer aşırı yüklenme zamanlayıcısı
        
        this.bossName = BOSS_NAMES[Math.min(bw - 1, BOSS_NAMES.length - 1)] || 'COSMIC BOSS';
        
        // Özel Boss Çeşitleri: chaser (Void Phantom), bullethell (Nova Blaster), gravity (Entropy Star)
        this.bossType = bossType || ['chaser', 'bullethell', 'gravity'][randInt(0, 2)];
        
        if (this.bossType === 'chaser') {
            this.bossName = 'VOID PHANTOM ◈ ' + this.bossName;
            this.color = '#ff006a'; // Pembe/Kırmızı
            this.spd *= 1.35;
            this.dashTimer = 3.5;
            this.dashState = 'normal'; // 'normal', 'charging', 'dashing'
            this.chargeTimer = 0;
            this.dashDuration = 0;
            this.dashAngle = 0;
        } else if (this.bossType === 'bullethell') {
            this.bossName = 'NOVA BLASTER ◈ ' + this.bossName;
            this.color = '#bf00ff'; // Mor
            this.spd *= 0.85;
        } else if (this.bossType === 'gravity') {
            this.bossName = 'ENTROPY STAR ◈ ' + this.bossName;
            this.color = '#00f0ff'; // Turkuaz
            this.spd *= 0.95;
            this.dzTimer = 2.0;
        }
    }
    update(dt) {
        if (!this.alive) return false;
        this.aA += dt * 1.5; 
        this.fl = Math.max(0, this.fl - dt); 
        this.pT += dt;
        
        // Faz 2 Tetiklenme (%35 canın altında)
        if (!this.enraged && this.hp < this.maxHp * 0.35) {
            this.enraged = true; 
            this.spd *= 1.45;
            floatT(this.x, this.y - 50, 'ÖFKELENDİ! (FAZ 2)', '#ff0000', 26);
            spawnP(this.x, this.y, '#ff0000', 35, 200, 0.6, 4); 
            shake(12);
        }
        
        let tgt = null, td = Infinity; 
        const lp = livePlayers();
        for (const p of lp) { const d = dist(this, p); if (d < td) { td = d; tgt = p; } }
        if (!tgt) return true;
        
        const a = ang(this, tgt);
        
        // Boss Giriş Animasyonu (Yukarıdan aşağı yavaşça iner)
        if (this.y < 80) {
            this.y += 90 * dt;
            this.vx = 0; this.vy = 0;
            return true;
        }
        
        // Boss Tipi Davranış Mekanikleri
        if (this.bossType === 'chaser') {
            if (this.dashState === 'normal') {
                this.vx = lerp(this.vx, Math.cos(a) * this.spd, 0.05);
                this.vy = lerp(this.vy, Math.sin(a) * this.spd, 0.05);
                
                this.dashTimer -= dt;
                if (this.dashTimer <= 0) {
                    this.dashState = 'charging';
                    this.chargeTimer = 1.2;
                    this.vx = 0; this.vy = 0;
                    floatT(this.x, this.y - 45, 'KİLİTLENİYOR...', '#ff006a', 16);
                }
                
                // Normal atış burst
                this.sT -= dt * DC.bsr * (this.enraged ? 1.5 : 1.0);
                if (this.sT <= 0) {
                    this.sT = 1.35;
                    const saNow = ang(this, tgt);
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            if (!this.alive) return;
                            eBullets.push({ x: this.x, y: this.y, vx: Math.cos(saNow) * 320, vy: Math.sin(saNow) * 320, damage: 10 * DC.edm, size: 5, color: this.color, life: 2.5 });
                        }, i * 140);
                    }
                }
            } else if (this.dashState === 'charging') {
                // Şarj aşaması (Kırmızı partiküller saçar)
                if (Math.random() < 0.45) {
                    spawnP(this.x, this.y, '#ff006a', 3, 100, 0.35, 2.5);
                }
                this.chargeTimer -= dt;
                if (this.chargeTimer <= 0) {
                    this.dashState = 'dashing';
                    this.dashDuration = 0.8;
                    this.dashAngle = ang(this, tgt);
                    this.vx = Math.cos(this.dashAngle) * this.spd * 4.5;
                    this.vy = Math.sin(this.dashAngle) * this.spd * 4.5;
                    sfx.shoot();
                    shake(8);
                }
            } else if (this.dashState === 'dashing') {
                // Yüksek hızla hücum ederken yanlara mermiler bırakır
                if (Math.random() < 0.35) {
                    const perpA = this.dashAngle + Math.PI / 2;
                    eBullets.push({ x: this.x, y: this.y, vx: Math.cos(perpA) * 70, vy: Math.sin(perpA) * 70, damage: 12 * DC.edm, size: 5, color: this.color, life: 2 });
                    eBullets.push({ x: this.x, y: this.y, vx: -Math.cos(perpA) * 70, vy: -Math.sin(perpA) * 70, damage: 12 * DC.edm, size: 5, color: this.color, life: 2 });
                }
                this.dashDuration -= dt;
                if (this.dashDuration <= 0) {
                    this.dashState = 'normal';
                    this.dashTimer = rand(3.5, 5.5);
                    this.vx = 0; this.vy = 0;
                }
            }
        } else if (this.bossType === 'bullethell') {
            // Sonsuzluk (Figür-8) şeklinde yörünge hareketi
            const tx = canvas.width / 2 + Math.sin(this.pT * 0.8) * (canvas.width * 0.35);
            const ty = canvas.height / 2 - 50 + Math.cos(this.pT * 1.6) * (canvas.height * 0.2);
            this.vx = lerp(this.vx, (tx - this.x) * 1.5, 0.05);
            this.vy = lerp(this.vy, (ty - this.y) * 1.5, 0.05);
            
            // Dönen spiral mermiler
            this.sT -= dt * (this.enraged ? 1.65 : 1.0) * DC.bsr;
            if (this.sT <= 0) {
                this.sT = 0.12;
                const branches = this.enraged ? 8 : 4;
                const angleOffset = this.pT * 2.2;
                for (let i = 0; i < branches; i++) {
                    const sa = angleOffset + i * Math.PI * 2 / branches;
                    eBullets.push({ x: this.x, y: this.y, vx: Math.cos(sa) * 230, vy: Math.sin(sa) * 230, damage: 8 * DC.edm, size: 5, color: this.color, life: 3.5 });
                }
            }
            
            // Periyodik büyük halka mermileri
            if (this.pT % 5.5 < dt) {
                const count = 16;
                for (let i = 0; i < count; i++) {
                    const sa = i * Math.PI * 2 / count;
                    eBullets.push({ x: this.x, y: this.y, vx: Math.cos(sa) * 170, vy: Math.sin(sa) * 170, damage: 10 * DC.edm, size: 6, color: '#fff', life: 4 });
                }
            }
        } else if (this.bossType === 'gravity') {
            // Yavaşça oyuncuyu takip eder
            this.vx = lerp(this.vx, Math.cos(a) * this.spd, 0.03);
            this.vy = lerp(this.vy, Math.sin(a) * this.spd, 0.03);
            
            // Oyuncuları kendine çeker (Gravitational Pull)
            for (const p of lp) {
                const d = dist(this, p);
                if (d < 700) {
                    const force = (1 - d / 700) * 130 * dt;
                    const pullAngle = ang(p, this);
                    p.x += Math.cos(pullAngle) * force;
                    p.y += Math.sin(pullAngle) * force;
                    if (Math.random() < 0.15) {
                        spawnP(p.x, p.y, this.color, 1, 40, 0.3, 2);
                    }
                }
            }
            
            // Oyuncu konumlarına kırmızı patlayan tehlike alanları (Danger Zone) bırakır
            this.dzTimer -= dt;
            if (this.dzTimer <= 0) {
                this.dzTimer = this.enraged ? 2.0 : 3.0;
                for (const p of lp) {
                    dangerZones.push({
                        x: p.x + rand(-30, 30),
                        y: p.y + rand(-30, 30),
                        r: 110,
                        timer: 1.5,
                        maxTimer: 1.5,
                        damage: 28 * DC.edm,
                        color: '#ff3300'
                    });
                }
                floatT(this.x, this.y - 45, 'YERÇEKİMİ BOMBASI!', this.color, 16);
            }
            
            // Büyük yavaş yerçekimi gülleleri fırlatır
            this.sT -= dt * DC.bsr * (this.enraged ? 1.5 : 1.0);
            if (this.sT <= 0) {
                this.sT = 1.6;
                const count = 8;
                for (let i = 0; i < count; i++) {
                    const sa = a + i * Math.PI * 2 / count;
                    eBullets.push({ x: this.x, y: this.y, vx: Math.cos(sa) * 150, vy: Math.sin(sa) * 150, damage: 12 * DC.edm, size: 8, color: this.color, life: 5.0 });
                }
            }
        }
        
        this.x += this.vx * dt; this.y += this.vy * dt;
        
        this.x = clamp(this.x, this.r, canvas.width - this.r);
        this.y = clamp(this.y, this.r, canvas.height - this.r);
        
        // Minyon portali periyodik açar
        this.sumT -= dt;
        if (this.sumT <= 0) {
            this.sumT = this.enraged ? 6.0 : 9.0;
            const ts = ['drone', 'speeder', 'orbiter'];
            const amount = 2 + this.bw + (this.enraged ? 2 : 0);
            for (let i = 0; i < amount; i++) {
                const sa = rand(0, Math.PI * 2);
                enemies.push(new Enemy(ts[randInt(0, ts.length - 1)], this.x + Math.cos(sa) * 65, this.y + Math.sin(sa) * 65));
            }
            floatT(this.x, this.y - this.r - 20, 'MİNYON PORTAL!', '#ff66ff', 16);
        }
        
        // Çarpışma hasarı (saniyede sabit hasar olarak ayarlandı)
        for (const p of lp) {
            if (dist(this, p) < this.r + p.r) {
                p.takeDmg(this.damage * 0.3 * 60 * dt);
            }
        }
        
        return true;
    }
    die() {
        this.alive = false; 
        spawnExp(this.x, this.y, this.color, 4.5); 
        sfx.bKill(); 
        shake(28);
        slowT = 1.6; 
        slowF = 0.25; 
        screenFl = 0.5; 
        screenFC = '#ff00ff';
        
        const pts = Math.floor(this.sc * comboM * DC.sm); 
        score += pts; 
        totalKills++;
        floatT(this.x, this.y - 30, '+' + pts, GOLD, 26);
        livePlayers().forEach(p => p.gainXP(this.sc));
        
        // Dalga içindeki diğer bosslar yaşıyor mu kontrol et
        const otherBossesAlive = enemies.some(e => e.isBoss && e.alive && e !== this);
        if (!otherBossesAlive) {
            bossActive = null;
            document.getElementById('bossBar').classList.remove('active');
            showBossReward(this.bossName);
        }
    }
    draw(ctx) {
        if (!this.alive) return;
        const fl = this.fl > 0;
        const gs = this.r * 3; 
        const grd = ctx.createRadialGradient(this.x, this.y, this.r * 0.3, this.x, this.y, gs);
        grd.addColorStop(0, (this.enraged ? '#ff000020' : this.color + '18')); 
        grd.addColorStop(1, this.color + '00');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(this.x, this.y, gs, 0, Math.PI * 2); ctx.fill();
        
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.aA * 0.2);
        ctx.strokeStyle = fl ? '#fff' : this.color; 
        ctx.fillStyle = fl ? 'rgba(255,255,255,0.25)' : this.color + '20'; 
        ctx.lineWidth = 3;
        
        // Gelişmiş Boss Vektör Görselleri
        if (this.bossType === 'chaser') {
            ctx.beginPath();
            const points = 10;
            for(let i=0; i<points; i++) {
                const a = i * Math.PI * 2 / points;
                const r = i % 2 === 0 ? this.r : this.r * 0.75;
                ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.stroke(); ctx.fill();
        } else if (this.bossType === 'gravity') {
            ctx.beginPath();
            const points = 6;
            for(let i=0; i<points; i++) {
                const a = i * Math.PI * 2 / points;
                ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * this.r, Math.sin(a) * this.r);
            }
            ctx.closePath();
            ctx.stroke(); ctx.fill();
        } else {
            ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.stroke(); ctx.fill();
        }
        
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * this.r * 0.9, Math.sin(a) * this.r * 0.9); ctx.stroke();
        }
        
        ctx.beginPath(); ctx.arc(0, 0, this.r * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        
        if (this.bossType === 'gravity') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            for(let j=0; j<4; j++) {
                ctx.beginPath();
                ctx.arc(0, 0, this.r * 0.6, j * Math.PI/2 + this.aA, j * Math.PI/2 + this.aA + Math.PI/3);
                ctx.stroke();
            }
        }
        
        for (let i = 0; i < 6; i++) {
            const a = this.aA * 1.5 + i * Math.PI * 2 / 6;
            ctx.fillStyle = fl ? '#fff' : this.enraged ? '#ff3333' : this.color;
            ctx.beginPath(); 
            ctx.arc(Math.cos(a) * this.r * 0.7, Math.sin(a) * this.r * 0.7, 5 + Math.sin(this.aA + i) * 2, 0, Math.PI * 2); 
            ctx.fill();
        }
        ctx.fillStyle = this.enraged ? '#ff0000' : '#fff'; 
        ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

// ── Roguelike Yetenek Kartı Seçim Sistemi (Level Up) ──
function triggerLevelUpChoice(info) {
    gameState = 'levelChoice';
    levelingPlayer = info.player;
    setCursorMode(true);
    setSoundMuffled(true);
    sfx.lvl();
    
    const subt = document.getElementById('luPlayerSubtitle');
    subt.textContent = `◈ ${levelingPlayer.name.toUpperCase()} SEVİYE ATLADI (SEVİYE ${info.lv}) ◈`;
    subt.style.color = levelingPlayer.c;
    
    const container = document.getElementById('luCardsContainer');
    container.innerHTML = '';
    
    // Rastgele 3 eşsiz yetenek kartı seç
    const selectedKeys = [];
    while (selectedKeys.length < 3) {
        const k = UPG_KEYS[randInt(0, UPG_KEYS.length - 1)];
        if (!selectedKeys.includes(k)) selectedKeys.push(k);
    }
    
    selectedKeys.forEach((k, index) => {
        const u = UPG[k];
        
        // Nadirlik Belirleme Şansı (Common, Rare, Epic, Legendary)
        const roll = Math.random();
        let rarity = 'common';
        let title = u.name;
        let mult = 1.0;
        
        const forceLegendary = (info.lv % 5 === 0 && index === 0);
        
        if (forceLegendary || roll < 0.05) {
            rarity = 'legendary';
            title = '🌌 EFSANEVİ ' + u.name.toUpperCase();
            mult = 2.5;
        } else if (roll < 0.20) {
            rarity = 'epic';
            title = '🔮 DESTANSI ' + u.name;
            mult = 1.7;
        } else if (roll < 0.50) {
            rarity = 'rare';
            title = '✨ SEÇKİN ' + u.name;
            mult = 1.3;
        }
        
        const card = document.createElement('div');
        card.className = `lu-card ${rarity}`;
        card.innerHTML = `
            <div class="lu-card-icon" style="color:${u.color}; border-color:${u.color}30">${u.icon}</div>
            <div class="lu-card-name">${title}</div>
            <div class="lu-card-desc">${u.desc}</div>
            <div style="font-size: 0.6rem; opacity: 0.6; margin-top: auto; font-family: 'Rajdhani', sans-serif;">
                ${rarity === 'common' ? 'Sıradan Yetenek' : rarity === 'rare' ? 'Seçkin (+%30)' : rarity === 'epic' ? 'Destansı (+%70)' : 'Efsanevi (+%150)'}
            </div>
        `;
        
        card.addEventListener('click', () => {
            applyCardUpgrade(levelingPlayer, k, mult);
            
            document.getElementById('levelUpOv').classList.add('hidden');
            setCursorMode(false);
            setSoundMuffled(false);
            gameState = 'playing';
            updateUpgDisplay();
        });
        
        container.appendChild(card);
    });
    
    document.getElementById('levelUpOv').classList.remove('hidden');
}

function applyCardUpgrade(player, key, multiplier) {
    player.pU[key] = (player.pU[key] || 0) + multiplier;
    player.recalc();
    
    // Geliştirme alındığında oyuncunun can/kalkan barını hafif doldur
    player.hp = Math.min(player.mh, player.hp + player.mh * 0.2);
    player.sh = Math.min(player.ms, player.sh + player.ms * 0.15);
    
    spawnP(player.x, player.y, UPG[key].color, 25, 200, 0.5, 4);
    sfx.pow();
}

// ── Boss Ödülü Ekranı (5 Saniye Duraklatma) ──
function showBossReward(bossName) {
    bossRewardActive = true; bossRewardTimer = 5;
    gameState = 'bossReward';
    setCursorMode(true);
    setSoundMuffled(true);
    
    const rewards = [];
    const alivePlayers = livePlayers();
    const upgradeCount = 2;
    
    for (const pl of alivePlayers) {
        const given = [];
        for (let i = 0; i < upgradeCount; i++) {
            let k = UPG_KEYS[randInt(0, UPG_KEYS.length - 1)];
            pl.pU[k] = (pl.pU[k] || 0) + 2.5; // Efsanevi geliştirme (+2.5)
            pl.recalc();
            given.push(k);
        }
        pl.hp = pl.mh; pl.sh = pl.ms;
        rewards.push({ player: pl, given });
    }
    
    updateUpgDisplay();
    
    const el = document.getElementById('bossRewardOv');
    document.getElementById('brBossName').textContent = `"${bossName}" imha edildi!`;
    
    const cont = document.getElementById('brPlayers');
    cont.innerHTML = '';
    
    for (const rw of rewards) {
        const pl = rw.player;
        let html = `<div class="br-player-box"><div class="br-pname" style="color:${pl.c}">◈ ${pl.name.toUpperCase()}</div>`;
        html += `<div class="br-stats-grid">`;
        html += `<div class="br-stat">Can: <span>${Math.floor(pl.mh)}</span></div>`;
        html += `<div class="br-stat">Kalkan: <span>${Math.floor(pl.ms)}</span></div>`;
        html += `<div class="br-stat">Hasar: <span>${pl.bd.toFixed(1)}</span></div>`;
        html += `<div class="br-stat">Hız: <span>${Math.floor(pl.sp)}</span></div>`;
        html += `<div class="br-stat">Ateş Hz: <span>${(1 / pl.sr).toFixed(1)}/s</span></div>`;
        html += `<div class="br-stat">Kritik: <span>%${Math.floor(pl.crit * 100)}</span></div>`;
        html += `</div>`;
        
        html += `<div class="br-new-title">YENİ EFSANEVİ STATLARINIZ</div><div class="br-new-list">`;
        for (const k of rw.given) {
            const u = UPG[k];
            html += `<div class="br-upg-chip legendary" style="color:#ffd700; border-color:#ffd700; background:rgba(255,215,0,0.1); font-weight:bold; box-shadow: 0 0 10px rgba(255,215,0,0.25);">${u.icon} EFSANEVİ ${u.name.toUpperCase()}</div>`;
        }
        html += `</div>`;
        
        const entries = Object.entries(pl.pU);
        if (entries.length > 0) {
            html += `<div class="br-all-title">TÜM KALICI STATLAR</div><div class="br-all-list">`;
            for (const [k, v] of entries) {
                const u = UPG[k];
                if (u) html += `<div class="br-all-chip" style="color:${u.color}">${u.icon} ${u.name} x${v.toFixed(1)}</div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
        cont.innerHTML += html;
    }
    
    el.classList.add('show');
    sfx.pow();
}

function updateBossReward(dt) {
    bossRewardTimer -= dt;
    document.getElementById('brTimer').textContent = Math.ceil(bossRewardTimer);
    if (bossRewardTimer <= 0) {
        bossRewardActive = false;
        document.getElementById('bossRewardOv').classList.remove('show');
        setSoundMuffled(false);
        gameState = 'playing';
        setCursorMode(false);
    }
}

// ── Drop Eşyaları ──
function spawnPickup(x, y) {
    const t = PTYPES[randInt(0, PTYPES.length - 1)];
    pickups.push({ x, y, type: t, r: 12, life: 12, aA: rand(0, Math.PI * 2), color: PDATA[t].c });
}
function applyPickup(pl, t) {
    sfx.pow(); const d = PDATA[t];
    floatT(pl.x, pl.y - 30, d.n, d.c, 18);
    spawnP(pl.x, pl.y, d.c, 12, 130, 0.4, 3);
    switch (t) {
        case 'health': pl.hp = Math.min(pl.mh, pl.hp + 35); break;
        case 'shield': pl.sh = pl.ms; break;
        case 'bomb':
            for (const e of enemies) {
                if (!e.isBoss) {
                    e.hp = 0; e.die();
                } else {
                    e.takeDmg(60, false);
                }
            }
            shake(18); screenFl = 0.4; screenFC = '#ff4444'; break;
        default: pl.tP[t] = 8; break;
    }
}

// ── Kooperatif Sinerji Durum Kontrolü ──
function getActiveCoopStates() {
    if (MODE === '1p') return { synergy: false, linkDmgScale: 1.0, maxLinkD: 500 };
    if (!p1.alive || !p2.alive) return { synergy: false, linkDmgScale: 1.0, maxLinkD: 500 };
    
    // Destek (Aegis) sınıfı varsa sinerji ve bağ menzili 2 katına çıkar
    const hasAegis = p1.shipClass === 'aegis' || p2.shipClass === 'aegis';
    const maxLinkD = hasAegis ? 900 : 500;
    
    const d = dist(p1, p2);
    const synergyActive = (d < (hasAegis ? 280 : 150));
    
    let linkDmgScale = 1.0;
    if (d < maxLinkD) {
        linkDmgScale = 1.0 + (1.0 - d / maxLinkD) * 2.0;
    }
    
    if (synergyActive && Math.random() < 0.1) {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        spawnP(mx, my, GOLD, 1, 40, 0.4, 2);
    }
    
    return { synergy: synergyActive, linkDmgScale, maxLinkD };
}

// ── Çekirdek Helper Metotları ──
function livePlayers() {
    const r = []; if (p1.alive) r.push(p1);
    if (MODE === '2p' && p2.alive) r.push(p2);
    return r;
}

function updateUpgDisplay() {
    const players = MODE === '2p' ? [p1, p2] : [p1];
    for (const pl of players) {
        const c = document.getElementById(pl.id === 1 ? 'p1Upgs' : 'p2Upgs');
        c.innerHTML = '';
        for (const [k, v] of Object.entries(pl.pU)) {
            const d = UPG[k]; if (!d) continue;
            const el = document.createElement('div'); el.className = 'hud-ui';
            el.style.color = d.color; el.style.borderColor = d.color + '40';
            el.title = `${d.name} x${v.toFixed(1)}\n${d.desc}`;
            el.innerHTML = d.icon + (v >= 1 ? `<span class="uc">${Math.floor(v)}</span>` : '');
            c.appendChild(el);
        }
    }
}

function setCursorMode(visible) {
    if (visible) {
        document.body.classList.remove('playing-cursor');
        document.body.classList.add('menu-cursor');
    } else {
        document.body.classList.remove('menu-cursor');
        document.body.classList.add('playing-cursor');
    }
}

// ── Izgara Bükülme Formülü (Gravitational Grid Warp) ──
function getGridOffset(x, y) {
    let dx = 0, dy = 0;
    const players = livePlayers();
    
    // Oyuncu gemilerinin bükümü
    for (const p of players) {
        const distP = Math.hypot(x - p.x, y - p.y);
        if (distP < 240) {
            const strength = (1 - distP / 240) * 16;
            const angle = Math.atan2(y - p.y, x - p.x);
            dx -= Math.cos(angle) * strength;
            dy -= Math.sin(angle) * strength;
        }
    }
    
    // Boss gemilerinin bükümü
    const activeBosses = enemies.filter(e => e.isBoss && e.alive);
    for (const b of activeBosses) {
        const distB = Math.hypot(x - b.x, y - b.y);
        if (distB < 380) {
            const strength = (1 - distB / 380) * 35;
            const angle = Math.atan2(y - b.y, x - b.x);
            dx -= Math.cos(angle) * strength;
            dy -= Math.sin(angle) * strength;
        }
    }
    
    // Patlamalar ve Şok Dalgası Partiküllerinin Bükümü
    for (const p of particles) {
        if (p.t === 'shockwave') {
            const distPart = Math.hypot(x - p.x, y - p.y);
            const radius = p.s * (1 - p.l / p.ml) * 3;
            const dRange = Math.abs(distPart - radius);
            if (dRange < 70) {
                const strength = (1 - dRange / 70) * 16 * (p.l / p.ml);
                const angle = Math.atan2(y - p.y, x - p.x);
                dx += Math.cos(angle) * strength;
                dy += Math.sin(angle) * strength;
            }
        }
    }
    
    return { x: dx, y: dy };
}

// ── Dalga Sistemi ──
function startWave(w) {
    wave = w; waveTm = 0;
    const base = DC.bwe + Math.floor(wave * (1 + wave * DC.wsr));
    waveEC = Math.min(base, DC.mwe); waveSp = 0;
    
    waveDl = Math.max(0.2, DC.sd - wave * 0.05);
    
    if (wave > 1 && wave % 5 === 0) {
        const bn = wave / 5;
        const types = ['chaser', 'bullethell', 'gravity'];
        // Boss sayısı artış formülü, boss çeşit sayısıyla (types.length) sınırlandırılmıştır
        const numBosses = Math.min(types.length, Math.floor((wave - 5) / 10) + 1);
        
        for (let i = 0; i < numBosses; i++) {
            const bx = canvas.width / (numBosses + 1) * (i + 1);
            const by = -100 - (i * 60); // Hafif kademeli giriş
            const bType = types[(bn - 1 + i) % types.length];
            const b = new Boss(bn, bx, by, bType);
            enemies.push(b);
            if (i === 0) bossActive = b;
        }
        
        sfx.bWarn();
        floatT(canvas.width / 2, canvas.height / 2 - 50, numBosses > 1 ? '⚠ KOZMİK SAVAŞ GRUBU YAKLAŞIYOR!' : '⚠ BOSS YAKLAŞIYOR!', '#ff00ff', 28);
        
        const bBar = document.getElementById('bossBar');
        if (bBar) bBar.classList.add('active');
    }
    
    const el = document.getElementById('waveAnn');
    document.getElementById('waT').textContent = `DALGA ${wave}`;
    const subs = ['HAYATTA KAL', 'KORİDORU KORU', 'PARAZİT AKINI', 'KOZMİK SAVAŞ', 'KAOS KAÇINILMAZ'];
    document.getElementById('waS').textContent = wave % 5 === 0 ? '⚠ BOSS TESPİT EDİLDİ' : subs[randInt(0, subs.length - 1)];
    el.classList.add('show'); sfx.wave();
    setTimeout(() => el.classList.remove('show'), 2000);
}

function getET() {
    const r = Math.random();
    if (wave >= 14 && r < 0.08) return 'sweeper';
    if (wave >= 12 && r < 0.08) return 'sniper';
    if (wave >= 11 && r < 0.10) return 'phantom';
    if (wave >= 10 && r < 0.12) return 'shielder';
    if (wave >= 8 && r < 0.10) return 'healer';
    if (wave >= 7 && r < 0.14) return 'splitter';
    if (wave >= 6 && r < 0.15) return 'kamikaze';
    if (wave >= 5 && r < 0.16) return 'shooter';
    if (wave >= 4 && r < 0.12) return 'orbiter';
    if (wave >= 3 && r < 0.12) return 'tank';
    if (r < 0.28) return 'speeder';
    return 'drone';
}

function spawnEnemy() {
    const t = getET(); let x, y; const side = randInt(0, 3), pad = 50;
    switch (side) {
        case 0: x = rand(pad, canvas.width - pad); y = -pad; break;
        case 1: x = canvas.width + pad; y = rand(pad, canvas.height - pad); break;
        case 2: x = rand(pad, canvas.width - pad); y = canvas.height + pad; break;
        case 3: x = -pad; y = rand(pad, canvas.height - pad); break;
    }
    const e = new Enemy(t, x, y);
    
    // Üssel dalga zorluğu ölçekleme (Exponential wave scaling)
    const sf = Math.pow(1 + DC.wsr, wave - 1);
    const df = Math.pow(1 + DC.wsr * 0.75, wave - 1);
    
    // Oyuncu gücüne göre can ölçekleme (Yapay zekanın erimesini engeller)
    const lPlayers = livePlayers();
    const totalDps = lPlayers.reduce((sum, p) => sum + (p.bd / p.sr) * (1 + (p.extraS || 0) * 0.7), 0);
    const playerPowerMult = Math.max(1.0, totalDps / 30);
    const hpPowerScale = 1.0 + (playerPowerMult - 1.0) * 0.45;
    
    e.hp *= sf * hpPowerScale; 
    e.maxHp = e.hp; 
    e.spd *= (1 + (wave - 1) * 0.018); 
    e.damage *= df;
    if (e.shHp > 0) e.shHp *= sf * hpPowerScale;
    enemies.push(e); waveSp++;
}

// ── Lazer Bağı Render & Mekanikler ──
function drawLink(ctx, coopState) {
    if (MODE === '1p') return;
    if (!p1.alive || !p2.alive) return;
    
    const d = dist(p1, p2), maxD = coopState.maxLinkD;
    if (d > maxD) return;
    
    const segs = 30, time = gameTime * 3;
    const thicknessFactor = coopState.linkDmgScale;
    
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let s = 0; s < 3; s++) {
        const off = s * Math.PI * 2 / 3; ctx.beginPath();
        ctx.strokeStyle = s === 0 ? LINK : s === 1 ? P1 : P2;
        ctx.lineWidth = (2.2 - s * 0.5) * (0.6 + thicknessFactor * 0.4);
        ctx.globalAlpha = (1 - d / maxD) * (0.65 - s * 0.12);
        
        for (let i = 0; i <= segs; i++) {
            const t = i / segs; const x = lerp(p1.x, p2.x, t), y = lerp(p1.y, p2.y, t);
            const px = -(p2.y - p1.y) / d, py = (p2.x - p1.x) / d;
            const w = Math.sin(t * Math.PI * 4 + time + off) * (15 * (1 - d / maxD));
            const fx = x + px * w, fy = y + py * w;
            i === 0 ? ctx.moveTo(fx, fy) : ctx.lineTo(fx, fy);
        }
        ctx.stroke();
    }
    ctx.restore();
    
    // Lazer Hasarı
    linkDT += 1 / 60;
    if (linkDT >= 0.15) {
        linkDT = 0;
        let ld = (5 + wave * 0.8) * coopState.linkDmgScale;
        let activeBossesHit = [];
        
        for (const e of enemies) {
            if (!e.alive) continue;
            const dx = p2.x - p1.x, dy = p2.y - p1.y, l2 = dx * dx + dy * dy;
            if (l2 === 0) continue;
            let t = ((e.x - p1.x) * dx + (e.y - p1.y) * dy) / l2;
            t = clamp(t, 0, 1);
            const cx = p1.x + t * dx, cy = p1.y + t * dy;
            
            if (Math.hypot(e.x - cx, e.y - cy) < e.r + 15 && d < maxD) {
                if (e.isBoss) activeBossesHit.push(e);
                e.takeDmg(ld, false);
                spawnP(cx, cy, LINK, 2, 80, 0.15, 2);
            }
        }
        
        // Her boss için bağımsız aşırı yüklenme zamanlamasını kontrol et
        const allBosses = enemies.filter(e => e.isBoss && e.alive);
        for (const boss of allBosses) {
            if (activeBossesHit.includes(boss)) {
                boss.overloadT += 0.15;
                if (boss.overloadT >= 1.2) {
                    boss.overloadT = 0;
                    boss.takeDmg(120, true);
                    sfx.exp(); shake(20);
                    floatT(boss.x, boss.y - 40, '⚡ AŞIRI YÜKLENME!', LINK, 20);
                    spawnP(boss.x, boss.y, LINK, 30, 300, 0.8, 5, 'shockwave');
                }
            } else {
                boss.overloadT = Math.max(0, boss.overloadT - 0.1);
            }
        }
    }
    
    const rad = hasAegis ? 280 : 150;
    if (d < rad) {
        const za = (1 - d / rad) * 0.15;
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 80);
        g.addColorStop(0, `rgba(191, 0, 255, ${za})`);
        g.addColorStop(1, 'rgba(191, 0, 255, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, 80, 0, Math.PI * 2); ctx.fill();
    }
}

// Aegis sınıfının varlık kontrolü
function hasAegis() {
    return p1.shipClass === 'aegis' || (MODE === '2p' && p2.shipClass === 'aegis');
}

// ── Duraklatma Paneli ──
function updatePauseStatsUI() {
    const grid = document.getElementById('pauseStatsGrid');
    if (MODE === '2p') {
        grid.className = 'pilot-stats-flex';
        grid.style.display = 'flex';
        grid.style.gap = '10px';
        grid.innerHTML = renderPlayerStatPanel(p1) + renderPlayerStatPanel(p2);
    } else {
        grid.className = 'pilot-stats-flex';
        grid.style.display = 'block';
        grid.innerHTML = renderPlayerStatPanel(p1);
    }
}

function renderPlayerStatPanel(pl) {
    const isP1 = pl.id === 1;
    const nameColor = isP1 ? P1 : P2;
    const upgEntries = Object.entries(pl.pU);
    const shipLabels = { interceptor: 'Avcı', dreadnought: 'Kruvazör', aegis: 'Destek' };
    
    let upgradeHtml = '<div style="color: rgba(255,255,255,0.35); font-size:0.7rem; margin-top:6px;">Yükseltme Kartı Yok</div>';
    if (upgEntries.length > 0) {
        upgradeHtml = `<div class="br-all-list" style="margin-top:6px;">`;
        for (const [k, v] of upgEntries) {
            const u = UPG[k];
            if (u) upgradeHtml += `<div class="br-all-chip" style="color:${u.color}; border-color:${u.color}30; font-size:0.55rem; padding: 2px 6px;">${u.icon} ${u.name} x${v.toFixed(1)}</div>`;
        }
        upgradeHtml += `</div>`;
    }

    return `
        <div class="pilot-stat-col" style="border-color: ${nameColor}30; flex: 1;">
            <div style="font-family:'Orbitron', monospace; font-size:0.75rem; font-weight:700; color:${nameColor}; margin-bottom:8px; display:flex; justify-content:space-between;">
                <span>◈ ${pl.name.toUpperCase()} (${shipLabels[pl.shipClass]})</span>
                <span style="color:var(--gold)">Lv.${pl.lv}</span>
            </div>
            <div class="stat-line"><span class="lbl">Maks Can</span><span class="val">${Math.floor(pl.hp)}/${Math.floor(pl.mh)} HP</span></div>
            <div class="stat-line"><span class="lbl">Kalkan</span><span class="val">${Math.floor(pl.sh)}/${Math.floor(pl.ms)} SH</span></div>
            <div class="stat-line"><span class="lbl">Mermi Hasarı</span><span class="val">${pl.bd.toFixed(1)}</span></div>
            <div class="stat-line"><span class="lbl">Gemi Hızı</span><span class="val">${Math.floor(pl.sp)}</span></div>
            <div class="stat-line"><span class="lbl">Atış Hızı</span><span class="val">${(1 / pl.sr).toFixed(1)}/sn</span></div>
            <div class="stat-line"><span class="lbl">Kritik Şans</span><span class="val">%${Math.floor(pl.crit * 100)}</span></div>
            <div class="stat-line"><span class="lbl">Can Çalma</span><span class="val">+${pl.vamp} HP/Kill</span></div>
            
            <div style="font-family:'Rajdhani',sans-serif; font-size:0.6rem; color:rgba(255,255,255,0.3); text-transform:uppercase; margin-top:10px; border-top:1px solid rgba(255,255,255,0.04); padding-top:4px;">Kazanılan Prototip Kartlar</div>
            ${upgradeHtml}
        </div>
    `;
}

// ── Kurulum ve Başlangıç ──
function initGame() {
    const p1ShipClass = sessionStorage.getItem('cosmic_p1_ship') || 'interceptor';
    const p2ShipClass = sessionStorage.getItem('cosmic_p2_ship') || 'interceptor';
    
    p1 = new Player(1, canvas.width * (MODE === '2p' ? 0.35 : 0.5), canvas.height * 0.5, P1, P1D, P1_NAME, p1ShipClass);
    p1.invT = 3;
    
    if (MODE === '2p') {
        p2 = new Player(2, canvas.width * 0.65, canvas.height * 0.5, P2, P2D, P2_NAME, p2ShipClass);
        p2.invT = 3;
    } else {
        p2 = new Player(2, -999, -999, P2, P2D, '', 'interceptor');
        p2.alive = false; p2.respT = 99999;
    }
    
    bullets.length = 0; enemies.length = 0; eBullets.length = 0; pickups.length = 0; particles.length = 0; floats.length = 0; dangerZones.length = 0;
    levelUpQueue = [];
    score = 0; wave = 0; comboC = 0; comboTm = 0; comboM = 1; gameTime = 0; totalKills = 0;
    shakeI = 0; screenFl = 0; linkDT = 0; bossActive = null; slowT = 0; slowF = 1;
    bossRewardActive = false; bossRewardTimer = 0;
    beamOverloadTimer = 0;
    
    document.getElementById('bossBar').classList.remove('active');
    document.getElementById('bossRewardOv').classList.remove('show');
    document.getElementById('levelUpOv').classList.add('hidden');
    document.getElementById('pauseOv').classList.add('hidden');
    
    updateUpgDisplay();
    startWave(1);
    setCursorMode(false);
}

function startGame() {
    gameState = 'playing';
    initGame();
    document.getElementById('gameOverOv').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    const df = document.getElementById('hudDf'); df.textContent = DC.label; df.className = 'hud-df ' + DC.cls;
    eA();
    setSoundMuffled(false);
}

// ── Liderlik Tablosuna Kaydetme ──
function saveScore() {
    const playersLabel = MODE === '2p' ? `${P1_NAME} & ${P2_NAME}` : P1_NAME;
    CosmicLeaderboard.submitScore(playersLabel, score, wave, gameTime, DIFFKEY, MODE);
}

function endGame() {
    gameState = 'gameover';
    setCursorMode(true);
    saveScore();
    
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('bossBar').classList.remove('active');
    document.getElementById('bossRewardOv').classList.remove('show');
    document.getElementById('levelUpOv').classList.add('hidden');
    document.getElementById('gameOverOv').classList.remove('hidden');
    
    const fs = Math.floor(score);
    document.getElementById('goSc').textContent = fs.toLocaleString();
    document.getElementById('goWv').textContent = wave;
    document.getElementById('goKl').textContent = totalKills;
    const m = Math.floor(gameTime / 60), s = Math.floor(gameTime % 60);
    document.getElementById('goTm').textContent = `${m}:${s.toString().padStart(2, '0')}`;
    
    const list = JSON.parse(localStorage.getItem('cosmic_leaderboard') || '[]');
    list.sort((a,b) => b.score - a.score);
    const bestScore = list[0] ? list[0].score : fs;
    
    if (fs >= bestScore) {
        document.getElementById('goNr').classList.remove('hidden');
    } else {
        document.getElementById('goNr').classList.add('hidden');
    }
    
    document.getElementById('goHs').innerHTML = `TÜM ZAMANLARIN YEREL REKORU: <span style="color:${GOLD}">${bestScore.toLocaleString()}</span>`;
    
    // Yükseltme Özet Bilgileri
    const sum = document.getElementById('goUsum'); let html = '';
    const players = MODE === '2p' ? [p1, p2] : [p1];
    for (const pl of players) {
        const ent = Object.entries(pl.pU); if (ent.length === 0) continue;
        html += `<div class="go-ut" style="color:${pl.c}">${pl.name.toUpperCase()} PİLOT KARTLARI</div><div class="go-ul">`;
        for (const [k, v] of ent) {
            const u = UPG[k]; if (u) html += `<div class="go-uc" style="color:${u.color};border-color:${u.color}40">${u.icon} ${u.name} x${v.toFixed(1)}</div>`;
        }
        html += '</div>';
    }
    sum.innerHTML = html;
}

// ── Güncelleme Döngüsü ──
function update(dt) {
    if (gameState === 'bossReward') {
        updateBossReward(dt);
        return;
    }
    
    // Seviye atlama ekranı açıldığında oyunu duraklat
    if (gameState === 'levelChoice') {
        return;
    }
    
    // Kuyrukta seviye atlama olayı varsa çalıştır
    if (levelUpQueue.length > 0) {
        triggerLevelUpChoice(levelUpQueue.shift());
        return;
    }
    
    if (gameState !== 'playing') return;
    
    if (slowT > 0) {
        slowT -= dt; slowF = lerp(slowF, 1, dt * 2); if (slowT <= 0) slowF = 1;
    }
    const eDt = dt * slowF; gameTime += eDt;
    
    const coopState = getActiveCoopStates();
    
    p1.update(eDt, coopState.synergy);
    if (MODE === '2p') p2.update(eDt, coopState.synergy);
    
    // Tehlike alanları güncellemesi (Danger Zones)
    for (let i = dangerZones.length - 1; i >= 0; i--) {
        const dz = dangerZones[i];
        dz.timer -= eDt;
        if (dz.timer <= 0) {
            spawnExp(dz.x, dz.y, dz.color, 1.8);
            sfx.exp();
            shake(15);
            for (const p of livePlayers()) {
                if (dist(p, dz) < dz.r) {
                    p.takeDmg(dz.damage);
                }
            }
            dangerZones.splice(i, 1);
        }
    }
    
    if (MODE === '1p') {
        if (!p1.alive) { endGame(); return; }
    } else {
        if (!p1.alive && !p2.alive) { endGame(); return; }
    }
    
    // Diriltme Mekaniği
    if (MODE === '2p') {
        if (!p1.alive && p2.alive && p1.respT <= 0) {
            p1.reset(p2.x + rand(-30, 30), p2.y + rand(-30, 30)); p1.hp = p1.mh * 0.4;
            spawnP(p1.x, p1.y, P1, 20, 150, 0.5, 3); floatT(p1.x, p1.y - 30, 'DİRİLDİ!', P1, 22); updateUpgDisplay();
            // Dirilmede itici kalkan şoku
            particles.push(new Particle(p1.x, p1.y, 0, 0, P1, 0.35, 30, 'shockwave'));
        }
        if (!p2.alive && p1.alive && p2.respT <= 0) {
            p2.reset(p1.x + rand(-30, 30), p1.y + rand(-30, 30)); p2.hp = p2.mh * 0.4;
            spawnP(p2.x, p2.y, P2, 20, 150, 0.5, 3); floatT(p2.x, p2.y - 30, 'DİRİLDİ!', P2, 22); updateUpgDisplay();
            particles.push(new Particle(p2.x, p2.y, 0, 0, P2, 0.35, 30, 'shockwave'));
        }
    }
    
    if (comboTm > 0) {
        comboTm -= eDt; if (comboTm <= 0) { comboC = 0; comboM = 1; }
    }
    
    if (MODE === '2p' && p1.alive && p2.alive) {
        const d = dist(p1, p2);
        if (d < 150) {
            comboM = Math.max(comboM, 1 + (1 - d / 150) * 2);
        }
    }
    
    waveTm += eDt;
    if (waveSp < waveEC && waveTm >= waveDl) { waveTm = 0; spawnEnemy(); }
    if (waveSp >= waveEC && enemies.every(e => !e.alive)) startWave(wave + 1);
    
    // Mermiler
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i]; b.x += b.vx * eDt; b.y += b.vy * eDt; b.life -= eDt;
        if (b.life <= 0 || b.x < -50 || b.x > canvas.width + 50 || b.y < -50 || b.y > canvas.height + 50) { bullets.splice(i, 1); continue; }
        
        let hit = false;
        for (const e of enemies) {
            if (!e.alive) continue;
            if (dist(b, e) < e.r + b.size) {
                e.takeDmg(b.damage, b.crit);
                if (!b.piercing) hit = true;
                spawnP(b.x, b.y, b.color, 3, 80, 0.2, 2); sfx.hit();
                if (!b.piercing) break;
            }
        }
        if (hit) bullets.splice(i, 1);
    }
    
    // Düşman Mermileri
    for (let i = eBullets.length - 1; i >= 0; i--) {
        const b = eBullets[i]; b.x += b.vx * eDt; b.y += b.vy * eDt; b.life -= eDt;
        if (b.life <= 0 || b.x < -50 || b.x > canvas.width + 50 || b.y < -50 || b.y > canvas.height + 50) { eBullets.splice(i, 1); continue; }
        for (const p of livePlayers()) {
            if (dist(b, p) < p.r + b.size) {
                p.takeDmg(b.damage); spawnP(b.x, b.y, b.color, 5, 100, 0.3, 2);
                eBullets.splice(i, 1); break;
            }
        }
    }
    
    for (let i = enemies.length - 1; i >= 0; i--) { if (!enemies[i].update(eDt) || !enemies[i].alive) { if (!enemies[i].alive) enemies.splice(i, 1); } }
    
    for (let i = pickups.length - 1; i >= 0; i--) {
        const pu = pickups[i]; pu.life -= eDt; pu.aA += eDt * 3;
        if (pu.life <= 0) { pickups.splice(i, 1); continue; }
        for (const p of livePlayers()) { if (dist(pu, p) < pu.r + p.r + 10) { applyPickup(p, pu.type); pickups.splice(i, 1); break; } }
    }
    
    for (let i = particles.length - 1; i >= 0; i--) if (!particles[i].update(eDt)) particles.splice(i, 1);
    for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.y += f.vy * eDt; f.l -= eDt; if (f.l <= 0) floats.splice(i, 1); }
    
    shakeI *= 0.9; if (shakeI < 0.5) shakeI = 0;
    if (screenFl > 0) screenFl -= eDt * 2;
    score += eDt * 2;
    
    updateHUD();
}

function updateHUD() {
    document.getElementById('p1Hp').style.width = (p1.alive ? p1.hp / p1.mh * 100 : 0) + '%';
    document.getElementById('p1Sh').style.width = (p1.alive ? p1.sh / p1.ms * 100 : 0) + '%';
    document.getElementById('p1Xp').style.width = (p1.xp / p1.xpN * 100) + '%';
    document.getElementById('p1Lv').textContent = 'Lv.' + p1.lv;
    
    if (MODE === '2p') {
        document.getElementById('p2Hp').style.width = (p2.alive ? p2.hp / p2.mh * 100 : 0) + '%';
        document.getElementById('p2Sh').style.width = (p2.alive ? p2.sh / p2.ms * 100 : 0) + '%';
        document.getElementById('p2Xp').style.width = (p2.xp / p2.xpN * 100) + '%';
        document.getElementById('p2Lv').textContent = 'Lv.' + p2.lv;
    }
    
    document.getElementById('hudSc').textContent = Math.floor(score).toLocaleString();
    document.getElementById('hudWv').textContent = 'DALGA ' + wave;
    const m = Math.floor(gameTime / 60), s = Math.floor(gameTime % 60);
    document.getElementById('hudTm').textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    
    const cEl = document.getElementById('hudCo');
    if (comboM > 1) {
        cEl.classList.add('active'); cEl.textContent = `COMBO x${comboM.toFixed(1)}`;
    } else {
        cEl.classList.remove('active');
    }
    
    // Çoklu boss can barı ve ismi güncellemesi
    const activeBosses = enemies.filter(e => e.isBoss && e.alive);
    const bossBar = document.getElementById('bossBar');
    if (activeBosses.length > 0) {
        bossBar.classList.add('active');
        
        let html = '<div style="display: flex; gap: 15px; justify-content: center; width: 100%;">';
        for (const b of activeBosses) {
            const hpPct = Math.max(0, b.hp / b.maxHp * 100).toFixed(1);
            let label = b.bossName;
            if (b.y < 80) {
                label += ' (GİRİŞ...)';
            } else if (b.enraged) {
                label += ' (FAZ 2)';
            }
            
            html += `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 90px; max-width: 180px;">
                    <div class="bn" style="font-size:0.55rem; letter-spacing:0.1em; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center;">${label}</div>
                    <div class="bhw" style="height:6px; border-color:${b.color}40;"><div class="bhb" style="width:${hpPct}%; background:linear-gradient(90deg, ${b.color}, #ff006a); box-shadow:0 0 10px ${b.color}50;"></div></div>
                </div>
            `;
        }
        html += '</div>';
        bossBar.innerHTML = html;
    } else {
        bossBar.classList.remove('active');
        bossBar.innerHTML = '';
    }
}

// ── Çizim İşlemleri ──
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (shakeI > 0) ctx.translate((Math.random() - 0.5) * shakeI, (Math.random() - 0.5) * shakeI);
    drawBG();
    
    if (gameState === 'playing' || gameState === 'paused' || gameState === 'bossReward' || gameState === 'levelChoice') {
        drawArena();
        
        const coopState = getActiveCoopStates();
        drawLink(ctx, coopState);
        
        // Pickups
        for (const pu of pickups) {
            const pulse = (Math.sin(pu.aA) + 1) * 0.5; const d = PDATA[pu.type];
            ctx.globalAlpha = 0.3 + pulse * 0.3;
            const g = ctx.createRadialGradient(pu.x, pu.y, 0, pu.x, pu.y, pu.r * 3); g.addColorStop(0, pu.color + '40'); g.addColorStop(1, pu.color + '00');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.r * 3, 0, Math.PI * 2); ctx.fill();
            
            ctx.globalAlpha = pu.life < 3 ? (Math.sin(pu.aA * 5) + 1) * 0.5 : 1;
            ctx.fillStyle = pu.color + '30'; ctx.strokeStyle = pu.color; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.r + pulse * 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            
            ctx.fillStyle = pu.color; ctx.font = 'bold 13px Orbitron'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(d.i, pu.x, pu.y); ctx.globalAlpha = 1;
        }
        
        // Tehlike Alanlarını Çiz (Danger Zones)
        for (const dz of dangerZones) {
            const progress = Math.max(0, dz.timer / dz.maxTimer);
            ctx.save();
            ctx.strokeStyle = dz.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(dz.x, dz.y, dz.r, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = dz.color + '25'; // %15 saydamlık
            ctx.beginPath();
            ctx.arc(dz.x, dz.y, dz.r * (1 - progress), 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = dz.color;
            ctx.font = 'bold 11px Orbitron';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚠ DANGER', dz.x, dz.y);
            ctx.restore();
        }
        
        for (const e of enemies) e.draw(ctx);
        
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const b of bullets) {
            const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size * 3); g.addColorStop(0, b.color + '60'); g.addColorStop(1, b.color + '00');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.size * 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = b.crit ? '#ffff00' : '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, b.size * (b.crit ? 0.9 : 0.6), 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
        }
        
        for (const b of eBullets) {
            ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        
        p1.draw(ctx);
        if (MODE === '2p') p2.draw(ctx);
        
        for (const p of particles) p.draw(ctx);
        
        for (const f of floats) {
            ctx.globalAlpha = clamp(f.l / f.ml, 0, 1);
            ctx.fillStyle = f.c; ctx.font = `bold ${f.s}px Orbitron`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(f.t, f.x, f.y);
        }
        ctx.globalAlpha = 1;
        
        if (screenFl > 0) {
            ctx.globalAlpha = screenFl * 0.3; ctx.fillStyle = screenFC;
            ctx.fillRect(-50, -50, canvas.width + 100, canvas.height + 100); ctx.globalAlpha = 1;
        }
        
        // Kritik durum CRT Glitch Efekti
        const pList = livePlayers();
        let isLowHealth = false;
        for (const p of pList) { if (p.hp / p.mh < 0.25) isLowHealth = true; }
        if (isLowHealth && Math.random() < 0.08 && gameState === 'playing') {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 0, 106, 0.02)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(255, 0, 106, 0.15)';
            ctx.lineWidth = rand(1, 4);
            const ry = rand(0, canvas.height);
            ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(canvas.width, ry); ctx.stroke();
            ctx.restore();
            shake(1.5);
        }
        
        drawVig();
    }
    ctx.restore();
}

function drawBG() {
    const bg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
    bg.addColorStop(0, '#04010a'); bg.addColorStop(0.5, '#020006'); bg.addColorStop(1, '#000');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (const n of nebulae) {
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        ng.addColorStop(0, `hsla(${n.h},80%,40%,${n.a})`); ng.addColorStop(0.5, `hsla(${n.h+20},70%,30%,${n.a * 0.5})`);
        ng.addColorStop(1, 'transparent'); ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }
    
    const timeSec = performance.now() / 1000;
    starLayers.forEach(layer => {
        ctx.fillStyle = layer.color;
        for (const s of layer.stars) {
            const x = (s.x - gameTime * layer.speed * 40) % canvas.width;
            const y = s.y % canvas.height;
            const finalX = x < 0 ? x + canvas.width : x;
            
            const twinkle = layer.size * (0.6 + 0.4 * Math.sin(timeSec * s.tw));
            ctx.beginPath();
            ctx.arc(finalX, y, twinkle, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Izgara çizgilerinin bükülmesi (Grid Deformation)
    ctx.strokeStyle = 'rgba(120,60,220,0.035)'; ctx.lineWidth = 1;
    const step = 60;
    
    // Yatay çizgiler
    for (let y = 0; y < canvas.height + step; y += step) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width + step; x += 30) {
            const offset = getGridOffset(x, y);
            ctx[x === 0 ? 'moveTo' : 'lineTo'](x + offset.x, y + offset.y);
        }
        ctx.stroke();
    }
    
    // Dikey çizgiler
    for (let x = 0; x < canvas.width + step; x += step) {
        ctx.beginPath();
        for (let y = 0; y < canvas.height + step; y += 30) {
            const offset = getGridOffset(x, y);
            ctx[y === 0 ? 'moveTo' : 'lineTo'](x + offset.x, y + offset.y);
        }
        ctx.stroke();
    }
}

function drawArena() {
    const p = 20; ctx.strokeStyle = 'rgba(100,60,180,0.12)'; ctx.lineWidth = 2; ctx.setLineDash([10, 10]); ctx.strokeRect(p, p, canvas.width - p * 2, canvas.height - p * 2); ctx.setLineDash([]);
    const cs = 30; ctx.strokeStyle = 'rgba(100,60,180,0.25)';
    [[p, p, 1, 1], [canvas.width - p, p, -1, 1], [p, canvas.height - p, 1, -1], [canvas.width - p, canvas.height - p, -1, -1]].forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath(); ctx.moveTo(cx, cy + dy * cs); ctx.lineTo(cx, cy); ctx.lineTo(cx + dx * cs, cy); ctx.stroke();
    });
}
function drawVig() {
    const v = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.3, canvas.width / 2, canvas.height / 2, canvas.width * 0.8);
    v.addColorStop(0, 'transparent'); v.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ── Döngü Yönetimi ──
let lastT = 0;
function loop(ts) {
    const dt = Math.min((ts - lastT) / 1000, 0.05); lastT = ts;
    if (gameState === 'playing' || gameState === 'bossReward' || gameState === 'levelChoice') update(dt);
    draw();
    requestAnimationFrame(loop);
}

function resumeGame() {
    gameState = 'playing';
    document.getElementById('pauseOv').classList.add('hidden');
    setSoundMuffled(false);
    setCursorMode(false);
}

function pauseGame() {
    gameState = 'paused';
    updatePauseStatsUI();
    document.getElementById('pauseOv').classList.remove('hidden');
    setSoundMuffled(true);
    setCursorMode(true);
}

document.getElementById('resumeBtn').addEventListener('click', resumeGame);
document.getElementById('resumeGameBtn').addEventListener('click', resumeGame);
document.getElementById('restartGameBtn').addEventListener('click', () => {
    startGame();
});
document.getElementById('quitBtn').addEventListener('click', () => {
    endGame();
});

// Ayarlar panel kontrolleri
const sfxVolumeSlider = document.getElementById('sfxVolumeRange');
const sfxVolumeText = document.getElementById('sfxVolumeVal');
sfxVolumeSlider.addEventListener('input', () => {
    sfxVolume = sfxVolumeSlider.value / 100;
    sfxVolumeText.textContent = sfxVolumeSlider.value + '%';
});

const synthSoundToggle = document.getElementById('synthSoundToggle');
synthSoundToggle.addEventListener('click', () => {
    synthSoundActive = !synthSoundActive;
    if (synthSoundActive) {
        synthSoundToggle.textContent = 'AÇIK';
        synthSoundToggle.className = 'toggle-btn on';
    } else {
        synthSoundToggle.textContent = 'KAPALI';
        synthSoundToggle.className = 'toggle-btn off';
    }
});

// Oyun Bitti Kontrolleri
document.getElementById('retryBtn').addEventListener('click', startGame);
document.getElementById('menuBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Klavye Giriş Yönetimi
const keys = {};
addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Enter' && gameState === 'gameover') startGame();
    if (e.code === 'Escape') {
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
    }
});
addEventListener('keyup', e => { delete keys[e.code]; });

// ── Fare Geri/İleri (Mouse4/Mouse5) Tuşlarını Engelleme ve Çıkış Uyarısı ──
window.addEventListener('mousedown', e => {
    if (e.button === 3 || e.button === 4) {
        e.preventDefault();
    }
});
window.addEventListener('mouseup', e => {
    if (e.button === 3 || e.button === 4) {
        e.preventDefault();
    }
});
window.addEventListener('auxclick', e => {
    if (e.button === 3 || e.button === 4) {
        e.preventDefault();
    }
});

// Sayfadan çıkışta uyarı çıkarma (beforeunload)
window.addEventListener('beforeunload', e => {
    if (gameState === 'playing' || gameState === 'paused' || gameState === 'bossReward' || gameState === 'levelChoice') {
        e.preventDefault();
        e.returnValue = 'Oyundan çıkmak istediğinize emin misiniz? Simülasyon ilerlemeniz kaybolacak.';
        return e.returnValue;
    }
});

// Tarayıcı geri/ileri butonunu engellemek için dummy history ekleme
history.pushState(null, null, location.href);
window.addEventListener('popstate', () => {
    history.pushState(null, null, location.href);
});

const PTYPES = ['health', 'shield', 'rapidfire', 'damage', 'tripleshot', 'speed', 'bomb', 'piercing'];
const PDATA = {
    health: { i: '♥', n: 'CAN', c: '#ff4444' },
    shield: { i: '◆', n: 'KALKAN', c: '#bf00ff' },
    rapidfire: { i: '»', n: 'HIZLI ATEŞ', c: '#ffff00' },
    damage: { i: '★', n: 'GÜÇ', c: '#ff8800' },
    tripleshot: { i: '⋮', n: 'ÜÇLÜ ATIŞ', c: '#00ff88' },
    speed: { i: '⚡', n: 'HIZ', c: '#00ccff' },
    bomb: { i: '●', n: 'BOMBA', c: '#ff0000' },
    piercing: { i: '→', n: 'DELİCİ', c: '#ffffff' }
};

startGame();
requestAnimationFrame(loop);
