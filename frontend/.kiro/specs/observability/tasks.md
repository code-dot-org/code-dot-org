# Implementation Plan: Frontend Observability

## Overview

Implement the `@code-dot-org/observability` package and integrate it into Code Studio. The work proceeds in four phases: (1) scaffold the new package, (2) implement core types and the no-op adapter, (3) implement the Sentry adapter, and (4) wire everything into `@code-dot-org/core` and Code Studio.

## Tasks

- [x] 1. Scaffold `frontend/packages/observability` package

  - Create `package.json` following package-conventions: name `@code-dot-org/observability`, `"type": "module"`, required scripts, `@sentry/browser` as a peer dependency, `fast-check` as a dev dependency, four `exports` entries (`.`, `./plugin`, `./sentry`, `./noop`)
  - Create `vite.config.ts` with `vite-plugin-dts`, `vite-plugin-externalize-deps`, dual ESM+CJS `getRollupOutputConfig`, `preserveModules: true`, `build.sourcemap: true`
  - Create `tsconfig.json` extending `@code-dot-org/lint-config/typescript/tsconfig.vite.app.json`
  - Create `vitest.config.ts` with `globals: true` and `environment: 'jsdom'`
  - Create `eslint.config.mjs` extending `@code-dot-org/lint-config/eslint/base.mjs`
  - Create `.lintstagedrc.mjs` re-exporting the shared base config
  - Add the package to `frontend/package.json` workspace globs (verify `"packages/*"` already covers it; if not, add it)
  - Add `@code-dot-org/observability` as a dependency in `frontend/apps/studio/package.json`
  - _Requirements: 1.2, 1.3, 7.5_

- [x] 2. Define core types in `src/types.ts`

  - Export `SamplingConfig` interface (`errorSampleRate?: number`, `tracesSampleRate?: number`)
  - Export `ObservabilityConfig` interface (`provider`, `sentry?`, `sampling?`, `tracePropagationTargets?`)
  - Export `ObservabilityClient` interface with `init`, `recordError`, `setConsented`, `isConsented`, `shutdown`
  - _Requirements: 1.1, 2.1, 8.1, 9.1_

- [x] 3. Implement `NoopAdapter` in `src/adapters/noop.ts`

  - Implement all `ObservabilityClient` methods as no-ops
  - `isConsented()` returns `false`; `shutdown()` returns `Promise.resolve()`
  - Export as named export `NoopAdapter`
  - _Requirements: 2.2, 8.6, 9.6_

  - [x] 3.1 Write property test for `NoopAdapter` (Property 7)

    - **Property 7: No-op adapter accepts any config and performs no external calls**
    - Use `fc.record({provider: fc.constantFrom('sentry','none'), sampling: fc.record({errorSampleRate: fc.float({min:0,max:1}), tracesSampleRate: fc.float({min:0,max:1})}), tracePropagationTargets: fc.array(fc.string())})` as arbitrary
    - Assert no exceptions thrown, no console output, no global state mutations
    - **Validates: Requirements 2.2, 8.6, 9.6**
    - _File: `src/__tests__/noop.test.ts`_

  - [x] 3.2 Write unit tests for `NoopAdapter`
    - All methods callable without error; `isConsented()` returns `false`; `shutdown()` resolves
    - _Requirements: 2.2_
    - _File: `src/__tests__/noop.test.ts`_

