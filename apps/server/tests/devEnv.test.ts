import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { loadDevEnv } from '@/bootstrap/devEnv';

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'vite-spa-env-'));
});
afterEach(() => {
  vi.unstubAllEnvs();
  rmSync(root, { recursive: true, force: true });
});

it('honors development file priority while preserving injected deployment values', () => {
  vi.stubEnv('NODE_ENV', 'development');
  vi.stubEnv('TEMPLATE_TEST_NAME', undefined);
  vi.stubEnv('TEMPLATE_TEST_PORT', 'injected');
  writeFileSync(
    join(root, '.env.development.local'),
    'TEMPLATE_TEST_NAME=local\nTEMPLATE_TEST_PORT=file',
  );
  writeFileSync(join(root, '.env'), 'TEMPLATE_TEST_NAME=base');
  loadDevEnv(root);
  expect(process.env.TEMPLATE_TEST_NAME).toBe('local');
  expect(process.env.TEMPLATE_TEST_PORT).toBe('injected');
});

it('does not load local files in production', () => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('TEMPLATE_TEST_NAME', undefined);
  writeFileSync(join(root, '.env.local'), 'TEMPLATE_TEST_NAME=local');
  loadDevEnv(root);
  expect(process.env.TEMPLATE_TEST_NAME).toBeUndefined();
});
