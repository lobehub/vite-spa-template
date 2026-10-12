import { ConfigProvider, ThemeProvider } from '@lobehub/ui';
import { en } from '@lobehub/ui/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion, m } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { createTRPCClient, trpc } from '@/libs/trpc';

const loadMotionFeatures = () => import('@/libs/motion').then((module) => module.default);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(createTRPCClient);

  return (
    <LazyMotion features={loadMotionFeatures}>
      <ConfigProvider locale="en-US" resources={en} motion={m}>
        <ThemeProvider defaultThemeMode="auto">
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </trpc.Provider>
        </ThemeProvider>
      </ConfigProvider>
    </LazyMotion>
  );
}
