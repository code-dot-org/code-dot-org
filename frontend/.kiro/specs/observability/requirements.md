# Requirements Document

## Introduction

This feature introduces Frontend Observability instrumentation across the frontend. A new shared package, `frontend/packages/observability`, will provide a provider-agnostic observability abstraction. Host applications consume this package and select their desired observability provider (Sentry, or none) at initialization time. When no provider is configured, the package defaults to a no-op adapter that performs no instrumentation and transmits no data.

All instrumentation must comply with the platform's privacy policy: session data is limited to error logging and customer support debugging, no provider session identifier is linked to an application user identifier by default, and user-session linkage requires explicit user consent.

## Glossary

- `observability package`: The new `frontend/packages/observability` library.
- `observability provider`: A third-party frontend observability service (Sentry) or the no-op "none" option.
- `provider adapter`: A module inside the observability package that wraps a specific provider SDK and implements the common `ObservabilityClient` interface.
- `ObservabilityClient`: The common interface exported by the observability package that all provider adapters implement.
- `host application`: A frontend application that consumes the observability package — either `apps/` (webpack 5) or Code Studio (`frontend/apps/studio`, Vite).
- `session ID`: The opaque session identifier assigned by the active provider for the current browser session.
- `user ID`: The application-level identifier for an authenticated user.
- `consent`: Explicit, affirmative user action granting permission to link a session ID to a user ID for troubleshooting purposes.
- `no-op adapter`: A provider adapter that performs no external instrumentation calls and makes no network requests. Consent state and session-based sampling state are still tracked internally (via `BaseAdapter`) so that `isConsented()` and `isLogSampled()`/`isMetricsSampled()` behave correctly even before a real provider is selected. This is the default when no provider is configured.

---

## Requirements

### Requirement 1: Observability Package Structure

**User Story:** As a frontend engineer, I want a single shared observability package so that frontend observability logic is not duplicated across host applications.

#### Acceptance Criteria

1. The observability package SHALL export an `ObservabilityClient` interface with at minimum the following operations: `init`, `recordError`, `logger`, `metrics`, `setConsented`, `isConsented`, and `shutdown`.
2. The observability package SHALL be registered as a Turborepo workspace package under `frontend/packages/observability` and covered by the `"packages/*"` glob in `frontend/package.json`.
3. The observability package SHALL export TypeScript type declarations alongside its compiled output.
4. When the observability package is imported by a host application, it SHALL NOT bundle any provider SDK directly; each provider adapter SHALL be a separate entry point so that only the selected provider's code is included in the host bundle.
5. The observability package SHALL expose a module-level API — `init`, `recordError`, `logger`, `metrics`, `setConsented`, `isConsented`, `shutdown` — as named exports that delegate to the live singleton. Consumers SHALL be able to use `import * as observability from '@code-dot-org/observability'` and call `observability.logger.info(...)`, `observability.recordError(...)`, etc. without needing to import or reference the singleton object directly.

### Requirement 2: Provider Adapter Selection

**User Story:** As a frontend engineer, I want to select the observability provider at initialization time so that different environments or deployments can use different providers without code changes.

#### Acceptance Criteria

1. The observability package SHALL provide a `createObservabilityClient(provider?, config?)` factory function that accepts an optional provider identifier (`'sentry' | 'none'`) and an optional provider-specific configuration object, and returns an `ObservabilityClient` instance.
2. When `provider` is `'none'` or when `createObservabilityClient` is called with no arguments, it SHALL return a no-op adapter that satisfies the `ObservabilityClient` interface and performs no external calls.
3. When `provider` is an unrecognized value, `createObservabilityClient` SHALL throw a descriptive `Error` identifying the unsupported provider value.
4. The host application SHALL supply the provider identifier and configuration at application startup, before any instrumented user interactions occur.
5. Where a host application does not call `createObservabilityClient`, the observability package SHALL NOT initialize any provider SDK or transmit any data.

### Requirement 3: Error Recording

**User Story:** As a support engineer, I want unhandled errors and explicit error reports captured so that I can diagnose production issues without linking them to specific users by default.

#### Acceptance Criteria

