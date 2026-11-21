# fernando-site

Personal site / portal. Old-internet look: tables, borders, noise.
React + Vite. One URL, two languages (EN / PT-BR) switched with a button.

## Structure

```
index.html            Vite entry (title, meta, favicon)
vite.config.js
src/
  assets/             images imported by the app (hashed filenames, no stale cache)
  main.jsx            mounts the app
  App.jsx             page layout + every section
  components.jsx      Section / Panel boxes, <H> (text with light HTML)
  i18n.jsx            language state (?lang=, localStorage, browser language)
  content.json        ALL the text, both languages
  styles.css          the whole look
public/                files copied as-is to the site root (empty for now)
dist/                 build output (git-ignored). This is what you deploy.
```

## Working on it

```
npm install
npm run dev        # local dev server with hot reload
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
```

- Change text: edit `src/content.json`. Every translatable string is
  `{ "en": "...", "pt": "..." }`. Light HTML (`<em>`, `<strong>`, `&amp;`) is allowed.
- Change look: edit `src/styles.css`.
- "last updated" in the footer is the build date.

## Adding a section

1. Add its data to `src/content.json` (and to `nav` so it shows in the index).
2. In `src/App.jsx` write a component that returns
   `<Section id="..." color="red|cyan|lime|mag|yel" title={...}>...</Section>`
   and add it inside `<td className="main">`.

New pages (blog, etc.) can be added with `react-router` or as separate HTML
entries in Vite when you get there.

## Deploying

`dist/` is plain static files. Any static host works (Cloudflare Pages,
Netlify, Vercel, GitHub Pages). Build command: `npm run build`, publish
directory: `dist`. `base: './'` is set, so it also works under a subpath.

Note: it is a client-rendered app, so the HTML served has only the English
`<title>`/description from `index.html`; the language is applied by JS.
Fine for a personal site; if SEO of future blog posts matters, pre-render
(Astro, or `vite-plugin-ssr`/similar) can be added later.

## Ideas for later (not built)

- **Blog**: posts as Markdown/MDX in `src/posts/`.
- **Projects**: add an object to `projects.items` in `content.json`. Optional
  `sticker` (filename in `src/assets/`) puts an image on the card's top-right corner,
  like a sticker (see `.sticker` in `styles.css`).
- **Spotify (now playing / top tracks)**: the Spotify API needs OAuth and a
  secret, so it can't be called from the page directly. Needs a tiny
  serverless function (Cloudflare Workers, Netlify/Vercel Functions) that
  returns JSON; a React component fetches it.
- **Kindle**: as far as I know there is no official public API. Realistic
  options: export `My Clippings.txt` (highlights) and load it as data, or use
  a service that has an API (Readwise, Hardcover).
