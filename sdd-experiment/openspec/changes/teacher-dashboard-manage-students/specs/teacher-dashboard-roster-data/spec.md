# Spec: teacher-dashboard-roster-data

## ADDED Requirements

### Requirement: Typed wrappers for reused roster endpoints
The roster's server traffic SHALL flow through typed core wrappers with
recorded-JSON schemata and MSW handlers, reusing the legacy endpoints
unchanged: `GET/POST/PATCH /dashboardapi/sections/:id/students` (and the
per-student update/remove paths), `POST .../students/bulk_add`,
`GET .../students/completed_levels_count`,
`/dashboardapi/sections/transfers`, and
`GET /api/v1/roster/{clever,google}/sections/sync`. No hand-rolled fetch or
jQuery ajax survives the move; the adapter preserves request shapes (URL,
method, payload) verified against recorded legacy requests.

#### Scenario: Request-shape equivalence
- **WHEN** the moved slice issues any roster mutation through the adapter
- **THEN** URL, method, and payload match the recorded legacy `$.ajax`
  request for the same action, and CSRF is supplied by the core transport

#### Scenario: Error paths preserved
- **WHEN** the server responds as legacy does for at-capacity (error
  status), age-gate rejection, or session expiry (401)
- **THEN** the moved slice surfaces the same user-visible outcome as legacy

### Requirement: Package-encapsulated store with a one-way bridge
The moved `manageStudentsRedux` SHALL run in a store scoped to the roster
page (no global registration). Its reads of `teacherSections` and
`currentUser` state SHALL be satisfied by a bridge hydrated from the
shell's query data (selected section, current user), one-directional with
Query invalidation as the only reverse channel (re-expressing the legacy
`needsReload`/student-count signals).

#### Scenario: Section switch mid-view
- **WHEN** the teacher switches sections in the shell sidebar while on the
  roster
- **THEN** the bridge rehydrates, the slice reloads students for the new
  section, and no state from the previous section leaks into the table

#### Scenario: Mutation invalidates section data
- **WHEN** a student add/remove changes the section's student count
- **THEN** the shell's selected-section query is invalidated so dependent
  chrome (counts, empty-state gates on other tabs) refreshes, matching
  legacy cross-slice behavior

### Requirement: Roster MSW fixtures with write-through state
Roster fixtures SHALL register via core's mock registry with write-through
scenario state so mutation flows (add → edit → save → remove) work offline
end-to-end in the dev shell and in component tests, per discovered scenario.

#### Scenario: Offline mutation round-trip
- **WHEN** a developer adds and edits a student in the standalone dev shell
  under the `word-login` scenario
- **THEN** the table reflects the changes from the mock store without Rails
  running
