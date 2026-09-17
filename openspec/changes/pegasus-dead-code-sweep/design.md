# Design: pegasus-dead-code-sweep

## Context

Verified inventories live at `specs/pegasus-removal/inventory-directory.md`
and `inventory-gems-infra.md`. Every deletion below was confirmed
caller-free on 2026-07-07; the implementer re-verifies each with the
grep listed in tasks.md before deleting, because the tree moves.

## Goals / Non-Goals

**Goals:**
- Delete every pegasus orphan that has zero callers, in one reviewable
  change with no runtime behavior difference.

**Non-Goals:**
- Anything with a live caller. In particular: `lib/cdo/poste.rb`
  (separate change), the `lib/cdo/pegasus/` files still required by
  production crons or middleware (separate changes), the `pegasus/`
  directory and its rake plumbing (needed until the DB retires),
  `lib/cdo/url_converter.rb` and the `pegasus_host` config key (live
  Cucumber URL rewriting; renamed later), and all `PEGASUS_DB` code.
- Dropping database tables. This change touches no schema.

## Decisions

**1. Verify-then-delete, per file.** Each deletion task pairs with a
grep proving zero references. If a grep finds a reference the
inventory missed, the implementer skips that deletion and records it
in the task list rather than chasing it — scope stays fixed.

**2. `thin` gem leaves with `bin/pegasus-server`.** `thin` appears
only in that script (`thin start -p CDO.pegasus_port`). `rerun`
stays — `bin/dashboard-server` uses it.

**3. `rack_csrf` and `pdf-reader` are Gemfile-only deletions.**
Neither is required anywhere (`Rack::Csrf`, `PDF::Reader`: zero
matches). Lock regeneration via `bundle install`; expect only
removals in the diff.

**4. The ELB question is settled.** A read-only AWS check
(2026-07-07, account 475661607190, us-east-1) found ZERO classic
ELBs — all three names in `server_tools.rb`'s
`deregister_frontends_internal` (`production-dashboard`,
`production-pegasus`, `production-redirects`) reference
decommissioned infrastructure. The method is deleted whole if
caller-free (verify-then-delete, as with everything else here).

**5. `vpc.yml.erb` SG rules ride the next stack update.** Nothing
listens on 9001; removing the three "Pegasus Puma" ingress/egress
blocks is inert until infra next converges the VPC stack. Noted in
the PR description, no deploy task here.

**6. Oneoff scripts are deleted even when they still parse.** They
reference deleted paths (`pegasus/sites.v3`, `pegasus/data`), dead
tables, or completed backfills. Git history preserves them. The one
already-broken script (`bin/oneoff/wipe_data/young_emails`, broken
require path) proves nothing exercises this set.

## Risks / Trade-offs

- **Risk:** a "dead" script is someone's undocumented ops tool.
  Mitigation: everything deleted requires deleted code paths or dead
  tables to function; the two manual-ops candidates that still work
  against live tables (`bin/update-contact-email`,
  `bin/mysql-client-pegasus-*`) are explicitly retained for the
  `pegasus-db-retire` change.
- **Risk:** Gemfile.lock churn beyond the three gems (transitive
  removals). Acceptable; review the lock diff is a task.
