// =============================================================================
// COSMIC UNIVERSE v11.0 — GLSL WEBGL / WEBGL2 SHADERS & SURFACE COMPOSITOR
// Exposes window.CosmicShaders
// =============================================================================
(function (global) {
    'use strict';

    const VERT_2D = [
        'attribute vec2 a_pos;',
        'varying vec2 v_uv;',
        'void main() {',
        '    v_uv = a_pos * 0.5 + 0.5;',
        '    gl_Position = vec4(a_pos, 0.0, 1.0);',
        '}'
    ].join('\n');

    const FRAG_HORIZON_PULSE = [
        '#ifdef GL_ES',
        'precision highp float;',
        '#endif',
        '',
        'varying vec2 v_uv;',
        'uniform float u_time;',
        'uniform vec2 u_res;',
        'uniform vec2 u_player;',
        'uniform float u_pulse;',
        'uniform float u_phase;',
        '',
        'float hash21(vec2 p) {',
        '    p = fract(p * vec2(123.34, 456.21));',
        '    p += dot(p, p + 45.32);',
        '    return fract(p.x * p.y);',
        '}',
        '',
        'float noise2d(vec2 p) {',
        '    vec2 i = floor(p);',
        '    vec2 f = fract(p);',
        '    vec2 u = f * f * (3.0 - 2.0 * f);',
        '    float a = hash21(i);',
        '    float b = hash21(i + vec2(1.0, 0.0));',
        '    float c = hash21(i + vec2(0.0, 1.0));',
        '    float d = hash21(i + vec2(1.0, 1.0));',
        '    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);',
        '}',
        '',
        'float fbm(vec2 p) {',
        '    float v = 0.0;',
        '    float amp = 0.5;',
        '    for (int i = 0; i < 4; i++) {',
        '        v += amp * noise2d(p);',
        '        p = p * 2.04 + vec2(1.7, 9.2);',
        '        amp *= 0.5;',
        '    }',
        '    return v;',
        '}',
        '',
        'void main() {',
        '    vec2 res = max(u_res, vec2(1.0));',
        '    float aspect = res.x / res.y;',
        '    float minDim = min(res.x, res.y);',
        '',
        '    vec2 playerNorm = (abs(u_player.x) > 1.5 || abs(u_player.y) > 1.5)',
        '        ? (u_player / res)',
        '        : u_player;',
        '    vec2 uv = v_uv;',
        '    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);',
        '    vec2 playerP = (playerNorm - 0.5) * vec2(aspect, 1.0);',
        '',
        '    float r = length(p);',
        '    float ang = atan(p.y, p.x);',
        '',
        '    // Radial gravitational lensing distortion around the singularity core',
        '    float lens = 0.06 / (r + 0.14);',
        '    vec2 dir = r > 0.0001 ? (p / r) : vec2(0.0);',
        '    vec2 warpedP = p - dir * lens * 0.24;',
        '    float swirl = ang + 1.8 / (r + 0.35) - u_time * (0.45 + 0.15 * u_phase);',
        '',
        '    // Accretion plasma rings',
        '    float plasmaNoise = fbm(vec2(r * 7.0 - u_time * 0.9, swirl * 1.4));',
        '    float ring1 = exp(-pow((r - 0.24 - 0.025 * sin(swirl * 3.0 + u_time)) * 16.0, 2.0));',
        '    float ring2 = exp(-pow((r - 0.38 + 0.02 * cos(swirl * 5.0 - u_time * 1.3)) * 11.0, 2.0));',
        '    float disk = smoothstep(0.58, 0.11, r) * (0.45 + 0.55 * plasmaNoise);',
        '',
        '    // Event horizon void at center',
        '    float horizon = smoothstep(0.085, 0.125, r);',
        '',
        '    // Phase-reactive palette (cyan/violet -> crimson/amber hazard)',
        '    float phaseMix = clamp(u_phase * 0.35, 0.0, 1.0);',
        '    vec3 coldCol = mix(vec3(0.03, 0.78, 0.98), vec3(0.55, 0.24, 0.96), clamp(r * 1.8, 0.0, 1.0));',
        '    vec3 hotCol = mix(vec3(1.0, 0.18, 0.44), vec3(1.0, 0.72, 0.18), plasmaNoise);',
        '    vec3 plasmaCol = mix(coldCol, hotCol, phaseMix);',
        '',
        '    // Expanding danger shockwave pulses reacting to u_pulse',
        '    float pulseR = (u_pulse > 2.5) ? (u_pulse / minDim) : u_pulse;',
        '    float activePulse = step(0.001, pulseR);',
        '    float waveDist = abs(r - pulseR);',
        '    float shockRing = exp(-pow(waveDist * 34.0, 2.0)) * activePulse;',
        '    float shockHalo = exp(-pow(waveDist * 11.0, 2.0)) * 0.35 * activePulse;',
        '    float echoDist = abs(r - fract(pulseR + 0.35) * 0.85);',
        '    float echoRing = exp(-pow(echoDist * 28.0, 2.0)) * 0.3 * activePulse;',
        '',
        '    // Radial warp distortion ripple along shockwave front',
        '    float ripple = sin((r - pulseR) * 42.0) * exp(-waveDist * 18.0) * 0.18 * activePulse;',
        '',
        '    // Player beacon aura',
        '    float pDist = length(warpedP - playerP);',
        '    float playerGlow = exp(-pDist * 18.0) * 0.65;',
        '    float playerRing = exp(-pow((pDist - 0.045) * 70.0, 2.0)) * 0.55;',
        '',
        '    // Background cosmic stars',
        '    vec2 starGrid = floor((warpedP + vec2(u_time * 0.02, 0.0)) * 42.0);',
        '    float starSeed = hash21(starGrid);',
        '    float star = step(0.986, starSeed) * (0.4 + 0.6 * sin(u_time * 3.0 + starSeed * 31.0));',
        '',
        '    vec3 bg = vec3(0.02, 0.03, 0.08) + vec3(0.04, 0.05, 0.13) * (1.0 - smoothstep(0.0, 0.9, r));',
        '    vec3 col = bg + vec3(0.75, 0.92, 1.0) * star;',
        '    col += plasmaCol * (disk * 0.85 + ring1 * 1.15 + ring2 * 0.75 + ripple);',
        '    col *= horizon;',
        '    col += vec3(1.0, 0.25, 0.45) * (shockRing * 1.2 + shockHalo) + vec3(1.0, 0.82, 0.3) * echoRing;',
        '    col += vec3(0.22, 0.95, 1.0) * (playerGlow + playerRing);',
        '',
        '    // Subtle vignette',
        '    float vig = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.85;',
        '    col *= clamp(vig, 0.25, 1.0);',
        '    gl_FragColor = vec4(col, 1.0);',
        '}'
    ].join('\n');

    const FRAG_WARP_LATTICE = [
        '#ifdef GL_ES',
        'precision highp float;',
        '#endif',
        '',
        'varying vec2 v_uv;',
        'uniform float u_time;',
        'uniform vec2 u_res;',
        'uniform vec2 u_player;',
        'uniform float u_pulse;',
        'uniform float u_phase;',
        '',
        'float hash(vec2 p) {',
        '    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
        '}',
        '',
        'void main() {',
        '    vec2 res = max(u_res, vec2(1.0));',
        '    float aspect = res.x / res.y;',
        '    vec2 playerNorm = (abs(u_player.x) > 1.5 || abs(u_player.y) > 1.5)',
        '        ? (u_player / res)',
        '        : u_player;',
        '    vec2 offset = (playerNorm - 0.5) * 0.16;',
        '    vec2 p = (v_uv - 0.5 - offset) * vec2(aspect, 1.0);',
        '',
        '    float speed = 1.0 + u_phase * 0.35;',
        '    float r = max(length(p), 0.015);',
        '    float angle = atan(p.y, p.x);',
        '',
        '    // Perspective warp tunnel lattice',
        '    float depth = 0.48 / (r + 0.08) + u_time * 0.65 * speed;',
        '    float spoke = angle * (12.0 / 3.14159265);',
        '    vec2 grid = abs(fract(vec2(spoke, depth)) - 0.5);',
        '    float lineX = smoothstep(0.055, 0.0, grid.x);',
        '    float lineY = smoothstep(0.065, 0.0, grid.y);',
        '    float lattice = max(lineX, lineY) * smoothstep(0.04, 0.32, r);',
        '',
        '    // Secondary Cartesian horizon grid',
        '    vec2 flatGrid = abs(fract(p * 6.0 + vec2(0.0, u_time * 0.18)) - 0.5);',
        '    float bgGrid = max(smoothstep(0.025, 0.0, flatGrid.x), smoothstep(0.025, 0.0, flatGrid.y)) * 0.22;',
        '',
        '    // Star streaks radiating outward',
        '    float sector = floor(angle * 24.0);',
        '    float streakSeed = hash(vec2(sector, floor(depth * 0.5)));',
        '    float streak = smoothstep(0.92, 1.0, streakSeed) * smoothstep(0.15, 0.7, r) * 0.6;',
        '',
        '    // Pulse wave modulation',
        '    float pulseR = (u_pulse > 2.5) ? (u_pulse / min(res.x, res.y)) : u_pulse;',
        '    float pulseWave = exp(-pow((r - pulseR) * 20.0, 2.0)) * step(0.001, pulseR);',
        '',
        '    vec3 deepSpace = vec3(0.015, 0.022, 0.065);',
        '    vec3 cyanGlow = vec3(0.04, 0.85, 1.0);',
        '    vec3 violetGlow = vec3(0.58, 0.22, 0.96);',
        '    vec3 accent = mix(cyanGlow, violetGlow, 0.5 + 0.5 * sin(u_time * 0.4 + r * 3.0));',
        '',
        '    vec3 col = deepSpace;',
        '    col += accent * lattice * 0.55;',
        '    col += vec3(0.12, 0.35, 0.78) * bgGrid;',
        '    col += vec3(0.75, 0.94, 1.0) * streak;',
        '    col += vec3(0.18, 0.92, 1.0) * exp(-r * 6.5) * 0.55;',
        '    col += vec3(1.0, 0.32, 0.55) * pulseWave * 0.85;',
        '',
        '    gl_FragColor = vec4(col, 1.0);',
        '}'
    ].join('\n');

    function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader) || 'Unknown shader compile error';
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[CosmicShaders] Shader compile failed:', info);
            }
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createNoopSurface(reason) {
        return {
            isWebGL: false,
            gl: null,
            program: null,
            error: reason || null,
            render() {
                return false;
            },
            destroy() {}
        };
    }

    function createShaderSurface(canvas, fragSource) {
        if (!canvas || typeof canvas.getContext !== 'function') {
            return createNoopSurface('invalid_canvas');
        }

        let gl = null;
        const ctxAttrs = {
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            preserveDrawingBuffer: false
        };

        try {
            gl = canvas.getContext('webgl2', ctxAttrs) ||
                 canvas.getContext('webgl', ctxAttrs) ||
                 canvas.getContext('experimental-webgl', ctxAttrs);
        } catch (err) {
            return createNoopSurface(err && err.message ? err.message : 'context_error');
        }

        if (!gl) {
            return createNoopSurface('webgl_unavailable');
        }

        const vertShader = compileShader(gl, gl.VERTEX_SHADER, VERT_2D);
        const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSource || FRAG_HORIZON_PULSE);
        if (!vertShader || !fragShader) {
            if (vertShader) gl.deleteShader(vertShader);
            if (fragShader) gl.deleteShader(fragShader);
            return createNoopSurface('shader_compile_failed');
        }

        const program = gl.createProgram();
        if (!program) {
            gl.deleteShader(vertShader);
            gl.deleteShader(fragShader);
            return createNoopSurface('program_create_failed');
        }

        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program) || 'Unknown program link error';
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[CosmicShaders] Program link failed:', info);
            }
            gl.deleteProgram(program);
            gl.deleteShader(vertShader);
            gl.deleteShader(fragShader);
            return createNoopSurface('program_link_failed');
        }

        const quadBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW
        );

        const posLoc = gl.getAttribLocation(program, 'a_pos');
        const uTime = gl.getUniformLocation(program, 'u_time');
        const uRes = gl.getUniformLocation(program, 'u_res');
        const uPlayer = gl.getUniformLocation(program, 'u_player');
        const uPulse = gl.getUniformLocation(program, 'u_pulse');
        const uPhase = gl.getUniformLocation(program, 'u_phase');

        let destroyed = false;

        return {
            isWebGL: true,
            gl,
            program,

            render(uniforms) {
                if (destroyed) return false;
                if (typeof gl.isContextLost === 'function' && gl.isContextLost()) {
                    return false;
                }

                const u = uniforms || {};
                const width = Math.max(1, Number(u.width || canvas.width || canvas.clientWidth || 1));
                const height = Math.max(1, Number(u.height || canvas.height || canvas.clientHeight || 1));

                gl.viewport(0, 0, width, height);
                gl.useProgram(program);

                gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
                if (posLoc >= 0) {
                    gl.enableVertexAttribArray(posLoc);
                    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
                }

                const t = Number(u.u_time !== undefined ? u.u_time : (u.time || 0));
                const res = u.u_res || u.res || [width, height];
                const player = u.u_player || u.player || [0.5, 0.5];
                const pulse = Number(u.u_pulse !== undefined ? u.u_pulse : (u.pulse || 0));
                const phase = Number(u.u_phase !== undefined ? u.u_phase : (u.phase || 0));

                if (uTime !== null) gl.uniform1f(uTime, t);
                if (uRes !== null) gl.uniform2f(uRes, Number(res[0]) || width, Number(res[1]) || height);
                if (uPlayer !== null) gl.uniform2f(uPlayer, Number(player[0]) || 0.5, Number(player[1]) || 0.5);
                if (uPulse !== null) gl.uniform1f(uPulse, pulse);
                if (uPhase !== null) gl.uniform1f(uPhase, phase);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                return true;
            },

            destroy() {
                if (destroyed) return;
                destroyed = true;
                try {
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    gl.useProgram(null);
                    if (quadBuf) gl.deleteBuffer(quadBuf);
                    gl.deleteShader(vertShader);
                    gl.deleteShader(fragShader);
                    gl.deleteProgram(program);
                } catch (_) {
                    // Ignore cleanup errors if context was already lost
                }
            }
        };
    }

    global.CosmicShaders = {
        VERT_2D,
        FRAG_HORIZON_PULSE,
        FRAG_WARP_LATTICE,
        createShaderSurface
    };
})(typeof window !== 'undefined' ? window : globalThis);
