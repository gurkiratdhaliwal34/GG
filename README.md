# Summit Tire & Wheels Ltd — website

Landing page for a 24/7 mobile tire service in Penticton, BC.

## Static site, zero dependencies, no build step

`index.html` is hand-written, self-contained HTML and CSS; the images sit beside
it in the repo root. Nothing compiles, transpiles, or bundles.

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

| File                  | What it is                                  |
| --------------------- | ------------------------------------------- |
| `index.html`          | The entire site — markup and CSS in one file |
| `server.js`           | Static file server, Node built-ins only      |
| `package.json`        | Scripts only; no dependencies                |
| `BG1.png`             | Hero background photograph                   |
| `logo.svg`            | Summit Tire & Wheels mark, top left          |
| `Logo1.svg`–`Logo9.svg` | Tire manufacturer logos in the bottom rail |

## Known incomplete

- The **Services**, **Tire Quotes**, and **About** nav links point at
  `#services`, `#quote`, and `#about`. Those sections do not exist yet, so the
  links do nothing. The page is deliberately locked to one viewport
  (`body { overflow: hidden }`) until they are written.
- **Book a service** points at `#book`, pending the Square booking URL.
