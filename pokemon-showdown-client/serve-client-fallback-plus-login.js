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

// ─── RUTA AL DIST DEL SERVIDOR SHOWDOWN ───────────────────────────────────────
const SHOWDOWN_DIST = path.join(__dirname, '..', 'pokemon-showdown', 'dist', 'data');
// ──────────────────────────────────────────────────────────────────────────────

// ─── SPRITES CUSTOM ───────────────────────────────────────────────────────────
// Pon aquí tus sprites custom. Estructura: sprites-custom/gen5/snampery.png etc.
// Esta carpeta tiene prioridad sobre play.pokemonshowdown.com para /sprites/...
const CUSTOM_SPRITES_ROOT = path.join(__dirname, 'sprites-custom');
// ──────────────────────────────────────────────────────────────────────────────

// ─── DATA OVERRIDE: servir data/*.js desde dist/ del servidor ─────────────────
// Los archivos dist/*.js usan module.exports (Node.js) pero el navegador necesita
// variables globales (window.BattlePokedex, etc.).
// Este servidor hace la conversión al vuelo: lee el módulo con require() y lo
// serializa como asignación a la variable global que espera el cliente.
const SERVER_DATA_OVERRIDE = {
  '/data/pokedex.js':   { file: path.join(SHOWDOWN_DIST, 'pokedex.js'),   varName: 'BattlePokedex',   key: 'Pokedex'   },
  '/data/moves.js':     { file: path.join(SHOWDOWN_DIST, 'moves.js'),     varName: 'BattleMovedex',   key: 'Moves'     },
  '/data/abilities.js': { file: path.join(SHOWDOWN_DIST, 'abilities.js'), varName: 'BattleAbilities', key: 'Abilities' },
  '/data/items.js':     { file: path.join(SHOWDOWN_DIST, 'items.js'),     varName: 'BattleItems',     key: 'Items'     },
  '/data/typechart.js': { file: path.join(SHOWDOWN_DIST, 'typechart.js'), varName: 'BattleTypeChart', key: 'TypeChart' },
};

// Sirve un archivo data/*.js del servidor convirtiéndolo a variable global del navegador.
// dist/data/pokedex.js exporta { Pokedex: {...} } → el cliente espera window.BattlePokedex = {...}
function serveDataFile(req, res, pathname, override) {
  try {
    delete require.cache[require.resolve(override.file)];
    const mod = require(override.file);
    const data = mod[override.key] || mod.exports?.[override.key] || mod;

    // Generar JS que asigna la variable global que espera el cliente
    const js = `window.${override.varName} = ${JSON.stringify(data)};`;

    console.log('[SERVER DATA]', pathname, '->', override.varName, `(${Object.keys(data).length} entradas)`);

    res.writeHead(200, {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-PS-Source': 'server-dist',
    });
    res.end(js);
  } catch (e) {
    console.error('[SERVER DATA] Error sirviendo', pathname, ':', e.message);
    console.warn('[SERVER DATA] Fallback al archivo del cliente para', pathname);
    // Si falla, dejar que lo sirva el cliente estático normal
    tryServeFromRoots(req, res, pathname);
  }
}
// ──────────────────────────────────────────────────────────────────────────────

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

// Descarga un sprite desde una URL HTTP/HTTPS, lo guarda en destPath y lo sirve.
function fetchSaveAndServe(res, url, destPath, label) {
  const isHttps = url.startsWith('https');
  const lib = isHttps ? https : http;

  lib.get(url, (remoteRes) => {
    if (remoteRes.statusCode !== 200) {
      remoteRes.resume();
      // Señal de fallo para que el llamador intente el siguiente nivel
      res.emit('sprite-not-found');
      return;
    }

    // Asegurar que existe la carpeta destino
    fs.mkdirSync(path.dirname(destPath), {recursive: true});

    const ext = path.extname(destPath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    console.log('[' + label + ']', url, '-> guardado en', destPath);

    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-cache',
      'X-PS-Source': label.toLowerCase(),
    });

    // Guardar en disco y servir al mismo tiempo
    const fileStream = fs.createWriteStream(destPath);
    remoteRes.pipe(fileStream);
    remoteRes.pipe(res);

    fileStream.on('error', () => {}); // silenciar errores de escritura
  }).on('error', () => {
    res.emit('sprite-not-found');
  });
}

