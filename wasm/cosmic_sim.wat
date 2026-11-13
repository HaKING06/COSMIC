(module
  (memory (export "memory") 4)

  (func $xorshift32 (export "xorshift32") (param $seed i32) (result i32)
    (local $x i32)
    local.get $seed
    local.set $x
    local.get $x
    i32.eqz
    if
      i32.const 1831565813
      local.set $x
    end
    local.get $x
    local.get $x
    i32.const 13
    i32.shl
    i32.xor
    local.set $x
    local.get $x
    local.get $x
    i32.const 17
    i32.shr_u
    i32.xor
    local.set $x
    local.get $x
    local.get $x
    i32.const 5
    i32.shl
    i32.xor
  )

  (func $step_bullets (export "step_bullets") (param $ptr i32) (param $count i32) (param $dt f32) (param $w f32) (param $h f32) (param $px f32) (param $py f32) (result i32)
    (local $i i32)
    (local $addr i32)
    (local $hits i32)
    (local $x f32)
    (local $y f32)
    (local $vx f32)
    (local $vy f32)
    (local $dx f32)
    (local $dy f32)
    local.get $count
    i32.const 0
    i32.le_s
    local.get $ptr
    i32.const 0
    i32.lt_s
    i32.or
    if
      i32.const 0
      return
    end
    i32.const 0
    local.set $i
    i32.const 0
    local.set $hits
    block $done
      loop $next
        local.get $i
        local.get $count
        i32.ge_s
        br_if $done
        local.get $ptr
        local.get $i
        i32.const 4
        i32.shl
        i32.add
        local.set $addr
        local.get $addr
        f32.load
        local.tee $x
        f32.const -900.0
        f32.gt
        if
          local.get $addr
          f32.load offset=4
          local.set $y
          local.get $addr
          f32.load offset=8
          local.set $vx
          local.get $addr
          f32.load offset=12
          local.set $vy
          local.get $x
          local.get $vx
          local.get $dt
          f32.mul
          f32.add
          local.set $x
          local.get $y
          local.get $vy
          local.get $dt
          f32.mul
          f32.add
          local.set $y
          local.get $x
          f32.const 0.0
          f32.ge
          local.get $x
          local.get $w
          f32.le
          i32.and
          local.get $y
          f32.const 0.0
          f32.ge
          i32.and
          local.get $y
          local.get $h
          f32.le
          i32.and
          if
            local.get $addr
            local.get $x
            f32.store
            local.get $addr
            local.get $y
            f32.store offset=4
            local.get $x
            local.get $px
            f32.sub
            local.set $dx
            local.get $y
            local.get $py
            f32.sub
            local.set $dy
            local.get $dx
            local.get $dx
            f32.mul
            local.get $dy
            local.get $dy
            f32.mul
            f32.add
            f32.const 169.0
            f32.lt
            if
              local.get $hits
              i32.const 1
              i32.add
              local.set $hits
            end
          else
            local.get $addr
            f32.const -999.0
            f32.store
            local.get $addr
            local.get $y
            f32.store offset=4
          end
        end
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $next
      end
    end
    local.get $hits
  )

  (func $cellular_step (export "cellular_step") (param $srcPtr i32) (param $dstPtr i32) (param $cols i32) (param $rows i32) (result i32)
    (local $r i32)
    (local $c i32)
    (local $idx i32)
    (local $cell i32)
    (local $inf i32)
    (local $newly i32)
    local.get $cols
    i32.const 0
    i32.le_s
    local.get $rows
    i32.const 0
    i32.le_s
    i32.or
    local.get $srcPtr
    i32.const 0
    i32.lt_s
    i32.or
    local.get $dstPtr
    i32.const 0
    i32.lt_s
    i32.or
    if
      i32.const 0
      return
    end
    i32.const 0
    local.set $newly
    i32.const 0
    local.set $r
    block $rows_done
      loop $row_loop
        local.get $r
        local.get $rows
        i32.ge_s
        br_if $rows_done
        i32.const 0
        local.set $c
        block $cols_done
          loop $col_loop
            local.get $c
            local.get $cols
            i32.ge_s
            br_if $cols_done
            local.get $r
            local.get $cols
            i32.mul
            local.get $c
            i32.add
            local.set $idx
            local.get $srcPtr
            local.get $idx
            i32.add
            i32.load8_u
            local.tee $cell
            i32.const 1
            i32.eq
            if
              local.get $dstPtr
              local.get $idx
              i32.add
              i32.const 1
              i32.store8
            else
              local.get $cell
              i32.const 2
              i32.eq
              if
                local.get $dstPtr
                local.get $idx
                i32.add
                i32.const 2
                i32.store8
              else
                i32.const 0
                local.set $inf
                local.get $r
                i32.const 0
                i32.gt_s
                if
                  local.get $srcPtr
                  local.get $idx
                  local.get $cols
                  i32.sub
                  i32.add
                  i32.load8_u
                  i32.const 2
                  i32.eq
                  if
                    i32.const 1
                    local.set $inf
                  end
                end
                local.get $r
                i32.const 1
                i32.add
                local.get $rows
                i32.lt_s
                if
                  local.get $srcPtr
                  local.get $idx
                  local.get $cols
                  i32.add
                  i32.add
                  i32.load8_u
                  i32.const 2
                  i32.eq
                  if
                    i32.const 1
                    local.set $inf
                  end
                end
                local.get $c
                i32.const 0
                i32.gt_s
                if
                  local.get $srcPtr
                  local.get $idx
                  i32.const 1
                  i32.sub
                  i32.add
                  i32.load8_u
                  i32.const 2
                  i32.eq
                  if
                    i32.const 1
                    local.set $inf
                  end
                end
                local.get $c
                i32.const 1
                i32.add
                local.get $cols
                i32.lt_s
                if
                  local.get $srcPtr
                  local.get $idx
                  i32.const 1
                  i32.add
                  i32.add
                  i32.load8_u
                  i32.const 2
                  i32.eq
                  if
                    i32.const 1
                    local.set $inf
                  end
                end
                local.get $inf
                i32.const 0
                i32.ne
                if
                  local.get $dstPtr
                  local.get $idx
                  i32.add
                  i32.const 2
                  i32.store8
                  local.get $newly
                  i32.const 1
                  i32.add
                  local.set $newly
                else
                  local.get $dstPtr
                  local.get $idx
                  i32.add
                  i32.const 0
                  i32.store8
                end
              end
            end
            local.get $c
            i32.const 1
            i32.add
            local.set $c
            br $col_loop
          end
        end
        local.get $r
        i32.const 1
        i32.add
        local.set $r
        br $row_loop
      end
    end
    local.get $newly
  )

  (func $gravity_integrate (export "gravity_integrate") (param $ptr i32) (param $count i32) (param $gx f32) (param $gy f32) (param $gm f32) (param $dt f32) (result i32)
    (local $i i32)
    (local $addr i32)
    (local $active i32)
    (local $x f32)
    (local $y f32)
    (local $vx f32)
    (local $vy f32)
    (local $dx f32)
    (local $dy f32)
    (local $d2 f32)
    (local $dist f32)
    (local $factor f32)
    local.get $count
    i32.const 0
    i32.le_s
    local.get $ptr
    i32.const 0
    i32.lt_s
    i32.or
    if
      i32.const 0
      return
    end
    i32.const 0
    local.set $i
    i32.const 0
    local.set $active
    block $done
      loop $next
        local.get $i
        local.get $count
        i32.ge_s
        br_if $done
        local.get $ptr
        local.get $i
        i32.const 4
        i32.shl
        i32.add
        local.set $addr
        local.get $addr
        f32.load
        local.tee $x
        f32.const -900.0
        f32.gt
        if
          local.get $active
          i32.const 1
          i32.add
          local.set $active
          local.get $addr
          f32.load offset=4
          local.set $y
          local.get $addr
          f32.load offset=8
          local.set $vx
          local.get $addr
          f32.load offset=12
          local.set $vy
          local.get $gx
          local.get $x
          f32.sub
          local.set $dx
          local.get $gy
          local.get $y
          f32.sub
          local.set $dy
          local.get $dx
          local.get $dx
          f32.mul
          local.get $dy
          local.get $dy
          f32.mul
          f32.add
          local.tee $d2
          f32.const 0.0001
          f32.gt
          if
            local.get $d2
            f32.sqrt
            local.set $dist
            local.get $gm
            f32.const 900.0
            local.get $d2
            f32.max
            f32.div
            local.get $dist
            f32.div
            local.get $dt
            f32.mul
            local.set $factor
            local.get $vx
            local.get $dx
            local.get $factor
            f32.mul
            f32.add
            local.set $vx
            local.get $vy
            local.get $dy
            local.get $factor
            f32.mul
            f32.add
            local.set $vy
          end
          local.get $x
          local.get $vx
          local.get $dt
          f32.mul
          f32.add
          local.set $x
          local.get $y
          local.get $vy
          local.get $dt
          f32.mul
          f32.add
          local.set $y
          local.get $addr
          local.get $x
          f32.store
          local.get $addr
          local.get $y
          f32.store offset=4
          local.get $addr
          local.get $vx
          f32.store offset=8
          local.get $addr
          local.get $vy
          f32.store offset=12
        end
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $next
      end
    end
    local.get $active
  )

)
