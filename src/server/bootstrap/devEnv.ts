import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function loadDevEnv(cwd = process.cwd()) {
  if (process.env.NODE_ENV !== 'development') return;
  for (const file of ['.env.development.local', '.env.local', '.env.development', '.env']) {
    const path = join(cwd, file);
    if (existsSync(path)) process.loadEnvFile(path);
  }
}
