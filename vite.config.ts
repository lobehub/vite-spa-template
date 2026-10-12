import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  server: {
    port: 3020,
    strictPort: true,
    proxy: { '/api': 'http://localhost:3021' },
  },
});
