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

- [x] 7. Implement the singleton and `_initializeSingleton` in `src/index.ts`

  - Declare module-level `export let singleton: ObservabilityClient = new NoopAdapter()`
  - Export `_initializeSingleton(client)` that reassigns `singleton`
  - Re-export `ObservabilityClient`, `ObservabilityConfig`, `createObservabilityClient` from their respective modules
  - Export `singleton` as the default export
  - _Requirements: 1.1, 1.4, 2.5_

- [x] 8. Implement `observabilityPlugin` in `src/plugin.ts`

  - Declare module augmentation on `@code-dot-org/core`: `interface SiteConfigExtensions { observability: ObservabilityConfig }`
  - Export `observabilityPlugin` conforming to `CorePlugin`: in `onCoreReady(config)`, read `config.observability`; if `provider` is `'none'` return early; otherwise call `createObservabilityClient`, call `client.init(config.observability)`, call `_initializeSingleton(client)`
  - _Requirements: 2.4, 4.1, 6.1, 6.3_

  - [x] 8.1 Write unit tests for `observabilityPlugin`
    - `onCoreReady` with `provider: 'none'` does not call factory; `onCoreReady` with `provider: 'sentry'` calls factory and `_initializeSingleton`; singleton is no-op before `onCoreReady` and the real adapter after
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

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations; each test must include a comment `// Feature: observability, Property N: <property text>`
- The singleton reassignment pattern (`export let singleton`) works for all ES module consumers including webpack 5 `import` statements; raw `require()` with a cached default reference is not a supported usage pattern
- `SentryAdapter` is never imported by the main entry point — it is only reachable via the `./sentry` entry point or via the factory's dynamic import, keeping it tree-shakeable
