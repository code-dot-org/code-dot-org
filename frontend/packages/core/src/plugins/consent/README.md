# Consent Plugin

Provider-independent browser cookie consent for `@code-dot-org/core`. This
plugin wraps a CMP (OneTrust today) behind a `ConsentSource` contract so host
apps can read consent through `initializeCore({plugins: [...]})` without the
rest of the app knowing which CMP is in play.

## Availability

The plugin and module-level API are available from the
`@code-dot-org/core/plugins/consent` subpath.

## Key Exports

| Import path                          | Contents                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `@code-dot-org/core/plugins/consent` | `consentPlugin`, `consent`, `useConsent`, `ConsentCategory`/`ConsentState`/`ConsentSource` types |

## Usage

### Bootstrap

```typescript
import {initializeCore} from '@code-dot-org/core';
import {consentPlugin} from '@code-dot-org/core/plugins/consent';

initializeCore({plugins: [consentPlugin]});
```

### Reading consent

```typescript
import {consent} from '@code-dot-org/core/plugins/consent';

if (consent.current().categories.has('performance')) {
  // performance cookies are consented
}

const unsubscribe = consent.subscribe(state => {
  // called on every state change
});
```

### In a component

```typescript
import {useConsent} from '@code-dot-org/core/plugins/consent';

function Component() {
  const state = useConsent();
  const hasPerformance = state.categories.has('performance');
  return <div>{hasPerformance ? 'tracked' : 'not tracked'}</div>;
}
```

## Host pages own OneTrust loading

The plugin never injects scripts. Host pages load OneTrust before the bundle
so auto-block runs first, and define `window.oneTrustPromise` (resolved by
`OptanonWrapper`): legacy `apps/` pages and the Studio Rails shell render
the shared partial via `render_shared_haml 'onetrust_cookie_scripts'`. At
`onCoreReady` the plugin adopts the existing promise and
`OnetrustActiveGroups`, picking up mid-session changes via
`OneTrust.OnConsentChanged` when the SDK exposes it. A host page without
the tags has no OneTrust by design; the store stays at its default state.

Standalone Studio's `index.html` carries no OneTrust for now: the Rails
shell is the consent surface, and a standalone (non-Rails) deployment
reports the default state — compliant, but banner-less. Generalizing
OneTrust loading for standalone deployments is deliberate tech-debt
follow-up work. The sticking point is that OneTrust requires absolute
script URLs: its stub derives the asset base from the raw `src` attribute,
and the Rails partial satisfies this with
`#{scheme}://#{host_with_port}/onetrust/...` built from the live request.
Static HTML cannot know its host, so standalone tags need a serve-time
rewrite (and `vite-ignore`, or Vite prepends the `/frontend-studio` base
and the requests hit the dev server's SPA fallback instead of 404ing).

Note on ad blockers: OneTrust's scripts are common blocklist entries even
same-origin. A blocked or unresolved `oneTrustPromise` just leaves the
store at its default state; nothing awaits the promise, so nothing hangs.

CMP vocabulary (OneTrust globals, `C000x` group codes) is confined to
`providers/onetrust/`. Every other file in this plugin speaks only the
semantic categories in `ConsentCategory`.

## Default state

Before the plugin is registered, or when it resolves to no CMP, `consent`
reports `strictly-necessary` only and `subscribe` never fires (deny until
a CMP reports otherwise). Consumers are written once against the module
and behave correctly with no CMP present (standalone dev, unit tests):
optional categories read as not consented.

## Settlement

`categories` answers "what did the CMP say". A consumer that must not act
before consent is known needs the other question — "has the CMP finished
saying it" — which lives in `settled.ts`:

```typescript
import {
  isConsentSettled,
  whenConsentSettled,
} from '@code-dot-org/core/plugins/consent';
```

Settled means the wait is over, not that anything was granted. The plugin
settles the source when its OneTrust promise resolves (with or without a
usable SDK), when that promise rejects, and synchronously when the page
carries no CMP at all. A OneTrust promise that never resolves never settles,
and consumers gated on it stay blocked — which is the intended outcome rather
than a silent fallback to "assume no consent source".

Because settlement is reported by the plugin, a consumer that gates on it
only works when `consentPlugin` is registered, and registered before it.
