# Summit Tire & Wheels Ltd — website

Four-page site for a 24/7 mobile tire service in Penticton, BC.

## Static site, no build step — clean URLs

Hand-written HTML with one shared stylesheet and one shared script. Nothing
compiles, transpiles, or bundles. Pages live under `public/` at clean,
extensionless URLs (`public/about/index.html` → `/about/`) and link to each
other with relative paths, so the site works unmodified from the filesystem,
from `server.js`, or from any static host — including at a GitHub Pages
*project* subpath like `/Summit-tire/`, which is why the links are relative
rather than root-`/`-absolute.

**Production is still 100% static — GitHub Pages serves `public/` directly,
with no server behind it.** `server.js` is a *local dev convenience* only: an
Express app that mirrors what Pages already does for directory requests
(serve `<dir>/index.html`) and additionally 301-redirects the long form
(`/about/index.html`) to the short form (`/about/`) — something only a real
server can do. Pages can't run that redirect; visitors who somehow land on
the long-form URL there just see the same page without the 301, which is why
every internal link and the sitemap already point at the short form only.

`npm install` now pulls in `express` — the one dependency the project has.
`npm run build` is still a deliberate no-op: it prints a line and exits 0, so
a platform that runs a build command doesn't fail on a site with nothing to
build.

## Running it locally

```bash
npm start
```

That runs `server.js` (Express) on <http://127.0.0.1:3000>, serving `public/`
with clean URLs and the canonical redirect. Set `PORT` to use another port.
Requires Node 18 or newer.

You can also open `public/index.html` straight from the filesystem — the
relative links still resolve — but the redirect and the service worker won't
run (service workers require https or localhost), so `npm start` is the more
faithful way to check a change.

## Deploy settings for a static host

| Setting          | Value              |
| ---------------- | ------------------ |
| Build command    | *(empty)*          |
| Publish / output | `public`           |
| Framework preset | None / Other       |

## Deploying

`.github/workflows/deploy.yml` publishes `public/` to GitHub Pages on every
push to `main`.

**Pages has to be switched on once, by hand:**

**Settings → Pages → Build and deployment → Source: GitHub Actions**

Until that's done every run fails at the `configure-pages` step. The two errors
it produces, and what they actually mean:

| Error | Meaning |
| ----- | ------- |
| `Get Pages site failed … Not Found` | Pages has never been enabled on this repo. |
| `Create Pages site failed … Resource not accessible by integration` | The workflow tried to enable Pages itself via `enablement: true`. It can't — creating a Pages site is an admin operation, and `GITHUB_TOKEN` is never granted it. |

Neither is fixable from inside the workflow. The setting is the fix.

## Files

| File                             | What it is                                    |
| -------------------------------- | ---------------------------------------------- |
| `public/index.html`              | Home — hero, why-choose, services teaser, CTA  |
| `public/services/index.html`     | Service detail and how a call-out works        |
| `public/quotes/index.html`       | Tire quote request form                        |
| `public/about/index.html`        | About, service area, and contact               |
| `public/404.html`                | Not-found page — served on any unmatched path  |
| `public/styles.css`              | All styling for every page                     |
| `public/site.js`                 | Mobile nav, scroll reveal, figure count-up     |
| `public/BG1.png`                 | Hero photograph, set on `.hero-bg` in the CSS  |
| `server.js`                      | Express dev server — see note above            |
| `package.json`                   | Scripts, one dependency (`express`)            |
| `public/manifest.webmanifest`    | App metadata — name, icons, shortcuts          |
| `public/sw.js`                   | Service worker; offline cache                  |
| `public/icon-192/512.png`        | App icons; `apple-touch-icon.png` for iOS      |
| `public/sitemap.xml`             | The four pages, for search engines             |
| `public/robots.txt`              | Allows crawling; points at the sitemap         |
| `public/logo-mark.png`           | Masthead mark, 320×208 — what the pages load   |
| `public/logo.svg`                | Master logo artwork; not loaded by the site    |
| `public/Logo1.svg`–`Logo9.svg`   | Tire brand logos in the home page rail         |

Every page's assets and internal links are relative to *its own* location, not
the site root — `public/index.html` loads `styles.css`, but
`public/about/index.html` loads `../styles.css` and links home as `../`. Keep
that pattern if you add a page: one directory deep from `public/` needs `../`
on every shared asset and on every link that isn't to itself.

### Why the masthead uses a PNG

