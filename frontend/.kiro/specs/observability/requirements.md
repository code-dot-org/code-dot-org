# Requirements Document

## Introduction

This feature introduces Real User Monitoring (RUM) instrumentation across the frontend. A new shared package, `frontend/packages/observability`, will provide a provider-agnostic RUM abstraction. Host applications consume this package and select their desired RUM provider (New Relic, Datadog, Sentry, or none) at initialization time.

The package follows the conventions established in the [frontend package conventions spec](../frontend-package-conventions/requirements.md).

All instrumentation must comply with the platform's privacy policy: session data is limited to error logging and customer support debugging, no provider session identifier is linked to an application user identifier by default, and user-session linkage requires explicit user consent.

## Glossary

- `observability package`: The new `frontend/packages/observability` library.
- `RUM provider`: A third-party Real User Monitoring service (New Relic, Datadog, Sentry) or the no-op "none" option.
- `provider adapter`: A module inside the observability package that wraps a specific RUM provider SDK and implements the common `RumClient` interface.
- `RumClient`: The common interface exported by the observability package that all provider adapters implement.
- `host application`: A frontend application that consumes the observability package — either `apps/` (webpack 5) or Code Studio (`frontend/apps/studio`, Vite).
- `session ID`: The opaque session identifier assigned by the active RUM provider for the current browser session.
- `user ID`: The application-level identifier for an authenticated user.
- `consent`: Explicit, affirmative user action granting permission to link a session ID to a user ID for troubleshooting purposes.
- `no-op adapter`: A provider adapter that performs no instrumentation, used when the selected provider is `'none'`.

---

## Requirements

### Requirement 1: Observability Package Structure

**User Story:** As a frontend engineer, I want a single shared observability package so that RUM instrumentation logic is not duplicated across host applications.

#### Acceptance Criteria

1. The observability package SHALL export a `RumClient` interface with at minimum the following operations: `init`, `recordError`, `setConsented`, and `shutdown`.
2. The observability package SHALL be built following the conventions in the [frontend package conventions spec](../frontend-package-conventions/requirements.md) — Vite library mode, externalized dependencies, ESM + CJS outputs, and TypeScript declarations.
3. The observability package SHALL be registered as a Turborepo workspace package under `frontend/packages/observability` and covered by the `"packages/*"` glob in `frontend/package.json`.
4. The observability package SHALL export TypeScript type declarations alongside its compiled output.
5. When the observability package is imported by a host application, it SHALL NOT bundle any RUM provider SDK directly; each provider adapter SHALL be a separate entry point so that only the selected provider's code is included in the host bundle.

### Requirement 2: Provider Adapter Selection

**User Story:** As a frontend engineer, I want to select the RUM provider at initialization time so that different environments or deployments can use different providers without code changes.

#### Acceptance Criteria

1. The observability package SHALL provide a `createRumClient(provider, config)` factory function that accepts a provider identifier (`'newrelic' | 'datadog' | 'sentry' | 'none'`) and a provider-specific configuration object, and returns a `RumClient` instance.
2. When `provider` is `'none'`, `createRumClient` SHALL return a no-op adapter that satisfies the `RumClient` interface and performs no external calls.
3. When `provider` is an unrecognized value, `createRumClient` SHALL throw a descriptive `Error` identifying the unsupported provider value.
4. The host application SHALL supply the provider identifier and configuration at application startup, before any instrumented user interactions occur.
5. Where a host application does not call `createRumClient`, the observability package SHALL NOT initialize any RUM provider SDK or transmit any data.

### Requirement 3: Error Recording

**User Story:** As a support engineer, I want unhandled errors and explicit error reports captured by RUM so that I can diagnose production issues without linking them to specific users by default.

#### Acceptance Criteria

1. When `RumClient.recordError(error, context)` is called, the `RumClient` SHALL forward the error and context metadata to the active RUM provider.
2. When an unhandled JavaScript exception occurs in the browser, the `RumClient` SHALL automatically capture and forward the error to the active RUM provider, provided `init` has been called.
3. When an unhandled Promise rejection occurs in the browser, the `RumClient` SHALL automatically capture and forward the rejection reason to the active RUM provider, provided `init` has been called.
4. If the active RUM provider SDK throws during error recording, the `RumClient` SHALL catch the exception, log a warning to the browser console, and continue normal operation without re-throwing.
5. The `RumClient` SHALL record only error-level data and session metadata; it SHALL NOT record user interaction replays, DOM snapshots, or network request payloads unless explicitly enabled by a future requirement.

