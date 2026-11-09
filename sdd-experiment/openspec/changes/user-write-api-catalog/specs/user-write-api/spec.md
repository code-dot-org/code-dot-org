# Spec: user-write-api (catalog extension)

## ADDED Requirements

### Requirement: Catalog completeness
Every controller-reachable User mutation SHALL flow through a named
command from the program catalog; sites outside the catalog are limited
to the enumerated exemptions (Devise-internal controllers,
test_controller.rb, ability.rb's unsaved sentinel, model-internal saves
pending callback retirement).

#### Scenario: Inventory audit
- **WHEN** the mutation-site inventory is re-run after the three
  per-surface changes land
- **THEN** every hit is classified absorbed/exempt and zero sites are
  unclassified

### Requirement: Migrations are equivalence-proven, tests-first
Each endpoint migrated to a command SHALL have request-level
characterization tests (status, body, users + authentication_options row
deltas, side effects) written and green before extraction, and those
tests SHALL pass unchanged after extraction, with any deviation
enumerated and justified in the migrating change's design.

#### Scenario: Extraction with pins
- **WHEN** an endpoint is migrated to its catalog command
- **THEN** the pre-existing characterization tests pass without
  modification

#### Scenario: Branching matrix
- **WHEN** an endpoint branches on role or account shape
- **THEN** its characterization suite covers student/teacher ×
  migrated/sponsored (× current-password where applicable) before
  extraction begins

### Requirement: Enforcement graduates with coverage
The `UserMutationOutsideService` cop SHALL move each migrated surface off
its todo list when that surface's change lands, and SHALL enforce
repo-wide once foundation plus the three per-surface changes are
complete; the todo list MUST NOT grow after foundation lands.

#### Scenario: New mutation site post-graduation
- **WHEN** a controller adds a direct `user.update` call after
  graduation
- **THEN** the build fails lint
