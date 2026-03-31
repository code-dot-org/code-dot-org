# Observability Plugin

Provider-agnostic frontend observability for `@code-dot-org/core`. This plugin
wraps third-party SDKs such as Sentry behind a common interface so host apps
can add observability through `initializeCore({plugins: [...]})` without
coupling the rest of the app to a vendor SDK.

All sessions are anonymous by default. User-session linkage requires an
explicit `setConsented(userId)` call.

## Availability

The plugin and module-level API are available from the
`@code-dot-org/core/observability` subpath.

## Key Exports

| Import path                        | Contents                                                                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@code-dot-org/core/observability` | `observabilityPlugin`, module-level API (`logger`, `metrics`, `recordError`, `init`, `setConsented`, `isConsented`, `shutdown`), `createObservabilityClient`, types |

## Usage

### Bootstrap

Register the plugin before mounting the app:

```typescript
import {initializeCore} from '@code-dot-org/core';
import {
  observabilityPlugin,
  recordError,
} from '@code-dot-org/core/observability';

initializeCore({plugins: [observabilityPlugin]});

try {
  doSomethingRisky();
} catch (error) {
  recordError(error);
}
```

The plugin reads `config.observability` from the Rails-injected
`<meta name="app-config">` tag. When the tag is absent or `provider` is
`'none'`, the singleton remains a no-op. The Sentry adapter is loaded through a
dynamic import, so it becomes a separate bundle chunk rather than landing in
the initial core payload. Calls made after bootstrap but before that async
import completes are buffered and replayed once the provider client is ready.

### Recording errors

```typescript
import {recordError} from '@code-dot-org/core/observability';

try {
  doSomething();
} catch (error) {
  recordError(error, {lab: 'music', levelId: 42});
}
```

### Structured logging

```typescript
import {logger} from '@code-dot-org/core/observability';

logger.info('User loaded level', {lab: 'music', levelId: 42});
logger.warn('Slow render detected', {durationMs: 850});
logger.error('API call failed', {
  endpoint: '/api/levels',
  status: 500,
});
```

Log events are only forwarded to the provider when `logSampleRate > 0` and the
session is sampled.

### Metrics

```typescript
import {metrics} from '@code-dot-org/core/observability';

metrics.count('music_lab.notes_played', 1, {instrument: 'piano'});
metrics.gauge('lab.active_users', 42);
metrics.distribution('api.response_time_ms', 187, {
  endpoint: '/levels',
});
```

Metric events are only forwarded when `metricsSampleRate > 0` and the session
is sampled.

### Linking a session to a user

```typescript
import {isConsented, setConsented} from '@code-dot-org/core/observability';

setConsented(userId);

if (isConsented()) {
  console.log('Session linked to user');
}

setConsented(null);
```

Call `setConsented(userId)` only after obtaining explicit user consent.

### Using the factory directly

The factory is async because provider SDKs can be loaded dynamically for tree
shaking.

```typescript
import {createObservabilityClient} from '@code-dot-org/core/observability';

const client = await createObservabilityClient('sentry');

client.init({
  provider: 'sentry',
  sentry: {dsn: 'https://...'},
  sampling: {
    errorSampleRate: 1.0,
    tracesSampleRate: 0.1,
    logSampleRate: 0.5,
    metricsSampleRate: 0.5,
  },
  tracePropagationTargets: ['https://studio.code.org/api'],
});

client.recordError(new Error('oops'));
```

## Runtime Config Shape

The plugin expects the browser runtime config to expose an `observability`
field:

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

Log and metric sampling are session-based. The plugin stores a per-tab
observability session ID in `sessionStorage`, hashes it once, and uses that
result to decide whether the session is included for `logSampleRate` and
`metricsSampleRate`. This keeps an entire session either in or out of a sample
instead of producing partial-session data.

If `sessionStorage` is unavailable, sampling decisions default to "not
sampled".

## Privacy

- No PII is transmitted by default (`sendDefaultPii: false`).
- User IDs are only linked to sessions via `setConsented(userId)`.
- Hosts are responsible for reviewing each provider's data collection defaults
  and configuring them in accordance with the platform's privacy policy.
