import { injectable } from 'tsyringe';
import { z } from 'zod';
import type { PublicConfig } from '@/shared/config';

@injectable()
export class ConfigService {
  getPublicConfig(): PublicConfig {
    const appName = z
      .string()
      .trim()
      .min(1)
      .parse(process.env.APP_NAME ?? 'LobeHub Starter');
    return { appName };
  }
}
