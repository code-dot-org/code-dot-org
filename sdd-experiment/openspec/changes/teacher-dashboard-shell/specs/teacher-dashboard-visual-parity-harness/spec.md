# Spec: teacher-dashboard-visual-parity-harness

## ADDED Requirements

### Requirement: Reusable legacy-vs-candidate visual gate
`frontend/packages/e2e-tests` SHALL provide a reusable helper that, within a
single Playwright run against one local Rails server
(`http://localhost-studio.code.org:9000`), captures a named legacy surface
and its candidate counterpart, masks declared dynamic regions, and
pixel-compares region-scoped screenshots. Mechanism (pinned so
implementers do not design it): both surfaces are captured in the same
run as buffers via Playwright `page.screenshot({clip, mask})` — `clip`
from a declared locator's bounding box, `mask` as an array of locators —
and diffed with `pixelmatch` (devDependency) against a per-surface
declared `maxDiffPixelRatio`. There are no stored golden baselines for
this gate (both images come from the live run); on failure the helper
writes both captures plus the diff PNG into the run's Playwright
test-results output. A comparison pair is data: `{name, legacyUrl,
candidateUrl, region: locator, masks: locator[], maxDiffPixelRatio}`. If
the `@code-dot-org/playwright-support` visual package has landed by
implementation time, its primitives MAY replace the hand-rolled
pixelmatch plumbing (same declaration shape; recorded as a substitution).
The helper is built once in this change and consumed by every subsequent
teacher-dashboard feature change. Implementers MAY use Playwright MCP for
interactive capture and mask tuning during implementation.

#### Scenario: Same-run comparison
- **WHEN** the harness runs a comparison pair
- **THEN** both captures come from the same browser context, same Rails
  checkout, and same seeded data, so diffs reflect UI changes rather than
  environment drift

#### Scenario: Masked dynamic content
- **WHEN** a surface contains volatile content (avatars, join codes, dates,
  student names)
- **THEN** declared mask regions are excluded from the comparison

### Requirement: Serving-checkout validation precedes capture
Before any baseline or checkpoint capture, the harness (or its setup) SHALL
verify that the Rails server and the apps/webpack dev server processes are
serving this worktree — process cwd must point at the worktree — and abort
with a clear message otherwise. A capture from the wrong checkout is worse
than no capture.

#### Scenario: Wrong checkout aborts
- **WHEN** the Rails process cwd points at a different checkout than the one
  under test
- **THEN** the harness refuses to capture and names both paths in the error

### Requirement: Shell chrome baselines are DSCO-scoped
Visual parity capture in this change SHALL cover only the shell surfaces
already built on DSCO/component-library or themed MUI, where pixel parity is
part of the migration contract: the section-scoped sidebar
(`TeacherNavigationBar` region) in default and collapsed/active states, and
the page-header chrome of the tab frame. Baseline images are captured from
legacy `/teacher_dashboard/sections/:id/*`; checkpoints from
`/frontend-studio/teacher_dashboard/sections/:id/*`. Surfaces not yet
DSCO-based are excluded from pixel gating; their parity is behavioral and
a11y-based per the navigation spec.

#### Scenario: Sidebar parity gate
- **WHEN** the shell chrome comparison runs for a seeded section under the
  default flag state
- **THEN** the masked, region-scoped diff for the sidebar is within the
  declared threshold, or the run fails with the diff image attached

#### Scenario: Non-DSCO surface not pixel-gated
- **WHEN** a compared route contains legacy non-DSCO content regions
- **THEN** those regions are outside the compared bounds (scoped or masked),
  not silently included
