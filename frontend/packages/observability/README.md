# @code-dot-org/observability

Provider-agnostic frontend observability for the code.org monorepo. Wraps third-party SDKs (Sentry) behind a common interface so host applications can swap providers without code changes.

All sessions are **anonymous by default**. User-session linkage requires an explicit `setConsented(userId)` call.

## Installation

This package is a Turborepo workspace package. Add it to your app:

```json
"@code-dot-org/observability": "workspace:*"
```

If using the Sentry adapter, also add `@sentry/browser` as a peer dependency.

## Key Exports

| Import path                          | Contents                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `@code-dot-org/observability`        | `singleton` (default), `ObservabilityClient` type, `ObservabilityConfig` type, `createObservabilityClient` factory |
| `@code-dot-org/observability/plugin` | `observabilityPlugin` — pass to `initializeCore()`                                                                 |
| `@code-dot-org/observability/sentry` | `SentryAdapter`                                                                                                    |
| `@code-dot-org/observability/noop`   | `NoopAdapter`                                                                                                      |

## Usage

### Bootstrap (Code Studio / Vite)

```ts
import {initializeCore} from '@code-dot-org/core';
import {observabilityPlugin} from '@code-dot-org/observability/plugin';

// Call before mounting the React app, browser-only
if (typeof window !== 'undefined') {
  initializeCore([observabilityPlugin]);
}
```

The plugin reads `config.observability` from the Rails-injected `<meta name="app-config">` tag. When the tag is absent or `provider` is `'none'`, the singleton stays as a no-op.

### Recording errors

```ts
import observabilityClient from '@code-dot-org/observability';

try {
  doSomething();
} catch (err) {
  observabilityClient.recordError(err, {lab: 'music', level: 42});
}
```

### Linking a session to a user (requires consent)

```ts
import observabilityClient from '@code-dot-org/observability';

// Call only after obtaining explicit user consent
observabilityClient.setConsented(userId);

// Check current state
if (observabilityClient.isConsented()) {
  console.log('Session linked to user');
}

// Remove linkage
observabilityClient.setConsented(null);
```

### Using the factory directly

```ts
import {createObservabilityClient} from '@code-dot-org/observability';

const client = createObservabilityClient('sentry', {
  sentry: {dsn: 'https://...'},
  sampling: {errorSampleRate: 1.0, tracesSampleRate: 0.1},
  tracePropagationTargets: ['https://studio.code.org/api'],
});

client.init({provider: 'sentry', sentry: {dsn: 'https://...'}});
client.recordError(new Error('oops'));
```

## Runtime Config Shape (Rails → Browser)

```json
{
  "observability": {
    "provider": "sentry",
    "sentry": {"dsn": "https://...@sentry.io/123"},
    "sampling": {"errorSampleRate": 1.0, "tracesSampleRate": 0.1},
    "tracePropagationTargets": ["https://studio.code.org/api"]
  }
}
```

## Privacy

- No PII is transmitted by default (`sendDefaultPii: false`).
- User IDs are only linked to sessions via `setConsented(userId)`.
- Operators are responsible for reviewing each provider's data collection defaults and configuring them in accordance with the platform's privacy policy.
