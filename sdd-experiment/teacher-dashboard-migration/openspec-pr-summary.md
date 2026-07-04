# Teacher Dashboard migration — OpenSpec planning (planning only)

This PR contains OpenSpec planning artifacts only. No product code, no
package scaffolding, no route or Rails changes. Authored by Fable
2026-07-04 from direct source reading in this checkout plus the program
context in `sdd-experiment/teacher-dashboard-migration/` (prior-session
ledger; referenced but intentionally not included in this PR).

Scope ruling (product owner, 2026-07-04): the FULL V2 teacher-dashboard
feature surface ports — every tab and every flag-gated feature, BOTH arms
of every gate (demo-section treatment, onboarding checklist + tours, AITA
lesson summaries, AI podcasts, AI artifact resources, skills dashboard,
student snapshot included). One OpenSpec change per feature set, in an
explicit sequence. No "human product-scope" exclusions remain.

## Migration sequence (one change per feature set)

| # | Change | Surface | Visual gate |
| - | ------ | ------- | ----------- |
| 1 | `teacher-dashboard-shell` | package, bootstrap API, routes, sidebar (incl. flag-gated entries), parity harness | pixel (DSCO chrome) |
| 2 | `teacher-dashboard-homepage-v2` | homepage incl. demo-section arms, onboarding + tours, alerts, popups, lifecycle | pixel (DSCO surface) |
| 3 | `teacher-dashboard-manage-students` | roster move-not-rewrite, all login types, compliance dialogs | behavior/a11y |
| 4 | `teacher-dashboard-stats` | stats table, PL branch | behavior/a11y |
| 5 | `teacher-dashboard-login-info` | six login-type variants, print cards/certificates, parent letter | behavior/a11y + print |
| 6 | `teacher-dashboard-lesson-materials` | resources + AITA summaries + podcasts (both gating paths) + AI artifacts | pixel |
| 7 | `teacher-dashboard-calendar` | unit calendar + empty state | pixel |
| 8 | `teacher-dashboard-text-responses` | response table + shared unit-selector | behavior/a11y |
| 9 | `teacher-dashboard-assessments` | MC/match/free-response, surveys, feedback CSV | behavior/a11y |
| 10 | `teacher-dashboard-projects` | projects list, single-sided empty-state quirk | behavior/a11y |
| 11 | `teacher-dashboard-settings` | full settings form, delete, save-blocker, redirect | pixel |
| 12 | `teacher-dashboard-course-unit-overview` | course/unit/nested overviews, MODULARITY arms, AccessDenied rewrites, shared progress store module | behavior/a11y |
| 13 | `teacher-dashboard-progress` | grid, floating chrome, panel/lock/scores/view-as, GE gating, perf gate | behavior/a11y + perf |
| 14 | `teacher-dashboard-ai-chat-settings` | access controls tab + AI-diff FAB entry point | pixel (tab) |
| 15 | `teacher-dashboard-skills-dashboard` | DCDO-gated tab | pixel |
| 16 | `teacher-dashboard-student-snapshot` | experiment-gated tab, six widgets | pixel |

Visual-gate determinations are per-surface, evidence-based (grep-verified
component usage): DSCO/MUI-era TSX surfaces are pixel-gated; legacy
non-DSCO JSX surfaces gate on behavior/copy/a11y and carry an explicit
design-system mapping (legacy widget → DSCO/MUI target, temporary-wrapper
needs) executed by the post-cutover modernization pass. Common mapping:
reactabular-table + sortabular → MUI Table; `legacySharedComponents/
Button` → MUI Button; react-tooltip → DSCO tooltip; `skeletonize-content`
→ MUI Skeleton; `SafeMarkdown` → `@code-dot-org/markdown`; existing DSCO
leaf widgets (fontAwesomeV6Icon, dialog, dropdown, link) retained.

Every change carries task-line gates for behavior-scenario discovery and
(where applicable) visual-parity planning; every flag gate is a scenario
axis with BOTH arms covered and flag state pinned per scenario (a parity
claim under an unpinned flag state is void); MSW standalone mode exposes
discovered scenarios as visible choices; implementation may use Playwright
MCP for capture (planning did not); captures require serving-checkout
validation and use `http://localhost-studio.code.org:9000` only.
Change 1 supersedes the earlier `teacher-dashboard-foundation` draft
(retained untouched as prior art; it predates this session's validator
fixes and fails `openspec validate`).

## Improvement changes (separate from parity; adversarially derived)

Per instruction, an adversarial review pass ran over the gathered context
(prior ledger claims re-verified against source; this session's own
proposals cross-examined). Findings that survived verification became four
improvement changes; each proposal opens with its evidence:

17. `teacher-dashboard-api-hygiene` — reads-don't-mutate policy: drawer GET
    side effect → explicit POST; the homepage plan's own flash
    drain-on-GET (a new instance of the same smell, caught by the
    adversarial pass) → explicit acknowledge, delta-spec'd against the
    homepage change; CSRF-skip removal on `sections#update`
    (`sections_controller.rb:9`, verified); explicit TOS-accept endpoint
    (render-time auto-accept, `show.html.haml:47`, verified); dead
    `unit_in_aif` branch removal. Sequenced after homepage.
18. `teacher-dashboard-section-serializers` — the three hand-built section
    hashes in `section.rb` become named, byte-identical, tested
    serializers; overlap fields and both merge precedences pinned.
    Sequenced after shell (its equivalence tests are the safety net).
19. `teacher-dashboard-resilience-ux` — retriable error states (legacy
    swallows section-load failures; `selectedSectionLoader.ts:52-56`,
    verified), loading skeletons, access-denied messaging (product ruling
    gated). Fills the deviation carve-out the parity specs define.
20. `teacher-dashboard-roster-modernization` — post-cutover convergence:
    roster Redux bridge → TanStack Query, reactabular → design-system
    table/dialogs per the recorded mappings; removes the two-state-layer
    debt the move-not-rewrite decision knowingly takes on.

Adversarial findings rejected (recorded, no spec written): porting the
remaining Cucumber @eyes tabs as a standalone effort (each tab's change
ports its own oracles); legacy-freeze tooling during the dual-copy window
(ledger process entry, not spec-worthy); candidate-only analytics
additions beyond event parity (no evidence gathered).

## Notes for reviewers

- OpenSpec root: `sdd-experiment/openspec/` (git-excluded via
  `.git/info/exclude`; files force-added for this PR).
- Validation: `openspec validate --changes` passes for all twenty changes
  here (the retained `teacher-dashboard-foundation` prior-art draft fails,
  pre-existing).
- Stacking: homepage/manage-students modify shell capabilities via delta
  specs; api-hygiene modifies the homepage's home-endpoint contract;
  roster-modernization removes the roster bridge requirement; positions
  4-16 flip per-tab map entries the shell defines as data (no delta
  needed). Implement in numbered order; 12 before 13 is a hard dependency
  (shared progress store module).
