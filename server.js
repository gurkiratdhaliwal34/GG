#!/usr/bin/env node
/*
 * Static file server for the Summit Tire & Wheels site.
 *
 * Deliberately uses nothing but Node's built-in modules — there is no
 * dependency tree to install and no build step. `npm start` and open the URL.
 */

'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method not allowed');
    return;
  }

  // Strip the query string and decode percent-escapes before touching disk.
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${HOST}:${PORT}`).pathname);
  } catch {
    send(res, 400, 'Bad request');
    return;
  }

  if (pathname.endsWith('/')) pathname += 'index.html';

  // Resolve inside ROOT only, so "/../../etc/passwd" can't escape the repo.
  const filePath = path.join(ROOT, path.normalize(pathname));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (err, body) => {
    if (err) {
      send(res, 404, '404 — not found');
      return;
    }
    const type =
      CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : body);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try: PORT=3001 npm start`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  console.log(`Summit Tire site → http://${HOST}:${PORT}`);
});
