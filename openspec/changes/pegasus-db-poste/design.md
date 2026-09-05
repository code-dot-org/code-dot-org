# Design: pegasus-db-poste

## Context

Consumer map (verified 2026-07-07, after `pegasus-poste-dead-links`):

| site | tables | op |
|---|---|---|
| `lib/cdo/poste.rb` `Poste.resolve_template` (~:65-73) | poste_messages | read + insert-if-missing |
| `poste.rb` `Deliverer::MESSAGE_TEMPLATES` (~:226) | poste_messages | read (memoized) |
| `poste.rb` `Deliverer#send` (~:230) | contacts | read per send |
| `poste.rb` `Poste2.create_recipient`/`ensure_recipient` (~:406-458) | contacts | read/insert/update |
| `poste.rb` `Poste2.send_message` (~:511-517) | poste_messages read, poste_deliveries insert |
| `bin/cron/deliver_poste_messages_process.rb` (~:100-127) | poste_deliveries | dequeue/update; student `contact_email` scrub post-send |
| `bin/cron/confirm_usage` (~:74-75) | poste_deliveries | backlog read |
| `lib/cdo/delete_accounts_helper.rb:272-276` | contacts, poste_deliveries, poste_opens | read + delete |
| `bin/update-contact-email` | contacts | manual ops read/update |
| tests: `shared/test/test_poste.rb` (19 refs), `lib/test/test_deliverer.rb` (2), `dashboard/test/testing/poste_assertions.rb` (1), `dashboard/test/helpers/delete_accounts_helper_test.rb` | all | |

Transactions: `AccountPurger#really_purge_data_for_account` already
nests `ActiveRecord::Base.transaction` → `PEGASUS_DB.transaction` →
`DASHBOARD_DB.transaction`, and `common_test_helper` wraps both pools
— so moving tables between pools keeps rollback coverage on both
sides. `lib/test/sequel_test_case.rb` wraps only
`Sequel::Model.db` (= PEGASUS_DB via `db.rb:10`) — must wrap both.

Dead tables: `poste_opens` (only reference is the delete at
`delete_accounts_helper.rb:274`), `poste_urls`, `poste_clicks`
(zero references).

## Goals / Non-Goals

**Goals:**
- Email enqueue/drain/purge on dashboard-schema tables; zero missed
  or duplicated sends during cutover; per-step revert.
- `POSTE_DB` constant gone; poste tables gone from the pegasus
  schema.

**Non-Goals:**
- ActiveRecord models for these tables (Sequel stays).
- Any delivery-semantics change (batching, retry, scrubbing all
  verbatim).
- `forms`/`form_geos` (own change), `properties` (own change).
- Replacing Poste with a modern delivery stack — explicitly deferred
  future work; this move makes it possible to do later from the
  dashboard schema at leisure.

## Decisions

**1. One atomic multi-table RENAME.** MySQL's
`RENAME TABLE p.contacts TO d.contacts, p.poste_deliveries TO …,
p.poste_messages TO …` is atomic across all listed tables — the
enqueue path (writes contacts + poste_deliveries + poste_messages
within one logical operation) never sees a half-moved world. Then
three `CREATE VIEW` statements at the old names (updatable; the
foreign-key-like `contact_id` relationships are application-level,
so views suffice). `--revert` drops views and renames back
atomically.

**2. Cutover choreography.** The drain cron fires every minute on
all non-adhoc daemons and frontends enqueue continuously:

1. Ops runs the oneoff (rename + views). Old code enqueues and
   drains through the views — behavior unchanged.
2. Deploy repointed code. During the rollout, mixed old/new
   processes coexist safely: both names resolve to the same base
   tables.
3. Next day (one full drain cycle + PiiScrubberJob observed green),
   ops runs `--drop-view`.
4. Ops drops `poste_opens`, `poste_urls`, `poste_clicks` after the
   data team decides snapshot-vs-discard (they hold historical
   open/click events with IPs — PII; recommend discard).

**3. `POSTE_DB` alias dies here.** After repointing poste.rb, the
drain cron, and `poste_assertions`, and deleting the two
`unsent_pl_emails_*` oneoffs (2019-era incident tooling; git history
keeps them), `POSTE_DB` has zero consumers; remove `db.rb:8` and the
alias's mention in `rubocop_pegasus_db_usage.rb`'s pattern (the cop
keeps matching `PEGASUS_DB`).

**4. `delete_accounts_helper` splits its handle.** It keeps
`@pegasus_db` (still needed for `forms` until
`pegasus-db-forms-drop`) and uses `DASHBOARD_DB` directly in
`remove_poste_data`. The `poste_opens` delete line (:274) is removed
with the table. Purge coverage: deleting deliveries+contacts alone
still fully removes the user's email PII — opens rows are dropped
wholesale with the table.

**5. `SequelTestCase` wraps both pools** (nested
`rollback: :always`), mirroring `common_test_helper`. Leaving
`Sequel::Model.db = PEGASUS_DB` in db.rb untouched here;
`pegasus-db-retire` deletes it.

**6. AR migration = create-if-absent from live schema** (same
pattern as `pegasus-db-hoc`): `SHOW CREATE TABLE` for each of the
three tables is the source of truth; guard
`return if table_exists?(:poste_deliveries)` etc.; prod/staging
no-op because ops renamed first.

## Risks / Trade-offs

- **Mixed-version window:** old code writes through views while new
  code writes the base tables — same rows, same auto-increments;
  MySQL guarantees view-write passthrough for SELECT-* views. The
  drain cron's `WHERE sent_at IS NULL` scan sees all rows regardless
  of which name inserted them. No double-send window exists (row
  claim is the `sent_at` update, unchanged).
- **DMS re-load size:** `poste_deliveries` is the largest pegasus
  table (every email ever sent, partially scrubbed). Data team
  schedules the re-load; until it completes, Redshift consumers see
  the old (frozen) copy — purge propagation resumes when the new
  task is live. Flag the gap window in the data-team sign-off.
- **`CDO.poste_attachment_dir` and SMTP config** are untouched —
  only the storage moves.
- **Adhoc/test stacks:** views cover stale code; `pegasus-db-retire`
  sweeps leftovers.
