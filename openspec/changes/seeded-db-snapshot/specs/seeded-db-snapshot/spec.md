# seeded-db-snapshot

## ADDED Requirements

### Requirement: Snapshot key is a content hash of the seed inputs
The snapshot SHALL be keyed by a digest computed from git tree hashes of the
declared seed input paths (curriculum config dirs, `dashboard/db/migrate` and
schema, seed rake sources, seed fixtures). The key MUST be reproducible from
any clean checkout of the same commit; it SHALL NOT depend on mtimes, stat
data, or the machine computing it.

#### Scenario: Same inputs, same key
- **WHEN** the key is computed on two different machines at the same commit
- **THEN** both produce the identical digest

#### Scenario: Seed input change re-keys
- **WHEN** any declared seed input (e.g. a file under
  `dashboard/config/scripts` or a new migration) changes
- **THEN** the computed key differs from the previous one

### Requirement: CI produces and publishes the snapshot on hash change
A GitHub Actions job SHALL seed MySQL from scratch and publish the resulting
snapshot to GHCR as an OCI artifact tagged with the content hash. The job
SHALL skip seeding when an artifact for the current hash already exists.
Snapshot metadata MUST record the MySQL server version that produced it.

#### Scenario: Hash miss triggers seed and publish
- **WHEN** the job runs and no GHCR artifact exists for the computed hash
- **THEN** it runs the full seed and publishes a zstd-compressed datadir
  snapshot under that hash, with the MySQL version recorded

#### Scenario: Hash hit skips seeding
- **WHEN** the job runs and an artifact for the computed hash exists
- **THEN** it exits without seeding or re-publishing

### Requirement: Consumers restore on hash hit and seed on miss
Seed consumers SHALL compute the key, pull and restore the matching
snapshot when one exists, and MUST fall back to the full seed when none
exists or the pull fails. Consumers are the skaffold `setup-db` profile,
devcontainer setup, and CI jobs. A cache miss SHALL NOT fail environment
setup.

#### Scenario: Restore on hit
- **WHEN** `setup-db` runs and a snapshot for the computed hash is on GHCR
- **THEN** it restores the datadir instead of running the seed

#### Scenario: Fallback on miss
- **WHEN** no snapshot exists for the computed hash, or the pull fails
- **THEN** the consumer runs the full seed and setup succeeds

### Requirement: Restore is followed by migration
Every restore SHALL run `db:migrate` against the restored database before
the environment is considered ready, so branch-local migrations newer than
the snapshot are applied.

#### Scenario: Branch ahead of snapshot
- **WHEN** the current branch adds a migration not present in the snapshot
- **THEN** after restore, `db:migrate` applies it and
  `db:abort_if_pending_migrations` passes

### Requirement: Restore refuses a mismatched MySQL version
A consumer SHALL compare the snapshot's recorded MySQL server version
against its own before restoring a datadir snapshot, and MUST fall back to
the full seed on mismatch rather than restore.

#### Scenario: Version mismatch falls back
- **WHEN** the snapshot was produced by a different mysql:8.0 minor version
  than the consumer runs
- **THEN** the consumer skips the restore and runs the full seed
