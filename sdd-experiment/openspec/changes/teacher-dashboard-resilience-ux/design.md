# Design: teacher-dashboard-resilience-ux

## Context

Legacy failure handling: swallowed fetch errors
(`selectedSectionLoader.ts:52-56`), blank UI during loads, silent
access-denied rewrites. The migration changes reproduce behavior parity but
pre-approve deviating here, provided deviations are recorded and masked.
This change specifies the deviations once so shell, homepage, and roster
implement one pattern instead of three.

## Goals / Non-Goals

**Goals:** one error-state component, one skeleton idiom, one denied-access
message pattern; deviation bookkeeping that keeps pixel gates honest.

**Non-Goals:** no offline mode, no retry-with-backoff sophistication, no
global error boundary redesign of Studio (Studio already has an auth error
page; this change covers teacher-dashboard data errors only).

## Decisions

- D1. Error states ride TanStack Query: feature components render
  `error + retry` from query state; retry = `refetch()`. One shared
  DSCO/MUI error component in the package (design-system mapping: DSCO
  alert + MUI Button; no custom chrome).
- D2. Skeletons are MUI Skeleton within the package's layout components,
  masked in pixel runs by a shared mask id, so parity captures either wait
  for settled state or mask the region — never diff a skeleton against
  legacy blank.
- D3. Access-denied messaging reuses the flash/toast channel the homepage
  change builds; copy is a product decision and gates only the message,
  not the redirect mechanics (which remain parity-bound in the shell spec).
- D4. Every deviation instance gets a scenario-registry entry (feature,
  scenario, frames masked) — the precondition the program set for
  intentional changes.

## Risks / Trade-offs

- [Deviation bookkeeping rots] → the visual harness fails when an unmasked
  skeleton/error frame appears in a diff, which forces the entry.
- [Retry loops hammer a failing endpoint] → manual retry only (user
  click); no automatic retry beyond Query defaults.

## Migration Plan

Ships as part of/immediately after each feature change's implementation;
error+skeleton components land in the package once, features adopt in
their own commits. Rollback per feature commit.

## Open Questions

- Product ruling on access-denied copy (P3 carried from the program
  recommendations).
