require 'cdo/aws/redshift/client'

module Cdo
  module Aws
    module Redshift
      # Redshit SQL statements on the AWS RDS Zero ETL Integration itself — the continuous MySQL ->
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
        # Suffix of the Redshift database Zero ETL continuously replicates MySQL data into, e.g.
        # `test_learningplatform_mysql_zeroetl`.
        TARGET_DATABASE_SUFFIX = 'learningplatform_mysql_zeroetl'.freeze

        # Schema prefix of the Zero ETL source tables inside the target database, mirroring the
        # MySQL `dashboard` database name. Parallels (intentionally duplicated, not shared, to avoid
        # a dependency between these two independent modules)
        # `MaterializedViewManager::ZERO_ETL_SOURCE_SCHEMA_PREFIX`.
        SOURCE_SCHEMA_PREFIX = 'dashboard'.freeze

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

        # @param environment_type [Symbol, String] one of VALID_ENVIRONMENT_TYPES
        # @return [String] e.g. "test_learningplatform_mysql_zeroetl"
        # @raise [ArgumentError] if environment_type is not a recognized environment
        def self.target_database(environment_type)
          "#{validated_environment_type(environment_type)}_#{TARGET_DATABASE_SUFFIX}"
        end

        # Schema housing this environment's Zero ETL source tables, e.g. "dashboard_test".
        # @param environment_type [Symbol, String] one of VALID_ENVIRONMENT_TYPES
        # @return [String]
        # @raise [ArgumentError] if environment_type is not a recognized environment
        def self.source_schema(environment_type)
          "#{SOURCE_SCHEMA_PREFIX}_#{validated_environment_type(environment_type)}"
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
            WHERE target_database = '#{target_database(environment_type)}'
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
            WHERE target_database = '#{target_database(environment_type)}'
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
          names = Array(table_names)
          return [] if names.empty?
          validate_table_names!(names)

          quoted_names = names.map {|name| "'#{name}'"}.join(', ')
          client.execute(<<~SQL)
            SELECT * FROM SVV_INTEGRATION_TABLE_STATE
            WHERE target_database = '#{target_database(environment_type)}'
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
            WHERE target_database = '#{target_database(environment_type)}';
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
          sql = "ALTER DATABASE #{target_database(environment_type)} INTEGRATION SET #{assignments};"
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
          names = Array(table_names)
          raise ArgumentError, 'table_names must not be empty' if names.empty?
          validate_table_names!(names)

          schema = source_schema(environment_type)
          qualified_tables = names.map {|name| "#{schema}.#{name}"}.join(', ')
          client.execute_async(
            "ALTER DATABASE #{target_database(environment_type)} INTEGRATION REFRESH TABLE #{qualified_tables};"
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
            statement_id = resync_tables(client: client, environment_type: environment_type, table_names: table_names)
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

        # Prevent SQL injection.
        # @raise [ArgumentError] if any name is not a table in the database schema.
        def self.validate_table_names!(names)
          unknown = names.reject {|name| table_exists?(name)}
          return if unknown.empty?

          raise ArgumentError, "unknown table(s) #{unknown.map(&:inspect).join(', ')}: not found in the database schema"
        end

        # Seam over the ActiveRecord dependency so the SQL-building methods stay unit-testable without a
        # database connection (stub `table_exists?` in tests). Resolves against the local MySQL schema.
        def self.table_exists?(name)
          ActiveRecord::Base.connection.data_source_exists?(name.to_s)
        end

        private_class_method :validated_environment_type, :validate_table_names!, :table_exists?
      end
    end
  end
end
