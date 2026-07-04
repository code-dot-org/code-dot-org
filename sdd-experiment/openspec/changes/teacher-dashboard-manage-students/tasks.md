# Tasks: teacher-dashboard-manage-students

Depends on teacher-dashboard-shell being implemented. Move-not-rewrite
throughout: record blocker evidence (file, import, reason) before any
deviation from verbatim extraction.

## 1. Data layer (core wrappers + mocks)

- [ ] 1.1 Record legacy roster traffic from a local Rails run: students
      list/add/update/remove/bulk_add, transfers, completed_levels_count,
      sync — request and response JSON per login type; commit as fixtures
- [ ] 1.2 Typed core wrappers + schemata for each endpoint; parser tests
      against recorded JSON
- [ ] 1.3 MSW handlers with write-through scenario state (add/edit/remove
      round-trips work offline)
- [ ] 1.4 Adapter for the moved slice's `$.ajax` call sites over the core
      transport; request-shape equivalence tests against the recordings

## 2. Behavior scenario discovery (gate)

- [ ] 2.1 Walk the oracles: `manage-students-tab.spec.ts` + POMs, the four
      roster Cucumber features (views_eyes, code_review_groups, both
      age-gating), legacy manageStudents jest suite; record the scenario
      matrix with evidence and coverage choices
- [ ] 2.2 Build MSW fixtures for the matrix and expose them as visible
      dev-shell choices (floor: six login types, age-gated, at-capacity,
      restricted, empty, transfer-target, mutation-error)

## 3. Move the slice and bridge

- [ ] 3.1 Extract `manageStudentsRedux.js` into the package; package-scoped
      store Provider on the roster page (no global registration)
- [ ] 3.2 Implement the one-way bridge (shell Query state →
      teacherSections/currentUser reads) with invalidation callbacks for
      student-count/section changes; section-switch-mid-edit test
- [ ] 3.3 Re-express the slice's legacy jest coverage against the moved
      slice (same behaviors, adapted harness)

## 4. Move the UI

- [ ] 4.1 Extract wrapper + `Table/` + cells read-only path with import
      adapters (`@cdo/locale`, `SafeMarkdown`→`@code-dot-org/markdown`,
      DemoSectionTooltip disposition per demo-section exclusion); mount at
      the candidate roster route; alias redirect target verified
- [ ] 4.2 Extract mutation flows and dialogs in oracle order: add/edit/save,
      remove-confirm, bulk add, password/secret reset, login export +
      print login cards + parent letter, transfers/move-students,
      code-review-groups, sharing controls, age-gating modals
- [ ] 4.3 Extract/adapt `SyncOmniAuthSectionControl` (+ reauthorize links
      into legacy OAuth flows); blocker-evidence rule applies; thin
      re-implementation over the same endpoints only if extraction exceeds
      budget, recorded as such
- [ ] 4.4 Component tests over MSW per discovered scenario; vitest-axe +
      keyboard-operability per dialog; en-US copy parity check against
      legacy strings

## 5. Shell integration

- [ ] 5.1 Flip the shell per-tab map: `roster` → candidate route; verify
      `manage_students` alias redirect lands on the candidate roster
- [ ] 5.2 Homepage card "Add students" entry resolves to the candidate
      roster once both changes are live (shared per-tab map, no
      roster-specific code)

## 6. E2E and verification

- [ ] 6.1 Parameterize the existing Playwright roster spec/POMs to run
      against both legacy and candidate routes; candidate run green without
      weakened assertions, legacy run stays green
- [ ] 6.2 Port assertions from the four roster Cucumber features into the
      candidate Playwright coverage (oracle port, not new expectations)
- [ ] 6.3 `yarn lint:fix && yarn release:dryrun` (frontend);
      `./tools/hooks/pre-commit` (repo root); legacy jest suite untouched
      and green
- [ ] 6.4 Live check on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/roster`
      (serving-checkout validated first): per-login-type variants,
      mutations, dialogs, provider sync entry points
- [ ] 6.5 Standalone MSW check: all discovered scenarios selectable; offline
      mutation round-trip works
