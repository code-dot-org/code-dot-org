---
name: lab2-save-failures
description: Investigate Lab2 project save failures reported in Sentry — "Error saving sources", "Error saving channel", Failed to fetch, or a user report of lost work. Covers the Sentry query traps, what the error population already excludes, how to tell a cancelled request from a broken backend, and the save path's file anchors. Use when debugging why a Lab2 project did not save.
---

# Debugging Lab2 save failures

Scope: the Lab2 project system (`apps/src/lab2/projects/`), which backs Music
Lab, Python Lab, Weblab2, Sketch Lab and the other Lab2 labs. Older labs use a
different project system and none of the anchors here apply to them.

## Query Sentry without being misled

Org `codeorg-ra`, project `apps`. Logs UI: https://codeorg-ra.sentry.io/explore/logs/

Two traps, both of which silently produce wrong numbers rather than an error:

**Wide windows drop rows.** Sentry serves long periods from a downsampled
tier. A 90-day query returned one of two known logs on a single trace; the
same query at 24h returned both. Use the narrowest window that covers the
events, pass `fresh: true`, and do not compare counts across windows of
different widths.

**Group on `details.message`, not `error`.** `error` holds `error.stack`
(see `Lab2MetricsReporter.logError`, which writes `error?.stack ||
error?.message`). V8 prefixes a stack with a `Name: message` header line;
WebKit and SpiderMonkey emit frames only. Grouping on `error` therefore drops
the message for every Safari and Firefox row — in one week that misfiled
2,410 events. `details.message` carries `error.message` verbatim on every
browser.

Useful attributes on these logs: `channelId`, `appName`, `userId`,
`browser.name`, and the diagnostic fields below. `levelId` is declared but has
never been populated — do not infer anything from its absence. Querying an
attribute that does not exist returns a validation error naming it, which is a
cheap way to discover the real field set.

## Know what the population already excludes

`ProjectManager.onSaveFail` routes by status before anything is logged as an
error:

| Condition | Treatment |
|---|---|
| message contains `409` or `401` | `logWarning`, set `forceReloading`, metric `Lab2.ProjectSaveFailureClient` with `ErrorType` conflict/unauthorized, then reload the page |
| message contains `413` | `logWarning` "Project too large to save"; the lab shows its own message |
| anything else | `logError` + metric `Lab2.ProjectSaveFailure` |

So `Error saving sources` and `Error saving channel` are the *residue* after
conflicts, expired sessions and oversized payloads have been peeled off. A
report of "no 401s in the data" means they were handled, not that they did not
happen — count `Lab2.ProjectSaveFailureClient` for those.

## Classify the population before theorising

Run `count()` against `count_unique(channelId)` over the same window. The
ratio is the single most informative number available:

- **Near 1.0** — each channel fails once and never again. The save did not
  fail because of a persistent condition; something ended that one request.
  Look for cancellation: page unload, tab discard, navigation.
- **Well above 1.0** — channels are stuck in a repeat-failure loop. Look for a
  persistent cause: a poisoned payload, a permission that changed mid-session,
  a backend that is down.

In a November 2026 sweep, ~94% of ~15,579 weekly `Error saving sources` events
carried `Failed to fetch` (a `TypeError` thrown by `fetch` itself — no HTTP
response, so no status to read) at 1.24–1.41 events per channel. That is the
signature of requests torn down at a moment, not of a sick backend.

## Read the diagnostic fields

Save failures carry these in `details`. They exist to settle exactly the
questions above:

- `saveTrigger` — `autosave` | `flush` | `unload`. The first thing to check.
  A population dominated by `unload` means the browser is cancelling saves at
  navigation and the fix is transport-level, not retry-level.
- `visibilityState` — `hidden` at failure time corroborates unload or tab
  discard even when the trigger says `autosave`.
- `navigatorOnline` — `false` separates genuine connectivity loss from
  cancellation. It is a weak signal in the positive direction (`true` does not
  prove a working network) but a strong one in the negative.
- `msSinceLastSuccessfulSave` — distinguishes a first-save failure
  (`undefined`) from a session that had been saving happily.
- `payloadBytes` — the encoded size of the save, present only when the failing
  save carried sources. Decides whether `fetch(..., {keepalive: true})` is
  even available as a remedy: keepalive bodies are capped at 64KB, and that
  budget is shared across every in-flight keepalive request in the browser,
  not per request.

## Save path anchors

Do not re-derive these.

- `apps/src/lab2/projects/ProjectManager.ts` — `save` / `flushSave` →
  `enqueueSaveOrSave` → `runSave` → `saveHelper` → sources store, then
  channels store. Saves never overlap; a force save waits on the in-flight one.
- `apps/src/lab2/projects/SourcesStore.ts` — throws
  `NetworkError(status + ' ' + statusText)` on a non-OK response. This is why
  `onSaveFail` matches on substrings of `error.message` rather than a status
  field.
- `apps/src/lab2/projects/sourcesApi.ts` — `update()` is a bare `fetch` PUT to
  `/v3/sources/{channelId}/main.json`, not routed through `HttpClient`. A
  transport change (keepalive, retry, `sendBeacon`) goes here.
- `apps/src/lab2/projects/ProjectContainer.tsx` — the `beforeunload` handler.
- `dashboard/legacy/middleware/files_api.rb` — the server side of that PUT.

## Browser facts that bite here

- `beforeunload` is synchronous. A promise started in the handler cannot be
  awaited, and the browser is free to cancel the request it started. Showing
  the "Leave site?" dialog buys time but does not guarantee completion.
- A handler registered in a `useEffect` with dependencies is replaced whenever
  they change. Stale closures over read-only or dirty state have masked bugs
  in both directions; check what the *current* listener closes over.
- `keepalive` survives unload but is capped at 64KB shared browser-wide, and
  needs Safari ≥16.4.

## Open question

Whether unload cancellation accounts for the bulk of `Failed to fetch` is
**not yet confirmed** — `saveTrigger` was added to answer it. Check the
trigger distribution before proposing a transport change; the remedy for
`unload` (keepalive or `sendBeacon`) is not the remedy for `autosave`
(retry with backoff, and suppress the log when the retry succeeds).