- [x] 4. Implement `createObservabilityClient` factory in `src/factory.ts`

  - Return `new NoopAdapter()` synchronously when `provider` is `undefined` or `'none'`
  - Dynamically import `./adapters/sentry` and return a `SentryAdapter` when `provider` is `'sentry'`; because the factory must return synchronously, construct the adapter eagerly (deferred SDK init happens inside `adapter.init()`)
  - Throw `new Error(\`Unsupported observability provider: "${provider}"\`)` for any other value
  - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.1 Write property test for factory — valid providers (Property 1)

    - **Property 1: Factory returns a valid client for all valid providers and configs**
    - Use `fc.constantFrom('sentry', 'none')` and `fc.record({sampling: ..., tracePropagationTargets: ...})` as arbitraries
    - Assert returned object has callable `init`, `recordError`, `setConsented`, `isConsented`, `shutdown`
    - **Validates: Requirements 2.1, 8.1, 9.1**
    - _File: `src/__tests__/factory.test.ts`_

  - [x] 4.2 Write property test for factory — unknown provider throws (Property 2)

    - **Property 2: Unrecognized provider throws a descriptive error**
    - Use `fc.string().filter(s => s !== 'sentry' && s !== 'none')` as arbitrary
    - Assert thrown `Error` message contains the bad value
    - **Validates: Requirements 2.3**
    - _File: `src/__tests__/factory.test.ts`_

  - [x] 4.3 Write unit tests for factory
    - `createObservabilityClient()` with no args returns no-op; `createObservabilityClient('none')` returns no-op; returned object has all required methods
    - _Requirements: 2.1, 2.2_
    - _File: `src/__tests__/factory.test.ts`_

- [x] 5. Implement `SentryAdapter` in `src/adapters/sentry.ts`

  - Declare internal `AdapterState` (`initialized`, `consentedUserId`, `pendingConsent`)
  - `init(config)`: guard on `typeof window === 'undefined'`; call `Sentry.init` with `sendDefaultPii: false`, `sampleRate`, `tracesSampleRate`, `tracePropagationTargets` (default `[/^\/(?!\/)/]`); apply any queued `setConsented`; wrap entire body in try/catch — on failure log `console.warn` and degrade to no-op
  - `recordError(error, context)`: call `Sentry.captureException(error, {extra: context})`; wrap in try/catch — on failure log `console.warn`
  - `setConsented(userId)`: if not yet initialized, queue the value; otherwise call `Sentry.setUser(userId ? {id: userId} : null)` and update `consentedUserId`
  - `isConsented()`: return `consentedUserId !== null && consentedUserId !== undefined && consentedUserId !== ''`
  - `shutdown()`: call `Sentry.close()`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.2, 4.4, 5.1, 5.2, 5.4, 5.5, 6.2, 6.4, 8.2, 8.4, 9.2, 9.3, 9.5_

  - [x] 5.1 Write property test for `recordError` forwarding (Property 3)

    - **Property 3: recordError forwards errors to the provider**
    - Use `fc.anything()` for error value, `fc.record({})` for context; mock `Sentry.captureException`
    - Assert mock was called with the exact error and context; assert method never throws
    - **Validates: Requirements 3.1**
    - _File: `src/__tests__/sentry.test.ts`_

  - [x] 5.2 Write property test for SDK errors swallowed during `recordError` (Property 4)

    - **Property 4: Provider SDK errors during recordError are swallowed**
    - Use `fc.anything()` for the value thrown by the mock SDK; assert `recordError` does not throw; assert `console.warn` was called
    - **Validates: Requirements 3.4**
    - _File: `src/__tests__/sentry.test.ts`_

  - [x] 5.3 Write property test for consent round-trip (Property 5)

    - **Property 5: Consent round-trip — setConsented/isConsented accurately reflect state**
    - Use `fc.string()` for userId, `fc.boolean()` for whether `setConsented` is called before or after `init`
    - Assert `isConsented()` is `true` iff last `setConsented` call had a non-null, non-empty string; assert `setConsented(null)` / `setConsented('')` causes `isConsented()` to return `false`; assert pre-init queue is applied after `init`
    - **Validates: Requirements 4.3, 5.1, 5.2, 5.4, 5.5**
    - _File: `src/__tests__/sentry.test.ts`_

  - [x] 5.4 Write property test for config pass-through to SDK (Property 6)

    - **Property 6: Config values are passed through to the provider SDK unchanged**
    - Use `fc.float({min:0,max:1})` for rates, `fc.array(fc.string())` for targets; mock `Sentry.init`
    - Assert mock received the exact `sampleRate`, `tracesSampleRate`, and `tracePropagationTargets` values
    - **Validates: Requirements 8.4, 9.2**
    - _File: `src/__tests__/sentry.test.ts`_

  - [x] 5.5 Write property test for init failure graceful degradation (Property 8)

    - **Property 8: Init failure falls back gracefully without propagating**
    - Use `fc.anything()` for the value thrown by `Sentry.init`; assert `init` does not throw; assert subsequent `recordError` calls are no-ops; assert `isConsented()` returns `false`
    - **Validates: Requirements 6.4**
    - _File: `src/__tests__/sentry.test.ts`_

  - [x] 5.6 Write unit tests for `SentryAdapter`
    - `init` sets `sendDefaultPii: false` (Req 4.2, 4.4); `setConsented` before `init` is applied after `init` (Req 5.4); `init` is a no-op when `typeof window === 'undefined'` (Req 6.2); `tracesSampleRate` defaults to `0` when not set (Req 8.2); `tracePropagationTargets` defaults to same-origin pattern when not set (Req 9.5); `tracePropagationTargets` is passed through even when `tracesSampleRate` is `0` (Req 9.3)
    - _Requirements: 3.2, 3.3, 4.2, 4.4, 5.4, 6.2, 8.2, 9.3, 9.5_
    - _File: `src/__tests__/sentry.test.ts`_