1. When `ObservabilityClient.recordError(error, context)` is called, the `ObservabilityClient` SHALL forward the error and context metadata to the active provider.
2. When an unhandled JavaScript exception occurs in the browser, the `ObservabilityClient` SHALL automatically capture and forward the error to the active provider, provided `init` has been called.
3. When an unhandled Promise rejection occurs in the browser, the `ObservabilityClient` SHALL automatically capture and forward the rejection reason to the active provider, provided `init` has been called.
4. If the active provider SDK throws during error recording, the `ObservabilityClient` SHALL catch the exception, log a warning to the browser console, and continue normal operation without re-throwing.
5. The `ObservabilityClient` SHALL record only error-level data and session metadata; it SHALL NOT record user interaction replays, DOM snapshots, or network request payloads unless explicitly enabled by a future requirement. Privacy — Default Anonymous Sessions

**User Story:** As a privacy-conscious product owner, I want observability sessions to be anonymous by default so that no recorded session can be tied back to a specific user without their consent.

#### Acceptance Criteria

1. The `ObservabilityClient` SHALL NOT transmit the user ID or any personally identifiable information to the provider during normal session operation.
2. When `ObservabilityClient.init` is called, the `ObservabilityClient` SHALL configure the active provider to operate in anonymous mode, disabling any automatic user identification features provided by the provider SDK.
3. The `ObservabilityClient` SHALL NOT link the session ID to the user ID unless `ObservabilityClient.setConsented(userId)` has been explicitly called.
4. If the provider SDK automatically collects PII (e.g., IP address beyond what is required for session routing), the `ObservabilityClient` SHALL configure the SDK to suppress or mask that collection where the SDK provides such a configuration option.
5. The observability package documentation SHALL state that operators are responsible for reviewing each provider's data collection defaults and configuring them in accordance with the platform's privacy policy.

### Requirement 5: Privacy — Opt-In User-Session Linkage

**User Story:** As a support engineer, I want to link a session to a specific user only when that user has given explicit consent so that I can assist with targeted troubleshooting while respecting user privacy.

#### Acceptance Criteria

1. When `ObservabilityClient.setConsented(userId)` is called, the `ObservabilityClient` SHALL associate the provided user ID with the current session ID in the active provider.
2. When `ObservabilityClient.setConsented(userId)` is called with a null or empty `userId`, the `ObservabilityClient` SHALL remove any previously set user association from the active provider session.
3. The host application SHALL call `ObservabilityClient.setConsented(userId)` only after obtaining explicit user consent through a consent mechanism; the observability package SHALL NOT implement or enforce the consent UI itself.
4. If `ObservabilityClient.setConsented` is called before `ObservabilityClient.init`, the `ObservabilityClient` SHALL queue the association and apply it once `init` completes.
5. The `ObservabilityClient` SHALL expose an `isConsented()` method that returns a boolean indicating whether a user ID is currently associated with the active session.

### Requirement 6: Integration with Code Studio (Vite)

**User Story:** As a frontend engineer, I want the observability package integrated into Code Studio using Vite best practices so that frontend observability is available in the newer frontend.

#### Acceptance Criteria

1. Code Studio SHALL import the observability package as a standard ES module dependency and call `createObservabilityClient` during application bootstrap.
2. Where Code Studio enables SSR in the future, the `ObservabilityClient.init` call SHALL be guarded to execute only in browser environments (i.e., where `typeof window !== 'undefined'`).
3. The Code Studio integration SHALL configure the observability provider using runtime values injected by Rails into the `<meta name="app-config">` tag. In production, this tag is rendered by `dashboard/app/views/app/index.html.haml` using values from the `CDO` object, which is populated from `config/*.yml.erb`; the Sentry DSN for the Studio app is sourced from `CDO.frontend_studio_sentry_dsn`. The Vite development `frontend/apps/studio/index.html` SHALL include a stub `<meta name="app-config">` tag with `{"observability":{"provider":"none"}}` so the app degrades gracefully in local dev without Rails. When the meta tag is absent or `provider` is `'none'`, `createObservabilityClient` SHALL default to the no-op adapter.
4. If the provider SDK is not available at runtime (e.g., blocked by an ad blocker), the `ObservabilityClient` SHALL catch the initialization failure, log a warning, and fall back to no-op adapter behavior.
5. The Code Studio integration SHALL NOT increase the initial JavaScript bundle size beyond the size of the selected provider SDK plus the observability package itself (i.e., no unintended transitive dependencies shall be bundled).
6. When initializing the provider SDK, the `ObservabilityClient` SHALL pass the current runtime environment identifier (e.g. `'production'`, `'staging'`, `'adhoc'`) to the provider so that events are correctly bucketed by environment in the provider dashboard and do not default to `'production'`.

