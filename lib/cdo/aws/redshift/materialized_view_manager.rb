require 'csv'
require 'digest'
require 'erb'
require 'fileutils'
require 'cdo/aws/redshift/client'
require 'cdo/aws/metrics'

module Cdo
  module Aws
    module Redshift
      # One row of `MaterializedViewManager.view_status` output: the most recent CREATE/DROP/REFRESH
      # the Redshift Data API knows about for one materialized view FQN, plus the view's current
      # freshness as reported by SVV_MV_INFO.
      ViewStatusRow = Struct.new(
        :model_name,
        :table_name,
        :view_type,         # 'pii' | 'non_pii'
        :operation,         # 'CREATE' | 'REFRESH' | 'DROP' | nil
        :executed_at,       # Time | nil
        :duration_seconds,  # Float | nil — wall-clock execution time of the operation; nil while running.
        :statement_id,      # String | nil
        :status,            # 'FINISHED' | 'FAILED' | 'ABORTED' | 'STARTED' | '(no recent)' | ...
        :db_user,           # String | nil
        :is_stale,          # true | false | nil (nil = view not found in SVV_MV_INFO)
        :state,             # Integer | nil — Redshift's numeric refresh state
        :state_description, # String | nil — human-readable form of :state
        :error,             # String | nil — failure detail when the most recent operation FAILED/ABORTED
        keyword_init: true
      )

      # Manages the lifecycle of the Redshift materialized views that sit over Learning Platform
      # MySQL tables replicated into Redshift via Zero-ETL. A single instance wraps one ActiveRecord
      # model and generates that model's view DDL; the class methods operate over a whole set of
      # models to provision, refresh, and report on the fleet of views.
      #
      # The public API, by phase:
      #
      #   GENERATE (instance — one model's DDL)
      #     expected_view_fqns / generate_pii_ddl / generate_non_pii_ddl / rendered_ddls /
      #     save_ddl_templates / create_or_replace_views / refresh_views
      #     self.render_ddl / self.ddl_hash
      #
      #   PROVISION & REFRESH (class — across a set of models, via the Redshift Data API)
      #     self.generate_all_ddl_templates # Create/Update/Delete Materialized View SQL ERB files for all Models.
      #     self.provision_all_views        # DROP+CREATE+COMMENT changed views; drop orphans (chunked)
      #     self.refresh_all_views          # REFRESH stale views
      #     self.redshift_client            # client pinned to MATERIALIZED_VIEW_DATABASE
      #   (poll submitted statements with Cdo::Aws::Redshift::Client#wait_for_statements.)
      #
      #   MONITOR (class — read-only health)
      #     self.view_status           # one ViewStatusRow per (model, view variant) + orphans
      #     self.view_status_summary   # pure roll-up of rows (error / stale / age / duration)
      #     self.emit_view_status_metrics  # CloudWatch metrics + per-error-view logs
      #     self.error_condition_for / self.describe_mv_state
      #
      # The phases share internals on purpose (the Data API client, the schema/FQN conventions, the
      # SVV_MV_INFO catalog reads, ViewStatusRow), which is why they live in one cohesive class
      # rather than being split apart.
      class MaterializedViewManager
        # Which `DataClassification` levels reach each Redshift view. The non-PII view
        # carries only data safe for broad analytics access; the PII view carries
        # everything except secrets (:highly_restricted), which reach neither view.
        NON_PII_CLASSIFICATIONS = %i[public confidential].freeze
        PII_CLASSIFICATIONS = %i[public confidential restricted].freeze
        SQL_INDENT = ' ' * 2

        # The Redshift Data API's BatchExecuteStatement accepts at most 40 SQL statements per
        # call. The consolidated orphan-drop can exceed this (a full re-provision of ~110 models
        # produces ~220 drops), so we submit it in chunks of this size.
        # https://docs.aws.amazon.com/redshift-data/latest/APIReference/API_BatchExecuteStatement.html
        MAX_BATCH_STATEMENTS = 40

        # Human-readable descriptions for the numeric `state` column of
        # SVV_MV_INFO. States 0/1 are healthy (the view refreshes, either by
        # full recompute or incrementally); states >= 100 mean the view can no
        # longer be refreshed because its source schema drifted and it must be
        # rebuilt with CREATE OR REPLACE (i.e., `provision_materialized_views`).
        # https://docs.aws.amazon.com/redshift/latest/dg/r_SVV_MV_INFO.html
        MV_STATE_DESCRIPTIONS = {
          0 => 'Refreshes by full recompute',
          1 => 'Refreshes incrementally',
          101 => "Can't refresh: a source column was dropped — rebuild required",
          102 => "Can't refresh: a source column type changed — rebuild required",
          103 => "Can't refresh: a source table was renamed — rebuild required",
          104 => "Can't refresh: a source column was renamed — rebuild required",
          105 => "Can't refresh: a source schema was renamed — rebuild required"
        }.freeze

        # Maps an SVV_MV_INFO numeric `state` to a human-readable description.
        # Falls back to a generic "can't be refreshed" message for any
        # undocumented state >= 100 (AWS may add new failure codes), and an
        # "unknown" message otherwise.
        # @param state [Integer, nil]
        # @return [String, nil] nil only when state is nil
        def self.describe_mv_state(state)
          return nil if state.nil?
          MV_STATE_DESCRIPTIONS[state] ||
            (state >= 100 ? "Can't be refreshed — rebuild required (state #{state})" : "Unknown state #{state}")
        end

        attr_reader :model

        # The Redshift database in which we create the Zero ETL materialized views. We pin this
        # explicitly — rather than relying on `Client`'s default — so that a future change to the
        # client default cannot silently relocate the views and break the data team's dbt.
        #
        # The views MUST live in the database dbt connects to (`dev`) because dbt builds models on
        # them with CREATE TABLE AS SELECT. A view in any other database would make that CTAS a
        # two-hop cross-database chain — dbt's database -> the view's database -> the Zero ETL
        # target database — which Redshift rejects with "Remote object depends on external shared
        # object". Creating the views in `dev` makes dbt's read a single in-database reference; the
        # view's own one hop into the Zero ETL target database is allowed.
        # https://docs.aws.amazon.com/redshift/latest/dg/cross-database_limitation.html
        MATERIALIZED_VIEW_DATABASE = 'dev'.freeze

        # Schema prefix for the Materialized Views we create, e.g. `learning_platform_production`
        # and `learning_platform_production_pii`. The prefix intentionally differs from the Zero ETL
        # source schema prefix below so there is no `dashboard.dashboard_production` vs
        # `dev.dashboard_production` ambiguity, and so these schemas do not collide with the data
        # team's dbt schemas in `dev`.
        VIEW_SCHEMA_PREFIX = 'learning_platform'.freeze

        # Schema prefix of the Zero ETL *source* tables inside the Zero ETL target database, e.g.
        # `production_learningplatform_mysql_zeroetl.dashboard_production.<table>`. This mirrors
        # the MySQL `dashboard` database name and is fixed by the Zero ETL integration — it is NOT
        # the schema our views live in, and must not be renamed.
        ZERO_ETL_SOURCE_SCHEMA_PREFIX = 'dashboard'.freeze

        # ERB template variable for the environment type (e.g., 'test' or 'production').
        ENVIRONMENT_TYPE_ERB = '<%=environment_type%>'.freeze

        # Directory where generated DDL ERB template files are saved.
        SQL_VIEW_TEMPLATE_DIR = aws_dir('redshift', 'zeroetl_materialized_views').freeze

        # Header prepended to each saved .sql.erb so an engineer who finds the file in a diff knows it
        # is generated and that committing it does not change Redshift. This lives ONLY in the on-disk
        # file (see #save_ddl_templates); it is deliberately NOT part of the DDL rendered by
        # #rendered_ddls, which is what gets hashed and submitted to the cluster. Keeping it out of
        # that path means editing this header never changes a view's DDL hash and so never forces a
        # DROP/CREATE of the materialized views.
        GENERATED_TEMPLATE_HEADER = <<~HEADER.freeze
          -- GENERATED FILE -- do not edit by hand.
          -- Regenerated from the ActiveRecord model by `rake db:migrate` and by
          -- `rake analytics_export:generate_materialized_view_templates`; edits here are overwritten.
          -- Committing a change to this file does NOT update the materialized view in Redshift. That
          -- needs a coordinated DROP/CREATE -- see aws/redshift/zeroetl_materialized_views/README.md
          -- and coordinate with the data (RED) and Infrastructure Engineering teams.
        HEADER

        # Builds a Redshift client pinned to the database where the materialized views live
        # (`MATERIALIZED_VIEW_DATABASE`). Callers doing materialized-view work (the
        # `analytics_export:*` rake tasks) should use this rather than `Client.new` so the
        # connection always targets the database the views must live in, independent of the
        # client's own default.
        # @return [Cdo::Aws::Redshift::Client]
        def self.redshift_client
          Cdo::Aws::Redshift::Client.new(database: MATERIALIZED_VIEW_DATABASE)
        end

        # @param model [Class] The ActiveRecord model class (e.g., User, Activity)
        def initialize(model)
          @model = model
        end

        # Returns the fully-qualified view names this generator would create
        # for the given environment.
        # @param environment_type [Symbol, String] e.g., :production, :test
        # @return [Array<String>] e.g., ["learning_platform_production_pii.users", "learning_platform_production.users"]
        def expected_view_fqns(environment_type)
          env = environment_type.to_s
          view_variants.map {|pii| fully_qualified_view_name(env, pii: pii)}
        end

        # Generates the DDL for the PII Materialized View, which projects every column
        # except those classified :highly_restricted.
        def generate_pii_ddl
          columns = pii_columns
          return nil if columns.empty? # Prevent invalid SQL generation

          build_ddl_erb_template(schema: "#{VIEW_SCHEMA_PREFIX}_#{ENVIRONMENT_TYPE_ERB}_pii", columns: columns)
        end

        # Generates the DDL for the non-PII Materialized View, which projects only
        # :public and :confidential columns.
        def generate_non_pii_ddl
          return nil if non_pii_columns.empty?
          build_ddl_erb_template(schema: "#{VIEW_SCHEMA_PREFIX}_#{ENVIRONMENT_TYPE_ERB}", columns: non_pii_columns)
        end

        # Saves the PII and non-PII DDL ERB templates to the template directory.
        # @return [Array<String>] list of file paths written
        def save_ddl_templates
          FileUtils.mkdir_p(SQL_VIEW_TEMPLATE_DIR)
          files = []

          pii_ddl = generate_pii_ddl
          if pii_ddl
            path = File.join(SQL_VIEW_TEMPLATE_DIR, "#{model.table_name}_pii.sql.erb")
            File.write(path, GENERATED_TEMPLATE_HEADER + pii_ddl)
            files << path
          end

          non_pii_ddl = generate_non_pii_ddl
          if non_pii_ddl
            path = File.join(SQL_VIEW_TEMPLATE_DIR, "#{model.table_name}.sql.erb")
            File.write(path, GENERATED_TEMPLATE_HEADER + non_pii_ddl)
            files << path
          end

          files
        end

        # Regenerate the committed SQL ERB templates for `models` and prune any template that no longer
        # corresponds to a current view — a model that became fully PII (so its non-PII view
        # disappears), lost `export_to_analytics`, was deleted, etc. PURE DISK: touches no Redshift.
        #
        # This is the canonical "make the committed `.sql.erb` templates reflect the models" operation.
        # We DON'T rebuild views automatically (Redshift can't ALTER a materialized view — a schema or
        # classification change needs a coordinated DROP/CREATE), but we DO regenerate the templates so
        # the pending change is visible in code review and git history. Provisioning (below) and
        # `db:migrate` both call this so the templates are never stale.
        #
        # Pass the COMPLETE exportable set (e.g. `AnalyticsExportable.valid_exported_models`): any
        # `*.sql.erb` in the template dir not produced by `models` is treated as orphaned and deleted.
        # @param models [Enumerable<Class>] exportable models to template
        # @return [Hash] :written => [path, ...], :deleted => [path, ...]
        def self.generate_all_ddl_templates(models:)
          written = models.flat_map {|model| new(model).save_ddl_templates}
          kept = written.to_set {|path| File.basename(path)}
          deleted = Dir.glob(File.join(SQL_VIEW_TEMPLATE_DIR, '*.sql.erb')).reject do |path|
            kept.include?(File.basename(path))
          end
          deleted.each {|path| File.delete(path)}
          {written: written, deleted: deleted}
        end

        # Returns the rendered (ERB-evaluated) DDL strings and first column
        # name for this model's PII and non-PII views in the given environment.
        # Does NOT touch disk or Redshift; used by `provision_all_views` to compare
        # the DDL hash against the hash stored as a COMMENT ON COLUMN to decide
        # whether a rebuild is needed.
        #
        # The first column is reported alongside the SQL because Redshift does
        # not support `COMMENT ON MATERIALIZED VIEW`. The hash is stored via
        # `COMMENT ON COLUMN <fqn>.<first_column>` (i.e., attached to the
        # column at attnum=1 of the matview).
        # @param environment_type [Symbol, String]
        # @return [Hash{String => Hash}] fqn => {sql:, first_column:}
        def rendered_ddls(environment_type:)
          env = environment_type.to_s
          result = {}
          if (pii_template = generate_pii_ddl)
            fqn = fully_qualified_view_name(env, pii: true)
            result[fqn] = {
              sql: ERB.new(pii_template).result_with_hash(environment_type: env),
              first_column: pii_columns.first
            }
          end
          if (non_pii_template = generate_non_pii_ddl)
            fqn = fully_qualified_view_name(env, pii: false)
            result[fqn] = {
              sql: ERB.new(non_pii_template).result_with_hash(environment_type: env),
              first_column: non_pii_columns.first
            }
          end
          result
        end

        # SHA256 hex digest of the rendered DDL. Stored as a Redshift COMMENT
        # ON COLUMN so that subsequent syncs can short-circuit the (expensive)
        # DROP+CREATE when the DDL hasn't changed.
        def self.ddl_hash(rendered_sql)
          Digest::SHA256.hexdigest(rendered_sql)
        end

        # Submits the DROP+CREATE+COMMENT batch for both PII and non-PII materialized
        # views asynchronously via `batch_execute_async` and returns the resulting
        # statement IDs without waiting for completion. Each view's batch is
        # `[DROP IF EXISTS, CREATE, COMMENT ON COLUMN ... IS '<hash>']` — the COMMENT
        # records the DDL hash on the view's first column (Redshift rejects COMMENT
        # ON MATERIALIZED VIEW) so subsequent `provision_all_views` runs can skip rebuilds
        # when the DDL is unchanged.
        #
        # Use `Cdo::Aws::Redshift::Client#status` / `Cdo::Aws::Redshift::Client#wait_for_statements`
        # to poll for completion. CREATE MATERIALIZED VIEW populates synchronously on
        # Redshift, so large source tables can take many minutes — much longer than
        # the synchronous Data API client timeout, which is why this method does not
        # wait.
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol] e.g., :production, :test
        # @return [Hash{String => String}] fqn => Redshift Data API statement_id
        def create_or_replace_views(client:, environment_type:)
          env = environment_type.to_s
          statements = {}

          rendered_ddls(environment_type: env).each do |fqn, info|
            drop_sql = "DROP MATERIALIZED VIEW IF EXISTS #{fqn}"
            create_sql = info[:sql]
            comment_sql = "COMMENT ON COLUMN #{fqn}.#{info[:first_column]} IS '#{self.class.ddl_hash(create_sql)}'"

            statements[fqn] = client.batch_execute_async([drop_sql, create_sql, comment_sql])
          end

          statements
        end

        # Submits REFRESH MATERIALIZED VIEW for this model's PII and non-PII
        # views asynchronously and returns the resulting statement IDs without
        # waiting. Each view is submitted as its own single-statement async call
        # so callers can track completion per FQN (e.g., via `client.wait_for_statements`).
        # REFRESH on a Zero ETL-sourced view can take longer than the synchronous
        # client timeout when many INSERT/UPDATE/DELETE rows have streamed in
        # since the last refresh, which is why this method does not wait.
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol] e.g., :production, :test
        # @param only [Array<String>, nil] optional FQN whitelist — when given,
        #   submits REFRESH only for FQNs in this model's view variants that
        #   intersect the list. Used by `.refresh_all_views` to skip non-stale
        #   views.
        # @return [Hash{String => String}] fqn => Redshift Data API statement_id
        def refresh_views(client:, environment_type:, only: nil)
          env = environment_type.to_s
          fqns = view_variants.map {|pii| fully_qualified_view_name(env, pii: pii)}
          fqns &= Array(only) if only
          return {} if fqns.empty?

          fqns.each_with_object({}) do |fqn, statements|
            statements[fqn] = client.execute_async("REFRESH MATERIALIZED VIEW #{fqn}")
          end
        end

        # Renders a DDL ERB template file with the given environment type.
        # @param template_path [String] path to the .sql.erb template file
        # @param environment_type [String, Symbol] the environment type (e.g., :test or :production)
        # @return [String] the rendered SQL DDL
        def self.render_ddl(template_path, environment_type:)
          template = File.read(template_path)
          ERB.new(template).result_with_hash(environment_type: environment_type.to_s)
        end

        # Provisions materialized views in Redshift for a set of models: submits the
        # DROP+CREATE+COMMENT batch (async) for each model that needs work, and
        # submits a single consolidated DROP batch (async) for any orphaned views
        # that no longer correspond to a model in the set. Returns the resulting
        # statement IDs without waiting — pass `:statements` from the result to
        # `client.wait_for_statements` (interactive) or hand them off to a follow-up
        # status check (cron).
        #
        # To avoid re-populating large views unnecessarily, each model's rendered
        # DDL is hashed and compared against the hash stored as the view's Redshift
        # COMMENT ON COLUMN by a previous run. Views whose DDL has not changed are
        # reported as `:unchanged` and skipped at submit time. The daily REFRESH
        # MATERIALIZED VIEW job keeps their contents fresh.
        #
        # Yielded progress events (block optional):
        #   yield(:submitted, table_name, [fqn, ...])      # after async submit for one model
        #   yield(:skipped, table_name)                    # comment hash matches desired DDL
        #   yield(:error, table_name, exception)           # submit raised; provisioning continues
        #   yield(:drop_batch_submitted, [fqn, ...])       # after async submit of the orphan-drop batch
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol] :production or :test
        # @param models [Enumerable<Class>] ActiveRecord model classes to provision
        # @param dry_run [Boolean] when true, returns the plan without submitting anything
        # @return [Hash] :to_add, :to_update, :unchanged, :to_drop arrays of FQNs;
        #   :failed array of table names whose submit raised; and :statements
        #   `{fqn => statement_id}` map (empty when dry_run is true).
        def self.provision_all_views(client:, environment_type:, models:, dry_run: false)
          # Keep the committed `.sql.erb` templates in lockstep with the models on every provision —
          # including the dry-run/plan path and when the cluster needs no changes — so a classification
          # or schema change always surfaces as a template diff. This only records the pending change;
          # the DROP/CREATE below is what rebuilds the views on Redshift.
          generate_all_ddl_templates(models: models)

          generators = models.map {|model| new(model)}

          # Pre-render every desired view's DDL so we can hash-compare against
          # existing COMMENT-stored hashes.
          desired_ddls = {}
          generators.each do |gen|
            gen.rendered_ddls(environment_type: environment_type).each do |fqn, info|
              desired_ddls[fqn] = info[:sql]
            end
          end
          desired_fqns = Set.new(desired_ddls.keys)

          existing_comments = list_existing_view_comments(client: client, environment_type: environment_type)
          existing_fqns = Set.new(existing_comments.keys)

          unchanged_fqns = Set.new(
            desired_ddls.select do |fqn, sql|
              existing_comments[fqn] && existing_comments[fqn] == ddl_hash(sql)
            end.keys
          )

          plan = {
            to_add: (desired_fqns - existing_fqns).sort,
            to_update: ((desired_fqns & existing_fqns) - unchanged_fqns).sort,
            unchanged: ((desired_fqns & existing_fqns) & unchanged_fqns).sort,
            to_drop: (existing_fqns - desired_fqns).sort,
            failed: [],
            statements: {}
          }

          return plan if dry_run

          generators.each do |gen|
            table_name = gen.model.table_name
            gen_fqns = gen.expected_view_fqns(environment_type)

            if gen_fqns.any? && gen_fqns.all? {|fqn| unchanged_fqns.include?(fqn)}
              yield(:skipped, table_name) if block_given?
              next
            end

            begin
              submitted = gen.create_or_replace_views(client: client, environment_type: environment_type)
              plan[:statements].merge!(submitted)
              yield(:submitted, table_name, submitted.keys) if block_given?
            rescue StandardError => exception
              plan[:failed] << table_name
              yield(:error, table_name, exception) if block_given?
            end
          end

          # Drop orphaned views in chunks: the Data API caps a batch at MAX_BATCH_STATEMENTS.
          plan[:to_drop].each_slice(MAX_BATCH_STATEMENTS).with_index do |fqns, chunk_index|
            drop_sql = fqns.map {|fqn| "DROP MATERIALIZED VIEW IF EXISTS #{fqn}"}
            plan[:statements]["__drop_orphans___#{chunk_index}"] = client.batch_execute_async(drop_sql)
            yield(:drop_batch_submitted, fqns) if block_given?
          end

          plan
        end

        # Submits REFRESH MATERIALIZED VIEW asynchronously for every PII and
        # non-PII view across the given set of models, and returns the resulting
        # statement IDs without waiting. Pair with `client.wait_for_statements` to
        # gate downstream analytics work on REFRESH completion.
        #
        # Skips views that Redshift reports as not stale (`SVV_MV_INFO.is_stale = 'f'`):
        # when Zero ETL hasn't delivered any change rows since the previous refresh,
        # there's nothing to do. A view that doesn't appear in SVV_MV_INFO (newly
        # created, or just not catalog-visible) is treated as stale so it gets
        # refreshed — safer than skipping something we can't see.
        #
        # Intended caller: end-of-cron hooks such as
        # `bin/cron/export_mysql_database_to_redshift`, which can submit
        # REFRESH at the tail of the DMS daily-copy job and either return
        # immediately or wait for completion before signalling downstream
        # reports that the warehouse is consistent.
        #
        # Per-model submit failures (e.g., the view does not yet exist in
        # Redshift because the most recent CREATE failed) are caught and
        # reported via the `:error` event rather than aborting the whole run.
        #
        # Yielded progress events (block optional):
        #   yield(:would_refresh, table_name, [fqn, ...]) # dry_run only — would submit these FQNs
        #   yield(:submitted, table_name, [fqn, ...])     # async REFRESHes submitted for one model
        #   yield(:skipped, table_name)                   # every view for this model is not stale
        #   yield(:no_views, table_name)                  # model has no MV variants (no columns / all text)
        #   yield(:error, table_name, exception)          # submit raised; refresh_all_views continues
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol] :production or :test
        # @param models [Enumerable<Class>] ActiveRecord model classes whose views to refresh
        # @param dry_run [Boolean] when true, reports what would be refreshed via the
        #   `:would_refresh` event without submitting anything. `:skipped` and `:no_views`
        #   are still yielded so callers can render a complete preview.
        # @return [Hash] :statements => {fqn => statement_id}, :failed => [table_name, ...]
        #   (both empty when dry_run is true).
        def self.refresh_all_views(client:, environment_type:, models:, dry_run: false)
          statements = {}
          failed = []

          staleness = list_view_staleness(client: client, environment_type: environment_type)

          models.each do |model|
            gen = new(model)
            table_name = model.table_name
            expected_fqns = gen.expected_view_fqns(environment_type)

            if expected_fqns.empty?
              yield(:no_views, table_name) if block_given?
              next
            end

            # A view we don't have catalog info for is treated as stale: better
            # to over-refresh than to leave a view stale because we couldn't
            # confirm its freshness.
            stale_fqns = expected_fqns.select {|fqn| staleness[fqn].nil? || staleness[fqn][:is_stale]}

            if stale_fqns.empty?
              yield(:skipped, table_name) if block_given?
              next
            end

            if dry_run
              yield(:would_refresh, table_name, stale_fqns) if block_given?
              next
            end

            begin
              submitted = gen.refresh_views(client: client, environment_type: environment_type, only: stale_fqns)
              statements.merge!(submitted)
              yield(:submitted, table_name, submitted.keys) if block_given?
            rescue StandardError => exception
              failed << table_name
              yield(:error, table_name, exception) if block_given?
            end
          end

          {statements: statements, failed: failed}
        end

        # Returns one `ViewStatusRow` per (model, view variant) plus extra rows
        # for orphan FQNs (views referenced by recent Data API statements but no
        # longer claimed by any model in `models`). The "operation" column is the
        # user-meaningful action of the most recent batch touching that FQN —
        # CREATE wins over REFRESH wins over DROP, so our DROP+CREATE+COMMENT
        # create-or-replace batches report as `CREATE`, the consolidated
        # orphan-drop batch reports per-FQN as `DROP`, and a refresh-only batch
        # reports as `REFRESH`. COMMENT sub-statements are intentionally
        # ignored.
        #
        # Two-phase lookup: list_statements is cheap and only carries a
        # truncated `query_string`, so we use a string `include?` check on
        # `learning_platform_<env>(_pii)?.` to filter candidates without
        # describing every Data API statement on the cluster. Each candidate
        # batch then gets one `describe_statement` round trip to fetch
        # sub_statements and db_user.
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol, String]
        # @param models [Enumerable<Class>] currently-registered exportable models
        # @param hours_back [Integer] window for recent-statement lookup; the
        #   Data API retains ~24h of history, so this is capped in practice.
        # @return [Array<ViewStatusRow>]
        def self.view_status(client:, environment_type:, models:, hours_back: 24)
          env = environment_type.to_s
          schema_prefixes = ["#{VIEW_SCHEMA_PREFIX}_#{env}_pii.", "#{VIEW_SCHEMA_PREFIX}_#{env}."]
          op_priority = {'CREATE' => 3, 'REFRESH' => 2, 'DROP' => 1}.freeze
          cutoff = hours_back.hours.ago

          parse_sub = lambda do |sql|
            sql = sql.to_s.strip
            if sql.start_with?('DROP MATERIALIZED VIEW IF EXISTS ')
              ['DROP', sql.delete_prefix('DROP MATERIALIZED VIEW IF EXISTS ').split.first]
            elsif sql.start_with?('DROP MATERIALIZED VIEW ')
              ['DROP', sql.delete_prefix('DROP MATERIALIZED VIEW ').split.first]
            elsif sql.start_with?('CREATE MATERIALIZED VIEW ')
              ['CREATE', sql.delete_prefix('CREATE MATERIALIZED VIEW ').split.first]
            elsif sql.start_with?('REFRESH MATERIALIZED VIEW ')
              ['REFRESH', sql.delete_prefix('REFRESH MATERIALIZED VIEW ').split.first]
            else
              [nil, nil]
            end
          end

          # Phase 1: candidate batches from list_statements (newest-first;
          # stop paginating once we cross the cutoff).
          candidates = []
          done = false
          client.list_statements.each_page do |page|
            break if done
            page.statements.each do |s|
              if s.created_at < cutoff
                done = true
                break
              end
              qs = s.query_string.to_s
              candidates << s if schema_prefixes.any? {|prefix| qs.include?(prefix)}
            end
          end

          # Phase 2: describe each candidate, resolve per-FQN primary op.
          # `sub_statements` is populated only for batch statements (e.g., our
          # DROP+CREATE+COMMENT batches). Single-statement submissions (e.g.,
          # REFRESH via `execute_async`) report sub_statements=nil; for those
          # we parse `desc.query_string` directly.
          fqn_to_latest = {}
          candidates.each do |batch|
            desc = client.describe_statement(batch.id)
            sub_queries =
              if desc.sub_statements && !desc.sub_statements.empty?
                desc.sub_statements.map(&:query_string)
              else
                [desc.query_string]
              end

            fqn_to_op = {}
            sub_queries.each do |sql|
              op, fqn = parse_sub.call(sql)
              next if op.nil? || fqn.nil?
              next unless schema_prefixes.any? {|prefix| fqn.start_with?(prefix)}
              current = fqn_to_op[fqn]
              fqn_to_op[fqn] = op if current.nil? || op_priority[op] > op_priority[current]
            end

            fqn_to_op.each do |fqn, op|
              existing = fqn_to_latest[fqn]
              fqn_to_latest[fqn] = {batch: batch, desc: desc, op: op} if existing.nil? || batch.created_at > existing[:batch].created_at
            end
          end

          # PII vs non-PII is determined by the schema (…_pii), not the view name, so this is
          # robust regardless of the view/table name.
          view_type_for = ->(fqn) {fqn.split('.', 2).first.to_s.end_with?('_pii') ? 'pii' : 'non_pii'}

          # Freshness info from SVV_MV_INFO — independent signal from the Data
          # API statement history, useful for "is this view actually fresh?"
          staleness = list_view_staleness(client: client, environment_type: env)

          # Expected FQNs per model.
          model_fqns = {}
          models.sort_by(&:name).each do |model|
            new(model).expected_view_fqns(env).each {|fqn| model_fqns[fqn] = model}
          end
          expected_set = model_fqns.keys.to_set

          # `desc.duration` is reported in nanoseconds by the Redshift Data API.
          # Convert to seconds (Float); nil/zero (still running) becomes nil.
          duration_seconds_for = lambda do |desc|
            nanos = desc.duration
            return nil if nanos.nil? || nanos <= 0
            nanos.to_f / 1_000_000_000
          end

          # Concise failure reason for a (possibly batch) statement, or nil when the
          # statement did not fail. For our DROP+CREATE+COMMENT batches the useful detail
          # is on the failed sub-statement (usually the CREATE), so prefer the first failed
          # sub-statement's error and fall back to the batch-level error.
          error_for = lambda do |desc, status|
            return nil unless %w[FAILED ABORTED].include?(status)
            failed_sub = desc.sub_statements&.find {|sub| sub.status == 'FAILED' && sub.error.present?}
            (failed_sub&.error || desc.error).to_s.strip.presence
          end

          build_row = lambda do |model_name, table_name, fqn|
            latest = fqn_to_latest[fqn]
            stale_info = staleness[fqn]
            if latest
              ViewStatusRow.new(
                model_name: model_name,
                table_name: table_name,
                view_type: view_type_for.call(fqn),
                operation: latest[:op],
                executed_at: latest[:batch].created_at,
                duration_seconds: duration_seconds_for.call(latest[:desc]),
                statement_id: latest[:batch].id,
                status: latest[:batch].status,
                db_user: latest[:desc].db_user,
                is_stale: stale_info&.dig(:is_stale),
                state: stale_info&.dig(:state),
                state_description: describe_mv_state(stale_info&.dig(:state)),
                error: error_for.call(latest[:desc], latest[:batch].status)
              )
            else
              ViewStatusRow.new(
                model_name: model_name,
                table_name: table_name,
                view_type: view_type_for.call(fqn),
                operation: nil,
                executed_at: nil,
                duration_seconds: nil,
                statement_id: nil,
                status: '(no recent)',
                db_user: nil,
                is_stale: stale_info&.dig(:is_stale),
                state: stale_info&.dig(:state),
                state_description: describe_mv_state(stale_info&.dig(:state)),
                error: nil
              )
            end
          end

          rows = []
          model_fqns.sort_by {|fqn, m| [m.name, view_type_for.call(fqn)]}.each do |fqn, model|
            rows << build_row.call(model.name, model.table_name, fqn)
          end

          orphan_fqns = (fqn_to_latest.keys - expected_set.to_a).sort
          orphan_fqns.each do |fqn|
            prefix = schema_prefixes.find {|p| fqn.start_with?(p)}
            orphan_table = prefix ? fqn.delete_prefix(prefix) : fqn
            rows << build_row.call(ORPHAN_MODEL_NAME, orphan_table, fqn)
          end

          rows
        end

        METRICS_NAMESPACE = 'ZeroEtlMaterializedViews'.freeze

        # A view is "in an error state" — needs human attention — when it failed to provision
        # (its most recent CREATE/DROP statement FAILED/ABORTED, or carries an error), when Redshift
        # reports it as unrefreshable due to source schema drift (SVV_MV_INFO.state >= 100), or when
        # it is expected but absent (no recent Data API statement and not in SVV_MV_INFO). Staleness
        # (`is_stale`) is NOT an error — it is normal between refreshes — so it is reported separately.
        FAILED_STATEMENT_STATUSES = %w[FAILED ABORTED].freeze
        MV_UNREFRESHABLE_STATE = 100 # SVV_MV_INFO.state >= 100 => can't refresh, rebuild required.

        # Classifies one ViewStatusRow's error condition, or nil if the view is not in an error state.
        # @return [Symbol, nil] :failed_provisioning | :unrefreshable | :missing | nil
        def self.error_condition_for(row)
          return :failed_provisioning if FAILED_STATEMENT_STATUSES.include?(row.status) || row.error.present?
          return :unrefreshable if row.state && row.state >= MV_UNREFRESHABLE_STATE
          # Expected but absent: no recent statement AND not found in SVV_MV_INFO (is_stale nil).
          return :missing if row.status == '(no recent)' && row.is_stale.nil?
          nil
        end

        # A view's data is known current as of `executed_at` after either operation: CREATE fully
        # materializes it from scratch, REFRESH incrementally brings it up to date. DROP does not
        # (the view has no data). Both must count toward the freshness/duration metrics below, or a
        # routine re-provision (CREATE) makes a view look never-refreshed until its next REFRESH,
        # which can be up to a day away on the daily post-DMS-export refresh cadence.
        FRESHENING_OPERATIONS = %w[CREATE REFRESH].freeze

        # @param rows [Array<ViewStatusRow>]
        # @param now [Time] reference time for "seconds since last refresh".
        # @return [Hash] :error_views (rows + :condition), :stale_views, :total,
        #   :max_seconds_since_last_refresh (nil if no CREATE/REFRESH seen),
        #   :max_refresh_duration_seconds (nil, same condition).
        def self.view_status_summary(rows, now:)
          error_views = rows.filter_map do |row|
            condition = error_condition_for(row)
            {row: row, condition: condition} if condition
          end

          stale_views = rows.select(&:is_stale)

          refresh_ages = rows.filter_map do |row|
            next unless FRESHENING_OPERATIONS.include?(row.operation) && row.executed_at
            (now - row.executed_at).to_i
          end
          refresh_durations = rows.filter_map do |row|
            row.duration_seconds if FRESHENING_OPERATIONS.include?(row.operation) && row.duration_seconds
          end

          {
            error_views: error_views,
            stale_views: stale_views,
            total: rows.length,
            max_seconds_since_last_refresh: refresh_ages.max,
            max_refresh_duration_seconds: refresh_durations.max
          }
        end

        # `model_name` value `view_status` assigns to a row for a view present in Redshift but not
        # produced by any current model (an orphan left behind after a model stopped exporting).
        ORPHAN_MODEL_NAME = '(orphan)'.freeze

        # Ordered column headers for `view_status_to_csv`. Kept in lockstep with the value order in
        # `view_status_csv_values`; a test asserts the two stay the same length.
        VIEW_STATUS_CSV_HEADERS = %w[
          model
          mysql_table_name
          view_type
          most_recent_operation
          operation_executed_at
          operation_duration_seconds
          redshift_statement_id
          operation_status
          redshift_db_user
          view_is_stale
          view_state
          view_state_description
          error
        ].freeze

        # A light tally of `view_status` rows for human-readable (CLI / log) reporting — distinct from
        # `view_status_summary`, which computes the CloudWatch error/stale/freshness metrics.
        # @param rows [Array<ViewStatusRow>]
        # @return [Hash] :by_status (status => count), :expected (non-orphan row count),
        #   :orphan (orphan row count), :failures_by_error (error message => [rows]).
        def self.summarize_view_status(rows)
          {
            by_status: rows.each_with_object(Hash.new(0)) {|row, counts| counts[row.status] += 1},
            expected: rows.count {|row| row.model_name != ORPHAN_MODEL_NAME},
            orphan: rows.count {|row| row.model_name == ORPHAN_MODEL_NAME},
            failures_by_error: rows.select(&:error).group_by(&:error)
          }
        end

        # Serializes `view_status` rows to a CSV string: a `VIEW_STATUS_CSV_HEADERS` header row
        # followed by one row per view.
        # @param rows [Array<ViewStatusRow>]
        # @return [String] CSV text
        def self.view_status_to_csv(rows)
          CSV.generate do |csv|
            csv << VIEW_STATUS_CSV_HEADERS
            rows.each {|row| csv << view_status_csv_values(row)}
          end
        end

        # One row's CSV values, ordered to match `VIEW_STATUS_CSV_HEADERS`.
        # @param row [ViewStatusRow]
        # @return [Array]
        def self.view_status_csv_values(row)
          [
            row.model_name,
            row.table_name,
            row.view_type,
            row.operation,
            row.executed_at&.iso8601,
            row.duration_seconds&.round(1),
            row.statement_id,
            row.status,
            row.db_user,
            row.is_stale&.to_s,
            row.state,
            row.state_description,
            row.error
          ]
        end

        # Computes `view_status` for the given models, emits CloudWatch metrics (one set per
        # environment) via `Cdo::Metrics`, and logs one structured line per error-state view to
        # CloudWatch via `CDO.log.error`. Returns the summary so callers (the monitor cron) can
        # build a human-readable alert. Metrics are emitted even when healthy (value 0) so alarms
        # can distinguish "no problems" from "monitor didn't run".
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol, String]
        # @param models [Enumerable<Class>]
        # @param now [Time]
        # @return [Hash] the `view_status_summary`.
        def self.emit_view_status_metrics(client:, environment_type:, models:, now: Time.now)
          rows = view_status(client: client, environment_type: environment_type, models: models)
          summary = view_status_summary(rows, now: now)

          summary[:error_views].each do |error|
            row = error[:row]
            CDO.log.error(
              "[zeroetl] materialized view in error state " \
              "env=#{environment_type} condition=#{error[:condition]} " \
              "mysql_table=#{row.table_name} model=#{row.model_name} view_type=#{row.view_type} " \
              "status=#{row.status} state=#{row.state} state_description=#{row.state_description.inspect} " \
              "statement_id=#{row.statement_id} error=#{row.error.inspect}"
            )
          end

          dimensions = {Environment: CDO.rack_env.to_s}
          put = lambda do |name, value, unit|
            Cdo::Metrics.put(METRICS_NAMESPACE, name, value, dimensions, unit: unit) unless value.nil?
          end
          put.call('ViewsInErrorState', summary[:error_views].length, 'Count')
          put.call('ViewsStale', summary[:stale_views].length, 'Count')
          put.call('ViewsTotal', summary[:total], 'Count')
          put.call('MaxSecondsSinceLastRefresh', summary[:max_seconds_since_last_refresh], 'Seconds')
          put.call('MaxRefreshDurationSeconds', summary[:max_refresh_duration_seconds], 'Seconds')
          Cdo::Metrics.flush! # Ensure background thread flushes Metrics before the caller exits.

          summary
        end

        # Queries Redshift for the freshness of the materialized views
        # in the analytics view schemas for the given environment. SVV_MV_INFO is
        # the system view Redshift exposes for this: `is_stale` is 't'/'f'
        # depending on whether the underlying source table has unprocessed
        # changes since the last refresh, and `state` is Redshift's numeric
        # refresh status (e.g., 1 = refresh in progress, 100 = stale).
        #
        # SVV_MV_INFO returns fixed-width VARCHAR columns, so the query TRIMs
        # `schema_name` and `name` before comparing/returning.
        # @return [Hash{String => Hash}] fqn => {is_stale: Boolean, state: Integer}
        private_class_method def self.list_view_staleness(client:, environment_type:)
          env = environment_type.to_s
          schemas = ["#{VIEW_SCHEMA_PREFIX}_#{env}", "#{VIEW_SCHEMA_PREFIX}_#{env}_pii"]
          schema_list = schemas.map {|s| "'#{s}'"}.join(', ')

          # No name filter: SVV_MV_INFO lists only materialized views, and the
          # `learning_platform_*` schemas are dedicated to the views this tool manages.
          rows = client.execute(<<~SQL)
            SELECT TRIM(schema_name) AS schema, TRIM(name) AS name, is_stale, state
            FROM SVV_MV_INFO
            WHERE TRIM(schema_name) IN (#{schema_list})
          SQL

          rows.each_with_object({}) do |r, h|
            h["#{r['schema']}.#{r['name']}"] = {
              is_stale: r['is_stale'] == 't',
              state: r['state'].to_i
            }
          end
        end

        # Queries Redshift for existing materialized views in the
        # analytics view schemas for the given environment, returning the COMMENT
        # we previously attached to each view's first column — the SHA256 hash
        # of the DDL written by the prior run, or nil if no comment exists
        # (e.g., views created before this change shipped, or a previous
        # CREATE succeeded but the COMMENT failed).
        #
        # Reads from `SVV_COLUMNS.remarks` rather than `pg_description.description`
        # because Redshift exposes column comments through SVV_COLUMNS — querying
        # `pg_description` directly returns no rows. SVV_COLUMNS includes
        # materialized view columns.
        # @return [Hash{String => String, nil}] fully qualified view name => comment string
        private_class_method def self.list_existing_view_comments(client:, environment_type:)
          env = environment_type.to_s
          schemas = ["#{VIEW_SCHEMA_PREFIX}_#{env}", "#{VIEW_SCHEMA_PREFIX}_#{env}_pii"]
          schema_list = schemas.map {|s| "'#{s}'"}.join(', ')

          # The `learning_platform_*` schemas are dedicated to the views this tool manages, so
          # we no longer filter by a name prefix. We DO exclude Redshift's internal
          # materialized-view backing tables (`mv_tbl__<view>__<n>`), which SVV_COLUMNS can
          # surface alongside the views and which must not be mistaken for orphaned views.
          # `_` is a LIKE single-character wildcard here (it matches the literal underscores in
          # `mv_tbl`), which lets us avoid a backslash ESCAPE clause — Redshift mis-parses the
          # `'\'` escape literal as an escaped quote. No managed view name begins with `mv_tbl`.
          rows = client.execute(<<~SQL)
            SELECT table_schema AS schema, table_name AS name, remarks AS comment
            FROM SVV_COLUMNS
            WHERE table_schema IN (#{schema_list})
              AND table_name NOT LIKE 'mv_tbl%'
              AND ordinal_position = 1
          SQL

          rows.each_with_object({}) do |r, h|
            h["#{r['schema']}.#{r['name']}"] = r['comment']
          end
        end

        # Columns projected into the PII view: everything except :highly_restricted.
        private def pii_columns
          model.column_names_classified_as(*PII_CLASSIFICATIONS)
        end

        # Columns projected into the non-PII view: only :public and :confidential.
        private def non_pii_columns
          model.column_names_classified_as(*NON_PII_CLASSIFICATIONS)
        end

        # The materialized view shares its source table's name (e.g., `level_sources`). It no
        # longer carries a `zeroetl_` prefix: the views live in dedicated `learning_platform_*`
        # schemas (see VIEW_SCHEMA_PREFIX), so there is nothing to disambiguate them from — and
        # mirroring the source table name reads naturally for analysts and dbt.
        private def view_name
          model.table_name
        end

        private def fully_qualified_view_name(env, pii:)
          schema = pii ? "#{VIEW_SCHEMA_PREFIX}_#{env}_pii" : "#{VIEW_SCHEMA_PREFIX}_#{env}"
          "#{schema}.#{view_name}"
        end

        # Returns which view variants exist for this model: [true] for PII-only,
        # [true, false] for both PII and non-PII.
        private def view_variants
          variants = []
          variants << true unless pii_columns.empty?
          variants << false unless non_pii_columns.empty?
          variants
        end

        private def build_ddl_erb_template(schema:, columns:)
          qualified_view = "#{schema}.#{view_name}"
          # Double-quote every column identifier so reserved-word column names
          # (e.g., `group`, `end`, `to`, `start`) round-trip cleanly into the
          # generated CREATE statement.
          quoted_columns = columns.map {|c| %("#{c}")}
          <<~SQL
            CREATE MATERIALIZED VIEW #{qualified_view}
              BACKUP NO
              #{distkey_clause(columns)}
              AUTO REFRESH NO
            AS SELECT
              #{quoted_columns.join(",\n" + SQL_INDENT)}
            FROM #{ENVIRONMENT_TYPE_ERB}_learningplatform_mysql_zeroetl.#{ZERO_ETL_SOURCE_SCHEMA_PREFIX}_#{ENVIRONMENT_TYPE_ERB}.#{model.table_name};
          SQL
        end

        # Returns the DISTSTYLE/DISTKEY clause for the materialized view.
        #
        # When the primary key column is present in the projected `columns`
        # list, we ask Redshift to distribute rows by that column — typically
        # the most useful distribution for join-heavy analytics workloads.
        #
        # Otherwise (no PK, composite PK whose leading column was filtered out
        # of the non-PII projection, etc.) we fall back to `DISTSTYLE AUTO`
        # and let Redshift choose. AUTO is preferable to a forced choice on a
        # poor distribution key (e.g., a low-cardinality boolean).
        private def distkey_clause(columns)
          pk_candidate = distkey_column
          if pk_candidate && columns.include?(pk_candidate)
            %(DISTSTYLE KEY DISTKEY ("#{pk_candidate}"))
          else
            'DISTSTYLE AUTO'
          end
        end

        # @return [String, nil] preferred distkey column for this model, or
        #   nil when the table has no primary key.
        private def distkey_column
          pk = model.primary_key
          if pk.is_a?(Array)
            pk.first # Composite PK: pick the leading column.
          elsif pk.present?
            pk
          end
        end
      end
    end
  end
end
