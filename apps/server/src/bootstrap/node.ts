import { serve } from '@hono/node-server';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { createApp } from '../app.factory';

export async function startNodeServer() {
  const app = await createApp(
    process.env.NODE_ENV === 'development'
      ? undefined
      : fileURLToPath(new URL('../../web/dist/', import.meta.url)),
  );
  const port = z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .parse(process.env.PORT ?? 3021);
  const server = serve({ fetch: app.getInstance().fetch, port }, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  // vite-node reloads in this process; release the old listener before rebinding.
  import.meta.hot?.on('vite:beforeFullReload', async () => {
    if ('closeAllConnections' in server) server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await app.close();
  });

  return server;
}
