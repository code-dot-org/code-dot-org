# Contributing to @code-dot-org/observability

## Adding a New Provider Adapter

Follow these steps to add support for a new observability provider (e.g. `newrelic`):

### 1. Create the adapter

Extend `BaseAdapter` in `src/adapters/newrelic.ts`. `BaseAdapter` handles the consent queue, session ID-based sampling, and the `logger`/`metrics` no-op defaults — your adapter only needs to implement the provider-specific hooks:

```ts
import type {ObservabilityConfig} from '../types';
import {BaseAdapter} from './base';

export class NewRelicAdapter extends BaseAdapter {
  protected initProvider(config: ObservabilityConfig): void {
    // Initialize the provider SDK here.
    // isLogSampled() and isMetricsSampled() are already available —
    // BaseAdapter resolves the session ID before calling initProvider.
    const enableLogs = this.isLogSampled(config.sampling?.logSampleRate);
    // ... call SDK init with enableLogs, etc.

    // Wire up this.logger and this.metrics to the live SDK after init:
    this.logger = { /* delegate to SDK logger */ };
    this.metrics = { /* delegate to SDK metrics */ };
  }

  protected applyConsentToProvider(userId: string | null): void {
    // Call the SDK's user-identification API
  }

  recordError(error: unknown, context?: Record<string, unknown>): void {
    if (!this.initialized) return;
    // Call the SDK's error capture API
  }

  async shutdown(): Promise<void> {
    // Flush and tear down the SDK
  }
}
```

### 2. Add a new entry point in `package.json`

```json
"./newrelic": {
  "types": "./dist/adapters/newrelic.d.ts",
  "import": "./dist/adapters/newrelic.mjs",
  "require": "./dist/adapters/newrelic.cjs"
}
```

### 3. Add a new entry in `vite.config.ts`

Add `'src/adapters/newrelic.ts'` to the `lib.entry` array.

### 4. Add a new case in `src/factory.ts`

```ts
if (provider === 'newrelic') {
  const {NewRelicAdapter} = await import('./adapters/newrelic');
  return new NewRelicAdapter();
}
```

Also extend the `ObservabilityConfig.provider` union type in `src/types.ts`:

```ts
provider: 'sentry' | 'newrelic' | 'none';
```

### 5. Write tests

Add `src/__tests__/newrelic.test.ts` with unit tests and property-based tests following the same patterns as `sentry.test.ts`. Each property test must include:

```ts
// Feature: observability, Property N: <property text>
```

Cover at minimum:
- `recordError` forwards to the SDK (Property 3 equivalent)
- SDK errors during `recordError` are swallowed (Property 4)
- Consent round-trip (Property 5)
- Config pass-through (Property 6)
- Init failure degrades gracefully (Property 8)
- `enableLogs`/`enableMetrics` reflect session sampling at init (Property 10)

### 6. Update README.md and this file

Document the new provider in `README.md` and update the export table.

---

Existing host applications require **no changes** other than passing the new provider identifier to `createObservabilityClient` or via the Rails runtime config.