`logo.svg` is a traced bitmap, not drawn vector art: 3,249 separate paths, each
with its own slightly different dark fill, at 956 KB. Displaying that at 42px
meant shipping most of a megabyte on every page to draw a thumbnail.

`logo-mark.png` is the same artwork rasterised at 128px — **13.8 KB, a 98.6%
reduction** — which covers the 42px slot at 3× density. `logo.svg` stays in the
repo untouched as the master for anything needing real resolution (signage,
print, a larger web mark). It has a `viewBox` now, so it scales properly if you
do use it.

To regenerate the PNG after editing the master (run from `public/`, where both
`logo.svg` and `logo-mark.png` live):

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --disable-gpu --default-background-color=00000000 --window-size=128,128 --screenshot=logo-mark.png logo-frame.html
```

where `logo-frame.html` is just an `<img src="logo.svg">` sized to 128×128.

## The quote form

There is no server, so `site.js` composes a `mailto:` from the field values and
hands off to the customer's mail client. The `action` on the tag is only a no-JS
fallback — mailto form *posts* are unreliably supported, which is why the script
does the work.

To move to a real endpoint, set an `action` on the form and delete its
`data-mailto` attribute; the script then leaves it alone.

Known limits of the mailto approach:

- It depends on the customer having a working mail client. On a phone that's
  normal; on a shared desktop it may open nothing.
- Nothing is logged on your side. If they don't press send in their mail app,
  you never hear about it.

## Installable app (PWA)

The site can be installed to a phone home screen and opens without browser
chrome. `manifest.webmanifest` supplies the name, icons and shortcuts; `sw.js`
caches it for offline use.

**The offline case that matters is the phone number.** Someone with a flat on
Highway 97 may have one bar, so the four pages, the stylesheet, the script and
the logos are precached — 165 KB in total. `BG1.png` is deliberately *not*
precached: it's 1.6 MB on its own, and pulling it during install would mean a
slow first load over exactly the weak connection this exists to survive. It gets
cached the first time someone views the home page instead.

Caching strategy:

- **Pages** — network first, cache as fallback. Edits reach people who already
  installed the app, instead of them being stuck on an old copy.
- **Everything else** — cache first, then network. These change rarely and are
  versioned by hand.
- **Other origins** (the Google Fonts stylesheet) are left alone. Those
  responses are opaque, so caching them is guesswork, and the CSS already falls
  back to `system-ui`.

**After changing any precached file, bump `CACHE` in `sw.js`** (e.g. `summit-v2`
→ `summit-v3`). Without that, installed visitors keep serving the old assets.

Two things to know:

- Service workers require https or localhost. Opening the pages straight off the
  filesystem skips registration — that's expected, and `site.js` checks for it
  rather than throwing.
- Manifest `shortcuts` must point at in-scope URLs, so a `tel:` shortcut isn't
  possible. That's why the shortcuts go to the contact section and the quote
  form rather than dialling directly.

## Search engines

`sitemap.xml` lists the four pages; `robots.txt` allows crawling and points at
it. Each page carries a `rel="canonical"` URL.

**All of these hard-code `https://gurkiratdhaliwal34.github.io/Summit-tire/`.**
If the site moves to a custom domain, update the `<loc>` entries, the `Sitemap:`
line, and the canonical link in all four pages.

## The brand ticker

The rail of manufacturer logos on the home page scrolls continuously: `.track`
holds the nine logos twice over and animates `translateX(-50%)` across 34
seconds, so the loop is seamless. To add or remove a brand, edit **both** halves
or the seam will jump.

**It deliberately ignores `prefers-reduced-motion`.** That's an explicit choice
by the site owner, not an oversight — the override carries `!important` to beat
the blanket `animation:none !important` in the reduced-motion block. Hovering
the rail still pauses it, also with `!important`, and that is the only way a
visitor bothered by the movement can stop it. Don't remove the hover rule.

Note that CSS animation can't be observed in headless Chrome/Edge or in
automation browsers — they report `prefers-reduced-motion: reduce` and render
static frames. Check the ticker in a real browser window.

## Known incomplete

- The **30 minute** typical-response figure on the home page is marked with a
  `PLACEHOLDER` comment in `index.html`. Confirm it's a number Summit can hit
  on a bad day, not a best case.
Rail `alt` text was checked against a render of the actual files: `Logo2.svg` is
Michelin, not Blackhawk as the original markup claimed. All nine are correct as
labelled.
