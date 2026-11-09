# Teacher Dashboard Remaining-Spec Hardening Prompt

Planning only. Remaining-spec hardening and coverage-completeness pass.

Do not implement product code. Do not scaffold. Do not use openspec-apply.

Use the context you already gathered in this session about the V2 Teacher
Dashboard, legacy routes/code, frontend architecture, PRFAQ interpretation, and
human rulings. Do not restart broad exploration. Reread current OpenSpec
artifacts as needed, and do only targeted source checks when your existing
context is insufficient to resolve a concrete ambiguity.

The latest limited pass hardened and architecture-corrected only:

- teacher-dashboard-progress
- teacher-dashboard-settings
- teacher-dashboard-assessments
- teacher-dashboard-student-snapshot

Those four are the quality bar. Use them, the architecture report, and your
already-gathered Teacher Dashboard context as the standard for the rest.

Now perform two planning tasks:

1. Harden the remaining Teacher Dashboard OpenSpecs to the same level of
   implementation readiness where appropriate.
2. From your already-gathered understanding of the current V2 Teacher Dashboard
   surface, identify any missing feature, sub-feature, route, flag arm, modal,
   workflow, side effect, or linked dashboard-owned surface. If something is
   missing, create or update planning artifacts so it is covered.

Key intent:

- Keep Fable's judgment. Do not mechanically template every spec.
- Preserve precise evidence where it exists.
- Use `BLOCKED-EVIDENCE` for real unknowns, with exact resolution tasks.
- Keep specs useful for future autonomous implementation.
- Keep the one-package Teacher Dashboard module model, Vite + TanStack
  direction, DashboardApi ownership, standalone MSW/dev-shell testing,
  desktop/laptop responsiveness, and move/refactor-first strategy.
- Do not imply teacher-facing offline product support.
- Treat `teacher-dashboard-foundation` as superseded prior art only.
- Do not add speculative product improvements. Coverage additions should be for
  existing V2 Teacher Dashboard behavior.

For each remaining change, decide what it needs based on your context:

- source/reuse/ownership clarity
- route/API/mutation clarity
- DashboardApi/core vs package boundary clarity
- scenario and fixture coverage
- visual/copy/a11y/responsive gates
- design-system mapping and modernization boundary
- dependency/readiness notes
- measurable performance gates where performance matters
- consistency with the four hardened specs and the architecture report

For the four already-hardened specs, do only a light consistency sweep. Fix
contradictions or stale wording caused by the latest architecture rulings, and
add any missed current V2 behavior if your existing context reveals it, but do
not rewrite their evidence-pinned contracts unnecessarily.

After editing:

- validate the OpenSpec changes you touched, and validate the full included
  change set if practical.
- commit and push the planning edits.

Final report:

- what you hardened
- what missing coverage you found from already-gathered context and how it was
  added
- what targeted checks, if any, were needed and why
- what you intentionally left alone
- remaining ambiguities or blockers
- which specs look implementation-ready after evidence capture
- confirmation that no product code was implemented
