# Summit Tire & Wheels Ltd — website

Four-page site for a 24/7 mobile tire service in Penticton, BC.

## Static site, zero dependencies, no build step

Hand-written HTML with one shared stylesheet and one shared script. Nothing
compiles, transpiles, or bundles. Every page links to its siblings by plain
relative filename, so the site works from the filesystem or any static host
without rewrite rules.

There is a `package.json`, but only so that tooling which insists on running
`npm` finds what it expects. **`dependencies` is empty and stays that way** —
`server.js` uses nothing but Node's built-in modules, so `npm install` has
nothing to install and there is no `node_modules` tree.

`npm run build` is a deliberate no-op. It prints a line and exits 0, so a
platform that runs a build command doesn't fail on a site that has nothing to
build.

## Running it locally

Simplest — no Node needed at all. Open `index.html` in a browser:

```bash
start index.html
```

The page makes no network requests apart from the Google Fonts stylesheet, so
it renders correctly straight off the filesystem.

Or serve it over HTTP, which matches how it behaves when deployed:

```bash
npm start
```

That runs `server.js` on <http://127.0.0.1:3000>. Set `PORT` to use another
port. Requires Node 18 or newer.

## Deploy settings for a static host

| Setting          | Value              |
| ---------------- | ------------------ |
| Build command    | *(empty)*          |
| Publish / output | `.` (repo root)    |
| Framework preset | None / Other       |

## Deploying

`.github/workflows/deploy.yml` publishes the repo root to GitHub Pages on every
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

| File                    | What it is                                     |
| ----------------------- | ---------------------------------------------- |
| `index.html`            | Home — hero, why-choose, services teaser, CTA  |
| `services.html`         | Service detail and how a call-out works        |
| `quotes.html`           | Tire quote request form                        |
| `about.html`            | About, service area, and contact               |
| `styles.css`            | All styling for every page                     |
| `site.js`               | Mobile nav, scroll reveal, figure count-up     |
| `BG1.png`               | Hero photograph, set on `.hero-bg` in the CSS  |
| `server.js`             | Static file server, Node built-ins only        |
| `package.json`          | Scripts only; no dependencies                  |
| `logo-mark.png`         | Masthead mark, 128px — what the pages load     |
| `logo.svg`              | Master logo artwork; not loaded by the site    |
| `Logo1.svg`–`Logo9.svg` | Tire brand logos in the home page rail         |

### Why the masthead uses a PNG

`logo.svg` is a traced bitmap, not drawn vector art: 3,249 separate paths, each
with its own slightly different dark fill, at 956 KB. Displaying that at 42px
meant shipping most of a megabyte on every page to draw a thumbnail.

`logo-mark.png` is the same artwork rasterised at 128px — **13.8 KB, a 98.6%
reduction** — which covers the 42px slot at 3× density. `logo.svg` stays in the
repo untouched as the master for anything needing real resolution (signage,
print, a larger web mark). It has a `viewBox` now, so it scales properly if you
do use it.

To regenerate the PNG after editing the master:

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
