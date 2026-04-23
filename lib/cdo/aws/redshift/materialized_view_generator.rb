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

        # Generates, saves, renders, and executes the DDL for both PII and non-PII materialized views.
        # @param client [Cdo::Aws::Redshift::Client]
        # @param environment_type [Symbol] e.g., :production, :test
        # @return [Array<String>] fully qualified names of views created
        def create_or_replace_views(client:, environment_type:)
          env = environment_type.to_s
          saved_files = save_ddl_templates
          created = []

          saved_files.each do |template_path|
            create_sql = self.class.render_ddl(template_path, environment_type: env)
            schema = template_path.end_with?('_pii.sql.erb') ? "#{BASE_REDSHIFT_SCHEMA_NAME}_#{env}_pii" : "#{BASE_REDSHIFT_SCHEMA_NAME}_#{env}"
            fqn = "#{schema}.#{view_name}"
            drop_sql = "DROP MATERIALIZED VIEW IF EXISTS #{fqn}"

            client.batch_execute([drop_sql, create_sql])
            created << fqn
          end

          created
        end

        # Renders a DDL ERB template file with the given environment type.
        # @param template_path [String] path to the .sql.erb template file
        # @param environment_type [String, Symbol] the environment type (e.g., :test or :production)
        # @return [String] the rendered SQL DDL
        def self.render_ddl(template_path, environment_type:)
          template = File.read(template_path)
          ERB.new(template).result_with_hash(environment_type: environment_type.to_s)
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

        private def build_ddl_erb_template(schema:, columns:)
          qualified_view = "#{schema}.#{view_name}"
          <<~SQL
            CREATE MATERIALIZED VIEW #{qualified_view}
              BACKUP NO
              DISTSTYLE KEY DISTKEY (#{distkey_column})
              AUTO REFRESH NO
            AS SELECT
              #{columns.join(",\n" + SQL_INDENT)}
            FROM #{ENVIRONMENT_TYPE_ERB}_learningplatform_mysql_zeroetl.#{BASE_REDSHIFT_SCHEMA_NAME}_#{ENVIRONMENT_TYPE_ERB}.#{model.table_name};
          SQL
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
