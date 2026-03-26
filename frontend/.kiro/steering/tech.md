# Frontend Technical Steering

## Package Management

- Always use `yarn` (not `npx`) to run scripts and commands.
- Use Turborepo (`yarn turbo <task> --filter=<package>`) to run build/test/lint tasks.
- When fixing lint errors: run `yarn turbo lint:fix` first to auto-fix, then `yarn turbo lint` to verify.

## Rails Configuration Injection

Runtime configuration (API keys, feature flags, RUM provider settings) is injected by Rails into HTML meta tags, **not** hardcoded in Vite's `index.html`.

### Pattern
- Rails renders `<meta name="app-config">` in `dashboard/app/views/app/index.html.haml`
- Values come from the `CDO` object, populated from `config/*.yml.erb`
- The Vite dev `frontend/apps/studio/index.html` does NOT include config meta tags
- Frontend code reads config from the meta tag via `SiteConfig.readRuntimeConfig()` in `@code-dot-org/core`
- When the meta tag is absent (local dev), `SiteConfig` uses safe defaults (e.g., `rumProvider: 'none'`)

### Do NOT
- Add hardcoded secret values or provider credentials to `frontend/apps/studio/index.html`
- Use `import.meta.env` for runtime secrets (those belong in Rails config, not Vite build-time env)

## Observability / RUM

- Provider: selected at runtime via `CDO.rum_provider` → `<meta name="app-config">` → `SiteConfig.observability.rumProvider`
- Factory: `createRumClient(rumProvider)` from `@code-dot-org/observability`
- Defaults to `NoOpAdapter` when no provider is configured (safe for local dev and test)
- Adapters must guard with `isBrowser()` and catch all SDK errors silently

## Test Tooling

- `frontend/packages/*` use Vitest
- `apps/` uses Jest (run via `yarn test:unit` from `apps/`)
- Property-based tests use `fast-check` with `numRuns: 100` minimum
