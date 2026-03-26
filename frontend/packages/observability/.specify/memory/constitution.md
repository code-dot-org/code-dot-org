# Frontend Observability Package Constitution

> **Parent governance**: This constitution supplements the
> [Frontend Constitution](../../../.specify/memory/constitution.md). Where this document
> is silent, the frontend constitution and
> [package-conventions.md](../../../.specify/memory/package-conventions.md) apply in full.
> This document only captures rules specific to the observability package.

## Core Principles

### I. Provider-Agnostic Abstraction (NON-NEGOTIABLE)

The observability package MUST expose a single `RumClient` TypeScript interface as its
public contract. All provider adapters MUST implement this interface. Host applications
MUST interact only with `RumClient` — never with a provider SDK directly.

- `createRumClient(provider, config)` MUST accept
  `'sentry' | 'none'` as the provider identifier.
- Each provider adapter MUST be a separate entry point so that only the selected
  provider's code is included in the host bundle.
- The package MUST NOT bundle any RUM provider SDK in its main entry point.
- When `provider` is `'none'`, the factory MUST return a no-op adapter that fully
  satisfies `RumClient` and performs no external calls.
- When `provider` is unrecognized, the factory MUST throw a descriptive `Error`.
- When no host application calls `createRumClient`, the package MUST NOT initialize
  any RUM provider SDK or transmit any data.

**Rationale**: A single abstraction layer lets the platform swap or add RUM providers
without requiring changes to host application integration code.

### II. Privacy by Default (NON-NEGOTIABLE)

RUM sessions MUST be anonymous unless the user has given explicit consent.

- `RumClient.init` MUST configure the active RUM provider in anonymous mode, disabling
  any automatic user-identification features the provider SDK offers.
- The `RumClient` MUST NOT transmit a user ID or any personally identifiable information
  to the RUM provider during normal session operation.
- The `RumClient` MUST NOT link the session ID to the user ID unless
  `RumClient.setConsented(userId)` has been explicitly called.
- Where a provider SDK automatically collects PII beyond session routing (e.g., full IP),
  the adapter MUST configure the SDK to suppress or mask that collection if the SDK
  exposes such an option.
- Package documentation MUST state that operators are responsible for reviewing each
  provider's data-collection defaults against the platform's privacy policy.

**Rationale**: Code.org's privacy policy limits session data to error logging and
customer support debugging. Anonymous-by-default prevents accidental PII exposure.

### III. Opt-In User-Session Linkage

User-session linkage MUST require explicit, affirmative user consent.

- `RumClient.setConsented(userId)` MUST associate the user ID with the current session
  when called with a non-empty `userId`.
- `RumClient.setConsented(null | '')` MUST remove any previously set user association.
- If `setConsented` is called before `init` completes, the client MUST queue the
  association and apply it once `init` finishes.
- `RumClient.isConsented()` MUST return a boolean indicating whether a user ID is
  currently linked to the active session.
- The package MUST NOT implement or enforce consent UI; that responsibility belongs to
  the host application.

**Rationale**: Targeted troubleshooting is only permissible after a user has actively
opted in, per the platform's privacy policy.

### IV. Error Resilience & Graceful Degradation

The `RumClient` MUST never allow RUM instrumentation failures to affect host application
functionality.

- If the provider SDK throws during error recording or initialization, the `RumClient`
  MUST catch the exception, log a warning to the browser console, and continue without
  re-throwing.
- If the provider SDK is unavailable at runtime (e.g., blocked by an ad blocker),
  `init` MUST catch the failure, log a warning, and fall back to no-op adapter behavior.
- `RumClient.init` MUST be safe to call in SSR environments; browser-only operations
  MUST be guarded with `typeof window !== 'undefined'`.
- The `RumClient` MUST record only error-level data and session metadata. It MUST NOT
  record user interaction replays, DOM snapshots, or network request payloads unless
  explicitly enabled by a future requirement.

**Rationale**: RUM is observability infrastructure. A failing RUM SDK must never
degrade the user-facing experience.

### V. Minimal Bundle Footprint

Beyond the standard package conventions in
[package-conventions.md](../../../.specify/memory/package-conventions.md), the following
observability-specific constraint applies:

- A host application's integration MUST NOT increase initial bundle size beyond the
  size of the selected RUM provider SDK plus the observability package itself. No
  unintended transitive dependencies shall be bundled.
- This package is **private and internal** — `"version"` is fixed at `"0.0.0"` and the
  package is never published to npm.

## Testing Standards

Unit tests MUST cover the following scenarios (per
[package-conventions.md](../../../.specify/memory/package-conventions.md) §10 for
framework and co-location rules):

- `createRumClient` factory — all recognized provider identifiers plus unknown values.
- No-op adapter — all `RumClient` methods.
- `setConsented` / `isConsented` consent lifecycle, including the pre-`init` queuing
  behavior.

Provider adapter tests MUST mock the provider SDK and MUST NOT make real network calls.
New provider adapters MUST ship with unit tests before merging.

## Governance

Amendment procedure, versioning policy, and compliance review follow the
[Frontend Constitution](../../../.specify/memory/constitution.md) §Governance.

**Privacy exception**: The privacy and consent principles (II and III) are stricter
than the parent constitution. They MUST NOT be relaxed without explicit product and
legal review.

**Version**: 1.0.0 | **Ratified**: 2026-03-26 | **Last Amended**: 2026-03-26
