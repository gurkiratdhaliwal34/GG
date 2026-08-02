#!/usr/bin/env node
/*
 * Dev server for the Summit Tire & Wheels site — Express, serving ./public.
 *
 * Production is still a static GitHub Pages deploy of ./public (see
 * .github/workflows/deploy.yml) — Pages has no server, so it can't run the
 * redirect below. This server exists so the canonical-URL behaviour can be
 * built and tested locally; it mirrors what the static host already does
 * for directory requests (serve <dir>/index.html) and adds the one thing a
 * static host can't: a real 301 from the long form to the short form.
 */

'use strict';

const express = require('express');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');

const app = express();

// Canonical-URL redirect — MUST run before express.static, or static would
// serve /about/index.html directly and this would never fire.
app.use((req, res, next) => {
  if (!req.path.endsWith('/index.html')) return next();

  const shortPath = req.path.slice(0, -'index.html'.length); // keeps the trailing slash
  const queryIndex = req.url.indexOf('?');
  const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);

  res.redirect(301, shortPath + query);
});

// Serves e.g. /about/ from public/about/index.html (express.static default),
// and 301s a directory hit without a trailing slash (/about -> /about/).
//
// setHeaders forces the Content-Type for .ico explicitly: express.static's
// MIME lookup varies by the version of the underlying mime-db, sometimes
// serving image/vnd.microsoft.icon instead of the historically-expected
// image/x-icon. Google's favicon crawler doesn't care which of those two it
// sees, but pinning one removes the ambiguity when checking with curl.
app.use(express.static(PUBLIC_DIR, {
  setHeaders(res, filePath) {
    if (path.extname(filePath).toLowerCase() === '.ico') {
      res.setHeader('Content-Type', 'image/x-icon');
    }
  }
}));

app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Summit Tire site → http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try: PORT=3001 npm start`);
    process.exit(1);
  }
  throw err;
});
