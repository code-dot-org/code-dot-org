---
inclusion: auto
name: singleton-services
description: Convention for shared singleton services in the frontend monorepo. Use when creating or consuming shared stateful services (observability, analytics, feature flags, etc.) across packages and labs.
fileMatchPattern: ["packages/*/*", "packages/labs/*/*", "apps/*/*"]
---

# Singleton Services Convention

Applies to any stateful service that must be initialized once by the host application and shared across all packages and labs without multiple instantiations.

## The Pattern

Shared services follow a plugin pattern built on top of `@code-dot-org/core`:

1. **The service package** owns its own module-level singleton (default export), starting as a no-op.
2. **The service package** also exports a `CorePlugin` implementation (e.g. `observabilityPlugin`) that reads `SiteConfig` and initializes the singleton when called.
3. **`initializeCore(plugins)`** in `@code-dot-org/core` is the single bootstrap function. The host app passes whichever plugins it wants — services not passed are never bundled.
4. **Packages and labs** import the singleton directly from the service package — they never call the factory or plugin themselves.

This keeps `@code-dot-org/core` lean and service-agnostic. Adding or removing a service requires no changes to core.

## `CorePlugin` Interface (defined in `@code-dot-org/core`)

```ts
export interface CorePlugin {
  /** Called by initializeCore with the full SiteConfig after core is ready */
  onCoreReady(config: SiteConfig): void;
}
```

## `initializeCore` (defined in `@code-dot-org/core`)

```ts
export function initializeCore(plugins: CorePlugin[] = []): void {
  if (!window.__CODE_STUDIO__) {
    window.__CODE_STUDIO__ = CodeStudioConfig;
  }
  for (const plugin of plugins) {
    plugin.onCoreReady(CodeStudioConfig);
  }
}
```

## Example: Observability

```ts
// packages/observability/src/index.ts — the singleton
import {NoopAdapter} from './adapters/noop';
let _client: ObservabilityClient = new NoopAdapter();
export default {
  recordError: (...args) => _client.recordError(...args),
  setConsented: (...args) => _client.setConsented(...args),
  isConsented: () => _client.isConsented(),
  init: (...args) => _client.init(...args),
  shutdown: () => _client.shutdown(),
  /** @internal */ _set(c: ObservabilityClient) { _client = c; },
} satisfies ObservabilityClient & {_set(c: ObservabilityClient): void};
```

```ts
// packages/observability/src/plugin.ts — the CorePlugin
export const observabilityPlugin: CorePlugin = {
  onCoreReady(config) {
    const obs = config.observability;
    if (obs.provider === 'none') return;
    const client = createObservabilityClient(obs.provider, obs);
    client.init(obs);
    ObservabilityClientSingleton._set(client);
  },
};
```

```ts
// Host app bootstrap — opt in by passing the plugin
import {initializeCore} from '@code-dot-org/core';
import {observabilityPlugin} from '@code-dot-org/observability/plugin';
initializeCore([observabilityPlugin]);
```

```ts
// Any lab or package — just import the singleton
import ObservabilityClient from '@code-dot-org/observability';
ObservabilityClient.recordError(err, {lab: 'music'});
```

## Rules

- **Only the plugin's `onCoreReady` calls the factory.** Labs and packages MUST NOT call service factories directly.
- **Singletons start as no-ops.** Calls made before `initializeCore` are silently dropped — safe by design.
- **One `initializeCore` call per page load.** Calling it multiple times is a no-op for already-initialized services.
- **`_set` is internal.** Only the plugin calls `_set`. All other consumers use the public interface methods.
- **Core stays service-agnostic.** Do NOT add service-specific logic to `initializeCore` or `@code-dot-org/core`. Use the plugin pattern instead.

## Adding a New Singleton Service

1. Create the service package at `frontend/packages/<service>/` following package conventions.
2. Add a no-op default implementation and export it as the default from `src/index.ts`.
3. Add `src/plugin.ts` exporting a `CorePlugin` that reads `SiteConfig` and initializes the singleton.
4. Add `"./plugin"` to the package's `package.json` exports.
5. Document usage in the package `README.md`.
6. The host app opts in by importing the plugin and passing it to `initializeCore([...])`.
