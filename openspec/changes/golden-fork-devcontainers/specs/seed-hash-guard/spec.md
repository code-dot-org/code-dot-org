# seed-hash-guard

## ADDED Requirements

### Requirement: Whole-input hash short-circuit for seed:default
`rake seed:default` SHALL compute a content hash over its inputs (curriculum content directories, `dashboard/db/schema.rb`, `dashboard/lib/tasks/seed.rake`, and every file set any seed subtask reads — including `course_offerings` JSON) and, when the hash matches the stored last-seeded hash for that database, skip all seed subtasks; the guard SHALL be bypassable via an environment flag.

#### Scenario: Nothing changed
- **WHEN** `seed:default` runs twice with no input change
- **THEN** the second run performs no subtask work and completes within Rails-boot time (~13 s measured; budget ≤ 20 s)

#### Scenario: Any input change disables the short-circuit
- **WHEN** any single curriculum file changes
- **THEN** the full task chain runs and the existing per-file md5 guards handle incrementality

#### Scenario: Forced reseed
- **WHEN** the bypass flag is set
- **THEN** all subtasks run regardless of the stored hash

### Requirement: Hash keyed to database identity
The stored hash SHALL be recorded in the target database itself (not the filesystem), so forks, restores, and parallel databases each carry their own accurate last-seeded state.

#### Scenario: Fork inherits, then diverges
- **WHEN** a database is forked and the source is later reseeded with new content
- **THEN** the fork's stored hash still reflects the fork's own content and a catch-up inside the fork behaves correctly

### Requirement: course_offerings gains change detection
`CourseOffering.seed_all` SHALL skip unchanged input files (per-file digest), replacing the current unconditional 729 find-or-update writes per run.

#### Scenario: Unchanged offerings
- **WHEN** `seed:course_offerings` runs with no offering file changed
- **THEN** no offering rows are written
