# CEO Decision 04 — Final Verdict: pilot-teacher-dashboard-home

Date: 2026-07-03. Usage checkpoint row 15 covers this decision.

## Verdict: WORKFLOW-PARTIAL (success on every criterion except the
## deliberately deferred cross-stack visual acceptance)

Per the charter: "If strict visual acceptance is deferred to a later
matched environment, the pilot may be marked workflow-partial, not
succeeded." The deferral was ruled in ceo-decision-01, reaffirmed in
ceo-decision-03, and is reported here without reframing.

## Completion criteria audit (CEO, against evidence)

- OpenSpec artifacts sufficient to resume from cold — MET. Eleven-plus
  commit operating record; validate --strict clean throughout.
- Usage checkpoints worked and stayed under budget — MET. 15 rows;
  Fable week peaked at 22% vs the 85% pause threshold; no budget_pause
  ever triggered; per-Sonnet-session preflights recorded as hard gates.
- Scenario Registry approved before implementation — MET
  (ceo-decision-01 preceded all Sonnet work).
- Candidate route exists at /frontend-studio/teacher_dashboard/home —
  MET (observed mounting in a browser; route+lazy only; generated route
  tree never hand-edited).
- frontend/packages/teacher-dashboard owns the UI — MET.
- GET /api/v1/sections through typed DashboardApiClient — MET
  (SectionListSummarySchema; review caught a nullability blocker that
  would have broken real teachers' lists).
- Empty and section-list states have tests — MET (vitest 12/12;
  Playwright 55/55 across repeat-each=5).
- MSW fixtures support offline empty/list states — MET (deterministic
  dev shell, ?tag=empty / ?tag=list).
- Visual parity tool assertion in the applicable strict environment —
  MET for the ruled strict gate (candidate self-consistency, Firefox);
  cross-stack acceptance DEFERRED by explicit memo decision → overall
  verdict capped at workflow-partial.
- A11y checks pass or documented exceptions — MET (scoped axe zero
  violations; keyboard checks; WebKit/VoiceOver manual pass is a
  recorded follow-up, not an exception to a failing check).
- Opus review/autofix loop completed before CEO handoff — MET (three
  reviewer lenses + design-system + copy parity; 11 findings fixed; 5
  deferred with rationale; one CEO-spot-check redelegation executed).
- CEO received one-page memos and decided without reading all code —
  MET (decisions from memos + targeted artifact/screenshot spot-checks;
  no full-diff reads by the CEO).

## Workflow lessons (for scaling past the pilot)

1. CEO Q&A rulings must be folded back into registry assertions
   immediately; the avatar confirmation lived only in a decision doc
   and slipped through four review passes until a CEO capture
   spot-check caught it.
2. The generator template defect (react ^19.2.0 vs catalog) and the
   users/current MSW gap show scaffold-inspection and a shared mocks
   audit belong in the standing checklist.
3. Cross-stack pixel parity is structurally meaningless for
   webpack/DSCO -> Vite/MUI migrations; future slices should write the
   self-consistency + behavioral-assertion + advisory-capture pattern
   into the charter from day one.

## Exit notes / upstream follow-ups (approved, not pilot work)

- e2e-tests header.spec.ts imports ../pages/teacher-dashboard (no
  index.ts) — breaks workspace-wide lint; from staging efa54994177.
- turbo generator package.json.hbs pins react ^19.2.0 (should be
  catalog:) — second-React hazard for every new package.
- No MSW handler for GET /api/v1/users/current — Studio standalone MSW
  mode auth-errors on all routes.
- Shared avatar-constants package to eliminate the copied mapping data.
- WebKit lane + VoiceOver/NVDA manual pass; per-mount QueryClient;
  react-hooks lint in the package lint config.
- Environmental headless-Chromium crash on MSW dev shells (Firefox
  unaffected) — unexplained, worth an infra look.
