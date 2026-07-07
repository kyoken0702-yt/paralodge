const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { renderHomePage } = require('./web/home-page');
const { handleApi } = require('./api-handler');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';

function contentType(filePath) {
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.svg')) return 'image/svg+xml; charset=utf-8';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  return 'application/octet-stream';
}

function serveStatic(req, res) {
  const decoded = decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.normalize(path.join(PUBLIC_DIR, decoded.replace(/^\/+/, '')));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return true;
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return false;
  res.writeHead(200, { 'Content-Type': contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

async function requestHandler(req, res) {
  if (await handleApi(req, res)) return;
  if (req.url.startsWith('/assets/')) {
    if (serveStatic(req, res)) return;
    res.writeHead(404).end('Not found');
    return;
  }
  const pathname = req.url.split('?')[0];
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderHomePage(pathname));
}

const server = http.createServer(requestHandler);

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`paralodge listening on http://${HOST}:${PORT}`);
  });
}

module.exports = requestHandler;
module.exports.server = server;
module.exports.requestHandler = requestHandler;
