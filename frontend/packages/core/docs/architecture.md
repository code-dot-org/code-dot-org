# @code-dot-org/core — Architecture

This package is intended for import in first-party Code.org web applications and frontends only. It is browser-only and not compatible with Node.js or SSR environments.

## Singletons instantiated at module load

Three singletons are created the moment their module is first imported — not lazily:

**`CodeStudioConfig`** ([`src/config/SiteConfig.ts`](../src/config/SiteConfig.ts))

```
import time
   └─ new SiteConfig()
        ├─ parse(window.location.hostname)   ← browser-only
        ├─ getBrandFromHostname(host)
        ├─ getEnvironmentFromHostname()
        └─ getDashboardApiUrl(environment)
        └─ parse <meta name="app-config"> observability JSON
```

The result is exported as `CodeStudioConfig` (named) and as the module default.

**`DashboardApiClient`** ([`src/api/dashboard/SingletonDashboardApiClient.ts`](../src/api/dashboard/SingletonDashboardApiClient.ts))

```
import time
   └─ createDashboardApiClient(ky.extend({ prefixUrl, credentials }))
        └─ reads CodeStudioConfig.environment
```

The `ky` instance — including `prefixUrl` and whether credentials are sent — is fixed at module load. It cannot be reconfigured at runtime. This is why `./api` is a separate sub-path export: consumers that only need config should not pay to load the HTTP client.

**`localization`** ([`src/plugins/localization/Localization.ts`](../src/plugins/localization/Localization.ts))

EventEmitter-based singleton that integrates with the LocalizeJS third-party library. Emits `change` when the locale switches. `useLocalization()` subscribes to this event. Available via the `@code-dot-org/core/localization` sub-path export.

**`observability`** ([`src/plugins/observability/index.ts`](../src/plugins/observability/index.ts))

Module-level singleton API backed by a no-op client until `observabilityPlugin`
initializes the configured provider. Available via the
`@code-dot-org/core/observability` sub-path export. During boot, the plugin
installs a deferred adapter synchronously so module-level calls made
immediately after `initializeCore()` are buffered while the async factory
dynamically imports the Sentry adapter. Log and metric sampling are
session-based via an observability-owned session ID stored in `sessionStorage`.

## Plugin model

Plugins are optional extensions registered at bootstrap via `initializeCore`. They implement `CorePlugin`:

```typescript
export interface CorePlugin {
  onCoreReady(config: SiteConfig & SiteConfigExtensions): void;
}
```

`SiteConfigExtensions` is an empty interface that plugins extend via TypeScript module augmentation, allowing them to add typed fields to `SiteConfig` without modifying core. Concrete fields that core itself parses and owns, such as `SiteConfig.observability`, should be typed directly on `SiteConfig` rather than routed through `SiteConfigExtensions`. `SiteConfig.observability` is normalized to `{provider: 'none'}` when the underlying runtime config is absent.

Plugins live in `src/plugins/` and are exposed as sub-path exports (e.g. `@code-dot-org/core/localization`, `@code-dot-org/core/observability`). The main `src/index.ts` does **not** re-export plugin sub-paths — consumers must import them explicitly. This ensures plugins are excluded from the bundle when not used.

## Boot sequence

Apps must call `initializeCore()` before rendering:

```
 initializeCore({plugins: [pluginA, pluginB, ...]})
   ├─ if (!window.__CODE_STUDIO__)
   │    window.__CODE_STUDIO__ = CodeStudioConfig   ← registers on window
   └─ for each plugin: plugin.onCoreReady(CodeStudioConfig)
```

`initializeCodeStudioConfig()` is a backward-compatible alias for `initializeCore({})`.

This is only needed for code that accesses `window.__CODE_STUDIO__` directly (e.g. Rails-rendered inline scripts). Code that imports `CodeStudioConfig` directly from this package does not need it.

## Constraints and failure modes

| Constraint                                           | What breaks                                                |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| All three singletons read `window` at import time    | Throws in Node/SSR; do not import this package server-side |
| `DashboardApiClient` environment is frozen at import | Changing hostname after load has no effect on API routing  |
| `initializeCore()` is idempotent                     | Safe to call multiple times; subsequent calls are no-ops   |
| Main `index.ts` must not re-export plugin sub-paths  | Re-exporting would defeat sub-path tree-shaking            |

## What to update when the design changes

See [AGENTS.md](../AGENTS.md) for update triggers.
