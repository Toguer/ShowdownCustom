// serve-client-fallback-plus-login.js
// Sirve el cliente en local y hace fallback a play.pokemonshowdown.com para:
// - /sprites/, /fx/, /audio/ (assets grandes)
// - /data/pokedex-mini*.js (minidex)
// - /config/testclient-key.js (opcional)

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const {URL} = require('url');

const PORT = 8080;

const ROOTS = [
  __dirname,
  path.join(__dirname, 'play.pokemonshowdown.com'),
];

const FALLBACK_ORIGIN = 'https://play.pokemonshowdown.com';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath);
  const normalized = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) return null;
  return full;
}

// Devuelve el filePath servido o null
function tryServeFromRoots(req, res, pathname) {
  for (const root of ROOTS) {
    const filePath = safeJoin(root, pathname);
    if (!filePath) continue;

    try {
      const st = fs.statSync(filePath);
      if (st.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        if (fs.existsSync(indexPath)) {
          serveFile(req, res, indexPath, pathname);
          return indexPath;
        }
      }
      if (st.isFile()) {
        serveFile(req, res, filePath, pathname);
        return filePath;
      }
    } catch {}
  }
  return null;
}

function serveFile(req, res, filePath, requestedPathname) {
  const ext = path.extname(filePath).toLowerCase();

  // LOG: servido local
  console.log('[LOCAL]', req.method, requestedPathname, '->', filePath);

  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache', // dev-friendly
    'X-PS-Source': 'local',      // para verlo en DevTools
  });
  fs.createReadStream(filePath).pipe(res);
}

function shouldProxy(pathname) {
  return (
    pathname.startsWith('/sprites/') ||
    pathname.startsWith('/fx/') ||
    pathname.startsWith('/audio/') ||

    // minidex usados por previews
    pathname === '/data/pokedex-mini.js' ||
    pathname === '/data/pokedex-mini-bw.js' ||

    // opcional
    pathname === '/config/testclient-key.js'
  );
}

function proxyToFallback(req, res, urlObj) {
  const target = new URL(FALLBACK_ORIGIN + urlObj.pathname + (urlObj.search || ''));

  // LOG: fallback
  console.log('[FALLBACK]', req.method, urlObj.pathname, '->', target.toString());

  const headers = {...req.headers};
  headers.host = target.host;
  delete headers['accept-encoding']; // evita líos con gzip/br
  headers['user-agent'] = headers['user-agent'] || 'local-fallback-proxy';

  const proxyReq = https.request(target, {
    method: req.method,
    headers,
  }, (proxyRes) => {
    const outHeaders = {...proxyRes.headers};

    // Si quieres ver de dónde vino
    outHeaders['X-PS-Source'] = 'fallback';
    outHeaders['access-control-allow-origin'] = '*';
    outHeaders['cache-control'] = 'no-cache';

    res.writeHead(proxyRes.statusCode || 502, outHeaders);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    res.writeHead(502, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-PS-Source': 'fallback-error',
    });
    res.end('502 Bad Gateway (fallback fetch failed): ' + e.message);
  });

  req.pipe(proxyReq);
}

http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  let pathname = urlObj.pathname;

  if (pathname === '/') pathname = '/index.html';

  // 1) intenta servir local
  const servedPath = tryServeFromRoots(req, res, pathname);
  if (servedPath) return;

  // 2) fallback solo para rutas permitidas
  if (shouldProxy(pathname)) {
    return proxyToFallback(req, res, urlObj);
  }

  // 3) 404
  console.log('[404]', req.method, pathname);
  res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end('404 Not Found');
}).listen(PORT, () => {
  console.log(`Client+fallback: http://localhost:${PORT}/testclient.html?~~localhost:8000`);
});
