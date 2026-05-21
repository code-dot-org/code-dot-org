require 'digest'
require 'erb'
require 'fileutils'
require 'cdo/aws/redshift/client'

module Cdo
  module Aws
    module Redshift
      # Given a Learning Platform ActiveRecord Model, generate SQL (DDL) for a Materialized View in Redshift that sources
      # data from the target Redshift database table where that Model's transactional MySQL data is exported to via Zero-ETL.
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

        # Generates, saves, renders, and executes the DDL for both PII and non-PII materialized views.
        # Each view's batch is `[DROP IF EXISTS, CREATE, COMMENT ON COLUMN ... IS '<hash>']` — the
        # COMMENT records the DDL hash on the view's first column (Redshift rejects COMMENT ON
        # MATERIALIZED VIEW) so `sync_all_views` can skip rebuilds when the DDL is unchanged.
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol] e.g., :production, :test
        # @return [Array<String>] fully qualified names of views created
        def create_or_replace_views(client:, environment_type:)
          env = environment_type.to_s
          save_ddl_templates
          created = []

          rendered_ddls(environment_type: env).each do |fqn, info|
            drop_sql = "DROP MATERIALIZED VIEW IF EXISTS #{fqn}"
            create_sql = info[:sql]
            comment_sql = "COMMENT ON COLUMN #{fqn}.#{info[:first_column]} IS '#{self.class.ddl_hash(create_sql)}'"

            client.batch_execute([drop_sql, create_sql, comment_sql])
            created << fqn
          end

          created
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

        # Syncs materialized views in Redshift for a set of models: creates or
        # replaces views for each model and drops orphaned views that no longer
        # correspond to any model in the set.
        #
        # To avoid re-populating large views unnecessarily, each model's
        # rendered DDL is hashed and compared against the hash stored as the
        # view's Redshift COMMENT by a previous run. Views whose DDL has not
        # changed are reported as `:unchanged` in the returned plan and are
        # skipped at apply time. The daily REFRESH MATERIALIZED VIEW job keeps
        # their contents up to date.
        #
        # When a block is supplied, it is called before each unit of Redshift
        # work so callers can report progress. The yielded events are:
        #
        #   yield(:apply, table_name)              # before create-or-replace for one model
        #   yield(:applied, table_name)            # after create-or-replace for one model
        #   yield(:skipped, table_name)            # all of this model's views already match the desired DDL hash
        #   yield(:error, table_name, exception)   # create-or-replace raised; sync continues
        #   yield(:drop_batch, [fqn, ...])         # before the single DROP batch (skipped when empty)
        #
        # CREATE MATERIALIZED VIEW populates the view synchronously on Redshift,
        # so large source tables can take minutes per view; the :apply / :applied
        # events let an interactive caller emit per-model progress lines.
        #
        # Per-model failures (e.g., the source Zero ETL table not yet replicated,
        # transient Redshift errors) are caught and reported via the :error event
        # rather than aborting the whole run; the failed view name is added to
        # the returned plan under :failed.
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol] :production or :test
        # @param models [Enumerable<Class>] ActiveRecord model classes to sync
        # @param dry_run [Boolean] when true, returns the plan without executing
        # @yield [event, payload] optional progress callback (see above)
        # @return [Hash] :to_add, :to_update, :unchanged, :to_drop arrays of fully-qualified view names, and :failed
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
            failed: []
          }

          unless dry_run
            generators.each do |gen|
              table_name = gen.model.table_name
              gen_fqns = gen.expected_view_fqns(environment_type)

              if gen_fqns.any? && gen_fqns.all? {|fqn| unchanged_fqns.include?(fqn)}
                yield(:skipped, table_name) if block_given?
                next
              end

              yield(:apply, table_name) if block_given?
              begin
                gen.create_or_replace_views(client: client, environment_type: environment_type)
                yield(:applied, table_name) if block_given?
              rescue StandardError => exception
                plan[:failed] << table_name
                yield(:error, table_name, exception) if block_given?
              end
            end

            unless plan[:to_drop].empty?
              yield(:drop_batch, plan[:to_drop]) if block_given?
              client.batch_execute(plan[:to_drop].map {|fqn| "DROP MATERIALIZED VIEW IF EXISTS #{fqn}"})
            end
          end

          plan
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
