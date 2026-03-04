require 'aws-sdk-redshiftdataapiservice'

module Cdo
  class Redshift
    class QueryError < StandardError; end

    def initialize(cluster_id: CDO.redshift_cluster_id, database: 'dashboard', db_user: CDO.redshift_username)
      @client = Aws::RedshiftDataAPIService::Client.new
      @cluster_id = cluster_id
      @database = database
      @db_user = db_user
    end

    # Synchronous: Blocks until the statement is FINISHED or FAILED.
    def execute(sql)
      statement_id = execute_async(sql)
      wait_for_completion(statement_id)
      fetch_results(statement_id)
    end

    # Asynchronous: Submits the query and returns the statement ID immediately.
    def execute_async(sql)
      resp = @client.execute_statement(
        cluster_identifier: @cluster_id,
        database: @database,
        db_user: @db_user,
        sql: sql
      )
      resp.id
    end

    # Helper: Checks the status of an asynchronous statement.
    def status(statement_id)
      desc = @client.describe_statement(id: statement_id)
      desc.status
    end

    private def wait_for_completion(statement_id)
      loop do
        current_status = status(statement_id)

        case current_status
        when 'FINISHED'
          return
        when 'FAILED', 'ABORTED'
          # If we need the error message, we have to describe the statement again or fetch it.
          desc = @client.describe_statement(id: statement_id)
          raise QueryError, "Redshift Data API Error (#{current_status}): #{desc.error}"
        end

        sleep 1
      end
    end

    private def fetch_results(statement_id)
      desc = @client.describe_statement(id: statement_id)
      return [] unless desc.has_result_set

      results = []
      next_token = nil

      loop do
        resp = @client.get_statement_result(id: statement_id, next_token: next_token)
        column_names = resp.column_metadata.map(&:name)

        resp.records.each do |row|
          values = row.map do |f|
            f.string_value || f.long_value || f.boolean_value || f.double_value || (f.is_null ? nil : nil)
          end
          results << column_names.zip(values).to_h
        end

        next_token = resp.next_token
        break unless next_token
      end

      results
    end
  end
end
