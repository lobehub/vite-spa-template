import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { setTimeout } from 'node:timers/promises';

test('production server serves the built web application', { timeout: 20000 }, async (t) => {
  const webDist = new URL('../../web/dist/', import.meta.url);
  const html = readFileSync(new URL('index.html', webDist), 'utf8');
  const assetPath = html.match(/<script\b[^>]*\bsrc="([^"]+)"/)?.[1];
  assert.match(assetPath ?? '', /^\/assets\/.+\.js$/);
  const asset = readFileSync(new URL(assetPath.slice(1), webDist));

  // Keep the bundles away from node_modules and use an unrelated working directory.
  const root = mkdtempSync(join(tmpdir(), 'vite-spa-server-e2e-'));
  let child;
  try {
    cpSync(webDist, join(root, 'apps/web/dist'), { recursive: true });
    cpSync(new URL('../dist/', import.meta.url), join(root, 'apps/server/dist'), {
      recursive: true,
    });

    const listener = createServer().listen(0, '127.0.0.1');
    await once(listener, 'listening');
    const port = listener.address().port;
    await new Promise((resolve) => listener.close(resolve));
    const origin = `http://127.0.0.1:${port}`;

    child = spawn(process.execPath, [join(root, 'apps/server/dist/main.mjs')], {
      cwd: tmpdir(),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(port),
        APP_NAME: 'E2E application',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let logs = '';
    child.stdout.on('data', (chunk) => {
      logs += chunk;
    });
    child.stderr.on('data', (chunk) => {
      logs += chunk;
    });

    const request = (path, options) =>
      fetch(`${origin}${path}`, { ...options, signal: AbortSignal.timeout(1000) });
    const deadline = Date.now() + 10000;
    let ready = false;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) throw new Error(`Server exited before startup: ${logs}`);
      try {
        ready = (await request('/api/health')).ok;
      } catch {}
      if (ready) break;
      await setTimeout(100);
    }
    assert(ready, `Server did not become ready: ${logs}`);

    await t.test('healthcheck returns healthy JSON rather than the SPA', async () => {
      const response = await request('/api/health');
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /application\/json/);
      assert.deepEqual(await response.json(), { status: 'ok' });
    });

    await t.test('home and deep links return the exact dist index.html', async () => {
      for (const path of ['/', '/about']) {
        const response = await request(path);
        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), /text\/html/);
        assert.equal(response.headers.get('cache-control'), 'no-cache');
        assert.equal(await response.text(), html);
      }
      const response = await request('/about', { method: 'HEAD' });
      assert.equal(response.status, 200);
      assert.equal(await response.text(), '');
    });

    await t.test('the script referenced by dist HTML returns the exact built asset', async () => {
      const response = await request(assetPath);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /(?:javascript|ecmascript)/);
      assert.equal(response.headers.get('cache-control'), 'public, max-age=31536000, immutable');
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), asset);
    });

    await t.test('API config reads the production environment', async () => {
      const response = await request('/api/config');
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { appName: 'E2E application' });
    });

    await t.test('unknown APIs and missing assets do not return dist HTML', async () => {
      const api = await request('/api/missing');
      assert.equal(api.status, 404);
      assert.deepEqual(await api.json(), { error: 'Not Found' });
      const missing = await request('/assets/missing.js');
      assert.equal(missing.status, 404);
      assert.equal(missing.headers.get('cache-control'), null);
      assert.notEqual(await missing.text(), html);
    });
  } finally {
    if (child?.exitCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
    rmSync(root, { recursive: true, force: true });
  }
});
