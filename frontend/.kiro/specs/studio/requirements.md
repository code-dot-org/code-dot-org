# Requirements Document

## Introduction

This document defines the conventions and architecture for the `frontend/apps/studio` Vite application — how it is structured, how it integrates with Rails in production, and how it runs standalone without Rails during development.

The goal is a clean separation between the Vite frontend and the Rails backend, with a minimal, well-defined coupling surface that can be removed entirely in the future if the app moves to a fully standalone deployment.

## Glossary

- **Studio App**: The Vite/React application at `frontend/apps/studio`, served by Rails via `vite-plugin-rails` in production and run standalone via `yarn dev` in development.
- **Rails Mode**: The app is served by Rails, with `index.html` replaced by a Rails ERB/HAML template (`dashboard/app/views/apps/index.html.haml`) that injects runtime config.
- **Standalone Mode**: The app is served directly by the Vite dev server using the static `frontend/apps/studio/index.html`, with no Rails process required.
- **Config Meta Tag**: A `<meta name="app-config">` tag in the HTML entry point whose `content` attribute carries a JSON-serialized runtime config object.
- **`SiteConfig`**: The unified config class from `@code-dot-org/core` that combines hostname-derived values (environment, brand, API URL) with Rails-injected runtime values (observability tokens, app version). The single config object for the whole app.
- **Runtime Config**: Values that vary by deployment environment and are not known at Vite build time — e.g. API tokens, feature flags, service URLs sourced from `config/*.yml.erb` via the `CDO` Ruby object.

---

## Requirements

### Requirement 1: Standalone Development Mode

**User Story:** As a frontend engineer, I want to run the Studio app with `yarn dev` without starting Rails so that I can develop and test the frontend independently.

#### Acceptance Criteria

1. Running `yarn dev` from `frontend/apps/studio/` SHALL start the Vite dev server and serve a fully functional application without any Rails process running.
2. The `frontend/apps/studio/index.html` SHALL be the authoritative standalone entry point and SHALL contain all markup needed to bootstrap the app in Standalone Mode.
3. The `index.html` SHALL include a `<meta name="app-config">` tag with development-safe placeholder values so `SiteConfig` initializes identically in both Standalone and Rails Mode.
4. Sensitive values (tokens, keys) in the standalone `index.html` SHALL be empty strings or clearly marked placeholder values — never real credentials.
5. A `.env.development` file MAY be used to override individual config values during local development as a secondary fallback after the meta tag.

### Requirement 2: Rails Integration

**User Story:** As a frontend engineer, I want the Studio app to integrate with Rails in production via a minimal, well-defined coupling point so that the HAML template stays clean and the coupling surface is small.

#### Acceptance Criteria

1. In Rails Mode, the app SHALL be served via `vite-plugin-rails` / `vite-ruby`, which replaces `index.html` with the Rails-rendered template.
2. Runtime config SHALL be delivered via a single `<meta name="app-config" content="...">` tag in the Rails template, where `content` is a JSON-serialized object matching the shape `SiteConfig` reads from the meta tag.
3. The Rails template SHALL render the meta tag using values from the `CDO` Ruby config object, sourced from `config/*.yml.erb`.
4. The Rails template (`dashboard/app/views/apps/index.html.haml`) SHALL contain no other JavaScript config injection — no inline `<script>` blocks, no `window.*` assignments, no `data-` attributes for config.
5. The Rails template SHALL be kept as minimal as possible, containing only what cannot be expressed in the Vite app itself.

### Requirement 3: `SiteConfig` Extension for Rails-Injected Values

**User Story:** As a frontend engineer, I want `SiteConfig` from `@code-dot-org/core` to be the single config object for the app so that both hostname-derived and Rails-injected values are accessible in one place.

#### Acceptance Criteria

1. `SiteConfig` SHALL be extended to read the `<meta name="app-config">` tag during construction and populate an `observability` sub-object alongside its existing hostname-derived fields.
2. The `observability` sub-object SHALL have the following shape, consumed by the [Observability spec](../observability/requirements.md):
   ```ts
   observability: {
     provider: 'sentry' | 'none';
     sentry?: { dsn: string };
   }
   ```
   - `provider` SHALL default to `'none'` when the meta tag is absent or the field is missing.
   - `sentry.dsn` is sourced from `CDO.frontend_studio_sentry_dsn` for the Studio app and `CDO.frontend_apps_sentry_dsn` for the apps/ bundle.
3. `SiteConfig` SHALL also expose `appVersion?: string` sourced from the meta tag.
4. If the `<meta name="app-config">` tag is absent or its content is not valid JSON, `SiteConfig` SHALL use safe defaults (e.g. `provider: 'none'`) rather than throwing.
5. All modules in the app SHALL access config via the existing `CodeStudioConfig` singleton from `@code-dot-org/core` — never directly from `document.querySelector`, `window` globals, or `import.meta.env`.

### Requirement 4: Transition Path to Full Standalone

**User Story:** As a frontend engineer, I want the config pattern designed so that Rails can be removed as a config source in the future without changing any consuming code.

#### Acceptance Criteria

1. The meta tag fields read by `SiteConfig` SHALL be defined as a plain TypeScript interface (`RuntimeConfig`) so the shape is explicit and can be sourced from alternative mechanisms in the future.
2. Transitioning from meta tag to env vars SHALL require modifying only `SiteConfig`'s construction logic — no other files in the app SHALL need to change.
3. The meta tag approach and the `import.meta.env` approach SHALL be interchangeable at the `SiteConfig` construction level.
