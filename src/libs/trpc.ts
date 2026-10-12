import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers';

export const trpc = createTRPCReact<AppRouter>();
export const createTRPCClient = () =>
  trpc.createClient({ links: [httpBatchLink({ url: '/api/trpc' })] });
