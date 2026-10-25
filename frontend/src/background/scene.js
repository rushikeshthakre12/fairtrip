/**
 * FairTrip animated background — "Night ride" scene.
 *
 * A Mumbai-style night street: parallax skyline, street lamps, black-and-yellow
 * taxis with glowing roof signs, each carrying a ticking fare-meter chip that
 * turns green -> amber -> red (the same TYPICAL / ABOVE / UNUSUALLY HIGH idea the
 * app uses), plus a pickup -> drop route arc in the sky.
 *
 * The scene is a PURE FUNCTION OF TIME (t seconds) with a seamless LOOP-second
 * cycle, drawn in a virtual 1920x1080 space. That means:
 *   - it renders crisp at any resolution (Full HD, 4K, phones),
 *   - the live background and the exported MP4 come from exactly the same code,
 *   - frame at t = LOOP is identical to frame at t = 0 (perfect loop).
 *
 * The fare numbers in the chips are illustrative visuals, not real predictions.
 */
export const W = 1920
export const H = 1080
export const LOOP = 20 // seconds — one full seamless cycle
export const STILL_T = 7.5 // frame used when motion is off / reduced-motion

const TAU = Math.PI * 2
const GREEN = '57,255,136'
const AMBER = '245,196,81'
const RED = '255,92,92'
const MONO = '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Consolas, "DejaVu Sans Mono", monospace'

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (x) => {
  const c = clamp01(x)
  return c * c * (3 - 2 * c)
}
const mod = (a, n) => ((a % n) + n) % n
const lerp = (a, b, p) => a + (b - a) * p

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

/* ------------------------------------------------------------------ */
/* Static (seeded, deterministic) scene data                           */
/* ------------------------------------------------------------------ */
const R = rng(20260101)

const STARS = Array.from({ length: 170 }, () => ({
  x: R() * W,
  y: R() * 560,
  r: 0.5 + R() * 1.4,
  k: 1 + Math.floor(R() * 4),
  ph: R(),
}))

function makeLayer({ seed, tile, minW, maxW, minH, maxH, windows, gap }) {
  const r = rng(seed)
  const items = []
  let x = 0
  while (x < tile - 24) {
    const w = Math.min(minW + r() * (maxW - minW), tile - x)
    const h = minH + r() * (maxH - minH)
    const b = { x, w, h, ant: r() < 0.22 ? 24 + r() * 50 : 0, antPh: r(), win: [] }
    if (windows) {
      const cols = Math.max(1, Math.floor((w - 18) / 20))
      const rows = Math.max(1, Math.floor((h - 36) / 28))
      const cw = (w - 12) / cols
      for (let c = 0; c < cols; c++) {
        for (let rw = 0; rw < rows; rw++) {
          const roll = r()
          if (roll < 0.5) continue
          b.win.push({
            x: 6 + c * cw + (cw - 8) / 2,
            y: 22 + rw * 28,
            blink: roll > 0.9,
            k: 1 + Math.floor(r() * 3),
            ph: r(),
            warm: r() < 0.25,
          })
        }
      }
    }
    items.push(b)
    x += w + gap
  }
  return { tile, items }
}

const FAR = makeLayer({ seed: 11, tile: 960, minW: 50, maxW: 120, minH: 140, maxH: 340, windows: false, gap: 4 })
const MID = makeLayer({ seed: 22, tile: 1440, minW: 70, maxW: 150, minH: 200, maxH: 470, windows: true, gap: 6 })
const NEAR = makeLayer({ seed: 33, tile: 1920, minW: 90, maxW: 190, minH: 160, maxH: 420, windows: true, gap: 10 })

const FIREFLIES = Array.from({ length: 64 }, () => ({
  x0: R() * W,
  y0: R() * H,
  n: 1 + Math.floor(R() * 2),
  k: 1 + Math.floor(R() * 3),
  ph: R(),
  r: 0.8 + R() * 1.8,
  a: 0.2 + R() * 0.4,
  amp: 10 + R() * 30,
}))

const MARGIN = 260
const SPAN = W + MARGIN * 2
const TAXIS = [
  { lane: 'far', dir: -1, n: 3, x0: 700, chipK: 1, chipOff: 0.25 },
  { lane: 'far', dir: -1, n: 3, x0: 1700, chipK: 1, chipOff: 0.7 },
  { lane: 'near', dir: 1, n: 2, x0: 160, chipK: 2, chipOff: 0.0 },
  { lane: 'near', dir: 1, n: 2, x0: 1180, chipK: 2, chipOff: 0.5 },
]
const LANES = {
  far: { groundY: 975, scale: 0.78, alpha: 0.88 },
  near: { groundY: 1058, scale: 1, alpha: 1 },
}

