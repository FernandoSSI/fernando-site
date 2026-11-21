import { useEffect, useState } from 'react'
import C from './content.json'
import { useT } from './i18n.jsx'

const IDS = C.themes.map((t) => t.id)
const DEFAULT = IDS[0]

// index.html already set data-theme before first paint (saved choice or ?theme=);
// here we just read it back, falling back to the default for unknown values.
function current() {
  const t = document.documentElement.getAttribute('data-theme')
  return IDS.includes(t) ? t : DEFAULT
}

export default function ThemeSelect() {
  const t = useT()
  const [theme, setTheme] = useState(current)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const change = (e) => {
    const v = e.target.value
    try {
      localStorage.setItem('theme', v)
    } catch {}
    setTheme(v)
  }

  return (
    <label className="themebar">
      {t(C.ui.theme)}:
      <select value={theme} onChange={change}>
        {C.themes.map((x) => (
          <option key={x.id} value={x.id}>
            {t(x.name)}
          </option>
        ))}
      </select>
    </label>
  )
}
