import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { GlobalProvider } from '@/layouts/GlobalProvider';
import { createRouter } from '@/router';
import { publicConfigSchema } from '@lobehub/template-shared/config';

const root = createRoot(document.getElementById('root')!);

async function boot() {
  const response = await fetch('/api/config');
  if (!response.ok) throw new Error(`Config request failed: ${response.status}`);
  const config = publicConfigSchema.parse(await response.json());
  document.title = config.appName;
  root.render(
    <GlobalProvider>
      <RouterProvider router={createRouter(config)} />
    </GlobalProvider>,
  );
}

boot().catch((error) => {
  console.error(error);
  root.render(
    <main>
      <h1>The application could not start.</h1>
      <p>Please try again.</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </main>,
  );
});
