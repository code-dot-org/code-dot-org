# Contributing to the Observability Plugin

## Adding a New Provider Adapter

Follow these steps to add support for a new observability provider such as
`newrelic`.

### 1. Create the adapter

Extend `BaseAdapter` in `adapters/NewRelicAdapter.ts`. `BaseAdapter` handles
the consent queue, session ID-based sampling, and the default no-op
`logger`/`metrics` implementations, so the adapter only needs to implement the
provider-specific hooks:

```ts
import type {ObservabilityConfig} from '../types';
import {BaseAdapter} from './BaseAdapter';

export class NewRelicAdapter extends BaseAdapter {
  protected initProvider(config: ObservabilityConfig): void {
    const enableLogs = this.isLogSampled(config.sampling?.logSampleRate);

    // Initialize the provider SDK here.
    // Wire up this.logger and this.metrics after the SDK is ready.
  }

  protected applyConsentToProvider(userId: string | null): void {
    // Call the SDK's user-identification API here.
  }

  recordError(error: unknown, context?: Record<string, unknown>): void {
    if (!this.initialized) {
      return;
    }

    // Call the SDK's error capture API here.
  }

  async shutdown(): Promise<void> {
    // Flush and tear down the SDK here.
  }
}
```

### 2. Extend the provider type

Update `provider` in `types.ts`:

```ts
provider: 'sentry' | 'newrelic' | 'none';
```

Add any provider-specific config fields needed by the adapter.

### 3. Add a factory case

Update `factory.ts` so the new provider is dynamically imported:

```ts
if (provider === 'newrelic') {
  const {NewRelicAdapter} = await import('./adapters/NewRelicAdapter');
  return new NewRelicAdapter();
}
```

This preserves tree shaking and keeps provider SDK code out of the initial core
bundle.

### 4. Export the code in the core build

If the new provider needs additional public exports, update:

- `frontend/packages/core/package.json`
- `frontend/packages/core/vite.config.ts`
- `frontend/packages/core/src/plugins/observability/index.ts`

Most providers only need the factory case and types update, because the public
entry point remains `@code-dot-org/core/observability`.

### 5. Write tests

Add unit tests under `__tests__/` following the same patterns as the existing
observability tests. Cover at minimum:

- `recordError` forwarding to the provider
- provider errors during `recordError` being swallowed
- consent round-trip behavior
- config pass-through
- init failure degrading gracefully
- session-based `enableLogs` and `enableMetrics` behavior

### 6. Update docs

Update:

- `README.md` in this directory
- this `CONTRIBUTING.md`
- any higher-level core docs that describe the plugin's public behavior

Host applications should not need code changes beyond supplying the new
provider in runtime config or calling `createObservabilityClient(newProvider)`.
