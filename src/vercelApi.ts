import type { IncomingMessage, ServerResponse } from 'http';

let app: any;
let loadError: unknown;

try {
  app = (await import('./apiServer')).default;
} catch (err) {
  loadError = err;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (loadError || !app) {
    const msg = loadError instanceof Error ? loadError.message : String(loadError);
    const stack = loadError instanceof Error ? loadError.stack : '';
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to load server module', message: msg, stack }));
    return;
  }
  return app(req, res);
}
