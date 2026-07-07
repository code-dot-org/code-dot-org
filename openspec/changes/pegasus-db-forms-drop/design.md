# Design: pegasus-db-forms-drop

## Context

Consumer audit (2026-07-07):

| site | table | op | reachability |
|---|---|---|---|
| `bin/cron/form_geos` | form_geos | R/W geocode backfill (`indexed_at: nil`) | scheduled `*/1`, permanently finds no new rows |
| `lib/cdo/delete_accounts_helper.rb:539,543,558` (`clean_pegasus_forms*`) | forms | anonymizing update | live via purge paths |
| `delete_accounts_helper.rb:548-557` | form_geos | anonymizing update | live via purge |
| `bin/cron/hoc_signup_counts` | forms, form_geos | read | NOT scheduled; requires `CDO.pegasus_reporting_db_reader`, defined nowhere in-repo |
| `contact_rollups_processed.rb:236-352` | (key names only) | consume `'pegasus.forms'` keys | unreachable — `ContactRollupsV2#collect_contacts` extracts only dashboard tables |
| `bin/oneoff/move_census_data.rb:445` | forms | read | dead oneoff |
| `aws/dms/tasks.yml:34-35` | both | replication → `pegasus_production_pii` | live pipeline |
| `aws/redshift/views/csf_workshop_attendance_view.sql:133,318`, `csf_teachers_trained.sql`, `tables/school_activity_stats.sql` | Redshift copies | read | historical reporting over frozen data |

Privacy mechanics: row-level purge anonymization reaches Redshift
only because DMS replicates the UPDATEs. Once replication stops,
a retained Redshift copy freezes — including rows purged afterward.
Hence the gate: drop the Redshift copies (recommended; breaks the
three historical views) or the data team owns the frozen snapshot's
compliance story.

## Goals / Non-Goals

**Goals:** zero code references to forms/form_geos; tables dropped;
purge paths simplified without weakening PII removal (table drop ≥
row anonymization).

**Non-Goals:** migrating the data anywhere; preserving the
CSF-workshop Redshift views (data team's call); touching
`census_submissions` (a dashboard table `move_census_data.rb` also
reads — the oneoff is deleted, the table untouched).

## Decisions

**1. Archive-and-drop, not move (D2, user 2026-07-07).** The data is
write-dead; its only legal obligation is deletion-on-request, which
whole-table DROP satisfies maximally. Moving it read-only would
preserve dead weight and the purge plumbing forever.

**2. Code deletions are NOT gated; only the DMS edit and ops DROP
are.** Every deleted code path is dead or no-op regardless of the
data-team decision (the anonymizers act on tables nothing reads
in-app). The PR can merge before the sign-off completes, with the
runbook's DROP step blocked on it. Exception: the `tasks.yml` edit
ships with the sign-off, since it changes the DATA stack's
generated task set.

**3. `hoc_signup_counts` is deleted, not repointed.** It is
unscheduled, reads a config key that does not exist in the repo, and
aggregates a table that stopped growing. Seasonal HoC signup
counting, if wanted again, starts from dashboard data.

**4. `@pegasus_db` in DeleteAccountsHelper.** After removing the
forms methods, grep the class for remaining `@pegasus_db` uses; if
zero (expected after `pegasus-db-poste`), remove the ivar and its
assignment. If `pegasus-db-poste` has not merged yet, leave the ivar
(it still serves `remove_poste_data`) — order-tolerant task wording.

## Risks / Trade-offs

- **Historical reporting loss** if the data team drops the Redshift
  copies. Mitigation: their explicit choice, in writing, in the PR.
- **A latent forms writer somewhere out-of-repo.** The `confirm_usage`
  freshness check (removed in `pegasus-poste-dead-links`) had been
  asserting recent writes; ops should confirm from monitoring history
  how long ago it went red — recorded in the gate task as evidence.
- **AccountPurger's `PEGASUS_DB.transaction`** wrapper still wraps
  nothing pegasus-side after this change + db-poste; it is removed in
  `pegasus-db-retire`, not here (keeps this change purely
  forms-scoped).
