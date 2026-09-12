# Proposal: teacher-dashboard-api-hygiene

Improvement change (not a parity/migration change). Derived from the
adversarial review of the migration context gathered 2026-07-04; every item
carries source evidence read in this repository. Sequenced after the
consuming migration changes land; nothing here blocks them.

## Why

The migration specs deliberately preserve several legacy server quirks to
keep parity honest. Preserving them forever would be a mistake — each is a
correctness or security smell with a concrete fix, and the adversarial pass
found the migration itself is about to add a new instance of the same
pattern (flash drain on GET) unless a single policy is set.

Findings, with evidence:

1. `GET /teacher_dashboard/get_drawer_data` mutates state during a read —
   `SchoolInfoInterstitialHelper.update_last_seen_timestamp(current_user)`
   inside the GET (`teacher_dashboard_controller.rb`, `get_drawer_data`).
2. The homepage migration's `GET /api/v1/teacher_dashboard/home` drains
   flash on read (`teacher-dashboard-homepage-v2/design.md` D3) — same
   read-mutates-state pattern, introduced new. One policy should govern
   both.
3. `Api::V1::SectionsController` skips CSRF verification on `#update`
   (`skip_before_action :verify_authenticity_token, only: [:update]`,
   `sections_controller.rb:9`) — a state-changing endpoint the homepage
   lifecycle flows call.
4. TOS acceptance is recorded silently during page render
   (`current_user.update_user_tos_version_accept()` in
   `show.html.haml:47`) — consent recorded without user action; the
   homepage change already deviates to explicit acceptance and needs a
   real endpoint.
5. `TeacherDashboardController#unit_in_aif` has a dead branch: `Unit.find`
   raises on bad ids (404), so the `else` returning `{aif: false}` is
   unreachable — the code misleads readers about the contract.

## What Changes

- Split read from write in the drawer flow: `get_drawer_data` becomes a
  pure GET; the last-seen-timestamp update moves to an explicit
  `POST /api/v1/teacher_dashboard/drawer_seen` (name final at design), with
  the candidate homepage calling it after displaying the interstitial.
  Legacy homepage continues calling the old route until cutover; the old
  GET keeps its side effect until then (dual-write window, then removed).
- Apply the same policy to flash: the home endpoint's drain moves to an
  explicit acknowledge call, or flash relay is redesigned to a
  response-header/one-time-token scheme — decided in design, one pattern
  for both.
- Remove the CSRF skip on `Api::V1::SectionsController#update`, fixing the
  legacy callers that made the skip necessary (they must send the token via
  the standard client). Security review sign-off required.
- Add an explicit TOS acceptance endpoint for the candidate's
  explicit-accept flow; the render-time auto-accept remains legacy-only and
  is retired at cutover (product ruling on record required first).
- Delete the dead `unit_in_aif` else branch and add a controller test
  pinning the real contract (bad id → 404).

## Capabilities

### New Capabilities

- `teacher-dashboard-api-write-semantics`: reads do not mutate; writes are
  explicit, CSRF-protected endpoints; the drawer, flash, TOS, and CSRF-skip
  items above are the concrete instances.

### Modified Capabilities

- `teacher-dashboard-home-bootstrap-api`: the flash-drain-on-GET behavior
  specified by the homepage change is replaced by the explicit-acknowledge
  pattern chosen here.

## Impact

- `dashboard/app/controllers/teacher_dashboard_controller.rb`,
  `dashboard/app/controllers/api/v1/sections_controller.rb`, new
  `Api::V1::TeacherDashboard` write endpoints, Rails tests.
- `frontend/packages/teacher-dashboard` call sites (drawer, flash, TOS).
- Legacy `apps/src` callers of `sections#update` (CSRF token supply).
- Requires security review; no schema/data migration.