- [x] 6. Checkpoint — ensure all observability package tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement the module-level API and `_initializeSingleton` in `src/index.ts`

  - Declare module-level `export let observabilityClient: ObservabilityClient = new NoopAdapter()`
  - Export `_initializeSingleton(client)` that reassigns `observabilityClient`
  - Export module-level delegating functions `init`, `recordError`, `setConsented`, `isConsented`, `shutdown` that forward to the live `observabilityClient`
  - Export stable `logger` and `metrics` objects whose methods close over `observabilityClient`, enabling `import * as observability from '@code-dot-org/observability'`
  - Re-export `ObservabilityClient`, `ObservabilityConfig`, `createObservabilityClient` from their respective modules
  - _Requirements: 1.1, 1.4, 1.5, 2.5_

- [x] 8. Implement `observabilityPlugin` in `src/plugin.ts`

  - Declare module augmentation on `@code-dot-org/core`: `interface SiteConfigExtensions { observability: ObservabilityConfig }`
  - Export `observabilityPlugin` conforming to `CorePlugin`: in `onCoreReady(config)`, read `config.observability`; if `provider` is `'none'` return early; otherwise call `createObservabilityClient`, call `client.init(config.observability)`, call `_initializeSingleton(client)`
  - _Requirements: 2.4, 4.1, 6.1, 6.3_

  - [x] 8.1 Write unit tests for `observabilityPlugin`
    - `onCoreReady` with `provider: 'none'` does not call factory; `onCoreReady` with `provider: 'sentry'` calls factory and `_initializeSingleton`; `observabilityClient` is no-op before `onCoreReady` and the real adapter after
    - _Requirements: 2.4, 2.5_
    - _File: `src/__tests__/plugin.test.ts`_

