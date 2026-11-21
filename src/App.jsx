import C from './content.json'
import { useLang, useT } from './i18n.jsx'
import { H, Section, Panel } from './components.jsx'
import Spotify from './Spotify.jsx'
import ThemeSelect from './Theme.jsx'

// Images in src/assets get a content hash in their filename, so browsers never serve a stale copy.
const IMAGES = import.meta.glob('./assets/*.{png,jpg,svg,webp,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const img = (name) => IMAGES[`./assets/${name}`]

function LangBar() {
  const { lang, setLang } = useLang()
  const btn = (l, label) => (
    <a
      href={`?lang=${l}`}
      className={lang === l ? 'on' : ''}
      onClick={(e) => {
        e.preventDefault()
        setLang(l)
      }}
    >
      {label}
    </a>
  )
  return (
    <div className="langbar">
      {btn('en', 'EN')}
      {btn('pt', 'PT-BR')}
    </div>
  )
}

function Masthead() {
  const t = useT()
  return (
    <>
      <table className="head" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td>
              <h1 className="name">{C.name}</h1>
              <p className="sub">
                {C.tagline.map((x, i) => (
                  <span key={i}>
                    <b>//</b> {t(x)}{' '}
                  </span>
                ))}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="ticker">
        <span className="track">{t(C.ticker)}</span>
      </div>
    </>
  )
}

function Side() {
  const t = useT()
  const L = C.link_labels
  return (
    <>
      <Panel color="red" title={C.panels.index} tdClass="menu">
        {C.nav.map((n) => (
          <a key={n.id} href={`#${n.id}`}>
            {t(n.label)}
          </a>
        ))}
      </Panel>

      <Panel color="lime" title={C.panels.now} tdClass="mono">
        <span className="blink">&#9608;</span>{' '}
        {C.now.map((i, idx) => (
          <span key={idx}>
            {idx > 0 && (
              <>
                <br />
                <br />
              </>
            )}
            <b>{t(i.k)}:</b>
            <br />
            {t(i.v)}
          </span>
        ))}
      </Panel>

      <Spotify />

      <Panel color="cyan" title={C.panels.links} tdClass="mono">
        <a href={`mailto:${C.email}`}>{t(L.email)}</a>
        <br />
        <a href={C.github}>{t(L.github)}</a>
        <br />
        <a href={C.linkedin}>{t(L.linkedin)}</a>
      </Panel>
    </>
  )
}

function About() {
  const [first, ...rest] = C.about.paras
  return (
    <Section id="about" color="yel" title={C.about.title}>
      <H as="p" className="big" x={first} />
      {rest.map((p, i) => (
        <H as="p" key={i} x={p} />
      ))}
    </Section>
  )
}

function Experience() {
  const E = C.experience
  return (
    <Section id="experience" color="red" title={E.title}>
      {E.jobs.map((j, i) => (
        <div key={i}>
          {i > 0 && <hr className="dash" />}
          <div className="job">
            <h3>
              <H x={j.role} /> <span className="org">@ <H x={j.org} /></span>
            </h3>
            <div className="when">
              <H x={j.when} />
            </div>
            <ul className="hl">
              {j.bullets.map((b, k) => (
                <H as="li" key={k} x={b} />
              ))}
            </ul>
            <div className="stk">{j.stack}</div>
          </div>
        </div>
      ))}
    </Section>
  )
}

function Projects() {
  const P = C.projects
  const t = useT()
  return (
    <Section id="projects" color="cyan" title={P.title}>
      {P.items.map((p) => (
        <div className="job proj-card" key={p.name}>
          {p.sticker && (
            <>
              <img className="sticker" src={img(p.sticker)} alt={`${p.name} logo`} width="112" />
              <div className="sticker-gap" />
            </>
          )}
          <h3>
            {p.name} <span className="org">- <H x={p.tagline} /></span>
          </h3>
          <div className="when">
            <H x={p.meta} />
          </div>
          <H as="p" x={p.desc} />
          <pre className="contact">$ {p.code}</pre>
          <div className="stk">{p.stack}</div>
          <p>
            {p.links.map((l) => (
              <span key={l.url}>
                <a href={l.url}>[ {t(l.label)} ]</a>{' '}
              </span>
            ))}
          </p>
        </div>
      ))}
      <H as="p" className="cvnote" x={P.more} />
    </Section>
  )
}

function Stack() {
  return (
    <Section id="stack" color="lime" title={C.stack.title}>
      <div className="tags">
        {C.stack.rows.map((row, i) => (
          <div key={i}>
            {row.map((tag) => {
              const hi = tag.startsWith('*')
              return (
                <span key={tag} className={`tag${hi ? ' h' : ''}`}>
                  {hi ? tag.slice(1) : tag}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </Section>
  )
}

function Other() {
  const t = useT()
  return (
    <Section id="other" color="mag" title={C.other.title}>
      {C.other.items.map((i, idx) => (
        <p key={idx}>
          <strong>{t(i.k)}</strong> - <H x={i.v} />
        </p>
      ))}
    </Section>
  )
}

function Contact() {
  const strip = (u) => u.replace('https://', '')
  return (
    <Section id="contact" color="red" title={C.contact.title}>
      <pre className="contact">
        {`email     ${C.email}\ngithub    ${strip(C.github)}\nlinkedin  ${strip(C.linkedin)}`}
      </pre>
      <a href={`mailto:${C.email}`}>[ <H x={C.contact.send} /> ]</a>{' '}
      <a href={C.github}>[ github ]</a>{' '}
      <a href={C.linkedin}>[ linkedin ]</a>
    </Section>
  )
}

function Footer() {
  const { lang } = useLang()
  const t = useT()
  const d = new Date(__BUILD_DATE__)
  const month = C.footer.months[lang][d.getMonth()]
  const date = lang === 'pt' ? `${month} de ${d.getFullYear()}` : `${month} ${d.getFullYear()}`
  return (
    <p className="foot">
      &copy; {d.getFullYear()} {C.name} &nbsp;|&nbsp; {t(C.footer.updated)} {date} &nbsp;|&nbsp;{' '}
      <a href="#top">{t(C.footer.top)}</a>
    </p>
  )
}

export default function App() {
  return (
    <div id="wrap">
      <a id="top" />
      <div className="topbar">
        <ThemeSelect />
        <LangBar />
      </div>
      <Masthead />
      <table className="layout" width="100%" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td className="side">
              <Side />
            </td>
            <td className="main">
              <About />
              <Experience />
              <Projects />
              <Stack />
              <Other />
              <Contact />
            </td>
          </tr>
        </tbody>
      </table>
      <Footer />
    </div>
  )
}
