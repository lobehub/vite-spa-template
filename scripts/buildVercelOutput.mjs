import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

for (const file of ['dist/index.html', 'dist-server/vercel.mjs']) {
  if (!existsSync(file)) throw new Error(`Missing build artifact: ${file}`);
}

const output = '.vercel/output';
const func = `${output}/functions/api.func`;
rmSync(output, { recursive: true, force: true });
mkdirSync(func, { recursive: true });
cpSync('dist', `${output}/static`, { recursive: true });
// shortcut: all server dependencies are bundled; trace runtime files when adding native or file-backed packages.
cpSync('dist-server', `${func}/dist-server`, { recursive: true });
writeFileSync(
  `${func}/.vc-config.json`,
  JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'dist-server/vercel.mjs',
      launcherType: 'Nodejs',
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);
writeFileSync(
  `${output}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '^/api(?:/.*)?$', dest: '/api' },
        { handle: 'filesystem' },
        { src: '^/assets/.*$', status: 404 },
        { src: '/(.*)', dest: '/index.html' },
        { handle: 'hit' },
        {
          src: '^/assets/.*$',
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
          continue: true,
        },
        { src: '^/index\\.html$', headers: { 'Cache-Control': 'no-cache' }, continue: true },
      ],
    },
    null,
    2,
  ),
);
console.log('Vercel Build Output ready in .vercel/output');
