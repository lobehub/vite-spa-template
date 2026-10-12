import { z } from 'zod/mini';

export const publicConfigSchema = z.object({ appName: z.string().check(z.minLength(1)) });
export type PublicConfig = z.infer<typeof publicConfigSchema>;
