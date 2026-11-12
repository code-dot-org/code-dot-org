# Database migrations (dashboard)

How to add or change a table in the dashboard MySQL database.

## Ship the migration in its own PR

Put the migration in a PR by itself and merge it before any code that depends on it.

Migrations are hard to undo once they reach our long-lived environments (staging, test,
levelbuilder, production). Reverting the PR does not reverse the schema change, so a
migration bundled with feature code turns a simple revert into manual database work.
Keeping the migration small and separate means the feature code can be reverted freely.

The migration PR should contain:

- the migration file in `dashboard/db/migrate/`
- the resulting `dashboard/db/schema.rb` changes
- the model annotation changes in `dashboard/app/models/` that running the migration produces
- any regenerated templates in `aws/redshift/zeroetl_materialized_views/` (see
  [Analytics export](#analytics-export-zero-etl) below)

A new model class, and its factory and test, can ride along with the migration
or come in the follow-up PR.

## Steps

From `dashboard/`:

1. Generate the migration file:

   ```
   bin/rails generate migration AddTimeSpentToUserLevels
   ```

   For a brand new table, also generate the model, factory and model test without a second
   migration:

   ```
   bin/rails generate model TimeSpent --skip-migration
   ```

2. Fill in the migration. Prefer a reversible `change` method; write explicit `up` and `down`
   when Rails can't infer the reverse.

3. Run it:

   ```
   bundle exec rake db:migrate
   ```

   In development this also:

   - updates `db/schema.rb`
   - updates the schema annotations at the top of the affected model files (annotaterb)
   - regenerates the Zero ETL materialized view templates

4. Check that it rolls back cleanly, then migrate again:

   ```
   bundle exec rake db:rollback
   bundle exec rake db:migrate
   ```

5. Migrate the test database before running tests locally:

   ```
   RAILS_ENV=test bundle exec rake db:migrate
   ```

6. Commit everything the migration changed (see the list above).

Drone fails the build if `schema.rb`, `app/models/`, or
`aws/redshift/zeroetl_materialized_views/` differ from what your branch commits, so a
missing file shows up there.

## Changes that need more than one deploy

The migration runs during deploy while the previous version of the app is still serving
requests. Old code has to keep working against the new schema.

- **Adding** a column or table is safe in one step.
- **Removing** a column: first ship code that stops using it and lists it in the model's
  `self.ignored_columns`; drop the column in a later migration PR.
- **Renaming** a column: avoid it on busy tables. If you must, add the new column, write to
  both, backfill, switch reads, then drop the old column, each in its own deploy.
- **Backfilling data**: keep large data changes out of schema migrations. Use a rake task or
  a one-off script that can run in batches and be retried.

## Large tables

Some tables (for example `user_levels`, `level_sources`, `aichat_events`) are large enough that
a blocking `ALTER TABLE` can hold up production traffic. For indexes on large tables:

- pass `algorithm: :inplace` so MySQL builds the index without locking writes
- guard with `index_exists?` so a partially applied migration can be re-run

See `db/migrate/20260107212238_add_indexes_to_aichat_events.rb` for an example. If you are
unsure whether a table is large, ask in #infrastructure before merging.

## Foreign keys

We generally avoid database-level foreign keys. They make later schema and data changes
harder. Use model associations and validations instead, unless there's a specific reason.

## Analytics export (Zero ETL)

Models that declare `export_to_analytics` are replicated to Redshift. When your migration
changes an exported table, `rake db:migrate` regenerates the matching templates in
`aws/redshift/zeroetl_materialized_views/`.

- Give each new column the right classification in the model's `data_classification`
  declaration (see `app/models/concerns/data_classification.rb`). Undeclared text and JSON
  columns default to `:restricted` (PII).
- Merging the template change does **not** update Redshift. Coordinate the rebuild with the
  data analytics (RED) team and Infrastructure as described in
  `aws/redshift/zeroetl_materialized_views/README.md`.
