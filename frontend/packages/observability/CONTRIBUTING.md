# Contributing to @code-dot-org/observability

## Adding a New Provider Adapter

Follow these steps to add support for a new observability provider (e.g. `datadog`):

### 1. Create the adapter

Add `src/adapters/datadog.ts` implementing the `ObservabilityClient` interface:

```ts
import type {ObservabilityClient, ObservabilityConfig} from '../types';

export class DatadogAdapter implements ObservabilityClient {
  init(config: ObservabilityConfig): void {
    /* ... */
  }
  recordError(error: unknown, context?: Record<string, unknown>): void {
    /* ... */
  }
  setConsented(userId: string | null): void {
    /* ... */
  }
  isConsented(): boolean {
    /* ... */
  }
  shutdown(): Promise<void> {
    /* ... */
  }
}
```

### 2. Add a new entry point in `package.json`

```json
"./datadog": {
  "types": "./dist/adapters/datadog.d.ts",
  "import": "./dist/adapters/datadog.mjs",
  "require": "./dist/adapters/datadog.cjs"
}
```

### 3. Add a new entry in `vite.config.ts`

Add `'src/adapters/datadog.ts'` to the `lib.entry` array.

### 4. Add a new case in `src/factory.ts`

```ts
if (provider === 'datadog') {
  const {DatadogAdapter} = require('./adapters/datadog');
  return new DatadogAdapter();
}
```

Also extend the `ObservabilityConfig.provider` union type in `src/types.ts`:

```ts
provider: 'sentry' | 'datadog' | 'none';
```

### 5. Write tests

Add `src/__tests__/datadog.test.ts` with unit tests and property-based tests following the same patterns as `sentry.test.ts`. Each property test must include:

```ts
// Feature: observability, Property N: <property text>
```

### 6. Update this file and README.md

Document the new provider in `README.md` and update the export table.

---

Existing host applications require **no changes** other than passing the new provider identifier to `createObservabilityClient` or via the Rails runtime config.
