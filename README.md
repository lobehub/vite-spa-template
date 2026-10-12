# LobeHub Vite SPA Template

A full-stack starting point for LobeHub applications: a **React 19 + Vite SPA** and a **Tsuki server on Hono**, in one repository. No Next.js or SSR.

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

`src/main.tsx` fetches and validates `/api/config` before rendering. A failed boot shows a retry action. Only explicit public configuration fields reach the browser; environment variables are never returned wholesale.

## Project map

| Path                               | Responsibility                                          |
| ---------------------------------- | ------------------------------------------------------- |
| `src/main.tsx`                     | Runtime config and browser bootstrap                    |
| `src/router.tsx`                   | Explicit lazy route table and route error boundary      |
| `src/routes/`                      | Page components and shared layout                       |
| `src/layouts/GlobalProvider.tsx`   | UI, theme, React Query, and tRPC providers              |
| `src/libs/trpc.ts`                 | Client transport; server router imported as a type only |
| `src/shared/config.ts`             | Browser-safe config schema                              |
| `src/server/app.factory.ts`        | Shared Tsuki/Hono application and raw mounts            |
| `src/server/modules/`              | Tsuki modules, controllers, and injectable services     |
| `src/server/routers/`              | Validated tRPC procedures and exported router type      |
| `src/server/main.ts` / `vercel.ts` | Thin deployment entry points                            |
| `vite.server.config.ts`            | SWC legacy decorators and dependency metadata           |
| `scripts/buildVercelOutput.mjs`    | Vercel Build Output API v3                              |

Add a page under `src/routes/` and register its lazy import in `src/router.tsx`. Add a backend module to `AppModule`, or add a typed procedure to `appRouter`. The example controller injects `ConfigService`, so the tests exercise decorator metadata as well as routing.

## Configuration

Copy `.env.example` to `.env.local` if you want to change the application name. The API loads development env files in Vite's priority order: `.env.development.local`, `.env.local`, `.env.development`, `.env`; existing process variables take precedence.

`APP_NAME` is read by the server at runtime and exposed through `ConfigService`. `PORT` controls the Node API port and defaults to 3021. If changing the development API port, also update the Vite proxy target.

Only `VITE_*` values are bundled into browser code. They are public and fixed at build time. Keep secrets in server environment variables and explicitly select safe fields for `/api/config`. Production reads the deployment environment; it does not load local env files.

The template deploys at `/`. Sub-path deployments require aligning the Vite base, router basename, API URLs, and server/deployment routes together.

## Build and run

```sh
pnpm build
pnpm start
# http://localhost:3021 — API and SPA from one Node process
```

The browser build is in `dist/`; the server build is in `dist-server/`. API routes return JSON 404s before any SPA fallback. Missing `/assets/*` files stay 404; built assets get immutable caching and HTML is revalidated.

The server bundles all current runtime dependencies. When adding native modules or packages that read runtime files, externalize them deliberately and ship their production dependencies/data in Docker and Vercel output. The smoke check starts the Node bundle outside the project to catch missing dependencies.

### Docker

```sh
docker build -t my-app .
docker run --rm -p 3021:3021 -e APP_NAME="My application" my-app
```

The runtime image runs as the unprivileged `node` user and contains only Node and the two build directories. `.env` files are excluded from the build context.

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
pnpm test:smoke
```

Tests cover constructor injection, safe runtime config, HTTP tRPC input validation, API 404s, deep-link and HEAD handling, and asset caching. The smoke check runs the production Node bundle and generated Vercel handler. GitHub Actions runs these checks and builds the Docker image.

The sample endpoints are public. Add real session validation and authorization before adding private data or write operations. Authentication, databases, admin business logic, cron jobs, and workflow providers are left for the consuming project.

## License

[MIT](LICENSE) © LobeHub
