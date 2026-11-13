// =============================================================================
// COSMIC UNIVERSE v11.5 — ASSEMBLYSCRIPT (.wasm) N-BODY & SWARM KERNEL
// Compiled via `npx asc` into wasm/cosmic_adv.wasm
// Memory layout:
//   [0 .. 16384): PRNG state + black holes (up to 8 * 4 f32)
//   [16384 .. 16384 + MAX * 24): Particle/Swarm entities (x, y, vx, vy, hp, kind)
// =============================================================================

@inline
const STRIDE: usize = 24; // 6 floats * 4 bytes

let rngState: u32 = 0x9E3779B9;

export function seedRng(s: u32): void {
  rngState = s == 0 ? 0x12345678 : s;
}

export function nextRand(): f32 {
  let x = rngState;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  rngState = x;
  return <f32>(x & 0xFFFFFF) / <f32>0x1000000;
}

/**
 * Steps N swarm/particle entities inside WebAssembly linear memory with dual
 * gravitational attractors (player magnet / black-hole singularity).
 * Returns bitpacked: lower 16 bits = active count, upper 16 bits = absorbed count.
 */
export function stepGravitySwarm(
  basePtr: usize,
  count: i32,
  dt: f32,
  w: f32,
  h: f32,
  holeX: f32,
  holeY: f32,
  holeStrength: f32,
  playerX: f32,
  playerY: f32,
  pulsePush: f32
): u32 {
  let active: i32 = 0;
  let absorbed: i32 = 0;

  for (let i: i32 = 0; i < count; i++) {
    const ptr = basePtr + <usize>i * STRIDE;
    let x = load<f32>(ptr);
    if (x < <f32>-900.0) continue;

    let y = load<f32>(ptr, 4);
    let vx = load<f32>(ptr, 8);
    let vy = load<f32>(ptr, 12);
    let hp = load<f32>(ptr, 16);
    const kind = load<f32>(ptr, 20);

    // 1. Singularity vortex pull + tangential swirl
    if (holeStrength > <f32>0.01) {
      const hdx: f32 = holeX - x;
      const hdy: f32 = holeY - y;
      const hd2: f32 = hdx * hdx + hdy * hdy + <f32>120.0;
      const hdist: f32 = Mathf.sqrt(hd2);
      const force: f32 = (holeStrength * (kind > <f32>0.5 ? <f32>1.15 : <f32>0.85)) / hd2;
      // Radial pull + orbital spin
      vx += (hdx * force - hdy * (force * <f32>0.65)) * dt * <f32>220.0;
      vy += (hdy * force + hdx * (force * <f32>0.65)) * dt * <f32>220.0;

      if (hdist < <f32>26.0) {
        // Swallowed by black hole!
        store<f32>(ptr, <f32>-999.0);
        absorbed++;
        continue;
      }
    }

    // 2. Player attraction / pulse shockwave
    const pdx: f32 = x - playerX;
    const pdy: f32 = y - playerY;
    const pd2: f32 = pdx * pdx + pdy * pdy + <f32>64.0;
    const pdist: f32 = Mathf.sqrt(pd2);

    if (pulsePush > <f32>0.1 && pdist < <f32>220.0) {
      const repulse: f32 = (pulsePush * <f32>950.0) / (pdist + <f32>20.0);
      vx += (pdx / pdist) * repulse * dt * <f32>12.0;
      vy += (pdy / pdist) * repulse * dt * <f32>12.0;
      hp -= pulsePush * dt * <f32>2.5;
    } else if (kind >= <f32>1.0 && pdist > <f32>4.0) {
      // Hostile hunters steer toward player
      const chase: f32 = (kind > <f32>1.5 ? <f32>135.0 : <f32>88.0);
      vx += (-pdx / pdist) * chase * dt * <f32>1.4;
      vy += (-pdy / pdist) * chase * dt * <f32>1.4;
    }

    // Velocity damping & speed clamp
    const damp: f32 = Mathf.pow(<f32>0.96, dt * <f32>60.0);
    vx *= damp;
    vy *= damp;

    const spd: f32 = Mathf.sqrt(vx * vx + vy * vy);
    if (spd > <f32>380.0) {
      const s: f32 = <f32>380.0 / spd;
      vx *= s;
      vy *= s;
    }

    x += vx * dt;
    y += vy * dt;

    // Elastic arena boundary bounce
    if (x < <f32>14.0) { x = <f32>14.0; vx = Mathf.abs(vx) * <f32>0.85; }
    else if (x > w - <f32>14.0) { x = w - <f32>14.0; vx = -Mathf.abs(vx) * <f32>0.85; }

    if (y < <f32>14.0) { y = <f32>14.0; vy = Mathf.abs(vy) * <f32>0.85; }
    else if (y > h - <f32>14.0) { y = h - <f32>14.0; vy = -Mathf.abs(vy) * <f32>0.85; }

    if (hp <= <f32>0.0) {
      store<f32>(ptr, <f32>-999.0);
      absorbed++;
      continue;
    }

    store<f32>(ptr, x);
    store<f32>(ptr, y, 4);
    store<f32>(ptr, vx, 8);
    store<f32>(ptr, vy, 12);
    store<f32>(ptr, hp, 16);
    active++;
  }

  return (<u32>(absorbed & 0xFFFF) << 16) | <u32>(active & 0xFFFF);
}
