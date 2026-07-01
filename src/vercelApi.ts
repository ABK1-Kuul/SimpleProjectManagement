import type { IncomingMessage, ServerResponse } from 'http';
import app from './apiServer';

// Vercel serverless functions must export a Node.js HTTP handler.
// Exporting the Express app directly does not work — Vercel won't call it
// for non-GET methods, resulting in 405 Method Not Allowed errors.
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
