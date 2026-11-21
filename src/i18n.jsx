import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import C from './content.json'

// Language: ?lang=en|pt, then the saved choice, then the browser language.
function initial() {
  const m = /[?&]lang=(en|pt)\b/.exec(location.search)
  if (m) return m[1]
  try {
    const s = localStorage.getItem('lang')
    if (s === 'en' || s === 'pt') return s
  } catch {}
  return /^pt/i.test(navigator.language || '') ? 'pt' : 'en'
}

const Ctx = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initial)

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
    document.title = C.meta.title[lang]
    document
      .querySelector('meta[name=description]')
      ?.setAttribute('content', C.meta.description[lang])
  }, [lang])

  const setLang = useCallback((l) => {
    try {
      localStorage.setItem('lang', l)
    } catch {}
    setLangState(l)
  }, [])

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)

// t({en, pt}) -> string for the current language. Plain strings pass through.
export function useT() {
  const { lang } = useLang()
  return (x) => (typeof x === 'string' ? x : x[lang])
}
