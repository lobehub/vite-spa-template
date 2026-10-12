import { Button } from '@lobehub/ui/base-ui';
import { createBrowserRouter, Link } from 'react-router';
import { RootLayout } from '@/routes/_layout';
import type { PublicConfig } from '@/shared/config';

function RouteError() {
  return (
    <main>
      <h1>This page could not be loaded.</h1>
      <Button onClick={() => window.location.reload()}>Reload page</Button>
      <p>
        <Link to="/">Go home</Link>
      </p>
    </main>
  );
}

export function createRouter(config: PublicConfig) {
  return createBrowserRouter([
    {
      element: <RootLayout config={config} />,
      ErrorBoundary: RouteError,
      HydrateFallback: () => <p role="status">Loading page…</p>,
      children: [
        { index: true, lazy: async () => ({ Component: (await import('@/routes/home')).default }) },
        {
          path: 'about',
          lazy: async () => ({ Component: (await import('@/routes/about')).default }),
        },
        {
          path: '*',
          element: (
            <>
              <h1>Page not found</h1>
              <Link to="/">Go home</Link>
            </>
          ),
        },
      ],
    },
  ]);
}
