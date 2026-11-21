import { readPalette } from './color.js'
import { loop } from './loop.js'

// ---- pure logic (tested separately) ---------------------------------------
// grid[i] = 0 (dead) or the cell's age (1..255). The world wraps around (torus).

export function stepInto(src, dst, cols, rows) {
  let pop = 0
  for (let y = 0; y < rows; y++) {
    const up = ((y + rows - 1) % rows) * cols
    const mid = y * cols
    const down = ((y + 1) % rows) * cols
    for (let x = 0; x < cols; x++) {
      const l = (x + cols - 1) % cols
      const r = (x + 1) % cols
      const n =
        (src[up + l] > 0) + (src[up + x] > 0) + (src[up + r] > 0) +
        (src[mid + l] > 0) + (src[mid + r] > 0) +
        (src[down + l] > 0) + (src[down + x] > 0) + (src[down + r] > 0)
      const i = mid + x
      const alive = src[i] > 0
      if (alive && (n === 2 || n === 3)) {
        dst[i] = src[i] < 255 ? src[i] + 1 : 255
        pop++
      } else if (!alive && n === 3) {
        dst[i] = 1
        pop++
      } else {
        dst[i] = 0
      }
    }
  }
  return pop
}

export function sprinkle(grid, density, rnd = Math.random) {
  for (let i = 0; i < grid.length; i++) if (rnd() < density) grid[i] = 1
}

// ---- the effect ------------------------------------------------------------
const MAX_CELLS = 16000 // hard cap so huge monitors don't get a huge grid
const STEP_FPS = 9

export function startLife(canvas, { animate, onSlow }) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  let cell = 12
  while (Math.ceil(vw / cell) * Math.ceil(vh / cell) > MAX_CELLS) cell += 2
  const cols = Math.ceil(vw / cell)
  const rows = Math.ceil(vh / cell)

  canvas.width = vw
  canvas.height = vh
  const ctx = canvas.getContext('2d')
  const { accents } = readPalette()
  // young -> old
  const colors = [3, 2, 1, 0].map((i) => accents[i % accents.length])
  const css = colors.map(([r, g, b]) => `rgb(${r},${g},${b})`)
  const limits = [3, 11, 41, 256] // age buckets

  let a = new Uint8Array(cols * rows)
  let b = new Uint8Array(cols * rows)
  sprinkle(a, 0.16)

  const draw = () => {
    ctx.clearRect(0, 0, vw, vh)
    let lo = 1
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = css[k]
      const hi = limits[k]
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = a[y * cols + x]
          if (v >= lo && v < hi) ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2)
        }
      }
      lo = hi
    }
  }

  // never let it die or freeze: if the population stops changing, add some life
  const history = []
  const revive = (pop) => {
    history.push(pop)
    if (history.length > 40) history.shift()
    const frozen = history.length === 40 && history.every((p) => p === history[0])
    if (frozen || pop < cols * rows * 0.004) {
      sprinkle(a, 0.1)
      history.length = 0
    }
  }

  // click / drag on the empty page margins to draw cells
  const isMargin = (t) => t === document.documentElement || t === document.body || t.id === 'root'
  let dragging = false
  const paint = (e) => {
    const cx = Math.floor(e.clientX / cell)
    const cy = Math.floor(e.clientY / cell)
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (Math.random() < 0.7) a[((cy + dy + rows) % rows) * cols + ((cx + dx + cols) % cols)] = 1
      }
    }
    draw()
  }
  const down = (e) => {
    if (e.button !== 0 || !isMargin(e.target)) return
    dragging = true
    e.preventDefault()
    paint(e)
  }
  const move = (e) => dragging && paint(e)
  const up = () => (dragging = false)
  window.addEventListener('pointerdown', down)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)

  draw()
  let stopLoop = () => {}
  if (animate) {
    stopLoop = loop({
      fps: STEP_FPS,
      onSlow,
      tick: () => {
        const pop = stepInto(a, b, cols, rows)
        ;[a, b] = [b, a]
        revive(pop)
        draw()
      },
    })
  }

  return () => {
    stopLoop()
    window.removeEventListener('pointerdown', down)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
  }
}
