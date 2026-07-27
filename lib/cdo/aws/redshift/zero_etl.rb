require 'cdo/aws/redshift/client'

module Cdo
  module Aws
    module Redshift
      # SQL-level health checks on the AWS RDS Zero ETL Integration — the continuous MySQL -> Redshift
      # replication that `Cdo::Aws::Redshift::MaterializedViewManager`'s views are built on top of.
      # Everything here runs as a SQL statement in Redshift (a `SVV_INTEGRATION*` catalog read).
      # Integration operations that go through the RDS API instead (e.g. modifying an integration's
      # table filter) do NOT belong here — see `Cdo::RDS`.
      #
      # `integration_errors` / `unsynced_tables` report what is failing to replicate; the monitor cron
      # (`bin/cron/monitor_mysql_to_redshift_zeroetl_integration`) consumes them.
      module ZeroEtl
        # Suffix of the Redshift database Zero ETL continuously replicates MySQL data into, e.g.
        # `test_learningplatform_mysql_zeroetl`.
        TARGET_DATABASE_SUFFIX = 'learningplatform_mysql_zeroetl'.freeze

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
          unless VALID_ENVIRONMENT_TYPES.include?(environment_type.to_s)
            raise ArgumentError,
              "unknown environment_type #{environment_type.inspect}: expected one of #{VALID_ENVIRONMENT_TYPES.join(', ')}"
          end
          "#{environment_type}_#{TARGET_DATABASE_SUFFIX}"
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
        # anything not in a `HEALTHY_TABLE_STATES` state. Empty when all synced.
        #
        # @param client [Cdo::Aws::Redshift::Client]
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
      end
    end
  end
end
