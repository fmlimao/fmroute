/*
 * Dev server mínimo (sem dependências) para testar o demo em modo 'history'.
 *
 * Serve os arquivos do projeto e, para qualquer rota que não seja um arquivo
 * existente, devolve modelo/history.html — o fallback de SPA que o modo
 * history precisa (sem ele, recarregar /page-1 daria 404).
 *
 *   node server.js   (ou: npm run serve)
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;
const FALLBACK = path.join(ROOT, 'modelo', 'history.html');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.map': 'application/json'
};

function send(res, file, status) {
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    res.writeHead(status || 200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.normalize(path.join(ROOT, urlPath));

  // Impede sair da raiz do projeto (path traversal).
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      return send(res, filePath);
    }
    // Rota desconhecida -> fallback de SPA (modo history).
    return send(res, FALLBACK);
  });
});

server.listen(PORT, () => {
  console.log('FM Route 2.0 — demo (history) em http://localhost:' + PORT + '/');
  console.log('Demo hash:                http://localhost:' + PORT + '/modelo/index.html');
});
