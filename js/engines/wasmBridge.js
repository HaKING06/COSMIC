// =============================================================================
// COSMIC UNIVERSE v11.0 — WEBASSEMBLY SIMULATION BRIDGE
// Loads wasm/cosmic_sim.wasm with deterministic JS fallback for file:// / restricted envs.
// Exposes window.CosmicWasm
// =============================================================================
(function (global) {
    'use strict';

    const WASM_PAGES = 4; // 4 * 64 KiB = 256 KiB

    function detectDefaultWasmUrl() {
        try {
            if (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) {
                return new URL('../../wasm/cosmic_sim.wasm', document.currentScript.src).href;
            }
        } catch (_) {
            // Fall back to relative root path
        }
        return 'wasm/cosmic_sim.wasm';
    }

    const DEFAULT_WASM_URL = detectDefaultWasmUrl();

    function allocateFallbackMemory() {
        if (typeof WebAssembly !== 'undefined' && typeof WebAssembly.Memory === 'function') {
            return new WebAssembly.Memory({ initial: WASM_PAGES });
        }
        return { buffer: new ArrayBuffer(WASM_PAGES * 65536) };
    }

    function jsXorshift32(seed) {
        let x = seed | 0;
        if (x === 0) x = 0x6D2B79F5;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        return x | 0;
    }

    function stepBulletsFloatView(f32, baseIdx, count, dt, w, h, px, py) {
        const fdt = Math.fround(dt);
        const fw = Math.fround(w);
        const fh = Math.fround(h);
        const fpx = Math.fround(px);
        const fpy = Math.fround(py);
        let hits = 0;

        for (let i = 0; i < count; i++) {
            const idx = baseIdx + i * 4;
            let x = f32[idx];
            if (!(x > -900.0)) continue;

            let y = f32[idx + 1];
            const vx = f32[idx + 2];
            const vy = f32[idx + 3];

            x = Math.fround(x + Math.fround(vx * fdt));
            y = Math.fround(y + Math.fround(vy * fdt));

            if (x >= 0.0 && x <= fw && y >= 0.0 && y <= fh) {
                f32[idx] = x;
                f32[idx + 1] = y;
                const dx = Math.fround(x - fpx);
                const dy = Math.fround(y - fpy);
                const d2 = Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy));
                if (d2 < 169.0) hits++;
            } else {
                f32[idx] = -999.0;
                f32[idx + 1] = y;
            }
        }
        return hits | 0;
    }

    function stepBulletsDataView(dv, byteOffset, count, dt, w, h, px, py) {
        const fdt = Math.fround(dt);
        const fw = Math.fround(w);
        const fh = Math.fround(h);
        const fpx = Math.fround(px);
        const fpy = Math.fround(py);
        let hits = 0;

        for (let i = 0; i < count; i++) {
            const base = byteOffset + i * 16;
            let x = dv.getFloat32(base, true);
            if (!(x > -900.0)) continue;

            let y = dv.getFloat32(base + 4, true);
            const vx = dv.getFloat32(base + 8, true);
            const vy = dv.getFloat32(base + 12, true);

            x = Math.fround(x + Math.fround(vx * fdt));
            y = Math.fround(y + Math.fround(vy * fdt));

            if (x >= 0.0 && x <= fw && y >= 0.0 && y <= fh) {
                dv.setFloat32(base, x, true);
                dv.setFloat32(base + 4, y, true);
                const dx = Math.fround(x - fpx);
                const dy = Math.fround(y - fpy);
                const d2 = Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy));
                if (d2 < 169.0) hits++;
            } else {
                dv.setFloat32(base, -999.0, true);
                dv.setFloat32(base + 4, y, true);
            }
        }
        return hits | 0;
    }

    function gravityIntegrateFloatView(f32, baseIdx, count, gx, gy, gm, dt) {
        const fgx = Math.fround(gx);
        const fgy = Math.fround(gy);
        const fgm = Math.fround(gm);
        const fdt = Math.fround(dt);
        let active = 0;

        for (let i = 0; i < count; i++) {
            const idx = baseIdx + i * 4;
            let x = f32[idx];
            if (!(x > -900.0)) continue;

            active++;
            let y = f32[idx + 1];
            let vx = f32[idx + 2];
            let vy = f32[idx + 3];

            const dx = Math.fround(fgx - x);
            const dy = Math.fround(fgy - y);
            const d2 = Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy));

            if (d2 > 0.0001) {
                const dist = Math.fround(Math.sqrt(d2));
                const clamped = d2 > 900.0 ? d2 : 900.0;
                const factor = Math.fround(Math.fround(Math.fround(fgm / clamped) / dist) * fdt);
                vx = Math.fround(vx + Math.fround(dx * factor));
                vy = Math.fround(vy + Math.fround(dy * factor));
            }

            x = Math.fround(x + Math.fround(vx * fdt));
            y = Math.fround(y + Math.fround(vy * fdt));

            f32[idx] = x;
            f32[idx + 1] = y;
            f32[idx + 2] = vx;
            f32[idx + 3] = vy;
        }
        return active | 0;
    }

    function gravityIntegrateDataView(dv, byteOffset, count, gx, gy, gm, dt) {
        const fgx = Math.fround(gx);
        const fgy = Math.fround(gy);
        const fgm = Math.fround(gm);
        const fdt = Math.fround(dt);
        let active = 0;

        for (let i = 0; i < count; i++) {
            const base = byteOffset + i * 16;
            let x = dv.getFloat32(base, true);
            if (!(x > -900.0)) continue;

            active++;
            let y = dv.getFloat32(base + 4, true);
            let vx = dv.getFloat32(base + 8, true);
            let vy = dv.getFloat32(base + 12, true);

            const dx = Math.fround(fgx - x);
            const dy = Math.fround(fgy - y);
            const d2 = Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy));

            if (d2 > 0.0001) {
                const dist = Math.fround(Math.sqrt(d2));
                const clamped = d2 > 900.0 ? d2 : 900.0;
                const factor = Math.fround(Math.fround(Math.fround(fgm / clamped) / dist) * fdt);
                vx = Math.fround(vx + Math.fround(dx * factor));
                vy = Math.fround(vy + Math.fround(dy * factor));
            }

            x = Math.fround(x + Math.fround(vx * fdt));
            y = Math.fround(y + Math.fround(vy * fdt));

            dv.setFloat32(base, x, true);
            dv.setFloat32(base + 4, y, true);
            dv.setFloat32(base + 8, vx, true);
            dv.setFloat32(base + 12, vy, true);
        }
        return active | 0;
    }

    function cellularStepBytes(src, srcOff, dst, dstOff, cols, rows) {
        let newly = 0;
        for (let r = 0; r < rows; r++) {
            const rowBase = r * cols;
            for (let c = 0; c < cols; c++) {
                const idx = rowBase + c;
                const cell = src[srcOff + idx];
                if (cell === 1) {
                    dst[dstOff + idx] = 1;
                } else if (cell === 2) {
                    dst[dstOff + idx] = 2;
                } else {
                    const infected =
                        (r > 0 && src[srcOff + idx - cols] === 2) ||
                        (r + 1 < rows && src[srcOff + idx + cols] === 2) ||
                        (c > 0 && src[srcOff + idx - 1] === 2) ||
                        (c + 1 < cols && src[srcOff + idx + 1] === 2);
                    if (infected) {
                        dst[dstOff + idx] = 2;
                        newly++;
                    } else {
                        dst[dstOff + idx] = 0;
                    }
                }
            }
        }
        return newly | 0;
    }

    function createFallbackBridge() {
        const memory = allocateFallbackMemory();

        function stepBullets(ptr, count, dt, w, h, px, py) {
            if (count <= 0) return 0;
            if (typeof ptr === 'number') {
                if (ptr < 0) return 0;
                if ((ptr & 3) === 0) {
                    return stepBulletsFloatView(new Float32Array(memory.buffer), ptr >> 2, count, dt, w, h, px, py);
                }
                return stepBulletsDataView(new DataView(memory.buffer), ptr, count, dt, w, h, px, py);
            }
            if (ArrayBuffer.isView(ptr)) {
                if (ptr instanceof Float32Array) {
                    return stepBulletsFloatView(ptr, 0, count, dt, w, h, px, py);
                }
                if ((ptr.byteOffset & 3) === 0) {
                    return stepBulletsFloatView(
                        new Float32Array(ptr.buffer, ptr.byteOffset, ptr.byteLength >> 2),
                        0,
                        count,
                        dt,
                        w,
                        h,
                        px,
                        py
                    );
                }
                return stepBulletsDataView(new DataView(ptr.buffer, ptr.byteOffset, ptr.byteLength), 0, count, dt, w, h, px, py);
            }
            return 0;
        }

        function cellularStep(srcPtr, dstPtr, cols, rows) {
            if (cols <= 0 || rows <= 0) return 0;
            if (typeof srcPtr === 'number' && typeof dstPtr === 'number') {
                if (srcPtr < 0 || dstPtr < 0) return 0;
                const u8 = new Uint8Array(memory.buffer);
                return cellularStepBytes(u8, srcPtr, u8, dstPtr, cols, rows);
            }
            if (ArrayBuffer.isView(srcPtr) && ArrayBuffer.isView(dstPtr)) {
                const s = srcPtr instanceof Uint8Array
                    ? srcPtr
                    : new Uint8Array(srcPtr.buffer, srcPtr.byteOffset, srcPtr.byteLength);
                const d = dstPtr instanceof Uint8Array
                    ? dstPtr
                    : new Uint8Array(dstPtr.buffer, dstPtr.byteOffset, dstPtr.byteLength);
                return cellularStepBytes(s, 0, d, 0, cols, rows);
            }
            return 0;
        }

        function gravityIntegrate(ptr, count, gx, gy, gm, dt) {
            if (count <= 0) return 0;
            if (typeof ptr === 'number') {
                if (ptr < 0) return 0;
                if ((ptr & 3) === 0) {
                    return gravityIntegrateFloatView(new Float32Array(memory.buffer), ptr >> 2, count, gx, gy, gm, dt);
                }
                return gravityIntegrateDataView(new DataView(memory.buffer), ptr, count, gx, gy, gm, dt);
            }
            if (ArrayBuffer.isView(ptr)) {
                if (ptr instanceof Float32Array) {
                    return gravityIntegrateFloatView(ptr, 0, count, gx, gy, gm, dt);
                }
                if ((ptr.byteOffset & 3) === 0) {
                    return gravityIntegrateFloatView(
                        new Float32Array(ptr.buffer, ptr.byteOffset, ptr.byteLength >> 2),
                        0,
                        count,
                        gx,
                        gy,
                        gm,
                        dt
                    );
                }
                return gravityIntegrateDataView(new DataView(ptr.buffer, ptr.byteOffset, ptr.byteLength), 0, count, gx, gy, gm, dt);
            }
            return 0;
        }

        return {
            ok: true,
            viaWasm: false,
            instance: null,
            memory,
            xorshift32: jsXorshift32,
            stepBullets,
            cellularStep,
            gravityIntegrate
        };
    }

    function createWasmBridge(instance) {
        const exp = instance.exports;
        const memory = exp.memory;
        const fallback = createFallbackBridge();

        return {
            ok: true,
            viaWasm: true,
            instance,
            memory,
            xorshift32(seed) {
                return exp.xorshift32(seed | 0) | 0;
            },
            stepBullets(ptr, count, dt, w, h, px, py) {
                if (typeof ptr === 'number') {
                    return exp.step_bullets(ptr | 0, count | 0, dt, w, h, px, py) | 0;
                }
                if (ArrayBuffer.isView(ptr) && ptr.buffer === memory.buffer) {
                    return exp.step_bullets(ptr.byteOffset | 0, count | 0, dt, w, h, px, py) | 0;
                }
                return fallback.stepBullets(ptr, count, dt, w, h, px, py);
            },
            cellularStep(srcPtr, dstPtr, cols, rows) {
                if (typeof srcPtr === 'number' && typeof dstPtr === 'number') {
                    return exp.cellular_step(srcPtr | 0, dstPtr | 0, cols | 0, rows | 0) | 0;
                }
                if (
                    ArrayBuffer.isView(srcPtr) &&
                    ArrayBuffer.isView(dstPtr) &&
                    srcPtr.buffer === memory.buffer &&
                    dstPtr.buffer === memory.buffer
                ) {
                    return exp.cellular_step(srcPtr.byteOffset | 0, dstPtr.byteOffset | 0, cols | 0, rows | 0) | 0;
                }
                return fallback.cellularStep(srcPtr, dstPtr, cols, rows);
            },
            gravityIntegrate(ptr, count, gx, gy, gm, dt) {
                if (typeof ptr === 'number') {
                    return exp.gravity_integrate(ptr | 0, count | 0, gx, gy, gm, dt) | 0;
                }
                if (ArrayBuffer.isView(ptr) && ptr.buffer === memory.buffer) {
                    return exp.gravity_integrate(ptr.byteOffset | 0, count | 0, gx, gy, gm, dt) | 0;
                }
                return fallback.gravityIntegrate(ptr, count, gx, gy, gm, dt);
            }
        };
    }

    async function loadBridge(wasmUrl) {
        const url = wasmUrl || DEFAULT_WASM_URL;
        const isFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';

        if (isFileProtocol || typeof WebAssembly === 'undefined' || typeof fetch !== 'function') {
            return createFallbackBridge();
        }

        try {
            const resp = await fetch(url);
            if (!resp || !resp.ok) {
                return createFallbackBridge();
            }
            const ct = resp.headers && typeof resp.headers.get === 'function'
                ? (resp.headers.get('content-type') || '').toLowerCase()
                : '';

            let compiled;
            if (typeof WebAssembly.instantiateStreaming === 'function' && ct.includes('application/wasm')) {
                compiled = await WebAssembly.instantiateStreaming(resp);
            } else {
                const bytes = await resp.arrayBuffer();
                compiled = await WebAssembly.instantiate(bytes);
            }

            if (compiled && compiled.instance && compiled.instance.exports) {
                return createWasmBridge(compiled.instance);
            }
            return createFallbackBridge();
        } catch (_) {
            return createFallbackBridge();
        }
    }

    const cache = new Map();

    const CosmicWasm = {
        DEFAULT_WASM_URL,

        ready(wasmUrl, options) {
            const key = wasmUrl || DEFAULT_WASM_URL;
            const force = Boolean(options && options.force);
            if (!force && cache.has(key)) {
                return cache.get(key);
            }
            const promise = loadBridge(key);
            cache.set(key, promise);
            return promise;
        },

        createFallback() {
            return createFallbackBridge();
        },

        fromBytes(bytes) {
            if (typeof WebAssembly === 'undefined') {
                return Promise.resolve(createFallbackBridge());
            }
            return WebAssembly.instantiate(bytes)
                .then((res) => createWasmBridge(res.instance))
                .catch(() => createFallbackBridge());
        }
    };

    global.CosmicWasm = CosmicWasm;
})(typeof window !== 'undefined' ? window : globalThis);
