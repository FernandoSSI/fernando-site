import { useEffect, useState } from 'react'
import C from './content.json'
import { useT } from './i18n.jsx'

// Renders a translatable string that may contain light HTML (<em>, <strong>, &amp;).
// Content comes from content.json, which is ours, so this is safe.
export function H({ x, as: Tag = 'span', ...props }) {
  const t = useT()
  return <Tag {...props} dangerouslySetInnerHTML={{ __html: t(x) }} />
}

// Big colored table box used for every main section. Click the header to collapse it.
export function Section({ id, color, title, children }) {
  const t = useT()
  const [open, setOpen] = useState(true)

  // Jumping to a collapsed section from the index (#id) opens it.
  useEffect(() => {
    const check = () => {
      if (location.hash === `#${id}`) setOpen(true)
    }
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [id])

  return (
    <table id={id} className={`sec s-${color}`} cellPadding="0" cellSpacing="0">
      <tbody>
        <tr>
          <th>
            <div className="bar" onClick={() => setOpen((o) => !o)}>
              <H x={title} />
              <button
                type="button"
                className="toggle"
                aria-expanded={open}
                aria-label={t(open ? C.ui.collapse : C.ui.expand)}
              >
                {open ? '▲' : '▼'}
              </button>
            </div>
          </th>
        </tr>
        {open && (
          <tr>
            <td>{children}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

// Small box for the left column.
export function Panel({ color, title, tdClass, children }) {
  return (
    <table className={`panel p-${color}`} cellPadding="0" cellSpacing="0">
      <tbody>
        <tr>
          <th>
            <H x={title} />
          </th>
        </tr>
        <tr>
          <td className={tdClass}>{children}</td>
        </tr>
      </tbody>
    </table>
  )
}