const RA = { x: 300, y: 470 }
const RB = { x: 1560, y: 430 }
const RC = { x: 930, y: 150 }

/* ------------------------------------------------------------------ */
/* Drawing helpers                                                     */
/* ------------------------------------------------------------------ */
function drawSky(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, 900)
  g.addColorStop(0, '#030605')
  g.addColorStop(0.55, '#07100c')
  g.addColorStop(0.85, '#0d2018')
  g.addColorStop(1, '#10261c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // soft horizon glow
  const pulse = 0.9 + 0.1 * Math.sin(TAU * 2 * (t / LOOP))
  const hg = ctx.createRadialGradient(W / 2, 880, 40, W / 2, 880, 900)
  hg.addColorStop(0, `rgba(${GREEN},${0.13 * pulse})`)
  hg.addColorStop(1, `rgba(${GREEN},0)`)
  ctx.fillStyle = hg
  ctx.fillRect(0, 0, W, H)

  for (const s of STARS) {
    const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(TAU * (s.k * (t / LOOP) + s.ph)))
    ctx.fillStyle = `rgba(220,255,235,${a})`
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, TAU)
    ctx.fill()
  }
}

function drawMoon(ctx, t) {
  const x = 1650
  const y = 150
  const k = 0.9 + 0.1 * Math.sin(TAU * 2 * (t / LOOP))
  const glow = ctx.createRadialGradient(x, y, 10, x, y, 200)
  glow.addColorStop(0, `rgba(180,255,210,${0.24 * k})`)
  glow.addColorStop(1, 'rgba(180,255,210,0)')
  ctx.fillStyle = glow
  ctx.fillRect(x - 210, y - 210, 420, 420)
  ctx.fillStyle = '#e9fff1'
  ctx.beginPath()
  ctx.arc(x, y, 34, 0, TAU)
  ctx.fill()
  ctx.fillStyle = 'rgba(120,170,140,0.35)'
  ;[
    [-10, -8, 8],
    [12, 6, 6],
    [-4, 14, 4],
  ].forEach(([dx, dy, r]) => {
    ctx.beginPath()
    ctx.arc(x + dx, y + dy, r, 0, TAU)
    ctx.fill()
  })
}

function qpt(u) {
  const a = (1 - u) * (1 - u)
  const b = 2 * (1 - u) * u
  const c = u * u
  return { x: a * RA.x + b * RC.x + c * RB.x, y: a * RA.y + b * RC.y + c * RB.y }
}

function drawPin(ctx, p, label, t, off) {
  const f = mod(8 * (t / LOOP) + off, 1)
  ctx.strokeStyle = `rgba(${GREEN},${0.55 * (1 - f)})`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(p.x, p.y, 8 + 26 * f, 0, TAU)
  ctx.stroke()
  ctx.fillStyle = `rgb(${GREEN})`
  ctx.beginPath()
  ctx.arc(p.x, p.y, 7, 0, TAU)
  ctx.fill()
  ctx.fillStyle = '#07100c'
  ctx.beginPath()
  ctx.arc(p.x, p.y, 3, 0, TAU)
  ctx.fill()
  ctx.font = `600 14px ${MONO}`
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(243,247,244,0.72)'
  ctx.fillText(label, p.x, p.y - 26)
}