### Requirement 7: Portability and Extensibility

**User Story:** As a frontend engineer, I want the observability abstraction to be portable so that any future host application in the monorepo can adopt frontend observability with minimal effort.

#### Acceptance Criteria

1. The `ObservabilityClient` interface SHALL be defined in TypeScript and exported from the observability package's public API so that any host application can type-check its usage.
2. The observability package SHALL document the steps required to add a new provider adapter in a `CONTRIBUTING.md` or inline code comments.
3. When a new provider adapter is added to the observability package, existing host applications SHALL require no changes to their integration code other than passing the new provider identifier to `createObservabilityClient`.
4. The observability package SHALL include unit tests for the `createObservabilityClient` factory, the no-op adapter, and the `setConsented` / `isConsented` logic, runnable via `yarn test` in the `frontend/` workspace.
5. The observability package build SHALL be integrated into the Turborepo pipeline so that `turbo build` in `frontend/` produces the compiled package output.

### Requirement 8: Sampling Configuration

**User Story:** As a platform operator, I want to control the volume of errors and traces sent to the observability provider so that I can manage costs and avoid exceeding billing quotas.

#### Acceptance Criteria

1. The `ObservabilityClient` configuration SHALL accept an optional `sampling` object with the following fields:
   - `errorSampleRate`: a number between 0 and 1 (inclusive) controlling the fraction of errors sent to the provider. Defaults to `1.0` when not set.
   - `tracesSampleRate`: a number between 0 and 1 (inclusive) controlling the fraction of traces/spans sent to the provider. Defaults to `0` (disabled) when not set.
   - `logSampleRate`: a number between 0 and 1 (inclusive) controlling the fraction of log events sent to the provider. Defaults to `0` (disabled) when not set.
   - `metricsSampleRate`: a number between 0 and 1 (inclusive) controlling the fraction of metric events sent to the provider. Defaults to `0` (disabled) when not set.
2. When `tracesSampleRate` is `0` or not set, the `ObservabilityClient` SHALL NOT emit any trace or span data to the provider.
3. When `errorSampleRate` is `0`, the `ObservabilityClient` SHALL NOT emit any error data to the provider, but SHALL continue to operate normally (no exception thrown).
4. The `ObservabilityClient` SHALL pass `errorSampleRate` and `tracesSampleRate` directly to the active provider SDK's native sampling configuration; it SHALL NOT implement its own sampling logic on top of the provider's.
5. The host application SHALL supply sampling rates via the Rails-injected `<meta name="app-config">` runtime config or via DCDO (`frontend-observability-sampling-config`), allowing rates to differ per environment (e.g., lower trace rates in production, higher in staging) without a code deploy.
6. The no-op adapter SHALL accept and silently ignore all sampling configuration.

### Requirement 9: Log Sampling

**User Story:** As a platform operator, I want to control the volume of log events forwarded to the observability provider so that I can manage costs while retaining diagnostic capability.

#### Acceptance Criteria

1. The `ObservabilityClient` configuration SHALL accept a `logSampleRate` field (in `sampling`) as described in Requirement 8.1.
2. When `logSampleRate` is `0` or not set, the `ObservabilityClient` SHALL NOT emit any log events to the provider.
3. Log sampling SHALL use the session-based sampling mechanism described in Requirement 11. The sampling decision SHALL be made once per session — all log events within a sampled session are forwarded; all log events within an unsampled session are dropped. Provider adapters SHOULD implement this by disabling log ingestion at the SDK level at `init` time where the provider supports it, and MAY fall back to per-call gating where it does not.
4. The host application SHALL supply `logSampleRate` via the Rails-injected `<meta name="app-config">` runtime config or via DCDO, allowing the rate to be adjusted per environment without a code deploy.
5. The no-op adapter SHALL accept and silently ignore all log sampling configuration.

