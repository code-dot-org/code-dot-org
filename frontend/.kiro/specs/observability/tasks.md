# Implementation Tasks

## Tasks

- [ ] 1. Extend `SiteConfig` in `@code-dot-org/core` with Rails-injected runtime values
  - [ ] 1.1 Add `RumProvider` union type, `ObservabilityConfig` interface, and `RuntimeConfig` interface to `frontend/packages/core/src/config/SiteConfig.ts`
  - [ ] 1.2 Add `appVersion?: string` and `observability: ObservabilityConfig` as readonly fields on `SiteConfig`
  - [ ] 1.3 Implement `SiteConfig.readRuntimeConfig()` private static method: `querySelector('meta[name="app-config"]')`, `JSON.parse` the content attribute, return `{}` on any error
  - [ ] 1.4 Populate `appVersion` and `observability` in the `SiteConfig` constructor from `readRuntimeConfig()`, defaulting `rumProvider` to `'none'`
  - [ ] 1.5 Export `RumProvider`, `ObservabilityConfig`, and `RuntimeConfig` from `frontend/packages/core/src/config/index.ts`
  - [ ] 1.6 Update `frontend/packages/core/src/config/__tests__/SiteConfig.test.ts`: add tests for absent meta tag (defaults to `rumProvider: 'none'`), valid meta tag JSON populates `observability` fields, invalid JSON falls back to defaults

- [ ] 2. Scaffold the `@code-dot-org/observability` package
  - [ ] 2.1 Create `frontend/packages/observability/package.json` with name `@code-dot-org/observability`, version `0.0.0`, `private: true`, `type: module`, scripts (`build`, `typecheck`, `lint`, `lint:fix`, `prettier`, `prettier:fix`, `test`, `clean`), `exports` for the root entry point, peer dependencies for all provider SDKs (`@datadog/browser-rum`, `@datadog/browser-logs`, `@sentry/browser`), and dev dependencies following the [Frontend Package Conventions spec](../frontend-package-conventions/requirements.md)
  - [ ] 2.2 Create split tsconfig files: `tsconfig.json` (root with `files: []` and references to `tsconfig.app.json` and `tsconfig.node.json`), `tsconfig.app.json` (extends `@code-dot-org/lint-config/typescript/tsconfig.vite.app.json`, `include: ["src"]`), `tsconfig.node.json` (extends `@code-dot-org/lint-config/typescript/tsconfig.vite.node.json`, `include: ["vite.config.ts"]`)
  - [ ] 2.3 Create `vite.config.ts` in library mode with `@vitejs/plugin-react`, `vite-plugin-dts` (using `tsconfig.app.json`), `vite-plugin-externalize-deps`, ESM + CJS outputs via `getRollupOutputConfig`, `resolve.alias` for `@`, `build.sourcemap: true`, `build.cssCodeSplit: true`
  - [ ] 2.4 Create `vitest.config.ts` with `globals: true` and `environment: 'jsdom'`
  - [ ] 2.5 Create `eslint.config.mjs` extending `@code-dot-org/lint-config/eslint/react.mjs` with `dist/*` ignored
  - [ ] 2.6 Create `.lintstagedrc.mjs` re-exporting `@code-dot-org/lint-config/lint-staged/lintstagedrc.mjs`
  - [ ] 2.7 Create `.gitignore` excluding `node_modules`, `dist`, `dist-ssr`, `*.local`, `.DS_Store`, `.vscode/*`, `.idea`
  - [ ] 2.8 Register the package in `frontend/package.json` workspaces (verify covered by `"packages/*"` glob) and confirm `frontend/turbo.json` pipeline covers `build`, `test`, `lint`, `typecheck`
  - [ ] 2.9 Create stub `README.md` (purpose, package name, installation, key exports, usage example) and `CONTRIBUTING.md` (steps to add a new Provider Adapter)

- [ ] 3. Define core types and the `RumClient` interface
  - [ ] 3.1 Create `src/types.ts` exporting `RumProvider` union type, `RumClientConfig` interface, and `RumClient` interface with methods `init`, `recordLog`, `recordMetric`, `incrementCounter`, `shutdown`
  - [ ] 3.2 Create `src/internal/ssrGuard.ts` exporting `isBrowser(): boolean` (`typeof window !== 'undefined'`)

- [ ] 4. Implement the No-Op Adapter
  - [ ] 4.1 Create `src/adapters/noop.ts` with `NoOpAdapter` class implementing all `RumClient` methods as no-ops
  - [ ] 4.2 Write unit tests in `src/adapters/__tests__/noop.test.ts`: all methods callable without throwing, no external calls made
  - [ ] 4.3 Write property-based tests (fast-check) for Properties 1 and 8: factory returns complete `RumClient`, no-op adapter is always safe for any method call sequence

- [ ] 5. Implement the Datadog Adapter
  - [ ] 5.1 Create `src/adapters/datadog.ts` with `DatadogAdapter` class: define `DATADOG_PRIVACY_COMPLIANCE` as a named `const` grouping all privacy-required SDK options (`trackUserInteractions: false`, `trackResources: false`, `trackLongTasks: false`, `defaultPrivacyLevel: 'mask-user-input'`); `init` spreads `DATADOG_PRIVACY_COMPLIANCE` before `config.providerOptions` in the `datadogRum.init` call and also calls `datadogLogs.init`; `recordLog` delegates to `datadogLogs.logger[level]`; `recordMetric` delegates to `datadogRum.addAction`; `incrementCounter` calls `recordMetric` with value 1 and unit `'count'`; `shutdown` calls `datadogRum.stopSession`
  - [ ] 5.2 Implement `AdapterState` (`initialized`, `degraded`) with SSR guard in `init` and try/catch fallback for all methods
  - [ ] 5.3 Write unit tests in `src/adapters/__tests__/datadog.test.ts`: SSR guard (no SDK call when `window` undefined), degraded mode after init failure, all method mappings verified via `vi.mock`
  - [ ] 5.4 Write property-based tests for Properties 3, 4, 5, 6, 7: log/metric forwarding, no PII transmitted, SDK failures do not propagate

