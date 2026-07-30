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
| `logo.svg`              | Masthead mark on all four pages                |
| `Logo1.svg`–`Logo9.svg` | Tire brand logos in the home page rail         |

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

## Known incomplete

- The **30 minute** typical-response figure on the home page is marked with a
  `PLACEHOLDER` comment in `index.html`. Confirm it's a number Summit can hit
  on a bad day, not a best case.
- **Check the rail logo captions.** The `alt` text on `Logo2.svg` says Michelin,
  carried over from the wordmark it replaced. The original markup called that
  file Blackhawk. Worth opening the file to confirm which brand it actually is.
