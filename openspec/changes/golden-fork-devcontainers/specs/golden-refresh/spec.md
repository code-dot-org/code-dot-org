# golden-refresh

## ADDED Requirements

### Requirement: Background refresh produces a current local golden
The system SHALL maintain a per-machine "golden" state (images + repo clone) refreshed in the background — never on the sandbox-create path — by: `git fetch`, `bundle check || bundle install`, `rake db:migrate`, `rake seed:default`, executed in a container against the current golden DB, then re-baked as a single replaced local layer.

#### Scenario: Sandbox create never waits on refresh
- **WHEN** a refresh is in progress and the user creates a sandbox
- **THEN** the sandbox forks the previous golden immediately and creation stays within its latency budget

#### Scenario: Single-layer re-bake
- **WHEN** two consecutive refreshes complete
- **THEN** the local golden image's layer count and total size are unchanged apart from the one replaced data layer (no commit-chain growth)

### Requirement: Refresh triggers
Refreshes SHALL trigger on: a daily schedule or first use of the day, detection of lockfile/schema/curriculum input changes after fetch, and explicit user demand (`sandbox refresh`).

#### Scenario: Lockfile change propagates same day
- **WHEN** a fetched commit changes `Gemfile.lock`
- **THEN** the next triggered refresh reconciles gems so new sandboxes need no `bundle install`

### Requirement: Never commit a failed refresh
The refresh SHALL publish a new golden only after all commit checks pass: migrate exit 0; seed exit 0; `mysqladmin ping` and redis PING; a smoke query on seeded models (e.g. `Unit.count > 0`); `rake db:migrate:status` reports no `down` rows; clean mysqld shutdown. On any failure the refresh container SHALL be discarded, the last good golden retained, and the failure surfaced to the user.

#### Scenario: Poisoned migration
- **WHEN** a fetched migration raises mid-`db:migrate`, leaving applied DDL with no schema_migrations row
- **THEN** no new golden is published, existing and new sandboxes keep forking the last good golden, and the error (including the offending migration name) is reported

#### Scenario: Half-seeded but pingable database
- **WHEN** mysqld answers ping but the smoke query fails
- **THEN** the refresh is discarded and reported, not committed

### Requirement: Refresh never disturbs running sandboxes
A refresh and golden replacement SHALL have no observable effect on running sandboxes, which retain their image layers until destroyed.

#### Scenario: Refresh under load
- **WHEN** a refresh completes while sandboxes run continuous DB read/write workloads
- **THEN** the workloads observe zero errors, and a sandbox created afterward reflects the new golden while existing ones are unchanged

### Requirement: Refresh performance budget
A no-input-change refresh SHALL complete within 3 minutes on reference hardware; with the seed hash guard in place, the no-op seed portion SHALL not exceed 20 s.

#### Scenario: Nothing changed overnight
- **WHEN** the daily refresh runs and no seed inputs changed
- **THEN** total refresh wall time is ≤ 3 min and the seed step short-circuits
