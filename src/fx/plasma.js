import { readPalette } from './color.js'
import { loop } from './loop.js'

const W = 160 // internal width; the canvas is scaled up with hard pixels (retro look, cheap)

// 256-step colour ramp that cycles through the accents and is pulled a bit toward the page bg.
export function buildLut(colors, bg, pull = 0.2) {
  const lut = new Uint8ClampedArray(256 * 3)
  const n = colors.length
  for (let i = 0; i < 256; i++) {
    const p = (i / 256) * n
    const a = Math.floor(p) % n
    const b = (a + 1) % n
    let f = p - Math.floor(p)
    f = f * f * (3 - 2 * f) // smoothstep
    for (let c = 0; c < 3; c++) {
      const v = colors[a][c] + (colors[b][c] - colors[a][c]) * f
      lut[i * 3 + c] = v + (bg[c] - v) * pull
    }
  }
  return lut
}

export function startPlasma(canvas, { animate, onSlow }) {
  const H = Math.max(40, Math.round((W * window.innerHeight) / Math.max(1, window.innerWidth)))
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(W, H)
  const px = img.data

  const { accents, bg } = readPalette()
  const lut = buildLut(accents, bg)

  const dist = new Float32Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) dist[y * W + x] = Math.hypot(x - W / 2, y - H / 2)
  const colSin = new Float32Array(W)
  const diagSin = new Float32Array(W + H)

  const draw = (t) => {
    for (let x = 0; x < W; x++) colSin[x] = Math.sin(x * 0.09 + t)
    for (let k = 0; k < W + H; k++) diagSin[k] = Math.sin(k * 0.06 + t * 0.7)
    let o = 0
    for (let y = 0; y < H; y++) {
      const rowSin = Math.sin(y * 0.12 - t * 1.3)
      for (let x = 0; x < W; x++) {
        const v = colSin[x] + rowSin + diagSin[x + y] + Math.sin(dist[y * W + x] * 0.1 - t) // -4..4
        const i = (((v + 4) * 0.125 * 255) | 0) * 3
        px[o] = lut[i]
        px[o + 1] = lut[i + 1]
        px[o + 2] = lut[i + 2]
        px[o + 3] = 255
        o += 4
      }
    }
    ctx.putImageData(img, 0, 0)
  }

  let t = 0
  draw(t)
  if (!animate) return () => {}
  // 20 fps and a slow drift: smooth, and far below any flashing threshold
  return loop({
    fps: 20,
    onSlow,
    tick: () => {
      t += 0.045
      draw(t)
    },
  })
}
