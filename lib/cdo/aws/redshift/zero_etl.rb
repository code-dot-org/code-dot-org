require 'cdo/aws/redshift/client'

module Cdo
  module Aws
    module Redshift
      # Redshift SQL statements on the AWS RDS Zero ETL Integration itself — the continuous MySQL ->
      # Redshift replication that `Cdo::Aws::Redshift::MaterializedViewManager`'s views are built on
      # top of. Everything here runs as a SQL statement in Redshift (a `SVV_INTEGRATION*` catalog
      # read or an `ALTER DATABASE ... INTEGRATION ...` command). Integration operations that go
      # through the RDS API instead (e.g. modifying an integration's table filter) do NOT belong
      # here — see `Cdo::RDS`.
      #
      # Two concerns:
      #   * Health: `integration_errors` / `unsynced_tables` report what is failing to replicate.
      #   * Repair: `resync_tables` re-replicates a table once its underlying problem is fixed. A
      #     table occasionally fails to replicate (no primary key, a blob column, a foreign key with
      #     ON DELETE CASCADE, ...; see `SVV_INTEGRATION_TABLE_STATE.reason`), and once the problem
      #     is fixed in MySQL the sync does not retry itself — Redshift must be told to resync.
      module ZeroEtl
        # Suffix of the Target Redshift database Zero ETL continuously replicates MySQL data into, e.g.
        # `test_learningplatform_mysql_zeroetl`.
        REDSHIFT_DATABASE_SUFFIX = 'learningplatform_mysql_zeroetl'.freeze

        # Zero ETL names each Redshift schema after the Source MySQL database it replicates from, so this matches
        # `CDO.dashboard_db_name`.
        REDSHIFT_SCHEMA_PREFIX_DASHBOARD = 'dashboard'.freeze

        # Production MySQL Pegasus database is named `pegasus`, not `pegasus_production`.
        REDSHIFT_SCHEMA_PEGASUS_BY_ENVIRONMENT = {
          'production' => 'pegasus',
          'test' => 'pegasus_test',
        }.freeze

        # Integration-level state reported by SVV_INTEGRATION that means the integration needs human
        # attention. The other observed states — PendingDbConnectState, SchemaDiscoveryState,
        # CdcRefreshState — are healthy/transient.
        INTEGRATION_ERROR_STATE = 'ErrorState'.freeze

        # Table-level states from SVV_INTEGRATION_TABLE_STATE that are NOT a problem: `Synced` is the
        # healthy steady state, and `ResyncInitiated` is the expected transient state while a resync
        # is in flight. Any other state (e.g. `Failed`, `ResyncRequired`) means the table is not
        # replicating and should be reported.
        # https://docs.aws.amazon.com/redshift/latest/dg/r_SVV_INTEGRATION_TABLE_STATE.html
        HEALTHY_TABLE_STATES = %w[Synced ResyncInitiated].freeze

        # We only have Zero ETL Integration provisioned for the production and managed test systems.
        VALID_ENVIRONMENT_TYPES = %w[production test].freeze

        # Logical MySQL database identifier.
        MYSQL_DATABASES = %i[dashboard pegasus].freeze

        # @param environment_type [Symbol, String] one of VALID_ENVIRONMENT_TYPES
        # @return [String] e.g. "test_learningplatform_mysql_zeroetl"
        # @raise [ArgumentError] if environment_type is not a recognized environment
        def self.redshift_database(environment_type)
          "#{validated_environment_type(environment_type)}_#{REDSHIFT_DATABASE_SUFFIX}"
        end

        # Schema in `redshift_database` replicating `mysql_database`, e.g. "dashboard_test".
        # @param environment_type [Symbol, String] one of VALID_ENVIRONMENT_TYPES
        # @param mysql_database [Symbol, String] Logical identifier of the source MySQL database (`:dashboard` or `:pegasus`)
        # @return [String]
        # @raise [ArgumentError] if environment_type or mysql_database is not recognized
        def self.redshift_schema(environment_type, mysql_database: :dashboard)
          env = validated_environment_type(environment_type)
          return REDSHIFT_SCHEMA_PEGASUS_BY_ENVIRONMENT.fetch(env) if validated_mysql_database(mysql_database) == :pegasus

          "#{REDSHIFT_SCHEMA_PREFIX_DASHBOARD}_#{env}"
        end

        # Prefix that makes ActiveRecord resolve a table in `mysql_database`, empty for the dashboard
        # database its connection already points at. Uses the PHYSICAL database name, which is
        # environment-specific (`pegasus_development`, `pegasus_unittest`).
        # @param mysql_database [Symbol, String] one of MYSQL_DATABASES
        # @return [String] e.g. "pegasus_development." or ""
        def self.mysql_table_prefix(mysql_database)
          validated_mysql_database(mysql_database) == :pegasus ? "#{CDO.pegasus_db_name}." : ''
        end

        # Splits an optionally qualified `mysql_database.table` the way MySQL itself would, so a
        # caller can name a table in any replicated database. When provided, the database name must be the logical
        # identifier (`dashboard` or `pegasus`), not the physical database name (`pegasus_test`, `dashboard_production`).
        # @param optionally_qualified_table_name [String] e.g. `users`, `dashboard.users`, or `pegasus.hoc_activity`.
        # @return [Array(Symbol, String)] Logical MySQL database identifier (`:dashboard` or `:pegasus`) and the bare table name.
        # @raise [ArgumentError] if a qualifier is not one of MYSQL_DATABASES.
        def self.parse_qualified_table_name(optionally_qualified_table_name)
          # `rpartition` returns an empty string for the database when table name is unqualified.
          table_name_parts = optionally_qualified_table_name.to_s.rpartition('.')
          mysql_database = table_name_parts.first.presence || :dashboard # Default to dashboard for unqualified names.

          [validated_mysql_database(mysql_database), table_name_parts.last]
        end

        # Integrations targeting this environment's Zero ETL database that are in an error state.
        # Empty when the integration is healthy.
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol, String]
        # @return [Array<Hash>] SVV_INTEGRATION rows (column name => value), error-state only.
        def self.integration_errors(client:, environment_type:)
          client.execute(<<~SQL)
            SELECT * FROM SVV_INTEGRATION
            WHERE target_database = '#{redshift_database(environment_type)}'
              AND state = '#{INTEGRATION_ERROR_STATE}';
          SQL
        end

        # Tables in this environment's Zero ETL database that are not successfully replicating —
        # anything not in a `HEALTHY_TABLE_STATES` state. These are the tables `resync_tables` fixes
        # once the underlying cause (from each row's `reason`) is resolved. Empty when all synced.
        #
        # @param client [Cdo::Aws::Redshift::Client] must authenticate as the target Redshift database owner or SUPERUSER.
        # @param environment_type [Symbol, String]
        # @return [Array<Hash>] SVV_INTEGRATION_TABLE_STATE rows (column name => value).
        def self.unsynced_tables(client:, environment_type:)
          healthy_states = HEALTHY_TABLE_STATES.map {|state| "'#{state}'"}.join(', ')
          client.execute(<<~SQL)
            SELECT * FROM SVV_INTEGRATION_TABLE_STATE
            WHERE target_database = '#{redshift_database(environment_type)}'
              AND table_state NOT IN (#{healthy_states});
          SQL
        end

        # State rows (including the `reason` column) for specific tables in this environment's Zero
        # ETL database, in whatever state they're in. Use this to surface WHY a named table isn't
        # replicating: `ALTER DATABASE ... INTEGRATION REFRESH` is a control command whose Data API
        # statement error is empty on failure — the actionable detail is only in
        # SVV_INTEGRATION_TABLE_STATE.reason (the same field the monitor cron logs).
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol, String]
        # @param table_names [Array<String>, String] one or more MySQL table names, unqualified.
        # @return [Array<Hash>] matching SVV_INTEGRATION_TABLE_STATE rows (empty if none match).
        def self.table_states(client:, environment_type:, table_names:)
          parsed = Array(table_names).map {|name| parse_qualified_table_name(name)}
          return [] if parsed.empty?
          validate_table_names!(parsed)

          # SVV_INTEGRATION_TABLE_STATE.table_name is the bare table name; the database it came from
          # is reported separately as schema_name.
          quoted_names = parsed.map {|_mysql_database, table| "'#{table}'"}.join(', ')
          client.execute(<<~SQL)
            SELECT * FROM SVV_INTEGRATION_TABLE_STATE
            WHERE target_database = '#{redshift_database(environment_type)}'
              AND table_name IN (#{quoted_names});
          SQL
        end

        # Every SVV_INTEGRATION_TABLE_STATE row for this environment's target database, in any state —
        # the full picture of what Zero ETL is replicating. Decoupled from what we intend to export;
        # callers cross-reference against their own set (e.g. the exported-model tables) as needed.
        #
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol, String]
        # @return [Array<Hash>] all SVV_INTEGRATION_TABLE_STATE rows for the target database.
        def self.all_table_states(client:, environment_type:)
          client.execute(<<~SQL)
            SELECT * FROM SVV_INTEGRATION_TABLE_STATE
            WHERE target_database = '#{redshift_database(environment_type)}';
          SQL
        end

        # `ALTER DATABASE ... INTEGRATION SET` flags the Zero ETL target database MUST have enabled for
        # our data to replicate — not tunable knobs, but a fixed precondition of this pipeline:
        #   ACCEPTINVCHARS  — replace invalid VARCHAR characters with `?` rather than failing the row.
        #   TRUNCATECOLUMNS — truncate over-limit VARCHAR values / overflowing JSON attributes into a
        #                     SUPER column rather than failing the row.
        # Both default to FALSE and reset to FALSE whenever the target database is dropped and recreated
        # (CREATE DATABASE ... FROM INTEGRATION), so they must be re-applied after any such recreation.
        # This lives here (rather than in CloudFormation with the rest of the integration's IaC) only
        # because the target database's integration settings can't currently be provisioned via
        # CloudFormation; move it there if that becomes possible.
        REQUIRED_INTEGRATION_SETTINGS = %w[ACCEPTINVCHARS TRUNCATECOLUMNS].freeze

        # Enables every REQUIRED_INTEGRATION_SETTINGS on this environment's target Zero ETL database.
        # Idempotent; run after (re)creating the target database. Affects ingestion GOING FORWARD only,
        # so resync any already-failed tables (`resync_tables`) afterward to re-ingest them under the
        # settings.
        #
        # @param client [Cdo::Aws::Redshift::Client] must authenticate as the target Redshift database owner or SUPERUSER.
        # @param environment_type [Symbol, String]
        # @return [String] the ALTER statement that was executed.
        def self.apply_required_integration_settings(client:, environment_type:)
          assignments = REQUIRED_INTEGRATION_SETTINGS.map {|setting| "#{setting} = TRUE"}.join(' ')
          sql = "ALTER DATABASE #{redshift_database(environment_type)} INTEGRATION SET #{assignments};"
          client.execute(sql)
          sql
        end

        # Tells Redshift to resync one or more tables from the Zero ETL source: use this after fixing
        # whatever made a table fail to replicate. Fully re-replicates the named table(s) from MySQL;
        # each table is inaccessible in Redshift (SVV_INTEGRATION_TABLE_STATE state `Syncing`) until
        # its resync completes, which happens asynchronously in the background — this only submits the
        # request.
        #
        # @param client [Cdo::Aws::Redshift::Client] must authenticate as the target Redshift database owner or SUPERUSER.
        # @param environment_type [Symbol, String]
        # @param table_names [Array<String>, String] one or more MySQL table names, unqualified.
        # @return [String] the Redshift Data API statement ID.
        def self.resync_tables(client:, environment_type:, table_names:)
          parsed = Array(table_names).map {|name| parse_qualified_table_name(name)}
          raise ArgumentError, 'table_names must not be empty' if parsed.empty?
          validate_table_names!(parsed)

          # Each table is qualified with the Zero ETL schema of the database holding it, so one
          # request can mix Dashboard and Pegasus tables.
          qualified_tables = parsed.map do |mysql_database, table|
            "#{redshift_schema(environment_type, mysql_database: mysql_database)}.#{table}"
          end.join(', ')
          client.execute_async(
            "ALTER DATABASE #{redshift_database(environment_type)} INTEGRATION REFRESH TABLE #{qualified_tables};"
          )
        end

        # Request a resync (`resync_tables`) and report status.
        #
        # @param client [Cdo::Aws::Redshift::Client] must authenticate as the target Redshift database owner or SUPERUSER.
        # @param environment_type [Symbol, String]
        # @param table_names [Array<String>, String] one or more MySQL table names, unqualified.
        # @return [Hash]
        #   :outcome [Symbol]
        #     :requested       — the REFRESH was accepted; a resync has been submitted.
        #     :already_syncing — REFRESH was a no-op because the table(s) are already Synced/ResyncInitiated.
        #     :blocked         — one or more tables are in a non-healthy state; resolve `:blocked` first.
        #     :unknown         — no SVV_INTEGRATION_TABLE_STATE rows matched (wrong table name or environment).
        #   :states  [Array<Hash>] SVV rows for the requested tables (empty when :unknown).
        #   :blocked [Array<Hash>] the subset of :states not in HEALTHY_TABLE_STATES (empty unless :blocked).
        def self.resync_and_report(client:, environment_type:, table_names:)
          refresh_failed = false
          begin
            statement_id = resync_tables(
              client: client, environment_type: environment_type, table_names: table_names
            )
            client.wait_for_completion(statement_id)
          rescue Cdo::Aws::Redshift::Client::QueryError
            refresh_failed = true
          end

          states = table_states(client: client, environment_type: environment_type, table_names: table_names)
          blocked = states.reject {|row| HEALTHY_TABLE_STATES.include?(row['table_state'])}

          outcome =
            if states.empty?
              :unknown
            elsif blocked.any?
              :blocked
            elsif refresh_failed
              :already_syncing
            else
              :requested
            end

          {outcome: outcome, states: states, blocked: blocked}
        end

        # @raise [ArgumentError] unless environment_type is one of VALID_ENVIRONMENT_TYPES.
        # @return [String] the validated environment_type, as a String.
        def self.validated_environment_type(environment_type)
          env = environment_type.to_s
          return env if VALID_ENVIRONMENT_TYPES.include?(env)

          raise ArgumentError,
            "unknown environment_type #{environment_type.inspect}: expected one of #{VALID_ENVIRONMENT_TYPES.join(', ')}"
        end

        # Prevent SQL injection, checking each table against the database it is supposed to be in.
        # @param parsed [Array<Array(Symbol, String)>] database/table pairs from
        #   `parse_qualified_table_name`.
        # @raise [ArgumentError] if any table is not in its database.
        def self.validate_table_names!(parsed)
          unknown = parsed.reject {|mysql_database, table| table_exists?("#{mysql_table_prefix(mysql_database)}#{table}")}
          return if unknown.empty?

          named = unknown.map {|mysql_database, table| "#{mysql_database}.#{table}".inspect}.join(', ')
          raise ArgumentError, "unknown table(s) #{named}: not found in the database schema"
        end

        # @raise [ArgumentError] unless database is one of MYSQL_DATABASES.
        # @return [Symbol] the validated database.
        def self.validated_mysql_database(mysql_database)
          db = mysql_database.to_s.to_sym
          return db if MYSQL_DATABASES.include?(db)

          raise ArgumentError,
            "unknown MySQL database #{mysql_database.inspect}: expected one of #{MYSQL_DATABASES.join(', ')}"
        end

        # Seam over the ActiveRecord dependency so the SQL-building methods stay unit-testable without a
        # database connection (stub `table_exists?` in tests). Resolves against the local MySQL schema.
        def self.table_exists?(name)
          ActiveRecord::Base.connection.data_source_exists?(name.to_s)
        end

        private_class_method :validated_environment_type, :validated_mysql_database,
          :validate_table_names!, :table_exists?
      end
    end
  end
end