// Fallback de 3 niveles para sprites:
// 1) sprites-custom/ local
// 2) tu servidor (37.15.97.46:8001) → si lo encuentra, lo guarda en sprites-custom/
// 3) play.pokemonshowdown.com (oficial, no se guarda)
function handleSprite(req, res, pathname) {
  // Ruta local donde se guardaría/buscaría el sprite custom
  const relativePath = pathname.replace(/^\/sprites\//, '/');
  const localPath = safeJoin(CUSTOM_SPRITES_ROOT, relativePath);

  // 1) ¿Existe ya en local?
  if (localPath) {
    try {
      const st = fs.statSync(localPath);
      if (st.isFile()) {
        console.log('[SPRITE LOCAL]', pathname, '->', localPath);
        serveFile(req, res, localPath, pathname);
        return;
      }
    } catch {}
  }

  // 2) Intentar desde tu servidor custom
  const customServerUrl = `http://37.15.97.46:8001${relativePath}`;

  // Usamos un EventEmitter para encadenar los niveles
  res.once('sprite-not-found', () => {
    // 3) Fallback final a play.pokemonshowdown.com (sin guardar)
    console.log('[SPRITE OFICIAL]', pathname, '-> play.pokemonshowdown.com');
    proxyToFallback(req, res, new URL('http://localhost' + pathname));
  });

  if (localPath) {
    fetchSaveAndServe(res, customServerUrl, localPath, 'SPRITE CUSTOM SERVER');
  } else {
    res.emit('sprite-not-found');
  }
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

// ─── ENDPOINT /api/pokedex ─────────────────────────────────────────────────────
function serveApiPokedex(req, res) {
  const pokedexPath = path.join(SHOWDOWN_DIST, 'pokedex.js');

  try {
    delete require.cache[require.resolve(pokedexPath)];
    const mod = require(pokedexPath);
    const pokedex = mod.Pokedex || mod.exports?.Pokedex || mod;

    const json = JSON.stringify(pokedex);
    console.log('[API]', '/api/pokedex', '-> OK,', Object.keys(pokedex).length, 'entradas');

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(json);
  } catch (e) {
    console.error('[API] /api/pokedex ERROR:', e.message);
    res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('500 Error leyendo pokedex del servidor: ' + e.message);
  }
}

// ─── ENDPOINT /api/moves ──────────────────────────────────────────────────────
function serveApiMoves(req, res) {
  const movesPath = path.join(SHOWDOWN_DIST, 'moves.js');

  try {
    delete require.cache[require.resolve(movesPath)];
    const mod = require(movesPath);
    const moves = mod.Moves || mod.exports?.Moves || mod;

    const json = JSON.stringify(moves);
    console.log('[API]', '/api/moves', '-> OK,', Object.keys(moves).length, 'entradas');

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(json);
  } catch (e) {
    console.error('[API] /api/moves ERROR:', e.message);
    res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('500 Error leyendo moves del servidor: ' + e.message);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  let pathname = urlObj.pathname;

  if (pathname === '/') pathname = '/index.html';

  // ── API endpoints ─────────────────────────────────────────────────────────
  if (pathname === '/api/pokedex') return serveApiPokedex(req, res);
  if (pathname === '/api/moves')   return serveApiMoves(req, res);
  // ─────────────────────────────────────────────────────────────────────────

  // ── DATA OVERRIDE: servir data/*.js desde dist/ del servidor ─────────────
  // Convierte módulos Node.js a variables globales que espera el navegador
  if (SERVER_DATA_OVERRIDE[pathname]) {
    return serveDataFile(req, res, pathname, SERVER_DATA_OVERRIDE[pathname]);
  }
  // ─────────────────────────────────────────────────────────────────────────

  // 1) intenta servir local
  const servedPath = tryServeFromRoots(req, res, pathname);
  if (servedPath) return;

  // 2) sprites: busca en sprites-custom/ antes de hacer fallback a play
  if (pathname.startsWith('/sprites/')) {
    return handleSprite(req, res, pathname);
  }

  // 3) fallback solo para rutas permitidas
  if (shouldProxy(pathname)) {
    return proxyToFallback(req, res, urlObj);
  }

  // 404
  console.log('[404]', req.method, pathname);
  res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end('404 Not Found');
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Client+fallback: http://localhost:${PORT}/testclient.html?~~localhost:8000`);
  console.log(`Acceso externo:  http://37.15.97.46:${PORT}/testclient.html?~~37.15.97.46:8000`);
  console.log(`API Pokédex:     http://localhost:${PORT}/api/pokedex`);
  console.log(`API Moves:       http://localhost:${PORT}/api/moves`);
});