# Teacher Dashboard Consistency Sweep Prompt

Planning only. Consistency sweep after remaining-spec hardening.

Do not implement product code. Do not scaffold. Do not use openspec-apply. Do
not broaden product scope. Do not do another broad source exploration.

Use the context already gathered in this session. Reread only the current
OpenSpec artifacts and do targeted source checks only if needed to resolve a
concrete contradiction.

Goal:

The latest pass improved coverage, but some artifacts now have addenda that
contradict older requirement/proposal/task wording. Make the OpenSpecs
internally consistent and implementation-ready without rewriting everything.

Fix these classes of issues wherever they appear:

- Requirement text contradicted by later hardening addenda.
- Stale "confirm/record at implementation start" language where the design now
  pins the endpoint or behavior.
- Stale "package-local API wrapper" / "feature api layer" language after the
  DashboardApi ruling.
- Proposal, design, spec, and tasks disagreeing about whether something is
  pinned, evidence-gated, out of scope, pixel-gated, or behavior-only.
- Task files that still direct implementers toward the wrong API ownership or
  stale discovery framing.
- Any remaining visual parity wording that implies non-DS legacy UI needs
  strict pixel parity.
- Any remaining offline wording that implies teacher-facing offline product
  support instead of standalone MSW/dev-shell testing.

Known examples to fix:

- `teacher-dashboard-homepage-v2` still says demo staleness/reset "behave as
  legacy" while the hardening addendum says the endpoints are absent from
  `apps/src` and the behavior must be evidence-gated.
- `teacher-dashboard-stats`, `teacher-dashboard-calendar`, and
  `teacher-dashboard-skills-dashboard` proposals still contain stale
  "confirmed/recorded at implementation start" wording despite hardened
  endpoint notes.
- `teacher-dashboard-student-snapshot` still has "feature's api layer" wording;
  replace with feature data adapter/orchestration over DashboardApi
  hooks/functions.
- Check tasks for stale API ownership wording after the DashboardApi ruling.

Keep this pass surgical:

- Do not weaken evidence-pinned contracts.
- Do not invent new behavior.
- Do not harden additional specs beyond consistency cleanup.
- Preserve Fable's judgments where they are coherent.

Also decide whether the prompt artifact should be preserved:

- If useful for audit/replay, add `teacher-dashboard-remaining-spec-hardening-prompt.md`
  to the commit.
- If not, leave it untracked and mention that in the final report.

After editing:

- validate all included OpenSpec changes.
- commit and push the consistency fixes.

Final report:

- contradictions fixed
- stale wording removed
- files changed
- validation result
- whether the prompt artifact was committed or intentionally left untracked
- confirmation that no product code was implemented
