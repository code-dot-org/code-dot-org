# Analytics Plugin

Provider-agnostic product analytics for `@code-dot-org/core`. The plugin wraps
a vendor SDK (Statsig today) behind a two-call interface — `sendEvent` and
`setUser` — so feature code never imports the SDK.

## Availability

The plugin and module-level API are available from the
`@code-dot-org/core/plugins/analytics` subpath.

## Key Exports

| Import path                            | Contents                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `@code-dot-org/core/plugins/analytics` | `analyticsPlugin`, `sendEvent`, `setUser`, `createAnalyticsClient`, types |

## Usage

### Bootstrap

Register `consentPlugin` before `analyticsPlugin`:

```typescript
import {initializeCore} from '@code-dot-org/core';
import {analyticsPlugin} from '@code-dot-org/core/plugins/analytics';
import {consentPlugin} from '@code-dot-org/core/plugins/consent';

initializeCore({plugins: [consentPlugin, analyticsPlugin]});
```

The order is load-bearing. `consentPlugin` reports whether the page has a CMP
at all, and analytics waits for that answer before it builds a client. **A page
that registers `analyticsPlugin` without `consentPlugin` sends nothing** — the
wait never ends.

### Sending events

```typescript
import {sendEvent} from '@code-dot-org/core/plugins/analytics';

sendEvent('Account Settings Page Visited', {'user type': 'teacher'});
```

Event names and payload keys are a contract with the dashboards that consume
them, down to keys containing spaces. Copy them verbatim.

### Identity

```typescript
import {setUser} from '@code-dot-org/core/plugins/analytics';

setUser({
  userId: '1234',
  userType: 'teacher',
  isVerifiedInstructor: true,
  educatorRole: 'librarian',
});
```

`userId` is zero-padded to five digits in production and prefixed with the
environment tier everywhere else, so non-production ids never collide with
production ones.

`setUser(null)` is a no-op. The signature accepts `null` so callers can pass a
signed-out auth outcome without branching, but no identity is cleared.

#### Where identity comes from

Two independent sources, in precedence order:

1. **A server-rendered seed.** When the page's app-config carries
   `analytics.user`, the client boots already identified — the first events of
   the page load carry `userID` and `userType` rather than landing anonymous
   and being re-attributed.
2. **`setUser`.** Always authoritative afterward, and carrying the fuller set
   of dimensions (`isVerifiedInstructor`, `educatorRole`), which the seed does
   not include.

The two are decoupled by design: **the plugin never requires the server to
render identity.** A signed-out page, a cached layout, a static host, and the
standalone shells all boot anonymous and are identified entirely through
`setUser`. Seeding is an optimization, not a dependency.

A seeded boot followed by `setUser` for the same person is the normal signed-in
sequence and is not suppressed — the repeat-call short-circuit only drops
byte-identical updates, and the seed and a full `setUser` never serialize
alike.

## Runtime config shape

Rails injects the config through the `<meta name="app-config">` tag:

```json
{
  "analytics": {
    "provider": "statsig",
    "statsig": {"clientKey": "client-..."},
    "user": {"userId": "42", "userType": "teacher"}
  }
}
```

`user` is present only when the page was rendered for a signed-in person; it is
absent entirely otherwise.

Whether an environment transmits is decided server-side — only production and
the chef-managed test server do — and a non-transmitting environment is served
`provider: 'none'`. There is no browser-side switch.

The Statsig adapter loads through a dynamic import, so the SDK becomes a
separate chunk rather than landing in the initial core payload.

## Consent

Consent gates one thing: whether the stable-ID cookie and localStorage entry
may be written. Events send regardless.

The decision is made once per page load, at the CMP's first report, and is
never revisited. A visitor who accepts cookies from the banner mid-session gets
no cookie until their next page load.

- **No CMP on the page.** The consent module settles synchronously, the client
  is built immediately, and events flow at once.
- **CMP present, reports a decision.** Events issued before the report are
  buffered and replayed once the client exists. Whether `performance` was
  granted or denied changes only persistence.
- **CMP present, loads but reports nothing usable** (blocked assets, a promise
  that resolves without an SDK). Still settled. Events flow; persistence is
  treated as denied.
- **CMP present, never reports.** Nothing is ever sent. The buffer fills to its
  cap and drops its oldest entries.

At the decision point:

- `performance === true` → the ID is read from the cookie or localStorage, or
  minted, then written to both and handed to the SDK as `customIDs.stableID`.
- anything else → both copies are deleted and the SDK receives
  `customIDs: {stableID: undefined}`, its cue to mint and store an ID of its
  own. Declining the cookie does not make the session unidentified.

Persistence happens before the client is constructed, so a provider import that
fails afterward still leaves the cookie written.

## Stable ID storage

- cookie `statsig_stable_id`, session-scoped, `path=/`, `domain=.code.org`,
  `SameSite=Lax`, `Secure`
- localStorage key `STATSIG_STABLE_ID`

These are a contract shared with other code.org pages and with the Rails
server-side session reader, so one ID follows a visitor across all of them.

The cookie wins over localStorage; an empty or malformed cookie value falls
through. Reading is always allowed — only writing is gated.

The Statsig SDK's own storage is left at its default, including its evaluation
cache and the ID it mints when it receives none.

## Event and identity shapes

- **The event name is sent twice.** `logEvent(name, name, payload)` puts the
  name in Statsig's `value` slot as well, and dashboards key on it.
- **`setUser` carries no `customIDs`.** The update payload is
  `{userID, custom: {...}}`, so from the first `setUser` onward the user holds
  no `stableID` for the rest of the page load. Dashboards depend on this shape.
- **`setUser` carries no `geRegion`.** The init user carries
  `custom.enabledExperiments` and `custom.geRegion`; the update carries
  `userType`, `isVerifiedInstructor`, `enabledExperiments`, and `educatorRole`.

## Local development

In `development` with `provider: 'none'`, the plugin installs a console adapter
that logs what would have been sent:

```
[STATSIG ANALYTICS EVENT]: Statsig Stable ID: <id>
[STATSIG ANALYTICS EVENT]: <name>. Payload: {"payload":{...}}
```

Every other non-transmitting environment, including unit tests, stays silent.

## Session dimensions

Two anonymous dimensions depend on markup the Rails page renders:

- `geRegion` reads `document.documentElement.dataset.geRegion`. Rails chooses
  the region server-side and stamps the result on `<html>`; a shell that does
  not stamp it reads `null`.
- The cookie half of `enabledExperiments` reads
  `_experiments<window.cookieEnvSuffix>`. A page that does not render that
  global reads the unsuffixed name, so a non-production deployment finds no
  cookie rather than the wrong one. The localStorage half works everywhere.
