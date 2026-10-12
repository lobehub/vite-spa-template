# Development guide

- The pnpm workspace contains `apps/web`, `apps/server`, and `packages/shared`. Each app owns its dependencies and build config.
- Install dependencies with pnpm; keep `pnpm-lock.yaml` committed. Bun may run package scripts.
- The frontend is a Vite SPA, not an SSR app. Routes live in `apps/web/src/routes/` and are explicitly registered in `apps/web/src/router.tsx`.
- Use `@lobehub/ui/base-ui` components, `createStaticStyles`, and theme CSS variables. Keep `ConfigProvider` outside `ThemeProvider` and pass the motion implementation.
- Put visible Alert operations in `action`; `extra` is a collapsed details section.
- The backend is Tsuki on Hono. Put feature controllers/services in `apps/server/src/modules/`, import modules in `AppModule`, and mount raw Hono handlers in `app.factory.ts`.
- Keep `reflect-metadata` loaded before decorator-bearing modules. Entry points dynamically import bootstrap modules for that reason; the server and test transforms must emit legacy decorator metadata.
- The web client imports `AppRouter` with `import type` from `@lobehub/template-server/trpc`, a type-only package export. Browser-safe runtime contracts live in `@lobehub/template-shared/config`. Never import server runtime code into the browser.
- Put server env files in `apps/server/` and browser env files in `apps/web/`. Select public config fields explicitly. Never return `process.env`, and never put secrets in `VITE_*` variables.
- The sample API is public. New private endpoints require actual session validation and authorization, not only a cookie-presence check.
- Both deployment entries must use the same application factory. Preserve JSON API 404s and missing-asset 404s ahead of the SPA fallback.
- All runtime dependencies are currently bundled. If adding runtime-file or native dependencies, update both Docker and Vercel packaging and the smoke check.
- After changes run `pnpm type-check`, `pnpm test`, `pnpm build:vercel`, and `pnpm test:smoke`. For UI changes also check the browser, including failure states and a mobile viewport.
- `pnpm test:e2e` requires both app builds. It runs the production server in a subprocess outside the repository and compares responses to real web build files; keep it independent of source imports and synthetic HTML fixtures.
- Preserve user-owned working-tree and staged changes. Do not use destructive restore/reset commands.
