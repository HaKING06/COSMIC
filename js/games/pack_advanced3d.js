/**
 * COSMIC UNIVERSE v11.0 — Advanced 3D Physics & Dogfight Pack
 * Real Three.js (window.THREE) + Cannon-es (window.CANNON) Engines
 * Registers:
 *   - moon-rover-3d-odyssey (3D Rigid-Body Lunar Rover Rally)
 *   - starfox-canyon-ace    (3D Corridor Dogfighter + Barrel Roll + Dreadnought Bosses)
 */
(function (global) {
    'use strict';

    const Engines = global.COSMIC_GAME_ENGINES = global.COSMIC_GAME_ENGINES || {};

    const STAGE_W = 960;
    const STAGE_H = 580;
    const TAU = Math.PI * 2;

    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function damp(a, b, lambda, dt) {
        return lerp(a, b, 1 - Math.exp(-lambda * dt));
    }

    function createRng(seed) {
        let s = (seed >>> 0) || 424242;
        return function next() {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    function drawRoundRect(g, x, y, w, h, r) {
        if (typeof g.roundRect === 'function') {
            g.roundRect(x, y, w, h, r);
            return;
        }
        const rr = Math.min(r, w * 0.5, h * 0.5);
        g.moveTo(x + rr, y);
        g.lineTo(x + w - rr, y);
        g.arcTo(x + w, y, x + w, y + rr, rr);
        g.lineTo(x + w, y + h - rr);
        g.arcTo(x + w, y + h, x + w - rr, y + h, rr);
        g.lineTo(x + rr, y + h);
        g.arcTo(x, y + h, x, y + h - rr, rr);
        g.lineTo(x, y + rr);
        g.arcTo(x, y, x + rr, y, rr);
        g.closePath();
    }

    function createCoreHelpers(ctx) {
        const tr = typeof ctx.t === 'function'
            ? (trStr, enStr) => ctx.t(trStr, enStr)
            : (trStr, enStr) => (ctx.lang === 'en' ? enStr : trStr);

        function playAudio(key, jitter) {
            try {
                ctx.audio?.play?.(key, jitter);
            } catch (_) { /* audio optional */ }
        }

        function unlockAudio() {
            try {
                ctx.audio?.unlock?.();
            } catch (_) { /* audio optional */ }
        }

        function setHud(payload) {
            try {
                ctx.setHud?.(payload);
            } catch (_) { /* safe ignore */ }
        }

        function ensureStageRelative() {
            if (!ctx.stageEl) return;
            try {
                const pos = global.getComputedStyle(ctx.stageEl).position;
                if (pos === 'static') ctx.stageEl.style.position = 'relative';
            } catch (_) { /* ignore */ }
        }

        function makeCanvas(kind, w, h) {
            const width = w || STAGE_W;
            const height = h || STAGE_H;
            let cnv = null;
            if (typeof ctx.createCanvas === 'function') {
                cnv = ctx.createCanvas(kind, width, height);
            }
            if (!cnv) {
                cnv = document.createElement('canvas');
                cnv.width = width;
                cnv.height = height;
                cnv.tabIndex = 0;
                if (ctx.stageEl) ctx.stageEl.appendChild(cnv);
            }
            cnv.width = width;
            cnv.height = height;
            cnv.style.position = 'absolute';
            cnv.style.inset = '0';
            cnv.style.width = '100%';
            cnv.style.height = '100%';
            cnv.style.display = 'block';
            cnv.style.touchAction = 'none';
            return cnv;
        }

        function createHudOverlayCanvas(w, h) {
            const cnv = document.createElement('canvas');
            cnv.width = w || STAGE_W;
            cnv.height = h || STAGE_H;
            cnv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:5;';
            if (ctx.stageEl) ctx.stageEl.appendChild(cnv);
            return cnv;
        }

        function createWebGLRenderer(canvas) {
            const THREE = global.THREE;
            const CANNON = global.CANNON;
            if (!THREE || !CANNON) {
                return { error: tr('3D fizik/render kütüphaneleri yüklenemedi (THREE / CANNON).', '3D libraries failed to load (THREE / CANNON).') };
            }
            try {
                const renderer = new THREE.WebGLRenderer({
                    canvas,
                    antialias: true,
                    powerPreference: 'high-performance'
                });
                renderer.setPixelRatio(Math.min(2, global.devicePixelRatio || 1));
                renderer.setSize(STAGE_W, STAGE_H, false);
                if (THREE.SRGBColorSpace) {
                    renderer.outputColorSpace = THREE.SRGBColorSpace;
                }
                return { renderer, THREE, CANNON };
            } catch (err) {
                return { error: (err && err.message) ? err.message : tr('WebGL bağlamı başlatılamadı.', 'WebGL context could not be initialized.') };
            }
        }

        function mountFallbackCard(reason) {
            ensureStageRelative();
            const card = document.createElement('div');
            card.style.cssText = [
                'position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;',
                'align-items:center;justify-content:center;padding:28px;text-align:center;',
                'background:radial-gradient(circle at 50% 35%, #121c33 0%, #050811 100%);',
                'color:#e2e8f0;font-family:"Space Grotesk","Inter",sans-serif;'
            ].join('');
            const title = document.createElement('div');
            title.style.cssText = 'font-size:20px;font-weight:700;color:#fbbf24;margin-bottom:10px;';
            title.textContent = tr('WebGL 3D Başlatılamadı', 'WebGL 3D Unavailable');
            const body = document.createElement('div');
            body.style.cssText = 'max-width:520px;font-size:14px;line-height:1.55;color:#94a3b8;';
            body.textContent = tr(
                `Tarayıcınızda WebGL hızlandırması kullanılamıyor (${reason}). Donanım hızlandırmayı etkinleştirip tekrar deneyin.`,
                `WebGL hardware rendering is unavailable in this browser (${reason}). Enable hardware acceleration and try again.`
            );
            card.appendChild(title);
            card.appendChild(body);
            if (ctx.stageEl) ctx.stageEl.appendChild(card);

            setHud({
                score: 0,
                level: 1,
                maxLevel: 1,
                lives: 0,
                statusText: tr('WebGL Devre Dışı', 'WebGL Disabled'),
                objectiveText: tr('3D mod için WebGL gerekli', 'WebGL required for 3D mode')
            });

            return {
                restart() {},
                destroy() {
                    if (card.parentNode) card.remove();
                }
            };
        }

        function createInput(canvas) {
            const keys = new Set();
            const justPressed = new Set();
            const justReleased = new Set();
            const pointer = {
                active: false,
                usingPointer: false,
                down: false,
                nx: 0,
                ny: 0,
                px: STAGE_W * 0.5,
                py: STAGE_H * 0.5,
                justClicked: false
            };

            const isFormEl = (el) => el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);

            const onKeyDown = (e) => {
                if (isFormEl(e.target)) return;
                unlockAudio();
                const code = e.code || '';
                const key = (e.key || '').toLowerCase();
                if (code && !keys.has(code)) justPressed.add(code);
                if (key && !keys.has(key)) justPressed.add(key);
                if (code) keys.add(code);
                if (key) keys.add(key);
                if (/^(KeyW|KeyA|KeyS|KeyD|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/.test(code)) {
                    pointer.usingPointer = false;
                }
                if (code === 'Space' || code.startsWith('Arrow')) {
                    e.preventDefault();
                }
            };

            const onKeyUp = (e) => {
                const code = e.code || '';
                const key = (e.key || '').toLowerCase();
                if (code && keys.has(code)) justReleased.add(code);
                if (key && keys.has(key)) justReleased.add(key);
                keys.delete(code);
                if (key) keys.delete(key);
            };

            const updatePointer = (e) => {
                const rect = canvas.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
                const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
                const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
                const px = (nx * 0.5 + 0.5) * STAGE_W;
                const py = (ny * 0.5 + 0.5) * STAGE_H;
                if ((inside || pointer.down || e.type === 'pointerdown') && (Math.hypot(px - pointer.px, py - pointer.py) >= 2.5 || e.type === 'pointerdown')) {
                    pointer.usingPointer = true;
                }
                if (inside || pointer.down || e.type === 'pointerdown') {
                    pointer.nx = nx;
                    pointer.ny = ny;
                    pointer.px = px;
                    pointer.py = py;
                    pointer.active = true;
                }
            };

            const onPointerDown = (e) => {
                unlockAudio();
                pointer.down = true;
                pointer.justClicked = true;
                updatePointer(e);
                try { canvas.focus({ preventScroll: true }); } catch (_) {}
            };

            const onPointerMove = (e) => {
                updatePointer(e);
            };

            const onPointerUp = () => {
                pointer.down = false;
            };

            const onBlur = () => {
                keys.clear();
                justPressed.clear();
                justReleased.clear();
                pointer.down = false;
            };

            global.addEventListener('keydown', onKeyDown, { passive: false });
            global.addEventListener('keyup', onKeyUp);
            global.addEventListener('blur', onBlur);
            canvas.addEventListener('pointerdown', onPointerDown);
            global.addEventListener('pointermove', onPointerMove);
            global.addEventListener('pointerup', onPointerUp);
            global.addEventListener('pointercancel', onPointerUp);

            return {
                keys,
                pointer,
                hasKey(...names) {
                    for (let i = 0; i < names.length; i++) {
                        if (keys.has(names[i])) return true;
                    }
                    return false;
                },
                consumePressed(...names) {
                    let hit = false;
                    for (let i = 0; i < names.length; i++) {
                        if (justPressed.has(names[i])) {
                            justPressed.delete(names[i]);
                            hit = true;
                        }
                    }
                    return hit;
                },
                consumeReleased(...names) {
                    let hit = false;
                    for (let i = 0; i < names.length; i++) {
                        if (justReleased.has(names[i])) {
                            justReleased.delete(names[i]);
                            hit = true;
                        }
                    }
                    return hit;
                },
                clearFrameEvents() {
                    justPressed.clear();
                    justReleased.clear();
                    pointer.justClicked = false;
                },
                destroy() {
                    global.removeEventListener('keydown', onKeyDown);
                    global.removeEventListener('keyup', onKeyUp);
                    global.removeEventListener('blur', onBlur);
                    canvas.removeEventListener('pointerdown', onPointerDown);
                    global.removeEventListener('pointermove', onPointerMove);
                    global.removeEventListener('pointerup', onPointerUp);
                    global.removeEventListener('pointercancel', onPointerUp);
                }
            };
        }

        function disposeThree(scene, renderer, extraResources) {
            const seenGeom = new Set();
            const seenMat = new Set();
            const seenTex = new Set();

            const disposeMaterial = (mat) => {
                if (!mat || seenMat.has(mat)) return;
                seenMat.add(mat);
                const texKeys = ['map', 'emissiveMap', 'alphaMap', 'roughnessMap', 'metalnessMap', 'normalMap', 'bumpMap'];
                for (let k = 0; k < texKeys.length; k++) {
                    const tex = mat[texKeys[k]];
                    if (tex && !seenTex.has(tex)) {
                        seenTex.add(tex);
                        tex.dispose?.();
                    }
                }
                mat.dispose?.();
            };

            if (scene) {
                scene.traverse((obj) => {
                    if (obj.geometry && !seenGeom.has(obj.geometry)) {
                        seenGeom.add(obj.geometry);
                        obj.geometry.dispose?.();
                    }
                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            for (let i = 0; i < obj.material.length; i++) {
                                disposeMaterial(obj.material[i]);
                            }
                        } else {
                            disposeMaterial(obj.material);
                        }
                    }
                });
                scene.clear();
            }

            if (Array.isArray(extraResources)) {
                for (let i = 0; i < extraResources.length; i++) {
                    const res = extraResources[i];
                    if (!res) continue;
                    if (typeof res.dispose === 'function' && !seenGeom.has(res) && !seenMat.has(res) && !seenTex.has(res)) {
                        res.dispose();
                    }
                }
            }

            if (renderer && typeof renderer.dispose === 'function') {
                renderer.dispose();
            }
        }

        function disposeBranchGeometries(root, sharedSet) {
            if (!root || typeof root.traverse !== 'function') return;
            const seen = new Set();
            root.traverse((obj) => {
                if (obj.geometry && !seen.has(obj.geometry) && (!sharedSet || !sharedSet.has(obj.geometry))) {
                    seen.add(obj.geometry);
                    obj.geometry.dispose?.();
                }
            });
        }

        function buildLunarGridTexture(THREE, accentHex, gridColorHex) {
            const c = document.createElement('canvas');
            c.width = 512;
            c.height = 512;
            const g = c.getContext('2d');

            g.fillStyle = '#0f1626';
            g.fillRect(0, 0, 512, 512);

            const rng = createRng(9102);
            // Subtle regolith craters & grain
            for (let i = 0; i < 160; i++) {
                const x = rng() * 512;
                const y = rng() * 512;
                const r = 3 + rng() * 22;
                g.fillStyle = rng() > 0.5 ? 'rgba(30,41,59,0.34)' : 'rgba(7,11,20,0.38)';
                g.beginPath();
                g.arc(x, y, r, 0, TAU);
                g.fill();
                if (r > 11) {
                    g.strokeStyle = 'rgba(148,163,184,0.10)';
                    g.lineWidth = 1.5;
                    g.stroke();
                }
            }

            // Crisp tactical grid lines
            g.strokeStyle = gridColorHex || 'rgba(56,189,248,0.22)';
            g.lineWidth = 1.5;
            for (let i = 0; i <= 512; i += 64) {
                g.beginPath();
                g.moveTo(i, 0);
                g.lineTo(i, 512);
                g.stroke();
                g.beginPath();
                g.moveTo(0, i);
                g.lineTo(512, i);
                g.stroke();
            }

            // Major track lane glow accents
            g.strokeStyle = accentHex || 'rgba(245,158,11,0.35)';
            g.lineWidth = 2.5;
            g.strokeRect(1, 1, 510, 510);

            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
            return tex;
        }

        function buildNebulaBackdropTexture(THREE, c1, c2, c3) {
            const c = document.createElement('canvas');
            c.width = 1024;
            c.height = 512;
            const g = c.getContext('2d');

            const sky = g.createLinearGradient(0, 0, 0, 512);
            sky.addColorStop(0, '#02040a');
            sky.addColorStop(0.55, '#070c1a');
            sky.addColorStop(1, '#10182f');
            g.fillStyle = sky;
            g.fillRect(0, 0, 1024, 512);

            const blobs = [
                { x: 260, y: 210, r: 240, col: c1 || 'rgba(56,189,248,0.28)' },
                { x: 640, y: 170, r: 290, col: c2 || 'rgba(167,139,250,0.25)' },
                { x: 470, y: 310, r: 260, col: c3 || 'rgba(245,158,11,0.20)' }
            ];
            for (let i = 0; i < blobs.length; i++) {
                const b = blobs[i];
                const rg = g.createRadialGradient(b.x, b.y, 12, b.x, b.y, b.r);
                rg.addColorStop(0, b.col);
                rg.addColorStop(1, 'rgba(0,0,0,0)');
                g.fillStyle = rg;
                g.fillRect(0, 0, 1024, 512);
            }

            const rng = createRng(7711);
            for (let i = 0; i < 320; i++) {
                const x = rng() * 1024;
                const y = rng() * 440;
                const r = 0.6 + rng() * 1.5;
                g.fillStyle = `rgba(226,232,240,${0.25 + rng() * 0.7})`;
                g.beginPath();
                g.arc(x, y, r, 0, TAU);
                g.fill();
            }

            const tex = new THREE.CanvasTexture(c);
            if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
            return tex;
        }

        function createParticlePool(THREE, scene, maxCount) {
            const geom = new THREE.OctahedronGeometry(0.24, 0);
            const matMap = new Map();
            const active = [];
            const free = [];

            function getMat(hex) {
                let m = matMap.get(hex);
                if (!m) {
                    m = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 1 });
                    matMap.set(hex, m);
                }
                return m;
            }

            function spawn(x, y, z, colorHex, count, speed, lifeMax, scaleBase) {
                const lMax = lifeMax || 0.55;
                const sBase = scaleBase || 1.0;
                for (let i = 0; i < count; i++) {
                    if (active.length >= maxCount) break;
                    let mesh = free.pop();
                    if (!mesh) {
                        mesh = new THREE.Mesh(geom, getMat(colorHex));
                    } else {
                        mesh.material = getMat(colorHex);
                    }
                    mesh.position.set(x, y, z);
                    mesh.scale.setScalar(sBase);
                    scene.add(mesh);

                    const theta = Math.random() * TAU;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const sp = speed * (0.4 + Math.random() * 0.8);
                    active.push({
                        mesh,
                        vx: Math.sin(phi) * Math.cos(theta) * sp,
                        vy: Math.cos(phi) * sp + speed * 0.15,
                        vz: Math.sin(phi) * Math.sin(theta) * sp,
                        life: lMax * (0.6 + Math.random() * 0.5),
                        maxLife: lMax,
                        scaleBase: sBase
                    });
                }
            }

            function update(dt) {
                for (let i = active.length - 1; i >= 0; i--) {
                    const p = active[i];
                    p.life -= dt;
                    if (p.life <= 0) {
                        scene.remove(p.mesh);
                        free.push(p.mesh);
                        active.splice(i, 1);
                        continue;
                    }
                    p.mesh.position.x += p.vx * dt;
                    p.mesh.position.y += p.vy * dt;
                    p.mesh.position.z += p.vz * dt;
                    p.mesh.rotation.x += 6 * dt;
                    p.mesh.rotation.y += 7 * dt;
                    const ratio = clamp(p.life / p.maxLife, 0.05, 1);
                    p.mesh.scale.setScalar(ratio * p.scaleBase);
                }
            }

            function clear() {
                while (active.length) {
                    const p = active.pop();
                    scene.remove(p.mesh);
                    free.push(p.mesh);
                }
            }

            function dispose() {
                clear();
                free.length = 0;
                geom.dispose();
                for (const m of matMap.values()) m.dispose();
                matMap.clear();
            }

            return { spawn, update, clear, dispose };
        }

        function projectToStage(vec3, camera, tmpVec) {
            const v = tmpVec.copy(vec3).project(camera);
            return {
                x: (v.x * 0.5 + 0.5) * STAGE_W,
                y: (-v.y * 0.5 + 0.5) * STAGE_H,
                visible: v.z >= -1 && v.z <= 1
            };
        }

        function syncCameraAspect(camera, canvas) {
            if (!camera || !canvas) return;
            const cw = canvas.clientWidth;
            const ch = canvas.clientHeight;
            const targetAspect = (cw > 10 && ch > 10) ? (cw / ch) : (STAGE_W / STAGE_H);
            if (Math.abs(camera.aspect - targetAspect) > 0.004) {
                camera.aspect = targetAspect;
                camera.updateProjectionMatrix();
            }
        }

        return {
            tr,
            playAudio,
            unlockAudio,
            setHud,
            ensureStageRelative,
            makeCanvas,
            createHudOverlayCanvas,
            createWebGLRenderer,
            mountFallbackCard,
            createInput,
            disposeThree,
            disposeBranchGeometries,
            buildLunarGridTexture,
            buildNebulaBackdropTexture,
            createParticlePool,
            projectToStage,
            syncCameraAspect
        };
    }

    // =========================================================================
    // 1. moon-rover-3d-odyssey (Three.js + Cannon-es 3D Rigid-Body Lunar Rally)
    // =========================================================================
    Engines['moon-rover-3d-odyssey'] = function mountMoonRoverOdyssey(ctx) {
        const h = createCoreHelpers(ctx);
        h.ensureStageRelative();

        const webglCanvas = h.makeCanvas('webgl', STAGE_W, STAGE_H);
        const initRes = h.createWebGLRenderer(webglCanvas);
        if (initRes.error) {
            if (webglCanvas.parentNode) webglCanvas.remove();
            return h.mountFallbackCard(initRes.error);
        }

        const { renderer, THREE, CANNON } = initRes;
        const hudCanvas = h.createHudOverlayCanvas(STAGE_W, STAGE_H);
        const hg = hudCanvas.getContext('2d');
        const input = h.createInput(webglCanvas);

        const isStory = ctx.isStory !== undefined
            ? Boolean(ctx.isStory)
            : Boolean(ctx.chapterId || ctx.chapterTarget);
        const storyTarget = Number(ctx.chapterTarget) || 900;
        const diffMult = Math.max(0.5, Number(ctx.difficultyMult) || 1);

        const SECTORS = [
            {
                id: 1,
                name: 'CRATER RIDGE',
                skyHex: 0x050914,
                fogHex: 0x081024,
                accentHex: 0x38bdf8,
                gridRgba: 'rgba(56,189,248,0.24)',
                accentRgba: 'rgba(245,158,11,0.32)',
                hasChasms: false,
                boulderCount: 5,
                barrelCount: 3,
                podCount: 6,
                laneHalfW: 19
            },
            {
                id: 2,
                name: 'BASALT CANYON',
                skyHex: 0x0a0616,
                fogHex: 0x130a29,
                accentHex: 0xa78bfa,
                gridRgba: 'rgba(167,139,250,0.25)',
                accentRgba: 'rgba(56,189,248,0.34)',
                hasChasms: false,
                boulderCount: 8,
                barrelCount: 5,
                podCount: 7,
                laneHalfW: 16
            },
            {
                id: 3,
                name: 'ZERO-G BRIDGES',
                skyHex: 0x041019,
                fogHex: 0x071b2a,
                accentHex: 0x2dd4bf,
                gridRgba: 'rgba(45,212,191,0.26)',
                accentRgba: 'rgba(34,211,238,0.36)',
                hasChasms: true,
                boulderCount: 5,
                barrelCount: 4,
                podCount: 7,
                laneHalfW: 15.5
            },
            {
                id: 4,
                name: 'MOLTEN FOUNDRY',
                skyHex: 0x160708,
                fogHex: 0x260b0d,
                accentHex: 0xf59e0b,
                gridRgba: 'rgba(245,158,11,0.28)',
                accentRgba: 'rgba(251,113,133,0.40)',
                hasChasms: true,
                boulderCount: 8,
                barrelCount: 7,
                podCount: 8,
                laneHalfW: 16.5
            }
        ];

        const CHUNK_LEN = 128;

        // Scene & Camera
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050914);
        scene.fog = new THREE.FogExp2(0x081024, 0.0085);

        const camera = new THREE.PerspectiveCamera(62, STAGE_W / STAGE_H, 0.2, 420);
        camera.position.set(0, 5.2, 10.5);

        // Lighting
        const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.85);
        scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xfde68a, 1.35);
        sunLight.position.set(22, 36, 18);
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
        rimLight.position.set(-24, 14, -30);
        scene.add(rimLight);

        // Horizon Nebulae & Starfield Backdrop
        const nebulaTex = h.buildNebulaBackdropTexture(
            THREE,
            'rgba(56,189,248,0.28)',
            'rgba(167,139,250,0.24)',
            'rgba(245,158,11,0.22)'
        );
        const skyMat = new THREE.MeshBasicMaterial({ map: nebulaTex, depthWrite: false, fog: false });
        const skyGeo = new THREE.PlaneGeometry(480, 200);
        const skyMesh = new THREE.Mesh(skyGeo, skyMat);
        skyMesh.position.set(0, 55, -230);
        scene.add(skyMesh);

        // Giant glowing ringed lunar horizon planet
        const horizonGroup = new THREE.Group();
        const planetGeo = new THREE.SphereGeometry(26, 24, 18);
        const planetMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x1d4ed8,
            emissiveIntensity: 0.45,
            roughness: 0.65
        });
        const planetMesh = new THREE.Mesh(planetGeo, planetMat);
        horizonGroup.add(planetMesh);

        const planetRingGeo = new THREE.RingGeometry(33, 46, 48);
        const planetRingMat = new THREE.MeshBasicMaterial({
            color: 0xa78bfa,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35,
            fog: false
        });
        const planetRingMesh = new THREE.Mesh(planetRingGeo, planetRingMat);
        planetRingMesh.rotation.x = Math.PI * 0.42;
        planetRingMesh.rotation.y = 0.25;
        horizonGroup.add(planetRingMesh);
        horizonGroup.position.set(-55, 62, -210);
        scene.add(horizonGroup);

        // 3D Starfield
        const starCount = 650;
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        const sPal = [
            new THREE.Color(0x7dd3fc),
            new THREE.Color(0xe2e8f0),
            new THREE.Color(0xfbbf24),
            new THREE.Color(0xc084fc)
        ];
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            starPositions[i3] = (Math.random() - 0.5) * 320;
            starPositions[i3 + 1] = 8 + Math.random() * 120;
            starPositions[i3 + 2] = -240 + Math.random() * 260;
            const c = sPal[i % sPal.length];
            starColors[i3] = c.r;
            starColors[i3 + 1] = c.g;
            starColors[i3 + 2] = c.b;
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        starGeo.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        const starMat = new THREE.PointsMaterial({ size: 0.75, vertexColors: true, transparent: true, opacity: 0.85, fog: false });
        const starPoints = new THREE.Points(starGeo, starMat);
        scene.add(starPoints);

        const particles = h.createParticlePool(THREE, scene, 180);

        // Shared Materials & Textures
        const gridTex = h.buildLunarGridTexture(THREE, 'rgba(245,158,11,0.34)', 'rgba(56,189,248,0.22)');
        gridTex.repeat.set(6, 12);

        const terrainMat = new THREE.MeshStandardMaterial({
            map: gridTex,
            color: 0xcbd5e1,
            roughness: 0.82,
            metalness: 0.14
        });
        const bridgeMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.24,
            roughness: 0.45,
            metalness: 0.55
        });
        const rampMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.36,
            roughness: 0.4,
            metalness: 0.48
        });
        const rampStripMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x1e2538,
            roughness: 0.85,
            metalness: 0.2
        });
        const crystalWallMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x22d3ee,
            emissiveIntensity: 0.65,
            roughness: 0.25
        });
        const boulderMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.9,
            metalness: 0.12
        });
        const barrelMat = new THREE.MeshStandardMaterial({
            color: 0xe11d48,
            emissive: 0xf43f5e,
            emissiveIntensity: 0.35,
            roughness: 0.45,
            metalness: 0.35
        });
        const barrelStripeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        const fuelMat = new THREE.MeshStandardMaterial({
            color: 0x22d3ee,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.85,
            roughness: 0.15,
            metalness: 0.25,
            transparent: true,
            opacity: 0.92
        });
        const gateArchMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            emissive: 0x34d399,
            emissiveIntensity: 0.72,
            roughness: 0.3,
            metalness: 0.6
        });
        const gateRingMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.48, side: THREE.DoubleSide });
        const chasmGlowMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.42 });
        const moltenGlowMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.55 });

        // Shared Geometries
        const boulderGeo = new THREE.IcosahedronGeometry(1, 1);
        const barrelGeo = new THREE.CylinderGeometry(0.68, 0.68, 1.55, 14);
        const barrelRingGeo = new THREE.CylinderGeometry(0.71, 0.71, 0.22, 14);
        const fuelGeo = new THREE.OctahedronGeometry(0.78, 0);
        const fuelHaloGeo = new THREE.TorusGeometry(1.05, 0.06, 8, 24);
        const craterRingGeo = new THREE.TorusGeometry(3.2, 0.42, 7, 18);
        const spireGeo = new THREE.ConeGeometry(1.4, 7.5, 6);
        const sharedGeos = new Set([boulderGeo, barrelGeo, barrelRingGeo, fuelGeo, fuelHaloGeo, craterRingGeo, spireGeo]);

        // Cannon-es Physics World
        const world = new CANNON.World();
        world.gravity.set(0, -4.8, 0);
        world.broadphase = new CANNON.SAPBroadphase(world);
        world.defaultContactMaterial.friction = 0.4;
        world.defaultContactMaterial.restitution = 0.22;

        const groundPhysMat = new CANNON.Material('ground');
        const chassisPhysMat = new CANNON.Material('chassis');
        const rockPhysMat = new CANNON.Material('rock');

        world.addContactMaterial(new CANNON.ContactMaterial(groundPhysMat, chassisPhysMat, {
            friction: 0.03,
            restitution: 0.08
        }));
        world.addContactMaterial(new CANNON.ContactMaterial(groundPhysMat, rockPhysMat, {
            friction: 0.62,
            restitution: 0.35
        }));
        world.addContactMaterial(new CANNON.ContactMaterial(chassisPhysMat, rockPhysMat, {
            friction: 0.25,
            restitution: 0.42
        }));

        // Build Rover Rigid Body + RaycastVehicle
        const chassisBody = new CANNON.Body({
            mass: 220,
            material: chassisPhysMat,
            position: new CANNON.Vec3(0, 1.4, 0),
            linearDamping: 0.03,
            angularDamping: 0.34
        });
        chassisBody.addShape(new CANNON.Box(new CANNON.Vec3(1.15, 0.35, 1.95)), new CANNON.Vec3(0, 0.28, 0));

        const vehicle = new CANNON.RaycastVehicle({
            chassisBody,
            indexRightAxis: 0,
            indexUpAxis: 1,
            indexForwardAxis: 2
        });

        const wheelConfig = {
            radius: 0.58,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 16,
            suspensionRestLength: 0.55,
            frictionSlip: 4.5,
            dampingRelaxation: 2.6,
            dampingCompression: 3.0,
            maxSuspensionForce: 16000,
            rollInfluence: 0.025,
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(),
            maxSuspensionTravel: 0.48,
            customSlidingRotationalSpeed: -24,
            useCustomSlidingRotationalSpeed: true
        };

        const wheelMounts = [
            [-1.32, 0.04, -1.42, true],
            [1.32, 0.04, -1.42, true],
            [-1.32, 0.04, 1.42, false],
            [1.32, 0.04, 1.42, false]
        ];
        for (let i = 0; i < wheelMounts.length; i++) {
            const m = wheelMounts[i];
            vehicle.addWheel({
                ...wheelConfig,
                chassisConnectionPointLocal: new CANNON.Vec3(m[0], m[1], m[2]),
                isFrontWheel: m[3]
            });
        }
        vehicle.addToWorld(world);

        // Rover Visual 3D Mesh
        const roverGroup = new THREE.Group();
        const hullBodyMat = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0,
            metalness: 0.55,
            roughness: 0.32
        });
        const hullAccentMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.45,
            metalness: 0.35,
            roughness: 0.3
        });
        const cageMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            metalness: 0.65,
            roughness: 0.35
        });
        const visorMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.15
        });

        const baseHull = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 3.85), hullBodyMat);
        baseHull.position.set(0, 0.25, 0);
        roverGroup.add(baseHull);

        const noseHood = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.35, 1.15), hullAccentMat);
        noseHood.position.set(0, 0.36, -1.55);
        noseHood.rotation.x = 0.18;
        roverGroup.add(noseHood);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.56, 1.55), visorMat);
        cabin.position.set(0, 0.68, -0.15);
        roverGroup.add(cabin);

        const rollBar = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.08, 8, 16, Math.PI), cageMat);
        rollBar.position.set(0, 0.52, 0.65);
        roverGroup.add(rollBar);

        const rearSpoiler = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.12, 0.52), hullAccentMat);
        rearSpoiler.position.set(0, 0.92, 1.55);
        rearSpoiler.rotation.x = -0.18;
        roverGroup.add(rearSpoiler);

        // Headlight lenses + Volumetric Beams + Dynamic SpotLight & PointLight
        const headlightBulbMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
        const beamConeGeo = new THREE.ConeGeometry(1.9, 10, 14, 1, true);
        const beamConeMat = new THREE.MeshBasicMaterial({
            color: 0x7dd3fc,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        [-0.65, 0.65].forEach((hx) => {
            const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.14, 12), headlightBulbMat);
            lamp.rotation.x = Math.PI / 2;
            lamp.position.set(hx, 0.42, -1.96);
            roverGroup.add(lamp);

            const beam = new THREE.Mesh(beamConeGeo, beamConeMat);
            beam.rotation.x = -Math.PI / 2;
            beam.position.set(hx, 0.36, -6.9);
            roverGroup.add(beam);
        });

        const headSpot = new THREE.SpotLight(0xbae6fd, 65, 58, Math.PI * 0.24, 0.45, 1.2);
        headSpot.position.set(0, 0.85, -1.85);
        headSpot.target.position.set(0, -0.6, -24);
        roverGroup.add(headSpot);
        roverGroup.add(headSpot.target);

        const headBounceLight = new THREE.PointLight(0x7dd3fc, 2.2, 16);
        headBounceLight.position.set(0, 0.8, -3.5);
        roverGroup.add(headBounceLight);

        // Rear Zero-G Thruster Nozzles + Cyan Glow
        const thrusterMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const thrusterConeGeo = new THREE.ConeGeometry(0.26, 1.45, 10);
        const thrusterCones = [];
        [
            [-0.55, 0.28, 2.15, 0, Math.PI / 2],
            [0.55, 0.28, 2.15, 0, Math.PI / 2],
            [0, -0.15, 0.2, Math.PI, 0]
        ].forEach(([tx, ty, tz, rxOff, rzOff]) => {
            const cone = new THREE.Mesh(thrusterConeGeo, thrusterMat);
            cone.rotation.x = rxOff || Math.PI / 2;
            if (rzOff === 0) cone.rotation.x = Math.PI;
            cone.position.set(tx, ty, tz);
            cone.visible = false;
            roverGroup.add(cone);
            thrusterCones.push(cone);
        });

        const thrusterLight = new THREE.PointLight(0x22d3ee, 0, 18);
        thrusterLight.position.set(0, 0.35, 2.6);
        roverGroup.add(thrusterLight);

        scene.add(roverGroup);

        // 4 Visual 3D Wheels
        const wheelMeshes = [];
        const tireGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.48, 18);
        const rimGeo = new THREE.TorusGeometry(0.36, 0.06, 8, 16);
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.2 });
        const rimMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.85,
            roughness: 0.2
        });

        for (let i = 0; i < 4; i++) {
            const wGrp = new THREE.Group();
            const tire = new THREE.Mesh(tireGeo, tireMat);
            tire.rotation.z = Math.PI / 2;
            wGrp.add(tire);

            const rimOut = new THREE.Mesh(rimGeo, rimMat);
            rimOut.rotation.y = Math.PI / 2;
            rimOut.position.x = (i % 2 === 0 ? -0.24 : 0.24);
            wGrp.add(rimOut);

            scene.add(wGrp);
            wheelMeshes.push(wGrp);
        }

        // Dynamic World Entities
        const chunks = [];
        const dynamicRocks = [];
        const dynamicBarrels = [];
        const fuelPods = [];
        const gates = [];
        const popups = [];

        let score = 0;
        let level = 1;
        let lives = 3;
        let fuel = 100;
        let gatesCleared = 0;
        let distanceMeters = 0;
        let bestZ = 0;
        let prevChassisZ = 0;
        let combo = 1;
        let comboTimer = 0;
        let airTime = 0;
        let wasAirborne = false;
        let thrusterActive = false;
        let invulnTimer = 0;
        let flipCooldown = 0;
        let flippedTimer = 0;
        let shakeMag = 0;
        let damageFlash = 0;
        let nextChunkIdx = 0;
        let lastSafePos = new THREE.Vector3(0, 1.5, 0);
        let ended = false;
        let destroyed = false;
        let rafId = 0;
        let lastTime = performance.now();
        let hudTimer = 0;

        function addPopup(text, color) {
            popups.push({
                text,
                color: color || '#38bdf8',
                life: 1.35,
                maxLife: 1.35,
                yOffset: 0
            });
            if (popups.length > 6) popups.shift();
        }

        function sectorForIndex(idx) {
            return SECTORS[idx % SECTORS.length];
        }

        function applySectorAtmosphere(sectorIdx) {
            const sec = sectorForIndex(Math.max(0, sectorIdx - 1));
            scene.background.setHex(sec.skyHex);
            scene.fog.color.setHex(sec.fogHex);
            rimLight.color.setHex(sec.accentHex);
            planetMat.color.setHex(sec.accentHex);
        }

        function removeBodySafe(body) {
            if (!body) return;
            try {
                if (world.bodies.includes(body)) {
                    world.removeBody(body);
                }
            } catch (_) { /* ignore */ }
        }

        function clearWorldEntities() {
            while (chunks.length) {
                const ch = chunks.pop();
                for (let i = 0; i < ch.bodies.length; i++) removeBodySafe(ch.bodies[i]);
                scene.remove(ch.group);
                h.disposeBranchGeometries(ch.group, sharedGeos);
            }
            while (dynamicRocks.length) {
                const r = dynamicRocks.pop();
                removeBodySafe(r.body);
                scene.remove(r.mesh);
            }
            while (dynamicBarrels.length) {
                const b = dynamicBarrels.pop();
                removeBodySafe(b.body);
                scene.remove(b.mesh);
            }
            while (fuelPods.length) {
                const f = fuelPods.pop();
                scene.remove(f.mesh);
            }
            while (gates.length) {
                const g = gates.pop();
                scene.remove(g.mesh);
                h.disposeBranchGeometries(g.mesh, sharedGeos);
            }
            popups.length = 0;
            particles.clear();
        }

        function addPhysicsRamp(group, bodies, cx, cz, hw, hh, hl, theta, matVis) {
            const cy = -0.04 - hh * Math.cos(theta) + hl * Math.sin(theta);
            const body = new CANNON.Body({
                mass: 0,
                material: groundPhysMat,
                position: new CANNON.Vec3(cx, cy, cz)
            });
            body.addShape(new CANNON.Box(new CANNON.Vec3(hw, hh, hl)));
            body.quaternion.setFromEuler(theta, 0, 0);
            world.addBody(body);
            bodies.push(body);

            const mesh = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, hh * 2, hl * 2), matVis || rampMat);
            mesh.position.set(cx, cy, cz);
            mesh.rotation.x = theta;
            group.add(mesh);

            // Illuminated side chevron rails on ramp
            [-hw + 0.25, hw - 0.25].forEach((rx) => {
                const strip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, hl * 1.92), rampStripMat);
                strip.position.set(rx, hh + 0.06, 0);
                mesh.add(strip);
            });

            return { body, lipY: cy + hh * Math.cos(theta) + hl * Math.sin(theta), lipZ: cz - hl * Math.cos(theta) };
        }

        function addStaticDeck(group, bodies, cx, cy, cz, hw, hh, hl, matVis) {
            const body = new CANNON.Body({
                mass: 0,
                material: groundPhysMat,
                position: new CANNON.Vec3(cx, cy, cz)
            });
            body.addShape(new CANNON.Box(new CANNON.Vec3(hw, hh, hl)));
            world.addBody(body);
            bodies.push(body);

            const mesh = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, hh * 2, hl * 2), matVis);
            mesh.position.set(cx, cy, cz);
            group.add(mesh);
            return mesh;
        }

        function spawnChunk(chunkIdx) {
            const sec = sectorForIndex(chunkIdx);
            const rng = createRng(1337 + chunkIdx * 7919);
            const zStart = -chunkIdx * CHUNK_LEN;
            const zMid = zStart - CHUNK_LEN * 0.5;
            const zEnd = zStart - CHUNK_LEN;

            const group = new THREE.Group();
            const bodies = [];
            const laneW = sec.laneHalfW;

            // Ground Slabs (either solid track or bridge chunks with a Zero-G chasm!)
            if (sec.hasChasms) {
                // First deck: zStart -> zStart - 56
                addStaticDeck(group, bodies, 0, -2.0, zStart - 28, laneW, 2.0, 28, terrainMat);
                // Chasm gap from -56 to -74 (18m jump!)
                const rampInfo = addPhysicsRamp(group, bodies, 0, zStart - 49, 6.8, 0.45, 7.2, 0.23, rampMat);
                // Glowing energy chasm pit visually underneath
                const pit = new THREE.Mesh(
                    new THREE.PlaneGeometry(laneW * 2.2, 22),
                    sec.id === 4 ? moltenGlowMat : chasmGlowMat
                );
                pit.rotation.x = -Math.PI / 2;
                pit.position.set(0, -6.5, zStart - 65);
                group.add(pit);

                // Narrow optional emergency side walkway on the right for accessibility + main bridge landing pad
                addStaticDeck(group, bodies, laneW - 2.4, -0.35, zStart - 65, 2.2, 0.35, 11, bridgeMat);
                // Landing deck: zStart - 72 -> zEnd
                addStaticDeck(group, bodies, 0, -2.0, zStart - 100, laneW, 2.0, 28, terrainMat);

                // Floating crystal pods along the Zero-G jump arc!
                for (let k = 0; k < 3; k++) {
                    const fx = (k - 1) * 1.4;
                    const fy = rampInfo.lipY + 1.8 + Math.sin((k + 1) * 0.7) * 1.2;
                    const fz = zStart - 59 - k * 5.2;
                    spawnFuelPod(fx, fy, fz);
                }
            } else {
                addStaticDeck(group, bodies, 0, -2.0, zMid, laneW, 2.0, CHUNK_LEN * 0.5, terrainMat);

                // 2 Signature Launch Ramps per solid sector
                const rx1 = (rng() - 0.5) * (laneW * 0.75);
                const r1 = addPhysicsRamp(group, bodies, rx1, zStart - 38, 5.2, 0.45, 6.8, 0.22, rampMat);
                spawnFuelPod(rx1, r1.lipY + 1.9, r1.lipZ - 4.5);

                const rx2 = -rx1 * 0.7 + (rng() - 0.5) * 4;
                const r2 = addPhysicsRamp(group, bodies, rx2, zStart - 86, 5.5, 0.48, 7.2, 0.24, rampMat);
                spawnFuelPod(rx2, r2.lipY + 2.1, r2.lipZ - 5.0);
            }

            // Left & Right Canyon Boundary Walls (prevent straying out into empty space)
            [-laneW - 1.5, laneW + 1.5].forEach((wx) => {
                addStaticDeck(group, bodies, wx, 2.2, zMid, 1.5, 4.2, CHUNK_LEN * 0.5, wallMat);
                // Glowing monolith crystals along canyon edges
                for (let s = 0; s < 4; s++) {
                    const sz = zStart - 16 - s * 30;
                    const spire = new THREE.Mesh(spireGeo, s % 2 === 0 ? crystalWallMat : wallMat);
                    spire.position.set(wx + (wx < 0 ? -1.2 : 1.2), 3.6 + rng() * 3, sz);
                    spire.rotation.z = wx < 0 ? -0.18 : 0.18;
                    group.add(spire);
                }
            });

            // Procedural Lunar Crater Rims (strictly over solid terrain, clear of chasms & ramps)
            function isBlockedChunkZ(zWorld) {
                const offset = zStart - zWorld;
                if (offset < 10 || offset > CHUNK_LEN - 12) return true; // Keep spawn & checkpoint gate clear
                if (sec.hasChasms) {
                    return offset >= 42 && offset <= 78; // Ramp approach & chasm pit
                }
                return (offset >= 29 && offset <= 47) || (offset >= 77 && offset <= 96);
            }

            for (let c = 0; c < 4; c++) {
                const cx = (rng() - 0.5) * (laneW * 1.4);
                const cz = zStart - 16 - rng() * (CHUNK_LEN - 30);
                if (isBlockedChunkZ(cz)) continue;
                const crater = new THREE.Mesh(craterRingGeo, wallMat);
                crater.rotation.x = Math.PI / 2;
                crater.position.set(cx, -0.18, cz);
                crater.scale.setScalar(0.75 + rng() * 0.5);
                group.add(crater);
            }

            // Dynamic Basalt Boulders (CANNON.Sphere)
            const chunkRocks = [];
            for (let i = 0; i < sec.boulderCount; i++) {
                const radius = 0.85 + rng() * 0.72;
                const bx = (rng() - 0.5) * (laneW * 1.42);
                const bz = zStart - 16 - rng() * (CHUNK_LEN - 28);
                if (isBlockedChunkZ(bz)) continue;

                const body = new CANNON.Body({
                    mass: 28 * radius,
                    material: rockPhysMat,
                    position: new CANNON.Vec3(bx, radius + 0.4, bz),
                    linearDamping: 0.15,
                    angularDamping: 0.25
                });
                body.addShape(new CANNON.Sphere(radius));
                world.addBody(body);

                const mesh = new THREE.Mesh(boulderGeo, boulderMat);
                mesh.scale.setScalar(radius);
                mesh.position.set(bx, radius + 0.4, bz);
                scene.add(mesh);

                dynamicRocks.push({ body, mesh, radius });
                chunkRocks.push({ x: bx, z: bz, r: radius });
            }

            // Dynamic Explosive Crimson Barrels (CANNON.Cylinder)
            for (let i = 0; i < sec.barrelCount; i++) {
                const bx = (rng() - 0.5) * (laneW * 1.25);
                const bz = zStart - 22 - rng() * (CHUNK_LEN - 38);
                if (isBlockedChunkZ(bz)) continue;
                let overlapsRock = false;
                for (let rIdx = 0; rIdx < chunkRocks.length; rIdx++) {
                    const cr = chunkRocks[rIdx];
                    if (Math.hypot(bx - cr.x, bz - cr.z) < cr.r + 2.0) {
                        overlapsRock = true;
                        break;
                    }
                }
                if (overlapsRock) continue;

                const body = new CANNON.Body({
                    mass: 16,
                    material: rockPhysMat,
                    position: new CANNON.Vec3(bx, 0.78, bz),
                    linearDamping: 0.12,
                    angularDamping: 0.25
                });
                body.addShape(new CANNON.Cylinder(0.68, 0.68, 1.55, 10));
                world.addBody(body);

                const bGroup = new THREE.Group();
                const cyl = new THREE.Mesh(barrelGeo, barrelMat);
                bGroup.add(cyl);
                const band = new THREE.Mesh(barrelRingGeo, barrelStripeMat);
                bGroup.add(band);
                bGroup.position.set(bx, 0.78, bz);
                scene.add(bGroup);

                dynamicBarrels.push({ body, mesh: bGroup, exploded: false });
            }

            // Extra Crystal Fuel Pods along the course
            for (let i = 0; i < sec.podCount; i++) {
                const fx = (rng() - 0.5) * (laneW * 1.3);
                const fz = zStart - 14 - rng() * (CHUNK_LEN - 26);
                if (sec.hasChasms && fz < zStart - 54 && fz > zStart - 74) continue;
                spawnFuelPod(fx, 1.45 + rng() * 1.1, fz);
            }

            // CHECKPOINT GATE spanning corridor width at chunk end
            const gateZ = zEnd + 3;
            const gateHalfW = Math.max(8.5, laneW - 1.1);
            const gateGroup = new THREE.Group();
            const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 10.2, 0.95), gateArchMat);
            pillarL.position.set(-gateHalfW, 5.1, 0);
            gateGroup.add(pillarL);
            const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.95, 10.2, 0.95), gateArchMat);
            pillarR.position.set(gateHalfW, 5.1, 0);
            gateGroup.add(pillarR);
            const crossbar = new THREE.Mesh(new THREE.BoxGeometry(gateHalfW * 2 + 1.2, 1.05, 1.1), gateArchMat);
            crossbar.position.set(0, 10.0, 0);
            gateGroup.add(crossbar);
            const portalPlane = new THREE.Mesh(new THREE.PlaneGeometry(gateHalfW * 2 - 0.9, 9.4), gateRingMat);
            portalPlane.position.set(0, 4.8, 0);
            gateGroup.add(portalPlane);

            gateGroup.position.set(0, 0, gateZ);
            scene.add(gateGroup);
            gates.push({
                index: chunkIdx + 1,
                sectorName: sectorForIndex(chunkIdx + 1).name,
                z: gateZ,
                halfW: gateHalfW + 0.8,
                maxY: 11.2,
                safeY: 1.5,
                mesh: gateGroup,
                portalPlane,
                cleared: false
            });

            scene.add(group);
            chunks.push({ index: chunkIdx, zStart, zEnd, group, bodies });
        }

        function spawnFuelPod(x, y, z) {
            const grp = new THREE.Group();
            const gem = new THREE.Mesh(fuelGeo, fuelMat);
            grp.add(gem);
            const halo = new THREE.Mesh(fuelHaloGeo, thrusterMat);
            halo.rotation.x = Math.PI / 2;
            grp.add(halo);
            grp.position.set(x, y, z);
            scene.add(grp);
            fuelPods.push({ mesh: grp, gem, halo, baseY: y, phase: Math.random() * TAU, collected: false });
        }

        function awardScore(pts, label, color) {
            const actual = Math.round(pts * diffMult);
            score += actual;
            if (label) addPopup(`${label} +${actual}`, color || '#38bdf8');
            if (isStory && score >= storyTarget && !ended) {
                ended = true;
                h.playAudio('levelup');
                syncHud(true);
                ctx.onWin?.({
                    score: Math.floor(score),
                    level,
                    stars: lives >= 3 ? 3 : 2
                });
            }
        }

        function triggerBarrelExplosion(barrel) {
            if (barrel.exploded) return;
            barrel.exploded = true;
            const bx = barrel.body.position.x;
            const by = barrel.body.position.y;
            const bz = barrel.body.position.z;

            removeBodySafe(barrel.body);
            scene.remove(barrel.mesh);
            particles.spawn(bx, by + 0.5, bz, 0xf97316, 22, 13, 0.7, 1.45);
            particles.spawn(bx, by + 0.5, bz, 0xfbbf24, 12, 9, 0.55, 1.1);
            h.playAudio('explodeSmall', 0.16);
            shakeMag = Math.max(shakeMag, 0.45);

            // Radial physics blast impulse on rover & nearby boulders
            const dx = chassisBody.position.x - bx;
            const dy = chassisBody.position.y - by;
            const dz = chassisBody.position.z - bz;
            const dist = Math.hypot(dx, dy, dz) || 0.1;
            if (dist < 11) {
                const str = (1 - dist / 11) * 1450;
                chassisBody.applyImpulse(
                    new CANNON.Vec3((dx / dist) * str, Math.max(420, (dy / dist + 0.65) * str), (dz / dist) * str),
                    new CANNON.Vec3(0, 0, 0)
                );
                if (dist < 4.8 && invulnTimer <= 0) {
                    damageRover(h.tr('Patlayıcı varil hasarı!', 'Explosive barrel blast!'));
                } else {
                    awardScore(60, h.tr('VARİL PATLAMASI', 'BARREL BLAST'), '#fbbf24');
                }
            }

            for (let i = 0; i < dynamicRocks.length; i++) {
                const r = dynamicRocks[i];
                const rdx = r.body.position.x - bx;
                const rdy = r.body.position.y - by;
                const rdz = r.body.position.z - bz;
                const rDist = Math.hypot(rdx, rdy, rdz);
                if (rDist < 14 && rDist > 0.05) {
                    const push = (1 - rDist / 14) * 480;
                    r.body.applyImpulse(new CANNON.Vec3((rdx / rDist) * push, push * 0.75, (rdz / rDist) * push), new CANNON.Vec3());
                }
            }
        }

        function damageRover(reasonText) {
            if (invulnTimer > 0 || ended) return;
            lives -= 1;
            invulnTimer = 1.6;
            combo = 1;
            damageFlash = 1.0;
            shakeMag = 0.65;
            if (lives <= 0) {
                lives = 0;
                ended = true;
                h.playAudio('explodeBoss');
                syncHud(true);
                ctx.onGameOver?.({
                    score: Math.floor(score),
                    level,
                    stars: 0,
                    reason: reasonText || h.tr('Ay gezgini kritik gövde hasarı aldı.', 'Lunar rover suffered critical hull failure.')
                });
            } else {
                h.playAudio('playerHurt');
                addPopup(h.tr('GÖVDE HASARI!', 'HULL HIT!'), '#fb7185');
            }
        }

        function isOverChasmZone(zWorld) {
            const absZ = Math.max(0, -zWorld);
            const chunkIdx = Math.floor(absZ / CHUNK_LEN);
            const sec = sectorForIndex(chunkIdx);
            if (!sec.hasChasms) return false;
            const offset = absZ - chunkIdx * CHUNK_LEN;
            return offset >= 44 && offset <= 78;
        }

        function uprightFlipRover(isAuto = false) {
            if ((!isAuto && flipCooldown > 0) || ended) return;
            flipCooldown = 0.45;
            flippedTimer = 0;

            const curChunkIdx = Math.max(0, Math.floor(Math.max(0, -chassisBody.position.z) / CHUNK_LEN));
            const curLaneW = sectorForIndex(curChunkIdx).laneHalfW - 2.6;

            // Extract current yaw from chassis forward vector so player keeps facing downrange
            const fwd = new CANNON.Vec3(0, 0, -1);
            chassisBody.quaternion.vmult(fwd, fwd);
            let yaw = Math.atan2(-fwd.x, -fwd.z);
            if (!Number.isFinite(yaw)) yaw = 0;

            chassisBody.position.x = clamp(chassisBody.position.x, -curLaneW, curLaneW);
            chassisBody.position.y = Math.max(chassisBody.position.y + 1.4, 1.75);
            chassisBody.quaternion.setFromEuler(0, yaw, 0);
            chassisBody.angularVelocity.set(0, 0, 0);
            chassisBody.velocity.x *= 0.35;
            chassisBody.velocity.z = Math.min(chassisBody.velocity.z * 0.5, -2.5);
            chassisBody.velocity.y = Math.max(chassisBody.velocity.y, 2.8);

            particles.spawn(chassisBody.position.x, chassisBody.position.y, chassisBody.position.z, 0x38bdf8, 16, 7.5, 0.45, 0.95);
            h.playAudio('dash');
            addPopup(isAuto ? h.tr('OTOMATİK GYRO DENGE', 'AUTO GYRO RIGHTED') : h.tr('DENGE DÜZELTİLDİ', 'UPRIGHT STABILIZED'), '#22d3ee');
        }

        function resetGame(startLevel) {
            clearWorldEntities();
            const startIdx = clamp((Math.floor(Number(startLevel)) || 1) - 1, 0, 3);

            score = 0;
            level = startIdx + 1;
            lives = 3;
            fuel = 100;
            gatesCleared = 0;
            distanceMeters = 0;
            const startZ = -startIdx * CHUNK_LEN - 4;
            bestZ = startZ;
            prevChassisZ = startZ;
            combo = 1;
            comboTimer = 0;
            airTime = 0;
            wasAirborne = false;
            thrusterActive = false;
            invulnTimer = 0;
            flipCooldown = 0;
            flippedTimer = 0;
            shakeMag = 0;
            damageFlash = 0;
            ended = false;
            nextChunkIdx = startIdx;
            lastSafePos.set(0, 1.45, startZ);

            chassisBody.position.set(0, 1.45, startZ);
            chassisBody.velocity.set(0, 0, 0);
            chassisBody.angularVelocity.set(0, 0, 0);
            chassisBody.quaternion.set(0, 0, 0, 1);

            for (let i = 0; i < 4; i++) {
                vehicle.applyEngineForce(0, i);
                vehicle.setBrake(0, i);
                vehicle.setSteeringValue(0, i);
            }

            applySectorAtmosphere(level);
            for (let i = 0; i < 3; i++) {
                spawnChunk(nextChunkIdx++);
            }

            camera.position.set(0, 5.2, chassisBody.position.z + 10.5);
            camera.lookAt(0, 1.2, chassisBody.position.z - 14);
            addPopup(sectorForIndex(startIdx).name, '#fbbf24');
            syncHud(true);
        }

        function syncHud(force) {
            if (!force && hudTimer > 0) return;
            hudTimer = 0.1;
            const sec = sectorForIndex(level - 1);
            const kmh = Math.round(Math.abs(vehicle.currentVehicleSpeedKmHour || 0));
            const stText = `${sec.name} · ${kmh} km/h · ${Math.floor(distanceMeters)}m`;
            const objText = isStory
                ? h.tr(`Hedef: ${storyTarget} Skor (W/S/A/D · Space İtici · R Düzelt)`, `Target: ${storyTarget} Score (W/S/A/D · Space Boost · R Flip)`)
                : h.tr(`Kontrol Kapısı: ${gatesCleared} · W/S Sür · Space Sıfır-G İtici · R Düzelt`, `Checkpoints: ${gatesCleared} · W/S Drive · Space Zero-G Thruster · R Flip`);
            h.setHud({
                score: Math.floor(score),
                level,
                maxLevel: isStory ? 4 : 99,
                lives,
                statusText: stText,
                objectiveText: objText
            });
        }

        function step(dt) {
            hudTimer -= dt;
            if (invulnTimer > 0) invulnTimer -= dt;
            if (flipCooldown > 0) flipCooldown -= dt;
            if (shakeMag > 0) shakeMag = Math.max(0, shakeMag - dt * 1.8);
            if (damageFlash > 0) damageFlash = Math.max(0, damageFlash - dt * 2.2);
            if (comboTimer > 0) {
                comboTimer -= dt;
                if (comboTimer <= 0) combo = 1;
            }

            // Inputs
            const driveFwd = input.hasKey('KeyW', 'ArrowUp', 'w');
            const driveBack = input.hasKey('KeyS', 'ArrowDown', 's');
            const steerL = input.hasKey('KeyA', 'ArrowLeft', 'a');
            const steerR = input.hasKey('KeyD', 'ArrowRight', 'd');
            const boostHeld = input.hasKey('Space', ' ');
            if (input.consumePressed('KeyR', 'r')) {
                uprightFlipRover();
            }

            const speedMs = chassisBody.velocity.length();
            const kmh = Math.abs(vehicle.currentVehicleSpeedKmHour || 0);

            // Calculate drive torque & braking
            const maxSpeedMs = 34;
            let engineForce = 0;
            let brakeForce = 0;
            if (driveFwd && !driveBack) {
                const taper = clamp(1 - (speedMs / maxSpeedMs) * 0.65, 0.28, 1);
                engineForce = 330 * taper;
            } else if (driveBack && !driveFwd) {
                if (vehicle.currentVehicleSpeedKmHour < -2.5) {
                    // Currently moving forward (-Z), brake smoothly first
                    brakeForce = 16;
                } else {
                    engineForce = -220;
                }
            } else {
                brakeForce = 2.5;
            }

            // Speed-sensitive steering (positive steer turns left toward -X)
            let steerVal = 0;
            if (steerL) steerVal += 1;
            if (steerR) steerVal -= 1;
            const maxSteer = clamp(0.42 - kmh * 0.0022, 0.20, 0.42);
            const targetSteer = steerVal * maxSteer;

            vehicle.setSteeringValue(targetSteer, 0);
            vehicle.setSteeringValue(targetSteer, 1);
            for (let i = 0; i < 4; i++) {
                vehicle.applyEngineForce(engineForce, i);
                vehicle.setBrake(brakeForce, i);
            }

            // Zero-G Thrusters (Space)
            thrusterActive = false;
            if (boostHeld && fuel > 0.5) {
                thrusterActive = true;
                fuel = Math.max(0, fuel - 28 * dt);
                // Local forward (-Z) and vertical (+Y) Zero-G thrust!
                chassisBody.applyLocalForce(new CANNON.Vec3(0, 1480, -1850), new CANNON.Vec3(0, 0, 0));
                if (Math.random() < 0.7) {
                    const exhaustPos = chassisBody.pointToWorldFrame(new CANNON.Vec3(0, 0.25, 2.2));
                    particles.spawn(exhaustPos.x, exhaustPos.y, exhaustPos.z, 0x22d3ee, 2, 5.5, 0.32, 0.85);
                }
                if (Math.random() < 0.25) h.playAudio('dash', 0.12);
            } else {
                const regenRate = vehicle.numWheelsOnGround > 0 ? 11 : 4.5;
                fuel = Math.min(100, fuel + regenRate * dt);
            }

            // Smooth active anti-roll & gyro self-righting stabilizer (prevents turtle-flipping on craters)
            const localUp = new CANNON.Vec3(0, 1, 0);
            chassisBody.quaternion.vmult(localUp, localUp);
            if (vehicle.numWheelsOnGround === 0) {
                chassisBody.angularVelocity.x *= Math.pow(0.45, dt);
                chassisBody.angularVelocity.z *= Math.pow(0.35, dt);
                if (localUp.y < 0.92) {
                    const rightAxis = localUp.cross(new CANNON.Vec3(0, 1, 0));
                    chassisBody.applyTorque(new CANNON.Vec3(rightAxis.x * 180, 0, rightAxis.z * 210));
                }
                if (steerL) chassisBody.applyTorque(new CANNON.Vec3(0, 180, 0));
                if (steerR) chassisBody.applyTorque(new CANNON.Vec3(0, -180, 0));
            } else if (localUp.y < 0.72) {
                const rightAxis = localUp.cross(new CANNON.Vec3(0, 1, 0));
                chassisBody.applyTorque(new CANNON.Vec3(rightAxis.x * 240, 0, rightAxis.z * 280));
            }

            if (localUp.y < 0.28 || (vehicle.numWheelsOnGround === 0 && speedMs < 0.9 && chassisBody.position.y > -0.8 && !isOverChasmZone(chassisBody.position.z))) {
                flippedTimer += dt;
                if (flippedTimer > 1.15) {
                    uprightFlipRover(true);
                }
            } else {
                flippedTimer = Math.max(0, flippedTimer - dt * 2.5);
            }

            prevChassisZ = chassisBody.position.z;

            // Step Cannon-es physics
            world.step(1 / 60, dt, 3);

            // Sync Rover Visuals
            roverGroup.position.set(chassisBody.position.x, chassisBody.position.y, chassisBody.position.z);
            roverGroup.quaternion.set(
                chassisBody.quaternion.x,
                chassisBody.quaternion.y,
                chassisBody.quaternion.z,
                chassisBody.quaternion.w
            );
            roverGroup.visible = invulnTimer <= 0 || Math.floor(invulnTimer * 16) % 2 === 0;

            for (let i = 0; i < 4; i++) {
                vehicle.updateWheelTransform(i);
                const wt = vehicle.wheelInfos[i].worldTransform;
                const wm = wheelMeshes[i];
                wm.position.set(wt.position.x, wt.position.y, wt.position.z);
                wm.quaternion.set(wt.quaternion.x, wt.quaternion.y, wt.quaternion.z, wt.quaternion.w);
                wm.visible = roverGroup.visible;
            }

            // Thruster visuals
            const pulse = 0.85 + Math.sin(performance.now() * 0.03) * 0.25;
            for (let i = 0; i < thrusterCones.length; i++) {
                thrusterCones[i].visible = thrusterActive;
                if (thrusterActive) thrusterCones[i].scale.set(1, pulse, 1);
            }
            thrusterLight.intensity = thrusterActive ? 4.8 * pulse : 0;

            // Track Air-Time Stunts & Distance
            if (vehicle.numWheelsOnGround === 0 && chassisBody.position.y > 1.8) {
                airTime += dt;
                wasAirborne = true;
            } else if (wasAirborne && vehicle.numWheelsOnGround >= 2) {
                if (airTime > 0.72) {
                    const airPts = Math.round(airTime * 110 * combo);
                    combo = Math.min(5, combo + 1);
                    comboTimer = 6.0;
                    h.playAudio('powerup');
                    awardScore(airPts, h.tr(`AY SIÇRAYIŞI x${combo}`, `LUNAR AIR x${combo}`), '#fbbf24');
                }
                airTime = 0;
                wasAirborne = false;
            } else if (vehicle.numWheelsOnGround >= 2) {
                airTime = 0;
                wasAirborne = false;
                if (chassisBody.position.y > 0.1 && !isOverChasmZone(chassisBody.position.z)) {
                    lastSafePos.set(clamp(chassisBody.position.x, -10, 10), 1.45, chassisBody.position.z);
                }
            }

            if (chassisBody.position.z < bestZ) {
                const dz = bestZ - chassisBody.position.z;
                bestZ = chassisBody.position.z;
                distanceMeters += dz;
                score += dz * 0.65 * diffMult;
                if (isStory && score >= storyTarget && !ended) {
                    awardScore(0);
                    return;
                }
            }

            // Fall into Zero-G chasm recovery (strictly places rover back on solid approach deck)
            if (chassisBody.position.y < -6.8) {
                damageRover(h.tr('Sıfır-G yarığına düşüldü!', 'Fell into a Zero-G canyon chasm!'));
                if (!ended) {
                    let safeZ = lastSafePos.z + 5;
                    if (isOverChasmZone(safeZ) || isOverChasmZone(safeZ - 4)) {
                        const absSafe = Math.max(0, -safeZ);
                        const cIdx = Math.floor(absSafe / CHUNK_LEN);
                        safeZ = -(cIdx * CHUNK_LEN + 40);
                    }
                    if (safeZ > 0) safeZ = -4;
                    chassisBody.position.set(clamp(lastSafePos.x * 0.4, -7, 7), 1.9, safeZ);
                    chassisBody.velocity.set(0, 0, -4);
                    chassisBody.angularVelocity.set(0, 0, 0);
                    chassisBody.quaternion.set(0, 0, 0, 1);
                    flippedTimer = 0;
                }
            }

            // Sync Dynamic Boulders
            for (let i = dynamicRocks.length - 1; i >= 0; i--) {
                const r = dynamicRocks[i];
                r.mesh.position.set(r.body.position.x, r.body.position.y, r.body.position.z);
                r.mesh.quaternion.set(r.body.quaternion.x, r.body.quaternion.y, r.body.quaternion.z, r.body.quaternion.w);
                if (r.body.position.z > chassisBody.position.z + 45 || r.body.position.y < -15) {
                    removeBodySafe(r.body);
                    scene.remove(r.mesh);
                    dynamicRocks.splice(i, 1);
                }
            }

            // Sync Explosive Barrels & Collision Detection
            for (let i = dynamicBarrels.length - 1; i >= 0; i--) {
                const b = dynamicBarrels[i];
                if (b.exploded) {
                    dynamicBarrels.splice(i, 1);
                    continue;
                }
                b.mesh.position.set(b.body.position.x, b.body.position.y, b.body.position.z);
                b.mesh.quaternion.set(b.body.quaternion.x, b.body.quaternion.y, b.body.quaternion.z, b.body.quaternion.w);

                const dx = b.body.position.x - chassisBody.position.x;
                const dy = b.body.position.y - chassisBody.position.y;
                const dz = b.body.position.z - chassisBody.position.z;
                if (dx * dx + dy * dy + dz * dz < 2.35 * 2.35 || b.body.velocity.length() > 3.2) {
                    triggerBarrelExplosion(b);
                    dynamicBarrels.splice(i, 1);
                    continue;
                }
                if (b.body.position.z > chassisBody.position.z + 45 || b.body.position.y < -15) {
                    removeBodySafe(b.body);
                    scene.remove(b.mesh);
                    dynamicBarrels.splice(i, 1);
                }
            }

            // Floating Crystal Fuel Pods
            for (let i = fuelPods.length - 1; i >= 0; i--) {
                const f = fuelPods[i];
                f.phase += dt * 3.2;
                f.mesh.position.y = f.baseY + Math.sin(f.phase) * 0.28;
                f.gem.rotation.y += dt * 2.4;
                f.halo.rotation.z += dt * 1.9;

                const dx = f.mesh.position.x - chassisBody.position.x;
                const dy = f.mesh.position.y - chassisBody.position.y;
                const dz = f.mesh.position.z - chassisBody.position.z;
                if (dx * dx + dy * dy + dz * dz < 2.6 * 2.6) {
                    fuel = Math.min(100, fuel + 42);
                    combo = Math.min(5, combo + 1);
                    comboTimer = 6.5;
                    particles.spawn(f.mesh.position.x, f.mesh.position.y, f.mesh.position.z, 0x22d3ee, 14, 7, 0.45, 0.9);
                    h.playAudio('xpPickup', 0.1);
                    awardScore(80 * combo, h.tr('KRİSTAL YAKIT', 'CRYSTAL FUEL'), '#22d3ee');
                    scene.remove(f.mesh);
                    fuelPods.splice(i, 1);
                    continue;
                }
                if (f.mesh.position.z > chassisBody.position.z + 45) {
                    scene.remove(f.mesh);
                    fuelPods.splice(i, 1);
                }
            }

            // Checkpoint Gates (swept Z crossing matching 3D portal width & height)
            for (let i = gates.length - 1; i >= 0; i--) {
                const g = gates[i];
                g.portalPlane.material.opacity = 0.4 + Math.sin(performance.now() * 0.006) * 0.14;
                const crossedZ = prevChassisZ >= g.z - 2.0 && chassisBody.position.z <= g.z + 1.8;
                const passedPlane = chassisBody.position.z <= g.z + 1.4;
                const insidePortal = Math.abs(chassisBody.position.x) <= g.halfW && chassisBody.position.y <= g.maxY;
                if (!g.cleared && ((crossedZ && insidePortal) || (passedPlane && insidePortal))) {
                    g.cleared = true;
                    gatesCleared += 1;
                    fuel = Math.min(100, fuel + 45);
                    if (!isStory) {
                        level = 1 + gatesCleared;
                    } else {
                        level = Math.min(4, 1 + gatesCleared);
                    }
                    applySectorAtmosphere(level);
                    particles.spawn(chassisBody.position.x, chassisBody.position.y + 1.5, g.z, 0x34d399, 20, 10, 0.6, 1.15);
                    h.playAudio('levelup');
                    const secTitle = sectorForIndex(level - 1).name;
                    awardScore(220, `${h.tr('KAPI GEÇİLDİ', 'CHECKPOINT')} · ${secTitle}`, '#34d399');
                } else if (!g.cleared && chassisBody.position.z < g.z - 6) {
                    // Sync sector atmosphere quietly if vaulted high above gate crossbar
                    g.cleared = true;
                    level = isStory ? Math.min(4, g.index + 1) : (g.index + 1);
                    applySectorAtmosphere(level);
                }
                if (g.z > chassisBody.position.z + 55) {
                    scene.remove(g.mesh);
                    h.disposeBranchGeometries(g.mesh, sharedGeos);
                    gates.splice(i, 1);
                }
            }

            // Endless Chunk Streaming & Cleanup
            while (chunks.length === 0 || chunks[chunks.length - 1].zEnd > chassisBody.position.z - 220) {
                spawnChunk(nextChunkIdx++);
            }
            while (chunks.length > 0 && chunks[0].zEnd > chassisBody.position.z + 55) {
                const old = chunks.shift();
                for (let i = 0; i < old.bodies.length; i++) removeBodySafe(old.bodies[i]);
                scene.remove(old.group);
                h.disposeBranchGeometries(old.group, sharedGeos);
            }

            // Scroll sky & horizon subtly with rover Z so distant backdrop never clips
            skyMesh.position.z = chassisBody.position.z - 230;
            horizonGroup.position.z = chassisBody.position.z - 210;
            horizonGroup.rotation.y += dt * 0.08;
            starPoints.position.z = chassisBody.position.z * 0.85;

            // Dynamic Chase Camera
            const fwdVec = new CANNON.Vec3(0, 0, -1);
            chassisBody.quaternion.vmult(fwdVec, fwdVec);
            const camBack = 9.8 + clamp(kmh * 0.035, 0, 3.2);
            const targetCamX = chassisBody.position.x - fwdVec.x * camBack * 0.45;
            const targetCamY = Math.max(2.4, chassisBody.position.y + 4.3);
            const targetCamZ = chassisBody.position.z - fwdVec.z * camBack;

            const sx = (Math.random() - 0.5) * shakeMag;
            const sy = (Math.random() - 0.5) * shakeMag;
            camera.position.x = damp(camera.position.x, targetCamX, 7.5, dt) + sx;
            camera.position.y = damp(camera.position.y, targetCamY, 6.5, dt) + sy;
            camera.position.z = damp(camera.position.z, targetCamZ, 9.0, dt);

            const targetFov = thrusterActive ? 72 : (62 + clamp(kmh * 0.08, 0, 8));
            if (Math.abs(camera.fov - targetFov) > 0.1) {
                camera.fov = damp(camera.fov, targetFov, 7, dt);
                camera.updateProjectionMatrix();
            }

            camera.lookAt(
                chassisBody.position.x + fwdVec.x * 9,
                chassisBody.position.y + 0.9,
                chassisBody.position.z + fwdVec.z * 9
            );

            // Popups update
            for (let i = popups.length - 1; i >= 0; i--) {
                popups[i].life -= dt;
                popups[i].yOffset -= 34 * dt;
                if (popups[i].life <= 0) popups.splice(i, 1);
            }

            particles.update(dt);
            syncHud(false);
        }

        function drawHudOverlay() {
            hg.clearRect(0, 0, STAGE_W, STAGE_H);

            if (damageFlash > 0.01) {
                const grad = hg.createRadialGradient(STAGE_W * 0.5, STAGE_H * 0.5, 180, STAGE_W * 0.5, STAGE_H * 0.5, 560);
                grad.addColorStop(0, 'rgba(251,113,133,0)');
                grad.addColorStop(1, `rgba(251,113,133,${(damageFlash * 0.55).toFixed(3)})`);
                hg.fillStyle = grad;
                hg.fillRect(0, 0, STAGE_W, STAGE_H);
            }

            const kmh = Math.round(Math.abs(vehicle.currentVehicleSpeedKmHour || 0));
            const sec = sectorForIndex(level - 1);

            // Top-Left Sector & Checkpoint Telemetry Pill
            hg.save();
            hg.fillStyle = 'rgba(7, 11, 20, 0.72)';
            hg.strokeStyle = 'rgba(56, 189, 248, 0.35)';
            hg.lineWidth = 1.5;
            hg.beginPath();
            drawRoundRect(hg, 16, 14, 272, 64, 10);
            hg.fill();
            hg.stroke();

            hg.fillStyle = '#38bdf8';
            hg.font = '700 11px "JetBrains Mono", monospace';
            hg.fillText(`SECTOR ${level} · ${sec.name}`, 28, 34);

            hg.fillStyle = '#e2e8f0';
            hg.font = '600 13px "Space Grotesk", sans-serif';
            hg.fillText(
                `${h.tr('MESAFE', 'DIST')}: ${Math.floor(distanceMeters)}m   ·   ${h.tr('KAPI', 'GATES')}: ${gatesCleared}`,
                28,
                56
            );

            if (combo > 1) {
                hg.fillStyle = '#fbbf24';
                hg.font = '700 12px "JetBrains Mono", monospace';
                hg.fillText(`COMBO x${combo}`, 28, 72);
            }

            // Bottom-Left Speedometer & Zero-G Fuel Boost Gauge
            hg.fillStyle = 'rgba(7, 11, 20, 0.76)';
            hg.strokeStyle = thrusterActive ? 'rgba(34, 211, 238, 0.8)' : 'rgba(245, 158, 11, 0.4)';
            hg.beginPath();
            drawRoundRect(hg, 16, STAGE_H - 94, 260, 78, 12);
            hg.fill();
            hg.stroke();

            hg.fillStyle = '#f8fafc';
            hg.font = '700 26px "JetBrains Mono", monospace';
            hg.fillText(`${String(kmh).padStart(3, '0')}`, 28, STAGE_H - 54);
            hg.fillStyle = '#94a3b8';
            hg.font = '600 12px "JetBrains Mono", monospace';
            hg.fillText('KM/H', 88, STAGE_H - 54);

            // Thruster Fuel Bar
            hg.fillStyle = thrusterActive ? '#22d3ee' : '#cbd5e1';
            hg.font = '700 11px "JetBrains Mono", monospace';
            hg.fillText(h.tr('ZERO-G İTİCİ [SPACE]', 'ZERO-G THRUSTER [SPACE]'), 28, STAGE_H - 36);

            hg.fillStyle = 'rgba(15, 23, 42, 0.9)';
            hg.fillRect(28, STAGE_H - 29, 232, 8);
            const fuelPct = clamp(fuel / 100, 0, 1);
            hg.fillStyle = thrusterActive ? '#22d3ee' : (fuel < 22 ? '#fb7185' : '#38bdf8');
            hg.fillRect(28, STAGE_H - 29, 232 * fuelPct, 8);

            // Bottom-Right Quick Controls Reminder
            hg.fillStyle = 'rgba(7, 11, 20, 0.65)';
            hg.strokeStyle = 'rgba(148, 163, 184, 0.25)';
            hg.beginPath();
            drawRoundRect(hg, STAGE_W - 246, STAGE_H - 44, 230, 28, 8);
            hg.fill();
            hg.stroke();
            hg.fillStyle = '#cbd5e1';
            hg.font = '600 11px "JetBrains Mono", monospace';
            hg.textAlign = 'center';
            hg.fillText(h.tr('WASD Sür · SPACE İtici · R Düzelt', 'WASD Drive · SPACE Boost · R Flip'), STAGE_W - 131, STAGE_H - 26);

            // Center Popups
            for (let i = 0; i < popups.length; i++) {
                const p = popups[i];
                const alpha = clamp(p.life / 0.45, 0, 1);
                hg.globalAlpha = alpha;
                hg.fillStyle = p.color;
                hg.font = '700 16px "Space Grotesk", sans-serif';
                hg.textAlign = 'center';
                hg.shadowColor = 'rgba(0,0,0,0.9)';
                hg.shadowBlur = 8;
                hg.fillText(p.text, STAGE_W * 0.5, 130 + p.yOffset + i * 24);
            }
            hg.restore();
        }

        function loop(now) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
            lastTime = now;

            h.syncCameraAspect(camera, webglCanvas);
            const paused = typeof ctx.getPaused === 'function' ? Boolean(ctx.getPaused()) : false;
            if (!paused && !ended) {
                step(dt);
            } else {
                input.pointer.down = false;
            }
            input.clearFrameEvents();
            renderer.render(scene, camera);
            drawHudOverlay();
            rafId = requestAnimationFrame(loop);
        }

        resetGame(ctx.initialLevel || 1);
        rafId = requestAnimationFrame(loop);

        return {
            restart(lvl) {
                resetGame(lvl);
            },
            destroy() {
                destroyed = true;
                cancelAnimationFrame(rafId);
                input.destroy();
                clearWorldEntities();
                try {
                    if (typeof vehicle.removeFromWorld === 'function') {
                        vehicle.removeFromWorld(world);
                    }
                } catch (_) { /* ignore */ }
                removeBodySafe(chassisBody);
                world.bodies.slice().forEach(removeBodySafe);
                particles.dispose();
                h.disposeThree(scene, renderer, [
                    nebulaTex,
                    gridTex,
                    boulderGeo,
                    barrelGeo,
                    barrelRingGeo,
                    fuelGeo,
                    fuelHaloGeo,
                    craterRingGeo,
                    spireGeo,
                    tireGeo,
                    rimGeo,
                    beamConeGeo,
                    thrusterConeGeo,
                    terrainMat,
                    bridgeMat,
                    rampMat,
                    rampStripMat,
                    wallMat,
                    crystalWallMat,
                    boulderMat,
                    barrelMat,
                    barrelStripeMat,
                    fuelMat,
                    gateArchMat,
                    gateRingMat,
                    chasmGlowMat,
                    moltenGlowMat,
                    tireMat,
                    rimMat,
                    thrusterMat,
                    beamConeMat
                ]);
                if (hudCanvas.parentNode) hudCanvas.remove();
                if (webglCanvas.parentNode) webglCanvas.remove();
            }
        };
    };

    // =========================================================================
    // 2. starfox-canyon-ace (Three.js + Cannon-es 3D Corridor Dogfighter)
    // =========================================================================
    Engines['starfox-canyon-ace'] = function mountStarfoxCanyonAce(ctx) {
        const h = createCoreHelpers(ctx);
        h.ensureStageRelative();

        const webglCanvas = h.makeCanvas('webgl', STAGE_W, STAGE_H);
        const initRes = h.createWebGLRenderer(webglCanvas);
        if (initRes.error) {
            if (webglCanvas.parentNode) webglCanvas.remove();
            return h.mountFallbackCard(initRes.error);
        }

        const { renderer, THREE, CANNON } = initRes;
        const hudCanvas = h.createHudOverlayCanvas(STAGE_W, STAGE_H);
        const hg = hudCanvas.getContext('2d');
        const input = h.createInput(webglCanvas);

        const isStory = ctx.isStory !== undefined
            ? Boolean(ctx.isStory)
            : Boolean(ctx.chapterId || ctx.chapterTarget);
        const storyTarget = Number(ctx.chapterTarget) || 1500;
        const diffMult = Math.max(0.5, Number(ctx.difficultyMult) || 1);

        // Canyon cross-section flight envelope
        const BOUND_X = 9.8;
        const MIN_Y = -3.4;
        const MAX_Y = 5.6;

        // Scene & PerspectiveCamera with dynamic banking FOV
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x040712);
        scene.fog = new THREE.FogExp2(0x060b1d, 0.0095);

        const camera = new THREE.PerspectiveCamera(64, STAGE_W / STAGE_H, 0.15, 280);
        camera.position.set(0, 1.8, 10.5);

        // Lights
        scene.add(new THREE.AmbientLight(0x8bb8ff, 0.8));
        const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.55);
        keyLight.position.set(12, 22, 16);
        scene.add(keyLight);
        const warmRim = new THREE.PointLight(0xf59e0b, 2.2, 95);
        warmRim.position.set(-14, 10, -25);
        scene.add(warmRim);

        // Backdrop Nebula + Starfield
        const nebulaTex = h.buildNebulaBackdropTexture(
            THREE,
            'rgba(34,211,238,0.28)',
            'rgba(192,132,252,0.26)',
            'rgba(244,63,94,0.20)'
        );
        const skyMat = new THREE.MeshBasicMaterial({ map: nebulaTex, depthWrite: false, fog: false });
        const skyGeo = new THREE.PlaneGeometry(340, 160);
        const skyMesh = new THREE.Mesh(skyGeo, skyMat);
        skyMesh.position.set(0, 28, -210);
        scene.add(skyMesh);

        const starCount = 720;
        const starPos = new Float32Array(starCount * 3);
        const starCol = new Float32Array(starCount * 3);
        const sCols = [
            new THREE.Color(0x22d3ee),
            new THREE.Color(0xe2e8f0),
            new THREE.Color(0xa78bfa),
            new THREE.Color(0xfbbf24)
        ];
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            starPos[i3] = (Math.random() - 0.5) * 90;
            starPos[i3 + 1] = -8 + Math.random() * 62;
            starPos[i3 + 2] = -180 + Math.random() * 195;
            const c = sCols[i % sCols.length];
            starCol[i3] = c.r;
            starCol[i3 + 1] = c.g;
            starCol[i3 + 2] = c.b;
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
        starGeo.setAttribute('color', new THREE.Float32BufferAttribute(starCol, 3));
        const starMat = new THREE.PointsMaterial({ size: 0.38, vertexColors: true, transparent: true, opacity: 0.86, fog: false });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // Scrolling Trench Floor + Canyon Cliff Walls
        const floorTex = h.buildLunarGridTexture(THREE, 'rgba(34,211,238,0.38)', 'rgba(56,189,248,0.25)');
        floorTex.repeat.set(5, 22);
        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTex,
            color: 0x94a3b8,
            roughness: 0.72,
            metalness: 0.25
        });
        const floorGeo = new THREE.PlaneGeometry(34, 240);
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.set(0, -5.4, -100);
        scene.add(floorMesh);

        const cliffMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            emissive: 0x1e293b,
            emissiveIntensity: 0.35,
            roughness: 0.85,
            metalness: 0.3
        });
        const cliffGeo = new THREE.BoxGeometry(6, 30, 240);
        const cliffL = new THREE.Mesh(cliffGeo, cliffMat);
        cliffL.position.set(-15.5, 4, -100);
        scene.add(cliffL);
        const cliffR = new THREE.Mesh(cliffGeo, cliffMat);
        cliffR.position.set(15.5, 4, -100);
        scene.add(cliffR);

        // Canyon Trench Side Strip Lights
        const stripGeo = new THREE.BoxGeometry(0.25, 0.25, 240);
        const stripMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        const stripL = new THREE.Mesh(stripGeo, stripMat);
        stripL.position.set(-12.3, -4.8, -100);
        scene.add(stripL);
        const stripR = new THREE.Mesh(stripGeo, stripMat);
        stripR.position.set(12.3, -4.8, -100);
        scene.add(stripR);

        // Cannon-es Physics World for Shattered Asteroid & Armor Debris Impulses
        const cannonWorld = new CANNON.World();
        cannonWorld.gravity.set(0, -14, 0);
        cannonWorld.broadphase = new CANNON.SAPBroadphase(cannonWorld);

        const debrisFloor = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(0, -5.4, 0) });
        debrisFloor.addShape(new CANNON.Plane());
        debrisFloor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        cannonWorld.addBody(debrisFloor);

        const debrisWallL = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(-12.4, 0, 0) });
        debrisWallL.addShape(new CANNON.Plane());
        debrisWallL.quaternion.setFromEuler(0, Math.PI / 2, 0);
        cannonWorld.addBody(debrisWallL);

        const debrisWallR = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(12.4, 0, 0) });
        debrisWallR.addShape(new CANNON.Plane());
        debrisWallR.quaternion.setFromEuler(0, -Math.PI / 2, 0);
        cannonWorld.addBody(debrisWallR);

        const particles = h.createParticlePool(THREE, scene, 200);

        // Build Starfighter ("Arwing"-style Swept Interceptor)
        const fighterGroup = new THREE.Group();
        const shipHullMat = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0,
            metalness: 0.62,
            roughness: 0.28
        });
        const shipAccentMat = new THREE.MeshStandardMaterial({
            color: 0x22d3ee,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.68,
            metalness: 0.35,
            roughness: 0.25
        });
        const shipCockpitMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.55,
            metalness: 0.85,
            roughness: 0.12
        });

        const fuselage = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.7, 6), shipHullMat);
        fuselage.rotation.x = -Math.PI / 2;
        fighterGroup.add(fuselage);

        const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), shipCockpitMat);
        canopy.scale.set(0.85, 0.65, 1.9);
        canopy.position.set(0, 0.22, -0.15);
        fighterGroup.add(canopy);

        const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.08, 0.95), shipHullMat);
        wingL.position.set(-1.15, -0.05, 0.35);
        wingL.rotation.y = 0.34;
        wingL.rotation.z = -0.16;
        fighterGroup.add(wingL);

        const wingR = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.08, 0.95), shipHullMat);
        wingR.position.set(1.15, -0.05, 0.35);
        wingR.rotation.y = -0.34;
        wingR.rotation.z = 0.16;
        fighterGroup.add(wingR);

        const cannonL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.1, 8), shipAccentMat);
        cannonL.rotation.x = Math.PI / 2;
        cannonL.position.set(-1.85, -0.14, 0.2);
        fighterGroup.add(cannonL);

        const cannonR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.1, 8), shipAccentMat);
        cannonR.rotation.x = Math.PI / 2;
        cannonR.position.set(1.85, -0.14, 0.2);
        fighterGroup.add(cannonR);

        const thrusterGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const thrCone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.95, 8), thrusterGlowMat);
        thrCone.rotation.x = Math.PI / 2;
        thrCone.position.set(0, 0, 1.65);
        fighterGroup.add(thrCone);

        const shipLight = new THREE.PointLight(0x22d3ee, 2.5, 16);
        shipLight.position.set(0, 0.3, 1.4);
        fighterGroup.add(shipLight);

        // Barrel Roll Energy Deflector Shield Bubble
        const shieldMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0,
            wireframe: true
        });
        const shieldMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.75, 1), shieldMat);
        fighterGroup.add(shieldMesh);

        fighterGroup.position.set(0, 0.6, 2.4);
        scene.add(fighterGroup);

        // Shared Entity Geometries & Materials
        const pillarGeo = new THREE.BoxGeometry(2.2, 16, 2.2);
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            emissive: 0x0f172a,
            roughness: 0.6,
            metalness: 0.45
        });
        const pillarTrimGeo = new THREE.BoxGeometry(2.35, 0.35, 2.35);
        const pillarTrimMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa });

        const ringGeo = new THREE.TorusGeometry(2.35, 0.16, 10, 28);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x34d399,
            emissive: 0x10b981,
            emissiveIntensity: 0.85,
            roughness: 0.2
        });

        const asteroidGeo = new THREE.DodecahedronGeometry(1, 0);
        const asteroidMat = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            roughness: 0.88,
            metalness: 0.15
        });
        const shardGeo = new THREE.TetrahedronGeometry(0.45, 0);

        const boltGeo = new THREE.BoxGeometry(0.14, 0.14, 2.1);
        const playerBoltMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        const deflectedBoltMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        const enemyBoltMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 });
        const missileGeo = new THREE.ConeGeometry(0.18, 1.35, 8);
        missileGeo.rotateX(Math.PI / 2);
        const missileMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

        const interceptorBodyGeo = new THREE.ConeGeometry(0.45, 2.2, 5);
        const interceptorWingGeo = new THREE.BoxGeometry(2.4, 0.08, 0.75);
        const interceptorCoreGeo = new THREE.BoxGeometry(0.45, 0.22, 0.65);

        const dreadMainGeo = new THREE.BoxGeometry(11.5, 2.6, 15.5);
        const dreadBridgeGeo = new THREE.BoxGeometry(4.2, 2.4, 5.2);
        const dreadProwGeo = new THREE.BoxGeometry(2.6, 1.8, 12.5);
        const turretGeo = new THREE.OctahedronGeometry(1, 1);
        const turretRingGeo = new THREE.TorusGeometry(1.45, 0.08, 6, 20);

        const enemyHullMat = new THREE.MeshStandardMaterial({
            color: 0x3f1d2b,
            emissive: 0xe11d48,
            emissiveIntensity: 0.42,
            metalness: 0.45,
            roughness: 0.35
        });
        const enemyWingMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 });

        const dreadHullMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            emissive: 0x4c1d95,
            emissiveIntensity: 0.35,
            metalness: 0.65,
            roughness: 0.32
        });
        const turretMat = new THREE.MeshStandardMaterial({
            color: 0xf43f5e,
            emissive: 0xfb7185,
            emissiveIntensity: 0.85,
            roughness: 0.25
        });
        const turretRingMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.72 });

        // Dynamic Entity Arrays
        const pillars = [];
        const energyRings = [];
        const asteroids = [];
        const cannonShards = [];
        const playerBolts = [];
        const enemyBolts = [];
        const homingMissiles = [];
        const enemies = [];
        const popups = [];
        let dreadnought = null;

        // Game State
        let score = 0;
        let wave = 1;
        let lives = 4;
        let shieldCharge = 100;
        let trenchSpeed = 38;
        let scrollOffset = 0;
        let waveProgress = 0;
        let wavePhase = 'canyon'; // 'canyon' | 'dreadnought'
        let fireCd = 0;
        let salvoCd = 0;
        let barrelRollTimer = 0;
        let barrelRollCd = 0;
        let barrelRollDir = 1;
        let lockHeld = false;
        let lockHoldTime = 0;
        let lockedTargets = [];
        let invulnTimer = 0;
        let shakeMag = 0;
        let damageFlash = 0;
        let fovBoostTimer = 0;
        let spawnPillarTimer = 0.7;
        let spawnRingTimer = 2.4;
        let spawnAsteroidTimer = 1.4;
        let spawnSquadTimer = 2.1;
        let combo = 1;
        let comboTimer = 0;
        let ended = false;
        let destroyed = false;
        let rafId = 0;
        let lastTime = performance.now();
        let hudTimer = 0;

        const ship = {
            x: 0,
            y: 0.6,
            vx: 0,
            vy: 0,
            roll: 0,
            pitch: 0,
            aimX: 0,
            aimY: 0.6
        };

        const tmpVecA = new THREE.Vector3();
        const tmpVecB = new THREE.Vector3();

        function zWindowHit(prevZ, currZ, targetZ, halfDepth) {
            return Math.min(prevZ, currZ) <= targetZ + halfDepth && Math.max(prevZ, currZ) >= targetZ - halfDepth;
        }

        function segPointDistSq(ax, ay, az, bx, by, bz, px, py, pz) {
            const dx = bx - ax;
            const dy = by - ay;
            const dz = bz - az;
            const lenSq = dx * dx + dy * dy + dz * dz;
            if (lenSq < 1e-8) {
                const ux = px - ax, uy = py - ay, uz = pz - az;
                return ux * ux + uy * uy + uz * uz;
            }
            const t = clamp(((px - ax) * dx + (py - ay) * dy + (pz - az) * dz) / lenSq, 0, 1);
            const cx = ax + dx * t - px;
            const cy = ay + dy * t - py;
            const cz = az + dz * t - pz;
            return cx * cx + cy * cy + cz * cz;
        }

        function addPopup(text, color) {
            popups.push({ text, color: color || '#22d3ee', life: 1.25, yOffset: 0 });
            if (popups.length > 6) popups.shift();
        }

        function removeShardBody(body) {
            if (!body) return;
            try {
                if (cannonWorld.bodies.includes(body)) cannonWorld.removeBody(body);
            } catch (_) { /* ignore */ }
        }

        function clearEntities() {
            while (pillars.length) scene.remove(pillars.pop().mesh);
            while (energyRings.length) scene.remove(energyRings.pop().mesh);
            while (asteroids.length) scene.remove(asteroids.pop().mesh);
            while (cannonShards.length) {
                const s = cannonShards.pop();
                removeShardBody(s.body);
                scene.remove(s.mesh);
            }
            while (playerBolts.length) scene.remove(playerBolts.pop().mesh);
            while (enemyBolts.length) scene.remove(enemyBolts.pop().mesh);
            while (homingMissiles.length) scene.remove(homingMissiles.pop().mesh);
            while (enemies.length) scene.remove(enemies.pop().mesh);
            if (dreadnought) {
                scene.remove(dreadnought.group);
                dreadnought = null;
            }
            popups.length = 0;
            lockedTargets.length = 0;
            particles.clear();
        }

        function spawnCannonDebris(x, y, z, colorHex, count, impulseScale) {
            const mat = colorHex === 0xfb7185 ? enemyHullMat : asteroidMat;
            for (let i = 0; i < count; i++) {
                if (cannonShards.length >= 65) {
                    const old = cannonShards.shift();
                    removeShardBody(old.body);
                    scene.remove(old.mesh);
                }
                const body = new CANNON.Body({
                    mass: 1.4,
                    position: new CANNON.Vec3(x + (Math.random() - 0.5) * 0.8, y + (Math.random() - 0.5) * 0.8, z),
                    linearDamping: 0.04,
                    angularDamping: 0.08
                });
                body.addShape(new CANNON.Box(new CANNON.Vec3(0.32, 0.32, 0.32)));
                cannonWorld.addBody(body);

                const theta = Math.random() * TAU;
                const up = 3 + Math.random() * 10;
                const sp = (impulseScale || 14) * (0.65 + Math.random() * 0.7);
                body.applyImpulse(
                    new CANNON.Vec3(Math.cos(theta) * sp, up, Math.sin(theta) * sp + trenchSpeed * 0.35),
                    new CANNON.Vec3((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25, 0)
                );

                const mesh = new THREE.Mesh(shardGeo, mat);
                mesh.scale.setScalar(0.8 + Math.random() * 0.9);
                mesh.position.set(body.position.x, body.position.y, body.position.z);
                scene.add(mesh);

                cannonShards.push({ body, mesh, life: 2.2 });
            }
        }

        function awardScore(pts, label, color) {
            const actual = Math.round(pts * diffMult);
            score += actual;
            if (label) addPopup(`${label} +${actual}`, color || '#22d3ee');
            if (isStory && score >= storyTarget && !ended) {
                ended = true;
                h.playAudio('levelup');
                syncHud(true);
                ctx.onWin?.({
                    score: Math.floor(score),
                    level: wave,
                    stars: lives >= 3 ? 3 : 2
                });
            }
        }

        function damageShip(reason) {
            if (invulnTimer > 0 || barrelRollTimer > 0 || ended) return;
            lives -= 1;
            invulnTimer = 1.4;
            combo = 1;
            damageFlash = 1.0;
            shakeMag = 0.65;
            particles.spawn(ship.x, ship.y, fighterGroup.position.z, 0xfb7185, 16, 10, 0.5, 1.1);
            if (lives <= 0) {
                lives = 0;
                ended = true;
                h.playAudio('explodeBoss');
                syncHud(true);
                ctx.onGameOver?.({
                    score: Math.floor(score),
                    level: wave,
                    stars: 0,
                    reason: reason || h.tr('Yıldız avcısı kanyon çarpışmasında imha oldu.', 'Starfighter destroyed in canyon combat.')
                });
            } else {
                h.playAudio('playerHurt');
                addPopup(h.tr('KALKAN HASARI!', 'SHIELD HIT!'), '#fb7185');
            }
        }

        function spawnMonolithPillar() {
            const px = (Math.random() - 0.5) * (BOUND_X * 1.75);
            const grp = new THREE.Group();
            const body = new THREE.Mesh(pillarGeo, pillarMat);
            grp.add(body);
            for (let t = -4; t <= 4; t += 4) {
                const trim = new THREE.Mesh(pillarTrimGeo, pillarTrimMat);
                trim.position.y = t;
                grp.add(trim);
            }
            const hOff = Math.random() < 0.25 ? 4.5 : -0.8;
            grp.position.set(px, hOff, -148);
            scene.add(grp);
            pillars.push({ mesh: grp, x: px, halfW: 1.25, minY: hOff - 8, maxY: hOff + 8 });
        }

        function spawnEnergyRing() {
            const rx = (Math.random() - 0.5) * (BOUND_X * 1.3);
            const ry = clamp((Math.random() - 0.5) * 4.5 + 1.0, MIN_Y + 1.5, MAX_Y - 1.2);
            const mesh = new THREE.Mesh(ringGeo, ringMat);
            mesh.position.set(rx, ry, -148);
            scene.add(mesh);
            energyRings.push({ mesh, x: rx, y: ry, passed: false });
        }

        function spawnAsteroid() {
            const r = 0.85 + Math.random() * 0.95;
            const ax = (Math.random() - 0.5) * (BOUND_X * 1.6);
            const ay = clamp(MIN_Y + 1.2 + Math.random() * (MAX_Y - MIN_Y - 2), MIN_Y + 1, MAX_Y - 0.8);
            const mesh = new THREE.Mesh(asteroidGeo, asteroidMat);
            mesh.scale.setScalar(r);
            mesh.position.set(ax, ay, -148);
            scene.add(mesh);
            asteroids.push({
                id: Math.random(),
                mesh,
                radius: r,
                hp: r > 1.35 ? 2 : 1,
                vx: (Math.random() - 0.5) * 2.4,
                vy: (Math.random() - 0.5) * 1.2,
                spinX: (Math.random() - 0.5) * 3,
                spinY: (Math.random() - 0.5) * 3,
                getTargetPos(out) {
                    return out.copy(mesh.position);
                }
            });
        }

        function buildInterceptorMesh() {
            const grp = new THREE.Group();
            const body = new THREE.Mesh(interceptorBodyGeo, enemyHullMat);
            body.rotation.x = Math.PI / 2;
            grp.add(body);
            const wings = new THREE.Mesh(interceptorWingGeo, enemyHullMat);
            wings.position.z = -0.15;
            grp.add(wings);
            const core = new THREE.Mesh(interceptorCoreGeo, enemyWingMat);
            core.position.set(0, 0.14, 0.35);
            grp.add(core);
            return grp;
        }

        function spawnInterceptorSquadron() {
            const count = Math.min(5, 2 + Math.floor(wave * 0.6));
            const leadX = (Math.random() - 0.5) * (BOUND_X * 1.1);
            const leadY = clamp(0.5 + (Math.random() - 0.5) * 3.5, MIN_Y + 1.4, MAX_Y - 1.2);
            for (let i = 0; i < count; i++) {
                const ox = (i - (count - 1) * 0.5) * 2.9;
                const oy = Math.abs(i - (count - 1) * 0.5) * 0.9;
                const mesh = buildInterceptorMesh();
                mesh.position.set(clamp(leadX + ox, -BOUND_X, BOUND_X), clamp(leadY + oy, MIN_Y + 1, MAX_Y), -145 - i * 5);
                scene.add(mesh);
                enemies.push({
                    id: Math.random(),
                    mesh,
                    baseX: mesh.position.x,
                    baseY: mesh.position.y,
                    phase: i * 0.9 + Math.random(),
                    hp: 1 + Math.floor(wave / 3),
                    radius: 1.25,
                    fireCd: 0.9 + Math.random() * 1.2,
                    getTargetPos(out) {
                        return out.copy(mesh.position);
                    }
                });
            }
        }

        function spawnDreadnought() {
            const grp = new THREE.Group();
            const mainHull = new THREE.Mesh(dreadMainGeo, dreadHullMat);
            grp.add(mainHull);

            const bridge = new THREE.Mesh(dreadBridgeGeo, dreadHullMat);
            bridge.position.set(0, 2.2, -1.8);
            grp.add(bridge);

            const prowL = new THREE.Mesh(dreadProwGeo, dreadHullMat);
            prowL.position.set(-5.8, -0.2, 2.5);
            grp.add(prowL);

            const prowR = new THREE.Mesh(dreadProwGeo, dreadHullMat);
            prowR.position.set(5.8, -0.2, 2.5);
            grp.add(prowR);

            // 3 Destructible Weakpoint Turret Cores
            const turretHp = 5 + wave * 3;
            const turretDefs = [
                { x: -5.4, y: 1.2, z: 4.5, r: 1.3 },
                { x: 5.4, y: 1.2, z: 4.5, r: 1.3 },
                { x: 0, y: 0.4, z: 7.9, r: 1.65 }
            ];
            const turrets = [];
            for (let i = 0; i < turretDefs.length; i++) {
                const td = turretDefs[i];
                const tMesh = new THREE.Mesh(turretGeo, turretMat);
                tMesh.scale.setScalar(td.r);
                tMesh.position.set(td.x, td.y, td.z);
                const tHalo = new THREE.Mesh(turretRingGeo, turretRingMat);
                tMesh.add(tHalo);
                grp.add(tMesh);
                turrets.push({
                    id: Math.random(),
                    mesh: tMesh,
                    localX: td.x,
                    localY: td.y,
                    localZ: td.z,
                    radius: td.r + 0.45,
                    hp: turretHp,
                    maxHp: turretHp,
                    alive: true,
                    fireCd: 0.6 + i * 0.45,
                    getTargetPos(out) {
                        return tMesh.getWorldPosition(out);
                    }
                });
            }

            grp.position.set(0, 2.5, -135);
            scene.add(grp);

            dreadnought = {
                group: grp,
                turrets,
                targetZ: -44,
                phase: 0
            };
            wavePhase = 'dreadnought';
            h.playAudio('bossAlarm');
            addPopup(h.tr(`DRETNOT GEMİSİ — DALGA ${wave}`, `DREADNOUGHT CARRIER — WAVE ${wave}`), '#fb7185');
        }

        function fireTwinBolts() {
            if (fireCd > 0 || ended) return;
            fireCd = 0.125;

            const aimPt = tmpVecA.set(ship.aimX * 1.15, ship.aimY * 1.05, -46);
            const shipPos = fighterGroup.position;

            [-1.75, 1.75].forEach((wingOff) => {
                const mesh = new THREE.Mesh(boltGeo, playerBoltMat);
                mesh.position.set(shipPos.x + wingOff, shipPos.y - 0.12, shipPos.z - 0.4);
                const dir = tmpVecB.copy(aimPt).sub(mesh.position).normalize();
                mesh.lookAt(mesh.position.x + dir.x, mesh.position.y + dir.y, mesh.position.z + dir.z);
                scene.add(mesh);
                playerBolts.push({
                    mesh,
                    vx: dir.x * 130,
                    vy: dir.y * 130,
                    vz: dir.z * 130,
                    dmg: 1,
                    deflected: false,
                    life: 1.5
                });
            });
            h.playAudio('shootLaser', 0.15);
        }

        function collectLockCandidates() {
            const list = [];
            for (let i = 0; i < enemies.length; i++) {
                if (enemies[i].mesh.position.z < -4 && enemies[i].mesh.position.z > -125) list.push(enemies[i]);
            }
            if (dreadnought) {
                for (let i = 0; i < dreadnought.turrets.length; i++) {
                    if (dreadnought.turrets[i].alive) list.push(dreadnought.turrets[i]);
                }
            }
            for (let i = 0; i < asteroids.length; i++) {
                if (asteroids[i].mesh.position.z < -6 && asteroids[i].mesh.position.z > -115) list.push(asteroids[i]);
            }
            return list;
        }

        function fireLockOnSalvo() {
            if (salvoCd > 0 || ended) return;
            if (lockedTargets.length === 0) {
                // Quick-tap E auto-locks up to 4 nearest in-view threats
                const cands = collectLockCandidates();
                cands.sort((a, b) => {
                    const pa = a.getTargetPos(tmpVecA);
                    const pb = b.getTargetPos(tmpVecB);
                    const da = Math.hypot(pa.x - ship.aimX, pa.y - ship.aimY) - pa.z * 0.04;
                    const db = Math.hypot(pb.x - ship.aimX, pb.y - ship.aimY) - pb.z * 0.04;
                    return da - db;
                });
                lockedTargets = cands.slice(0, 4);
            }
            if (lockedTargets.length === 0) return;

            salvoCd = 0.85;
            for (let i = 0; i < lockedTargets.length; i++) {
                const target = lockedTargets[i];
                const mesh = new THREE.Mesh(missileGeo, missileMat);
                const vx = (i - (lockedTargets.length - 1) * 0.5) * 14;
                const vy = 5;
                const vz = -68;
                mesh.position.set(fighterGroup.position.x + (i % 2 === 0 ? -1.1 : 1.1), fighterGroup.position.y - 0.15, fighterGroup.position.z - 0.4);
                mesh.lookAt(mesh.position.x + vx, mesh.position.y + vy, mesh.position.z + vz);
                scene.add(mesh);
                homingMissiles.push({
                    mesh,
                    target,
                    vx,
                    vy,
                    vz,
                    life: 2.8
                });
            }
            h.playAudio('shootMissile', 0.14);
            addPopup(h.tr(`KİLİTLİ SALVO x${lockedTargets.length}`, `LOCK-ON SALVO x${lockedTargets.length}`), '#fbbf24');
            lockedTargets = [];
        }

        function spawnEnemyBolt(origin, speed, life) {
            const dir = tmpVecB.set(ship.x - origin.x, ship.y - origin.y, 2.4 - origin.z).normalize();
            const bMesh = new THREE.Mesh(boltGeo, enemyBoltMat);
            bMesh.position.copy(origin);
            bMesh.lookAt(bMesh.position.x + dir.x, bMesh.position.y + dir.y, bMesh.position.z + dir.z);
            scene.add(bMesh);
            enemyBolts.push({
                mesh: bMesh,
                vx: dir.x * speed,
                vy: dir.y * speed,
                vz: dir.z * speed,
                life
            });
        }

        function triggerBarrelRoll() {
            if (barrelRollTimer > 0 || barrelRollCd > 0 || ended) return;
            barrelRollTimer = 0.48;
            barrelRollCd = 0.25;
            barrelRollDir = ship.vx < -0.5 ? 1 : (ship.vx > 0.5 ? -1 : (Math.random() < 0.5 ? 1 : -1));
            h.playAudio('dash', 0.12);
        }

        function resetGame(startLevel) {
            clearEntities();
            score = 0;
            wave = Math.max(1, Number(startLevel) || 1);
            lives = 4;
            shieldCharge = 100;
            trenchSpeed = 38 + (wave - 1) * 6;
            scrollOffset = 0;
            waveProgress = 0;
            wavePhase = 'canyon';
            fireCd = 0;
            salvoCd = 0;
            barrelRollTimer = 0;
            barrelRollCd = 0;
            lockHeld = false;
            lockHoldTime = 0;
            invulnTimer = 0;
            shakeMag = 0;
            damageFlash = 0;
            fovBoostTimer = 0;
            spawnPillarTimer = 0.5;
            spawnRingTimer = 2.0;
            spawnAsteroidTimer = 1.2;
            spawnSquadTimer = 1.6;
            combo = 1;
            comboTimer = 0;
            ended = false;

            ship.x = 0;
            ship.y = 0.6;
            ship.vx = 0;
            ship.vy = 0;
            ship.roll = 0;
            ship.pitch = 0;
            ship.aimX = 0;
            ship.aimY = 0.6;
            fighterGroup.position.set(0, 0.6, 2.4);
            fighterGroup.rotation.set(0, 0, 0);
            camera.position.set(0, 1.8, 10.5);
            camera.fov = 64;
            camera.updateProjectionMatrix();

            // Pre-seed a few distant monoliths so the trench looks dramatic immediately
            for (let i = 0; i < 4; i++) {
                spawnMonolithPillar();
                pillars[pillars.length - 1].mesh.position.z = -45 - i * 26;
            }
            addPopup(h.tr(`DALGA ${wave} · KANYONA GİRİŞ`, `WAVE ${wave} · CANYON BREACH`), '#22d3ee');
            syncHud(true);
        }

        function syncHud(force) {
            if (!force && hudTimer > 0) return;
            hudTimer = 0.1;
            const stText = wavePhase === 'dreadnought'
                ? h.tr(`DALGA ${wave} · DRETNOT ÇATIŞMASI`, `WAVE ${wave} · DREADNOUGHT BOSS`)
                : h.tr(`DALGA ${wave} · HIZ ${Math.round(trenchSpeed)} · ÇARPAN x${combo}`, `WAVE ${wave} · SPD ${Math.round(trenchSpeed)} · x${combo}`);
            const objText = isStory
                ? h.tr(`Hedef: ${storyTarget} Skor (Space Ateş · E Kilit · Shift Namlu)`, `Target: ${storyTarget} Score (Space Fire · E Lock · Shift Roll)`)
                : h.tr('Space/Tık Lazer · E Kilitli Salvo · Shift Namlu Dönüşü', 'Space/Click Lasers · E Lock-On Salvo · Shift Barrel Roll');
            h.setHud({
                score: Math.floor(score),
                level: wave,
                maxLevel: isStory ? 1 : 99,
                lives,
                statusText: stText,
                objectiveText: objText
            });
        }

        function step(dt) {
            hudTimer -= dt;
            if (fireCd > 0) fireCd -= dt;
            if (salvoCd > 0) salvoCd -= dt;
            if (invulnTimer > 0) invulnTimer -= dt;
            if (shakeMag > 0) shakeMag = Math.max(0, shakeMag - dt * 2.0);
            if (damageFlash > 0) damageFlash = Math.max(0, damageFlash - dt * 2.4);
            if (fovBoostTimer > 0) fovBoostTimer -= dt;
            if (comboTimer > 0) {
                comboTimer -= dt;
                if (comboTimer <= 0) combo = 1;
            }

            // Flight Controls (WASD + Mouse Reticle)
            let ix = 0;
            let iy = 0;
            if (input.hasKey('KeyA', 'ArrowLeft', 'a')) ix -= 1;
            if (input.hasKey('KeyD', 'ArrowRight', 'd')) ix += 1;
            if (input.hasKey('KeyW', 'ArrowUp', 'w')) iy += 1;
            if (input.hasKey('KeyS', 'ArrowDown', 's')) iy -= 1;

            if (ix !== 0 || iy !== 0) {
                ship.vx = damp(ship.vx, ix * 16.5, 11, dt);
                ship.vy = damp(ship.vy, iy * 12.5, 11, dt);
                ship.aimX = clamp(ship.x + ix * 3.8, -BOUND_X * 1.1, BOUND_X * 1.1);
                ship.aimY = clamp(ship.y + iy * 2.8, MIN_Y, MAX_Y + 0.8);
            } else if (input.pointer.usingPointer) {
                const targetX = input.pointer.nx * BOUND_X;
                const targetY = clamp(-input.pointer.ny * 4.8 + 1.0, MIN_Y, MAX_Y);
                ship.vx = clamp((targetX - ship.x) * 7.5, -18, 18);
                ship.vy = clamp((targetY - ship.y) * 7.5, -14, 14);
                ship.aimX = clamp(targetX * 1.12, -BOUND_X * 1.15, BOUND_X * 1.15);
                ship.aimY = clamp(targetY * 1.08, MIN_Y, MAX_Y + 0.8);
            } else {
                ship.vx = damp(ship.vx, 0, 9, dt);
                ship.vy = damp(ship.vy, 0, 9, dt);
                ship.aimX = damp(ship.aimX, ship.x, 8, dt);
                ship.aimY = damp(ship.aimY, ship.y, 8, dt);
            }

            ship.x = clamp(ship.x + ship.vx * dt, -BOUND_X, BOUND_X);
            ship.y = clamp(ship.y + ship.vy * dt, MIN_Y, MAX_Y);

            // Firing, Barrel Roll & Lock-On
            if (input.hasKey('Space', ' ') || input.pointer.down) {
                fireTwinBolts();
            }
            if (input.consumePressed('ShiftLeft', 'ShiftRight', 'shift')) {
                triggerBarrelRoll();
            }

            // Prune dead/removed targets before collecting new locks or firing salvo
            for (let i = lockedTargets.length - 1; i >= 0; i--) {
                const t = lockedTargets[i];
                if (t.alive === false || (t.hp !== undefined && t.hp <= 0) || (t.mesh && !t.mesh.parent)) {
                    lockedTargets.splice(i, 1);
                }
            }

            if (input.hasKey('KeyE', 'e')) {
                lockHeld = true;
                lockHoldTime += dt;
                if (salvoCd <= 0 && lockedTargets.length < 6) {
                    const cands = collectLockCandidates();
                    for (let i = 0; i < cands.length && lockedTargets.length < 6; i++) {
                        const c = cands[i];
                        if (lockedTargets.includes(c)) continue;
                        const p = c.getTargetPos(tmpVecA);
                        if (Math.hypot(p.x - ship.aimX, p.y - ship.aimY) < 7.8) {
                            lockedTargets.push(c);
                            h.playAudio('xpPickup', 0.08);
                        }
                    }
                }
            } else if (lockHeld) {
                lockHeld = false;
                lockHoldTime = 0;
                fireLockOnSalvo();
            }

            // Barrel Roll rotation + Deflector Bubble
            if (barrelRollTimer > 0) {
                barrelRollTimer = Math.max(0, barrelRollTimer - dt);
                const prog = 1 - barrelRollTimer / 0.48;
                fighterGroup.rotation.z = barrelRollDir * prog * TAU;
                shieldMat.opacity = 0.55 * Math.sin(prog * Math.PI);
                shieldMesh.rotation.y += dt * 9;
            } else {
                if (barrelRollCd > 0) barrelRollCd = Math.max(0, barrelRollCd - dt);
                shieldMat.opacity = 0;
                ship.roll = damp(ship.roll, clamp(-ship.vx * 0.048, -0.72, 0.72), 11, dt);
                ship.pitch = damp(ship.pitch, clamp(ship.vy * 0.036, -0.45, 0.45), 11, dt);
                fighterGroup.rotation.z = ship.roll;
                fighterGroup.rotation.x = ship.pitch;
            }

            fighterGroup.position.set(ship.x, ship.y, 2.4);
            fighterGroup.visible = invulnTimer <= 0 || barrelRollTimer > 0 || Math.floor(invulnTimer * 18) % 2 === 0;
            const thrPulse = 0.88 + Math.sin(performance.now() * 0.04) * 0.25;
            const boostScale = fovBoostTimer > 0 ? 1.45 : 1.0;
            thrCone.scale.set(boostScale, thrPulse * boostScale, boostScale);
            shipLight.intensity = (fovBoostTimer > 0 ? 4.4 : 2.5) * thrPulse;

            // Scroll Floor, Stars & Canyon Environment
            const activeSpeed = trenchSpeed * (fovBoostTimer > 0 ? 1.38 : 1.0);
            scrollOffset += activeSpeed * dt;
            floorTex.offset.y = -(scrollOffset / 10.9);

            const sArr = starGeo.attributes.position.array;
            for (let i = 2; i < sArr.length; i += 3) {
                sArr[i] += activeSpeed * 0.9 * dt;
                if (sArr[i] > 15) sArr[i] -= 195;
            }
            starGeo.attributes.position.needsUpdate = true;

            // Wave Progression & Spawning
            if (wavePhase === 'canyon') {
                waveProgress += dt;
                spawnPillarTimer -= dt;
                if (spawnPillarTimer <= 0) {
                    spawnPillarTimer = Math.max(0.32, 0.75 - wave * 0.05);
                    spawnMonolithPillar();
                }
                spawnRingTimer -= dt;
                if (spawnRingTimer <= 0) {
                    spawnRingTimer = 2.6;
                    spawnEnergyRing();
                }
                spawnAsteroidTimer -= dt;
                if (spawnAsteroidTimer <= 0) {
                    spawnAsteroidTimer = Math.max(0.5, 1.3 - wave * 0.09);
                    spawnAsteroid();
                }
                spawnSquadTimer -= dt;
                if (spawnSquadTimer <= 0) {
                    spawnSquadTimer = Math.max(1.3, 2.6 - wave * 0.14);
                    spawnInterceptorSquadron();
                }

                // Trigger Dreadnought Boss Encounter every wave (~22s of canyon combat)
                if (waveProgress >= 20) {
                    spawnDreadnought();
                }
            } else {
                // Lighter pillar flow during Dreadnought duel
                spawnPillarTimer -= dt;
                if (spawnPillarTimer <= 0) {
                    spawnPillarTimer = 1.15;
                    spawnMonolithPillar();
                }
            }

            // Update Canyon Monolith Pillars (swept Z check prevents high-speed tunneling)
            for (let i = pillars.length - 1; i >= 0; i--) {
                const p = pillars[i];
                const prevZ = p.mesh.position.z;
                p.mesh.position.z += activeSpeed * dt;
                if (zWindowHit(prevZ, p.mesh.position.z, 2.4, 1.2)) {
                    if (Math.abs(ship.x - p.x) < p.halfW + 0.88 && ship.y > p.minY && ship.y < p.maxY) {
                        damageShip(h.tr('Kanyon monolit sütununa çarpıldı!', 'Collided with a canyon monolith pillar!'));
                    }
                }
                if (p.mesh.position.z > 16) {
                    scene.remove(p.mesh);
                    pillars.splice(i, 1);
                }
            }

            // Update Energy Rings (TorusGeometry, swept Z check)
            for (let i = energyRings.length - 1; i >= 0; i--) {
                const r = energyRings[i];
                const prevZ = r.mesh.position.z;
                r.mesh.position.z += activeSpeed * dt;
                r.mesh.rotation.z += dt * 1.8;
                if (!r.passed && zWindowHit(prevZ, r.mesh.position.z, 2.4, 1.35)) {
                    if (Math.hypot(ship.x - r.x, ship.y - r.y) < 2.6) {
                        r.passed = true;
                        combo = Math.min(5, combo + 1);
                        comboTimer = 8.0;
                        fovBoostTimer = 1.25;
                        shieldCharge = Math.min(100, shieldCharge + 25);
                        particles.spawn(r.x, r.y, r.mesh.position.z, 0x34d399, 14, 8, 0.45, 0.9);
                        h.playAudio('powerup');
                        awardScore(140 * combo, `RING BOOST x${combo}`, '#34d399');
                        scene.remove(r.mesh);
                        energyRings.splice(i, 1);
                        continue;
                    }
                }
                if (r.mesh.position.z > 16) {
                    scene.remove(r.mesh);
                    energyRings.splice(i, 1);
                }
            }

            // Update Asteroids + Cannon-es Debris Impulses on Shatter
            for (let i = asteroids.length - 1; i >= 0; i--) {
                const a = asteroids[i];
                const prevZ = a.mesh.position.z;
                a.mesh.position.z += (activeSpeed * 0.95) * dt;
                a.mesh.position.x = clamp(a.mesh.position.x + a.vx * dt, -BOUND_X, BOUND_X);
                a.mesh.position.y = clamp(a.mesh.position.y + a.vy * dt, MIN_Y + 0.5, MAX_Y);
                a.mesh.rotation.x += a.spinX * dt;
                a.mesh.rotation.y += a.spinY * dt;

                if (zWindowHit(prevZ, a.mesh.position.z, 2.4, a.radius + 0.45)) {
                    if (Math.hypot(ship.x - a.mesh.position.x, ship.y - a.mesh.position.y) < a.radius + 0.85) {
                        spawnCannonDebris(a.mesh.position.x, a.mesh.position.y, a.mesh.position.z, 0x64748b, 6, 16);
                        scene.remove(a.mesh);
                        asteroids.splice(i, 1);
                        damageShip(h.tr('Asteroit çarpışması!', 'Asteroid collision!'));
                        continue;
                    }
                }
                if (a.mesh.position.z > 16) {
                    scene.remove(a.mesh);
                    asteroids.splice(i, 1);
                }
            }

            // Update Enemy Interceptor Squadron Ships
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                const prevZ = e.mesh.position.z;
                e.phase += dt * 2.5;
                e.mesh.position.z += (activeSpeed * 0.72) * dt;
                e.mesh.position.x = clamp(e.baseX + Math.sin(e.phase) * 2.4, -BOUND_X, BOUND_X);
                e.mesh.position.y = clamp(e.baseY + Math.cos(e.phase * 1.3) * 1.1, MIN_Y + 0.8, MAX_Y);
                e.mesh.rotation.z = -Math.cos(e.phase) * 0.45;

                e.fireCd -= dt;
                if (e.fireCd <= 0 && e.mesh.position.z < -12 && e.mesh.position.z > -95) {
                    e.fireCd = Math.max(0.85, 1.8 - wave * 0.12);
                    spawnEnemyBolt(e.mesh.position, 48 + wave * 4, 3.2);
                }

                if (zWindowHit(prevZ, e.mesh.position.z, 2.4, 1.4) && Math.hypot(ship.x - e.mesh.position.x, ship.y - e.mesh.position.y) < 1.8) {
                    spawnCannonDebris(e.mesh.position.x, e.mesh.position.y, e.mesh.position.z, 0xfb7185, 6, 15);
                    scene.remove(e.mesh);
                    enemies.splice(i, 1);
                    damageShip(h.tr('Düşman avcısıyla çarpışma!', 'Interceptor mid-air collision!'));
                    continue;
                }
                if (e.mesh.position.z > 16) {
                    scene.remove(e.mesh);
                    enemies.splice(i, 1);
                }
            }

            // Update Dreadnought Carrier Boss
            if (dreadnought) {
                const dn = dreadnought;
                dn.phase += dt;
                dn.group.position.z = damp(dn.group.position.z, dn.targetZ, 1.8, dt);
                dn.group.position.x = Math.sin(dn.phase * 0.75) * 3.6;
                dn.group.position.y = 2.4 + Math.cos(dn.phase * 1.1) * 1.2;
                if (Math.abs(2.4 - dn.group.position.z) < 8.1 && Math.abs(ship.x - dn.group.position.x) < 5.9 && Math.abs(ship.y - dn.group.position.y) < 1.7) {
                    damageShip(h.tr('Dretnot gövdesine çarpıldı!', 'Collided with Dreadnought armor hull!'));
                }

                let aliveCount = 0;
                for (let t = 0; t < dn.turrets.length; t++) {
                    const tur = dn.turrets[t];
                    if (!tur.alive) continue;
                    aliveCount += 1;
                    tur.mesh.rotation.y += dt * 2.8;
                    tur.mesh.rotation.x += dt * 1.7;
                    tur.fireCd -= dt;
                    if (tur.fireCd <= 0 && dn.group.position.z > -70) {
                        tur.fireCd = Math.max(0.55, 1.4 - wave * 0.08);
                        spawnEnemyBolt(tur.getTargetPos(tmpVecA), 52 + wave * 4, 3.0);
                    }
                }

                if (aliveCount === 0) {
                    const bx = dn.group.position.x;
                    const by = dn.group.position.y;
                    const bz = dn.group.position.z;
                    particles.spawn(bx, by, bz, 0xfbbf24, 38, 18, 0.85, 1.8);
                    particles.spawn(bx, by, bz, 0x22d3ee, 24, 15, 0.7, 1.4);
                    spawnCannonDebris(bx, by, bz, 0xfb7185, 14, 22);
                    h.playAudio('explodeBoss');
                    shakeMag = 0.9;
                    scene.remove(dn.group);
                    dreadnought = null;

                    const waveBonus = 450 * wave;
                    awardScore(waveBonus, h.tr(`DRETNOT İMHA! DALGA ${wave}`, `DREADNOUGHT DOWN! WAVE ${wave}`), '#fbbf24');
                    if (!ended) {
                        wave += 1;
                        wavePhase = 'canyon';
                        waveProgress = 0;
                        trenchSpeed = Math.min(82, 38 + (wave - 1) * 6.5);
                        fovBoostTimer = 1.6;
                        lives = Math.min(5, lives + 1);
                    }
                }
            }

            // Update Player Twin Bolts & Deflected Bolts (swept segment distance check)
            for (let i = playerBolts.length - 1; i >= 0; i--) {
                const b = playerBolts[i];
                const prevX = b.mesh.position.x;
                const prevY = b.mesh.position.y;
                const prevZ = b.mesh.position.z;
                b.life -= dt;
                b.mesh.position.x += b.vx * dt;
                b.mesh.position.y += b.vy * dt;
                b.mesh.position.z += b.vz * dt;
                const bx = b.mesh.position.x;
                const by = b.mesh.position.y;
                const bz = b.mesh.position.z;
                let hit = false;

                // Hit Asteroids
                for (let j = asteroids.length - 1; j >= 0; j--) {
                    const a = asteroids[j];
                    const hitR = a.radius + 0.9;
                    if (segPointDistSq(prevX, prevY, prevZ, bx, by, bz, a.mesh.position.x, a.mesh.position.y, a.mesh.position.z) < hitR * hitR) {
                        hit = true;
                        a.hp -= b.dmg;
                        if (a.hp <= 0) {
                            spawnCannonDebris(a.mesh.position.x, a.mesh.position.y, a.mesh.position.z, 0x64748b, 6, 15);
                            particles.spawn(a.mesh.position.x, a.mesh.position.y, a.mesh.position.z, 0xfbbf24, 10, 8, 0.4, 0.9);
                            h.playAudio('explodeSmall', 0.18);
                            awardScore(75 * combo, b.deflected ? 'DEFLECT SHATTER' : null, '#38bdf8');
                            scene.remove(a.mesh);
                            asteroids.splice(j, 1);
                        } else {
                            particles.spawn(bx, by, bz, 0x22d3ee, 4, 5, 0.25, 0.6);
                            h.playAudio('hitMetal', 0.12);
                        }
                        break;
                    }
                }

                // Hit Enemy Interceptors
                if (!hit) {
                    for (let j = enemies.length - 1; j >= 0; j--) {
                        const e = enemies[j];
                        const hitR = e.radius + 0.9;
                        if (segPointDistSq(prevX, prevY, prevZ, bx, by, bz, e.mesh.position.x, e.mesh.position.y, e.mesh.position.z) < hitR * hitR) {
                            hit = true;
                            e.hp -= b.dmg;
                            if (e.hp <= 0) {
                                spawnCannonDebris(e.mesh.position.x, e.mesh.position.y, e.mesh.position.z, 0xfb7185, 5, 16);
                                particles.spawn(e.mesh.position.x, e.mesh.position.y, e.mesh.position.z, 0xfb7185, 14, 11, 0.45, 1.0);
                                h.playAudio('explodeSmall', 0.16);
                                awardScore(120 * combo, b.deflected ? h.tr('YANSITMA İMHASI', 'DEFLECT KILL') : null, '#22d3ee');
                                scene.remove(e.mesh);
                                enemies.splice(j, 1);
                            } else {
                                particles.spawn(bx, by, bz, 0xfbbf24, 5, 6, 0.25, 0.6);
                                h.playAudio('hitMetal', 0.12);
                            }
                            break;
                        }
                    }
                }

                // Hit Dreadnought Turrets (and spark ricochet off armored main hull)
                if (!hit && dreadnought) {
                    for (let t = 0; t < dreadnought.turrets.length; t++) {
                        const tur = dreadnought.turrets[t];
                        if (!tur.alive) continue;
                        const tWorld = tur.getTargetPos(tmpVecA);
                        const hitR = tur.radius + 0.9;
                        if (segPointDistSq(prevX, prevY, prevZ, bx, by, bz, tWorld.x, tWorld.y, tWorld.z) < hitR * hitR) {
                            hit = true;
                            tur.hp -= b.dmg;
                            particles.spawn(tWorld.x, tWorld.y, tWorld.z, 0xfbbf24, 6, 7, 0.3, 0.75);
                            if (tur.hp <= 0) {
                                tur.alive = false;
                                tur.mesh.visible = false;
                                spawnCannonDebris(tWorld.x, tWorld.y, tWorld.z, 0xfb7185, 8, 18);
                                particles.spawn(tWorld.x, tWorld.y, tWorld.z, 0xfb7185, 18, 12, 0.55, 1.25);
                                h.playAudio('explodeSmall', 0.15);
                                shakeMag = Math.max(shakeMag, 0.4);
                                awardScore(200 * combo, h.tr('TARET İMHA', 'TURRET DESTROYED'), '#fbbf24');
                            } else {
                                h.playAudio('hitShield', 0.1);
                            }
                            break;
                        }
                    }
                    if (!hit && Math.abs(bx - dreadnought.group.position.x) < 5.75 && Math.abs(by - dreadnought.group.position.y) < 1.4 && Math.abs(bz - dreadnought.group.position.z) < 7.6) {
                        hit = true;
                        particles.spawn(bx, by, bz, 0x94a3b8, 4, 5, 0.22, 0.55);
                        h.playAudio('hitMetal', 0.06);
                    }
                }

                if (hit || b.life <= 0 || bz < -150) {
                    scene.remove(b.mesh);
                    playerBolts.splice(i, 1);
                }
            }

            // Update Homing Salvo Missiles
            for (let i = homingMissiles.length - 1; i >= 0; i--) {
                const m = homingMissiles[i];
                m.life -= dt;

                if (m.target && m.target.alive !== false && (m.target.hp === undefined || m.target.hp > 0)) {
                    const tPos = m.target.getTargetPos(tmpVecA);
                    const desired = tmpVecB.copy(tPos).sub(m.mesh.position).normalize().multiplyScalar(92);
                    m.vx = lerp(m.vx, desired.x, clamp(dt * 9.5, 0, 1));
                    m.vy = lerp(m.vy, desired.y, clamp(dt * 9.5, 0, 1));
                    m.vz = lerp(m.vz, desired.z, clamp(dt * 9.5, 0, 1));

                    if (m.mesh.position.distanceTo(tPos) < 2.2) {
                        particles.spawn(tPos.x, tPos.y, tPos.z, 0xfbbf24, 16, 11, 0.5, 1.15);
                        h.playAudio('explodeSmall', 0.15);
                        if (m.target.hp !== undefined) {
                            m.target.hp -= 3;
                            if (m.target.hp <= 0) {
                                if (typeof m.target.alive === 'boolean') {
                                    m.target.alive = false;
                                    m.target.mesh.visible = false;
                                    spawnCannonDebris(tPos.x, tPos.y, tPos.z, 0xfb7185, 8, 18);
                                    awardScore(220 * combo, h.tr('KİLİTLİ İMHA', 'LOCK-ON KILL'), '#fbbf24');
                                } else {
                                    const eIdx = enemies.indexOf(m.target);
                                    const aIdx = asteroids.indexOf(m.target);
                                    if (eIdx >= 0) {
                                        spawnCannonDebris(tPos.x, tPos.y, tPos.z, 0xfb7185, 6, 16);
                                        scene.remove(m.target.mesh);
                                        enemies.splice(eIdx, 1);
                                        awardScore(160 * combo, null);
                                    } else if (aIdx >= 0) {
                                        spawnCannonDebris(tPos.x, tPos.y, tPos.z, 0x64748b, 6, 15);
                                        scene.remove(m.target.mesh);
                                        asteroids.splice(aIdx, 1);
                                        awardScore(110 * combo, null);
                                    }
                                }
                            }
                        }
                        scene.remove(m.mesh);
                        homingMissiles.splice(i, 1);
                        continue;
                    }
                }

                m.mesh.position.x += m.vx * dt;
                m.mesh.position.y += m.vy * dt;
                m.mesh.position.z += m.vz * dt;
                m.mesh.lookAt(m.mesh.position.x + m.vx, m.mesh.position.y + m.vy, m.mesh.position.z + m.vz);
                if (Math.random() < 0.65) {
                    particles.spawn(m.mesh.position.x, m.mesh.position.y, m.mesh.position.z, 0x22d3ee, 1, 2, 0.22, 0.55);
                }

                if (m.life <= 0 || m.mesh.position.z < -150) {
                    scene.remove(m.mesh);
                    homingMissiles.splice(i, 1);
                }
            }

            // Update Enemy Crimson Bolts + Barrel Roll Deflection (swept segment distance check)
            for (let i = enemyBolts.length - 1; i >= 0; i--) {
                const b = enemyBolts[i];
                const prevX = b.mesh.position.x;
                const prevY = b.mesh.position.y;
                const prevZ = b.mesh.position.z;
                b.life -= dt;
                b.mesh.position.x += b.vx * dt;
                b.mesh.position.y += b.vy * dt;
                b.mesh.position.z += b.vz * dt;

                const dShipSq = segPointDistSq(
                    prevX, prevY, prevZ,
                    b.mesh.position.x, b.mesh.position.y, b.mesh.position.z,
                    fighterGroup.position.x, fighterGroup.position.y, fighterGroup.position.z
                );
                if (barrelRollTimer > 0 && dShipSq < 2.9 * 2.9) {
                    // DEFLECTED BY BARREL ROLL!
                    const dvx = -b.vx * 0.7;
                    const dvy = -b.vy * 0.7;
                    const dvz = -96;
                    b.mesh.material = deflectedBoltMat;
                    b.mesh.lookAt(b.mesh.position.x + dvx, b.mesh.position.y + dvy, b.mesh.position.z + dvz);
                    playerBolts.push({
                        mesh: b.mesh,
                        vx: dvx,
                        vy: dvy,
                        vz: dvz,
                        dmg: 2,
                        deflected: true,
                        life: 1.6
                    });
                    enemyBolts.splice(i, 1);
                    particles.spawn(fighterGroup.position.x, fighterGroup.position.y, fighterGroup.position.z, 0x22d3ee, 8, 8, 0.35, 0.8);
                    h.playAudio('hitShield', 0.14);
                    awardScore(75, h.tr('LAZER YANSITILDI!', 'BOLT DEFLECTED!'), '#22d3ee');
                    continue;
                } else if (dShipSq < 1.18 * 1.18) {
                    scene.remove(b.mesh);
                    enemyBolts.splice(i, 1);
                    damageShip(h.tr('Kızıl plazma darbesi!', 'Struck by crimson laser fire!'));
                    continue;
                }

                if (b.life <= 0 || b.mesh.position.z > 14) {
                    scene.remove(b.mesh);
                    enemyBolts.splice(i, 1);
                }
            }

            // Step Cannon-es Debris Shards
            cannonWorld.step(1 / 60, dt, 2);
            for (let i = cannonShards.length - 1; i >= 0; i--) {
                const s = cannonShards[i];
                s.life -= dt;
                s.body.position.z += activeSpeed * 0.55 * dt;
                s.mesh.position.set(s.body.position.x, s.body.position.y, s.body.position.z);
                s.mesh.quaternion.set(s.body.quaternion.x, s.body.quaternion.y, s.body.quaternion.z, s.body.quaternion.w);
                if (s.life <= 0 || s.body.position.z > 16) {
                    removeShardBody(s.body);
                    scene.remove(s.mesh);
                    cannonShards.splice(i, 1);
                }
            }

            // Dynamic Banking Camera + Dynamic FOV
            const sx = (Math.random() - 0.5) * shakeMag;
            const sy = (Math.random() - 0.5) * shakeMag;
            camera.position.x = damp(camera.position.x, ship.x * 0.52, 7.5, dt) + sx;
            camera.position.y = damp(camera.position.y, ship.y * 0.48 + 1.45, 7.5, dt) + sy;
            camera.lookAt(ship.x * 0.25 + ship.aimX * 0.15, ship.y * 0.22 + ship.aimY * 0.12, -32);
            camera.rotation.z = -ship.roll * 0.24;

            const desiredFov = fovBoostTimer > 0 ? 77 : (barrelRollTimer > 0 ? 72 : (64 + Math.min(8, (wave - 1) * 1.4)));
            if (Math.abs(camera.fov - desiredFov) > 0.1) {
                camera.fov = damp(camera.fov, desiredFov, 8, dt);
                camera.updateProjectionMatrix();
            }

            for (let i = popups.length - 1; i >= 0; i--) {
                popups[i].life -= dt;
                popups[i].yOffset -= 32 * dt;
                if (popups[i].life <= 0) popups.splice(i, 1);
            }

            particles.update(dt);
            syncHud(false);
        }

        function drawHudOverlay() {
            hg.clearRect(0, 0, STAGE_W, STAGE_H);

            if (damageFlash > 0.01) {
                const grad = hg.createRadialGradient(STAGE_W * 0.5, STAGE_H * 0.5, 180, STAGE_W * 0.5, STAGE_H * 0.5, 560);
                grad.addColorStop(0, 'rgba(251,113,133,0)');
                grad.addColorStop(1, `rgba(251,113,133,${(damageFlash * 0.55).toFixed(3)})`);
                hg.fillStyle = grad;
                hg.fillRect(0, 0, STAGE_W, STAGE_H);
            }

            // Dual Starfox Perspective Reticles
            const nearAim = h.projectToStage(tmpVecA.set(lerp(ship.x, ship.aimX, 0.45), lerp(ship.y, ship.aimY, 0.45), -18), camera, tmpVecB);
            const farAim = h.projectToStage(tmpVecA.set(ship.aimX * 1.15, ship.aimY * 1.05, -48), camera, tmpVecB);

            hg.save();
            if (nearAim.visible) {
                hg.strokeStyle = barrelRollTimer > 0 ? '#22d3ee' : 'rgba(52, 211, 153, 0.85)';
                hg.lineWidth = 2;
                hg.strokeRect(nearAim.x - 16, nearAim.y - 16, 32, 32);
            }
            if (farAim.visible) {
                hg.strokeStyle = 'rgba(34, 211, 238, 0.72)';
                hg.lineWidth = 1.6;
                hg.strokeRect(farAim.x - 10, farAim.y - 10, 20, 20);
                hg.beginPath();
                hg.moveTo(farAim.x - 16, farAim.y);
                hg.lineTo(farAim.x - 6, farAim.y);
                hg.moveTo(farAim.x + 6, farAim.y);
                hg.lineTo(farAim.x + 16, farAim.y);
                hg.moveTo(farAim.x, farAim.y - 16);
                hg.lineTo(farAim.x, farAim.y - 6);
                hg.moveTo(farAim.x, farAim.y + 6);
                hg.lineTo(farAim.x, farAim.y + 16);
                hg.stroke();
            }

            // Draw Lock-On Target Diamond Brackets
            for (let i = 0; i < lockedTargets.length; i++) {
                const t = lockedTargets[i];
                const pos3 = t.getTargetPos(tmpVecA);
                const scr = h.projectToStage(pos3, camera, tmpVecB);
                if (!scr.visible) continue;
                hg.save();
                hg.translate(scr.x, scr.y);
                hg.rotate(performance.now() * 0.005 + i);
                hg.strokeStyle = '#fbbf24';
                hg.lineWidth = 2.2;
                hg.strokeRect(-18, -18, 36, 36);
                hg.restore();
            }

            // Top-Left Wave & Dreadnought Status Pill
            hg.fillStyle = 'rgba(7, 11, 20, 0.72)';
            hg.strokeStyle = wavePhase === 'dreadnought' ? 'rgba(251, 113, 133, 0.65)' : 'rgba(34, 211, 238, 0.4)';
            hg.lineWidth = 1.5;
            hg.beginPath();
            drawRoundRect(hg, 16, 14, 278, 56, 10);
            hg.fill();
            hg.stroke();

            hg.fillStyle = wavePhase === 'dreadnought' ? '#fb7185' : '#22d3ee';
            hg.font = '700 11px "JetBrains Mono", monospace';
            hg.fillText(
                wavePhase === 'dreadnought'
                    ? `WAVE ${wave} · DREADNOUGHT ENGAGED`
                    : `WAVE ${wave} · CANYON TRENCH`,
                28,
                34
            );

            if (dreadnought) {
                let hpSum = 0;
                let hpMax = 0;
                for (let t = 0; t < dreadnought.turrets.length; t++) {
                    hpSum += Math.max(0, dreadnought.turrets[t].hp);
                    hpMax += dreadnought.turrets[t].maxHp;
                }
                hg.fillStyle = 'rgba(15, 23, 42, 0.9)';
                hg.fillRect(28, 44, 248, 10);
                hg.fillStyle = '#fb7185';
                hg.fillRect(28, 44, 248 * clamp(hpSum / Math.max(1, hpMax), 0, 1), 10);
            } else {
                hg.fillStyle = '#e2e8f0';
                hg.font = '600 12px "JetBrains Mono", monospace';
                hg.fillText(`SPD: ${Math.round(trenchSpeed)}  ·  COMBO: x${combo}`, 28, 54);
            }

            // Bottom-Right Quick Tactical Legend
            hg.fillStyle = 'rgba(7, 11, 20, 0.68)';
            hg.strokeStyle = 'rgba(148, 163, 184, 0.25)';
            hg.beginPath();
            drawRoundRect(hg, STAGE_W - 296, STAGE_H - 44, 280, 28, 8);
            hg.fill();
            hg.stroke();
            hg.fillStyle = '#cbd5e1';
            hg.font = '600 11px "JetBrains Mono", monospace';
            hg.textAlign = 'center';
            hg.fillText(h.tr('WASD/Fare · Space Ateş · E Kilit · Shift Namlu', 'WASD/Mouse · Space Fire · E Lock · Shift Roll'), STAGE_W - 156, STAGE_H - 26);

            // Popups
            for (let i = 0; i < popups.length; i++) {
                const p = popups[i];
                hg.globalAlpha = clamp(p.life / 0.45, 0, 1);
                hg.fillStyle = p.color;
                hg.font = '700 16px "Space Grotesk", sans-serif';
                hg.textAlign = 'center';
                hg.shadowColor = 'rgba(0,0,0,0.9)';
                hg.shadowBlur = 8;
                hg.fillText(p.text, STAGE_W * 0.5, 118 + p.yOffset + i * 24);
            }
            hg.restore();
        }

        function loop(now) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
            lastTime = now;

            h.syncCameraAspect(camera, webglCanvas);
            const paused = typeof ctx.getPaused === 'function' ? Boolean(ctx.getPaused()) : false;
            if (!paused && !ended) {
                step(dt);
            } else {
                input.pointer.down = false;
            }
            input.clearFrameEvents();
            renderer.render(scene, camera);
            drawHudOverlay();
            rafId = requestAnimationFrame(loop);
        }

        resetGame(ctx.initialLevel || 1);
        rafId = requestAnimationFrame(loop);

        return {
            restart(lvl) {
                resetGame(lvl);
            },
            destroy() {
                destroyed = true;
                cancelAnimationFrame(rafId);
                input.destroy();
                clearEntities();
                particles.dispose();
                h.disposeThree(scene, renderer, [
                    nebulaTex,
                    floorTex,
                    skyGeo,
                    starGeo,
                    floorGeo,
                    cliffGeo,
                    stripGeo,
                    pillarGeo,
                    pillarTrimGeo,
                    ringGeo,
                    asteroidGeo,
                    shardGeo,
                    boltGeo,
                    missileGeo,
                    interceptorBodyGeo,
                    interceptorWingGeo,
                    interceptorCoreGeo,
                    dreadMainGeo,
                    dreadBridgeGeo,
                    dreadProwGeo,
                    turretGeo,
                    turretRingGeo,
                    skyMat,
                    starMat,
                    floorMat,
                    cliffMat,
                    stripMat,
                    shipHullMat,
                    shipAccentMat,
                    shipCockpitMat,
                    thrusterGlowMat,
                    shieldMat,
                    pillarMat,
                    pillarTrimMat,
                    ringMat,
                    asteroidMat,
                    playerBoltMat,
                    deflectedBoltMat,
                    enemyBoltMat,
                    missileMat,
                    enemyHullMat,
                    enemyWingMat,
                    dreadHullMat,
                    turretMat,
                    turretRingMat
                ]);
                if (hudCanvas.parentNode) hudCanvas.remove();
                if (webglCanvas.parentNode) webglCanvas.remove();
            }
        };
    };
})(window);