### Requirement 10: Metrics Sampling

**User Story:** As a platform operator, I want to control the volume of metric events forwarded to the observability provider so that I can manage costs while retaining diagnostic capability.

#### Acceptance Criteria

1. The `ObservabilityClient` configuration SHALL accept a `metricsSampleRate` field (in `sampling`) as described in Requirement 8.1.
2. When `metricsSampleRate` is `0` or not set, the `ObservabilityClient` SHALL NOT emit any metric events to the provider.
3. Metrics sampling SHALL use the session-based sampling mechanism described in Requirement 11. The sampling decision SHALL be made once per session — all metric events within a sampled session are forwarded; all metric events within an unsampled session are dropped. Provider adapters SHOULD implement this by disabling metrics collection at the SDK level at `init` time where the provider supports it, and MAY fall back to per-call gating where it does not.
4. The host application SHALL supply `metricsSampleRate` via the Rails-injected `<meta name="app-config">` runtime config or via DCDO, allowing the rate to be adjusted per environment without a code deploy.
5. The no-op adapter SHALL accept and silently ignore all metrics sampling configuration.

### Requirement 11: Session-Based Sampling Mechanism

**User Story:** As a platform operator, I want sampling decisions to be consistent within a session and to support anonymous users so that partial session data is never sent to the provider.

#### Acceptance Criteria

1. The `ObservabilityClient` SHALL maintain an observability-owned session ID — a UUID generated by the observability package itself and persisted in `sessionStorage` under `__cdo_observability_session_id__`. If no session ID exists, the adapter SHALL generate one and persist it before executing any sampling decision.
2. Sampling decisions SHALL use a deterministic hash of the session ID (e.g. FNV-1a) producing a float in `[0, 1)`, including the session if `hash(sessionId) < sampleRate`. This ensures all events within a session are consistently included or excluded, and supports rates as low as `0.00001` (0.001%).
3. Consent is not required for sampling decisions. The session ID is used solely as a local sampling key and is never transmitted to the provider. The events emitted contain no personally identifiable information. Consent governs only whether a user's identity is linked to a session via `setConsented`, which is a separate concern.
4. If `sessionStorage` throws at any point, the adapter SHALL log a single `console.warn`, set an internal `sessionStorageUnavailable` flag, and short-circuit all subsequent sampling decisions to "not sampled" without retrying `sessionStorage`.
5. If `sessionStorage` is unavailable, the session SHALL fall into the default "not sampled" bucket for all sampling decisions.

### Requirement 12: Distributed Tracing — Frontend/Backend Trace Context Propagation

**User Story:** As a platform engineer, I want frontend observability traces linked to the OTel-instrumented Rails backend so that I can follow a request end-to-end across browser and server in a single distributed trace.

#### Acceptance Criteria

1. The `ObservabilityClient` configuration SHALL accept a `tracePropagationTargets` option — an array of strings and/or regular expressions — that controls which outgoing HTTP request URLs receive W3C `traceparent` headers.
2. When `tracePropagationTargets` is provided, the `ObservabilityClient` SHALL configure the active provider to emit the W3C `traceparent` header on matching outgoing requests, enabling the OTel-instrumented Rails backend to continue the trace.
3. Trace context propagation SHALL operate independently of span collection — the `ObservabilityClient` SHALL propagate trace headers on matching outgoing requests even when `tracesSampleRate` is `0` or not set.
4. When `tracePropagationTargets` is not supplied in the config, the `SentryAdapter` SHALL derive a default target by reading `CodeStudioConfig` from `@code-dot-org/core`. This makes `@code-dot-org/observability` an explicit runtime peer of `@code-dot-org/core`. The derived default SHALL be:
   - For adhoc environments: a regex matching the CDN domain (`/^https:\/\/.*\.cdn-code\.org/`)
   - For all other environments (production, staging, development, test, levelbuilder): the dashboard API URL returned by `getDashboardApiUrl(environment)`
