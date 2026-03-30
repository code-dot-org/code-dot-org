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
```

The result is exported as `CodeStudioConfig` (named) and as the module default.

**`DashboardApiClient`** ([`src/api/dashboard/SingletonDashboardApiClient.ts`](../src/api/dashboard/SingletonDashboardApiClient.ts))

```
import time
   └─ createDashboardApiClient(ky.extend({ prefixUrl, credentials }))
        └─ reads CodeStudioConfig.environment
```

The `ky` instance — including `prefixUrl` and whether credentials are sent — is fixed at module load. It cannot be reconfigured at runtime. This is why `./api` is a separate sub-path export: consumers that only need config should not pay to load the HTTP client.

**`localization`** ([`src/localization/Localization.ts`](../src/localization/Localization.ts))

EventEmitter-based singleton that integrates with the LocalizeJS third-party library. Emits `change` when the locale switches. `useLocalization()` subscribes to this event.

## Boot sequence

Apps must call `initializeCodeStudioConfig()` before rendering:

```
initializeCodeStudioConfig()
   └─ if (!window.__CODE_STUDIO__)
        window.__CODE_STUDIO__ = CodeStudioConfig   ← registers on window
```

This is only needed for code that accesses `window.__CODE_STUDIO__` directly (e.g. Rails-rendered inline scripts). Code that imports `CodeStudioConfig` directly from this package does not need it.

## Constraints and failure modes

| Constraint                                           | What breaks                                                |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| All three singletons read `window` at import time    | Throws in Node/SSR; do not import this package server-side |
| `DashboardApiClient` environment is frozen at import | Changing hostname after load has no effect on API routing  |
| `initializeCodeStudioConfig()` is idempotent         | Safe to call multiple times; subsequent calls are no-ops   |

## What to update when the design changes

See [AGENTS.md](../AGENTS.md) for update triggers.
