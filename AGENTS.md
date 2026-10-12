# Development guide

- Install dependencies with pnpm; keep `pnpm-lock.yaml` committed. Bun may run package scripts.
- The frontend is a Vite SPA, not an SSR app. Routes live in `src/routes/` and are explicitly registered in `src/router.tsx`.
- Use `@lobehub/ui/base-ui` components, `createStaticStyles`, and theme CSS variables. Keep `ConfigProvider` outside `ThemeProvider` and pass the motion implementation.
- Put visible Alert operations in `action`; `extra` is a collapsed details section.
- The backend is Tsuki on Hono. Put feature controllers/services in `src/server/modules/`, import modules in `AppModule`, and mount raw Hono handlers in `app.factory.ts`.
- Keep `reflect-metadata` loaded before decorator-bearing modules. Entry points dynamically import bootstrap modules for that reason; the server and test transforms must emit legacy decorator metadata.
- The tRPC router type is imported by the client with `import type`. Never import server runtime code into the browser.
- Select public config fields explicitly. Never return `process.env`, and never put secrets in `VITE_*` variables.
- The sample API is public. New private endpoints require actual session validation and authorization, not only a cookie-presence check.
- Both deployment entries must use the same application factory. Preserve JSON API 404s and missing-asset 404s ahead of the SPA fallback.
- All runtime dependencies are currently bundled. If adding runtime-file or native dependencies, update both Docker and Vercel packaging and the smoke check.
- After changes run `pnpm type-check`, `pnpm test`, `pnpm build:vercel`, and `pnpm test:smoke`. For UI changes also check the browser, including failure states and a mobile viewport.
- Preserve user-owned working-tree and staged changes. Do not use destructive restore/reset commands.