- [ ] 6. Implement the New Relic Adapter
  - [ ] 6.1 Create `src/adapters/newrelic.ts` with `NewRelicAdapter` class: define `NEWRELIC_PRIVACY_COMPLIANCE` as a named `const` documenting that compliance is maintained by never calling `setUserId` or setting user-identifying custom attributes; `init` calls `newrelic.setApplicationVersion` and `newrelic.setCustomAttribute('environment', ...)`; `recordLog` delegates to `newrelic.log`; `recordMetric` delegates to `newrelic.recordCustomEvent`; `incrementCounter` calls `recordMetric` with value 1 and unit `'count'`; `shutdown` is a no-op
  - [ ] 6.2 Implement `AdapterState` with SSR guard and try/catch fallback
  - [ ] 6.3 Write unit and property-based tests in `src/adapters/__tests__/newrelic.test.ts` covering Properties 3, 4, 5, 6, 7

- [ ] 7. Implement the Sentry Adapter
  - [ ] 7.1 Create `src/adapters/sentry.ts` with `SentryAdapter` class: define `SENTRY_PRIVACY_COMPLIANCE` as a named `const` with `sendDefaultPii: false`; `init` spreads `SENTRY_PRIVACY_COMPLIANCE` before `config.providerOptions` in the `Sentry.init` call; `recordLog` calls `Sentry.addBreadcrumb`; `recordMetric` calls `Sentry.metrics.distribution`; `incrementCounter` calls `Sentry.metrics.increment`; `shutdown` calls `Sentry.close`
  - [ ] 7.2 Implement `AdapterState` with SSR guard and try/catch fallback
  - [ ] 7.3 Write unit and property-based tests in `src/adapters/__tests__/sentry.test.ts` covering Properties 3, 4, 5, 6, 7

- [ ] 8. Implement the `createRumClient` factory and public API
  - [ ] 8.1 Create `src/index.ts` exporting `RumClient`, `RumClientConfig`, `RumProvider` types and the `createRumClient` factory with exhaustive switch (throws descriptive `Error` for unknown provider)
  - [ ] 8.2 Write unit and property-based tests in `src/__tests__/index.test.ts` for Properties 1 and 2: factory returns correct adapter for each valid provider, throws with message containing the value for any unknown provider string
  - [ ] 8.3 Run `yarn build` in `frontend/packages/observability/` and verify `dist/index.mjs`, `dist/index.cjs`, and `dist/index.d.ts` are produced

- [ ] 9. Update `frontend/apps/studio/index.html` with the Config Meta Tag
  - [ ] 9.1 Add `<meta name="app-config">` to `frontend/apps/studio/index.html` with all `RuntimeConfig` fields present and safe placeholder values: `{ "appVersion": "", "observability": { "rumProvider": "none", "datadogApplicationId": "", "datadogClientToken": "" } }`

- [ ] 10. Integrate with Code Studio bootstrap
  - [ ] 10.1 Add `@code-dot-org/observability` as a dependency in `frontend/apps/studio/package.json`
  - [ ] 10.2 Update `frontend/apps/studio/src/entrypoints/application.tsx` to import `CodeStudioConfig` from `@code-dot-org/core`, call `createRumClient(CodeStudioConfig.observability.rumProvider, ...)` using `CodeStudioConfig.observability.datadogApplicationId`, `CodeStudioConfig.observability.datadogClientToken`, `CodeStudioConfig.environment`, and `CodeStudioConfig.appVersion`, then wire the result into `metricsReporter.setRumClient(rumClient)`
  - [ ] 10.3 Verify standalone dev mode works (`yarn dev` from `frontend/apps/studio/`) with `rumProvider: 'none'` in the meta tag — no SDK errors in console

- [ ] 11. Integrate with `MetricsReporter` in `apps/`
  - [ ] 11.1 Add `setRumClient(client: RumClient): void` method to `apps/src/metrics/MetricsReporter.ts`
  - [ ] 11.2 Update `logInfo`, `logWarning`, `logError`, and `publishMetric` to delegate to `rumClient` when set, leaving the existing server-side path unchanged
  - [ ] 11.3 Remove direct `datadogRum` / `datadogLogs` imports from `MetricsReporter`
  - [ ] 11.4 Update or add unit tests for `MetricsReporter` verifying delegation to `RumClient` methods

- [ ] 12. Final validation
  - [ ] 12.1 Run `./tools/hooks/pre-commit` from repo root and resolve any lint errors across all changed files
  - [ ] 12.2 Run `yarn run typecheck` in `apps/` and resolve any TypeScript errors
  - [ ] 12.3 Run `yarn test` in `frontend/packages/observability/` and confirm all unit and property-based tests pass
  - [ ] 12.4 Run `turbo build` in `frontend/` and confirm both `@code-dot-org/core` and `@code-dot-org/observability` build cleanly
