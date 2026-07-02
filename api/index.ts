import type { IncomingMessage, ServerResponse } from 'http';
import app from '../src/apiServer';

// Vercel @vercel/node compiles this file natively.
// The Express app is passed the raw Node.js req/res so all HTTP methods work.
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
