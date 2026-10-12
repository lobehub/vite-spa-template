import { serveStatic } from '@hono/node-server/serve-static';
import type { Hono } from 'hono';

export function registerStatic(hono: Hono, root: string) {
  hono.use('*', async (c, next) => {
    await next();
    if (c.res.status !== 200) return;
    if (c.req.path.startsWith('/assets/')) {
      c.header('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (c.res.headers.get('content-type')?.includes('text/html')) {
      c.header('Cache-Control', 'no-cache');
    }
  });
  hono.on(['GET', 'HEAD'], '*', serveStatic({ root }));
  hono.on(['GET', 'HEAD'], '/assets/*', (c) => c.notFound());
  hono.on(['GET', 'HEAD'], '*', serveStatic({ root, path: 'index.html' }));
}
