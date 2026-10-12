import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist-server',
    emptyOutDir: true,
    ssr: true,
    target: 'node22',
    rolldownOptions: {
      input: {
        main: resolve('src/server/main.ts'),
        vercel: resolve('src/server/vercel.ts'),
      },
      output: { entryFileNames: '[name].mjs', chunkFileNames: '[name]-[hash].mjs' },
    },
  },
  oxc: false,
  plugins: [
    swc.vite({
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        target: 'esnext',
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
  publicDir: false,
  resolve: { tsconfigPaths: true },
  ssr: { noExternal: true },
});
