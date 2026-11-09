# Design: teacher-dashboard-skills-dashboard

## Context

Single-component tab (`SkillsDashboard.tsx`), DCDO-gated, in active
development on the legacy side. Its data contract is not pinned in the
program's API catalog — recording it is the first implementation task.

## Goals / Non-Goals

**Goals:** the gated tab at parity so the rollout flag works against the
candidate.

**Non-Goals:** no feature development on the skills dashboard itself; no
un-gating.

## Decisions

- D1. Port like homepage (TSX + Query spine); single component, small
  change.
- D2. Because the legacy component is under active development, the move
  copies at a recorded legacy SHA and the change's ledger entry tracks
  divergence until cutover (dual-copy policy, highest drift risk of the
  set — the tab is still changing).
- D3. Data contract partially PINNED (2026-07-04):
  `SkillsDashboard.tsx` posts `POST /openai/evaluate_section`
  (`EVALUATE_URL`, :11,:55) and reads results via
  `HttpClient.fetchJson<SkillsResponse>` (:69; URL + response shape
  capture-gated — BLOCKED-EVIDENCE: read the fetch site + one runtime
  capture). Wrappers live in CORE DashboardApi (human ruling); the
  feature owns fixtures only and its entry lazy-loads outside the shell
  chunk. Note the POST hits an `/openai/*` route — flag to security
  review alongside the CanCan scoping check. Responsive gate
  (desktop/laptop) applies as everywhere: no overlap at 200% zoom /
  narrow laptop; tablet/mobile parity not required.

## Risks / Trade-offs

- [Active legacy development drifts fast] → smallest possible change,
  scheduled late (position 15), divergence ledger with owner; if drift is
  hot at implementation time, re-record and re-port is cheap at this size.

## Migration Plan

Record → discovery → port → verify. Rollback: revert additive commits.