### Requirement 4: Privacy — Default Anonymous Sessions

**User Story:** As a privacy-conscious product owner, I want RUM sessions to be anonymous by default so that no recorded session can be tied back to a specific user without their consent.

#### Acceptance Criteria

1. The `RumClient` SHALL NOT transmit the user ID or any personally identifiable information to the RUM provider during normal session operation.
2. When `RumClient.init` is called, the `RumClient` SHALL configure the active RUM provider to operate in anonymous mode, disabling any automatic user identification features provided by the RUM provider SDK.
3. The `RumClient` SHALL NOT link the session ID to the user ID unless `RumClient.setConsented(userId)` has been explicitly called.
4. If the RUM provider SDK automatically collects PII (e.g., IP address beyond what is required for session routing), the `RumClient` SHALL configure the SDK to suppress or mask that collection where the SDK provides such a configuration option.
5. The observability package documentation SHALL state that operators are responsible for reviewing each RUM provider's data collection defaults and configuring them in accordance with the platform's privacy policy.

### Requirement 5: Privacy — Opt-In User-Session Linkage

**User Story:** As a support engineer, I want to link a session to a specific user only when that user has given explicit consent so that I can assist with targeted troubleshooting while respecting user privacy.

#### Acceptance Criteria

1. When `RumClient.setConsented(userId)` is called, the `RumClient` SHALL associate the provided user ID with the current session ID in the active RUM provider.
2. When `RumClient.setConsented(userId)` is called with a null or empty `userId`, the `RumClient` SHALL remove any previously set user association from the active RUM provider session.
3. The host application SHALL call `RumClient.setConsented(userId)` only after obtaining explicit user consent through a consent mechanism; the observability package SHALL NOT implement or enforce the consent UI itself.
4. If `RumClient.setConsented` is called before `RumClient.init`, the `RumClient` SHALL queue the association and apply it once `init` completes.
5. The `RumClient` SHALL expose an `isConsented()` method that returns a boolean indicating whether a user ID is currently associated with the active session.

### Requirement 6: Integration with Code Studio (Vite)

**User Story:** As a frontend engineer, I want the observability package integrated into Code Studio using Vite best practices so that RUM is available in the newer frontend.

#### Acceptance Criteria

1. Code Studio SHALL import the observability package as a standard ES module dependency and call `createRumClient` during application bootstrap.
2. Where Code Studio enables SSR in the future, the `RumClient.init` call SHALL be guarded to execute only in browser environments (i.e., where `typeof window !== 'undefined'`).
3. The Code Studio integration SHALL configure the RUM provider using runtime values injected by Rails into the `<meta name="app-config">` tag. In production, this tag is rendered by `dashboard/app/views/app/index.html.haml` (not `frontend/apps/studio/index.html`) using values from the `CDO` object, which is populated from `config/*.yml.erb`. The Vite development `index.html` SHALL NOT include a hardcoded `<meta name="app-config">` tag; the no-op provider is the correct default when no tag is present.
4. If the RUM provider SDK is not available at runtime (e.g., blocked by an ad blocker), the `RumClient` SHALL catch the initialization failure, log a warning, and fall back to no-op adapter behavior.
5. The Code Studio integration SHALL NOT increase the initial JavaScript bundle size beyond the size of the selected RUM provider SDK plus the observability package itself (i.e., no unintended transitive dependencies shall be bundled).

### Requirement 7: Portability and Extensibility

**User Story:** As a frontend engineer, I want the observability abstraction to be portable so that any future host application in the monorepo can adopt RUM with minimal effort.

#### Acceptance Criteria

1. The `RumClient` interface SHALL be defined in TypeScript and exported from the observability package's public API so that any host application can type-check its usage.
2. The observability package SHALL document the steps required to add a new provider adapter in a `CONTRIBUTING.md` or inline code comments.
3. When a new provider adapter is added to the observability package, existing host applications SHALL require no changes to their integration code other than passing the new provider identifier to `createRumClient`.
4. The observability package SHALL include unit tests for the `createRumClient` factory, the no-op adapter, and the `setConsented` / `isConsented` logic, runnable via `yarn test` in the `frontend/` workspace.
5. The observability package build SHALL be integrated into the Turborepo pipeline so that `turbo build` in `frontend/` produces the compiled package output.