- [x] 9. Update `@code-dot-org/core` — add `CorePlugin` interface and `initializeCore`

  - In `src/config/initializeCore.ts` (new file): export `CorePlugin` interface (`onCoreReady(config: SiteConfig & SiteConfigExtensions): void`); export `initializeCore(plugins?: CorePlugin[])` that sets `window.__CODE_STUDIO__` and calls `plugin.onCoreReady(CodeStudioConfig)` for each plugin
  - In `src/config/initializeCodeStudioConfig.ts`: add `@deprecated` JSDoc and re-export `initializeCore` as `initializeCodeStudioConfig` for backward compatibility
  - Export `CorePlugin` and `initializeCore` from `src/index.ts` (or the package's main entry)
  - _Requirements: 6.1, 7.3_

- [x] 10. Update `SiteConfig` in `@code-dot-org/core`

  - Export empty `SiteConfigExtensions` interface
  - Rename `rumProvider` → `provider` and narrow type to `'sentry' | 'none'` inside `ObservabilityConfig`
  - Remove `datadog` and `newRelic` fields from `ObservabilityConfig`; mark `DatadogConfig`, `NewRelicConfig`, and `RumProvider` as `@deprecated`
  - Update `RuntimeConfig.observability` to use the new shape
  - Update the `SiteConfig` constructor to read `runtime.observability?.provider ?? 'none'`
  - Change the default export to `new SiteConfig() as SiteConfig & SiteConfigExtensions`
  - _Requirements: 6.3_

- [x] 11. Integrate observability into Code Studio (`frontend/apps/studio`)

  - In the studio bootstrap entry point (e.g. `entrypoints/application.tsx`), import `initializeCore` from `@code-dot-org/core` and `observabilityPlugin` from `@code-dot-org/observability/plugin`
  - Call `initializeCore([observabilityPlugin])` before mounting the React app
  - Ensure the call is guarded or deferred so it only runs in browser environments (`typeof window !== 'undefined'`)
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 12. Add `README.md` and `CONTRIBUTING.md` to `frontend/packages/observability`

  - `README.md`: purpose, package name, installation, key exports, usage examples (init, recordError, setConsented)
  - `CONTRIBUTING.md`: steps to add a new provider adapter (new file in `src/adapters/`, new entry point in `package.json` exports, new case in factory)
  - _Requirements: 4.5, 7.2_

- [x] 13. Final checkpoint — ensure all tests pass

  - Run `yarn workspace @code-dot-org/observability test` and `yarn workspace @code-dot-org/core test`
  - Run `turbo build` in `frontend/` to verify the Turborepo pipeline produces compiled output for both packages
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Extend `SamplingConfig` with log and metrics rate fields in `src/types.ts`

  - Add `logSampleRate?: number` and `metricsSampleRate?: number` to `SamplingConfig`
  - _Requirements: 8.1, 9.1, 10.1_

- [x] 15. Update `SentryAdapter` — environment, tracing integration, and environment-aware propagation targets

  - Add `environment: CodeStudioConfig.environment` to `Sentry.init()` call so events are bucketed correctly in the Sentry dashboard (Req 6.6)
  - Add `integrations: [Sentry.browserTracingIntegration()]` to `Sentry.init()` to enable distributed tracing
  - Replace hardcoded same-origin default with `getAllowedTracingUrls()` method that reads `CodeStudioConfig.environment` from `@code-dot-org/core`:
    - adhoc → `/^https:\/\/.*\.cdn-code\.org/`
    - all other environments → `getDashboardApiUrl(environment)`
  - _Requirements: 6.6, 11.4, 11.5_

  - [x] 15.1 Write unit tests for environment bucketing and `getAllowedTracingUrls()`
    - `Sentry.init` receives `environment` matching `CodeStudioConfig.environment` (Req 6.6)
    - `getAllowedTracingUrls()` returns CDN regex for adhoc environment (Req 11.4)
    - `getAllowedTracingUrls()` returns dashboard API URL for standard environments (Req 11.4)
    - `tracePropagationTargets` uses `getAllowedTracingUrls()` when not explicitly provided (Req 11.5)
    - _File: `src/__tests__/sentry.test.ts`_

- [x] 16. Implement session ID-based sampling utility in `src/sampling.ts`

  - Export `getOrCreateObservabilitySessionId(): string | undefined`:
    - Attempt `sessionStorage.getItem('__cdo_observability_session_id__')`
    - If absent, generate `crypto.randomUUID()`, write to `sessionStorage`, return it
    - If `sessionStorage` throws: log `console.warn` once, return `undefined`
  - Export `hashSessionId(sessionId: string): number` — deterministic FNV-1a hash returning a float in `[0, 1)`
  - Export `isSampled(sessionId: string | undefined, sampleRate: number): boolean` — returns `false` immediately if `sessionId` is `undefined`; otherwise `hash(sessionId) < sampleRate`
  - This module is provider-agnostic — any adapter can use it
  - _Requirements: 9.3, 10.3_

  - [x] 16.1 Write property test for session ID sampling (Property 9)
    - **Property 9: Session ID sampling is deterministic and uniformly distributed**
    - Use `fc.string({minLength: 1})` for session IDs, `fc.float({min: 0, max: 1})` for rates
    - Assert same session ID + rate always produces the same result (determinism)
    - Assert `isSampled(undefined, rate)` always returns `false` regardless of rate
    - Assert `isSampled(id, 0)` always returns `false`; `isSampled(id, 1)` always returns `true`
    - **Validates: Requirements 9.3, 10.3**
    - _File: `src/__tests__/sampling.test.ts`_

- [x] 17. Add session ID state and sampling gates to `ObservabilityClient` and `SentryAdapter`

  - Add `sessionStorageUnavailable: boolean` and `observabilitySessionId: string | undefined` to `AdapterState` in `SentryAdapter`
  - On `init`, call `getOrCreateObservabilitySessionId()` from `src/sampling.ts`; if it returns `undefined`, set `state.sessionStorageUnavailable = true`
  - All sampling decisions check `state.sessionStorageUnavailable` first and short-circuit to `false` without retrying `sessionStorage`
  - Add `isLogSampled(): boolean` and `isMetricsSampled(): boolean` to `SentryAdapter` using `isSampled(state.observabilitySessionId, rate)`
  - Gate log and metric event emission on these methods; unsampled events are silently dropped
  - `NoopAdapter` returns `false` for both without accessing `sessionStorage`
  - _Requirements: 9.2, 9.3, 10.2, 10.3_

  - [x] 17.1 Write unit tests for session ID management and sampling gates
    - Session ID is generated and persisted to `sessionStorage` on first call (Req 9.3, 10.3)
    - Same session ID is returned on subsequent calls within the same session (Req 9.3, 10.3)
    - `sessionStorageUnavailable` is set and `console.warn` is logged once when `sessionStorage` throws (Req 9.3, 10.3)
    - Subsequent sampling decisions short-circuit to `false` when `sessionStorageUnavailable` is set (Req 9.3, 10.3)
    - Log events are not emitted when `logSampleRate` is `0` or not set (Req 9.2)
    - Metric events are not emitted when `metricsSampleRate` is `0` or not set (Req 10.2)
    - `NoopAdapter` returns `false` for log and metrics sampling without touching `sessionStorage` (Req 9.5, 10.5)
    - _File: `src/__tests__/sentry.test.ts`, `src/__tests__/noop.test.ts`_

- [x] 18. Update `NoopAdapter` to accept new `SamplingConfig` fields silently

  - Verify `NoopAdapter` already ignores all sampling config (no code change expected, but confirm and update Property 7 test to include `logSampleRate` and `metricsSampleRate` in the arbitrary)
  - _Requirements: 9.5, 10.5_

- [x] 19. Final checkpoint — ensure all tests pass after new tasks

  - Run `yarn workspace @code-dot-org/observability test`
  - Run `yarn lint:fix` and `yarn release:dryrun` from `frontend/`
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Extend `ObservabilityClient` interface and types with `logger` and `metrics`

  - Add `ObservabilityLogger` interface to `src/types.ts`: methods `trace`, `debug`, `info`, `warn`, `error`, `fatal` — each accepts `(message: string, attributes?: Record<string, unknown>): void`
  - Add `ObservabilityMetrics` interface to `src/types.ts`: methods `count(name, value?, attributes?)`, `gauge(name, value, attributes?)`, `distribution(name, value, attributes?)` — OTel instrument types
  - Add `LogAttributes = Record<string, unknown>` type alias
  - Add `NOOP_LOGGER` and `NOOP_METRICS` constant objects (all methods are empty arrow functions)
  - Add `logger: ObservabilityLogger` and `metrics: ObservabilityMetrics` fields to `ObservabilityClient` interface
  - Export all new types from `src/index.ts`
  - _Requirements: 1.1, 13.1, 14.1_

- [x] 21. Refactor `BaseAdapter` — resolve session ID before `initProvider`

  - In `BaseAdapter.init()`, move `getOrCreateObservabilitySessionId()` call to run **before** `this.initProvider(config)` so that `isLogSampled()`/`isMetricsSampled()` return correct values when `initProvider` calls them
  - New lifecycle order: SSR guard → resolve session ID → `initProvider(config)` → set `initialized = true` → apply queued consent → `initLogger(config)` → `initMetrics(config)`
  - Add `logger: ObservabilityLogger = NOOP_LOGGER` and `metrics: ObservabilityMetrics = NOOP_METRICS` public fields to `BaseAdapter`
  - Add protected `initLogger(config)` and `initMetrics(config)` no-op hooks (subclasses override to wire up live implementations)
  - _Requirements: 9.3, 10.3, 13.2, 14.2_

- [x] 22. Refactor `SentryAdapter` — SDK-level sampling, direct logger/metrics delegation, console integration

  - In `initProvider(config)`:
    - Compute `enableLogs = this.isLogSampled(config.sampling?.logSampleRate)` using the already-resolved session ID (Req 9.3)
    - Compute `enableMetrics = this.isMetricsSampled(config.sampling?.metricsSampleRate)` (Req 10.3)
    - Pass `enableLogs` and `enableMetrics` to `Sentry.init()`
    - Add `Sentry.consoleLoggingIntegration({ levels: ['error'] })` to `integrations` only when `enableLogs` is `true` (Req 15.3, 15.4)
  - Implement `initLogger(config)`: replace `this.logger` with an object that delegates directly to `Sentry.logger.*` with no per-call sampling check (SDK handles it via `enableLogs`); each method wraps in try/catch
  - Implement `initMetrics(config)`: replace `this.metrics` with an object that delegates directly to `Sentry.metrics.*` with no per-call sampling check (SDK handles it via `enableMetrics`); each method wraps in try/catch
  - _Requirements: 9.3, 10.3, 13.1–13.3, 14.1–14.3, 15.1–15.4_

  - [x] 22.1 Write property test for sampling decision at init (Property 10)

    - **Property 10: enableLogs/enableMetrics reflect the session sampling decision made at init**
    - Use `fc.float({min: 0, max: 1})` for `logSampleRate` and `metricsSampleRate`
    - For a known session ID, compute expected `isSampled` result; assert `Sentry.init` was called with matching `enableLogs`/`enableMetrics` booleans
    - Assert `enableLogs: false` when `logSampleRate` is `0`; `enableMetrics: false` when `metricsSampleRate` is `0`
    - **Validates: Requirements 9.3, 10.3**
    - _File: `src/__tests__/sentry.test.ts`_

  - [x] 22.2 Write unit tests for `logger` and `metrics` direct delegation

    - `logger.*` calls `Sentry.logger.*` directly when `enableLogs` is `true` (no per-call sampling check)
    - `logger.*` is a no-op before `init` (NOOP_LOGGER)
    - `logger.*` swallows SDK errors and logs `console.warn` (Req 13.3)
    - `metrics.count` defaults `value` to `1` (Req 14.1)
    - `metrics.*` calls `Sentry.metrics.*` directly when `enableMetrics` is `true`
    - `metrics.*` swallows SDK errors and logs `console.warn` (Req 14.3)
    - _Requirements: 13.1–13.3, 14.1–14.3_
    - _File: `src/__tests__/sentry.test.ts`_

  - [x] 22.3 Write unit tests for console error capture (Req 15)

    - `consoleLoggingIntegration({ levels: ['error'] })` is included in integrations when `enableLogs` is `true`
    - `consoleLoggingIntegration` is NOT included when `enableLogs` is `false`
    - **Validates: Requirements 15.1, 15.3, 15.4**
    - _File: `src/__tests__/sentry.test.ts`_

- [x] 23. Update `NoopAdapter` — add no-op `logger` and `metrics` (inherited from `BaseAdapter`)

  - Confirm `NoopAdapter` inherits `logger = NOOP_LOGGER` and `metrics = NOOP_METRICS` from `BaseAdapter` — no code change expected
  - Update Property 7 test to assert `logger.*` and `metrics.*` methods are callable without error and produce no console output or external calls
  - _Requirements: 13.5, 14.5_
  - _File: `src/__tests__/noop.test.ts`_

- [x] 24. Final checkpoint — ensure all tests pass after logger/metrics/sampling refactor

  - Run `yarn workspace @code-dot-org/observability test`
  - Run `./tools/hooks/pre-commit` from repo root to lint changed files
  - Ensure all 63+ tests pass; ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations; each test must include a comment `// Feature: observability, Property N: <property text>`
- The module-level API pattern (`import * as observability from '@code-dot-org/observability'`) mirrors how `@sentry/browser` is consumed. The `logger` and `metrics` objects are stable references whose methods close over the live `observabilityClient` singleton — no proxy class needed. Raw `require()` with a cached default reference is not a supported usage pattern.
- `SentryAdapter` is never imported by the main entry point — it is only reachable via the `./sentry` entry point or via the factory's dynamic import, keeping it tree-shakeable
- **Sampling preference**: adapters SHOULD use SDK-level feature flags (`enableLogs`/`enableMetrics`) to disable ingestion at init time where the provider supports it. Adapters that don't support SDK-level flags MAY fall back to per-call gating using `isLogSampled()`/`isMetricsSampled()` from `BaseAdapter`.

- [x] 25. ~~Widen `CorePlugin.onCoreReady` return type~~ — not needed

  - `CorePlugin.onCoreReady` stays typed as `void`. `observabilityPlugin.onCoreReady` is synchronous and fires-and-forgets the factory promise, so no interface change is required in `@code-dot-org/core`.
  - _Requirements: 6.5_

- [x] 26. Make `createObservabilityClient` async with dynamic adapter import at the factory level

  - In `frontend/packages/observability/src/factory.ts`:
    - Change `createObservabilityClient` to `async`, return type `Promise<ObservabilityClient>`
    - For `provider === 'none'` or `undefined`: return `new NoopAdapter()` immediately
    - For `provider === 'sentry'`: `const {SentryAdapter} = await import('./adapters/sentry')` then return `new SentryAdapter()`
    - For unknown providers: throw (the async wrapper rejects the promise)
  - In `frontend/packages/observability/src/plugin.ts`:
    - Keep the static `import {createObservabilityClient} from './factory'`
    - Keep `onCoreReady` as `async` (it must `await createObservabilityClient(...)`)
    - Change `const client = createObservabilityClient(...)` to `const client = await createObservabilityClient(...)`
  - The bundle split now happens at the adapter level inside the factory
  - _Requirements: 6.5, 6.7_

  - [x] 26.1 Update `factory.test.ts` and `plugin.test.ts` for async factory

    - In `factory.test.ts`: change `fc.property` to `fc.asyncProperty`, `await` all `createObservabilityClient` calls, use `rejects.toThrow` for the unknown-provider case
    - In `plugin.test.ts`: factory mock uses `mockResolvedValue(mockClient)`; tests that assert post-factory behavior use `await Promise.resolve()` to flush the microtask queue; `onCoreReady` calls are synchronous (no `await`)
    - _Requirements: 6.5_
    - _File: `src/__tests__/factory.test.ts`, `src/__tests__/plugin.test.ts`_

- [x] 27. Final checkpoint — ensure all tests pass after async plugin refactor

  - Run `yarn workspace @code-dot-org/observability test`
  - Run `yarn workspace @code-dot-org/core test`
  - Run `./tools/hooks/pre-commit` from repo root
  - Ensure all tests pass; ask the user if questions arise