function drawRoute(ctx, t) {
  ctx.save()
  ctx.lineWidth = 3
  ctx.strokeStyle = `rgba(${GREEN},0.38)`
  ctx.setLineDash([14, 12])
  ctx.lineDashOffset = -mod(52 * t, 26)
  ctx.beginPath()
  ctx.moveTo(RA.x, RA.y)
  ctx.quadraticCurveTo(RC.x, RC.y, RB.x, RB.y)
  ctx.stroke()
  ctx.setLineDash([])

  const u = mod(2 * (t / LOOP), 1)
  for (let i = 12; i >= 1; i--) {
    const uu = u - i * 0.012
    if (uu < 0) continue
    const p = qpt(uu)
    ctx.fillStyle = `rgba(${GREEN},${0.5 * (1 - i / 13)})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, 7 * (1 - i / 16), 0, TAU)
    ctx.fill()
  }
  const head = qpt(u)
  const hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 26)
  hg.addColorStop(0, `rgba(${GREEN},0.95)`)
  hg.addColorStop(1, `rgba(${GREEN},0)`)
  ctx.fillStyle = hg
  ctx.fillRect(head.x - 28, head.y - 28, 56, 56)

  drawPin(ctx, RA, 'PICKUP', t, 0)
  drawPin(ctx, RB, 'DROP', t, 0.5)
  ctx.restore()
}

function drawLayer(ctx, layer, shift, baseY, fill, t, opts) {
  const { tile, items } = layer
  const copies = Math.ceil(W / tile) + 1
  const off = mod(shift, tile)
  const a0 = opts.winAlpha
  const litCool = `rgba(160,255,200,${a0})`
  const litWarm = `rgba(${AMBER},${a0})`
  const dimCool = `rgba(160,255,200,${a0 * 0.08})`
  const dimWarm = `rgba(${AMBER},${a0 * 0.08})`
  for (let c = 0; c < copies; c++) {
    const ox = c * tile - off
    for (const b of items) {
      const x = ox + b.x
      if (x > W || x + b.w < 0) continue
      const top = baseY - b.h
      ctx.fillStyle = fill
      ctx.fillRect(x, top, b.w, b.h + 2)
      ctx.fillStyle = `rgba(${GREEN},0.07)`
      ctx.fillRect(x, top, b.w, 2)
      if (b.ant) {
        ctx.fillStyle = fill
        ctx.fillRect(x + b.w / 2 - 1.5, top - b.ant, 3, b.ant)
        if (opts.beacon) {
          const on = Math.sin(TAU * (2 * (t / LOOP) + b.antPh)) > 0.2
          if (on) {
            ctx.fillStyle = b.antPh > 0.5 ? `rgba(${RED},0.95)` : `rgba(${GREEN},0.95)`
            ctx.beginPath()
            ctx.arc(x + b.w / 2, top - b.ant, 3, 0, TAU)
            ctx.fill()
          }
        }
      }
      for (const w of b.win) {
        const lit = !w.blink || Math.sin(TAU * (w.k * (t / LOOP) + w.ph)) > 0.1
        ctx.fillStyle = w.warm ? (lit ? litWarm : dimWarm) : lit ? litCool : dimCool
        ctx.fillRect(x + w.x, top + w.y, 8, 12)
      }
    }
  }
}

function drawLamps(ctx, t) {
  const tile = 480
  const off = mod(6 * tile * (t / LOOP), tile)
  const count = Math.ceil(W / tile) + 2
  for (let c = 0; c < count; c++) {
    const x = c * tile - off + 240
    ctx.fillStyle = '#16201b'
    ctx.fillRect(x - 3, 740, 6, 150)
    ctx.fillRect(x - 3, 740, 36, 5)
    ctx.globalCompositeOperation = 'lighter'
    const g = ctx.createRadialGradient(x + 30, 750, 0, x + 30, 750, 150)
    g.addColorStop(0, 'rgba(190,255,215,0.28)')
    g.addColorStop(1, 'rgba(190,255,215,0)')
    ctx.fillStyle = g
    ctx.fillRect(x - 130, 600, 320, 300)
    const pool = ctx.createRadialGradient(x + 30, 925, 0, x + 30, 925, 170)
    pool.addColorStop(0, 'rgba(190,255,215,0.13)')
    pool.addColorStop(1, 'rgba(190,255,215,0)')
    ctx.fillStyle = pool
    ctx.fillRect(x - 150, 900, 360, 60)
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = '#eafff3'
    rr(ctx, x + 22, 745, 16, 7, 3)
    ctx.fill()
  }
}

function drawRoad(ctx, t) {
  ctx.fillStyle = '#0d1512'
  ctx.fillRect(0, 885, W, 22)
  ctx.fillStyle = `rgba(${GREEN},0.12)`
  ctx.fillRect(0, 885, W, 2)

  const g = ctx.createLinearGradient(0, 907, 0, H)
  g.addColorStop(0, '#0b110e')
  g.addColorStop(1, '#050807')
  ctx.fillStyle = g
  ctx.fillRect(0, 907, W, H - 907)

  const P = 140
  const off = mod(20 * P * (t / LOOP), P)
  ctx.fillStyle = 'rgba(243,247,244,0.26)'
  for (let x = -P - off; x < W + P; x += P) ctx.fillRect(x, 1003, 64, 4)
}

function drawWheel(ctx, wx, wy, spin) {
  ctx.save()
  ctx.translate(wx, wy)
  ctx.fillStyle = '#040605'
  ctx.beginPath()
  ctx.arc(0, 0, 17, 0, TAU)
  ctx.fill()
  ctx.fillStyle = '#1d2722'
  ctx.beginPath()
  ctx.arc(0, 0, 9.5, 0, TAU)
  ctx.fill()
  ctx.rotate(spin)
  ctx.strokeStyle = '#51635a'
  ctx.lineWidth = 2
  for (let i = 0; i < 3; i++) {
    ctx.rotate(Math.PI / 3)
    ctx.beginPath()
    ctx.moveTo(0, -8)
    ctx.lineTo(0, 8)
    ctx.stroke()
  }
  ctx.restore()
}

function drawTaxi(ctx, x, groundY, s, dir, alpha) {
  const spin = (dir * x) / 16
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, groundY)
  ctx.scale(dir * s, s)

  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.ellipse(0, 2, 118, 9, 0, 0, TAU)
  ctx.fill()

  // headlight cone
  ctx.globalCompositeOperation = 'lighter'
  const cone = ctx.createLinearGradient(110, 0, 360, 0)
  cone.addColorStop(0, 'rgba(255,244,200,0.34)')
  cone.addColorStop(1, 'rgba(255,244,200,0)')
  ctx.fillStyle = cone
  ctx.beginPath()
  ctx.moveTo(108, -46)
  ctx.lineTo(360, -80)
  ctx.lineTo(360, 6)
  ctx.lineTo(108, -32)
  ctx.closePath()
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  // body: yellow top, black lower (Mumbai "kaali-peeli")
  ctx.fillStyle = '#F5C451'
  rr(ctx, -110, -64, 220, 48, 13)
  ctx.fill()
  ctx.fillStyle = '#0a0d0c'
  rr(ctx, -110, -38, 220, 22, 11)
  ctx.fill()

  // cabin
  ctx.fillStyle = '#F5C451'
  ctx.beginPath()
  ctx.moveTo(-64, -62)
  ctx.lineTo(-42, -100)
  ctx.lineTo(48, -100)
  ctx.lineTo(74, -62)
  ctx.closePath()
  ctx.fill()

  // windows
  ctx.fillStyle = '#0c1a15'
  ctx.beginPath()
  ctx.moveTo(-54, -66)
  ctx.lineTo(-37, -93)
  ctx.lineTo(-5, -93)
  ctx.lineTo(-5, -66)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(3, -66)
  ctx.lineTo(3, -93)
  ctx.lineTo(41, -93)
  ctx.lineTo(62, -66)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = `rgba(${GREEN},0.12)`
  ctx.beginPath()
  ctx.moveTo(10, -66)
  ctx.lineTo(22, -93)
  ctx.lineTo(30, -93)
  ctx.lineTo(18, -66)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-4, -62)
  ctx.lineTo(-4, -38)
  ctx.stroke()

  // roof sign
  ctx.fillStyle = '#0a0d0c'
  rr(ctx, -16, -112, 32, 13, 3)
  ctx.fill()
  ctx.fillStyle = '#39FF88'
  rr(ctx, -12, -109, 24, 6, 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'lighter'
  const sg = ctx.createRadialGradient(0, -106, 0, 0, -106, 38)
  sg.addColorStop(0, `rgba(${GREEN},0.55)`)
  sg.addColorStop(1, `rgba(${GREEN},0)`)
  ctx.fillStyle = sg
  ctx.fillRect(-40, -146, 80, 80)

  // tail light glow
  const tg = ctx.createRadialGradient(-110, -45, 0, -110, -45, 26)
  tg.addColorStop(0, `rgba(${RED},0.7)`)
  tg.addColorStop(1, `rgba(${RED},0)`)
  ctx.fillStyle = tg
  ctx.fillRect(-140, -75, 60, 60)
  ctx.globalCompositeOperation = 'source-over'

  ctx.fillStyle = '#fff6d0'
  rr(ctx, 102, -50, 10, 10, 3)
  ctx.fill()
  ctx.fillStyle = '#ff5c5c'
  rr(ctx, -113, -50, 8, 10, 3)
  ctx.fill()

  drawWheel(ctx, -64, -16, spin)
  drawWheel(ctx, 64, -16, spin)
  ctx.restore()
}

function drawChip(ctx, cx, bottomY, s, p) {
  const fadeIn = smooth(p / 0.08)
  const fadeOut = 1 - smooth((p - 0.88) / 0.1)
  const a = Math.min(fadeIn, fadeOut)
  if (a <= 0.01) return
  const value = Math.round(lerp(60, 900, p))
  let col = GREEN
  let label = 'TYPICAL'
  if (value > 666) {
    col = RED
    label = 'UNUSUALLY HIGH'
  } else if (value > 444) {
    col = AMBER
    label = 'ABOVE TYPICAL'
  }
  const w = 236 * s
  const h = 46 * s
  const x = cx - w / 2
  const y = bottomY - h - 9 * s
  ctx.save()
  ctx.globalAlpha = a
  ctx.fillStyle = 'rgba(7,11,9,0.88)'
  ctx.strokeStyle = `rgba(${col},0.85)`
  ctx.lineWidth = 1.5
  rr(ctx, x, y, w, h, 12 * s)
  ctx.fill()
  ctx.stroke()
  // pointer
  ctx.beginPath()
  ctx.moveTo(cx - 7 * s, y + h)
  ctx.lineTo(cx, y + h + 9 * s)
  ctx.lineTo(cx + 7 * s, y + h)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = `rgb(${col})`
  ctx.beginPath()
  ctx.arc(x + 16 * s, y + h / 2, 4.5 * s, 0, TAU)
  ctx.fill()
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.font = `700 ${22 * s}px ${MONO}`
  ctx.fillText(`\u20B9${value}`, x + 30 * s, y + h / 2 + 1)
  ctx.textAlign = 'right'
  ctx.font = `600 ${10 * s}px ${MONO}`
  ctx.fillStyle = `rgba(${col},0.9)`
  ctx.fillText(label, x + w - 12 * s, y + h / 2 + 1)
  ctx.restore()
}

function drawFireflies(ctx, t) {
  ctx.globalCompositeOperation = 'lighter'
  for (const f of FIREFLIES) {
    const y = mod(f.y0 - f.n * (H + 40) * (t / LOOP), H + 40) - 20
    const x = f.x0 + f.amp * Math.sin(TAU * (f.k * (t / LOOP) + f.ph))
    const a = f.a * (0.55 + 0.45 * Math.sin(TAU * (f.k * 2 * (t / LOOP) + f.ph)))
    ctx.fillStyle = `rgba(${GREEN},${a})`
    ctx.beginPath()
    ctx.arc(x, y, f.r, 0, TAU)
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */
export function drawScene(ctx, tRaw) {
  const t = mod(tRaw, LOOP)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'

  drawSky(ctx, t)
  drawMoon(ctx, t)
  drawRoute(ctx, t)

  drawLayer(ctx, FAR, (FAR.tile / LOOP) * t, 800, '#0c1411', t, { winAlpha: 0, beacon: false })
  drawLayer(ctx, MID, (MID.tile / LOOP) * t, 850, '#0f1915', t, { winAlpha: 0.5, beacon: true })
  drawLayer(ctx, NEAR, (NEAR.tile / LOOP) * t, 885, '#0a100e', t, { winAlpha: 0.75, beacon: true })

  drawRoad(ctx, t)
  drawLamps(ctx, t)

  const placed = TAXIS.map((cfg) => {
    const lane = LANES[cfg.lane]
    const x = mod(cfg.x0 + cfg.dir * SPAN * cfg.n * (t / LOOP) + MARGIN, SPAN) - MARGIN
    return { cfg, lane, x }
  })

  for (const { cfg, lane, x } of placed) {
    drawTaxi(ctx, x, lane.groundY, lane.scale, cfg.dir, lane.alpha)
  }

  for (const { cfg, lane, x } of placed) {
    const p = mod(cfg.chipK * (t / LOOP) + cfg.chipOff, 1)
    const bottom = lane.groundY - 122 * lane.scale
    drawChip(ctx, x, bottom, lane.scale, p)
  }

  drawFireflies(ctx, t)

  // vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, 320, W / 2, H / 2, 1250)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,0.6)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, W, H)
  ctx.globalAlpha = 1
}

/** Paint the scene into a canvas, "cover"-fitted and bottom-anchored. */
export function paint(canvas, t) {
  const ctx = canvas.getContext('2d')
  const cw = canvas.width
  const ch = canvas.height
  const s = Math.max(cw / W, ch / H)
  const ox = (cw - W * s) / 2
  const oy = ch - H * s
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = '#050807'
  ctx.fillRect(0, 0, cw, ch)
  ctx.setTransform(s, 0, 0, s, ox, oy)
  drawScene(ctx, t)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}
