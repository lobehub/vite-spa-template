import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().trim().min(1).max(80) }))
    .query(({ input }) => ({ message: `Hello, ${input.name}!` })),
});

export type AppRouter = typeof appRouter;
