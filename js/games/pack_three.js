/**
 * COSMIC UNIVERSE v11.0 — 3D WebGL Game Engine Pack (Three.js)
 * Registers:
 *   - three-void-interceptor (Story Ch.6, chapterTarget=1200)
 *   - three-star-slalom
 *   - helix-station-drop
 */
(function (global) {
    'use strict';

    const STAGE_W = 960;
    const STAGE_H = 540;
    const TAU = Math.PI * 2;

    global.COSMIC_GAME_ENGINES = global.COSMIC_GAME_ENGINES || {};

    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function wrapAngle(a) {
        return ((a % TAU) + TAU) % TAU;
    }

    function createRuntimeHelpers(ctx) {
        const tr = typeof ctx.t === 'function'
            ? (trStr, enStr) => ctx.t(trStr, enStr)
            : (trStr, enStr) => (ctx.lang === 'en' ? enStr : trStr);

        function playAudio(key, jitter) {
            try {
                ctx.audio?.play?.(key, jitter);
            } catch (e) { /* safe ignore */ }
        }

        function unlockAudio() {
            try {
                ctx.audio?.unlock?.();
            } catch (e) { /* safe ignore */ }
        }

        function setHud(payload) {
            try {
                ctx.setHud?.(payload);
            } catch (e) { /* safe ignore */ }
        }

        function initCanvas() {
            const canvas = typeof ctx.createCanvas === 'function'
                ? ctx.createCanvas()
                : document.createElement('canvas');
            if (!canvas.parentNode && ctx.stageEl) {
                ctx.stageEl.appendChild(canvas);
            }
            canvas.width = STAGE_W;
            canvas.height = STAGE_H;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';
            return canvas;
        }

        function initRenderer(canvas) {
            const THREE = global.THREE;
            if (!THREE) {
                throw new Error('THREE library is not loaded');
            }
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
            return renderer;
        }

        function createOverlay() {
            const stageEl = ctx.stageEl;
            if (!stageEl) {
                return {
                    root: null,
                    spawnPopup: () => {},
                    flashDamage: () => {},
                    setHint: () => {},
                    update: () => {},
                    destroy: () => {}
                };
            }
            try {
                const pos = global.getComputedStyle(stageEl).position;
                if (pos === 'static') stageEl.style.position = 'relative';
            } catch (e) { /* ignore */ }

            const root = document.createElement('div');
            root.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:4;font-family:"Space Grotesk","Inter",sans-serif;';

            const vignette = document.createElement('div');
            vignette.style.cssText = 'position:absolute;inset:0;opacity:0;transition:opacity 120ms ease;box-shadow:inset 0 0 90px rgba(251,113,133,0.88);background:radial-gradient(circle,transparent 52%,rgba(251,113,133,0.22) 100%);';
            root.appendChild(vignette);

            const hintEl = document.createElement('div');
            hintEl.style.cssText = 'position:absolute;left:50%;bottom:18px;transform:translateX(-50%);padding:6px 14px;border-radius:999px;background:rgba(7,11,18,0.78);border:1px solid rgba(56,189,248,0.42);color:#e2e8f0;font-size:12px;font-weight:600;letter-spacing:0.03em;white-space:nowrap;backdrop-filter:blur(4px);transition:opacity 400ms ease;';
            root.appendChild(hintEl);

            const popups = [];
            let damageTimer = 0;
            let hintTimer = 4.6;

            stageEl.appendChild(root);

            return {
                root,
                setHint(text) {
                    hintEl.textContent = text;
                    hintEl.style.opacity = text ? '1' : '0';
                    hintTimer = 4.6;
                },
                flashDamage(color) {
                    vignette.style.boxShadow = `inset 0 0 95px ${color || 'rgba(251,113,133,0.88)'}`;
                    vignette.style.opacity = '1';
                    damageTimer = 0.24;
                },
                spawnPopup(x, y, text, color = '#38bdf8', scale = 1) {
                    if (popups.length > 18) {
                        const old = popups.shift();
                        old.el.remove();
                    }
                    const el = document.createElement('div');
                    el.textContent = text;
                    el.style.cssText = `position:absolute;left:0;top:0;transform:translate(-50%,-50%) scale(${scale});color:${color};font-weight:700;font-size:15px;text-shadow:0 2px 8px rgba(0,0,0,0.85);white-space:nowrap;will-change:transform,opacity;`;
                    root.appendChild(el);
                    popups.push({ el, x: clamp(x, 56, STAGE_W - 56), y: clamp(y, 40, STAGE_H - 40), vy: -46, life: 0.9, maxLife: 0.9, scale });
                },
                update(dt) {
                    if (damageTimer > 0) {
                        damageTimer -= dt;
                        if (damageTimer <= 0) vignette.style.opacity = '0';
                    }
                    if (hintTimer > 0) {
                        hintTimer -= dt;
                        if (hintTimer <= 0) hintEl.style.opacity = '0';
                    }
                    for (let i = popups.length - 1; i >= 0; i--) {
                        const p = popups[i];
                        p.life -= dt;
                        p.y += p.vy * dt;
                        p.vy *= 0.96;
                        if (p.life <= 0) {
                            p.el.remove();
                            popups.splice(i, 1);
                            continue;
                        }
                        const alpha = clamp(p.life / (p.maxLife * 0.45), 0, 1);
                        const pxPct = (p.x / STAGE_W) * 100;
                        const pyPct = (p.y / STAGE_H) * 100;
                        p.el.style.left = pxPct + '%';
                        p.el.style.top = pyPct + '%';
                        p.el.style.opacity = String(alpha);
                    }
                },
                clearPopups() {
                    while (popups.length) popups.pop().el.remove();
                    vignette.style.opacity = '0';
                },
                destroy() {
                    while (popups.length) popups.pop().el.remove();
                    root.remove();
                }
            };
        }

        function projectToScreen(vec3, camera, tmpVec) {
            const v = tmpVec.copy(vec3).project(camera);
            return {
                x: (v.x * 0.5 + 0.5) * STAGE_W,
                y: (-v.y * 0.5 + 0.5) * STAGE_H,
                visible: v.z <= 1
            };
        }

        function createInput(canvas) {
            const keys = new Set();
            const pointer = {
                active: false,
                down: false,
                nx: 0,
                ny: 0,
                lastX: 0,
                dragDeltaX: 0
            };

            const isFormEl = (el) => el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);

            const onKeyDown = (e) => {
                if (isFormEl(e.target)) return;
                unlockAudio();
                const code = e.code || '';
                const key = (e.key || '').toLowerCase();
                keys.add(code);
                if (key) keys.add(key);
                if (code === 'Space' || code.startsWith('Arrow')) {
                    e.preventDefault();
                }
            };

            const onKeyUp = (e) => {
                const code = e.code || '';
                const key = (e.key || '').toLowerCase();
                keys.delete(code);
                if (key) keys.delete(key);
            };

            const updatePointerCoords = (e) => {
                const rect = canvas.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
                const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
                pointer.nx = nx;
                pointer.ny = ny;
                pointer.active = true;
            };

            const onPointerDown = (e) => {
                unlockAudio();
                pointer.down = true;
                pointer.lastX = e.clientX;
                updatePointerCoords(e);
            };

            const onPointerMove = (e) => {
                if (pointer.down) {
                    pointer.dragDeltaX += (e.clientX - pointer.lastX);
                    pointer.lastX = e.clientX;
                }
                updatePointerCoords(e);
            };

            const onPointerUp = () => {
                pointer.down = false;
            };

            const onBlur = () => {
                keys.clear();
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
                consumeDragX() {
                    const d = pointer.dragDeltaX;
                    pointer.dragDeltaX = 0;
                    return d;
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

        function createStarfield(THREE, count, spreadX, spreadY, zMin, zMax) {
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const palette = [
                new THREE.Color(0x38bdf8),
                new THREE.Color(0xe2e8f0),
                new THREE.Color(0xa78bfa),
                new THREE.Color(0xfbbf24)
            ];
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                positions[i3] = (Math.random() - 0.5) * spreadX * 2;
                positions[i3 + 1] = (Math.random() - 0.5) * spreadY * 2;
                positions[i3 + 2] = zMin + Math.random() * (zMax - zMin);
                const c = palette[i % palette.length];
                colors[i3] = c.r;
                colors[i3 + 1] = c.g;
                colors[i3 + 2] = c.b;
            }
            const geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            const mat = new THREE.PointsMaterial({
                size: 0.24,
                vertexColors: true,
                transparent: true,
                opacity: 0.88
            });
            const points = new THREE.Points(geom, mat);
            return {
                points,
                scroll(speed, dt) {
                    const attr = geom.attributes.position;
                    const arr = attr.array;
                    for (let i = 2; i < arr.length; i += 3) {
                        arr[i] += speed * dt;
                        if (arr[i] > zMax) {
                            arr[i] = zMin + (arr[i] - zMax);
                        }
                    }
                    attr.needsUpdate = true;
                }
            };
        }

        function createParticleSystem(THREE, scene, maxParticles) {
            const geom = new THREE.OctahedronGeometry(0.18, 0);
            const matPool = new Map();
            const active = [];
            const free = [];

            function getMat(hex) {
                let m = matPool.get(hex);
                if (!m) {
                    m = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 1 });
                    matPool.set(hex, m);
                }
                return m;
            }

            function spawn(x, y, z, colorHex, count, speed) {
                for (let i = 0; i < count; i++) {
                    if (active.length >= maxParticles) break;
                    let mesh = free.pop();
                    if (!mesh) {
                        mesh = new THREE.Mesh(geom, getMat(colorHex));
                    } else {
                        mesh.material = getMat(colorHex);
                    }
                    mesh.position.set(x, y, z);
                    mesh.scale.setScalar(0.8 + Math.random() * 0.9);
                    mesh.visible = true;
                    scene.add(mesh);

                    const theta = Math.random() * TAU;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const s = speed * (0.45 + Math.random() * 0.85);
                    active.push({
                        mesh,
                        vx: Math.sin(phi) * Math.cos(theta) * s,
                        vy: Math.cos(phi) * s,
                        vz: Math.sin(phi) * Math.sin(theta) * s,
                        life: 0.35 + Math.random() * 0.3,
                        maxLife: 0.65
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
                    p.mesh.rotation.x += 5 * dt;
                    p.mesh.rotation.y += 6 * dt;
                    const s = Math.max(0.05, p.life / p.maxLife);
                    p.mesh.scale.setScalar(s * 1.15);
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
                for (const m of matPool.values()) m.dispose();
                matPool.clear();
            }

            return { spawn, update, clear, dispose };
        }

        function disposeThree(scene, renderer) {
            if (scene) {
                const seenGeom = new Set();
                const seenMat = new Set();
                scene.traverse((obj) => {
                    if (obj.geometry && !seenGeom.has(obj.geometry)) {
                        seenGeom.add(obj.geometry);
                        obj.geometry.dispose();
                    }
                    if (obj.material) {
                        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                        for (let i = 0; i < mats.length; i++) {
                            const mat = mats[i];
                            if (mat && !seenMat.has(mat)) {
                                seenMat.add(mat);
                                if (mat.map) mat.map.dispose();
                                mat.dispose();
                            }
                        }
                    }
                });
                scene.clear();
            }
            if (renderer && typeof renderer.dispose === 'function') {
                renderer.dispose();
            }
        }

        function buildFighterMesh(THREE, accentHex = 0x38bdf8, bodyHex = 0x0f172a) {
            const ship = new THREE.Group();

            const hullMat = new THREE.MeshStandardMaterial({
                color: bodyHex,
                metalness: 0.55,
                roughness: 0.35,
                emissive: accentHex,
                emissiveIntensity: 0.16
            });
            const accentMat = new THREE.MeshStandardMaterial({
                color: accentHex,
                emissive: accentHex,
                emissiveIntensity: 0.72,
                metalness: 0.3,
                roughness: 0.2
            });

            const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.34, 1.9), hullMat);
            ship.add(body);

            const nose = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.0, 6), accentMat);
            nose.rotation.x = -Math.PI / 2;
            nose.position.z = -1.42;
            ship.add(nose);

            const wingL = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 0.85), hullMat);
            wingL.position.set(-0.95, -0.04, 0.25);
            wingL.rotation.z = 0.16;
            wingL.rotation.y = 0.26;
            ship.add(wingL);

            const wingR = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 0.85), hullMat);
            wingR.position.set(0.95, -0.04, 0.25);
            wingR.rotation.z = -0.16;
            wingR.rotation.y = -0.26;
            ship.add(wingR);

            const finL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.9), accentMat);
            finL.position.set(-1.55, 0.06, 0.42);
            ship.add(finL);

            const finR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.9), accentMat);
            finR.position.set(1.55, 0.06, 0.42);
            ship.add(finR);

            const canopy = new THREE.Mesh(
                new THREE.SphereGeometry(0.26, 12, 10),
                new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
            );
            canopy.scale.set(0.85, 0.65, 1.8);
            canopy.position.set(0, 0.22, -0.22);
            ship.add(canopy);

            const engineMat = new THREE.MeshBasicMaterial({ color: accentHex });
            const thrL = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.65, 8), engineMat);
            thrL.rotation.x = Math.PI / 2;
            thrL.position.set(-0.28, 0, 1.2);
            ship.add(thrL);

            const thrR = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.65, 8), engineMat);
            thrR.rotation.x = Math.PI / 2;
            thrR.position.set(0.28, 0, 1.2);
            ship.add(thrR);

            return { group: ship, thrusters: [thrL, thrR] };
        }

        function createProceduralAsteroidGeo(THREE, radius) {
            const geom = new THREE.DodecahedronGeometry(radius, 0);
            const pos = geom.attributes.position;
            const cache = new Map();
            for (let i = 0; i < pos.count; i++) {
                const vx = pos.getX(i);
                const vy = pos.getY(i);
                const vz = pos.getZ(i);
                const key = `${Math.round(vx * 500)},${Math.round(vy * 500)},${Math.round(vz * 500)}`;
                let scale = cache.get(key);
                if (scale === undefined) {
                    const h = Math.sin(vx * 12.9898 + vy * 78.233 + vz * 37.719) * 43758.5453;
                    const frac = h - Math.floor(h);
                    scale = 0.78 + frac * 0.44;
                    cache.set(key, scale);
                }
                pos.setXYZ(i, vx * scale, vy * scale, vz * scale);
            }
            geom.computeVertexNormals();
            return geom;
        }

        return {
            tr,
            playAudio,
            unlockAudio,
            setHud,
            initCanvas,
            initRenderer,
            createOverlay,
            projectToScreen,
            createInput,
            createStarfield,
            createParticleSystem,
            disposeThree,
            buildFighterMesh,
            createProceduralAsteroidGeo
        };
    }

    // =========================================================================
    // 1. three-void-interceptor (Story Ch.6! chapterTarget=1200)
    // =========================================================================
    global.COSMIC_GAME_ENGINES['three-void-interceptor'] = function mountVoidInterceptor(ctx) {
        const THREE = global.THREE;
        const h = createRuntimeHelpers(ctx);
        const canvas = h.initCanvas();
        const renderer = h.initRenderer(canvas);
        const overlay = h.createOverlay();
        const input = h.createInput(canvas);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x040711);
        scene.fog = new THREE.FogExp2(0x050918, 0.013);

        const camera = new THREE.PerspectiveCamera(64, STAGE_W / STAGE_H, 0.1, 220);
        camera.position.set(0, 1.85, 10.5);
        camera.lookAt(0, 0.3, -24);

        scene.add(new THREE.AmbientLight(0x8bb8ff, 0.85));
        const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
        keyLight.position.set(5, 10, 12);
        scene.add(keyLight);
        const rimLight = new THREE.PointLight(0xa78bfa, 2.2, 60);
        rimLight.position.set(-6, -4, 4);
        scene.add(rimLight);

        const starfield = h.createStarfield(THREE, 750, 26, 18, -145, 16);
        scene.add(starfield.points);

        const particles = h.createParticleSystem(THREE, scene, 150);

        // Glowing Neon Cyan Tunnel Corridor Rings
        const tunnelRings = [];
        const ringGeo = new THREE.TorusGeometry(9.6, 0.08, 6, 8);
        const ringMatCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72 });
        const ringMatViolet = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.45 });
        const ringSpacing = 10.5;
        const ringCount = 15;
        for (let i = 0; i < ringCount; i++) {
            const ring = new THREE.Mesh(ringGeo, i % 2 === 0 ? ringMatCyan : ringMatViolet);
            ring.position.z = 8 - i * ringSpacing;
            ring.rotation.z = Math.PI / 8 + i * 0.08;
            scene.add(ring);
            tunnelRings.push(ring);
        }

        // Player Fighter
        const playerShip = h.buildFighterMesh(THREE, 0x38bdf8, 0x0f172a);
        const playerMesh = playerShip.group;
        playerMesh.position.set(0, -0.4, 3.8);
        scene.add(playerMesh);

        const shieldAura = new THREE.Mesh(
            new THREE.TorusGeometry(1.75, 0.05, 8, 28),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
        );
        playerMesh.add(shieldAura);

        // Shared projectile & obstacle geometries/materials
        const boltGeo = new THREE.BoxGeometry(0.14, 0.14, 1.6);
        const boltMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });

        const droneGeo = new THREE.OctahedronGeometry(0.95, 0);
        const droneEdgeGeo = new THREE.EdgesGeometry(droneGeo);
        const droneMat = new THREE.MeshStandardMaterial({
            color: 0x9f1239,
            emissive: 0xfb7185,
            emissiveIntensity: 0.55,
            roughness: 0.3,
            metalness: 0.4
        });
        const droneWireMat = new THREE.LineBasicMaterial({ color: 0xfda4af });

        const asteroidGeo = h.createProceduralAsteroidGeo(THREE, 1.28);
        const asteroidMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            emissive: 0x7c2d12,
            emissiveIntensity: 0.32,
            roughness: 0.85,
            flatShading: true
        });

        const warpGeo = new THREE.SphereGeometry(0.62, 16, 16);
        const warpMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        const warpHaloGeo = new THREE.TorusGeometry(0.95, 0.06, 8, 24);
        const warpHaloMat = new THREE.MeshBasicMaterial({ color: 0xa5f3fc });

        const bolts = [];
        const enemies = [];
        const warps = [];

        const isStory = Boolean(ctx.chapterId || ctx.chapterTarget);
        const storyTarget = ctx.chapterTarget || 1200;

        let score = 0;
        let level = 1;
        let lives = 3;
        let mult = 1;
        let multTimer = 0;
        let elapsed = 0;
        let invulnTimer = 0;
        let fireCd = 0;
        let spawnTimer = 1.2;
        let warpSpawnTimer = 2.6;
        let shakeMag = 0;
        let destroyed = false;
        let ended = false;
        let rafId = 0;
        let lastTime = performance.now();
        let hudTimer = 0;
        const tmpVec = new THREE.Vector3();

        const pState = { x: 0, y: -0.4, vx: 0, vy: 0 };

        function syncHud(force) {
            if (!force && hudTimer > 0) return;
            hudTimer = 0.09;
            const objText = isStory
                ? h.tr(`Hedef: ${storyTarget} Skor (Bölüm 6)`, `Target: ${storyTarget} Score (Ch.6)`)
                : h.tr(`Çarpan: x${mult} · Akın ${level}`, `Mult: x${mult} · Wave ${level}`);
            const stText = mult > 1
                ? h.tr(`Çarpım x${mult} Aktif!`, `Warp Multiplier x${mult}!`)
                : h.tr('Plazma Topları Hazır', 'Plasma Cannons Ready');
            h.setHud({
                score: Math.floor(score),
                level,
                maxLevel: isStory ? 1 : 99,
                lives,
                statusText: stText,
                objectiveText: objText
            });
        }

        function spawnBoltPair() {
            for (const offset of [-0.62, 0.62]) {
                const m = new THREE.Mesh(boltGeo, boltMat);
                m.position.set(pState.x + offset, pState.y, 2.4);
                scene.add(m);
                bolts.push({ mesh: m });
            }
            h.playAudio('shootLaser', 0.14);
        }

        function spawnEnemy(kind) {
            const g = new THREE.Group();
            let hp = 1;
            let radius = 1.05;
            if (kind === 'drone') {
                const body = new THREE.Mesh(droneGeo, droneMat);
                const wire = new THREE.LineSegments(droneEdgeGeo, droneWireMat);
                g.add(body);
                g.add(wire);
                hp = level >= 3 ? 2 : 1;
                radius = 1.05;
            } else {
                const rock = new THREE.Mesh(asteroidGeo, asteroidMat);
                g.add(rock);
                hp = 2 + Math.floor(level / 3);
                radius = 1.32;
            }
            const x = (Math.random() - 0.5) * 10.6;
            const y = (Math.random() - 0.5) * 6.4;
            g.position.set(x, y, -128);
            scene.add(g);
            enemies.push({
                mesh: g,
                kind,
                hp,
                maxHp: hp,
                radius,
                baseX: x,
                phase: Math.random() * TAU,
                weaveAmp: kind === 'drone' ? (0.9 + Math.random() * 1.1) : 0,
                speed: (kind === 'drone' ? 28 : 24) + level * 2.5
            });
        }

        function spawnWarpSphere() {
            const g = new THREE.Group();
            g.add(new THREE.Mesh(warpGeo, warpMat));
            const halo = new THREE.Mesh(warpHaloGeo, warpHaloMat);
            g.add(halo);
            g.position.set((Math.random() - 0.5) * 9.5, (Math.random() - 0.5) * 5.6, -128);
            scene.add(g);
            warps.push({ mesh: g, halo, speed: 26 + level * 2 });
        }

        function triggerWin() {
            if (ended) return;
            ended = true;
            h.playAudio('levelup');
            const stars = lives >= 3 ? 3 : (lives === 2 ? 2 : 1);
            syncHud(true);
            try {
                ctx.onWin?.({ score: Math.floor(score), level, stars });
            } catch (e) { /* safe ignore */ }
        }

        function triggerGameOver() {
            if (ended) return;
            ended = true;
            h.playAudio('explodeBoss');
            syncHud(true);
            try {
                ctx.onGameOver?.({
                    score: Math.floor(score),
                    level,
                    stars: 0,
                    reason: h.tr('Kalkan bütünlüğü tünelde çöktü.', 'Shield integrity collapsed in the void corridor.')
                });
            } catch (e) { /* safe ignore */ }
        }

        function addScore(pts, worldPos, label, color) {
            score += pts;
            if (worldPos) {
                const scr = h.projectToScreen(worldPos, camera, tmpVec);
                if (scr.visible) {
                    overlay.spawnPopup(scr.x, scr.y, label || `+${pts}`, color || '#38bdf8');
                }
            }
            if (isStory && score >= storyTarget) {
                triggerWin();
            } else if (!isStory) {
                const nextLv = 1 + Math.floor(score / 600);
                if (nextLv > level) {
                    level = nextLv;
                    h.playAudio('levelup');
                    overlay.spawnPopup(STAGE_W * 0.5, 110, h.tr(`SEVİYE ${level}`, `WAVE ${level}`), '#fbbf24', 1.25);
                }
            }
        }

        function damagePlayer() {
            if (invulnTimer > 0 || ended) return;
            lives -= 1;
            mult = 1;
            multTimer = 0;
            invulnTimer = 1.35;
            shakeMag = 0.55;
            overlay.flashDamage('rgba(251,113,133,0.9)');
            overlay.spawnPopup(STAGE_W * 0.5, STAGE_H * 0.45, h.tr('KALKAN HASARI!', 'SHIELD HIT!'), '#fb7185', 1.15);
            particles.spawn(pState.x, pState.y, 3.5, 0xfb7185, 16, 8);
            if (lives <= 0) {
                lives = 0;
                triggerGameOver();
            } else {
                h.playAudio('playerHurt');
            }
            syncHud(true);
        }

        function resetGame(startLevel) {
            bolts.forEach((b) => scene.remove(b.mesh));
            enemies.forEach((e) => scene.remove(e.mesh));
            warps.forEach((w) => scene.remove(w.mesh));
            bolts.length = 0;
            enemies.length = 0;
            warps.length = 0;
            particles.clear();
            overlay.clearPopups();

            score = 0;
            level = Math.max(1, Number(startLevel) || 1);
            lives = 3;
            mult = 1;
            multTimer = 0;
            elapsed = 0;
            invulnTimer = 0;
            fireCd = 0.1;
            spawnTimer = 1.1;
            warpSpawnTimer = 2.4;
            shakeMag = 0;
            ended = false;
            pState.x = 0;
            pState.y = -0.4;
            pState.vx = 0;
            pState.vy = 0;
            playerMesh.position.set(0, -0.4, 3.8);
            playerMesh.visible = true;
            overlay.setHint(h.tr('WASD / Oklar / Fare ile uç · Space / Otomatik plazma ateşle · Mavi küreleri topla', 'Steer: WASD / Arrows / Mouse · Fire: Space / Auto · Collect Cyan Warp Spheres'));
            syncHud(true);
        }

        function step(dt) {
            elapsed += dt;
            hudTimer -= dt;
            if (invulnTimer > 0) invulnTimer -= dt;
            if (shakeMag > 0) shakeMag = Math.max(0, shakeMag - dt * 1.9);

            if (multTimer > 0) {
                multTimer -= dt;
                if (multTimer <= 0) mult = 1;
            }

            // Player movement (WASD/Arrows or pointer target)
            let mx = 0;
            let my = 0;
            if (input.hasKey('KeyA', 'ArrowLeft', 'a')) mx -= 1;
            if (input.hasKey('KeyD', 'ArrowRight', 'd')) mx += 1;
            if (input.hasKey('KeyW', 'ArrowUp', 'w')) my += 1;
            if (input.hasKey('KeyS', 'ArrowDown', 's')) my -= 1;

            if (mx !== 0 || my !== 0) {
                const len = Math.hypot(mx, my) || 1;
                pState.vx = lerp(pState.vx, (mx / len) * 11.5, clamp(dt * 12, 0, 1));
                pState.vy = lerp(pState.vy, (my / len) * 8.5, clamp(dt * 12, 0, 1));
            } else if (input.pointer.active) {
                const tx = input.pointer.nx * 5.6;
                const ty = -input.pointer.ny * 3.6;
                pState.vx = lerp(pState.vx, clamp((tx - pState.x) * 6.5, -12, 12), clamp(dt * 10, 0, 1));
                pState.vy = lerp(pState.vy, clamp((ty - pState.y) * 6.5, -9, 9), clamp(dt * 10, 0, 1));
            } else {
                pState.vx *= Math.pow(0.02, dt);
                pState.vy *= Math.pow(0.02, dt);
            }

            pState.x = clamp(pState.x + pState.vx * dt, -5.8, 5.8);
            pState.y = clamp(pState.y + pState.vy * dt, -3.7, 3.7);

            playerMesh.position.x = pState.x;
            playerMesh.position.y = pState.y;
            playerMesh.rotation.z = lerp(playerMesh.rotation.z, -pState.vx * 0.048, clamp(dt * 12, 0, 1));
            playerMesh.rotation.x = lerp(playerMesh.rotation.x, pState.vy * 0.04, clamp(dt * 12, 0, 1));
            playerMesh.visible = invulnTimer <= 0 || Math.floor(invulnTimer * 18) % 2 === 0;
            shieldAura.rotation.z += dt * 1.8;
            shieldAura.material.opacity = invulnTimer > 0 ? 0.65 : (0.18 + mult * 0.06);

            // Thruster pulse
            const thrScale = 0.85 + Math.sin(elapsed * 28) * 0.25 + (mult > 1 ? 0.3 : 0);
            playerShip.thrusters[0].scale.set(1, thrScale, 1);
            playerShip.thrusters[1].scale.set(1, thrScale, 1);

            // Auto-fire + Space/Mouse boost fire
            fireCd -= dt;
            const manualFire = input.hasKey('Space', ' ') || input.pointer.down;
            const fireInterval = manualFire ? 0.14 : 0.21;
            if (fireCd <= 0) {
                fireCd = fireInterval;
                spawnBoltPair();
            }

            // Tunnel scrolling speed
            const tunnelSpeed = 28 + level * 3.5 + (mult - 1) * 4;
            starfield.scroll(tunnelSpeed * 1.45, dt);
            for (let i = 0; i < tunnelRings.length; i++) {
                const r = tunnelRings[i];
                r.position.z += tunnelSpeed * dt;
                r.rotation.z += dt * (i % 2 === 0 ? 0.35 : -0.35);
                if (r.position.z > 11) {
                    r.position.z -= ringCount * ringSpacing;
                }
            }

            // Spawning (forgiving first 3.5 seconds)
            spawnTimer -= dt;
            if (spawnTimer <= 0) {
                const grace = elapsed < 3.5;
                spawnEnemy(grace ? 'drone' : (Math.random() < 0.65 ? 'drone' : 'asteroid'));
                const baseInterval = grace ? 1.15 : Math.max(0.38, 0.92 - level * 0.07);
                spawnTimer = baseInterval * (0.8 + Math.random() * 0.4);
            }

            warpSpawnTimer -= dt;
            if (warpSpawnTimer <= 0) {
                spawnWarpSphere();
                warpSpawnTimer = 3.8 + Math.random() * 1.8;
            }

            // Update bolts
            for (let i = bolts.length - 1; i >= 0; i--) {
                const b = bolts[i];
                b.mesh.position.z -= 95 * dt;
                if (b.mesh.position.z < -135) {
                    scene.remove(b.mesh);
                    bolts.splice(i, 1);
                }
            }

            // Update enemies & collisions
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                e.mesh.position.z += e.speed * dt;
                if (e.kind === 'drone') {
                    e.phase += dt * 2.4;
                    e.mesh.position.x = clamp(e.baseX + Math.sin(e.phase) * e.weaveAmp, -5.6, 5.6);
                    e.mesh.rotation.y += dt * 3.1;
                    e.mesh.rotation.x += dt * 1.7;
                } else {
                    e.mesh.rotation.x += dt * 1.3;
                    e.mesh.rotation.y += dt * 1.9;
                }

                // Bolt hits
                let destroyedEnemy = false;
                for (let j = bolts.length - 1; j >= 0; j--) {
                    const b = bolts[j];
                    const dz = Math.abs(b.mesh.position.z - e.mesh.position.z);
                    if (dz < 2.2) {
                        const dx = b.mesh.position.x - e.mesh.position.x;
                        const dy = b.mesh.position.y - e.mesh.position.y;
                        if (dx * dx + dy * dy < (e.radius + 0.45) * (e.radius + 0.45)) {
                            scene.remove(b.mesh);
                            bolts.splice(j, 1);
                            e.hp -= 1;
                            if (e.hp <= 0) {
                                const pts = (e.kind === 'drone' ? 100 : 120) * mult;
                                particles.spawn(e.mesh.position.x, e.mesh.position.y, e.mesh.position.z, e.kind === 'drone' ? 0xfb7185 : 0xf59e0b, 12, 9);
                                h.playAudio('explodeSmall', 0.18);
                                addScore(pts, e.mesh.position, `+${pts}${mult > 1 ? ` x${mult}` : ''}`, '#38bdf8');
                                scene.remove(e.mesh);
                                enemies.splice(i, 1);
                                destroyedEnemy = true;
                                break;
                            } else {
                                particles.spawn(b.mesh.position.x, b.mesh.position.y, b.mesh.position.z, 0x67e8f9, 4, 5);
                                h.playAudio('hitMetal', 0.12);
                            }
                        }
                    }
                }
                if (destroyedEnemy || ended) continue;

                // Player collision check
                if (Math.abs(e.mesh.position.z - playerMesh.position.z) < 1.35) {
                    const dx = e.mesh.position.x - pState.x;
                    const dy = e.mesh.position.y - pState.y;
                    if (dx * dx + dy * dy < (e.radius + 0.62) * (e.radius + 0.62)) {
                        scene.remove(e.mesh);
                        enemies.splice(i, 1);
                        damagePlayer();
                        if (ended) break;
                        continue;
                    }
                }

                if (e.mesh.position.z > 11) {
                    scene.remove(e.mesh);
                    enemies.splice(i, 1);
                }
            }

            // Update warp spheres
            for (let i = warps.length - 1; i >= 0; i--) {
                const w = warps[i];
                w.mesh.position.z += w.speed * dt;
                w.halo.rotation.x += dt * 3.5;
                w.halo.rotation.y += dt * 2.5;

                if (Math.abs(w.mesh.position.z - playerMesh.position.z) < 1.6) {
                    const dx = w.mesh.position.x - pState.x;
                    const dy = w.mesh.position.y - pState.y;
                    if (dx * dx + dy * dy < 1.85 * 1.85) {
                        mult = Math.min(5, mult + 1);
                        multTimer = 8.0;
                        h.playAudio('powerup');
                        particles.spawn(w.mesh.position.x, w.mesh.position.y, w.mesh.position.z, 0x22d3ee, 14, 7);
                        addScore(150 * mult, w.mesh.position, `WARP x${mult}! +${150 * mult}`, '#22d3ee');
                        scene.remove(w.mesh);
                        warps.splice(i, 1);
                        if (ended) break;
                        continue;
                    }
                }

                if (w.mesh.position.z > 11) {
                    scene.remove(w.mesh);
                    warps.splice(i, 1);
                }
            }

            // Camera gentle follow + shake
            const sx = (Math.random() - 0.5) * shakeMag;
            const sy = (Math.random() - 0.5) * shakeMag;
            camera.position.x = lerp(camera.position.x, pState.x * 0.36, clamp(dt * 6, 0, 1)) + sx;
            camera.position.y = lerp(camera.position.y, 1.85 + pState.y * 0.28, clamp(dt * 6, 0, 1)) + sy;
            camera.lookAt(pState.x * 0.15, pState.y * 0.1, -26);

            particles.update(dt);
            overlay.update(dt);
            syncHud(false);
        }

        function loop(now) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
            lastTime = now;

            const paused = typeof ctx.getPaused === 'function' ? ctx.getPaused() : false;
            if (!paused && !ended) {
                step(dt);
            } else {
                overlay.update(0);
            }
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(loop);
        }

        resetGame(1);
        rafId = requestAnimationFrame(loop);

        return {
            restart(lvl) {
                resetGame(lvl);
            },
            destroy() {
                destroyed = true;
                cancelAnimationFrame(rafId);
                input.destroy();
                overlay.destroy();
                particles.dispose();
                ringGeo.dispose();
                ringMatCyan.dispose();
                ringMatViolet.dispose();
                boltGeo.dispose();
                boltMat.dispose();
                droneGeo.dispose();
                droneEdgeGeo.dispose();
                droneMat.dispose();
                droneWireMat.dispose();
                asteroidGeo.dispose();
                asteroidMat.dispose();
                warpGeo.dispose();
                warpMat.dispose();
                warpHaloGeo.dispose();
                warpHaloMat.dispose();
                h.disposeThree(scene, renderer);
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 2. three-star-slalom
    // =========================================================================
    global.COSMIC_GAME_ENGINES['three-star-slalom'] = function mountStarSlalom(ctx) {
        const THREE = global.THREE;
        const h = createRuntimeHelpers(ctx);
        const canvas = h.initCanvas();
        const renderer = h.initRenderer(canvas);
        const overlay = h.createOverlay();
        const input = h.createInput(canvas);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060414);
        scene.fog = new THREE.FogExp2(0x0b0722, 0.012);

        const camera = new THREE.PerspectiveCamera(62, STAGE_W / STAGE_H, 0.1, 220);
        camera.position.set(0, 2.1, 10.5);
        camera.lookAt(0, 0.2, -25);

        scene.add(new THREE.AmbientLight(0xa5b4fc, 0.9));
        const sun = new THREE.DirectionalLight(0xfbbf24, 1.5);
        sun.position.set(8, 12, 10);
        scene.add(sun);
        const nebulaLight = new THREE.PointLight(0x38bdf8, 2.2, 70);
        nebulaLight.position.set(-7, -3, 2);
        scene.add(nebulaLight);

        const starfield = h.createStarfield(THREE, 900, 30, 20, -155, 16);
        scene.add(starfield.points);
        const particles = h.createParticleSystem(THREE, scene, 150);

        // Warp speed streak lines
        const streakCount = 48;
        const streakPos = new Float32Array(streakCount * 6);
        const streakData = [];
        for (let i = 0; i < streakCount; i++) {
            const ang = (i / streakCount) * TAU + Math.random() * 0.2;
            const rad = 7.5 + Math.random() * 8;
            const z = -140 + Math.random() * 150;
            streakData.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad, z });
        }
        const streakGeo = new THREE.BufferGeometry();
        streakGeo.setAttribute('position', new THREE.Float32BufferAttribute(streakPos, 3));
        const streakMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
        const streaks = new THREE.LineSegments(streakGeo, streakMat);
        scene.add(streaks);

        // Player Racer Ship
        const racerShip = h.buildFighterMesh(THREE, 0xa78bfa, 0x1e1b4b);
        const playerMesh = racerShip.group;
        playerMesh.position.set(0, 0, 3.6);
        scene.add(playerMesh);

        // Gate & Meteor Shared Geometries
        const gateGeo = new THREE.TorusGeometry(2.65, 0.17, 12, 32);
        const gateCoreGeo = new THREE.RingGeometry(0.1, 2.45, 28);
        const goldGateMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xfbbf24,
            emissiveIntensity: 0.8,
            metalness: 0.4,
            roughness: 0.25
        });
        const cyanGateMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x22d3ee,
            emissiveIntensity: 0.8,
            metalness: 0.4,
            roughness: 0.25
        });
        const gateInnerGoldMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.14, side: THREE.DoubleSide });
        const gateInnerCyanMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.14, side: THREE.DoubleSide });

        const meteorGeos = [
            h.createProceduralAsteroidGeo(THREE, 1.3),
            h.createProceduralAsteroidGeo(THREE, 1.65),
            h.createProceduralAsteroidGeo(THREE, 1.05)
        ];
        const meteorMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            emissive: 0x881337,
            emissiveIntensity: 0.35,
            roughness: 0.85,
            flatShading: true
        });

        const gates = [];
        const meteors = [];

        const isStory = Boolean(ctx.chapterId || ctx.chapterTarget);
        const storyTarget = ctx.chapterTarget || 2500;

        let score = 0;
        let level = 1;
        let lives = 3;
        let combo = 1;
        let gatesPassed = 0;
        let warpBoost = 0;
        let barrelTimer = 0;
        let barrelCd = 0;
        let invulnTimer = 0;
        let shakeMag = 0;
        let elapsed = 0;
        let gateSpawnTimer = 1.0;
        let meteorSpawnTimer = 1.6;
        let destroyed = false;
        let ended = false;
        let rafId = 0;
        let lastTime = performance.now();
        let hudTimer = 0;
        const tmpVec = new THREE.Vector3();

        const pState = { x: 0, y: 0, vx: 0, vy: 0 };

        function syncHud(force) {
            if (!force && hudTimer > 0) return;
            hudTimer = 0.09;
            const boostTxt = warpBoost > 0
                ? h.tr(`WARP HIZI x${combo}!`, `WARP STREAK x${combo}!`)
                : (barrelCd > 0
                    ? h.tr(`Fıçı Yuvarlama: ${barrelCd.toFixed(1)}s`, `Barrel Roll CD: ${barrelCd.toFixed(1)}s`)
                    : h.tr('[Space] Fıçı Kaçış Hazır', '[Space] Barrel Dodge Ready'));
            h.setHud({
                score: Math.floor(score),
                level,
                maxLevel: 99,
                lives,
                statusText: boostTxt,
                objectiveText: h.tr(`Geçitler: ${gatesPassed} · Kombo x${combo}`, `Gates: ${gatesPassed} · Combo x${combo}`)
            });
        }

        function spawnGate(xOverride, yOverride) {
            const isGold = gates.length % 2 === 0;
            const g = new THREE.Group();
            const torus = new THREE.Mesh(gateGeo, isGold ? goldGateMat : cyanGateMat);
            const inner = new THREE.Mesh(gateCoreGeo, isGold ? gateInnerGoldMat : gateInnerCyanMat);
            g.add(torus);
            g.add(inner);
            const gx = xOverride !== undefined ? xOverride : (Math.random() - 0.5) * 8.6;
            const gy = yOverride !== undefined ? yOverride : (Math.random() - 0.5) * 4.6;
            g.position.set(gx, gy, -140);
            scene.add(g);
            gates.push({ mesh: g, isGold, passed: false, missed: false });
        }

        function spawnMeteor(avoidX, avoidY) {
            const idx = Math.floor(Math.random() * meteorGeos.length);
            const rad = [1.3, 1.65, 1.05][idx];
            const m = new THREE.Mesh(meteorGeos[idx], meteorMat);
            let mx = (Math.random() - 0.5) * 12.2;
            let my = (Math.random() - 0.5) * 7.2;
            if (avoidX !== undefined && Math.hypot(mx - avoidX, my - avoidY) < 3.4) {
                mx = clamp(mx + (mx >= 0 ? -4.2 : 4.2), -6.2, 6.2);
            }
            m.position.set(mx, my, -142);
            scene.add(m);
            meteors.push({
                mesh: m,
                radius: rad * 0.92,
                grazed: false,
                rx: (Math.random() - 0.5) * 3.2,
                ry: (Math.random() - 0.5) * 3.2
            });
        }

        function triggerGameOver() {
            if (ended) return;
            ended = true;
            h.playAudio('explodeBoss');
            syncHud(true);
            try {
                ctx.onGameOver?.({
                    score: Math.floor(score),
                    level,
                    stars: 0,
                    reason: h.tr('Gövde meteor çarpışmasında parçalandı.', 'Hull integrity shattered in the meteor belt.')
                });
            } catch (e) { /* safe ignore */ }
        }

        function damagePlayer() {
            if (invulnTimer > 0 || barrelTimer > 0 || ended) return;
            lives -= 1;
            combo = 1;
            warpBoost = 0;
            invulnTimer = 1.3;
            shakeMag = 0.6;
            overlay.flashDamage('rgba(251,113,133,0.92)');
            overlay.spawnPopup(STAGE_W * 0.5, STAGE_H * 0.45, h.tr('GÖVDE HASARI!', 'HULL IMPACT!'), '#fb7185', 1.2);
            particles.spawn(pState.x, pState.y, 3.6, 0xfb7185, 18, 9);
            if (lives <= 0) {
                lives = 0;
                triggerGameOver();
            } else {
                h.playAudio('playerHurt');
            }
            syncHud(true);
        }

        function resetGame(startLevel) {
            gates.forEach((g) => scene.remove(g.mesh));
            meteors.forEach((m) => scene.remove(m.mesh));
            gates.length = 0;
            meteors.length = 0;
            particles.clear();
            overlay.clearPopups();

            score = 0;
            level = Math.max(1, Number(startLevel) || 1);
            lives = 3;
            combo = 1;
            gatesPassed = 0;
            warpBoost = 0;
            barrelTimer = 0;
            barrelCd = 0;
            invulnTimer = 0;
            shakeMag = 0;
            elapsed = 0;
            gateSpawnTimer = 0.7;
            meteorSpawnTimer = 2.0;
            ended = false;
            pState.x = 0;
            pState.y = 0;
            pState.vx = 0;
            pState.vy = 0;
            playerMesh.position.set(0, 0, 3.6);
            playerMesh.rotation.set(0, 0, 0);
            playerMesh.visible = true;
            camera.fov = 62;
            camera.updateProjectionMatrix();
            overlay.setHint(h.tr('WASD / Oklar / Fare ile süzül · Altın/Mavi Geçitlerden geç · [Space] Fıçı Kaçış', 'Steer: WASD / Arrows / Mouse · Fly through Boost Gates · [Space] Barrel Dodge'));
            syncHud(true);
        }

        function step(dt) {
            elapsed += dt;
            hudTimer -= dt;
            if (invulnTimer > 0) invulnTimer -= dt;
            if (barrelTimer > 0) barrelTimer -= dt;
            if (barrelCd > 0) barrelCd -= dt;
            if (warpBoost > 0) warpBoost = Math.max(0, warpBoost - dt);
            if (shakeMag > 0) shakeMag = Math.max(0, shakeMag - dt * 2.0);

            if ((input.hasKey('Space', ' ') || input.pointer.down) && barrelCd <= 0 && barrelTimer <= 0) {
                barrelTimer = 0.34;
                barrelCd = 2.1;
                h.playAudio('dash');
                particles.spawn(pState.x, pState.y, 3.8, 0xa78bfa, 10, 6);
            }

            let mx = 0;
            let my = 0;
            if (input.hasKey('KeyA', 'ArrowLeft', 'a')) mx -= 1;
            if (input.hasKey('KeyD', 'ArrowRight', 'd')) mx += 1;
            if (input.hasKey('KeyW', 'ArrowUp', 'w')) my += 1;
            if (input.hasKey('KeyS', 'ArrowDown', 's')) my -= 1;

            if (mx !== 0 || my !== 0) {
                const len = Math.hypot(mx, my) || 1;
                pState.vx = lerp(pState.vx, (mx / len) * 13.0, clamp(dt * 12, 0, 1));
                pState.vy = lerp(pState.vy, (my / len) * 9.5, clamp(dt * 12, 0, 1));
            } else if (input.pointer.active) {
                const tx = input.pointer.nx * 6.0;
                const ty = -input.pointer.ny * 3.6;
                pState.vx = lerp(pState.vx, clamp((tx - pState.x) * 7.2, -13.5, 13.5), clamp(dt * 11, 0, 1));
                pState.vy = lerp(pState.vy, clamp((ty - pState.y) * 7.2, -9.5, 9.5), clamp(dt * 11, 0, 1));
            } else {
                pState.vx *= Math.pow(0.02, dt);
                pState.vy *= Math.pow(0.02, dt);
            }

            pState.x = clamp(pState.x + pState.vx * dt, -6.2, 6.2);
            pState.y = clamp(pState.y + pState.vy * dt, -3.7, 3.7);
            playerMesh.position.x = pState.x;
            playerMesh.position.y = pState.y;

            if (barrelTimer > 0) {
                playerMesh.rotation.z += dt * 18.5;
            } else {
                playerMesh.rotation.z = lerp(playerMesh.rotation.z, -pState.vx * 0.055, clamp(dt * 12, 0, 1));
            }
            playerMesh.rotation.x = lerp(playerMesh.rotation.x, pState.vy * 0.045, clamp(dt * 12, 0, 1));
            playerMesh.visible = invulnTimer <= 0 || Math.floor(invulnTimer * 18) % 2 === 0;

            const thr = 0.9 + Math.sin(elapsed * 30) * 0.2 + (warpBoost > 0 ? 0.5 : 0);
            racerShip.thrusters[0].scale.set(1, thr, 1);
            racerShip.thrusters[1].scale.set(1, thr, 1);

            const forwardSpeed = 28 + Math.min(34, level * 3.2) + (warpBoost > 0 ? 15 : 0);
            score += forwardSpeed * 0.45 * dt;

            // Dynamic warp FOV
            const targetFov = warpBoost > 0 ? 75 : 62 + Math.min(6, level * 0.6);
            if (Math.abs(camera.fov - targetFov) > 0.1) {
                camera.fov = lerp(camera.fov, targetFov, clamp(dt * 6, 0, 1));
                camera.updateProjectionMatrix();
            }

            starfield.scroll(forwardSpeed * 1.4, dt);

            // Speed streaks
            const streakLen = 2.0 + (warpBoost > 0 ? 5.5 : level * 0.35);
            streakMat.opacity = warpBoost > 0 ? 0.82 : 0.32;
            const sArr = streakGeo.attributes.position.array;
            for (let i = 0; i < streakCount; i++) {
                const st = streakData[i];
                st.z += forwardSpeed * 1.8 * dt;
                if (st.z > 14) st.z = -145;
                const idx = i * 6;
                sArr[idx] = st.x;
                sArr[idx + 1] = st.y;
                sArr[idx + 2] = st.z;
                sArr[idx + 3] = st.x;
                sArr[idx + 4] = st.y;
                sArr[idx + 5] = st.z + streakLen;
            }
            streakGeo.attributes.position.needsUpdate = true;

            // Spawn gates and meteors
            gateSpawnTimer -= dt;
            if (gateSpawnTimer <= 0) {
                if (elapsed < 3.5) {
                    spawnGate((Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 2.2);
                    gateSpawnTimer = 1.65;
                } else {
                    spawnGate();
                    gateSpawnTimer = Math.max(0.85, 1.55 - level * 0.06);
                }
            }

            meteorSpawnTimer -= dt;
            if (meteorSpawnTimer <= 0) {
                const latestGate = gates[gates.length - 1];
                const avoidX = latestGate ? latestGate.mesh.position.x : 0;
                const avoidY = latestGate ? latestGate.mesh.position.y : 0;
                const burst = elapsed > 6 && level >= 3 ? 2 : 1;
                for (let b = 0; b < burst; b++) {
                    spawnMeteor(avoidX, avoidY);
                }
                meteorSpawnTimer = elapsed < 3.5 ? 1.4 : Math.max(0.28, 0.72 - level * 0.045);
            }

            // Update gates
            for (let i = gates.length - 1; i >= 0; i--) {
                const g = gates[i];
                const prevZ = g.mesh.position.z;
                g.mesh.position.z += forwardSpeed * dt;
                g.mesh.rotation.z += dt * (g.isGold ? 1.1 : -1.1);

                if (!g.passed && !g.missed && prevZ <= playerMesh.position.z && g.mesh.position.z >= playerMesh.position.z) {
                    const dist = Math.hypot(g.mesh.position.x - pState.x, g.mesh.position.y - pState.y);
                    if (dist <= 2.58) {
                        g.passed = true;
                        gatesPassed += 1;
                        combo = Math.min(5, combo + 1);
                        warpBoost = 2.4;
                        const pts = 150 * combo;
                        score += pts;
                        level = 1 + Math.floor(gatesPassed / 4);
                        h.playAudio('powerup');
                        particles.spawn(pState.x, pState.y, 2.5, g.isGold ? 0xfbbf24 : 0x38bdf8, 16, 9);
                        const scr = h.projectToScreen(playerMesh.position, camera, tmpVec);
                        overlay.spawnPopup(scr.x, scr.y - 30, `+${pts} WARP x${combo}!`, g.isGold ? '#fbbf24' : '#38bdf8', 1.12);
                        if (isStory && score >= storyTarget && !ended) {
                            ended = true;
                            h.playAudio('levelup');
                            ctx.onWin?.({ score: Math.floor(score), level, stars: lives >= 3 ? 3 : 2 });
                            return;
                        }
                    } else {
                        g.missed = true;
                        if (combo > 1) combo = 1;
                    }
                }

                if (g.mesh.position.z > 12) {
                    scene.remove(g.mesh);
                    gates.splice(i, 1);
                }
            }

            // Update meteors
            for (let i = meteors.length - 1; i >= 0; i--) {
                const m = meteors[i];
                m.mesh.position.z += forwardSpeed * 1.06 * dt;
                m.mesh.rotation.x += m.rx * dt;
                m.mesh.rotation.y += m.ry * dt;

                if (Math.abs(m.mesh.position.z - playerMesh.position.z) < 1.35) {
                    const dist = Math.hypot(m.mesh.position.x - pState.x, m.mesh.position.y - pState.y);
                    if (dist < m.radius + 0.56) {
                        scene.remove(m.mesh);
                        meteors.splice(i, 1);
                        damagePlayer();
                        if (ended) break;
                        continue;
                    } else if (!m.grazed && dist < m.radius + 1.45) {
                        m.grazed = true;
                        score += 35;
                        const scr = h.projectToScreen(playerMesh.position, camera, tmpVec);
                        overlay.spawnPopup(scr.x, scr.y - 20, h.tr('SIYIRMA +35', 'GRAZE +35'), '#a78bfa');
                    }
                }

                if (m.mesh.position.z > 12) {
                    scene.remove(m.mesh);
                    meteors.splice(i, 1);
                }
            }

            const sx = (Math.random() - 0.5) * shakeMag;
            const sy = (Math.random() - 0.5) * shakeMag;
            camera.position.x = lerp(camera.position.x, pState.x * 0.42, clamp(dt * 7, 0, 1)) + sx;
            camera.position.y = lerp(camera.position.y, 2.0 + pState.y * 0.34, clamp(dt * 7, 0, 1)) + sy;
            camera.lookAt(pState.x * 0.2, pState.y * 0.14, -26);

            particles.update(dt);
            overlay.update(dt);
            syncHud(false);
        }

        function loop(now) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
            lastTime = now;

            const paused = typeof ctx.getPaused === 'function' ? ctx.getPaused() : false;
            if (!paused && !ended) {
                step(dt);
            } else {
                overlay.update(0);
            }
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(loop);
        }

        resetGame(1);
        rafId = requestAnimationFrame(loop);

        return {
            restart(lvl) {
                resetGame(lvl);
            },
            destroy() {
                destroyed = true;
                cancelAnimationFrame(rafId);
                input.destroy();
                overlay.destroy();
                particles.dispose();
                streakGeo.dispose();
                streakMat.dispose();
                gateGeo.dispose();
                gateCoreGeo.dispose();
                goldGateMat.dispose();
                cyanGateMat.dispose();
                gateInnerGoldMat.dispose();
                gateInnerCyanMat.dispose();
                meteorGeos.forEach((g) => g.dispose());
                meteorMat.dispose();
                h.disposeThree(scene, renderer);
                if (canvas.parentNode) canvas.remove();
            }
        };
    };

    // =========================================================================
    // 3. helix-station-drop
    // =========================================================================
    global.COSMIC_GAME_ENGINES['helix-station-drop'] = function mountHelixDrop(ctx) {
        const THREE = global.THREE;
        const h = createRuntimeHelpers(ctx);
        const canvas = h.initCanvas();
        const renderer = h.initRenderer(canvas);
        const overlay = h.createOverlay();
        const input = h.createInput(canvas);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x040814);
        scene.fog = new THREE.FogExp2(0x040814, 0.015);

        const camera = new THREE.PerspectiveCamera(48, STAGE_W / STAGE_H, 0.1, 160);
        camera.position.set(0, 6.2, 13.8);
        camera.lookAt(0, -1.5, 0);

        scene.add(new THREE.AmbientLight(0x94a3b8, 0.95));
        const topLight = new THREE.DirectionalLight(0x38bdf8, 1.55);
        topLight.position.set(6, 15, 12);
        scene.add(topLight);
        const underLight = new THREE.PointLight(0xa78bfa, 1.8, 50);
        underLight.position.set(-5, -4, 7);
        scene.add(underLight);

        const starfield = h.createStarfield(THREE, 650, 26, 26, -35, 10);
        scene.add(starfield.points);
        const particles = h.createParticleSystem(THREE, scene, 150);

        // Station Tower Group
        const towerGroup = new THREE.Group();
        scene.add(towerGroup);

        // Central Spire Column
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0x0284c7,
            emissiveIntensity: 0.22
        });
        const coreMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.12, 140, 24), coreMat);
        towerGroup.add(coreMesh);

        // Build 12 wedge geometries (extruded annular sector of 30 deg = TAU / 12)
        const SLICES = 12;
        const SLICE_ANG = TAU / SLICES;
        const WEDGE_THICK = 0.56;
        const wedgeGeos = [];
        for (let s = 0; s < SLICES; s++) {
            const a0 = s * SLICE_ANG + 0.03;
            const a1 = (s + 1) * SLICE_ANG - 0.03;
            const shape = new THREE.Shape();
            const rIn = 1.18;
            const rOut = 3.78;
            shape.moveTo(Math.cos(a0) * rIn, Math.sin(a0) * rIn);
            shape.lineTo(Math.cos(a0) * rOut, Math.sin(a0) * rOut);
            shape.absarc(0, 0, rOut, a0, a1, false);
            shape.lineTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn);
            shape.absarc(0, 0, rIn, a1, a0, true);
            const geo = new THREE.ExtrudeGeometry(shape, {
                depth: WEDGE_THICK,
                bevelEnabled: true,
                bevelThickness: 0.04,
                bevelSize: 0.04,
                bevelSegments: 1,
                curveSegments: 6
            });
            wedgeGeos.push(geo);
        }

        const safeMat = new THREE.MeshStandardMaterial({
            color: 0x1e3a5f,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.32,
            metalness: 0.45,
            roughness: 0.3
        });
        const hazardMat = new THREE.MeshStandardMaterial({
            color: 0x881337,
            emissive: 0xfb7185,
            emissiveIntensity: 0.72,
            metalness: 0.35,
            roughness: 0.25
        });
        const boostMat = new THREE.MeshStandardMaterial({
            color: 0x065f46,
            emissive: 0x34d399,
            emissiveIntensity: 0.65,
            metalness: 0.35,
            roughness: 0.25
        });

        // Energy Pod
        const POD_R = 0.46;
        const POD_ORBIT_Z = 2.52;
        const podMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.9,
            roughness: 0.15,
            metalness: 0.2
        });
        const podMesh = new THREE.Mesh(new THREE.SphereGeometry(POD_R, 20, 20), podMat);
        podMesh.position.set(0, 2.2, POD_ORBIT_Z);
        scene.add(podMesh);

        const podLight = new THREE.PointLight(0x38bdf8, 2.0, 14);
        podMesh.add(podLight);

        const RING_STEP = 4.2;
        const rings = [];
        const flyingShards = [];

        let score = 0;
        let level = 1;
        let lives = 3;
        let floorCount = 0;
        let fallStreak = 0;
        let smashMode = false;
        let podY = 2.2;
        let podVy = 0;
        let lowestCamY = 2.2;
        let rotVel = 0;
        let invulnTimer = 0;
        let shakeMag = 0;
        let nextRingIdx = 0;
        let destroyed = false;
        let ended = false;
        let rafId = 0;
        let lastTime = performance.now();
        let hudTimer = 0;
        const tmpVec = new THREE.Vector3();

        function syncHud(force) {
            if (!force && hudTimer > 0) return;
            hudTimer = 0.09;
            const stText = smashMode
                ? h.tr(`PARÇALAMA MODU (x${fallStreak} Kat)!`, `SMASH MODE (${fallStreak} Floors)!`)
                : h.tr(`Kat: ${floorCount} · İniş Serisi: ${fallStreak}/3`, `Floor: ${floorCount} · Drop Streak: ${fallStreak}/3`);
            h.setHud({
                score: Math.floor(score),
                level,
                maxLevel: 99,
                lives,
                statusText: stText,
                objectiveText: h.tr('Açık mavi boşluklardan düş · 3+ katta Parçalama Modu aç!', 'Drop through gaps · 3+ consecutive drops unleash Smash Mode!')
            });
        }

        function spawnRing(index) {
            const y = -index * RING_STEP;
            const ringGroup = new THREE.Group();
            ringGroup.position.y = y;

            // Wedge types: 0 = gap, 1 = safe, 2 = hazard, 3 = boost
            const slices = new Array(SLICES).fill(1);
            const gapCount = index < 4 ? 3 : (index < 12 ? 3 : 2);
            const gapStart = index === 0 ? 5 : Math.floor(Math.random() * SLICES);
            for (let k = 0; k < gapCount; k++) {
                slices[(gapStart + k) % SLICES] = 0;
            }

            if (index === 0) {
                // Guarantee slice facing camera (index 3 around PI/2) is SAFE on first platform
                slices[2] = 1;
                slices[3] = 1;
                slices[4] = 1;
            } else {
                const hazardChance = Math.min(4, 1 + Math.floor(index / 6));
                for (let hIdx = 0; hIdx < hazardChance; hIdx++) {
                    const s = Math.floor(Math.random() * SLICES);
                    if (slices[s] === 1) slices[s] = 2;
                }
                if (index % 5 === 3) {
                    const bs = (gapStart + gapCount + 2) % SLICES;
                    if (slices[bs] === 1) slices[bs] = 3;
                }
            }

            const meshes = new Array(SLICES).fill(null);
            for (let s = 0; s < SLICES; s++) {
                const type = slices[s];
                if (type === 0) continue;
                const mat = type === 2 ? hazardMat : (type === 3 ? boostMat : safeMat);
                const mesh = new THREE.Mesh(wedgeGeos[s], mat);
                mesh.rotation.x = Math.PI / 2;
                ringGroup.add(mesh);
                meshes[s] = mesh;
            }

            towerGroup.add(ringGroup);
            rings.push({ index, y, group: ringGroup, slices, meshes, passed: false, shattered: false });
        }

        function shatterRing(ring) {
            if (ring.shattered) return;
            ring.shattered = true;
            ring.passed = true;
            for (let s = 0; s < SLICES; s++) {
                const mesh = ring.meshes[s];
                if (!mesh) continue;
                ring.group.remove(mesh);
                const midAng = (s + 0.5) * SLICE_ANG - towerGroup.rotation.y;
                mesh.position.set(0, ring.y, 0);
                mesh.rotation.y = towerGroup.rotation.y;
                scene.add(mesh);
                flyingShards.push({
                    mesh,
                    vx: Math.cos(midAng) * (7.5 + Math.random() * 5),
                    vy: 3.2 + Math.random() * 5,
                    vz: Math.sin(midAng) * (7.5 + Math.random() * 5),
                    life: 0.65
                });
            }
            particles.spawn(0, ring.y, POD_ORBIT_Z, 0xfbbf24, 18, 9);
            h.playAudio('explodeSmall', 0.15);
        }

        function triggerGameOver() {
            if (ended) return;
            ended = true;
            h.playAudio('explodeBoss');
            syncHud(true);
            try {
                ctx.onGameOver?.({
                    score: Math.floor(score),
                    level,
                    stars: 0,
                    reason: h.tr('Enerji kapsülü tehlikeli kırmızı segmente çarptı.', 'Energy pod struck a lethal hazard wedge.')
                });
            } catch (e) { /* safe ignore */ }
        }

        function resetGame(startLevel) {
            rings.forEach((r) => towerGroup.remove(r.group));
            rings.length = 0;
            flyingShards.forEach((f) => scene.remove(f.mesh));
            flyingShards.length = 0;
            particles.clear();
            overlay.clearPopups();

            score = 0;
            level = Math.max(1, Number(startLevel) || 1);
            lives = 3;
            floorCount = 0;
            fallStreak = 0;
            smashMode = false;
            podY = 2.4;
            podVy = 0;
            lowestCamY = 2.4;
            rotVel = 0;
            invulnTimer = 0;
            shakeMag = 0;
            nextRingIdx = 0;
            ended = false;
            towerGroup.rotation.y = 0;
            podMesh.position.set(0, podY, POD_ORBIT_Z);
            podMesh.scale.set(1, 1, 1);
            podMat.color.setHex(0x38bdf8);
            podMat.emissive.setHex(0x38bdf8);
            podLight.color.setHex(0x38bdf8);

            for (let i = 0; i < 12; i++) {
                spawnRing(nextRingIdx++);
            }
            overlay.setHint(h.tr('A/D veya Sol/Sağ veya Sürükle ile kuleyi döndür · 3+ kat düşerek Parçalama Modu aç!', 'Rotate tower: A/D, Arrows or Drag · Drop 3+ floors for Smash Mode!'));
            syncHud(true);
        }

        function step(dt) {
            hudTimer -= dt;
            if (invulnTimer > 0) invulnTimer -= dt;
            if (shakeMag > 0) shakeMag = Math.max(0, shakeMag - dt * 2.1);

            // Tower rotation input
            let dir = 0;
            if (input.hasKey('KeyA', 'ArrowLeft', 'a')) dir -= 1;
            if (input.hasKey('KeyD', 'ArrowRight', 'd')) dir += 1;
            const dragX = input.consumeDragX();
            if (Math.abs(dragX) > 0.01) {
                towerGroup.rotation.y += dragX * 0.012;
            }
            const targetRotVel = dir * 3.8;
            rotVel = lerp(rotVel, targetRotVel, clamp(dt * 14, 0, 1));
            towerGroup.rotation.y += rotVel * dt;

            // Pod gravity & squash recovery
            const prevPodY = podY;
            podVy = Math.max(-24, podVy - 31 * dt);
            podY += podVy * dt;
            podMesh.scale.x = lerp(podMesh.scale.x, 1, clamp(dt * 12, 0, 1));
            podMesh.scale.z = lerp(podMesh.scale.z, 1, clamp(dt * 12, 0, 1));
            podMesh.scale.y = lerp(podMesh.scale.y, podVy < -8 ? 1.16 : 1, clamp(dt * 12, 0, 1));

            // Pod smash visual tint
            if (smashMode) {
                podMat.color.setHex(0xfbbf24);
                podMat.emissive.setHex(0xf59e0b);
                podLight.color.setHex(0xfbbf24);
            } else {
                podMat.color.setHex(0x38bdf8);
                podMat.emissive.setHex(0x38bdf8);
                podLight.color.setHex(0x38bdf8);
            }

            // Local angle at world pod (0, podY, +POD_ORBIT_Z) verified against Three.js
            const localAng = wrapAngle(Math.PI / 2 + towerGroup.rotation.y);
            const sliceIdx = Math.floor(localAng / SLICE_ANG) % SLICES;

            // Check rings
            for (let i = 0; i < rings.length; i++) {
                const r = rings[i];
                if (r.shattered) continue;

                // Passing through a ring counts floor + streak
                if (!r.passed && podY < r.y - WEDGE_THICK) {
                    r.passed = true;
                    floorCount += 1;
                    fallStreak += 1;
                    const pts = 50 * fallStreak;
                    score += pts;
                    level = 1 + Math.floor(floorCount / 8);
                    h.playAudio('xpPickup', 0.12);
                    const scr = h.projectToScreen(podMesh.position, camera, tmpVec);
                    overlay.spawnPopup(scr.x + 28, scr.y, `+${pts}`, '#38bdf8');
                    if (fallStreak >= 3 && !smashMode) {
                        smashMode = true;
                        overlay.spawnPopup(STAGE_W * 0.5, 130, h.tr('PARÇALAMA MODU!', 'SMASH MODE!'), '#fbbf24', 1.25);
                        h.playAudio('powerup');
                    }
                }

                // Landing / collision with platform top surface
                const podBottom = podY - POD_R;
                const prevBottom = prevPodY - POD_R;
                if (podVy < 0 && prevBottom >= r.y - 0.12 && podBottom <= r.y + 0.04) {
                    const wedgeType = r.slices[sliceIdx];
                    if (wedgeType === 0) {
                        // Open gap! Fall through
                        continue;
                    }
                    if (smashMode) {
                        shatterRing(r);
                        const bonus = 200;
                        score += bonus;
                        floorCount += 1;
                        level = 1 + Math.floor(floorCount / 8);
                        podY = r.y + POD_R;
                        podVy = 12.2;
                        fallStreak = 0;
                        smashMode = false;
                        shakeMag = 0.35;
                        overlay.spawnPopup(STAGE_W * 0.5, STAGE_H * 0.44, h.tr(`PARÇALANDI +${bonus}!`, `SMASH +${bonus}!`), '#fbbf24', 1.22);
                        break;
                    }

                    // Normal landing
                    if (wedgeType === 2 && invulnTimer <= 0) {
                        lives -= 1;
                        invulnTimer = 1.1;
                        shakeMag = 0.55;
                        overlay.flashDamage('rgba(251,113,133,0.92)');
                        overlay.spawnPopup(STAGE_W * 0.5, STAGE_H * 0.45, h.tr('TEHLİKELİ SEGMENT!', 'HAZARD HIT!'), '#fb7185', 1.15);
                        particles.spawn(0, r.y + 0.2, POD_ORBIT_Z, 0xfb7185, 16, 8);
                        if (lives <= 0) {
                            lives = 0;
                            triggerGameOver();
                            return;
                        }
                        h.playAudio('playerHurt');
                    } else if (wedgeType === 3) {
                        h.playAudio('powerup');
                        score += 100;
                        particles.spawn(0, r.y + 0.1, POD_ORBIT_Z, 0x34d399, 12, 7);
                        const scr = h.projectToScreen(podMesh.position, camera, tmpVec);
                        overlay.spawnPopup(scr.x, scr.y - 25, h.tr('SÜPER SIÇRAMA +100', 'SUPER BOUNCE +100'), '#34d399');
                    } else {
                        h.playAudio('hitShield', 0.12);
                        particles.spawn(0, r.y + 0.1, POD_ORBIT_Z, 0x38bdf8, 6, 4.5);
                    }

                    podY = r.y + POD_R;
                    podVy = wedgeType === 3 ? 16.5 : 12.4;
                    podMesh.scale.set(1.28, 0.72, 1.28);
                    fallStreak = 0;
                    smashMode = false;
                    break;
                }
            }

            // Spawn ahead & recycle old rings above
            while (rings.length < 13 || (rings[rings.length - 1].y > podY - 40)) {
                spawnRing(nextRingIdx++);
            }
            while (rings.length > 0 && rings[0].y > lowestCamY + 14) {
                const old = rings.shift();
                towerGroup.remove(old.group);
            }
            coreMesh.position.y = lowestCamY - 25;

            // Update flying shattered shards
            for (let i = flyingShards.length - 1; i >= 0; i--) {
                const f = flyingShards[i];
                f.life -= dt;
                f.vy -= 18 * dt;
                f.mesh.position.x += f.vx * dt;
                f.mesh.position.y += f.vy * dt;
                f.mesh.position.z += f.vz * dt;
                f.mesh.rotation.x += 5 * dt;
                f.mesh.rotation.z += 4 * dt;
                if (f.life <= 0) {
                    scene.remove(f.mesh);
                    flyingShards.splice(i, 1);
                }
            }

            podMesh.position.y = podY;
            podMesh.visible = invulnTimer <= 0 || Math.floor(invulnTimer * 18) % 2 === 0;

            lowestCamY = Math.min(lowestCamY, podY);
            const camTargetY = lowestCamY + 4.4;
            const sx = (Math.random() - 0.5) * shakeMag;
            const sy = (Math.random() - 0.5) * shakeMag;
            camera.position.x = sx;
            camera.position.y = lerp(camera.position.y, camTargetY, clamp(dt * 8, 0, 1)) + sy;
            camera.lookAt(0, camera.position.y - 5.2, 0);

            particles.update(dt);
            overlay.update(dt);
            syncHud(false);
        }

        function loop(now) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
            lastTime = now;

            const paused = typeof ctx.getPaused === 'function' ? ctx.getPaused() : false;
            if (!paused && !ended) {
                step(dt);
            } else {
                overlay.update(0);
            }
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(loop);
        }

        resetGame(1);
        rafId = requestAnimationFrame(loop);

        return {
            restart(lvl) {
                resetGame(lvl);
            },
            destroy() {
                destroyed = true;
                cancelAnimationFrame(rafId);
                input.destroy();
                overlay.destroy();
                particles.dispose();
                wedgeGeos.forEach((g) => g.dispose());
                safeMat.dispose();
                hazardMat.dispose();
                boostMat.dispose();
                h.disposeThree(scene, renderer);
                if (canvas.parentNode) canvas.remove();
            }
        };
    };
})(window);
