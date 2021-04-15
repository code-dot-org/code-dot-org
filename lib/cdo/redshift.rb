require 'singleton'

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

  def initialize
    require 'pg'

    port = 5439
    options = ''
    tty = ''
    dbname = 'dashboard'
    @conn = PG::Connection.new(CDO.redshift_host, port, options, tty, dbname, CDO.redshift_username, CDO.redshift_password)
  end

  def exec(sql_query)
    result = @conn.exec(sql_query)
    # result_status is an undocumented PG::Result method that returns the integer query status.
    # res_status is an undocumented PG::Result method that returns the string code for a given integer query status.
    # API - https://www.rubydoc.info/gems/pg/PG/Result
    # Source - https://github.com/ged/ruby-pg/blob/master/lib/pg/result.rb
    result_status = result.res_status(result.result_status)
    unless (QUERY_SUCCESS_CODES + QUERY_WARNING_CODES).include? result_status
      # Postgres/Redshift can enter an `ABORT_STATE` when a statement fails execution and all subsequent statements
      # executed in the same client session (even if they're not in the transaction block where the exception was
      # raised) fail until the ABORT STATE is cleared with a COMMIT or a ROLLBACK. We share the same Redshift client
      # connection through the Redshift singleton class, so default to explicitly rolling back whatever
      # transaction we're in to clear the abort state.
      @conn.exec('ROLLBACK;')
      raise PostgreSQLQueryError.new(result_status)
    end
    result
  end
end