5. When `tracePropagationTargets` is not set, the `ObservabilityClient` SHALL use the environment-derived default described in 12.4, preventing accidental trace header leakage to third-party services.
6. The no-op adapter SHALL accept and silently ignore all trace propagation configuration.

### Requirement 13: Structured Logging API

**User Story:** As a frontend engineer, I want a structured, leveled logging API aligned with OpenTelemetry and Sentry best practices so that I can emit searchable, trace-correlated log events without coupling to a specific provider.

#### Acceptance Criteria

1. The `ObservabilityClient` SHALL expose a `logger` object with the following methods, aligned with the OpenTelemetry severity model and Sentry's `logger` namespace: `trace`, `debug`, `info`, `warn`, `error`, `fatal`. Each method SHALL accept a `message: string` and an optional `attributes: Record<string, unknown>` for structured, searchable key-value context.
2. Each `logger.*` method SHALL forward directly to the provider SDK's structured logging API. The sampling decision is made once per session (see Requirement 9.3) — if the session is not sampled, no log events reach the network.
3. If the provider SDK throws during a `logger.*` call, the `ObservabilityClient` SHALL catch the exception, log a warning to the browser console, and continue normal operation without re-throwing.
4. The `logger` object SHALL be available on the `ObservabilityClient` interface so that consumers do not need to import provider-specific modules.
5. The no-op adapter SHALL expose a `logger` object whose methods are all no-ops — no console output, no external calls, no thrown exceptions.
6. Log events SHALL NOT include personally identifiable information unless the host application explicitly passes it in `attributes` after obtaining user consent.

### Requirement 14: Metrics API

**User Story:** As a frontend engineer, I want a structured metrics API aligned with OpenTelemetry instrument types so that I can record counters, gauges, and distributions without coupling to a specific provider.

#### Acceptance Criteria

1. The `ObservabilityClient` SHALL expose a `metrics` object with the following methods, aligned with the OpenTelemetry metrics instrument model:
   - `count(name: string, value?: number, attributes?: Record<string, unknown>)` — monotonic counter for events (orders, clicks, API calls). `value` defaults to `1`.
   - `gauge(name: string, value: number, attributes?: Record<string, unknown>)` — current value instrument (queue depth, active connections).
   - `distribution(name: string, value: number, attributes?: Record<string, unknown>)` — value distribution instrument (response times, payload sizes).
2. Each `metrics.*` method SHALL forward directly to the provider SDK's metrics API. The sampling decision is made once per session (see Requirement 10.3) — if the session is not sampled, no metric events reach the network.
3. If the provider SDK throws during a `metrics.*` call, the `ObservabilityClient` SHALL catch the exception, log a warning to the browser console, and continue normal operation without re-throwing.
4. The `metrics` object SHALL be available on the `ObservabilityClient` interface so that consumers do not need to import provider-specific modules.
5. The no-op adapter SHALL expose a `metrics` object whose methods are all no-ops — no console output, no external calls, no thrown exceptions.
6. Metric names SHALL follow a dot-separated namespace convention (e.g. `lab.music.notes_played`) to enable grouping and filtering in the provider dashboard.

### Requirement 15: Console Error Capture

**User Story:** As a support engineer, I want `console.error` calls automatically captured as structured log events so that existing error logging in the codebase is forwarded to the observability provider without requiring code changes.

#### Acceptance Criteria

1. When log ingestion is enabled (i.e. `logSampleRate > 0` and the session is sampled), the `SentryAdapter` SHALL automatically capture `console.error` calls and forward them to the provider as structured log events at the `error` severity level.
2. Console capture SHALL be limited to `error` level only — `console.log`, `console.warn`, `console.info`, and `console.debug` SHALL NOT be automatically captured, to avoid excessive log volume.
3. Console capture SHALL be implemented via the provider SDK's native console integration (e.g. Sentry's `consoleLoggingIntegration({ levels: ['error'] })`), not via manual `console.error` monkey-patching.
4. Console capture SHALL only be active when log ingestion is enabled. When `logSampleRate` is `0` or the session is not sampled, no console interception SHALL occur.
5. The no-op adapter SHALL NOT intercept any console methods.
