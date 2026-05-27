import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import chokidar from 'chokidar';
import { WebSocketServer } from 'ws';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const RELOAD_PATH = '/__tw_reload';

const RELOAD_CLIENT_SCRIPT = `<script>
(function () {
  var delay = 500;
  function connect() {
    var socket = new WebSocket(
      (location.protocol === 'https:' ? 'wss:' : 'ws:') +
        '//' +
        location.host +
        '${RELOAD_PATH}',
    );
    socket.onmessage = function (event) {
      if (event.data === 'reload') location.reload();
    };
    socket.onclose = function () {
      setTimeout(connect, delay);
      delay = Math.min(delay * 2, 5000);
    };
  }
  connect();
})();
</script>`;

function contentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

function resolveFilePath(root, requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0]);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const resolved = path.resolve(root, relative);

  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return null;
  }

  return resolved;
}

function injectReloadScript(html) {
  const lower = html.toLowerCase();
  const closeBody = lower.lastIndexOf('</body>');

  if (closeBody !== -1) {
    return html.slice(0, closeBody) + RELOAD_CLIENT_SCRIPT + html.slice(closeBody);
  }

  return html + RELOAD_CLIENT_SCRIPT;
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.html' || ext === '.htm') {
    const html = fs.readFileSync(filePath, 'utf8');
    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    res.end(injectReloadScript(html));
    return;
  }

  res.writeHead(200, { 'Content-Type': contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
}

export async function startServer({ root, port = 0 }) {
  const absoluteRoot = path.resolve(root);
  const clients = new Set();
  let reloadTimer = null;

  const httpServer = http.createServer((req, res) => {
    const filePath = resolveFilePath(absoluteRoot, req.url ?? '/');

    if (!filePath) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    let target = filePath;

    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      target = path.join(target, 'index.html');
    }

    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    serveFile(res, target);
  });

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    if (req.url !== RELOAD_PATH) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });

  const broadcastReload = () => {
    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send('reload');
      }
    }
  };

  const scheduleReload = () => {
    if (reloadTimer) {
      clearTimeout(reloadTimer);
    }

    reloadTimer = setTimeout(() => {
      reloadTimer = null;
      broadcastReload();
    }, 50);
  };

  const watcher = chokidar.watch(absoluteRoot, {
    ignored: (watchPath) => path.basename(watchPath).startsWith('.'),
    ignoreInitial: true,
  });

  watcher.on('all', scheduleReload);

  await new Promise((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(port, '127.0.0.1', resolve);
  });

  const address = httpServer.address();

  if (!address || typeof address === 'string') {
    throw new Error('failed to resolve server address');
  }

  const url = `http://127.0.0.1:${address.port}/`;

  const close = async () => {
    if (reloadTimer) {
      clearTimeout(reloadTimer);
      reloadTimer = null;
    }

    await watcher.close();

    await new Promise((resolve) => {
      for (const client of clients) {
        client.close();
      }

      wss.close(resolve);
    });

    await new Promise((resolve, reject) => {
      httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  };

  return { url, close };
}
