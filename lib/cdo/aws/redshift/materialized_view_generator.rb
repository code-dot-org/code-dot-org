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

        attr_reader :model, :environment_type

        # Analytics Redshift schemas where we create Materialized Views that source data from Zero ETL database use
        # `dashboard_` naming conventions.
        BASE_REDSHIFT_SCHEMA_NAME = 'dashboard'.freeze

        # @param model [Class] The ActiveRecord model class (e.g., User, Activity)
        # @param environment_type [String] The environment type ('test' or 'production').
        def initialize(model, environment_type: 'test')
          @model = model
          @environment_type = environment_type.to_s
        end

        # Generates the DDL for the PII (full) Materialized View
        def generate_pii_ddl
          columns = model.columns.map(&:name)
          return nil if columns.empty? # Prevent invalid SQL generation

          build_ddl(schema: "#{BASE_REDSHIFT_SCHEMA_NAME}_#{environment_type}_pii", columns: columns)
        end

        # Generates the DDL for the non-PII (restricted) Materialized View.
        def generate_non_pii_ddl
          return nil if non_pii_columns.empty?
          build_ddl(schema: "#{BASE_REDSHIFT_SCHEMA_NAME}_#{environment_type}", columns: non_pii_columns)
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

        private def build_ddl(schema:, columns:)
          view_name = "zeroetl_#{model.table_name}"

          <<~SQL
            CREATE MATERIALIZED VIEW #{schema}.#{view_name}
              BACKUP NO
              DISTSTYLE KEY DISTKEY (#{distkey_column})
              AUTO REFRESH NO
            AS SELECT
              #{columns.join(',\n' + SQL_INDENT)}
            FROM #{source_table_path};
          SQL
        end

        # The fully qualified path to the source table replicated by Zero-ETL.
        private def source_table_path
          # Example: production_learningplatform_mysql_zeroetl.dashboard_production.users
          "#{environment_type}_learningplatform_mysql_zeroetl.#{BASE_REDSHIFT_SCHEMA_NAME}_#{environment_type}.#{model.table_name}"
        end

        # Redshift DISTSTYLE KEY requires explicitly naming the DISTKEY column.
        # We attempt to use the primary key, defaulting to 'id' or the first column
        # if a composite primary key exists.
        private def distkey_column
          pk = model.primary_key
          if pk.is_a?(Array)
            pk.first # Handle composite_primary_keys gem arrays
          elsif pk.present?
            pk
          else
            'id' # Safe fallback
          end
        end
      end
    end
  end
end
