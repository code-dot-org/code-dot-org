require 'pg'
require 'singleton'
require 'cdo/aws/dms'

# A thin wrapper around PG, providing a mechanism to execute SQL commands on our AWS Redshift
# instance.
class RedshiftClient
  include Singleton
  class PostgreSQLQueryError < StandardError; end

  # See section on PQresultStatus in https://www.postgresql.org/docs/9.1/libpq-exec.html
  QUERY_SUCCESS_CODES = %w(
    PGRES_COMMAND_OK
    PGRES_TUPLES_OK
    PGRES_COPY_OUT
    PGRES_COPY_IN
    PGRES_COPY_BOTH
  ).freeze

  # We don't expect to actually receive this warning https://www.postgresql.org/docs/9.1/libpq-notice-processing.html
  QUERY_WARNING_CODES = %w(
    PGRES_NONFATAL_ERROR
  ).freeze

  QUERY_ERROR_CODES = %w(
    PGRES_EMPTY_QUERY
    PGRES_BAD_RESPONSE
    PGRES_FATAL_ERROR
  ).freeze

  # Database Migration Service Replication Tasks load data from Aurora into staging Redshift tables with a prefix.
  TEMP_TABLE_PREFIX = '_import_'.freeze

  def initialize
    port = 5439
    options = ''
    tty = ''
    dbname = 'dashboard'
    login = 'dev'
    @conn = PG::Connection.new(CDO.redshift_host, port, options, tty, dbname, login, CDO.redshift_password)
  end

  def exec(sql_query)
    result = @conn.exec(sql_query)
    # result_status is an undocumented method that returns the integer query status.
    # res_status is an undocumented method that returns the string identifier for a given integer query status.
    result_status = result.res_status(result.result_status)
    raise PostgreSQLQueryError.new(result_status) unless QUERY_SUCCESS_CODES.include? result_status
    result
  end

  # DMS Replication Tasks import data into temporary / staging tables prefixed with "_import_".
  # Complete import of staged data from production database into Redshift by truncating each
  # target table, moving all of the rows from each import table to its corresponding target table, and then dropping
  # each temporary / staging import table.
  def complete_table_import
    Cdo::DMS::REDSHIFT_SCHEMAS_IMPORTED_FROM_DATABASE.each do |schema|
      temporary_import_tables(schema).each do |import_table|
        target_table = import_table.partition(TEMP_TABLE_PREFIX).last
        truncate_table(schema, target_table)
        move_rows(schema, import_table, schema, target_table)
        drop_table(schema, import_table)
      end
    end
  end

  # Get names of tables in a Redshift schema that were loaded via DMS to stage imported data from the database.
  # @param schema [String] The Redshift schema to search for database import staging tables.
  # Returns Array of Redshift table names.
  def temporary_import_tables(schema)
    query = <<-SQL
SET search_path TO #{schema};

SELECT DISTINCT t.tablename
FROM pg_table_def t LEFT JOIN pg_indexes i ON t.tablename = i.indexname
WHERE  i.indexname IS NULL -- Don't count primary keys, which appear in pg_table_def, as a table.
  AND  t.schemaname ='#{schema}'
  AND t.tablename LIKE '#{TEMP_TABLE_PREFIX}%';
SQL
    exec(query).map {|row| row['tablename']}
  end

  def truncate_table(schema, table)
    exec "TRUNCATE #{schema}.#{table};"
  end

  def drop_table(schema, table)
    exec "DROP TABLE IF EXISTS #{schema}.#{table};"
  end

  def move_rows(source_schema, source_table, target_schema, target_table)
    exec "ALTER TABLE #{target_schema}.#{target_table} APPEND FROM #{source_schema}.#{source_table};"
  end
end
