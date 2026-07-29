# Summit Tire & Wheels Ltd — website

Landing page for a 24/7 mobile tire service in Penticton, BC.

## This is a plain static site. There is no build step.

**No `package.json`, no dependencies, no bundler, no npm.** `index.html` is
hand-written, self-contained HTML and CSS; the images sit beside it in the repo
root. Nothing compiles, transpiles, or gets installed.

If a tool runs `npm install` here it will fail with:

```
npm error enoent Could not read package.json
```

That is the tool wrongly assuming this is a Node project — not a problem with
the site. The fix is to stop it running npm, never to add a `package.json`.
Deploy settings should be:

| Setting          | Value              |
| ---------------- | ------------------ |
| Build command    | *(leave empty)*    |
| Publish / output | `.` (repo root)    |
| Framework preset | None / Other       |

## Running it locally

Open `index.html` in a browser. That's the whole procedure — double-click it,
or:

```bash
start index.html
```

No server is required. The page makes no network requests apart from the
Google Fonts stylesheet, so it renders correctly straight off the filesystem.

## Deploying

`.github/workflows/deploy.yml` publishes the repo root to GitHub Pages on every
push to `main`. It needs Pages switched on once, by hand:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

Until that's set, the workflow will fail at the deploy step.

## Files

| File                  | What it is                                  |
| --------------------- | ------------------------------------------- |
| `index.html`          | The entire site — markup and CSS in one file |
| `BG1.png`             | Hero background photograph                   |
| `logo.svg`            | Summit Tire & Wheels mark, top left          |
| `Logo1.svg`–`Logo9.svg` | Tire manufacturer logos in the bottom rail |

## Known incomplete

- The **Services**, **Tire Quotes**, and **About** nav links point at
  `#services`, `#quote`, and `#about`. Those sections do not exist yet, so the
  links do nothing. The page is deliberately locked to one viewport
  (`body { overflow: hidden }`) until they are written.
- **Book a service** points at `#book`, pending the Square booking URL.
