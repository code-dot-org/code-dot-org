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

- **Auth: module-level cached promise in `fetchAuthOutcome`, focus
  revalidation, `requireAuth` as a `beforeLoad` helper.** Concretely:
  `src/modules/auth/fetchAuthOutcome.ts` memoizes its in-flight/settled
  promise so the root route's `beforeLoad` resolves the cache after
  the first navigation; a `window` focus listener (registered once at
  boot) clears the cache and calls `router.invalidate()`. No event bus
  and no "auth-mutating events" machinery: the SPA has no in-app
  sign-in/out today (auth flows round-trip through Rails full-page
  loads, which naturally reset the cache). `requireAuth` is a helper
  consumed in a route's `beforeLoad` that reads the cached outcome and
  either redirects to the Rails sign-in URL or renders the declared
  signed-out component. Rationale: today's per-navigation
  `GET /api/v1/users/current` is a latency tax and a load multiplier
  at production traffic.
- **Budget: enforce on the entry chunk (raw + gzip), split vendors via
  manualChunks.** The 3.4 MB chunk exists because everything
  (MUI + component-library + emotion + shared deps) lands in one entry
  today; TanStack's autoCodeSplitting already isolates route
  components, so vendor splitting is the remaining lever. The specific
  budget number is fixed after the split lands (task-ordered:
  split first, then set the ratchet just above the result) — a number
  invented now would be either slack or fiction. Enforcement
  mechanism: a post-build script (`apps/studio/scripts/
  check-bundle-budget.mjs`, chained after `vite build` in the
  package's `build` script) that reads `.vite/manifest.json`, gzips
  the entry chunk, and exits non-zero against budgets declared at the
  top of the script. Rejected: budgeting total dist size (dominated
  by 505 font files that are lazily fetched, not shipped per page);
  `chunkSizeWarningLimit` (warns, does not fail).
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
- Auth caching introduces staleness windows; bounded by focus
  revalidation (cache cleared + router invalidated on window focus)
  and by `requireAuth` re-running on navigation to gated routes.
- The DSN/config gate depends on infra provisioning outside this
  workspace; it is a requirement with an owner, not a code task here.
