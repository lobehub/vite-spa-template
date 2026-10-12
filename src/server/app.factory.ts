import { createLogger } from '@tsuki-hono/common';
import { createApplication } from '@tsuki-hono/core';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { AppModule } from './app.module';
import { appRouter } from './routers';
import { registerStatic } from './static';

export async function createApp(staticRoot?: string) {
  const app = await createApplication(AppModule, {
    globalPrefix: '/api',
    logger: createLogger('Server', { minLevel: 'warn' }),
  });
  const hono = app.getInstance();

  hono.get('/api/health', (c) => c.json({ status: 'ok' }));
  hono.on(['GET', 'POST'], '/api/trpc/*', (c) =>
    fetchRequestHandler({
      endpoint: '/api/trpc',
      req: c.req.raw,
      router: appRouter,
      createContext: () => ({}),
    }),
  );
  hono.all('/api', (c) => c.json({ error: 'Not Found' }, 404));
  hono.all('/api/*', (c) => c.json({ error: 'Not Found' }, 404));

  if (staticRoot) registerStatic(hono, staticRoot);
  return app;
}
