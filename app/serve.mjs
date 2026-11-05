// Zero-dependency static server for the built app: `node serve.mjs` (no npm install needed).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain' };

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('dist/ not found. Run "npm run build" first (or use the prebuilt dist/ from the submission).');
  process.exit(1);
}
const server = http.createServer((req, res) => {
  try {
    let urlPath;
    try { urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]); }
    catch { res.writeHead(400); return res.end('Bad request'); }
    if (urlPath.includes('\0')) { res.writeHead(400); return res.end('Bad request'); }
    if (urlPath.startsWith('/_vercel/')) { res.writeHead(204); return res.end(); }
    let file = path.normalize(path.join(root, urlPath));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      // A missing real file (has an extension) is a 404; any other path is an app route -> SPA fallback.
      if (path.extname(urlPath)) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not found'); }
      file = path.join(root, 'index.html');
    }
    const stream = fs.createReadStream(file);
    stream.on('error', () => { if (!res.headersSent) res.writeHead(500); res.end(); });
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob: https://images.unsplash.com; connect-src 'self' https://generativelanguage.googleapis.com https://vitals.vercel-insights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    });
    stream.pipe(res);
  } catch {
    if (!res.headersSent) res.writeHead(500);
    res.end('Server error');
  }
});
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`Port ${port} is already in use. Run with another port, e.g. PORT=4180 node serve.mjs`);
  else console.error(e.message);
  process.exit(1);
});
server.listen(port, () => console.log(`App running at http://localhost:${port}`));
