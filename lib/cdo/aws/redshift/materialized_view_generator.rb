require 'digest'
require 'erb'
require 'fileutils'
require 'cdo/aws/redshift/client'

module Cdo
  module Aws
    module Redshift
      # Given a Learning Platform ActiveRecord Model, generate SQL (DDL) for a Materialized View in Redshift that sources
      # data from the target Redshift database table where that Model's transactional MySQL data is exported to via Zero-ETL.
      # One row of `view_status` output: the most recent CREATE/DROP/REFRESH
      # the Redshift Data API knows about for one materialized view FQN.
      ViewStatusRow = Struct.new(
        :model_name,
        :table_name,
        :view_type,        # 'pii' | 'non_pii'
        :operation,        # 'CREATE' | 'REFRESH' | 'DROP' | nil
        :executed_at,      # Time | nil
        :statement_id,     # String | nil
        :status,           # 'FINISHED' | 'FAILED' | 'ABORTED' | 'STARTED' | '(no recent)' | ...
        :db_user,          # String | nil
        keyword_init: true
      )

      class MaterializedViewGenerator
        TEXT_DATA_TYPES = [:string, :text].freeze
        DATE_TIME_DATA_TYPES = [:date, :datetime, :timestamp].freeze
        NON_PII_DATE_TIME_COLUMN_NAMES = %w[created_at updated_at deleted_at].freeze
        SQL_INDENT = ' ' * 2

        attr_reader :model

        # Analytics Redshift schemas where we create Materialized Views that source data from Zero ETL database use
        # `dashboard_` naming conventions.
        BASE_REDSHIFT_SCHEMA_NAME = 'dashboard'.freeze

        # ERB template variable for the environment type (e.g., 'test' or 'production').
        ENVIRONMENT_TYPE_ERB = '<%=environment_type%>'.freeze

        # Directory where generated DDL ERB template files are saved.
        SQL_VIEW_TEMPLATE_DIR = aws_dir('redshift', 'zeroetl_materialized_views').freeze

        # @param model [Class] The ActiveRecord model class (e.g., User, Activity)
        def initialize(model)
          @model = model
        end

        # Returns the fully-qualified view names this generator would create
        # for the given environment.
        # @param environment_type [Symbol, String] e.g., :production, :test
        # @return [Array<String>] e.g., ["dashboard_production_pii.zeroetl_users", "dashboard_production.zeroetl_users"]
        def expected_view_fqns(environment_type)
          env = environment_type.to_s
          view_variants.map {|pii| fully_qualified_view_name(env, pii: pii)}
        end

        # Generates the DDL for the PII (full) Materialized View
        def generate_pii_ddl
          columns = model.columns.map(&:name)
          return nil if columns.empty? # Prevent invalid SQL generation

          build_ddl_erb_template(schema: "#{BASE_REDSHIFT_SCHEMA_NAME}_#{ENVIRONMENT_TYPE_ERB}_pii", columns: columns)
        end

        # Generates the DDL for the non-PII (restricted) Materialized View.
        def generate_non_pii_ddl
          return nil if non_pii_columns.empty?
          build_ddl_erb_template(schema: "#{BASE_REDSHIFT_SCHEMA_NAME}_#{ENVIRONMENT_TYPE_ERB}", columns: non_pii_columns)
        end

        # Saves the PII and non-PII DDL ERB templates to the template directory.
        # @return [Array<String>] list of file paths written
        def save_ddl_templates
          FileUtils.mkdir_p(SQL_VIEW_TEMPLATE_DIR)
          files = []

          pii_ddl = generate_pii_ddl
          if pii_ddl
            path = File.join(SQL_VIEW_TEMPLATE_DIR, "#{model.table_name}_pii.sql.erb")
            File.write(path, pii_ddl)
            files << path
          end

          non_pii_ddl = generate_non_pii_ddl
          if non_pii_ddl
            path = File.join(SQL_VIEW_TEMPLATE_DIR, "#{model.table_name}.sql.erb")
            File.write(path, non_pii_ddl)
            files << path
          end

          files
        end

        # Returns the rendered (ERB-evaluated) DDL strings and first column
        # name for this model's PII and non-PII views in the given environment.
        # Does NOT touch disk or Redshift; used by `sync_all_views` to compare
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
              first_column: model.columns.first.name
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
        # ON MATERIALIZED VIEW) so subsequent `sync_all_views` runs can skip rebuilds
        # when the DDL is unchanged.
        #
        # Use `Cdo::Aws::Redshift::Client#status` / `MaterializedViewGenerator.wait_for_statements`
        # to poll for completion. CREATE MATERIALIZED VIEW populates synchronously on
        # Redshift, so large source tables can take many minutes — much longer than
        # the synchronous Data API client timeout, which is why this method does not
        # wait.
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol] e.g., :production, :test
        # @return [Hash{String => String}] fqn => Redshift Data API statement_id
        def create_or_replace_views(client:, environment_type:)
          env = environment_type.to_s
          save_ddl_templates
          statements = {}

          rendered_ddls(environment_type: env).each do |fqn, info|
            drop_sql = "DROP MATERIALIZED VIEW IF EXISTS #{fqn}"
            create_sql = info[:sql]
            comment_sql = "COMMENT ON COLUMN #{fqn}.#{info[:first_column]} IS '#{self.class.ddl_hash(create_sql)}'"

            statements[fqn] = client.batch_execute_async([drop_sql, create_sql, comment_sql])
          end

          statements
        end

        # Refreshes both PII and non-PII materialized views for this model.
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol] e.g., :production, :test
        # @return [Array<String>] fully qualified names of views refreshed
        def refresh_views(client:, environment_type:)
          env = environment_type.to_s
          fqns = view_variants.map {|pii| fully_qualified_view_name(env, pii: pii)}
          return fqns if fqns.empty?

          client.batch_execute(fqns.map {|fqn| "REFRESH MATERIALIZED VIEW #{fqn}"})
          fqns
        end

        # Renders a DDL ERB template file with the given environment type.
        # @param template_path [String] path to the .sql.erb template file
        # @param environment_type [String, Symbol] the environment type (e.g., :test or :production)
        # @return [String] the rendered SQL DDL
        def self.render_ddl(template_path, environment_type:)
          template = File.read(template_path)
          ERB.new(template).result_with_hash(environment_type: environment_type.to_s)
        end

        # Syncs materialized views in Redshift for a set of models: submits the
        # DROP+CREATE+COMMENT batch (async) for each model that needs work, and
        # submits a single consolidated DROP batch (async) for any orphaned views
        # that no longer correspond to a model in the set. Returns the resulting
        # statement IDs without waiting — pass `:statements` from the result to
        # `.wait_for_statements` (interactive) or hand them off to a follow-up
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
        #   yield(:error, table_name, exception)           # submit raised; sync continues
        #   yield(:drop_batch_submitted, [fqn, ...])       # after async submit of the orphan-drop batch
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol] :production or :test
        # @param models [Enumerable<Class>] ActiveRecord model classes to sync
        # @param dry_run [Boolean] when true, returns the plan without submitting anything
        # @return [Hash] :to_add, :to_update, :unchanged, :to_drop arrays of FQNs;
        #   :failed array of table names whose submit raised; and :statements
        #   `{fqn => statement_id}` map (empty when dry_run is true).
        def self.sync_all_views(client:, environment_type:, models:, dry_run: false)
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

          unless plan[:to_drop].empty?
            drop_sql = plan[:to_drop].map {|fqn| "DROP MATERIALIZED VIEW IF EXISTS #{fqn}"}
            plan[:statements]['__drop_orphans__'] = client.batch_execute_async(drop_sql)
            yield(:drop_batch_submitted, plan[:to_drop]) if block_given?
          end

          plan
        end

        # Polls the Redshift Data API for completion of every statement in the
        # given `{fqn => statement_id}` map. Polls until all statements have
        # reached a terminal status (FINISHED / FAILED / ABORTED) or `timeout`
        # seconds have elapsed. Each pass calls `client.status` for every still-
        # pending statement, sleeps `poll_interval` seconds, and repeats.
        #
        # Yielded progress events (block optional):
        #   yield(:finished, fqn, duration_seconds)     # statement completed successfully
        #   yield(:failed, fqn, error_message)          # statement FAILED or ABORTED
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param statements [Hash{String => String}] fqn => Redshift statement_id
        # @param poll_interval [Integer] seconds between polling passes
        # @param timeout [Integer, nil] cap on total wait; raises QueryError when crossed.
        #   Defaults to nil (poll forever — statements have ~24h Data API retention).
        # @return [Hash] :finished => [fqn, ...], :failed => [[fqn, error_msg], ...]
        def self.wait_for_statements(client:, statements:, poll_interval: 10, timeout: nil)
          pending = statements.dup
          finished = []
          failed = []
          start_times = Hash.new {|h, k| h[k] = Time.now}
          waited_at = Time.now

          until pending.empty?
            if timeout && (Time.now - waited_at) > timeout
              raise Cdo::Aws::Redshift::Client::QueryError,
                "Timed out after #{timeout}s waiting on #{pending.length} statement(s)"
            end

            pending.dup.each do |fqn, statement_id|
              start_times[fqn] # touch to record start on first observation
              current = client.status(statement_id)
              case current
              when 'FINISHED'
                duration = (Time.now - start_times[fqn]).round(1)
                pending.delete(fqn)
                finished << fqn
                yield(:finished, fqn, duration) if block_given?
              when 'FAILED', 'ABORTED'
                desc = client.describe_statement(statement_id)
                msg = desc.error.to_s.lines.first&.strip || "(#{current})"
                pending.delete(fqn)
                failed << [fqn, msg]
                yield(:failed, fqn, msg) if block_given?
              end
            end

            sleep poll_interval unless pending.empty?
          end

          {finished: finished, failed: failed}
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
        # `dashboard_<env>(_pii)?.zeroetl_` to filter candidates without
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
          schema_prefixes = ["dashboard_#{env}_pii.zeroetl_", "dashboard_#{env}.zeroetl_"]
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
          fqn_to_latest = {}
          candidates.each do |batch|
            desc = client.describe_statement(batch.id)
            fqn_to_op = {}
            desc.sub_statements.each do |sub|
              op, fqn = parse_sub.call(sub.query_string)
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

          view_type_for = ->(fqn) {fqn.include?('_pii.zeroetl_') ? 'pii' : 'non_pii'}

          # Expected FQNs per model.
          model_fqns = {}
          models.sort_by(&:name).each do |model|
            new(model).expected_view_fqns(env).each {|fqn| model_fqns[fqn] = model}
          end
          expected_set = model_fqns.keys.to_set

          build_row = lambda do |model_name, table_name, fqn|
            latest = fqn_to_latest[fqn]
            if latest
              ViewStatusRow.new(
                model_name: model_name,
                table_name: table_name,
                view_type: view_type_for.call(fqn),
                operation: latest[:op],
                executed_at: latest[:batch].created_at,
                statement_id: latest[:batch].id,
                status: latest[:batch].status,
                db_user: latest[:desc].db_user
              )
            else
              ViewStatusRow.new(
                model_name: model_name,
                table_name: table_name,
                view_type: view_type_for.call(fqn),
                operation: nil,
                executed_at: nil,
                statement_id: nil,
                status: '(no recent)',
                db_user: nil
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
            rows << build_row.call('(orphan)', orphan_table, fqn)
          end

          rows
        end

        # Queries Redshift for existing `zeroetl_` materialized views in the
        # dashboard schemas for the given environment, returning the COMMENT
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
          schemas = ["#{BASE_REDSHIFT_SCHEMA_NAME}_#{env}", "#{BASE_REDSHIFT_SCHEMA_NAME}_#{env}_pii"]
          schema_list = schemas.map {|s| "'#{s}'"}.join(', ')

          rows = client.execute(<<~SQL)
            SELECT table_schema AS schema, table_name AS name, remarks AS comment
            FROM SVV_COLUMNS
            WHERE table_schema IN (#{schema_list})
              AND table_name LIKE 'zeroetl_%'
              AND ordinal_position = 1
          SQL

          rows.each_with_object({}) do |r, h|
            h["#{r['schema']}.#{r['name']}"] = r['comment']
          end
        end

        private def non_pii_columns
          model.columns.select do |col|
            if TEXT_DATA_TYPES.include?(col.type)
              false # Exclude all text/string columns.
            elsif DATE_TIME_DATA_TYPES.include?(col.type)
              NON_PII_DATE_TIME_COLUMN_NAMES.include?(col.name) # A subset of date/time column names are non-pii.
            else
              true # Allow integers, booleans, floats, etc.
            end
          end.map(&:name)
        end

        private def view_name
          "zeroetl_#{model.table_name}"
        end

        private def fully_qualified_view_name(env, pii:)
          schema = pii ? "#{BASE_REDSHIFT_SCHEMA_NAME}_#{env}_pii" : "#{BASE_REDSHIFT_SCHEMA_NAME}_#{env}"
          "#{schema}.#{view_name}"
        end

        # Returns which view variants exist for this model: [true] for PII-only,
        # [true, false] for both PII and non-PII.
        private def view_variants
          variants = []
          variants << true unless model.columns.empty?
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
            FROM #{ENVIRONMENT_TYPE_ERB}_learningplatform_mysql_zeroetl.#{BASE_REDSHIFT_SCHEMA_NAME}_#{ENVIRONMENT_TYPE_ERB}.#{model.table_name};
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
