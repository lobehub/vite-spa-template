import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { createApp } from '@/server/app.factory';

const root = mkdtempSync(join(tmpdir(), 'vite-spa-static-'));
let app: Awaited<ReturnType<typeof createApp>>;

beforeAll(async () => {
  mkdirSync(join(root, 'assets'));
  writeFileSync(join(root, 'index.html'), '<!doctype html><h1>SPA</h1>');
  writeFileSync(join(root, 'assets', 'app-123.js'), 'console.log("app")');
  app = await createApp(root);
});
afterEach(() => vi.unstubAllEnvs());
afterAll(async () => {
  await app.close();
  rmSync(root, { recursive: true });
});

it('serves runtime config through a controller with injected service without exposing secrets', async () => {
  vi.stubEnv('APP_NAME', 'My application');
  vi.stubEnv('DATABASE_URL', 'private-database-value');
  const response = await app.getInstance().request('/api/config');
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ appName: 'My application' });
});

it('greets through the HTTP tRPC boundary and rejects blank input', async () => {
  const request = (name: string) =>
    app
      .getInstance()
      .request(`/api/trpc/hello?input=${encodeURIComponent(JSON.stringify({ name }))}`);
  const response = await request('  Ada  ');
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ result: { data: { message: 'Hello, Ada!' } } });
  expect((await request('   ')).status).toBe(400);
  expect((await request('a'.repeat(81))).status).toBe(400);
});

it('returns JSON 404s for unknown APIs before the SPA fallback', async () => {
  for (const path of ['/api', '/api/missing']) {
    const response = await app.getInstance().request(path);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Not Found' });
  }
});

it('serves deep links without caching HTML, and handles HEAD', async () => {
  const response = await app.getInstance().request('/about');
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('<h1>SPA</h1>');
  expect(response.headers.get('cache-control')).toBe('no-cache');
  const head = await app.getInstance().request('/about', { method: 'HEAD' });
  expect(head.status).toBe(200);
  expect(await head.text()).toBe('');
});

it('caches built assets, but never falls back or caches a missing asset', async () => {
  const response = await app.getInstance().request('/assets/app-123.js');
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toContain('immutable');
  const missing = await app.getInstance().request('/assets/missing.js');
  expect(missing.status).toBe(404);
  expect(missing.headers.get('cache-control')).toBeNull();
});
