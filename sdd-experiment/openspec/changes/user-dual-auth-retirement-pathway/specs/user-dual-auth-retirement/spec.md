# Spec: user-dual-auth-retirement

## ADDED Requirements

### Requirement: Stages advance only through evaluated gates
Each stage of the dual-auth retirement SHALL begin only after the prior
gate's exit criteria are met, where every criterion is a query result,
a metric threshold, or a green test suite — never elapsed time alone or
subjective confidence.

#### Scenario: Backfill attempted early
- **WHEN** the stage-3 backfill is proposed while the G1 post-create
  audit metric has been zero for fewer than 14 consecutive days or
  user-email-source-of-truth has not landed
- **THEN** G2 entry fails and the backfill does not run

### Requirement: The audit predicate is the single source of shape truth
Legacy-row counting SHALL use one shared predicate — provider IS NULL OR
provider != 'migrated', evaluated with_deleted — exposed as a scheduled
metric consumed by every gate check and dashboard.

#### Scenario: Soft-deleted legacy row
- **WHEN** a soft-deleted unmigrated user exists after the backfill
  reports complete
- **THEN** the audit metric is nonzero and G2 does not pass

### Requirement: Every gate has a verified rollback
Each stage SHALL have a rollback mechanism proven before its gate opens:
code revert (G0), per-flow ramp-down (G1), demigrate_from_multi_auth
exercised on a sampled batch (G2); demigrate and the :demigrated factory
trait MUST NOT be deleted before G3 entry.

#### Scenario: Backfill batch misbehaves
- **WHEN** post-batch validation fails during the G2 backfill
- **THEN** the affected batch is demigrated, the backfill halts, and
  the audit metric reflects the reversal

### Requirement: Retired means gone
At G3 exit, exactly one account shape SHALL exist: AuthenticationOption
is the only credential store, provider and uid are dropped from users,
the serialized oauth_* keys are removed, and the migrated?/manual?
predicates, demigrate helper, and :demigrated test trait are deleted.

#### Scenario: Retirement grep
- **WHEN** dashboard/app and dashboard/lib are grepped for
  migrated/demigrate tokens after G3
- **THEN** only allowlisted unrelated hits remain
