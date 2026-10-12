import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout } from 'node:timers/promises';

// Run away from node_modules so accidentally externalized dependencies fail here.
const root = mkdtempSync(join(tmpdir(), 'vite-spa-smoke-'));
cpSync('dist', join(root, 'dist'), { recursive: true });
cpSync('dist-server', join(root, 'dist-server'), { recursive: true });
const port = 33000 + Math.floor(Math.random() * 10000);
const child = spawn(process.execPath, ['dist-server/main.mjs'], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
    APP_NAME: 'Smoke application',
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
let functionServer;
try {
  const origin = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(logs);
    try {
      ready = (await fetch(`${origin}/api/health`)).ok;
    } catch {}
    if (ready) break;
    await setTimeout(100);
  }
  assert(ready, `Node server did not become ready: ${logs}`);
  assert.deepEqual(await (await fetch(`${origin}/api/config`)).json(), {
    appName: 'Smoke application',
  });
  assert.equal((await fetch(`${origin}/about`)).status, 200);
  assert.equal((await fetch(`${origin}/api/missing`)).status, 404);
  assert.equal((await fetch(`${origin}/assets/missing.js`)).status, 404);

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
  console.log('Node bundle and Vercel function smoke checks passed.');
} finally {
  if (child.exitCode === null) {
    child.kill();
    await once(child, 'exit');
  }
  if (functionServer) {
    functionServer.closeAllConnections();
    await new Promise((resolve) => functionServer.close(resolve));
  }
  rmSync(root, { recursive: true, force: true });
}
