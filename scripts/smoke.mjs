import assert from 'node:assert/strict';
import { once } from 'node:events';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Run away from node_modules so accidentally externalized dependencies fail here.
const root = mkdtempSync(join(tmpdir(), 'vite-spa-smoke-'));
let functionServer;
try {
  const func = join(root, 'function');
  cpSync(resolve('.vercel/output/functions/api.func'), func, { recursive: true });
  const config = JSON.parse(readFileSync(join(func, '.vc-config.json'), 'utf8'));
  const handler = (await import(pathToFileURL(join(func, config.handler)).href)).default;
  functionServer = createServer(handler).listen(0, '127.0.0.1');
  await once(functionServer, 'listening');
  const functionOrigin = `http://127.0.0.1:${functionServer.address().port}`;
  assert.equal((await fetch(`${functionOrigin}/api/health`)).status, 200);
  const input = encodeURIComponent(JSON.stringify({ name: 'Vercel' }));
  assert.deepEqual(await (await fetch(`${functionOrigin}/api/trpc/hello?input=${input}`)).json(), {
    result: { data: { message: 'Hello, Vercel!' } },
  });
  assert.equal((await fetch(`${functionOrigin}/api/missing`)).status, 404);
  console.log('Vercel function smoke checks passed.');
} finally {
  if (functionServer) {
    functionServer.closeAllConnections();
    await new Promise((resolve) => functionServer.close(resolve));
  }
  rmSync(root, { recursive: true, force: true });
}
