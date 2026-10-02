# Zero ETL Materialized View templates

This directory holds one generated SQL ERB template per Redshift materialized view in the Zero ETL
analytics export. For each model that declares `export_to_analytics`, there are up to two files:

- `<table>.sql.erb` — the **non-PII** view, created as `learning_platform_<env>.<table>`.
- `<table>_pii.sql.erb` — the **PII** view, created as `learning_platform_<env>_pii.<table>`.

The `<%=environment_type%>` ERB placeholders are filled in at provision time (`test`, `production`),
so one template serves every environment. The materialized views read the Learning Platform MySQL
data that Zero ETL continuously replicates into Redshift.

## These files are generated — do not edit them by hand

They are produced by `Cdo::Aws::Redshift::MaterializedViewManager.generate_all_ddl_templates` from
the current ActiveRecord models. Regeneration is triggered:

- automatically by `rake db:migrate` (development), so a migration that reshapes an exported table
  shows up here as a template diff;
- on demand by `bundle exec rake analytics_export:generate_materialized_view_templates`;
- and at the start of `analytics_export:provision_materialized_views`.

To change a view, change its source — a Rails migration (columns) or the model's `data_classification`
declaration (which columns land in which view) — then regenerate. Editing a `.sql.erb` directly will
be overwritten on the next regeneration.

Which columns appear is governed by each column's data classification:

- non-PII view (`learning_platform_<env>`): `:public` and `:confidential` columns.
- PII view (`learning_platform_<env>_pii`): `:public`, `:confidential`, and `:restricted` columns.
- `:highly_restricted` columns appear in neither view.

A model whose non-PII (or PII) projection has no columns produces no corresponding template — and a
template that no longer maps to any view is pruned during regeneration, so a deleted file here means
that view no longer exists.

## Committing these files does NOT change Redshift

Merging a change to this directory does **not** update the materialized views provisioned in the
Redshift cluster. These templates only **record the pending change** so it is visible in code review
and git history. Redshift cannot `ALTER` a materialized view, so any column or classification change
requires a coordinated `DROP` + `CREATE` of the affected views — which drops and recomputes them and
can briefly interrupt the data team's downstream dbt models and reports. We therefore never deploy
these changes automatically.

## Deploying the change to Redshift

Before (or shortly after) merging a Pull Request that changes this directory, coordinate with the
data analytics ("RED") team and the Infrastructure Engineering team to schedule the rebuild. An
Infrastructure Engineer with admin AWS credentials then runs the provision task on their workstation:

    VALIDATE (preview — submits nothing to Redshift):

        code-dot-org $ export AWS_PROFILE=codeorg-admin
        code-dot-org/dashboard $ DRY_RUN=1 bundle exec rake 'analytics_export:provision_materialized_views[production]'
          # Review the Add / Update / Drop plan. It should list only the views changed in this branch.

    EXECUTE (DROP + CREATE the changed views, drop orphans):

        code-dot-org/dashboard $ bundle exec rake 'analytics_export:provision_materialized_views[production]'

`provision_materialized_views` rebuilds only the views whose DDL actually changed (it compares a hash
stored on each view) and drops views no longer backed by a model. After it completes, the views are
empty until refreshed; `analytics_export:refresh_materialized_views[production]` (or the daily export
job) populates them. Use `analytics_export:materialized_view_status[production]` to check state.

See `dashboard/lib/tasks/analytics_exportable.rake` for the full task list and
`lib/cdo/aws/redshift/materialized_view_manager.rb` for the generator and provisioner.
