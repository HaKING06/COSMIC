// ============================================================================
// COSMIC UNIVERSE v11.0 — Puzzle & Cipher Pack (12 Games)
// Mounts all 12 puzzle/cipher engines into window.COSMIC_GAME_ENGINES using
// window.CosmicPuzzleCore (compiled from ts/puzzleEngine.ts).
// ============================================================================
(function (global) {
    'use strict';

    const Core = global.CosmicPuzzleCore;
    const ENGINES = global.COSMIC_GAME_ENGINES || (global.COSMIC_GAME_ENGINES = {});

    const W = 960;
    const H = 540;
    const BOARD_AREA = { x: 18, y: 66, w: 660, h: 456 };
    const PANEL_AREA = { x: 694, y: 66, w: 248, h: 456 };

    const PAL = {
        bg0: '#050811',
        bg1: '#0a1224',
        panel: 'rgba(13, 21, 38, 0.92)',
        panelBorder: 'rgba(56, 189, 248, 0.28)',
        cyan: '#38bdf8',
        cyanSoft: 'rgba(56, 189, 248, 0.16)',
        emerald: '#34d399',
        emeraldSoft: 'rgba(52, 211, 153, 0.18)',
        amber: '#fbbf24',
        amberSoft: 'rgba(251, 191, 36, 0.18)',
        crimson: '#f43f5e',
        crimsonSoft: 'rgba(244, 63, 94, 0.22)',
        violet: '#a78bfa',
        text: '#f1f5f9',
        muted: '#94a3b8',
        dim: '#475569'
    };

    // ------------------------------------------------------------------------
    // Shared Canvas, Audio, Sprite, Particle, and Shell Utilities
    // ------------------------------------------------------------------------
    function resolveCanvas(ctx) {
        let canvas = null;
        let g = null;
        if (ctx && typeof ctx.createCanvas === 'function') {
            const created = ctx.createCanvas('2d', W, H);
            if (created && created.canvas && created.ctx) {
                canvas = created.canvas;
                g = created.ctx;
            } else if (created && typeof created.getContext === 'function') {
                canvas = created;
                g = canvas.getContext('2d');
            } else if (created && created.canvas) {
                canvas = created.canvas;
                g = canvas.getContext('2d');
            }
        }
        if (!canvas && ctx && ctx.canvas) {
            canvas = ctx.canvas;
            g = canvas.getContext('2d');
        }
        if (!canvas && typeof document !== 'undefined') {
            canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const host = (ctx && (ctx.container || ctx.mountEl || ctx.root)) || document.body;
            if (host && host.appendChild) host.appendChild(canvas);
            g = canvas.getContext('2d');
        }
        if (canvas && canvas.width === 300 && canvas.height === 150) {
            canvas.width = W;
            canvas.height = H;
        }
        return { canvas, g };
    }

    function playSfx(ctx, key) {
        try {
            if (ctx && ctx.audio) {
                if (typeof ctx.audio.unlock === 'function') ctx.audio.unlock();
                if (typeof ctx.audio.play === 'function') ctx.audio.play(key);
            }
        } catch (e) { /* ignore audio errors */ }
    }

    function setHudSafe(ctx, payload) {
        try {
            if (ctx && typeof ctx.setHud === 'function') ctx.setHud(payload);
        } catch (e) { /* ignore */ }
    }

    function toLevelIdx(levelArg, fallbackIdx, maxLevels) {
        if (typeof levelArg === 'number' && Number.isFinite(levelArg)) {
            if (levelArg <= 0) return 0;
            return Math.max(0, Math.min(maxLevels - 1, Math.floor(levelArg) - 1));
        }
        return Math.max(0, Math.min(maxLevels - 1, fallbackIdx || 0));
    }

    function roundRect(g, x, y, w, h, r) {
        const rad = Math.min(r, w / 2, h / 2);
        g.beginPath();
        g.moveTo(x + rad, y);
        g.arcTo(x + w, y, x + w, y + h, rad);
        g.arcTo(x + w, y + h, x, y + h, rad);
        g.arcTo(x, y + h, x, y, rad);
        g.arcTo(x, y, x + w, y, rad);
        g.closePath();
    }

    function drawButton(g, hitList, id, x, y, w, h, label, opts) {
        const o = opts || {};
        const hovered = o.hoveredId === id;
        const disabled = !!o.disabled;
        const active = !!o.active;
        const accent = o.accent || PAL.cyan;

        g.save();
        roundRect(g, x, y, w, h, o.radius || 7);
        if (disabled) {
            g.fillStyle = 'rgba(15, 23, 42, 0.55)';
            g.strokeStyle = 'rgba(100, 116, 139, 0.25)';
        } else if (active) {
            g.fillStyle = o.activeBg || 'rgba(56, 189, 248, 0.24)';
            g.strokeStyle = accent;
        } else if (hovered) {
            g.fillStyle = o.hoverBg || 'rgba(56, 189, 248, 0.18)';
            g.strokeStyle = accent;
        } else {
            g.fillStyle = o.bg || 'rgba(15, 23, 42, 0.85)';
            g.strokeStyle = o.border || 'rgba(148, 163, 184, 0.35)';
        }
        g.lineWidth = (hovered || active) && !disabled ? 1.8 : 1.1;
        g.fill();
        g.stroke();

        g.fillStyle = disabled ? '#64748b' : (o.textColor || '#f1f5f9');
        g.font = o.font || '600 12px "Inter", system-ui, sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(label, x + w / 2, y + h / 2 + 0.5);
        g.restore();

        if (!disabled && o.onClick) {
            hitList.push({ id, x, y, w, h, onClick: o.onClick });
        }
    }

    function drawSprite(g, ctx, key, cx, cy, size, fallbackFn, rotRad, alpha) {
        const img = ctx && ctx.sprites ? ctx.sprites[key] : null;
        g.save();
        if (typeof alpha === 'number') g.globalAlpha = alpha;
        g.translate(cx, cy);
        if (rotRad) g.rotate(rotRad);
        if (img && img.complete && img.naturalWidth > 0) {
            g.drawImage(img, -size / 2, -size / 2, size, size);
        } else if (fallbackFn) {
            fallbackFn(g, size);
        } else {
            g.fillStyle = PAL.cyan;
            g.beginPath();
            g.arc(0, 0, size * 0.36, 0, Math.PI * 2);
            g.fill();
        }
        g.restore();
    }

    function drawStarfield(g, stars, time) {
        const grad = g.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#040710');
        grad.addColorStop(0.55, '#091122');
        grad.addColorStop(1, '#060a15');
        g.fillStyle = grad;
        g.fillRect(0, 0, W, H);

        // Subtle nebula radial accents
        const rad1 = g.createRadialGradient(220, 180, 10, 220, 180, 320);
        rad1.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        rad1.addColorStop(1, 'rgba(56, 189, 248, 0)');
        g.fillStyle = rad1;
        g.fillRect(0, 0, W, H);

        const rad2 = g.createRadialGradient(780, 400, 10, 780, 400, 280);
        rad2.addColorStop(0, 'rgba(167, 139, 250, 0.07)');
        rad2.addColorStop(1, 'rgba(167, 139, 250, 0)');
        g.fillStyle = rad2;
        g.fillRect(0, 0, W, H);

        g.save();
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const tw = 0.35 + 0.65 * Math.abs(Math.sin(time * s.spd + s.phase));
            g.fillStyle = `rgba(226, 232, 240, ${(s.alpha * tw).toFixed(2)})`;
            g.fillRect(s.x, s.y, s.r, s.r);
        }
        g.restore();
    }

    function makeStars(count) {
        const list = [];
        for (let i = 0; i < count; i++) {
            list.push({
                x: ((i * 197 + 53) % W),
                y: ((i * 313 + 97) % H),
                r: (i % 5 === 0) ? 2 : 1.2,
                alpha: 0.25 + ((i * 29) % 10) * 0.06,
                spd: 0.7 + (i % 7) * 0.25,
                phase: i * 1.1
            });
        }
        return list;
    }

    function drawPanelBox(g, x, y, w, h, borderColor) {
        g.save();
        roundRect(g, x, y, w, h, 12);
        g.fillStyle = PAL.panel;
        g.strokeStyle = borderColor || PAL.panelBorder;
        g.lineWidth = 1.2;
        g.fill();
        g.stroke();
        g.restore();
    }

    function drawStarsRow(g, cx, cy, starsCount, size) {
        const gap = size * 1.45;
        const startX = cx - gap;
        for (let i = 0; i < 3; i++) {
            const sx = startX + i * gap;
            const lit = i < starsCount;
            g.save();
            g.translate(sx, cy);
            g.beginPath();
            for (let p = 0; p < 10; p++) {
                const ang = (p * Math.PI) / 5 - Math.PI / 2;
                const r = p % 2 === 0 ? size * 0.52 : size * 0.22;
                const px = Math.cos(ang) * r;
                const py = Math.sin(ang) * r;
                if (p === 0) g.moveTo(px, py);
                else g.lineTo(px, py);
            }
            g.closePath();
            g.fillStyle = lit ? PAL.amber : 'rgba(100, 116, 139, 0.35)';
            g.strokeStyle = lit ? '#fde68a' : 'rgba(148, 163, 184, 0.35)';
            g.lineWidth = 1.1;
            g.fill();
            g.stroke();
            g.restore();
        }
    }

    function createPuzzleShell(ctx, cfg) {
        const { canvas, g } = resolveCanvas(ctx);
        if (!canvas || !g) {
            return { destroy() {}, restart() {} };
        }
        const starsBg = makeStars(58);
        const particles = [];
        const floaters = [];
        let rafId = 0;
        let destroyed = false;
        let lastTs = performance.now();
        let elapsed = 0;
        let pointerX = -1;
        let pointerY = -1;
        let hoveredId = null;
        let hitButtons = [];
        let pointerDownInfo = null;

        const api = {
            ctx,
            canvas,
            g,
            elapsed: 0,
            pointerX: -1,
            pointerY: -1,
            hoveredId: null,
            spawnBurst(x, y, color, count) {
                const n = count || 14;
                for (let i = 0; i < n; i++) {
                    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
                    const spd = 45 + Math.random() * 145;
                    particles.push({
                        x, y,
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd,
                        life: 0,
                        maxLife: 0.38 + Math.random() * 0.35,
                        r: 2 + Math.random() * 2.5,
                        color: color || PAL.cyan
                    });
                }
            },
            spawnFloater(x, y, text, color) {
                floaters.push({ x, y, text, color: color || PAL.amber, life: 0, maxLife: 0.95 });
            },
            drawChrome(opts) {
                const o = opts || {};
                hitButtons = [];

                // Top Bar
                drawPanelBox(g, 18, 10, W - 36, 46, 'rgba(56, 189, 248, 0.3)');
                g.save();
                g.fillStyle = PAL.cyan;
                g.font = '700 15px "Space Grotesk", system-ui, sans-serif';
                g.textAlign = 'left';
                g.textBaseline = 'middle';
                g.fillText(cfg.title, 32, 26);

                g.fillStyle = PAL.muted;
                g.font = '500 11.5px "Inter", system-ui, sans-serif';
                g.fillText(o.subtitle || '', 32, 43);

                if (o.storyBadge) {
                    const bx = 268;
                    roundRect(g, bx, 18, 134, 22, 11);
                    g.fillStyle = 'rgba(251, 191, 36, 0.16)';
                    g.strokeStyle = PAL.amber;
                    g.lineWidth = 1;
                    g.fill();
                    g.stroke();
                    g.fillStyle = PAL.amber;
                    g.font = '700 10px "JetBrains Mono", monospace';
                    g.textAlign = 'center';
                    g.fillText(o.storyBadge, bx + 67, 29.5);
                }
                g.restore();

                // Level Switcher & Action Buttons in Top Bar
                let rx = W - 30;
                if (o.onHint) {
                    rx -= 82;
                    drawButton(g, hitButtons, 'top_hint', rx, 18, 82, 30, 'Hint [H]', {
                        hoveredId, accent: PAL.amber, textColor: '#fef3c7', onClick: o.onHint, disabled: !!o.disableHint
                    });
                    rx -= 8;
                }
                if (o.onReset) {
                    rx -= 84;
                    drawButton(g, hitButtons, 'top_reset', rx, 18, 84, 30, 'Reset [R]', {
                        hoveredId, accent: PAL.crimson, onClick: o.onReset
                    });
                    rx -= 8;
                }
                if (o.onUndo) {
                    rx -= 84;
                    drawButton(g, hitButtons, 'top_undo', rx, 18, 84, 30, 'Undo [Z]', {
                        hoveredId, accent: PAL.cyan, onClick: o.onUndo, disabled: o.canUndo === false
                    });
                    rx -= 12;
                }
                if (o.totalLevels && o.totalLevels > 1 && o.onChangeLevel) {
                    rx -= 30;
                    drawButton(g, hitButtons, 'lvl_next', rx, 18, 30, 30, '▶', {
                        hoveredId, onClick: () => o.onChangeLevel((o.levelIndex + 1) % o.totalLevels)
                    });
                    rx -= 72;
                    g.save();
                    roundRect(g, rx, 18, 68, 30, 7);
                    g.fillStyle = 'rgba(15, 23, 42, 0.9)';
                    g.strokeStyle = 'rgba(56, 189, 248, 0.3)';
                    g.lineWidth = 1;
                    g.fill();
                    g.stroke();
                    g.fillStyle = PAL.text;
                    g.font = '700 12px "JetBrains Mono", monospace';
                    g.textAlign = 'center';
                    g.textBaseline = 'middle';
                    g.fillText(`LV ${o.levelIndex + 1}/${o.totalLevels}`, rx + 34, 33.5);
                    g.restore();
                    rx -= 34;
                    drawButton(g, hitButtons, 'lvl_prev', rx, 18, 30, 30, '◀', {
                        hoveredId, onClick: () => o.onChangeLevel((o.levelIndex - 1 + o.totalLevels) % o.totalLevels)
                    });
                }

                // Main Board & Right Panel containers
                drawPanelBox(g, BOARD_AREA.x, BOARD_AREA.y, BOARD_AREA.w, BOARD_AREA.h);
                drawPanelBox(g, PANEL_AREA.x, PANEL_AREA.y, PANEL_AREA.w, PANEL_AREA.h);

                return hitButtons;
            },
            drawRightPanelStats(lines, footerLines) {
                const px = PANEL_AREA.x + 16;
                const pw = PANEL_AREA.w - 32;
                let py = PANEL_AREA.y + 18;
                g.save();
                for (let i = 0; i < lines.length; i++) {
                    const item = lines[i];
                    roundRect(g, px, py, pw, 36, 8);
                    g.fillStyle = 'rgba(15, 23, 42, 0.72)';
                    g.strokeStyle = 'rgba(148, 163, 184, 0.18)';
                    g.lineWidth = 1;
                    g.fill();
                    g.stroke();

                    g.fillStyle = PAL.muted;
                    g.font = '600 11px "Inter", system-ui, sans-serif';
                    g.textAlign = 'left';
                    g.textBaseline = 'middle';
                    g.fillText(item.label, px + 11, py + 18);

                    g.fillStyle = item.color || PAL.text;
                    g.font = '700 13.5px "JetBrains Mono", monospace';
                    g.textAlign = 'right';
                    g.fillText(String(item.value), px + pw - 11, py + 18);
                    py += 43;
                }
                if (footerLines && footerLines.length > 0) {
                    let fy = PANEL_AREA.y + PANEL_AREA.h - 14 - (footerLines.length - 1) * 16;
                    g.fillStyle = PAL.muted;
                    g.font = '500 11px "Inter", system-ui, sans-serif';
                    g.textAlign = 'left';
                    g.textBaseline = 'middle';
                    for (const line of footerLines) {
                        g.fillText(line, px, fy);
                        fy += 16;
                    }
                }
                g.restore();
                return py;
            },
            drawOverlay(opts) {
                const o = opts;
                g.save();
                g.fillStyle = 'rgba(3, 7, 18, 0.78)';
                roundRect(g, BOARD_AREA.x + 2, BOARD_AREA.y + 2, BOARD_AREA.w - 4, BOARD_AREA.h - 4, 11);
                g.fill();

                const bw = 390;
                const bh = 232;
                const bx = BOARD_AREA.x + (BOARD_AREA.w - bw) / 2;
                const by = BOARD_AREA.y + (BOARD_AREA.h - bh) / 2;
                const accent = o.isWin ? PAL.emerald : PAL.crimson;

                roundRect(g, bx, by, bw, bh, 14);
                g.fillStyle = '#0b1326';
                g.strokeStyle = accent;
                g.lineWidth = 2;
                g.fill();
                g.stroke();

                g.fillStyle = accent;
                g.font = '700 22px "Space Grotesk", system-ui, sans-serif';
                g.textAlign = 'center';
                g.textBaseline = 'middle';
                g.fillText(o.title, bx + bw / 2, by + 42);

                if (o.isWin && o.stars) {
                    drawStarsRow(g, bx + bw / 2, by + 84, o.stars, 22);
                }

                g.fillStyle = PAL.text;
                g.font = '500 13.5px "Inter", system-ui, sans-serif';
                g.fillText(o.message || '', bx + bw / 2, by + (o.stars ? 126 : 102));

                if (o.submessage) {
                    g.fillStyle = PAL.muted;
                    g.font = '500 12px "JetBrains Mono", monospace';
                    g.fillText(o.submessage, bx + bw / 2, by + (o.stars ? 150 : 130));
                }

                const btnY = by + bh - 56;
                if (o.onPrimary && o.onSecondary) {
                    drawButton(g, hitButtons, 'ov_sec', bx + 28, btnY, 156, 36, o.secondaryLabel || 'Replay [R]', {
                        hoveredId, accent: PAL.cyan, onClick: o.onSecondary
                    });
                    drawButton(g, hitButtons, 'ov_pri', bx + bw - 184, btnY, 156, 36, o.primaryLabel || 'Next Level', {
                        hoveredId, active: true, accent, onClick: o.onPrimary
                    });
                } else if (o.onPrimary) {
                    drawButton(g, hitButtons, 'ov_pri', bx + (bw - 180) / 2, btnY, 180, 36, o.primaryLabel || 'Retry [R]', {
                        hoveredId, active: true, accent, onClick: o.onPrimary
                    });
                }
                g.restore();
            },
            registerButton(id, x, y, w, h, label, opts) {
                const o = Object.assign({ hoveredId }, opts || {});
                drawButton(g, hitButtons, id, x, y, w, h, label, o);
            }
        };

        function toLogical(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: ((e.clientX - rect.left) / (rect.width || W)) * W,
                y: ((e.clientY - rect.top) / (rect.height || H)) * H
            };
        }

        function findButtonAt(x, y) {
            for (let i = hitButtons.length - 1; i >= 0; i--) {
                const b = hitButtons[i];
                if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
            }
            return null;
        }

        function onPointerMove(e) {
            const p = toLogical(e);
            pointerX = p.x;
            pointerY = p.y;
            api.pointerX = p.x;
            api.pointerY = p.y;
            const btn = findButtonAt(p.x, p.y);
            hoveredId = btn ? btn.id : null;
            api.hoveredId = hoveredId;
            canvas.style.cursor = btn ? 'pointer' : (cfg.boardCursor || 'default');
            if (cfg.onPointerMove) cfg.onPointerMove(p.x, p.y, e);
        }

        function onPointerDown(e) {
            const p = toLogical(e);
            pointerX = p.x;
            pointerY = p.y;
            api.pointerX = p.x;
            api.pointerY = p.y;
            if (e.button === 0) {
                const btn = findButtonAt(p.x, p.y);
                if (btn) {
                    playSfx(ctx, 'uiClick');
                    btn.onClick();
                    return;
                }
            }
            pointerDownInfo = { x: p.x, y: p.y, button: e.button, time: performance.now() };
            if (cfg.onPointerDown) cfg.onPointerDown(p.x, p.y, e);
        }

        function onPointerUp(e) {
            const p = toLogical(e);
            if (cfg.onPointerUp) cfg.onPointerUp(p.x, p.y, e, pointerDownInfo);
            pointerDownInfo = null;
        }

        function onContextMenu(e) {
            e.preventDefault();
        }

        function onKeyDown(e) {
            const tag = document.activeElement && document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            if (cfg.onKeyDown) cfg.onKeyDown(e);
        }

        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('contextmenu', onContextMenu);
        global.addEventListener('keydown', onKeyDown);

        function loop(ts) {
            if (destroyed) return;
            const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
            lastTs = ts;
            elapsed += dt;
            api.elapsed = elapsed;

            drawStarfield(g, starsBg, elapsed);
            if (cfg.onUpdate) cfg.onUpdate(dt, elapsed);
            if (cfg.onRender) cfg.onRender(g, dt, elapsed);

            // Particles & floaters
            g.save();
            for (let i = particles.length - 1; i >= 0; i--) {
                const pt = particles[i];
                pt.life += dt;
                if (pt.life >= pt.maxLife) {
                    particles.splice(i, 1);
                    continue;
                }
                pt.x += pt.vx * dt;
                pt.y += pt.vy * dt;
                pt.vx *= 0.96;
                pt.vy *= 0.96;
                const a = 1 - pt.life / pt.maxLife;
                g.globalAlpha = a;
                g.fillStyle = pt.color;
                g.beginPath();
                g.arc(pt.x, pt.y, pt.r * (0.4 + 0.6 * a), 0, Math.PI * 2);
                g.fill();
            }
            for (let i = floaters.length - 1; i >= 0; i--) {
                const fl = floaters[i];
                fl.life += dt;
                if (fl.life >= fl.maxLife) {
                    floaters.splice(i, 1);
                    continue;
                }
                fl.y -= 28 * dt;
                const a = 1 - fl.life / fl.maxLife;
                g.globalAlpha = a;
                g.fillStyle = fl.color;
                g.font = '700 14px "Space Grotesk", system-ui, sans-serif';
                g.textAlign = 'center';
                g.textBaseline = 'middle';
                g.fillText(fl.text, fl.x, fl.y);
            }
            g.restore();

            rafId = global.requestAnimationFrame(loop);
        }

        rafId = global.requestAnimationFrame(loop);

        api.destroy = function () {
            if (destroyed) return;
            destroyed = true;
            if (rafId) global.cancelAnimationFrame(rafId);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('contextmenu', onContextMenu);
            global.removeEventListener('keydown', onKeyDown);
        };
        return api;
    }

    function fitGridRect(rows, cols, pad) {
        const p = pad || 22;
        const maxW = BOARD_AREA.w - p * 2;
        const maxH = BOARD_AREA.h - p * 2;
        const cell = Math.floor(Math.min(maxW / cols, maxH / rows));
        const gw = cell * cols;
        const gh = cell * rows;
        return {
            cell,
            ox: BOARD_AREA.x + Math.floor((BOARD_AREA.w - gw) / 2),
            oy: BOARD_AREA.y + Math.floor((BOARD_AREA.h - gh) / 2),
            gw,
            gh
        };
    }

    function hitCell(px, py, geo, rows, cols) {
        const c = Math.floor((px - geo.ox) / geo.cell);
        const r = Math.floor((py - geo.oy) / geo.cell);
        if (r >= 0 && r < rows && c >= 0 && c < cols) return { r, c };
        return null;
    }

    // ========================================================================
    // 1. QUANTUM SOKOBAN (12 Handcrafted Levels, Story Ch.2 Target: Level 3)
    // ========================================================================
    ENGINES['quantum-sokoban'] = function mountSokoban(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.SOKOBAN_LEVELS.length);
        let state = Core.createSokobanState(levelIdx);
        let won = false;
        let winReported = false;
        let hintDir = null;
        let deadlocked = false;
        let shell;

        function syncHud() {
            const onTarget = state.boxes.filter((b) => state.targets[b.r][b.c]).length;
            setHudSafe(ctx, {
                gameId: 'quantum-sokoban',
                level: levelIdx + 1,
                maxLevel: Core.SOKOBAN_LEVELS.length,
                moves: state.moves,
                par: state.par,
                score: Math.max(100, 1200 - state.moves * 15),
                target: `${onTarget}/${state.boxes.length} Crates`,
                status: won ? 'DOCKED' : (deadlocked ? 'DEADLOCK' : 'ACTIVE')
            });
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.SOKOBAN_LEVELS.length);
            state = Core.createSokobanState(levelIdx);
            won = false;
            winReported = false;
            hintDir = null;
            deadlocked = false;
            syncHud();
        }

        function doMove(dr, dc) {
            if (won) return;
            const res = Core.stepSokoban(state, dr, dc);
            if (!res.moved) {
                playSfx(ctx, 'hitMetal');
                return;
            }
            hintDir = null;
            deadlocked = res.deadlocked;
            playSfx(ctx, res.pushed ? 'dash' : 'uiClick');
            if (res.pushed) {
                const geo = fitGridRect(state.rows, state.cols, 28);
                const bx = state.boxes.find((b) => b.r === state.player.r + dr && b.c === state.player.c + dc);
                if (bx && state.targets[bx.r][bx.c]) {
                    playSfx(ctx, 'xpPickup');
                    shell.spawnBurst(geo.ox + (bx.c + 0.5) * geo.cell, geo.oy + (bx.r + 0.5) * geo.cell, PAL.emerald, 14);
                }
            }
            if (res.won) {
                won = true;
                playSfx(ctx, 'levelup');
                const stars = Core.computeStars(state.moves, state.par);
                const score = Math.max(200, 1500 + stars * 300 - state.moves * 18);
                if (!winReported) {
                    winReported = true;
                    if (ctx && ctx.onWin) {
                        ctx.onWin({
                            gameId: 'quantum-sokoban',
                            level: levelIdx + 1,
                            maxLevel: Core.SOKOBAN_LEVELS.length,
                            moves: state.moves,
                            par: state.par,
                            stars,
                            score,
                            storyCleared: levelIdx + 1 >= 3
                        });
                    }
                }
            }
            syncHud();
        }

        function doUndo() {
            if (won) return;
            if (Core.undoSokoban(state)) {
                playSfx(ctx, 'uiBack');
                hintDir = null;
                deadlocked = Core.detectSokobanDeadlock(state);
                syncHud();
            }
        }

        function doHint() {
            if (won) return;
            hintDir = Core.solveSokobanHint(state, 50000);
            playSfx(ctx, hintDir ? 'powerup' : 'uiBack');
            if (!hintDir) {
                const geo = fitGridRect(state.rows, state.cols, 28);
                shell.spawnFloater(
                    geo.ox + (state.player.c + 0.5) * geo.cell,
                    geo.oy + state.player.r * geo.cell,
                    'Deadlock! Undo/Reset',
                    PAL.amber
                );
            }
        }

        shell = createPuzzleShell(ctx, {
            title: 'QUANTUM SOKOBAN',
            boardCursor: 'pointer',
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (k === 'w' || e.key === 'ArrowUp') doMove(-1, 0);
                else if (k === 's' || e.key === 'ArrowDown') doMove(1, 0);
                else if (k === 'a' || e.key === 'ArrowLeft') doMove(0, -1);
                else if (k === 'd' || e.key === 'ArrowRight') doMove(0, 1);
                else if (k === 'z') doUndo();
                else if (k === 'r') loadLevel(levelIdx);
                else if (k === 'h') doHint();
                else if (e.key === 'Enter' && won && levelIdx + 1 < Core.SOKOBAN_LEVELS.length) loadLevel(levelIdx + 1);
            },
            onPointerDown(px, py, e) {
                if (e.button !== 0 || won) return;
                const geo = fitGridRect(state.rows, state.cols, 28);
                const cell = hitCell(px, py, geo, state.rows, state.cols);
                if (!cell) return;
                const dr = cell.r - state.player.r;
                const dc = cell.c - state.player.c;
                if (Math.abs(dr) + Math.abs(dc) === 1) {
                    doMove(dr, dc);
                }
            },
            onRender(g, _dt, t) {
                const onTarget = state.boxes.filter((b) => state.targets[b.r][b.c]).length;
                shell.drawChrome({
                    subtitle: `Dock ${levelIdx + 1}: ${state.name}`,
                    storyBadge: levelIdx === 2 ? 'STORY CH.2 TARGET' : (levelIdx < 2 ? 'CH.2 GOAL: LV 3' : ''),
                    levelIndex: levelIdx,
                    totalLevels: Core.SOKOBAN_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onUndo: doUndo,
                    canUndo: state.undoStack.length > 0 && !won,
                    onReset: () => loadLevel(levelIdx),
                    onHint: doHint,
                    disableHint: won
                });

                const starsPreview = Core.computeStars(Math.max(1, state.moves), state.par);
                shell.drawRightPanelStats([
                    { label: 'MOVES', value: state.moves, color: PAL.cyan },
                    { label: 'PAR (3★)', value: state.par, color: PAL.amber },
                    { label: 'CRATES DOCKED', value: `${onTarget} / ${state.boxes.length}`, color: onTarget === state.boxes.length ? PAL.emerald : PAL.text },
                    { label: 'PUSHES', value: state.pushes, color: PAL.violet },
                    { label: 'RATING', value: '★'.repeat(starsPreview) + '☆'.repeat(3 - starsPreview), color: PAL.amber }
                ], [
                    'WASD / Arrows: Move & Push',
                    'Click adjacent tile: Step',
                    '[Z] Undo  [R] Reset  [H] Hint',
                    'Story Ch.2: Clear Level 3'
                ]);

                if (deadlocked && !won) {
                    g.save();
                    roundRect(g, PANEL_AREA.x + 16, PANEL_AREA.y + 252, PANEL_AREA.w - 32, 42, 8);
                    g.fillStyle = PAL.amberSoft;
                    g.strokeStyle = PAL.amber;
                    g.lineWidth = 1.2;
                    g.fill();
                    g.stroke();
                    g.fillStyle = PAL.amber;
                    g.font = '700 11.5px "Inter", system-ui, sans-serif';
                    g.textAlign = 'center';
                    g.textBaseline = 'middle';
                    g.fillText('Crate cornered! [Z] Undo / [R] Reset', PANEL_AREA.x + PANEL_AREA.w / 2, PANEL_AREA.y + 273);
                    g.restore();
                }

                const geo = fitGridRect(state.rows, state.cols, 28);
                const { cell, ox, oy } = geo;

                // Draw floor and walls
                for (let r = 0; r < state.rows; r++) {
                    for (let c = 0; c < state.cols; c++) {
                        const x = ox + c * cell;
                        const y = oy + r * cell;
                        if (state.walls[r][c]) {
                            roundRect(g, x + 2, y + 2, cell - 4, cell - 4, 6);
                            g.fillStyle = '#162238';
                            g.strokeStyle = '#334155';
                            g.lineWidth = 1.4;
                            g.fill();
                            g.stroke();
                            g.strokeStyle = 'rgba(56, 189, 248, 0.14)';
                            g.beginPath();
                            g.moveTo(x + 7, y + 7);
                            g.lineTo(x + cell - 7, y + cell - 7);
                            g.stroke();
                        } else {
                            g.fillStyle = (r + c) % 2 === 0 ? 'rgba(15, 23, 42, 0.72)' : 'rgba(19, 30, 52, 0.72)';
                            g.fillRect(x + 1, y + 1, cell - 2, cell - 2);
                            g.strokeStyle = 'rgba(56, 189, 248, 0.08)';
                            g.lineWidth = 1;
                            g.strokeRect(x + 1, y + 1, cell - 2, cell - 2);

                            if (state.targets[r][c]) {
                                const pulse = 0.72 + 0.22 * Math.sin(t * 4 + r + c);
                                drawSprite(g, ctx, 'warp_ring', x + cell / 2, y + cell / 2, cell * 0.68, (gg, sz) => {
                                    gg.strokeStyle = PAL.cyan;
                                    gg.lineWidth = 2.4;
                                    gg.beginPath();
                                    gg.arc(0, 0, sz * 0.36, 0, Math.PI * 2);
                                    gg.stroke();
                                }, t * 0.8, pulse);
                            }
                        }
                    }
                }

                // Adjacent hover affordance
                if (!won && shell.pointerX > 0) {
                    const hc = hitCell(shell.pointerX, shell.pointerY, geo, state.rows, state.cols);
                    if (hc && Math.abs(hc.r - state.player.r) + Math.abs(hc.c - state.player.c) === 1 && !state.walls[hc.r][hc.c]) {
                        g.save();
                        g.strokeStyle = 'rgba(56, 189, 248, 0.65)';
                        g.lineWidth = 2;
                        roundRect(g, ox + hc.c * cell + 3, oy + hc.r * cell + 3, cell - 6, cell - 6, 6);
                        g.stroke();
                        g.restore();
                    }
                }

                // Draw crates
                for (const b of state.boxes) {
                    const cx = ox + (b.c + 0.5) * cell;
                    const cy = oy + (b.r + 0.5) * cell;
                    const docked = state.targets[b.r][b.c];
                    if (docked) {
                        g.save();
                        g.fillStyle = PAL.emeraldSoft;
                        g.strokeStyle = PAL.emerald;
                        g.lineWidth = 2;
                        roundRect(g, ox + b.c * cell + 4, oy + b.r * cell + 4, cell - 8, cell - 8, 8);
                        g.fill();
                        g.stroke();
                        g.restore();
                    }
                    drawSprite(g, ctx, 'cargo_crate', cx, cy, cell * 0.78, (gg, sz) => {
                        gg.fillStyle = docked ? '#059669' : '#b45309';
                        gg.strokeStyle = docked ? PAL.emerald : PAL.amber;
                        gg.lineWidth = 2;
                        roundRect(gg, -sz / 2, -sz / 2, sz, sz, 6);
                        gg.fill();
                        gg.stroke();
                    });
                }

                // Draw Nova astronaut
                const px = ox + (state.player.c + 0.5) * cell;
                const py = oy + (state.player.r + 0.5) * cell;
                drawSprite(g, ctx, 'astronaut', px, py, cell * 0.82, (gg, sz) => {
                    gg.fillStyle = PAL.cyan;
                    gg.beginPath();
                    gg.arc(0, 0, sz * 0.36, 0, Math.PI * 2);
                    gg.fill();
                });

                // Hint direction arrow
                if (hintDir && !won) {
                    const vec = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[hintDir];
                    const ax = px + vec[0] * cell * 0.62;
                    const ay = py + vec[1] * cell * 0.62;
                    g.save();
                    g.fillStyle = PAL.amber;
                    g.beginPath();
                    g.arc(ax, ay, 8 + Math.sin(t * 8) * 2, 0, Math.PI * 2);
                    g.fill();
                    g.restore();
                }

                if (won) {
                    const stars = Core.computeStars(state.moves, state.par);
                    const hasNext = levelIdx + 1 < Core.SOKOBAN_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: levelIdx === 2 ? 'STORY CH.2 CLEARED!' : 'BAY CALIBRATED!',
                        stars,
                        message: `${state.name} completed in ${state.moves} moves`,
                        submessage: `Par: ${state.par} moves`,
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Dock [Enter]' : 'All 12 Complete!',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                }
            }
        });

        syncHud();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.SOKOBAN_LEVELS.length));
            }
        };
    };

    // ========================================================================
    // 2. LASER MIRROR GRID (10 Handcrafted Optical Prism Puzzles)
    // ========================================================================
    ENGINES['laser-mirror-grid'] = function mountLaser(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.LASER_LEVELS.length);
        let state = Core.createLaserState(levelIdx);
        let trace = Core.traceLasers(state.rows, state.cols, state.grid);
        let hintCell = null;
        let winReported = false;
        let shell;

        function refresh() {
            trace = Core.traceLasers(state.rows, state.cols, state.grid);
            setHudSafe(ctx, {
                gameId: 'laser-mirror-grid',
                level: levelIdx + 1,
                maxLevel: Core.LASER_LEVELS.length,
                moves: state.moves,
                par: state.par,
                target: `${trace.litReceivers.length}/${trace.totalReceivers} Nodes`,
                score: Math.max(100, 1200 - state.moves * 40),
                status: trace.solved ? 'ALIGNED' : 'ALIGNING'
            });
            if (trace.solved && !winReported) {
                winReported = true;
                playSfx(ctx, 'levelup');
                const stars = Core.computeStars(state.moves, state.par);
                const score = 1000 + stars * 250 - state.moves * 25;
                if (ctx && ctx.onWin) {
                    ctx.onWin({
                        gameId: 'laser-mirror-grid',
                        level: levelIdx + 1,
                        maxLevel: Core.LASER_LEVELS.length,
                        moves: state.moves,
                        stars,
                        score
                    });
                }
            }
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.LASER_LEVELS.length);
            state = Core.createLaserState(levelIdx);
            hintCell = null;
            winReported = false;
            refresh();
        }

        function doUndo() {
            if (trace.solved) return;
            if (Core.undoLaser(state)) {
                playSfx(ctx, 'uiBack');
                hintCell = null;
                refresh();
            }
        }

        function doHint() {
            if (trace.solved) return;
            hintCell = Core.getLaserHint(state);
            playSfx(ctx, 'powerup');
        }

        shell = createPuzzleShell(ctx, {
            title: 'LASER MIRROR GRID',
            boardCursor: 'pointer',
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (k === 'z') doUndo();
                else if (k === 'r') loadLevel(levelIdx);
                else if (k === 'h') doHint();
                else if (e.key === 'Enter' && trace.solved && levelIdx + 1 < Core.LASER_LEVELS.length) loadLevel(levelIdx + 1);
            },
            onPointerDown(px, py, e) {
                if (e.button !== 0 || trace.solved) return;
                const geo = fitGridRect(state.rows, state.cols, 24);
                const cell = hitCell(px, py, geo, state.rows, state.cols);
                if (!cell) return;
                if (Core.toggleLaserCell(state, cell.r, cell.c)) {
                    playSfx(ctx, 'shootLaser');
                    hintCell = null;
                    shell.spawnBurst(geo.ox + (cell.c + 0.5) * geo.cell, geo.oy + (cell.r + 0.5) * geo.cell, PAL.cyan, 8);
                    refresh();
                }
            },
            onRender(g, _dt, t) {
                shell.drawChrome({
                    subtitle: `Optics ${levelIdx + 1}: ${state.name}`,
                    levelIndex: levelIdx,
                    totalLevels: Core.LASER_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onUndo: doUndo,
                    canUndo: state.undoStack.length > 0 && !trace.solved,
                    onReset: () => loadLevel(levelIdx),
                    onHint: doHint,
                    disableHint: trace.solved
                });

                shell.drawRightPanelStats([
                    { label: 'MOVES', value: state.moves, color: PAL.cyan },
                    { label: 'PAR (3★)', value: state.par, color: PAL.amber },
                    { label: 'RECEIVERS LIT', value: `${trace.litReceivers.length} / ${trace.totalReceivers}`, color: trace.solved ? PAL.emerald : PAL.text },
                    { label: 'BEAM BOUNCES', value: trace.segments.length, color: PAL.violet }
                ], [
                    'Click prism to flip / <-> \\',
                    'Cyan Splitters pass + reflect 90°',
                    'Light ALL receivers at once',
                    '[Z] Undo  [R] Reset  [H] Hint'
                ]);

                const geo = fitGridRect(state.rows, state.cols, 24);
                const { cell, ox, oy } = geo;
                const litSet = new Set(trace.litReceivers);

                // Grid cells
                for (let r = 0; r < state.rows; r++) {
                    for (let c = 0; c < state.cols; c++) {
                        const x = ox + c * cell;
                        const y = oy + r * cell;
                        g.fillStyle = 'rgba(10, 17, 34, 0.85)';
                        g.fillRect(x + 1, y + 1, cell - 2, cell - 2);
                        g.strokeStyle = 'rgba(56, 189, 248, 0.14)';
                        g.lineWidth = 1;
                        g.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
                    }
                }

                // Draw glowing laser beam segments underneath prism icons
                g.save();
                g.lineCap = 'round';
                for (const seg of trace.segments) {
                    const x1 = ox + (seg.c1 + 0.5) * cell;
                    const y1 = oy + (seg.r1 + 0.5) * cell;
                    const x2 = ox + (seg.c2 + 0.5) * cell;
                    const y2 = oy + (seg.r2 + 0.5) * cell;
                    g.strokeStyle = 'rgba(34, 211, 238, 0.25)';
                    g.lineWidth = 10;
                    g.beginPath();
                    g.moveTo(x1, y1);
                    g.lineTo(x2, y2);
                    g.stroke();

                    g.strokeStyle = '#38bdf8';
                    g.lineWidth = 4.2;
                    g.beginPath();
                    g.moveTo(x1, y1);
                    g.lineTo(x2, y2);
                    g.stroke();

                    g.strokeStyle = '#e0f2fe';
                    g.lineWidth = 1.6;
                    g.beginPath();
                    g.moveTo(x1, y1);
                    g.lineTo(x2, y2);
                    g.stroke();
                }
                g.restore();

                // Draw optical nodes
                const rotMap = { E: 0, S: Math.PI / 2, W: Math.PI, N: -Math.PI / 2 };
                for (let r = 0; r < state.rows; r++) {
                    for (let c = 0; c < state.cols; c++) {
                        const item = state.grid[r][c];
                        const cx = ox + (c + 0.5) * cell;
                        const cy = oy + (r + 0.5) * cell;
                        if (item.type === 'wall') {
                            roundRect(g, ox + c * cell + 5, oy + r * cell + 5, cell - 10, cell - 10, 7);
                            g.fillStyle = '#1e293b';
                            g.strokeStyle = '#475569';
                            g.lineWidth = 1.5;
                            g.fill();
                            g.stroke();
                        } else if (item.type === 'emitter') {
                            drawSprite(g, ctx, 'laser_turret', cx, cy, cell * 0.72, (gg, sz) => {
                                gg.fillStyle = PAL.amber;
                                gg.beginPath();
                                gg.arc(0, 0, sz * 0.34, 0, Math.PI * 2);
                                gg.fill();
                            }, rotMap[item.dir || 'E'] || 0);
                        } else if (item.type === 'receiver') {
                            const isLit = litSet.has(`${r},${c}`);
                            drawSprite(g, ctx, 'warp_ring', cx, cy, cell * 0.72, (gg, sz) => {
                                gg.strokeStyle = isLit ? PAL.emerald : PAL.dim;
                                gg.lineWidth = 3;
                                gg.beginPath();
                                gg.arc(0, 0, sz * 0.34, 0, Math.PI * 2);
                                gg.stroke();
                            }, t * (isLit ? 2.2 : 0.4), isLit ? 1 : 0.45);
                            g.save();
                            g.fillStyle = isLit ? PAL.emerald : '#64748b';
                            g.beginPath();
                            g.arc(cx, cy, cell * 0.14, 0, Math.PI * 2);
                            g.fill();
                            g.restore();
                        } else if (item.type === 'mirror' || item.type === 'splitter') {
                            const isSplit = item.type === 'splitter';
                            drawSprite(g, ctx, 'energy_prism', cx, cy, cell * 0.58, null, 0, isSplit ? 0.85 : 0.65);
                            g.save();
                            const pad = cell * 0.32;
                            g.strokeStyle = isSplit ? PAL.amber : '#e0f2fe';
                            g.lineWidth = isSplit ? 3.5 : 4.2;
                            g.lineCap = 'round';
                            if (isSplit) g.setLineDash([5, 4]);
                            g.beginPath();
                            if (item.orient === '/') {
                                g.moveTo(cx - pad, cy + pad);
                                g.lineTo(cx + pad, cy - pad);
                            } else {
                                g.moveTo(cx - pad, cy - pad);
                                g.lineTo(cx + pad, cy + pad);
                            }
                            g.stroke();
                            g.restore();
                        }

                        if (hintCell && hintCell.r === r && hintCell.c === c && !trace.solved) {
                            g.save();
                            g.strokeStyle = PAL.amber;
                            g.lineWidth = 2.5 + Math.sin(t * 8) * 1;
                            roundRect(g, ox + c * cell + 3, oy + r * cell + 3, cell - 6, cell - 6, 8);
                            g.stroke();
                            g.restore();
                        }
                    }
                }

                if (trace.solved) {
                    const stars = Core.computeStars(state.moves, state.par);
                    const hasNext = levelIdx + 1 < Core.LASER_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: 'OPTICAL ARRAY SYNCED!',
                        stars,
                        message: `All ${trace.totalReceivers} receivers energized in ${state.moves} toggles`,
                        submessage: `Par: ${state.par}`,
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Grid [Enter]' : 'All 10 Complete!',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                }
            }
        });

        refresh();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.LASER_LEVELS.length));
            }
        };
    };

    // ========================================================================
    // 3. CIRCUIT PIPE LINK (8 Levels, Story Ch.5 Target: Level 3)
    // ========================================================================
    ENGINES['circuit-pipe-link'] = function mountPipes(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.PIPE_LEVELS.length);
        let state = Core.createPipeState(levelIdx);
        let flow = Core.evalPipeFlow(state.rows, state.cols, state.grid);
        let bonusLeft = state.bonusSec;
        let hintCell = null;
        let winReported = false;
        let shell;

        function refresh() {
            flow = Core.evalPipeFlow(state.rows, state.cols, state.grid);
            setHudSafe(ctx, {
                gameId: 'circuit-pipe-link',
                level: levelIdx + 1,
                maxLevel: Core.PIPE_LEVELS.length,
                moves: state.moves,
                timer: Math.ceil(bonusLeft),
                target: `${flow.litGates}/${flow.totalGates} Gates`,
                score: Math.max(150, 1400 - state.moves * 15 + Math.round(bonusLeft * 10)),
                status: flow.solved ? 'POWERED' : 'ROUTING'
            });
            if (flow.solved && !winReported) {
                winReported = true;
                playSfx(ctx, 'levelup');
                let stars = Core.computeStars(state.moves, state.par);
                if (bonusLeft <= 0 && stars === 3) stars = 2;
                const score = 1000 + stars * 300 + Math.round(bonusLeft * 12) - state.moves * 10;
                if (ctx && ctx.onWin) {
                    ctx.onWin({
                        gameId: 'circuit-pipe-link',
                        level: levelIdx + 1,
                        maxLevel: Core.PIPE_LEVELS.length,
                        moves: state.moves,
                        bonusTimeRemaining: Math.round(bonusLeft),
                        stars,
                        score,
                        storyCleared: levelIdx + 1 >= 3
                    });
                }
            }
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.PIPE_LEVELS.length);
            state = Core.createPipeState(levelIdx);
            bonusLeft = state.bonusSec;
            hintCell = null;
            winReported = false;
            refresh();
        }

        function doUndo() {
            if (flow.solved) return;
            if (Core.undoPipe(state)) {
                playSfx(ctx, 'uiBack');
                hintCell = null;
                refresh();
            }
        }

        function doHint() {
            if (flow.solved) return;
            hintCell = Core.getPipeHint(state);
            playSfx(ctx, 'powerup');
        }

        shell = createPuzzleShell(ctx, {
            title: 'CIRCUIT PIPE LINK',
            boardCursor: 'pointer',
            onUpdate(dt) {
                if (!flow.solved && bonusLeft > 0) {
                    bonusLeft = Math.max(0, bonusLeft - dt);
                }
            },
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (k === 'z') doUndo();
                else if (k === 'r') loadLevel(levelIdx);
                else if (k === 'h') doHint();
                else if (e.key === 'Enter' && flow.solved && levelIdx + 1 < Core.PIPE_LEVELS.length) loadLevel(levelIdx + 1);
            },
            onPointerDown(px, py, e) {
                if (e.button !== 0 || flow.solved) return;
                const geo = fitGridRect(state.rows, state.cols, 24);
                const cell = hitCell(px, py, geo, state.rows, state.cols);
                if (!cell) return;
                if (Core.rotatePipeCell(state, cell.r, cell.c)) {
                    playSfx(ctx, 'uiClick');
                    hintCell = null;
                    refresh();
                }
            },
            onRender(g, _dt, t) {
                shell.drawChrome({
                    subtitle: `Grid ${levelIdx + 1}: ${state.name}`,
                    storyBadge: levelIdx === 2 ? 'STORY CH.5 TARGET' : (levelIdx < 2 ? 'CH.5 GOAL: LV 3' : ''),
                    levelIndex: levelIdx,
                    totalLevels: Core.PIPE_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onUndo: doUndo,
                    canUndo: state.undoStack.length > 0 && !flow.solved,
                    onReset: () => loadLevel(levelIdx),
                    onHint: doHint,
                    disableHint: flow.solved
                });

                shell.drawRightPanelStats([
                    { label: 'ROTATIONS', value: state.moves, color: PAL.cyan },
                    { label: 'GATES LIT', value: `${flow.litGates} / ${flow.totalGates}`, color: flow.solved ? PAL.emerald : PAL.text },
                    { label: '3★ BONUS TIMER', value: bonusLeft > 0 ? `${bonusLeft.toFixed(1)}s` : 'EXPIRED', color: bonusLeft > 0 ? PAL.emerald : PAL.amber },
                    { label: 'PAR MOVES', value: state.par, color: PAL.amber }
                ], [
                    'Click conduits to rotate 90°',
                    'Route emerald power S -> ALL G',
                    'Beat bonus timer for 3★',
                    'Story Ch.5: Clear Level 3'
                ]);

                const geo = fitGridRect(state.rows, state.cols, 24);
                const { cell, ox, oy } = geo;
                const poweredSet = new Set(flow.powered);

                for (let r = 0; r < state.rows; r++) {
                    for (let c = 0; c < state.cols; c++) {
                        const x = ox + c * cell;
                        const y = oy + r * cell;
                        const item = state.grid[r][c];
                        const isPow = poweredSet.has(`${r},${c}`);

                        g.fillStyle = isPow ? 'rgba(6, 78, 59, 0.25)' : 'rgba(11, 18, 34, 0.85)';
                        g.fillRect(x + 1, y + 1, cell - 2, cell - 2);
                        g.strokeStyle = isPow ? 'rgba(52, 211, 153, 0.28)' : 'rgba(148, 163, 184, 0.12)';
                        g.lineWidth = 1;
                        g.strokeRect(x + 1, y + 1, cell - 2, cell - 2);

                        if (item.kind === '#') {
                            roundRect(g, x + 5, y + 5, cell - 10, cell - 10, 6);
                            g.fillStyle = '#1e293b';
                            g.strokeStyle = '#475569';
                            g.fill();
                            g.stroke();
                            continue;
                        }
                        if (item.kind === '.') continue;

                        const cx = x + cell / 2;
                        const cy = y + cell / 2;
                        const ports = Core.getPipePorts(item);

                        // Pipe arms
                        g.save();
                        g.lineCap = 'round';
                        const armLen = cell * 0.5;
                        for (const p of ports) {
                            const ex = p === 'E' ? cx + armLen : p === 'W' ? cx - armLen : cx;
                            const ey = p === 'S' ? cy + armLen : p === 'N' ? cy - armLen : cy;
                            g.strokeStyle = '#1e293b';
                            g.lineWidth = cell * 0.26;
                            g.beginPath();
                            g.moveTo(cx, cy);
                            g.lineTo(ex, ey);
                            g.stroke();

                            g.strokeStyle = isPow ? PAL.emerald : '#475569';
                            g.lineWidth = cell * 0.13;
                            g.beginPath();
                            g.moveTo(cx, cy);
                            g.lineTo(ex, ey);
                            g.stroke();

                            if (isPow) {
                                const pulsePos = (t * 1.8) % 1;
                                const px2 = cx + (ex - cx) * pulsePos;
                                const py2 = cy + (ey - cy) * pulsePos;
                                g.fillStyle = '#a7f3d0';
                                g.beginPath();
                                g.arc(px2, py2, 2.5, 0, Math.PI * 2);
                                g.fill();
                            }
                        }
                        // Center hub
                        g.fillStyle = isPow ? PAL.emerald : '#64748b';
                        g.beginPath();
                        g.arc(cx, cy, cell * 0.12, 0, Math.PI * 2);
                        g.fill();
                        g.restore();

                        if (item.kind === 'S') {
                            drawSprite(g, ctx, 'boss_core', cx, cy, cell * 0.62, null, t * 0.6);
                            g.save();
                            g.fillStyle = '#ecfdf5';
                            g.font = '700 13px "JetBrains Mono", monospace';
                            g.textAlign = 'center';
                            g.textBaseline = 'middle';
                            g.fillText('S', cx, cy);
                            g.restore();
                        } else if (item.kind === 'G') {
                            drawSprite(g, ctx, 'portal_vortex', cx, cy, cell * 0.64, null, t * (isPow ? 2.5 : 0.4), isPow ? 1 : 0.6);
                            g.save();
                            g.fillStyle = isPow ? '#ecfdf5' : PAL.cyan;
                            g.font = '700 13px "JetBrains Mono", monospace';
                            g.textAlign = 'center';
                            g.textBaseline = 'middle';
                            g.fillText('G', cx, cy);
                            g.restore();
                        }

                        if (hintCell && hintCell.r === r && hintCell.c === c && !flow.solved) {
                            g.save();
                            g.strokeStyle = PAL.amber;
                            g.lineWidth = 2.6;
                            roundRect(g, x + 3, y + 3, cell - 6, cell - 6, 8);
                            g.stroke();
                            g.restore();
                        }
                    }
                }

                if (flow.solved) {
                    let stars = Core.computeStars(state.moves, state.par);
                    if (bonusLeft <= 0 && stars === 3) stars = 2;
                    const hasNext = levelIdx + 1 < Core.PIPE_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: levelIdx === 2 ? 'STORY CH.5 CLEARED!' : 'CONDUIT ENERGIZED!',
                        stars,
                        message: `All ${flow.totalGates} output gates powered in ${state.moves} rotations`,
                        submessage: bonusLeft > 0 ? `Bonus Time Left: ${bonusLeft.toFixed(1)}s` : 'Completed (Bonus Expired)',
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Grid [Enter]' : 'All 8 Complete!',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                }
            }
        });

        refresh();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.PIPE_LEVELS.length));
            }
        };
    };

    // ========================================================================
    // 4. QUANTUM 2048 (Cosmic Element Fusion)
    // ========================================================================
    ENGINES['quantum-2048'] = function mount2048(ctx) {
        const BEST_KEY = 'cosmic_v11_2048_best';
        function loadBest() {
            try { return Number(global.localStorage.getItem(BEST_KEY) || 0) || 0; } catch (e) { return 0; }
        }
        function saveBest(val) {
            try { global.localStorage.setItem(BEST_KEY, String(val)); } catch (e) { /* ignore */ }
        }

        let state = Core.create2048State(Date.now(), loadBest());
        let popScale = Array.from({ length: 4 }, () => [1, 1, 1, 1]);
        let gameOver = false;
        let showWinBanner = false;
        let endlessContinue = false;
        let winReported = false;
        let overReported = false;
        let dragStart = null;
        let shell;

        function maxTile() {
            let m = 2;
            for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (state.board[r][c] > m) m = state.board[r][c];
            return m;
        }

        function syncHud() {
            const mt = maxTile();
            const meta = Core.ELEMENTS_2048[mt] || Core.ELEMENTS_2048[2048];
            setHudSafe(ctx, {
                gameId: 'quantum-2048',
                score: state.score,
                bestScore: state.bestScore,
                moves: state.moves,
                target: `${mt} (${meta.symbol})`,
                status: gameOver ? 'LOCKED' : (state.wonReached ? 'SINGULARITY' : 'FUSING')
            });
        }

        function resetGame() {
            state = Core.create2048State(Date.now(), loadBest());
            popScale = Array.from({ length: 4 }, () => [1, 1, 1, 1]);
            gameOver = false;
            showWinBanner = false;
            endlessContinue = false;
            winReported = false;
            overReported = false;
            syncHud();
        }

        function doSlide(dir) {
            if (gameOver || showWinBanner) return;
            const res = Core.slide2048(state, dir);
            if (!res.moved) {
                if (res.isGameOver && !overReported) {
                    gameOver = true;
                    overReported = true;
                    playSfx(ctx, 'explodeSmall');
                    if (ctx && ctx.onGameOver) ctx.onGameOver({ gameId: 'quantum-2048', score: state.score, maxTile: maxTile() });
                }
                return;
            }

            playSfx(ctx, res.mergedCells.length > 0 ? 'xpPickup' : 'uiClick');
            if (state.bestScore > loadBest()) saveBest(state.bestScore);

            for (const mc of res.mergedCells) popScale[mc.r][mc.c] = 1.28;
            if (res.spawnedCell) popScale[res.spawnedCell.r][res.spawnedCell.c] = 0.5;

            if (res.wonNow && !winReported) {
                winReported = true;
                if (!endlessContinue) showWinBanner = true;
                playSfx(ctx, 'levelup');
                if (ctx && ctx.onWin) {
                    ctx.onWin({ gameId: 'quantum-2048', score: state.score, moves: state.moves, stars: 3, tile: 2048 });
                }
            }
            if (res.isGameOver && !overReported) {
                gameOver = true;
                overReported = true;
                playSfx(ctx, 'explodeSmall');
                if (ctx && ctx.onGameOver) {
                    ctx.onGameOver({ gameId: 'quantum-2048', score: state.score, maxTile: maxTile() });
                }
            }
            syncHud();
        }

        function doUndo() {
            if (gameOver || showWinBanner) return;
            if (Core.undo2048(state)) {
                playSfx(ctx, 'uiBack');
                syncHud();
            }
        }

        shell = createPuzzleShell(ctx, {
            title: 'QUANTUM 2048',
            boardCursor: 'grab',
            onUpdate(dt) {
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        popScale[r][c] += (1 - popScale[r][c]) * Math.min(1, dt * 14);
                    }
                }
            },
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (k === 'w' || e.key === 'ArrowUp') doSlide('N');
                else if (k === 's' || e.key === 'ArrowDown') doSlide('S');
                else if (k === 'a' || e.key === 'ArrowLeft') doSlide('W');
                else if (k === 'd' || e.key === 'ArrowRight') doSlide('E');
                else if (k === 'z') doUndo();
                else if (k === 'r') resetGame();
            },
            onPointerDown(px, py, e) {
                if (e.button === 0 && px >= BOARD_AREA.x && px <= BOARD_AREA.x + BOARD_AREA.w) {
                    dragStart = { x: px, y: py };
                }
            },
            onPointerUp(px, py) {
                if (!dragStart) return;
                const dx = px - dragStart.x;
                const dy = py - dragStart.y;
                dragStart = null;
                if (Math.hypot(dx, dy) < 26) return;
                if (Math.abs(dx) > Math.abs(dy)) doSlide(dx > 0 ? 'E' : 'W');
                else doSlide(dy > 0 ? 'S' : 'N');
            },
            onRender(g) {
                const mt = maxTile();
                const meta = Core.ELEMENTS_2048[mt] || Core.ELEMENTS_2048[2048];
                shell.drawChrome({
                    subtitle: 'Cosmic Element Fusion (H -> He -> ... -> Singularity)',
                    onUndo: doUndo,
                    canUndo: !!state.prevSnapshot && !gameOver && !showWinBanner,
                    onReset: resetGame
                });

                shell.drawRightPanelStats([
                    { label: 'SCORE', value: state.score, color: PAL.cyan },
                    { label: 'HIGH SCORE', value: state.bestScore, color: PAL.amber },
                    { label: 'MAX ELEMENT', value: `${mt} ${meta.symbol}`, color: meta.glow },
                    { label: 'MOVES', value: state.moves, color: PAL.text }
                ], [
                    'WASD / Arrows or Swipe to fuse',
                    '2 H -> 4 He -> 8 Li -> 16 C -> 32 O',
                    '64 Fe -> 128 Xe -> 256 Nova ->',
                    '512 Pulsar -> 1024 Quasar -> 2048'
                ]);

                const cell = 94;
                const gap = 10;
                const gw = cell * 4 + gap * 5;
                const ox = BOARD_AREA.x + Math.floor((BOARD_AREA.w - gw) / 2);
                const oy = BOARD_AREA.y + Math.floor((BOARD_AREA.h - gw) / 2);

                roundRect(g, ox, oy, gw, gw, 12);
                g.fillStyle = '#0a1226';
                g.strokeStyle = 'rgba(56, 189, 248, 0.28)';
                g.lineWidth = 1.5;
                g.fill();
                g.stroke();

                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        const tx = ox + gap + c * (cell + gap);
                        const ty = oy + gap + r * (cell + gap);
                        roundRect(g, tx, ty, cell, cell, 9);
                        g.fillStyle = 'rgba(15, 23, 42, 0.85)';
                        g.fill();

                        const val = state.board[r][c];
                        if (!val) continue;
                        const el = Core.ELEMENTS_2048[val] || { value: val, symbol: String(val), name: '', color: '#1e293b', glow: '#ffffff' };
                        const sc = popScale[r][c];

                        g.save();
                        g.translate(tx + cell / 2, ty + cell / 2);
                        g.scale(sc, sc);
                        roundRect(g, -cell / 2, -cell / 2, cell, cell, 9);
                        g.fillStyle = el.color;
                        g.strokeStyle = el.glow;
                        g.lineWidth = val >= 256 ? 2.4 : 1.6;
                        g.fill();
                        g.stroke();

                        g.fillStyle = '#f8fafc';
                        g.font = val >= 1024 ? '700 22px "JetBrains Mono", monospace' : '700 26px "JetBrains Mono", monospace';
                        g.textAlign = 'center';
                        g.textBaseline = 'middle';
                        g.fillText(String(val), 0, -10);

                        g.fillStyle = el.glow;
                        g.font = '700 13px "Space Grotesk", system-ui, sans-serif';
                        g.fillText(el.symbol, 0, 18);
                        g.restore();
                    }
                }

                if (showWinBanner) {
                    shell.drawOverlay({
                        isWin: true,
                        title: 'SINGULARITY FORGED!',
                        stars: 3,
                        message: `Score: ${state.score} in ${state.moves} moves`,
                        submessage: '2048 Singularity Element Achieved',
                        secondaryLabel: 'New Game [R]',
                        onSecondary: resetGame,
                        primaryLabel: 'Continue Endless',
                        onPrimary: () => { showWinBanner = false; endlessContinue = true; }
                    });
                } else if (gameOver) {
                    shell.drawOverlay({
                        isWin: false,
                        title: 'FUSION GRID LOCKED',
                        message: `Final Score: ${state.score}`,
                        submessage: `Best Element: ${mt} (${meta.symbol})`,
                        primaryLabel: 'Try Again [R]',
                        onPrimary: resetGame
                    });
                }
            }
        });

        syncHud();
        return {
            destroy: shell.destroy,
            restart() { resetGame(); }
        };
    };

    // ========================================================================
    // 5. NEBULA MINESWEEPER (3 Tiers: 8x8, 10x10, 12x12)
    // ========================================================================
    ENGINES['nebula-minesweeper'] = function mountMinesweeper(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.MINE_LEVELS.length);
        let state = Core.createMinesweeperState(levelIdx);
        let flagMode = false;
        let timer = 0;
        let started = false;
        let hintCell = null;
        let winReported = false;
        let overReported = false;
        let shell;

        const ADJ_COLORS = ['', '#38bdf8', '#34d399', '#f43f5e', '#a78bfa', '#fb923c', '#22d3ee', '#f8fafc', '#94a3b8'];

        function syncHud() {
            setHudSafe(ctx, {
                gameId: 'nebula-minesweeper',
                level: levelIdx + 1,
                maxLevel: Core.MINE_LEVELS.length,
                moves: state.moves,
                minesLeft: state.mineCount - state.flagsPlaced,
                timer: Math.floor(timer),
                score: state.won ? Math.max(200, (levelIdx + 1) * 1000 - Math.floor(timer) * 5) : state.revealedSafeCount * 15,
                status: state.won ? 'CLEARED' : (state.lost ? 'DETONATED' : 'SWEEPING')
            });
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.MINE_LEVELS.length);
            state = Core.createMinesweeperState(levelIdx);
            timer = 0;
            started = false;
            hintCell = null;
            winReported = false;
            overReported = false;
            syncHud();
        }

        function handleResult(res, geo) {
            if (!res.changed) return;
            started = true;
            hintCell = null;
            if (res.exploded) {
                playSfx(ctx, 'explodeSmall');
                if (state.hitMine) {
                    shell.spawnBurst(geo.ox + (state.hitMine.c + 0.5) * geo.cell, geo.oy + (state.hitMine.r + 0.5) * geo.cell, PAL.crimson, 24);
                }
                if (!overReported) {
                    overReported = true;
                    if (ctx && ctx.onGameOver) {
                        ctx.onGameOver({ gameId: 'nebula-minesweeper', level: levelIdx + 1, score: state.revealedSafeCount * 15 });
                    }
                }
            } else {
                playSfx(ctx, res.newlyRevealed.length > 3 ? 'xpPickup' : 'uiClick');
                if (res.won && !winReported) {
                    winReported = true;
                    playSfx(ctx, 'levelup');
                    const parTime = [45, 95, 160][levelIdx] || 90;
                    const stars = timer <= parTime ? 3 : (timer <= parTime * 1.6 ? 2 : 1);
                    const score = Math.max(300, (levelIdx + 1) * 1000 + stars * 250 - Math.floor(timer) * 4);
                    if (ctx && ctx.onWin) {
                        ctx.onWin({
                            gameId: 'nebula-minesweeper',
                            level: levelIdx + 1,
                            maxLevel: Core.MINE_LEVELS.length,
                            time: Math.floor(timer),
                            stars,
                            score
                        });
                    }
                }
            }
            syncHud();
        }

        shell = createPuzzleShell(ctx, {
            title: 'NEBULA MINESWEEPER',
            boardCursor: 'pointer',
            onUpdate(dt) {
                if (started && !state.won && !state.lost) timer += dt;
            },
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (k === 'f') { flagMode = !flagMode; playSfx(ctx, 'uiClick'); }
                else if (k === 'r') loadLevel(levelIdx);
                else if (k === 'h' && !state.won && !state.lost) {
                    hintCell = Core.getMineHint(state);
                    playSfx(ctx, 'powerup');
                }
            },
            onPointerDown(px, py, e) {
                if (state.won || state.lost) return;
                const geo = fitGridRect(state.rows, state.cols, 20);
                const cell = hitCell(px, py, geo, state.rows, state.cols);
                if (!cell) return;
                const isRightOrFlag = e.button === 2 || (e.button === 0 && (e.shiftKey || flagMode));
                const tile = state.grid[cell.r][cell.c];

                if (e.button === 0 && tile.revealed && tile.adj > 0) {
                    handleResult(Core.chordMineCell(state, cell.r, cell.c), geo);
                    return;
                }
                if (isRightOrFlag) {
                    if (Core.toggleMineFlag(state, cell.r, cell.c)) {
                        playSfx(ctx, 'uiClick');
                        syncHud();
                    }
                    return;
                }
                if (e.button === 0) {
                    handleResult(Core.revealMineCell(state, cell.r, cell.c, Date.now()), geo);
                }
            },
            onRender(g, _dt, t) {
                shell.drawChrome({
                    subtitle: state.name,
                    levelIndex: levelIdx,
                    totalLevels: Core.MINE_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onReset: () => loadLevel(levelIdx),
                    onHint: () => {
                        if (!state.won && !state.lost) {
                            hintCell = Core.getMineHint(state);
                            playSfx(ctx, 'powerup');
                        }
                    },
                    disableHint: state.won || state.lost
                });

                const safeTotal = state.rows * state.cols - state.mineCount;
                shell.drawRightPanelStats([
                    { label: 'BOMBS LEFT', value: state.mineCount - state.flagsPlaced, color: PAL.crimson },
                    { label: 'CLEARED', value: `${state.revealedSafeCount} / ${safeTotal}`, color: PAL.cyan },
                    { label: 'TIME', value: `${Math.floor(timer)}s`, color: PAL.amber },
                    { label: 'TOOL MODE', value: flagMode ? 'FLAG [F]' : 'SWEEP [F]', color: flagMode ? PAL.amber : PAL.emerald }
                ], [
                    'Left-Click: Sweep (1st click safe!)',
                    'Right-Click / [F] / Shift: Flag',
                    'Click satisfied # tile: Chord clear',
                    '[R] Reset  [H] Hint'
                ]);

                shell.registerButton('ms_flag_btn', PANEL_AREA.x + 16, PANEL_AREA.y + 198, PANEL_AREA.w - 32, 34,
                    flagMode ? 'Mode: FLAG BOMB [F]' : 'Mode: SWEEP TILE [F]', {
                        active: flagMode,
                        accent: flagMode ? PAL.amber : PAL.cyan,
                        onClick: () => { flagMode = !flagMode; }
                    });

                const geo = fitGridRect(state.rows, state.cols, 20);
                const { cell, ox, oy } = geo;

                for (let r = 0; r < state.rows; r++) {
                    for (let c = 0; c < state.cols; c++) {
                        const x = ox + c * cell;
                        const y = oy + r * cell;
                        const tile = state.grid[r][c];
                        if (!tile.revealed) {
                            roundRect(g, x + 1.5, y + 1.5, cell - 3, cell - 3, 5);
                            g.fillStyle = tile.flagged ? '#291a2e' : '#172542';
                            g.strokeStyle = tile.flagged ? PAL.amber : 'rgba(56, 189, 248, 0.28)';
                            g.lineWidth = 1.2;
                            g.fill();
                            g.stroke();
                            if (tile.flagged) {
                                drawSprite(g, ctx, 'plasma_bomb', x + cell / 2, y + cell / 2, cell * 0.65, (gg, sz) => {
                                    gg.fillStyle = PAL.amber;
                                    gg.beginPath();
                                    gg.arc(0, 0, sz * 0.3, 0, Math.PI * 2);
                                    gg.fill();
                                });
                            }
                        } else {
                            g.fillStyle = tile.mine ? 'rgba(244, 63, 94, 0.25)' : 'rgba(9, 15, 29, 0.9)';
                            g.fillRect(x + 1, y + 1, cell - 2, cell - 2);
                            g.strokeStyle = 'rgba(148, 163, 184, 0.14)';
                            g.lineWidth = 1;
                            g.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
                            if (tile.mine) {
                                drawSprite(g, ctx, 'plasma_bomb', x + cell / 2, y + cell / 2, cell * 0.72, (gg, sz) => {
                                    gg.fillStyle = PAL.crimson;
                                    gg.beginPath();
                                    gg.arc(0, 0, sz * 0.34, 0, Math.PI * 2);
                                    gg.fill();
                                });
                            } else if (tile.adj > 0) {
                                g.save();
                                g.fillStyle = ADJ_COLORS[tile.adj] || PAL.text;
                                g.font = `700 ${Math.floor(cell * 0.52)}px "JetBrains Mono", monospace`;
                                g.textAlign = 'center';
                                g.textBaseline = 'middle';
                                g.fillText(String(tile.adj), x + cell / 2, y + cell / 2 + 1);
                                g.restore();
                            }
                        }
                        if (hintCell && hintCell.r === r && hintCell.c === c && !tile.revealed) {
                            g.save();
                            g.strokeStyle = PAL.emerald;
                            g.lineWidth = 2.4 + Math.sin(t * 8) * 0.8;
                            roundRect(g, x + 2, y + 2, cell - 4, cell - 4, 6);
                            g.stroke();
                            g.restore();
                        }
                    }
                }

                if (state.won) {
                    const parTime = [45, 95, 160][levelIdx] || 90;
                    const stars = timer <= parTime ? 3 : (timer <= parTime * 1.6 ? 2 : 1);
                    const hasNext = levelIdx + 1 < Core.MINE_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: 'SECTOR ANOMALIES CLEARED!',
                        stars,
                        message: `${state.name} swept in ${Math.floor(timer)}s`,
                        submessage: `All ${state.mineCount} Plasma Bombs neutralized`,
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Tier' : 'Play Tier 1',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                } else if (state.lost) {
                    shell.drawOverlay({
                        isWin: false,
                        title: 'PLASMA DETONATION!',
                        message: 'Hull breached by cloaked plasma mine',
                        submessage: `Swept ${state.revealedSafeCount}/${safeTotal} safe sectors`,
                        primaryLabel: 'Retry Sector [R]',
                        onPrimary: () => loadLevel(levelIdx)
                    });
                }
            }
        });

        syncHud();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.MINE_LEVELS.length));
            }
        };
    };

    // ========================================================================
    // 6. MATCH-3 ISOTOPE CORE (7x7, 8 Progressive Levels)
    // ========================================================================
    ENGINES['match3-isotope-core'] = function mountMatch3(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.MATCH3_LEVELS.length);
        let state = Core.createMatch3State(levelIdx, Date.now());
        let selected = null;
        let dragFrom = null;
        let hintMove = null;
        let cascadeTimer = 0;
        let resolving = false;
        let preferredNova = undefined;
        let won = false;
        let lost = false;
        let winReported = false;
        let overReported = false;
        let shell;

        const GEM_COLORS = ['#38bdf8', '#c084fc', '#fbbf24', '#f43f5e', '#34d399', '#818cf8'];

        function syncHud() {
            setHudSafe(ctx, {
                gameId: 'match3-isotope-core',
                level: levelIdx + 1,
                maxLevel: Core.MATCH3_LEVELS.length,
                score: state.score,
                target: `${state.score}/${state.targetScore}`,
                moves: state.movesLeft,
                status: won ? 'CRITICALITY' : (lost ? 'DEPLETED' : 'ACTIVE')
            });
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.MATCH3_LEVELS.length);
            state = Core.createMatch3State(levelIdx, Date.now() + idx * 97);
            selected = null;
            dragFrom = null;
            hintMove = null;
            resolving = false;
            cascadeTimer = 0;
            won = false;
            lost = false;
            winReported = false;
            overReported = false;
            syncHud();
        }

        function triggerSwap(a, b) {
            if (resolving || won || lost) return;
            const sw = Core.tryMatch3Swap(state, a, b);
            selected = null;
            hintMove = null;
            if (!sw.valid) {
                playSfx(ctx, 'uiBack');
                return;
            }
            preferredNova = b;
            resolving = true;
            cascadeTimer = 0.05;
            syncHud();
        }

        function runCascadeStep() {
            const geo = fitGridRect(state.size, state.size, 22);
            const res = Core.resolveMatch3CascadeStep(state, preferredNova);
            preferredNova = undefined;
            if (!res.hadMatches) {
                resolving = false;
                if (res.shuffled) {
                    shell.spawnFloater(BOARD_AREA.x + BOARD_AREA.w / 2, BOARD_AREA.y + 40, 'AUTO-SHUFFLE!', PAL.cyan);
                }
                if (state.score >= state.targetScore) {
                    won = true;
                    if (!winReported) {
                        winReported = true;
                        playSfx(ctx, 'levelup');
                        const stars = state.movesLeft >= 5 ? 3 : (state.movesLeft >= 2 ? 2 : 1);
                        if (ctx && ctx.onWin) {
                            ctx.onWin({
                                gameId: 'match3-isotope-core',
                                level: levelIdx + 1,
                                maxLevel: Core.MATCH3_LEVELS.length,
                                score: state.score,
                                movesLeft: state.movesLeft,
                                stars
                            });
                        }
                    }
                } else if (state.movesLeft <= 0) {
                    lost = true;
                    if (!overReported) {
                        overReported = true;
                        playSfx(ctx, 'explodeSmall');
                        if (ctx && ctx.onGameOver) {
                            ctx.onGameOver({
                                gameId: 'match3-isotope-core',
                                level: levelIdx + 1,
                                score: state.score,
                                target: state.targetScore
                            });
                        }
                    }
                }
                syncHud();
                return;
            }

            playSfx(ctx, res.purgedKinds.length > 0 || res.novaRows.length > 0 ? 'powerup' : 'xpPickup');
            for (const c of res.cleared) {
                shell.spawnBurst(
                    geo.ox + (c.c + 0.5) * geo.cell,
                    geo.oy + (c.r + 0.5) * geo.cell,
                    GEM_COLORS[c.kind] || PAL.cyan,
                    6
                );
            }
            if (res.novaRows.length > 0) {
                shell.spawnFloater(BOARD_AREA.x + BOARD_AREA.w / 2, geo.oy + (res.novaRows[0] + 0.5) * geo.cell, 'NOVA ROW CLEAR!', PAL.cyan);
            }
            if (res.purgedKinds.length > 0) {
                shell.spawnFloater(BOARD_AREA.x + BOARD_AREA.w / 2, BOARD_AREA.y + 120, 'COLOR PURGE!', PAL.amber);
            }
            if (res.scoreGain > 0) {
                shell.spawnFloater(
                    BOARD_AREA.x + BOARD_AREA.w / 2,
                    BOARD_AREA.y + BOARD_AREA.h / 2,
                    res.combo > 1 ? `+${res.scoreGain} (x${(1 + (res.combo - 1) * 0.5).toFixed(1)})` : `+${res.scoreGain}`,
                    PAL.amber
                );
            }
            cascadeTimer = 0.24;
            syncHud();
        }

        shell = createPuzzleShell(ctx, {
            title: 'MATCH-3 ISOTOPE CORE',
            boardCursor: 'pointer',
            onUpdate(dt) {
                if (resolving) {
                    cascadeTimer -= dt;
                    if (cascadeTimer <= 0) runCascadeStep();
                }
            },
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (k === 'r') loadLevel(levelIdx);
                else if (k === 'h' && !resolving && !won && !lost) {
                    hintMove = Core.findValidMatch3Move(state.grid);
                    playSfx(ctx, 'powerup');
                }
            },
            onPointerDown(px, py, e) {
                if (e.button !== 0 || resolving || won || lost) return;
                const geo = fitGridRect(state.size, state.size, 22);
                const cell = hitCell(px, py, geo, state.size, state.size);
                if (!cell) return;
                dragFrom = cell;
                if (!selected) {
                    selected = cell;
                    playSfx(ctx, 'uiClick');
                } else if (selected.r === cell.r && selected.c === cell.c) {
                    selected = null;
                } else if (Math.abs(selected.r - cell.r) + Math.abs(selected.c - cell.c) === 1) {
                    triggerSwap(selected, cell);
                } else {
                    selected = cell;
                    playSfx(ctx, 'uiClick');
                }
            },
            onPointerMove(px, py) {
                if (!dragFrom || resolving || won || lost) return;
                const geo = fitGridRect(state.size, state.size, 22);
                const cell = hitCell(px, py, geo, state.size, state.size);
                if (cell && Math.abs(dragFrom.r - cell.r) + Math.abs(dragFrom.c - cell.c) === 1) {
                    const a = dragFrom;
                    dragFrom = null;
                    triggerSwap(a, cell);
                }
            },
            onPointerUp() {
                dragFrom = null;
            },
            onRender(g, _dt, t) {
                shell.drawChrome({
                    subtitle: `Core ${levelIdx + 1}: ${state.name} (${state.typesCount} Isotopes)`,
                    levelIndex: levelIdx,
                    totalLevels: Core.MATCH3_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onReset: () => loadLevel(levelIdx),
                    onHint: () => {
                        if (!resolving && !won && !lost) {
                            hintMove = Core.findValidMatch3Move(state.grid);
                            playSfx(ctx, 'powerup');
                        }
                    },
                    disableHint: resolving || won || lost
                });

                shell.drawRightPanelStats([
                    { label: 'SCORE', value: state.score, color: PAL.cyan },
                    { label: 'TARGET', value: state.targetScore, color: PAL.amber },
                    { label: 'MOVES LEFT', value: state.movesLeft, color: state.movesLeft <= 3 ? PAL.crimson : PAL.emerald },
                    { label: 'COMBO', value: state.combo > 1 ? `x${(1 + (state.combo - 1) * 0.5).toFixed(1)}` : 'x1.0', color: PAL.violet }
                ], [
                    'Swap adjacent isotopes to match 3+',
                    '4-Match: Spawns Nova Row Clear',
                    '5-Match: Purges ALL of color!',
                    '[R] Reset  [H] Hint'
                ]);

                // Progress bar in right panel
                const pct = Math.min(1, state.score / state.targetScore);
                const barX = PANEL_AREA.x + 16;
                const barY = PANEL_AREA.y + 196;
                const barW = PANEL_AREA.w - 32;
                roundRect(g, barX, barY, barW, 14, 7);
                g.fillStyle = 'rgba(15, 23, 42, 0.9)';
                g.fill();
                if (pct > 0) {
                    roundRect(g, barX, barY, Math.max(10, barW * pct), 14, 7);
                    g.fillStyle = won ? PAL.emerald : PAL.cyan;
                    g.fill();
                }

                const geo = fitGridRect(state.size, state.size, 22);
                const { cell, ox, oy } = geo;

                for (let r = 0; r < state.size; r++) {
                    for (let c = 0; c < state.size; c++) {
                        const x = ox + c * cell;
                        const y = oy + r * cell;
                        g.fillStyle = (r + c) % 2 === 0 ? 'rgba(12, 20, 38, 0.85)' : 'rgba(16, 26, 48, 0.85)';
                        g.fillRect(x + 1, y + 1, cell - 2, cell - 2);

                        const gem = state.grid[r][c];
                        if (!gem) continue;
                        const cx = x + cell / 2;
                        const cy = y + cell / 2;
                        const col = GEM_COLORS[gem.kind] || PAL.cyan;

                        if (gem.special === 'nova_row') {
                            g.save();
                            g.strokeStyle = '#f8fafc';
                            g.lineWidth = 2.2;
                            g.beginPath();
                            g.arc(cx, cy, cell * 0.41, 0, Math.PI * 2);
                            g.stroke();
                            g.strokeStyle = col;
                            g.beginPath();
                            g.moveTo(x + 4, cy);
                            g.lineTo(x + cell - 4, cy);
                            g.stroke();
                            g.restore();
                        }

                        const sKey = Core.MATCH3_SPRITE_KEYS[gem.kind] || 'cryo_crystal';
                        drawSprite(g, ctx, sKey, cx, cy, cell * 0.72, (gg, sz) => {
                            gg.fillStyle = col;
                            gg.beginPath();
                            gg.arc(0, 0, sz * 0.36, 0, Math.PI * 2);
                            gg.fill();
                        });

                        if (selected && selected.r === r && selected.c === c) {
                            g.save();
                            g.strokeStyle = PAL.amber;
                            g.lineWidth = 2.8;
                            roundRect(g, x + 2, y + 2, cell - 4, cell - 4, 8);
                            g.stroke();
                            g.restore();
                        }
                        if (hintMove && ((hintMove.a.r === r && hintMove.a.c === c) || (hintMove.b.r === r && hintMove.b.c === c))) {
                            g.save();
                            g.strokeStyle = PAL.emerald;
                            g.lineWidth = 2.5 + Math.sin(t * 9) * 0.8;
                            roundRect(g, x + 3, y + 3, cell - 6, cell - 6, 8);
                            g.stroke();
                            g.restore();
                        }
                    }
                }

                if (won) {
                    const stars = state.movesLeft >= 5 ? 3 : (state.movesLeft >= 2 ? 2 : 1);
                    const hasNext = levelIdx + 1 < Core.MATCH3_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: 'CORE THRESHOLD REACHED!',
                        stars,
                        message: `Scored ${state.score} (Goal ${state.targetScore})`,
                        submessage: `Remaining Moves: ${state.movesLeft}`,
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Core' : 'Play Level 1',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                } else if (lost) {
                    shell.drawOverlay({
                        isWin: false,
                        title: 'REACTOR DEPLETED',
                        message: `Scored ${state.score} / ${state.targetScore} needed`,
                        submessage: 'No isotope moves remaining',
                        primaryLabel: 'Retry Core [R]',
                        onPrimary: () => loadLevel(levelIdx)
                    });
                }
            }
        });

        syncHud();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.MATCH3_LEVELS.length));
            }
        };
    };

    // ========================================================================
    // 7. LIGHTS OUT ARRAY (10 Solvable Levels + GF(2) Optimal Hint)
    // ========================================================================
    ENGINES['lights-out-array'] = function mountLightsOut(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.LIGHTS_OUT_LEVELS.length);
        let state = Core.createLightsOutState(levelIdx);
        let solved = false;
        let hintCell = null;
        let winReported = false;
        let shell;

        function litCount() {
            let n = 0;
            for (let r = 0; r < state.size; r++) for (let c = 0; c < state.size; c++) if (state.grid[r][c]) n++;
            return n;
        }

        function syncHud() {
            const total = state.size * state.size;
            setHudSafe(ctx, {
                gameId: 'lights-out-array',
                level: levelIdx + 1,
                maxLevel: Core.LIGHTS_OUT_LEVELS.length,
                moves: state.moves,
                par: state.par,
                target: `${litCount()}/${total} Nodes`,
                score: Math.max(100, 1100 - state.moves * 25),
                status: solved ? 'SYNCED' : 'SYNCING'
            });
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.LIGHTS_OUT_LEVELS.length);
            state = Core.createLightsOutState(levelIdx);
            solved = Core.isLightsOutSolved(state);
            hintCell = null;
            winReported = false;
            syncHud();
        }

        function doToggle(r, c) {
            if (solved) return;
            if (!Core.toggleLightsOut(state, r, c)) return;
            playSfx(ctx, 'uiClick');
            hintCell = null;
            solved = Core.isLightsOutSolved(state);
            if (solved && !winReported) {
                winReported = true;
                playSfx(ctx, 'levelup');
                const stars = Core.computeStars(state.moves, state.par);
                const score = Math.max(200, 1200 + stars * 250 - state.moves * 20);
                if (ctx && ctx.onWin) {
                    ctx.onWin({
                        gameId: 'lights-out-array',
                        level: levelIdx + 1,
                        maxLevel: Core.LIGHTS_OUT_LEVELS.length,
                        moves: state.moves,
                        par: state.par,
                        stars,
                        score
                    });
                }
            }
            syncHud();
        }

        function doUndo() {
            if (solved) return;
            if (Core.undoLightsOut(state)) {
                playSfx(ctx, 'uiBack');
                hintCell = null;
                syncHud();
            }
        }

        function doHint() {
            if (solved) return;
            const sol = Core.solveLightsOutGF2(state.grid);
            hintCell = sol.length > 0 ? sol[0] : null;
            playSfx(ctx, 'powerup');
        }

        shell = createPuzzleShell(ctx, {
            title: 'LIGHTS OUT ARRAY',
            boardCursor: 'pointer',
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (k === 'z') doUndo();
                else if (k === 'r') loadLevel(levelIdx);
                else if (k === 'h') doHint();
                else if (e.key === 'Enter' && solved && levelIdx + 1 < Core.LIGHTS_OUT_LEVELS.length) loadLevel(levelIdx + 1);
            },
            onPointerDown(px, py, e) {
                if (e.button !== 0 || solved) return;
                const geo = fitGridRect(state.size, state.size, 26);
                const cell = hitCell(px, py, geo, state.size, state.size);
                if (cell) doToggle(cell.r, cell.c);
            },
            onRender(g, _dt, t) {
                shell.drawChrome({
                    subtitle: `Array ${levelIdx + 1}: ${state.name}`,
                    levelIndex: levelIdx,
                    totalLevels: Core.LIGHTS_OUT_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onUndo: doUndo,
                    canUndo: state.undoStack.length > 0 && !solved,
                    onReset: () => loadLevel(levelIdx),
                    onHint: doHint,
                    disableHint: solved
                });

                const total = state.size * state.size;
                const lit = litCount();
                shell.drawRightPanelStats([
                    { label: 'TOGGLES', value: state.moves, color: PAL.cyan },
                    { label: 'PAR (3★)', value: state.par, color: PAL.amber },
                    { label: 'NODES CYAN', value: `${lit} / ${total}`, color: solved ? PAL.emerald : PAL.text },
                    { label: 'GRID SIZE', value: `${state.size}x${state.size}`, color: PAL.violet }
                ], [
                    'Click node to toggle + cross',
                    'Synchronize ALL nodes ON cyan!',
                    '[H] Hint uses GF(2) optimal solver',
                    '[Z] Undo  [R] Reset'
                ]);

                const geo = fitGridRect(state.size, state.size, 26);
                const { cell, ox, oy } = geo;

                for (let r = 0; r < state.size; r++) {
                    for (let c = 0; c < state.size; c++) {
                        const x = ox + c * cell;
                        const y = oy + r * cell;
                        const on = state.grid[r][c];
                        roundRect(g, x + 4, y + 4, cell - 8, cell - 8, 10);
                        if (on) {
                            g.fillStyle = 'rgba(14, 116, 144, 0.72)';
                            g.strokeStyle = '#38bdf8';
                        } else {
                            g.fillStyle = 'rgba(15, 23, 42, 0.85)';
                            g.strokeStyle = 'rgba(100, 116, 139, 0.35)';
                        }
                        g.lineWidth = on ? 2.2 : 1.2;
                        g.fill();
                        g.stroke();

                        g.save();
                        g.fillStyle = on ? '#e0f2fe' : '#334155';
                        g.beginPath();
                        g.arc(x + cell / 2, y + cell / 2, cell * (on ? 0.19 : 0.11), 0, Math.PI * 2);
                        g.fill();
                        g.restore();

                        if (hintCell && hintCell.r === r && hintCell.c === c && !solved) {
                            g.save();
                            g.strokeStyle = PAL.amber;
                            g.lineWidth = 3 + Math.sin(t * 9) * 1;
                            roundRect(g, x + 2, y + 2, cell - 4, cell - 4, 11);
                            g.stroke();
                            g.restore();
                        }
                    }
                }

                if (solved) {
                    const stars = Core.computeStars(state.moves, state.par);
                    const hasNext = levelIdx + 1 < Core.LIGHTS_OUT_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: 'TRANSPONDER SYNCED!',
                        stars,
                        message: `Synchronized ${state.size}x${state.size} grid in ${state.moves} toggles`,
                        submessage: `Par: ${state.par}`,
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Array [Enter]' : 'All 10 Complete!',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                }
            }
        });

        syncHud();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.LIGHTS_OUT_LEVELS.length));
            }
        };
    };

    // ========================================================================
    // 8. MEMORY STAR MATRIX (6 Progressive Levels 4x3 .. 6x4, 1.2s Peek)
    // ========================================================================
    ENGINES['memory-star-matrix'] = function mountMemory(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.MEMORY_LEVELS.length);
        let state = Core.createMemoryState(levelIdx, Date.now());
        let peekTimer = 1.2;
        let mismatchTimer = 0;
        let playTime = 0;
        let won = false;
        let winReported = false;
        let shell;

        function syncHud() {
            setHudSafe(ctx, {
                gameId: 'memory-star-matrix',
                level: levelIdx + 1,
                maxLevel: Core.MEMORY_LEVELS.length,
                score: state.score,
                moves: state.moves,
                streak: state.streak,
                target: `${state.matchedPairs}/${state.totalPairs} Pairs`,
                status: won ? 'SYNCED' : (peekTimer > 0 ? 'SCANNING' : 'ACTIVE')
            });
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.MEMORY_LEVELS.length);
            state = Core.createMemoryState(levelIdx, Date.now() + idx * 131);
            peekTimer = 1.2;
            mismatchTimer = 0;
            playTime = 0;
            won = false;
            winReported = false;
            syncHud();
        }

        function cardRect(r, c) {
            const pad = 22;
            const availW = BOARD_AREA.w - pad * 2;
            const availH = BOARD_AREA.h - pad * 2;
            const gap = 12;
            const cellW = Math.floor((availW - gap * (state.cols - 1)) / state.cols);
            const cellH = Math.floor((availH - gap * (state.rows - 1)) / state.rows);
            const sz = Math.min(cellW, cellH);
            const gw = sz * state.cols + gap * (state.cols - 1);
            const gh = sz * state.rows + gap * (state.rows - 1);
            const ox = BOARD_AREA.x + Math.floor((BOARD_AREA.w - gw) / 2);
            const oy = BOARD_AREA.y + Math.floor((BOARD_AREA.h - gh) / 2);
            return { x: ox + c * (sz + gap), y: oy + r * (sz + gap), sz };
        }

        shell = createPuzzleShell(ctx, {
            title: 'MEMORY STAR MATRIX',
            boardCursor: 'pointer',
            onUpdate(dt) {
                if (peekTimer > 0) {
                    peekTimer = Math.max(0, peekTimer - dt);
                    return;
                }
                if (!won) playTime += dt;
                if (state.mismatchPending) {
                    mismatchTimer -= dt;
                    if (mismatchTimer <= 0) {
                        Core.resolveMemoryMismatch(state);
                    }
                }
            },
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (k === 'r') loadLevel(levelIdx);
                else if (e.key === 'Enter' && won && levelIdx + 1 < Core.MEMORY_LEVELS.length) loadLevel(levelIdx + 1);
            },
            onPointerDown(px, py, e) {
                if (e.button !== 0 || won || peekTimer > 0) return;
                if (state.mismatchPending) {
                    Core.resolveMemoryMismatch(state);
                    mismatchTimer = 0;
                }
                for (let i = 0; i < state.cards.length; i++) {
                    const r = Math.floor(i / state.cols);
                    const c = i % state.cols;
                    const rect = cardRect(r, c);
                    if (px >= rect.x && px <= rect.x + rect.sz && py >= rect.y && py <= rect.y + rect.sz) {
                        const res = Core.pickMemoryCard(state, i);
                        if (!res.accepted) return;
                        if (res.matched) {
                            playSfx(ctx, 'xpPickup');
                            shell.spawnBurst(rect.x + rect.sz / 2, rect.y + rect.sz / 2, PAL.emerald, 14);
                            shell.spawnFloater(rect.x + rect.sz / 2, rect.y + 12, `+${res.scoreGain}${state.streak > 1 ? ` x${state.streak}` : ''}`, PAL.amber);
                        } else if (res.mismatch) {
                            playSfx(ctx, 'uiBack');
                            mismatchTimer = 0.62;
                        } else {
                            playSfx(ctx, 'uiClick');
                        }
                        if (res.won && !winReported) {
                            won = true;
                            winReported = true;
                            playSfx(ctx, 'levelup');
                            const stars = Core.computeStars(state.moves, state.parMoves);
                            const finalScore = state.score + Math.max(0, Math.round(500 - playTime * 8));
                            if (ctx && ctx.onWin) {
                                ctx.onWin({
                                    gameId: 'memory-star-matrix',
                                    level: levelIdx + 1,
                                    maxLevel: Core.MEMORY_LEVELS.length,
                                    moves: state.moves,
                                    time: Math.floor(playTime),
                                    stars,
                                    score: finalScore
                                });
                            }
                        }
                        syncHud();
                        return;
                    }
                }
            },
            onRender(g) {
                shell.drawChrome({
                    subtitle: `Archive ${levelIdx + 1}: ${state.name}`,
                    levelIndex: levelIdx,
                    totalLevels: Core.MEMORY_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onReset: () => loadLevel(levelIdx)
                });

                shell.drawRightPanelStats([
                    { label: 'SCORE', value: state.score, color: PAL.cyan },
                    { label: 'PAIRS', value: `${state.matchedPairs} / ${state.totalPairs}`, color: won ? PAL.emerald : PAL.text },
                    { label: 'MOVES / PAR', value: `${state.moves} / ${state.parMoves}`, color: PAL.amber },
                    { label: 'STREAK MULT', value: `x${Math.max(1, state.streak)}`, color: state.streak > 1 ? PAL.emerald : PAL.violet },
                    { label: 'TIME', value: `${playTime.toFixed(1)}s`, color: PAL.text }
                ], [
                    'Memorize artifacts during 1.2s scan',
                    'Match pairs consecutively for streaks',
                    '[R] Reset Matrix'
                ]);

                if (peekTimer > 0) {
                    g.save();
                    g.fillStyle = PAL.amber;
                    g.font = '700 12px "JetBrains Mono", monospace';
                    g.textAlign = 'center';
                    g.fillText(`QUANTUM SCAN PEEK: ${peekTimer.toFixed(1)}s`, BOARD_AREA.x + BOARD_AREA.w / 2, BOARD_AREA.y + 18);
                    g.restore();
                }

                for (let i = 0; i < state.cards.length; i++) {
                    const card = state.cards[i];
                    const r = Math.floor(i / state.cols);
                    const c = i % state.cols;
                    const { x, y, sz } = cardRect(r, c);
                    const faceUp = peekTimer > 0 || card.revealed || card.matched;

                    roundRect(g, x, y, sz, sz, 10);
                    if (card.matched) {
                        g.fillStyle = 'rgba(6, 78, 59, 0.45)';
                        g.strokeStyle = PAL.emerald;
                    } else if (faceUp) {
                        g.fillStyle = 'rgba(14, 116, 144, 0.35)';
                        g.strokeStyle = PAL.cyan;
                    } else {
                        g.fillStyle = 'rgba(15, 23, 42, 0.92)';
                        g.strokeStyle = 'rgba(148, 163, 184, 0.35)';
                    }
                    g.lineWidth = faceUp ? 2 : 1.3;
                    g.fill();
                    g.stroke();

                    if (faceUp) {
                        drawSprite(g, ctx, card.spriteKey, x + sz / 2, y + sz / 2, sz * 0.72);
                    } else {
                        g.save();
                        g.strokeStyle = 'rgba(56, 189, 248, 0.25)';
                        g.lineWidth = 1.5;
                        g.beginPath();
                        g.arc(x + sz / 2, y + sz / 2, sz * 0.22, 0, Math.PI * 2);
                        g.stroke();
                        g.fillStyle = 'rgba(56, 189, 248, 0.35)';
                        g.font = '700 14px "JetBrains Mono", monospace';
                        g.textAlign = 'center';
                        g.textBaseline = 'middle';
                        g.fillText('?', x + sz / 2, y + sz / 2 + 1);
                        g.restore();
                    }
                }

                if (won) {
                    const stars = Core.computeStars(state.moves, state.parMoves);
                    const hasNext = levelIdx + 1 < Core.MEMORY_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: 'STAR MATRIX DECODED!',
                        stars,
                        message: `All ${state.totalPairs} pairs matched in ${state.moves} moves`,
                        submessage: `Best Streak: x${state.bestStreak} · Time: ${playTime.toFixed(1)}s`,
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Matrix [Enter]' : 'All 6 Complete!',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                }
            }
        });

        syncHud();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.MEMORY_LEVELS.length));
            }
        };
    };

    // ========================================================================
    // 9. NONOGRAM STAR MAP (8 Handcrafted Uniquely-Solvable Picross Puzzles)
    // ========================================================================
    ENGINES['nonogram-star-map'] = function mountNonogram(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.NONOGRAM_LEVELS.length);
        let state = Core.createNonogramState(levelIdx);
        let clueStatus = Core.getNonogramClueStatus(state);
        let crossMode = false;
        let paintMark = null;
        let hintCell = null;
        let solved = false;
        let winReported = false;
        let shell;

        function getLayout() {
            const maxRowClueLen = Math.max(...state.rowClues.map((a) => a.length));
            const maxColClueLen = Math.max(...state.colClues.map((a) => a.length));
            const clueLeftW = Math.max(76, maxRowClueLen * 22 + 14);
            const clueTopH = Math.max(70, maxColClueLen * 20 + 12);
            const availW = BOARD_AREA.w - 32 - clueLeftW;
            const availH = BOARD_AREA.h - 30 - clueTopH;
            const cell = Math.floor(Math.min(availW / state.cols, availH / state.rows));
            const totalW = clueLeftW + cell * state.cols;
            const totalH = clueTopH + cell * state.rows;
            const ox = BOARD_AREA.x + Math.floor((BOARD_AREA.w - totalW) / 2) + clueLeftW;
            const oy = BOARD_AREA.y + Math.floor((BOARD_AREA.h - totalH) / 2) + clueTopH;
            return { cell, ox, oy, clueLeftW, clueTopH };
        }

        function refresh() {
            clueStatus = Core.getNonogramClueStatus(state);
            solved = Core.isNonogramSolved(state);
            const filledCount = state.board.flat().filter((v) => v === 1).length;
            setHudSafe(ctx, {
                gameId: 'nonogram-star-map',
                level: levelIdx + 1,
                maxLevel: Core.NONOGRAM_LEVELS.length,
                moves: state.moves,
                target: `${state.rows}x${state.cols} (${state.name})`,
                score: Math.max(100, 1200 - state.moves * 4 + filledCount * 10),
                status: solved ? 'DECODED' : 'MAPPING'
            });
            if (solved && !winReported) {
                winReported = true;
                playSfx(ctx, 'levelup');
                const targetPixels = state.solution.flat().filter((v) => v === 1).length;
                const stars = state.moves <= targetPixels + 6 ? 3 : (state.moves <= targetPixels + 18 ? 2 : 1);
                if (ctx && ctx.onWin) {
                    ctx.onWin({
                        gameId: 'nonogram-star-map',
                        level: levelIdx + 1,
                        maxLevel: Core.NONOGRAM_LEVELS.length,
                        name: state.name,
                        moves: state.moves,
                        stars,
                        score: 1000 + stars * 250
                    });
                }
            }
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.NONOGRAM_LEVELS.length);
            state = Core.createNonogramState(levelIdx);
            hintCell = null;
            paintMark = null;
            winReported = false;
            refresh();
        }

        function doUndo() {
            if (solved) return;
            if (Core.undoNonogram(state)) {
                playSfx(ctx, 'uiBack');
                hintCell = null;
                refresh();
            }
        }

        function applyMarkAt(r, c, mark) {
            if (Core.setNonogramCell(state, r, c, mark)) {
                playSfx(ctx, mark === 1 ? 'xpPickup' : 'uiClick');
                hintCell = null;
                refresh();
            }
        }

        shell = createPuzzleShell(ctx, {
            title: 'NONOGRAM STAR MAP',
            boardCursor: 'pointer',
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (k === 'x') { crossMode = !crossMode; playSfx(ctx, 'uiClick'); }
                else if (k === 'z') doUndo();
                else if (k === 'r') loadLevel(levelIdx);
                else if (k === 'h' && !solved) {
                    const h = Core.getNonogramHint(state);
                    if (h) {
                        hintCell = h;
                        const targetMark = state.solution[h.r][h.c] === 1 ? 1 : 2;
                        applyMarkAt(h.r, h.c, targetMark);
                    }
                } else if (e.key === 'Enter' && solved && levelIdx + 1 < Core.NONOGRAM_LEVELS.length) {
                    loadLevel(levelIdx + 1);
                }
            },
            onPointerDown(px, py, e) {
                if (solved) return;
                const geo = getLayout();
                const cell = hitCell(px, py, geo, state.rows, state.cols);
                if (!cell) return;
                const cur = state.board[cell.r][cell.c];
                const isCrossClick = e.button === 2 || (e.button === 0 && (e.shiftKey || crossMode));
                if (isCrossClick) {
                    paintMark = cur === 2 ? 0 : 2;
                } else if (e.button === 0) {
                    paintMark = cur === 1 ? 0 : 1;
                } else {
                    return;
                }
                applyMarkAt(cell.r, cell.c, paintMark);
            },
            onPointerMove(px, py) {
                if (paintMark === null || solved) return;
                const geo = getLayout();
                const cell = hitCell(px, py, geo, state.rows, state.cols);
                if (cell) applyMarkAt(cell.r, cell.c, paintMark);
            },
            onPointerUp() {
                paintMark = null;
            },
            onRender(g) {
                shell.drawChrome({
                    subtitle: `Star Map ${levelIdx + 1}: ${solved ? state.name : 'Classified Pattern'} (${state.rows}x${state.cols})`,
                    levelIndex: levelIdx,
                    totalLevels: Core.NONOGRAM_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onUndo: doUndo,
                    canUndo: state.undoStack.length > 0 && !solved,
                    onReset: () => loadLevel(levelIdx),
                    onHint: () => {
                        if (!solved) {
                            const h = Core.getNonogramHint(state);
                            if (h) applyMarkAt(h.r, h.c, state.solution[h.r][h.c] === 1 ? 1 : 2);
                        }
                    },
                    disableHint: solved
                });

                const rowsDoneCount = clueStatus.rowDone.filter(Boolean).length;
                shell.drawRightPanelStats([
                    { label: 'GRID SIZE', value: `${state.rows}x${state.cols}`, color: PAL.cyan },
                    { label: 'ROWS SOLVED', value: `${rowsDoneCount} / ${state.rows}`, color: solved ? PAL.emerald : PAL.text },
                    { label: 'EDITS', value: state.moves, color: PAL.amber },
                    { label: 'TOOL', value: crossMode ? 'CROSS × [X]' : 'FILL ■ [X]', color: crossMode ? PAL.amber : PAL.cyan }
                ], [
                    'Left-Click / Drag: Fill cyan',
                    'Right-Click / [X]: Mark × empty',
                    'Auto-crosses completed lines!',
                    '[Z] Undo  [R] Reset  [H] Reveal 1'
                ]);

                shell.registerButton('ng_mode_btn', PANEL_AREA.x + 16, PANEL_AREA.y + 198, PANEL_AREA.w - 32, 34,
                    crossMode ? 'Brush: MARK × [X]' : 'Brush: FILL CYAN [X]', {
                        active: crossMode,
                        accent: crossMode ? PAL.amber : PAL.cyan,
                        onClick: () => { crossMode = !crossMode; }
                    });

                const { cell, ox, oy } = getLayout();

                // Row clues (left)
                g.save();
                g.textBaseline = 'middle';
                g.textAlign = 'right';
                for (let r = 0; r < state.rows; r++) {
                    const clues = state.rowClues[r];
                    const groupsDone = clueStatus.rowGroupDone[r];
                    const cy = oy + (r + 0.5) * cell;
                    let cx = ox - 10;
                    for (let i = clues.length - 1; i >= 0; i--) {
                        const done = clueStatus.rowDone[r] || groupsDone[i];
                        g.fillStyle = done ? PAL.emerald : PAL.text;
                        g.font = `700 ${Math.min(15, Math.floor(cell * 0.44))}px "JetBrains Mono", monospace`;
                        g.fillText(String(clues[i]), cx, cy);
                        cx -= 20;
                    }
                }

                // Col clues (top)
                g.textAlign = 'center';
                for (let c = 0; c < state.cols; c++) {
                    const clues = state.colClues[c];
                    const groupsDone = clueStatus.colGroupDone[c];
                    const cx = ox + (c + 0.5) * cell;
                    let cy = oy - 12;
                    for (let i = clues.length - 1; i >= 0; i--) {
                        const done = clueStatus.colDone[c] || groupsDone[i];
                        g.fillStyle = done ? PAL.emerald : PAL.text;
                        g.font = `700 ${Math.min(15, Math.floor(cell * 0.44))}px "JetBrains Mono", monospace`;
                        g.fillText(String(clues[i]), cx, cy);
                        cy -= 18;
                    }
                }
                g.restore();

                // Grid cells
                for (let r = 0; r < state.rows; r++) {
                    for (let c = 0; c < state.cols; c++) {
                        const x = ox + c * cell;
                        const y = oy + r * cell;
                        const v = state.board[r][c];
                        g.fillStyle = v === 1 ? 'rgba(56, 189, 248, 0.85)' : 'rgba(11, 19, 36, 0.9)';
                        g.fillRect(x + 1, y + 1, cell - 2, cell - 2);
                        g.strokeStyle = 'rgba(148, 163, 184, 0.22)';
                        g.lineWidth = 1;
                        g.strokeRect(x + 1, y + 1, cell - 2, cell - 2);

                        if (v === 1) {
                            g.fillStyle = '#bae6fd';
                            g.fillRect(x + 5, y + 5, cell - 10, cell - 10);
                        } else if (v === 2) {
                            g.save();
                            g.strokeStyle = 'rgba(148, 163, 184, 0.55)';
                            g.lineWidth = 1.8;
                            const m = cell * 0.28;
                            g.beginPath();
                            g.moveTo(x + m, y + m);
                            g.lineTo(x + cell - m, y + cell - m);
                            g.moveTo(x + cell - m, y + m);
                            g.lineTo(x + m, y + cell - m);
                            g.stroke();
                            g.restore();
                        }
                        if (hintCell && hintCell.r === r && hintCell.c === c) {
                            g.save();
                            g.strokeStyle = PAL.amber;
                            g.lineWidth = 2.2;
                            g.strokeRect(x + 2, y + 2, cell - 4, cell - 4);
                            g.restore();
                        }
                    }
                }

                // 5x5 guide lines for larger boards
                g.save();
                g.strokeStyle = 'rgba(56, 189, 248, 0.55)';
                g.lineWidth = 1.8;
                g.strokeRect(ox, oy, state.cols * cell, state.rows * cell);
                if (state.cols >= 8) {
                    g.beginPath();
                    g.moveTo(ox + 5 * cell, oy);
                    g.lineTo(ox + 5 * cell, oy + state.rows * cell);
                    g.stroke();
                }
                if (state.rows >= 8) {
                    g.beginPath();
                    g.moveTo(ox, oy + 5 * cell);
                    g.lineTo(ox + state.cols * cell, oy + 5 * cell);
                    g.stroke();
                }
                g.restore();

                if (solved) {
                    const targetPixels = state.solution.flat().filter((v) => v === 1).length;
                    const stars = state.moves <= targetPixels + 6 ? 3 : (state.moves <= targetPixels + 18 ? 2 : 1);
                    const hasNext = levelIdx + 1 < Core.NONOGRAM_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: `STAR MAP: ${state.name.toUpperCase()}!`,
                        stars,
                        message: `Blueprint reconstructed in ${state.moves} edits`,
                        submessage: `${state.rows}x${state.cols} Zero-Ambiguity Cipher`,
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Map [Enter]' : 'All 8 Complete!',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                }
            }
        });

        refresh();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.NONOGRAM_LEVELS.length));
            }
        };
    };

    // ========================================================================
    // 10. HANOI WARP CORES (5 Levels: 3 to 7 Concentric Rings)
    // ========================================================================
    ENGINES['hanoi-warp-cores'] = function mountHanoi(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.HANOI_LEVELS.length);
        let state = Core.createHanoiState(levelIdx);
        let selectedPeg = null;
        let draggingFrom = null;
        let hintMove = null;
        let won = false;
        let winReported = false;
        let shell;

        const RING_COLORS = ['#38bdf8', '#22d3ee', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#a78bfa'];

        function syncHud() {
            setHudSafe(ctx, {
                gameId: 'hanoi-warp-cores',
                level: levelIdx + 1,
                maxLevel: Core.HANOI_LEVELS.length,
                moves: state.moves,
                par: state.optimal,
                target: `${state.pegs[2].length}/${state.disks} Rings`,
                score: Math.max(100, 1500 - Math.max(0, state.moves - state.optimal) * 20),
                status: won ? 'CHARGED' : 'TRANSFERRING'
            });
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.HANOI_LEVELS.length);
            state = Core.createHanoiState(levelIdx);
            selectedPeg = null;
            draggingFrom = null;
            hintMove = null;
            won = false;
            winReported = false;
            syncHud();
        }

        function attemptMove(fromPeg, toPeg) {
            if (won) return;
            if (Core.moveHanoiDisk(state, fromPeg, toPeg)) {
                playSfx(ctx, 'xpPickup');
                hintMove = null;
                selectedPeg = null;
                if (Core.isHanoiWon(state)) {
                    won = true;
                    playSfx(ctx, 'levelup');
                    const stars = Core.computeStars(state.moves, state.optimal);
                    if (!winReported) {
                        winReported = true;
                        if (ctx && ctx.onWin) {
                            ctx.onWin({
                                gameId: 'hanoi-warp-cores',
                                level: levelIdx + 1,
                                maxLevel: Core.HANOI_LEVELS.length,
                                moves: state.moves,
                                optimal: state.optimal,
                                stars,
                                score: Math.max(300, 1600 - (state.moves - state.optimal) * 20)
                            });
                        }
                    }
                }
                syncHud();
            } else {
                playSfx(ctx, 'hitMetal');
                selectedPeg = null;
            }
        }

        function pylonX(p) {
            return BOARD_AREA.x + 115 + p * 215;
        }

        function pegAtX(px) {
            let best = -1;
            let bestDist = 110;
            for (let p = 0; p < 3; p++) {
                const d = Math.abs(px - pylonX(p));
                if (d < bestDist) { bestDist = d; best = p; }
            }
            return best;
        }

        function doUndo() {
            if (won) return;
            if (Core.undoHanoi(state)) {
                playSfx(ctx, 'uiBack');
                selectedPeg = null;
                hintMove = null;
                syncHud();
            }
        }

        function doHint() {
            if (won) return;
            hintMove = Core.getHanoiOptimalHint(state);
            playSfx(ctx, 'powerup');
        }

        shell = createPuzzleShell(ctx, {
            title: 'HANOI WARP CORES',
            boardCursor: 'pointer',
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (k === '1' || k === '2' || k === '3') {
                    const p = parseInt(k, 10) - 1;
                    if (selectedPeg === null) {
                        if (state.pegs[p].length > 0) { selectedPeg = p; playSfx(ctx, 'uiClick'); }
                    } else if (selectedPeg === p) {
                        selectedPeg = null;
                    } else {
                        attemptMove(selectedPeg, p);
                    }
                } else if (k === 'z') doUndo();
                else if (k === 'r') loadLevel(levelIdx);
                else if (k === 'h') doHint();
                else if (e.key === 'Enter' && won && levelIdx + 1 < Core.HANOI_LEVELS.length) loadLevel(levelIdx + 1);
            },
            onPointerDown(px, py, e) {
                if (e.button !== 0 || won) return;
                if (px < BOARD_AREA.x || px > BOARD_AREA.x + BOARD_AREA.w || py < BOARD_AREA.y || py > BOARD_AREA.y + BOARD_AREA.h) return;
                const p = pegAtX(px);
                if (p < 0) return;
                if (selectedPeg === null) {
                    if (state.pegs[p].length > 0) {
                        selectedPeg = p;
                        draggingFrom = p;
                        playSfx(ctx, 'uiClick');
                    }
                } else if (selectedPeg === p) {
                    selectedPeg = null;
                    draggingFrom = null;
                } else {
                    attemptMove(selectedPeg, p);
                    draggingFrom = null;
                }
            },
            onPointerUp(px, py) {
                if (draggingFrom === null || won) return;
                const p = pegAtX(px);
                const from = draggingFrom;
                draggingFrom = null;
                if (p >= 0 && p !== from && py >= BOARD_AREA.y && py <= BOARD_AREA.y + BOARD_AREA.h) {
                    attemptMove(from, p);
                }
            },
            onRender(g, _dt, t) {
                shell.drawChrome({
                    subtitle: `Transfer ${state.disks} Warp Rings to Right Pylon (${state.name})`,
                    levelIndex: levelIdx,
                    totalLevels: Core.HANOI_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onUndo: doUndo,
                    canUndo: state.undoStack.length > 0 && !won,
                    onReset: () => loadLevel(levelIdx),
                    onHint: doHint,
                    disableHint: won
                });

                shell.drawRightPanelStats([
                    { label: 'MOVES', value: state.moves, color: PAL.cyan },
                    { label: 'OPTIMAL (2ⁿ-1)', value: state.optimal, color: PAL.amber },
                    { label: 'WARP RINGS', value: state.disks, color: PAL.violet },
                    { label: 'TARGET PYLON', value: `${state.pegs[2].length} / ${state.disks}`, color: won ? PAL.emerald : PAL.text }
                ], [
                    'Click Source -> Destination pylon',
                    'Or drag top ring / keys [1][2][3]',
                    'Never place larger ring on smaller',
                    '[Z] Undo  [R] Reset  [H] Optimal Hint'
                ]);

                const baseY = BOARD_AREA.y + BOARD_AREA.h - 56;
                const topY = BOARD_AREA.y + 115;

                // Base platform
                roundRect(g, BOARD_AREA.x + 36, baseY, BOARD_AREA.w - 72, 18, 9);
                g.fillStyle = '#162238';
                g.strokeStyle = 'rgba(56, 189, 248, 0.35)';
                g.lineWidth = 1.5;
                g.fill();
                g.stroke();

                for (let p = 0; p < 3; p++) {
                    const px = pylonX(p);
                    const isSel = selectedPeg === p;
                    const isTargetPylon = p === 2;

                    // Pylon pole
                    g.save();
                    roundRect(g, px - 7, topY, 14, baseY - topY, 7);
                    g.fillStyle = isSel ? PAL.amber : (isTargetPylon ? 'rgba(52, 211, 153, 0.45)' : '#334155');
                    g.fill();

                    g.fillStyle = isSel ? PAL.amber : (isTargetPylon ? PAL.emerald : PAL.muted);
                    g.font = '700 12px "JetBrains Mono", monospace';
                    g.textAlign = 'center';
                    g.fillText(p === 2 ? `[${p + 1}] TARGET` : `[${p + 1}] PYLON`, px, baseY + 34);
                    g.restore();

                    const stack = state.pegs[p];
                    const ringH = 28;
                    for (let i = 0; i < stack.length; i++) {
                        const disk = stack[i];
                        const isTop = i === stack.length - 1;
                        let rx = px;
                        let ry = baseY - (i + 0.5) * (ringH + 4) - 4;
                        if (isTop && isSel) ry -= 22;
                        if (isTop && draggingFrom === p && shell.pointerX > 0) {
                            rx = shell.pointerX;
                            ry = shell.pointerY;
                        }
                        const rw = 52 + disk * 20;
                        const col = RING_COLORS[(disk - 1) % RING_COLORS.length];

                        g.save();
                        roundRect(g, rx - rw / 2, ry - ringH / 2, rw, ringH, 12);
                        g.fillStyle = col;
                        g.globalAlpha = 0.88;
                        g.fill();
                        g.globalAlpha = 1;
                        g.strokeStyle = '#f8fafc';
                        g.lineWidth = (isTop && isSel) ? 2.4 : 1.3;
                        g.stroke();

                        g.fillStyle = '#050811';
                        g.font = '700 12px "JetBrains Mono", monospace';
                        g.textAlign = 'center';
                        g.textBaseline = 'middle';
                        g.fillText(`R${disk}`, rx, ry + 0.5);
                        g.restore();
                    }
                }

                if (hintMove && !won) {
                    const x1 = pylonX(hintMove.from);
                    const x2 = pylonX(hintMove.to);
                    const arcY = topY - 28;
                    g.save();
                    g.strokeStyle = PAL.amber;
                    g.lineWidth = 3;
                    g.setLineDash([6, 4]);
                    g.beginPath();
                    g.moveTo(x1, topY + 6);
                    g.quadraticCurveTo((x1 + x2) / 2, arcY - 22, x2, topY + 6);
                    g.stroke();
                    g.fillStyle = PAL.amber;
                    g.beginPath();
                    g.arc(x2, topY + 6, 6 + Math.sin(t * 8) * 1.5, 0, Math.PI * 2);
                    g.fill();
                    g.restore();
                }

                if (won) {
                    const stars = Core.computeStars(state.moves, state.optimal);
                    const hasNext = levelIdx + 1 < Core.HANOI_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: 'WARP CORES ALIGNED!',
                        stars,
                        message: `${state.disks} rings transferred in ${state.moves} moves`,
                        submessage: `Optimal Par (2ⁿ - 1): ${state.optimal}`,
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Core [Enter]' : 'All 5 Complete!',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                }
            }
        });

        syncHud();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.HANOI_LEVELS.length));
            }
        };
    };

    // ========================================================================
    // 11. WASM CELLULAR CONTAINMENT (Uses ctx.wasm.cellularStep!)
    // ========================================================================
    function probeWasmCellular(ctx) {
        const w = ctx && ctx.wasm ? ctx.wasm : null;
        const fn = w && typeof w.cellularStep === 'function' ? w.cellularStep : null;
        if (!fn) return { available: false, mode: 'fallback' };
        try {
            // Probe Wasm Linear Memory Bridge: cellularStep(srcPtr, dstPtr, cols, rows), 1=wall, 2=infected
            if (w.memory && typeof w.memory.buffer === 'object') {
                const srcOff = 16384;
                const dstOff = 20480;
                const u8 = new Uint8Array(w.memory.buffer);
                u8.fill(0, srcOff, srcOff + 9);
                u8.fill(0, dstOff, dstOff + 9);
                u8[srcOff + 4] = 2; // infected center
                fn(srcOff, dstOff, 3, 3);
                const twos = [u8[dstOff + 1], u8[dstOff + 3], u8[dstOff + 4], u8[dstOff + 5], u8[dstOff + 7]].filter((v) => v === 2).length;
                if (twos === 5) {
                    return { available: true, order: 'wasm_mem', inf: 2, wall: 1, mem: w.memory, srcOff, dstOff, fn };
                }
            }
            // Probe A: test (grid, w, h) where 1=infected spreads to 0
            const g1 = new Uint8Array([0, 0, 0, 0, 1, 0, 0, 0, 0]);
            const r1 = fn(g1, 3, 3);
            const out1 = (r1 && r1.length === 9) ? r1 : g1;
            const ones1 = Array.from(out1).filter((v) => v === 1).length;
            if (ones1 >= 4) {
                // Verify 2 acts as wall blocking spread
                const gWall2 = new Uint8Array([0, 2, 0, 2, 1, 2, 0, 2, 0]);
                const rw = fn(gWall2, 3, 3);
                const outW = (rw && rw.length === 9) ? rw : gWall2;
                const infCount = Array.from(outW).filter((v) => v === 1).length;
                if (infCount === 1) {
                    return { available: true, order: 'grid_w_h', inf: 1, wall: 2, fn };
                }
            }
            // Probe B: test (grid, w, h) where 2=infected spreads and 1=wall
            const g2 = new Uint8Array([0, 0, 0, 0, 2, 0, 0, 0, 0]);
            const r2 = fn(g2, 3, 3);
            const out2 = (r2 && r2.length === 9) ? r2 : g2;
            const twos2 = Array.from(out2).filter((v) => v === 2).length;
            if (twos2 >= 4) {
                return { available: true, order: 'grid_w_h', inf: 2, wall: 1, fn };
            }
            // Probe C: test (w, h, grid)
            const g3 = new Uint8Array([0, 0, 0, 0, 1, 0, 0, 0, 0]);
            const r3 = fn(3, 3, g3);
            const out3 = (r3 && r3.length === 9) ? r3 : g3;
            if (Array.from(out3).filter((v) => v === 1).length >= 4) {
                return { available: true, order: 'w_h_grid', inf: 1, wall: 2, fn };
            }
        } catch (e) { /* fallback cleanly if probe throws */ }
        return { available: false, mode: 'fallback' };
    }

    ENGINES['wasm-cellular-contain'] = function mountCellular(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.CELLULAR_LEVELS.length);
        let state = Core.createCellularState(levelIdx);
        let metrics = Core.computeCellularMetrics(state);
        const wasmInfo = probeWasmCellular(ctx);
        let winReported = false;
        let overReported = false;
        let shell;

        function syncHud() {
            const pct = Math.round(metrics.lossRatio * 100);
            setHudSafe(ctx, {
                gameId: 'wasm-cellular-contain',
                level: levelIdx + 1,
                maxLevel: Core.CELLULAR_LEVELS.length,
                turn: state.turn,
                wallsLeft: state.wallsPerTurn - state.wallsPlacedThisTurn,
                lossPct: pct,
                score: metrics.won ? Math.max(200, 1500 - pct * 25) : Math.max(0, 100 - pct),
                status: metrics.won ? 'CONTAINED' : (metrics.lost ? 'BREACHED' : 'QUARANTINE')
            });
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.CELLULAR_LEVELS.length);
            state = Core.createCellularState(levelIdx);
            metrics = Core.computeCellularMetrics(state);
            winReported = false;
            overReported = false;
            syncHud();
        }

        function checkOutcome() {
            if (metrics.won && !winReported) {
                winReported = true;
                playSfx(ctx, 'levelup');
                const stars = metrics.lossRatio <= 0.18 ? 3 : (metrics.lossRatio <= 0.27 ? 2 : 1);
                const score = Math.max(300, 1600 - Math.round(metrics.lossRatio * 2000) + stars * 200);
                if (ctx && ctx.onWin) {
                    ctx.onWin({
                        gameId: 'wasm-cellular-contain',
                        level: levelIdx + 1,
                        maxLevel: Core.CELLULAR_LEVELS.length,
                        turn: state.turn,
                        lossPercent: +(metrics.lossRatio * 100).toFixed(1),
                        wasmUsed: wasmInfo.available,
                        stars,
                        score
                    });
                }
            } else if (metrics.lost && !overReported) {
                overReported = true;
                playSfx(ctx, 'explodeSmall');
                if (ctx && ctx.onGameOver) {
                    ctx.onGameOver({
                        gameId: 'wasm-cellular-contain',
                        level: levelIdx + 1,
                        turn: state.turn,
                        lossPercent: +(metrics.lossRatio * 100).toFixed(1)
                    });
                }
            }
        }

        function runWasmStep() {
            if (metrics.won || metrics.lost) return;
            const R = state.rows;
            const C = state.cols;
            const flat = new Uint8Array(R * C);
            if (wasmInfo.available) {
                for (let r = 0; r < R; r++) {
                    for (let c = 0; c < C; c++) {
                        const v = state.grid[r][c];
                        flat[r * C + c] = v === 1 ? wasmInfo.inf : ((v === 2 || v === 3) ? wasmInfo.wall : 0);
                    }
                }
                let resArr;
                if (wasmInfo.order === 'wasm_mem') {
                    const u8 = new Uint8Array(wasmInfo.mem.buffer);
                    u8.set(flat, wasmInfo.srcOff);
                    wasmInfo.fn(wasmInfo.srcOff, wasmInfo.dstOff, C, R);
                    resArr = new Uint8Array(wasmInfo.mem.buffer, wasmInfo.dstOff, R * C);
                } else {
                    const out = wasmInfo.order === 'w_h_grid'
                        ? wasmInfo.fn(C, R, flat)
                        : wasmInfo.fn(flat, C, R);
                    resArr = (out && out.length === R * C) ? out : flat;
                }
                const norm = new Uint8Array(R * C);
                for (let i = 0; i < R * C; i++) {
                    norm[i] = resArr[i] === wasmInfo.inf ? 1 : 0;
                }
                metrics = Core.applyCellularStepResult(state, norm);
            } else {
                for (let r = 0; r < R; r++) {
                    for (let c = 0; c < C; c++) {
                        flat[r * C + c] = state.grid[r][c];
                    }
                }
                const stepped = Core.stepCellularFallback(flat, R, C);
                metrics = Core.applyCellularStepResult(state, stepped);
            }
            playSfx(ctx, 'emp');
            checkOutcome();
            syncHud();
        }

        function doUndo() {
            if (metrics.won || metrics.lost) return;
            if (Core.undoCellularFirewall(state)) {
                playSfx(ctx, 'uiBack');
                metrics = Core.computeCellularMetrics(state);
                syncHud();
            }
        }

        shell = createPuzzleShell(ctx, {
            title: 'WASM CELLULAR CONTAINMENT',
            boardCursor: 'pointer',
            onKeyDown(e) {
                const k = e.key.toLowerCase();
                if (e.key === ' ' || e.key === 'Enter') {
                    if (metrics.won && levelIdx + 1 < Core.CELLULAR_LEVELS.length && e.key === 'Enter') {
                        loadLevel(levelIdx + 1);
                    } else {
                        runWasmStep();
                    }
                } else if (k === 'z') doUndo();
                else if (k === 'r') loadLevel(levelIdx);
            },
            onPointerDown(px, py, e) {
                if (e.button !== 0 || metrics.won || metrics.lost) return;
                const geo = fitGridRect(state.rows, state.cols, 24);
                const cell = hitCell(px, py, geo, state.rows, state.cols);
                if (!cell) return;
                if (Core.placeCellularFirewall(state, cell.r, cell.c)) {
                    playSfx(ctx, 'hitShield');
                    shell.spawnBurst(geo.ox + (cell.c + 0.5) * geo.cell, geo.oy + (cell.r + 0.5) * geo.cell, PAL.cyan, 8);
                    metrics = Core.computeCellularMetrics(state);
                    checkOutcome();
                    syncHud();
                }
            },
            onRender(g, _dt, t) {
                shell.drawChrome({
                    subtitle: `Sector ${levelIdx + 1}: ${state.name}`,
                    levelIndex: levelIdx,
                    totalLevels: Core.CELLULAR_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onUndo: doUndo,
                    canUndo: state.turnWallStack.length > 0 && !metrics.won && !metrics.lost,
                    onReset: () => loadLevel(levelIdx)
                });

                const lossPct = (metrics.lossRatio * 100).toFixed(1);
                const quotaLeft = state.wallsPerTurn - state.wallsPlacedThisTurn;
                shell.drawRightPanelStats([
                    { label: 'TURN', value: state.turn, color: PAL.cyan },
                    { label: 'FIREWALLS LEFT', value: `${quotaLeft} / ${state.wallsPerTurn}`, color: quotaLeft === 0 ? PAL.emerald : PAL.amber },
                    { label: 'STATION LOST', value: `${lossPct}% (<35%)`, color: metrics.lossRatio >= 0.25 ? PAL.crimson : PAL.emerald },
                    { label: 'AT-RISK CELLS', value: metrics.reachableEmpty, color: metrics.reachableEmpty === 0 ? PAL.emerald : PAL.text },
                    { label: 'ENGINE', value: wasmInfo.available ? 'WASM ACTIVE' : 'TS FALLBACK', color: wasmInfo.available ? PAL.emerald : PAL.amber }
                ], [
                    'Click empty tiles to place Firewalls',
                    'Run WASM step to advance swarm 1 turn',
                    'Seal ALL reachable rooms <35% loss',
                    '[SPACE] Step  [Z] Undo  [R] Reset'
                ]);

                shell.registerButton('cell_step_btn', PANEL_AREA.x + 16, PANEL_AREA.y + 240, PANEL_AREA.w - 32, 42,
                    'RUN WASM STEP [SPACE]', {
                        active: quotaLeft === 0,
                        accent: quotaLeft === 0 ? PAL.emerald : PAL.cyan,
                        disabled: metrics.won || metrics.lost,
                        onClick: runWasmStep
                    });

                const geo = fitGridRect(state.rows, state.cols, 24);
                const { cell, ox, oy } = geo;

                for (let r = 0; r < state.rows; r++) {
                    for (let c = 0; c < state.cols; c++) {
                        const x = ox + c * cell;
                        const y = oy + r * cell;
                        const v = state.grid[r][c];
                        roundRect(g, x + 2, y + 2, cell - 4, cell - 4, 6);
                        if (v === 2) {
                            g.fillStyle = '#1e293b';
                            g.strokeStyle = '#475569';
                        } else if (v === 3) {
                            g.fillStyle = 'rgba(14, 116, 144, 0.65)';
                            g.strokeStyle = PAL.cyan;
                        } else if (v === 1) {
                            const pulse = 0.55 + 0.25 * Math.sin(t * 5 + r + c);
                            g.fillStyle = `rgba(244, 63, 94, ${pulse.toFixed(2)})`;
                            g.strokeStyle = PAL.crimson;
                        } else {
                            g.fillStyle = 'rgba(12, 20, 38, 0.85)';
                            g.strokeStyle = 'rgba(56, 189, 248, 0.16)';
                        }
                        g.lineWidth = (v === 1 || v === 3) ? 2 : 1;
                        g.fill();
                        g.stroke();

                        if (v === 1) {
                            drawSprite(g, ctx, 'alien_drone', x + cell / 2, y + cell / 2, cell * 0.65, (gg, sz) => {
                                gg.fillStyle = '#fecdd3';
                                gg.beginPath();
                                gg.arc(0, 0, sz * 0.24, 0, Math.PI * 2);
                                gg.fill();
                            });
                        } else if (v === 3) {
                            drawSprite(g, ctx, 'shield_battery', x + cell / 2, y + cell / 2, cell * 0.58, (gg, sz) => {
                                gg.strokeStyle = '#bae6fd';
                                gg.lineWidth = 2.5;
                                gg.strokeRect(-sz * 0.28, -sz * 0.28, sz * 0.56, sz * 0.56);
                            });
                        }
                    }
                }

                if (metrics.won) {
                    const stars = metrics.lossRatio <= 0.18 ? 3 : (metrics.lossRatio <= 0.27 ? 2 : 1);
                    const hasNext = levelIdx + 1 < Core.CELLULAR_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: 'SWARM QUARANTINED!',
                        stars,
                        message: `Contained in ${state.turn - 1} steps (${lossPct}% station lost)`,
                        submessage: wasmInfo.available ? 'Verified via WebAssembly cellularStep' : 'Verified containment',
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Blueprint' : 'All 8 Complete!',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                } else if (metrics.lost) {
                    shell.drawOverlay({
                        isWin: false,
                        title: 'CONTAINMENT FAILED!',
                        message: `Crimson Swarm claimed ${lossPct}% of station (>=35%)`,
                        submessage: 'Seal tighter choke points earlier',
                        primaryLabel: 'Retry Blueprint [R]',
                        onPrimary: () => loadLevel(levelIdx)
                    });
                }
            }
        });

        syncHud();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.CELLULAR_LEVELS.length));
            }
        };
    };

    // ========================================================================
    // 12. ORBITAL SUDOKU MINI (6 Uniquely-Solvable 6x6 2x3-Box Hex Ciphers)
    // ========================================================================
    ENGINES['orbital-sudoku-mini'] = function mountSudoku(ctx) {
        let levelIdx = toLevelIdx(ctx && (ctx.level ?? ctx.startLevel), 0, Core.SUDOKU_LEVELS.length);
        let state = Core.createSudokuState(levelIdx);
        let conflicts = Core.getSudokuConflicts(state.board);
        let selected = { r: 0, c: 0 };
        let won = false;
        let winReported = false;
        let shell;

        function refresh() {
            conflicts = Core.getSudokuConflicts(state.board);
            won = Core.isSudokuWon(state);
            const filled = state.board.filter((v) => v !== 0).length;
            setHudSafe(ctx, {
                gameId: 'orbital-sudoku-mini',
                level: levelIdx + 1,
                maxLevel: Core.SUDOKU_LEVELS.length,
                moves: state.moves,
                target: `${filled}/36 Cells`,
                score: Math.max(100, 1400 - state.moves * 8),
                status: won ? 'DECODED' : 'SOLVING'
            });
            if (won && !winReported) {
                winReported = true;
                playSfx(ctx, 'levelup');
                const stars = state.moves <= 28 ? 3 : (state.moves <= 45 ? 2 : 1);
                if (ctx && ctx.onWin) {
                    ctx.onWin({
                        gameId: 'orbital-sudoku-mini',
                        level: levelIdx + 1,
                        maxLevel: Core.SUDOKU_LEVELS.length,
                        moves: state.moves,
                        stars,
                        score: Math.max(300, 1500 + stars * 250 - state.moves * 8)
                    });
                }
            }
        }

        function loadLevel(idx) {
            levelIdx = toLevelIdx(idx + 1, 0, Core.SUDOKU_LEVELS.length);
            state = Core.createSudokuState(levelIdx);
            selected = { r: 0, c: 0 };
            winReported = false;
            refresh();
        }

        function inputDigit(val) {
            if (won) return;
            if (Core.setSudokuCell(state, selected.r, selected.c, val)) {
                playSfx(ctx, val === 0 ? 'uiBack' : 'uiClick');
                refresh();
            } else {
                playSfx(ctx, 'hitMetal');
            }
        }

        function doUndo() {
            if (won) return;
            if (Core.undoSudoku(state)) {
                playSfx(ctx, 'uiBack');
                refresh();
            }
        }

        function doHint() {
            if (won) return;
            const h = Core.getSudokuHint(state);
            if (h) {
                selected = { r: h.r, c: h.c };
                Core.setSudokuCell(state, h.r, h.c, h.val);
                playSfx(ctx, 'powerup');
                refresh();
            }
        }

        shell = createPuzzleShell(ctx, {
            title: 'ORBITAL SUDOKU MINI',
            boardCursor: 'pointer',
            onKeyDown(e) {
                if (e.key >= '1' && e.key <= '6') inputDigit(parseInt(e.key, 10));
                else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') inputDigit(0);
                else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') selected.r = (selected.r + 5) % 6;
                else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') selected.r = (selected.r + 1) % 6;
                else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') selected.c = (selected.c + 5) % 6;
                else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') selected.c = (selected.c + 1) % 6;
                else if (e.key.toLowerCase() === 'z') doUndo();
                else if (e.key.toLowerCase() === 'r') loadLevel(levelIdx);
                else if (e.key.toLowerCase() === 'h') doHint();
                else if (e.key === 'Enter' && won && levelIdx + 1 < Core.SUDOKU_LEVELS.length) loadLevel(levelIdx + 1);
            },
            onPointerDown(px, py, e) {
                if (e.button !== 0 || won) return;
                const geo = fitGridRect(6, 6, 26);
                const cell = hitCell(px, py, geo, 6, 6);
                if (cell) {
                    selected = cell;
                    playSfx(ctx, 'uiClick');
                }
            },
            onRender(g) {
                shell.drawChrome({
                    subtitle: `${state.name} — ${state.difficulty} (6x6, 2x3 Sectors)`,
                    levelIndex: levelIdx,
                    totalLevels: Core.SUDOKU_LEVELS.length,
                    onChangeLevel: loadLevel,
                    onUndo: doUndo,
                    canUndo: state.undoStack.length > 0 && !won,
                    onReset: () => loadLevel(levelIdx),
                    onHint: doHint,
                    disableHint: won
                });

                const filled = state.board.filter((v) => v !== 0).length;
                const badCount = conflicts.filter(Boolean).length;
                shell.drawRightPanelStats([
                    { label: 'FILLED', value: `${filled} / 36`, color: won ? PAL.emerald : PAL.cyan },
                    { label: 'CONFLICTS', value: badCount, color: badCount > 0 ? PAL.crimson : PAL.emerald },
                    { label: 'EDITS', value: state.moves, color: PAL.amber }
                ], [
                    'Click cell + press 1..6 (or palette)',
                    'Fill rows, cols & 2x3 boxes 1..6',
                    '[Z] Undo  [R] Reset  [H] Hint'
                ]);

                // On-canvas 1..6 + Erase palette in Right Panel
                const px0 = PANEL_AREA.x + 16;
                const py0 = PANEL_AREA.y + 158;
                const btnW = 68;
                const btnH = 42;
                for (let n = 1; n <= 6; n++) {
                    const col = (n - 1) % 3;
                    const row = Math.floor((n - 1) / 3);
                    shell.registerButton(`sdk_n_${n}`, px0 + col * 74, py0 + row * 48, btnW, btnH, String(n), {
                        font: '700 18px "JetBrains Mono", monospace',
                        accent: PAL.cyan,
                        disabled: won,
                        onClick: () => inputDigit(n)
                    });
                }
                shell.registerButton('sdk_erase', px0, py0 + 98, PANEL_AREA.w - 32, 34, 'Clear Cell [Del]', {
                    accent: PAL.crimson,
                    disabled: won,
                    onClick: () => inputDigit(0)
                });

                const geo = fitGridRect(6, 6, 26);
                const { cell, ox, oy } = geo;
                const selVal = state.board[selected.r * 6 + selected.c];
                const selBoxR = Math.floor(selected.r / 2);
                const selBoxC = Math.floor(selected.c / 3);

                for (let r = 0; r < 6; r++) {
                    for (let c = 0; c < 6; c++) {
                        const idx = r * 6 + c;
                        const x = ox + c * cell;
                        const y = oy + r * cell;
                        const val = state.board[idx];
                        const isSel = selected.r === r && selected.c === c;
                        const isPeer = r === selected.r || c === selected.c || (Math.floor(r / 2) === selBoxR && Math.floor(c / 3) === selBoxC);
                        const isMatch = selVal !== 0 && val === selVal;
                        const isConflict = conflicts[idx];
                        const isGiven = state.given[idx];

                        if (isConflict) g.fillStyle = 'rgba(244, 63, 94, 0.28)';
                        else if (isSel) g.fillStyle = 'rgba(56, 189, 248, 0.30)';
                        else if (isMatch) g.fillStyle = 'rgba(52, 211, 153, 0.18)';
                        else if (isPeer) g.fillStyle = 'rgba(30, 41, 59, 0.72)';
                        else g.fillStyle = 'rgba(11, 18, 34, 0.88)';
                        g.fillRect(x, y, cell, cell);

                        g.strokeStyle = 'rgba(148, 163, 184, 0.22)';
                        g.lineWidth = 1;
                        g.strokeRect(x, y, cell, cell);

                        if (val !== 0) {
                            g.save();
                            g.fillStyle = isConflict ? PAL.crimson : (isGiven ? '#f8fafc' : PAL.cyan);
                            g.font = `${isGiven ? '700' : '600'} ${Math.floor(cell * 0.48)}px "JetBrains Mono", monospace`;
                            g.textAlign = 'center';
                            g.textBaseline = 'middle';
                            g.fillText(String(val), x + cell / 2, y + cell / 2 + 1);
                            g.restore();
                        }
                    }
                }

                // Bold 2x3 box dividers
                g.save();
                g.strokeStyle = PAL.cyan;
                g.lineWidth = 2.6;
                g.strokeRect(ox, oy, 6 * cell, 6 * cell);
                g.beginPath();
                g.moveTo(ox + 3 * cell, oy);
                g.lineTo(ox + 3 * cell, oy + 6 * cell);
                g.moveTo(ox, oy + 2 * cell);
                g.lineTo(ox + 6 * cell, oy + 2 * cell);
                g.moveTo(ox, oy + 4 * cell);
                g.lineTo(ox + 6 * cell, oy + 4 * cell);
                g.stroke();

                // Selected highlight border
                g.strokeStyle = PAL.amber;
                g.lineWidth = 2.5;
                g.strokeRect(ox + selected.c * cell + 1.5, oy + selected.r * cell + 1.5, cell - 3, cell - 3);
                g.restore();

                if (won) {
                    const stars = state.moves <= 28 ? 3 : (state.moves <= 45 ? 2 : 1);
                    const hasNext = levelIdx + 1 < Core.SUDOKU_LEVELS.length;
                    shell.drawOverlay({
                        isWin: true,
                        title: 'HEX CIPHER DECODED!',
                        stars,
                        message: `${state.name} (${state.difficulty}) solved cleanly`,
                        submessage: `Completed in ${state.moves} edits`,
                        secondaryLabel: 'Replay [R]',
                        onSecondary: () => loadLevel(levelIdx),
                        primaryLabel: hasNext ? 'Next Cipher [Enter]' : 'All 6 Complete!',
                        onPrimary: hasNext ? () => loadLevel(levelIdx + 1) : () => loadLevel(0)
                    });
                }
            }
        });

        refresh();
        return {
            destroy: shell.destroy,
            restart(lvl) {
                loadLevel(toLevelIdx(lvl, levelIdx, Core.SUDOKU_LEVELS.length));
            }
        };
    };
})(typeof window !== 'undefined' ? window : globalThis);
