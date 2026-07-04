# Teacher Dashboard migration — OpenSpec planning (planning only)

This PR contains OpenSpec planning artifacts only. No product code, no
package scaffolding, no route or Rails changes. Authored by Fable
2026-07-04 from direct source reading in this checkout plus the program
context in `sdd-experiment/teacher-dashboard-migration/` (prior-session
ledger; referenced but intentionally not included in this PR).

## Migration changes (parity-bound)

1. `openspec/changes/teacher-dashboard-shell/` — feature package
   (`@code-dot-org/teacher-dashboard`, turbo-generated, users-package
   pattern), bootstrap API
   (`Api::V1::TeacherDashboard::SectionsController#index` =
   `concise_summarize[]` + `section_order`, field-equivalence tested),
   core sections MSW/parser coverage, candidate route tree under
   `/frontend-studio/teacher_dashboard/*` with redirect/auth parity, and
   the reusable visual-parity harness. Supersedes the earlier
   `teacher-dashboard-foundation` draft (retained untouched as prior art;
   it also predates this session's validator fixes and fails
   `openspec validate`).
2. `openspec/changes/teacher-dashboard-homepage-v2/` — ports the
   TS + DSCO/MUI homepage; new
   `Api::V1::TeacherDashboard::HomeController` for the HAML-only scalars;
   typed reuse of drawer/tours/profile/invite endpoints; pixel-gated
   visual parity (DSCO surface); explicit dispositions for TOS
   interstitial (explicit-accept deviation), admin partial (not ported),
   flash relay, logo transition against the Studio header.
3. `openspec/changes/teacher-dashboard-manage-students/` — moves (not
   rewrites) the legacy roster: extraction with adapters, package-scoped
   Redux with a one-way bridge to shell Query state, typed wrappers for
   the reused roster endpoints, behavior/copy/a11y gates. Explicitly NOT
   pixel-gated: the roster is non-DSCO legacy UI (reactabular table);
   evidence in the change. The existing Playwright roster spec and four
   Cucumber features are the porting oracles.

Every change carries task-line gates for behavior-scenario discovery and
(where applicable) visual-parity planning; MSW standalone mode must expose
discovered scenarios as visible choices; implementation may use Playwright
MCP for capture (planning did not); captures require serving-checkout
validation and use `http://localhost-studio.code.org:9000` only.

## Improvement changes (separate from parity; adversarially derived)

Per instruction, an adversarial review pass ran over the gathered context
(prior ledger claims re-verified against source; this session's own
proposals cross-examined). Findings that survived verification became four
improvement changes; each proposal opens with its evidence:

4. `teacher-dashboard-api-hygiene` — reads-don't-mutate policy: drawer GET
   side effect → explicit POST; the homepage plan's own flash
   drain-on-GET (a new instance of the same smell, caught by the
   adversarial pass) → explicit acknowledge, delta-spec'd against the
   homepage change; CSRF-skip removal on `sections#update`
   (`sections_controller.rb:9`, verified); explicit TOS-accept endpoint
   (render-time auto-accept, `show.html.haml:47`, verified); dead
   `unit_in_aif` branch removal.
5. `teacher-dashboard-section-serializers` — the three hand-built section
   hashes in `section.rb` become named, byte-identical, tested
   serializers; overlap fields and both merge precedences pinned.
   Sequenced after shell (its equivalence tests are the safety net).
6. `teacher-dashboard-resilience-ux` — retriable error states (legacy
   swallows section-load failures; `selectedSectionLoader.ts:52-56`,
   verified), loading skeletons, access-denied messaging (product ruling
   gated). Fills the deviation carve-out the parity specs already define.
7. `teacher-dashboard-roster-modernization` — post-cutover convergence:
   roster Redux bridge → TanStack Query, reactabular → design-system
   table/dialogs per the mapping the migration records; removes the
   two-state-layer debt the move-not-rewrite decision knowingly takes on.

Adversarial findings rejected (recorded, no spec written): porting the
remaining Cucumber @eyes tabs (program process, not a dashboard change);
demo-section treatment-arm inclusion (human product-scope);
legacy-roster-freeze tooling during the dual-copy window (ledger process
entry, not spec-worthy); candidate-only analytics additions beyond event
parity (no evidence gathered).

## Notes for reviewers

- OpenSpec root: `sdd-experiment/openspec/` (git-excluded via
  `.git/info/exclude`; files force-added for this PR).
- Validation: `openspec validate --changes` passes for all seven changes
  here (the retained `teacher-dashboard-foundation` prior-art draft fails,
  pre-existing).
- Stacking: homepage/manage-students modify shell capabilities via delta
  specs; api-hygiene modifies the homepage's home-endpoint contract;
  roster-modernization removes the roster bridge requirement. Implement in
  numbered order.
