// Reads the current theme's colours from the CSS variables, so effects follow the theme.

export function parseColor(str) {
  if (!str) return null
  const s = str.trim()
  let m = /^#([0-9a-f]{3})$/i.exec(s)
  if (m) return [...m[1]].map((c) => parseInt(c + c, 16))
  m = /^#([0-9a-f]{6})$/i.exec(s)
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
  m = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(s)
  if (m) return [+m[1], +m[2], +m[3]]
  return null
}

const FALLBACK = [
  [255, 0, 204],
  [0, 229, 255],
  [124, 252, 0],
  [255, 230, 0],
]

export function readPalette() {
  const style = getComputedStyle(document.documentElement)
  const get = (name) => parseColor(style.getPropertyValue(name))
  const accents = ['--a-mag', '--a-cyan', '--a-lime', '--a-yel', '--a-red'].map(get).filter(Boolean)
  return {
    accents: accents.length ? accents : FALLBACK,
    bg: get('--bg') || [5, 5, 5],
  }
}
