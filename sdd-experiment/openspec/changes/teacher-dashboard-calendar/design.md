# Design: teacher-dashboard-calendar

## Context

`UnitCalendar.tsx` renders weekly lesson blocks for the selected section's
assigned unit; `CalendarEmptyState.tsx` covers the no-calendar case. The
route renders unconditionally (Router:262-265) — the empty-state decision
is the component's, unlike the `ElementOrEmptyPage`-gated tabs.

## Goals / Non-Goals

**Goals:** calendar + empty state at pixel and behavior parity.

**Non-Goals:** no calendar editing (levelbuilder owns lesson durations); no
new views.

## Decisions

- D1. Port like homepage (TSX extraction + Query spine).
- D2. Data source PINNED (2026-07-04 hardening):
  `GET /dashboardapi/unit_summary/:courseName/:unitPosition` via
  `HttpClient.fetchJson<UnitSummaryResponse>` (`UnitCalendar.tsx:104-105`)
  feeding the client-only `calendarRedux` slice
  (`code-studio/calendarRedux.ts` — createSlice, no fetch of its own;
  lesson fields: id, lessonNumber, title, duration, assessment,
  unplugged, url). Wrapper lives in CORE DashboardApi (human ruling;
  shared with course/unit overview if it consumes unit_summary too — one
  wrapper). Response shape capture-gated (BLOCKED-EVIDENCE: one runtime
  JSON capture). The moved slice becomes local component/Query state —
  it is pure client state, no bridge needed.
- D3. The renders-unconditionally quirk is preserved: no
  empty-state-matrix gate is added around the route; the component's own
  branch is the parity target.

## Risks / Trade-offs

- [Calendar layout is dense and font-sensitive, pixel diffs may be noisy]
  → fonts pinned via `@code-dot-org/fonts`; masks for lesson-title text if
  needed, recorded per capture; time-boxed stabilization with documented
  deferral path.

## Migration Plan

Record data → discovery → port → flip map entry → pixel baselines →
verify. Rollback: revert additive commits.
