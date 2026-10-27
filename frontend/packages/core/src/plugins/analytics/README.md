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

The order is important. `consentPlugin` reports whether the page has a CMP
and, if so, when it has answered, and analytics waits for that before it
builds a client. **A page that registers `analyticsPlugin` without
`consentPlugin` sends nothing** — the wait never ends.

### Sending events

```typescript
import {sendEvent} from '@code-dot-org/core/plugins/analytics';

sendEvent('Account Settings Page Visited', {'user type': 'teacher'});
```

Event names and payload keys are a contract with the dashboards that consume
them, down to keys containing spaces. Copy them verbatim.

An event sent without a name is reported as `NO_VALID_EVENT_NAME_LOG_ERROR`
carrying its original payload, so a caller bug stays visible in the data
instead of vanishing.

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
    "enabled": true,
    "statsig": {"clientKey": "client-...", "autoCapture": true},
    "user": {"userId": "42", "userType": "teacher"}
  }
}
```

`enabled` is a runtime feature flag, always present. When it is `false` the page
sends nothing at all — no provider client is built and the development console
adapter does not run either, so a disabled page is silent everywhere. Anything
other than an explicit `false`, including an absent key, leaves analytics on.

`provider` reports what is _configured_, independently of `enabled`, so the
client key and identity seed still ride a disabled section and the page
describes itself fully.

`user` is present only when the page was rendered for a signed-in person; it is
absent entirely otherwise.

The Statsig adapter loads through a dynamic import, so the SDK becomes a
separate chunk rather than landing in the initial core payload.

## Autocapture

With `statsig.autoCapture` set, the adapter runs Statsig's web-analytics
autocapture, which instruments the page and emits events nobody calls
`sendEvent` for.

**The gate is server-side.** Rails decides per request, from the same path list
that decides whether the legacy autocapture bundle loads, so the two stacks
cover exactly the same pages and the list has one owner. There is no
browser-side switch and no way to ask for autocapture from feature code.

## Consent

Consent gates whether the stable-ID cookie may be written. Events send
regardless of consent.

The decision is made on page load, when the consent management platform
(CMP) initializes and reports whether the visitor allowed performance
cookies. Until the CMP reports, events are held in the browser. Once it
reports, whichever way, the client is built and the held events are flushed
to the provider; only the cookie write depends on the answer. A CMP that
never reports leaves events queued in the browser.

## Local development

In `development` with `provider: 'none'`, the plugin installs a console adapter
that logs what would have been sent:

```
[STATSIG ANALYTICS EVENT]: Statsig Stable ID: <id>
[STATSIG ANALYTICS EVENT]: <name>. Payload: {"payload":{...}}
```
