# LobeHub Vite SPA Template

A full-stack starting point for LobeHub applications: a **React 19 + Vite SPA** and a **Tsuki server on Hono**, in a pnpm monorepo. No Next.js or SSR.

The browser uses React Router data mode with explicit lazy routes, LobeHub UI providers, and a typed tRPC client. The same server application runs as a Node process, in Docker, or as one Vercel Function.

## Start a project

Click **Use this template** on GitHub, or run:

```sh
gh repo create my-app --template lobehub/vite-spa-template --private --clone
cd my-app
pnpm install
pnpm dev
```

Requires **Node.js 22.13+** and **pnpm 12.8.1**. Bun can run the package scripts (`bun run dev`), while pnpm owns dependency installation and the lockfile.

Open <http://localhost:3020>. Vite proxies `/api` to the API server on port 3021. No environment variables or external services are required for the example.

## Request flow

```text
┌──────────────────────────────┐
│ Browser: React Router SPA    │
│ LobeHub UI + tRPC client     │
└──────────────┬───────────────┘
               │ same-origin /api
               ▼
┌──────────────────────────────┐
│ Tsuki / Hono                 │
│ Controllers + tRPC router    │
└──────────────┬───────────────┘
               │
               ▼
       ◆ Deployment target ◆
           /          \
          ▼            ▼
┌────────────────┐  ┌─────────────────────┐
│ Node / Docker  │  │ Vercel              │
│ API + dist/    │  │ Static + api.func   │
└────────────────┘  └─────────────────────┘
```

`apps/web/src/main.tsx` fetches and validates `/api/config` before rendering. A failed boot shows a retry action. Only explicit public configuration fields reach the browser; environment variables are never returned wholesale.

## Workspace

- `apps/web`: Vite SPA, React Router, and UI dependencies.
- `apps/server`: Tsuki/Hono server, tRPC, and server tests.
- `packages/shared`: browser-safe configuration schema, consumed through workspace exports.

Each app owns its package manifest, TypeScript config, and Vite config. The root coordinates scripts with pnpm; no additional task runner is required. The web app imports the server's `AppRouter` through `@lobehub/template-server/trpc`, which only exports types. Server runtime code cannot be imported through that entry.

Run either app on its own:

```sh
pnpm --filter @lobehub/template-web dev
pnpm --filter @lobehub/template-server dev
```

## Project map

| Path                                      | Responsibility                                          |
| ----------------------------------------- | ------------------------------------------------------- |
| `apps/web/src/main.tsx`                   | Runtime config and browser bootstrap                    |
| `apps/web/src/router.tsx`                 | Explicit lazy route table and route error boundary      |
| `apps/web/src/routes/`                    | Page components and shared layout                       |
| `apps/web/src/layouts/GlobalProvider.tsx` | UI, theme, React Query, and tRPC providers              |
| `apps/web/src/libs/trpc.ts`               | Client transport; server router imported as a type only |
| `packages/shared/src/config.ts`           | Browser-safe config schema                              |
| `apps/server/src/app.factory.ts`          | Shared Tsuki/Hono application and raw mounts            |
| `apps/server/src/modules/`                | Tsuki modules, controllers, and injectable services     |
| `apps/server/src/routers/`                | Validated tRPC procedures and exported router type      |
| `apps/server/src/main.ts` / `vercel.ts`   | Thin deployment entry points                            |
| `apps/server/vite.config.ts`              | SWC legacy decorators and dependency metadata           |
| `scripts/buildVercelOutput.mjs`           | Vercel Build Output API v3                              |

Add a page under `apps/web/src/routes/` and register its lazy import in `apps/web/src/router.tsx`. Add a backend module to `AppModule`, or add a typed procedure to `appRouter`. The example controller injects `ConfigService`, so the tests exercise decorator metadata as well as routing.

## Configuration

Copy `apps/server/.env.example` to `apps/server/.env.local` if you want to change the application name. The API loads development env files from `apps/server/` in Vite's priority order: `.env.development.local`, `.env.local`, `.env.development`, `.env`; existing process variables take precedence.

`APP_NAME` is read by the server at runtime and exposed through `ConfigService`. `PORT` controls the Node API port and defaults to 3021. If changing the development API port, also update the Vite proxy target.

Web environment files live in `apps/web/`. Only `VITE_*` values are bundled into browser code. They are public and fixed at build time. Keep secrets in server environment variables and explicitly select safe fields for `/api/config`. Production reads the deployment environment; it does not load local env files.

The template deploys at `/`. Sub-path deployments require aligning the Vite base, router basename, API URLs, and server/deployment routes together.

## Build and run

```sh
pnpm build
pnpm start
# http://localhost:3021 — API and SPA from one Node process
```

The browser build is in `apps/web/dist/`; the server build is in `apps/server/dist/`. API routes return JSON 404s before any SPA fallback. Missing `/assets/*` files stay 404; built assets get immutable caching and HTML is revalidated.

The server bundles all current runtime dependencies. When adding native modules or packages that read runtime files, externalize them deliberately and ship their production dependencies/data in Docker and Vercel output. The smoke check starts the Node bundle outside the project to catch missing dependencies.

### Docker

```sh
docker build -t my-app .
docker run --rm -p 3021:3021 -e APP_NAME="My application" my-app
```

The runtime image runs as the unprivileged `node` user and contains only Node and the two application build directories. `.env` files are excluded from the build context.

### Vercel

Import your generated repository into Vercel and use Node.js 22. The included `vercel.json` selects the custom build, with `framework: null`. `pnpm build:vercel` generates static assets and one Node API function in `.vercel/output` using the [Build Output API](https://vercel.com/docs/build-output-api).

For a prebuilt deployment:

```sh
vercel link
vercel pull --environment=preview
vercel build
vercel deploy --prebuilt
```

The API rewrite keeps the original `/api/...` request path. Static files are resolved before the SPA fallback, and missing assets never receive HTML. Put runtime variables such as `APP_NAME` in the Vercel project environment.

## Checks

```sh
pnpm format:check
pnpm type-check
pnpm test
pnpm build:vercel
pnpm test:e2e
pnpm test:smoke
```

Unit tests cover constructor injection, safe runtime config, HTTP tRPC input validation, API 404s, deep-link and HEAD handling, and asset caching. After `pnpm build`, `pnpm test:e2e` starts the production server outside the repository, checks the healthcheck JSON, and compares the homepage, deep-link fallback, and referenced JavaScript to the real files in `apps/web/dist`. It also checks HEAD, caching, runtime config, and missing API/asset responses. No source application factory or synthetic HTML is used in this E2E test.

`pnpm test:smoke` runs the server E2E and then the generated Vercel handler; it requires `pnpm build:vercel`. GitHub Actions runs these checks, builds the Docker image, and checks its health endpoint.

The sample endpoints are public. Add real session validation and authorization before adding private data or write operations. Authentication, databases, admin business logic, cron jobs, and workflow providers are left for the consuming project.

## License

[MIT](LICENSE) © LobeHub
