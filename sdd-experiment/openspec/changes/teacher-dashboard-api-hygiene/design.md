# Design: teacher-dashboard-api-hygiene

## Context

See proposal findings 1-5 with file evidence. All five reduce to one
principle the dashboard's API surface currently violates in scattered ways:
GETs must be safe, writes must be explicit and protected. The migration
changes intentionally preserve the violations for parity; this change
retires them once the candidate is the caller of record.

## Goals / Non-Goals

**Goals:** one write-semantics policy; four concrete retirements (drawer
side effect, flash drain, CSRF skip, render-time TOS accept); one dead
branch removed.

**Non-Goals:** no new product behavior; no change to what popups/flash the
teacher sees; no wholesale REST redesign of dashboard endpoints.

## Decisions

- D1. Drawer: pure `GET` + `POST drawer_seen`. Dual-write window: the old
  GET keeps its side effect until the legacy homepage stops calling it
  (cutover), then the side effect is deleted. Alternative — versioned new
  GET without side effect alongside old — rejected: two read endpoints for
  one payload invites drift.
- D2. Flash: explicit `POST flash_acknowledge` after display, mirroring
  D1's shape. Read returns the pending flash without clearing; acknowledge
  clears. Tab races resolve to at-most-once display per acknowledge, which
  is no worse than legacy single-render semantics.
- D3. CSRF: remove the skip; fix callers to send the token through the
  standard clients (core transport already supplies it; legacy callers use
  the shared HttpClient which does too — the skip predates those clients).
  If an unfixable caller emerges, it is named in the task log and the skip
  stays scoped to a deprecated alias route rather than the real endpoint.
- D4. TOS: `POST /api/v1/users/me/accept_terms` (exact path decided against
  existing users API conventions) called on explicit accept; render-time
  auto-accept untouched until product ruling + cutover, then removed with
  the HAML block.

## Risks / Trade-offs

- [Dual-write window forgets to close] → ledger entry with an owner; the
  removal is a task in this change, not a wish.
- [CSRF-skip removal breaks an unknown caller] → grep-verified caller
  inventory before the change; canary via staging; revert is one line.
- [Flash acknowledge adds a round-trip] → negligible; fired after paint.

## Migration Plan

Land write endpoints + candidate callers first (additive); flip legacy
callers where trivial; remove side effects/skip last, each behind its own
commit for one-line rollback.

## Open Questions

- Product ruling on TOS explicit-accept (carried from homepage change).
- Whether `flash` relay survives at all post-cutover (most flash sources
  are legacy redirects; if none target the candidate, delete instead of
  redesign).
