# Design: frontend-studio-production-readiness

## Context

Serving machinery exists and runs on preprod (S3 package via
`turbo_s3_packaging.rb`, `dashboard/public/frontend-studio` symlink,
basepath lockstep, `use_my_studio` local override). Production is gated
by two hard-coded skips and a set of unwritten expectations. Measured
today: entry chunk 3,384 kB raw / 1,799 kB gzip (Vite warns); auth
fetched per navigation; zero browser CI.

## Goals / Non-Goals

**Goals:**

- The production decision reduces to a requirement checklist.
- The two platform gates with real engineering content (auth primitive,
  bundle budget) are implemented, not just listed.

**Non-Goals:**

- Not the cutover itself (no edits to the controller 404 or rake skips;
  those are pinned as requirements for a later change).
- No index-route product design (`BLOCKED-EVIDENCE`, pinned).
- No i18n completion, no PWA/offline work, no learn.code.org domain
  question — none is evidenced as a launch requirement in the repo.

## Decisions

- **Auth: cache the outcome in router context per session, invalidate
  on auth-mutating events; `requireAuth` as a `beforeLoad` helper that
  redirects or renders the signed-out outcome.** Today's
  per-navigation `GET /api/v1/users/current` is both a latency tax and
  a load multiplier at production traffic; caching semantics
  (staleness on sign-out elsewhere) are the design's one subtle point
  — resolved by re-validating on window focus, matching TanStack Query
  defaults already in the stack.
- **Budget: enforce on the entry chunk (raw + gzip), split vendors via
  manualChunks.** The 3.4 MB chunk exists because everything
  (MUI + component-library + emotion + shared deps) lands in one entry
  today; TanStack's autoCodeSplitting already isolates route
  components, so vendor splitting is the remaining lever. The specific
  budget number is fixed after the split lands (task-ordered:
  split first, then set the ratchet just above the result) — a number
  invented now would be either slack or fiction. Rejected: budgeting
  total dist size (dominated by 505 font files that are lazily
  fetched, not shipped per page).
- **Gates as spec requirements over a checklist doc.** Requirements are
  falsifiable and survive in `openspec/specs/` after archive; a
  markdown checklist would rot exactly like the docs this planning
  cycle corrected.
- **Rollout shape deliberately deferred** to the cutover change: flag
  vs percentage vs path-scoped depends on what routes exist by then;
  pinning it now would be speculation.

## Risks / Trade-offs

- Setting the budget after splitting risks enshrining a still-too-big
  number; mitigated by recording the gzip-per-route figures in the PR
  and requiring reviewer sign-off on the ratchet value.
- Auth caching introduces staleness windows; bounded by
  focus-revalidation and by `requireAuth` re-running on navigation to
  gated routes.
- The DSN/config gate depends on infra provisioning outside this
  workspace; it is a requirement with an owner, not a code task here.
