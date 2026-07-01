import type { IncomingMessage, ServerResponse } from 'http';
import app from '../src/apiServer';

// When Vercel rewrites /api/* → /api, restore the original path for Express routing.
function handler(req: IncomingMessage, res: ServerResponse) {
  const originalUrl = req.headers['x-vercel-original-url'] ?? req.headers['x-original-url'];
  if (typeof originalUrl === 'string') {
    (req as IncomingMessage & { url?: string }).url = originalUrl;
  }
  return app(req, res);
}

export default handler;
