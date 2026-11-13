-- =============================================================================
-- COSMIC UNIVERSE v11.5 — LUA 5.3 AUTONOMOUS TACTICAL AI KERNELS (Fengari VM)
-- =============================================================================
-- Executed live inside browser via vendor/fengari-web.js (Lua 5.3).
-- Exposes decide_bot_action(bot, threats, nodes) for selectable Lua chips.

CHIP_PROFILES = {
  hunter = {
    name = "HUNTER-SEEKER.lua",
    desc = "Aggressively tracks nearest rogue drone and fires rapid plasma.",
    code = [[
function step_ai(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist)
  if cooldown <= 0 and tdist < 280 then
    return "FIRE", tx, ty
  end
  if tdist < 420 then
    return "CHASE", tx, ty
  end
  return "HOLD", nx, ny
end
]]
  },
  kiter = {
    name = "ORBIT-KITER.lua",
    desc = "Maintains safe perimeter ring while sniping incoming hostiles.",
    code = [[
function step_ai(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist)
  if hp < 40 and ndist > 35 then
    return "RETREAT", nx, ny
  end
  if tdist < 130 then
    local rx = bx + (bx - tx)
    local ry = by + (by - ty)
    return "EVADE", rx, ry
  end
  if cooldown <= 0 and tdist < 320 then
    return "FIRE", tx, ty
  end
  return "ORBIT", nx + 70, ny - 50
end
]]
  },
  guardian = {
    name = "AEGIS-GUARD.lua",
    desc = "Defends S.A.R.A. data core and deploys EMP pulse when swarmed.",
    code = [[
function step_ai(bx, by, hp, cooldown, tx, ty, tdist, nx, ny, ndist)
  if tdist < 110 and cooldown <= 0 then
    return "EMP", tx, ty
  end
  if ndist > 95 then
    return "GUARD", nx, ny
  end
  if cooldown <= 0 and tdist < 260 then
    return "FIRE", tx, ty
  end
  return "GUARD", nx, ny
end
]]
  }
}
