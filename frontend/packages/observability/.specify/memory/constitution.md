# Frontend Observability Package Constitution

> **Parent governance**: This constitution supplements the
> [Frontend Constitution](../../../.specify/memory/constitution.md). Where this document
> is silent, the frontend constitution and
> [package-conventions.md](../../../.specify/memory/package-conventions.md) apply in full.
> This document only captures rules specific to the observability package.

## Core Principles

### I. Provider-Agnostic Abstraction (NON-NEGOTIABLE)

All RUM instrumentation MUST be mediated through a single shared interface implemented
by provider-specific adapters. Host applications MUST depend only on the shared
interface — never on a provider SDK directly. Each adapter MUST be a separate entry
point so that only the selected provider's code enters the host bundle.

**Rationale**: A stable abstraction layer lets the platform add or swap RUM providers
without changes to host application code.

### II. Privacy by Default (NON-NEGOTIABLE)

All sessions MUST be anonymous by default. No personally identifiable information —
including user identifiers — may be transmitted to any RUM provider unless the user has
given explicit consent. Provider adapters MUST actively suppress any automatic PII
collection offered by the provider SDK.

**Rationale**: Code.org's privacy policy limits session data to error logging and
customer support debugging. Anonymity must be the starting state, not an opt-in.

### III. Opt-In Consent for User-Session Linkage

Associating a user identity with a RUM session MUST require an explicit, affirmative
consent action from the user. The package MUST NOT implement or enforce consent UI;
that is the host application's responsibility.

**Rationale**: Targeted troubleshooting is only permissible after a user has actively
opted in.

### IV. Instrumentation Must Not Impact App Reliability

RUM is observability infrastructure, not core functionality. Any failure in the
provider SDK — including initialization errors or runtime unavailability — MUST be
caught and handled gracefully, falling back to a no-op state without surfacing errors
to the host application.

**Rationale**: A failing RUM integration must never degrade the user-facing experience.

### V. Minimal Bundle Footprint

Beyond the standard package conventions in
[package-conventions.md](../../../.specify/memory/package-conventions.md), the
observability package MUST NOT introduce transitive dependencies into host bundles
beyond the selected provider SDK and the package itself. The package is **private and
internal** — it is never published to npm.

## Testing Standards

Every provider adapter MUST be covered by unit tests before merging. Adapter tests
MUST mock the provider SDK and MUST NOT make real network calls. See
[package-conventions.md](../../../.specify/memory/package-conventions.md) §10 for
framework and co-location rules.

## Governance

Amendment procedure, versioning policy, and compliance review follow the
[Frontend Constitution](../../../.specify/memory/constitution.md) §Governance.

**Privacy exception**: Principles II and III are stricter than the parent constitution.
They MUST NOT be relaxed without explicit product and legal review.

**Version**: 1.0.0 | **Ratified**: 2026-03-26 | **Last Amended**: 2026-03-26
