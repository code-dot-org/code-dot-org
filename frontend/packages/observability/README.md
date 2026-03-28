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

| Import path                          | Contents                                                                                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@code-dot-org/observability`        | Module-level API (`logger`, `metrics`, `recordError`, `init`, `setConsented`, `isConsented`, `shutdown`), `observabilityClient` singleton, `createObservabilityClient` factory, types |
| `@code-dot-org/observability/plugin` | `observabilityPlugin` — pass to `initializeCore()`                                                                                                                |
| `@code-dot-org/observability/sentry` | `SentryAdapter`                                                                                                                                                   |
| `@code-dot-org/observability/noop`   | `NoopAdapter`                                                                                                                                                     |

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
import * as observability from '@code-dot-org/observability';

try {
  doSomething();
} catch (err) {
  observability.recordError(err, {lab: 'music', level: 42});
}
```

### Structured logging

```ts
import * as observability from '@code-dot-org/observability';

observability.logger.info('User loaded level', {lab: 'music', levelId: 42});
observability.logger.warn('Slow render detected', {durationMs: 850});
observability.logger.error('API call failed', {endpoint: '/api/levels', status: 500});
```

Log events are only forwarded to the provider when `logSampleRate > 0` and the session is sampled (decided once at init time).

### Metrics

```ts
import * as observability from '@code-dot-org/observability';

// Counter — monotonically increasing (events, clicks, API calls)
observability.metrics.count('music_lab.notes_played', 1, {instrument: 'piano'});

// Gauge — current value (queue depth, active connections)
observability.metrics.gauge('lab.active_users', 42);

// Distribution — value spread (response times, payload sizes)
observability.metrics.distribution('api.response_time_ms', 187, {endpoint: '/levels'});
```

Metric events are only forwarded when `metricsSampleRate > 0` and the session is sampled.

### Linking a session to a user (requires consent)

```ts
import * as observability from '@code-dot-org/observability';

// Call only after obtaining explicit user consent
observability.setConsented(userId);

// Check current state
if (observability.isConsented()) {
  console.log('Session linked to user');
}

// Remove linkage
observability.setConsented(null);
```

### Using the factory directly

```ts
import {createObservabilityClient} from '@code-dot-org/observability';

const client = createObservabilityClient('sentry', {
  sentry: {dsn: 'https://...'},
  sampling: {
    errorSampleRate: 1.0,
    tracesSampleRate: 0.1,
    logSampleRate: 0.5,
    metricsSampleRate: 0.5,
  },
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
    "sampling": {
      "errorSampleRate": 1.0,
      "tracesSampleRate": 0.1,
      "logSampleRate": 0.5,
      "metricsSampleRate": 0.5
    },
    "tracePropagationTargets": ["https://studio.code.org/api"]
  }
}
```

## Sampling

Log and metric sampling uses a **session-based** mechanism — the decision is made once per browser session using a deterministic hash of a UUID stored in `sessionStorage`. All events within a sampled session are forwarded; all events within an unsampled session are dropped. This prevents partial session data.

If `sessionStorage` is unavailable (e.g. private browsing), all sampling decisions default to "not sampled".

## Privacy

- No PII is transmitted by default (`sendDefaultPii: false`).
- User IDs are only linked to sessions via `setConsented(userId)`.
- Operators are responsible for reviewing each provider's data collection defaults and configuring them in accordance with the platform's privacy policy.
