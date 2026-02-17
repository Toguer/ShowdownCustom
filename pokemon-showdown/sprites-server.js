// sprites-server.js
// Servidor HTTP estático que sirve los sprites custom desde tu PC.
// Arrancar con: node sprites-server.js
// Escucha en el puerto 8001 (accesible en 37.15.98.131:8001)

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8001;

// Carpeta donde están tus sprites custom.
// Estructura esperada: sprites/gen5/snampery.png, sprites/ani/snampery.gif, etc.
const SPRITES_ROOT = path.join(__dirname, 'sprites');

const MIME = {
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath);
  const normalized = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) return null;
  return full;
}

http.createServer((req, res) => {
  // CORS para que el cliente local pueda hacer fetch
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const pathname = new URL(req.url, `http://localhost`).pathname;
  const filePath = safeJoin(SPRITES_ROOT, pathname);

  if (!filePath) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  try {
    const st = fs.statSync(filePath);
    if (!st.isFile()) throw new Error('not a file');

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    console.log('[SPRITE]', pathname, '->', filePath);
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  } catch {
    console.log('[404]', pathname);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
}).listen(PORT, () => {
  console.log(`Sprites server: http://localhost:${PORT}`);
  console.log(`Sirviendo sprites desde: ${SPRITES_ROOT}`);
  console.log(`Asegúrate de que el puerto ${PORT} está abierto en tu router/firewall.`);
});
