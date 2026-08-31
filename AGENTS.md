# Base44 Dev Environment

## What this app is
A static PWA ("Космическая Станция — Звуки Космоса") — vanilla HTML/CSS/JS, no
build step, no backend, no external credentials. All logic lives in
`js/app.js` + `js/data.js`; styling in `css/style.css`.

## Directory layout (important)
The app is scoped to the base path `/cosmic-sounds-pwa/` (see `manifest.json`
`start_url`/`scope` and the absolute precache URLs in `service-worker.js`).
Static assets MUST live in subdirectories, not the repo root:

- `css/style.css`
- `js/app.js`, `js/data.js`
- `images/*.jpg`
- `icons/*.svg` (+ two pre-existing `.png`)
- `index.html`, `manifest.json`, `service-worker.js` stay at the repo root

The repo was imported with these files flattened to the root; they were
reorganized into the subdirectories above so the existing relative/absolute
references resolve. Do not move them back to the root.

## Running it
`docker compose -f docker-compose.base44.yml up -d` — an `nginx:alpine` container
bind-mounts the repo at `/app` and serves it on host port 3000 via
`nginx.conf`. The bare path `/` redirects to `/cosmic-sounds-pwa/` so the
preview iframe (which loads `/`) shows the app.

## Verifying
- `curl -sf http://localhost:3000/cosmic-sounds-pwa/` returns the HTML.
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/`
  must also return content (nginx serves any host).
- `curl -sf http://localhost:3000/cosmic-sounds-pwa/css/style.css` returns CSS.
- `curl -sf http://localhost:3000/cosmic-sounds-pwa/js/app.js` returns JS.

No migrations, seeds, or secrets are required.
