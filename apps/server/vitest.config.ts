import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import serverConfig from './vite.config.ts';

export default mergeConfig(
  serverConfig,
  defineConfig({
    test: { environment: 'node', setupFiles: ['tests/setup.ts'], include: ['tests/**/*.test.ts'] },
  }),
);
