# Executive Memo 03 — Final: Phase 4 review, autofix, advisory capture

## Decision

Phase 4 is complete. Recommend ACCEPT the pilot's engineering output and
proceed to the Phase 5 verdict with one honest qualifier: the strict visual
gate (candidate self-consistency) passes; cross-stack visual acceptance
remains DEFERRED per ceo-decision-01 and must be reported as such, not as a
pass. One review finding was a genuine data-shape blocker — caught and fixed
before any production exposure, which is the workflow working as intended.

## Customer Impact

Still zero production surface (route 404s in production). The blocker fixed
this phase (`SectionListSummarySchema` required three wire-nullable fields;
one pre-avatar-migration section would have rejected a teacher's entire list)
is exactly the class of defect that would have shipped a broken page to real
teachers had the candidate ever been promoted without this review pass.

## Scope

Done: combined review of all five pilot commits (typescript-reviewer,
react-reviewer, a11y-architect subagents + Opus design-system/copy-parity
pass); eleven findings fixed in one commit (`9740560a49a`); five deferred
with rationale, none requiring scope or contract changes; advisory legacy
captures from test-studio with sanctioned fixtures, candidate captures from
the MSW shell, observations recorded. Not done, deliberately: no mutating UI,
no i18n plumbing, no WebKit lane, no CI wiring — all out of charter scope.

## Evidence

- Fixes: nullable schema fields + parser test; visible error state +
  region error boundary; accessible loading status; region-level h2 (WCAG
  1.3.1) + widened axe scope; `role="list"` WebKit reaffirmation (a11y ruled
  fix-now); exact legacy empty-state copy + the legacy `no_sections.png`
  asset; mocks aligned to the documented read-only fixture route (bespoke
  handler deleted); e2e/ now type-checked; details in appendix-03.
- Gates after autofix: filter-scoped turbo 38/38; package vitest 10/10;
  Playwright 11 specs × 5 repeats = 55/55 with deliberately regenerated
  baselines (empty-state visual change: legacy copy + image — declared, not
  silent); pre-commit clean.
- Advisory: four artifacts under `artifacts/visual/` + side-by-side
  observations in visual-artifacts.md. Empty state near-equivalent (same
  asset, byte-identical copy). Section list content-equivalent for the
  approved read-only slice; legacy's mutating panels/avatars are absent by
  charter. No cross-stack pixel diff was produced — that comparison is the
  one the environment decision rejects as noise.

## Risk

- Deferred cross-stack visual acceptance is the pilot's honest gap; Phase 5
  must apply the workflow-partial rule (ceo-decision-01) rather than reframe.
- WebKit/VoiceOver behavior is code-fixed but only human-verifiable; listed
  as a follow-up, cannot be proven from this environment.
- Per-mount QueryClient and missing react-hooks lint are recorded upstream
  follow-ups; neither blocks the pilot.

## Usage

Phase 4 close: session 80%, week-all 54%, week-Fable 19% (resets Jul 3
7:30am / Jul 6 9am PT). Under all pause thresholds, but session headroom is
now thin — recommend the Phase 5 verdict run in a fresh session. Checkpoint
rows 10-11.

## Ask

1. Accept Phase 4 (review/autofix/advisory) as complete.
2. Confirm the Phase 5 verdict framing: strict gate PASS (self-consistency,
   axe, keyboard, behavioral), cross-stack visual acceptance DEFERRED —
   workflow-partial, per ceo-decision-01.
3. Approve the recorded follow-ups (VoiceOver/NVDA manual pass, react-hooks
   lint upstream, users/current MSW gap, generator react-pin template fix) as
   exit notes rather than pilot work.

## Addendum — ceo-decision-03 redelegation (avatar + label parity)

CEO spot-check found the candidate card rendered no avatar despite
ceo-decision-01's in-scope confirmation and the contract matrix listing
`avatar_color`/`avatar_emoji` as consumed; card wording also said "Join code"
vs legacy "Section code". Registry assertions reconciled FIRST (traceable to
ceo-decision-03), then TDD autofix (`aeebf68a05c`): two component tests added
and observed failing (2/12), then SectionCard gained a read-only avatar label
using the legacy SectionAvatar mapping (minimal `avatarConstants.ts` replica —
importing across the apps/ bundle boundary would drag legacy UI deps) and the
legacy label wording. Gates: vitest 12/12, filter-scoped turbo 38/38,
Playwright 55/55 (`--repeat-each=5`) with DECLARED regenerated baselines, axe
still zero-violation, pre-commit clean. Candidate advisory captures refreshed
— the avatar chip is now visible and its default fire-on-magenta matches the
legacy capture. Workflow lesson recorded in the registry: CEO-decision
confirmations must be absorbed into the scenario assertion list at
reconciliation time, or they stay invisible to implementers and reviewers.
Verdict framing unchanged: strict gate PASS, cross-stack visual acceptance
DEFERRED → WORKFLOW-PARTIAL.
