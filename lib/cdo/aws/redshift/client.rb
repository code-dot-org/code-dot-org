require 'aws-sdk-redshiftdataapiservice'

module Cdo
  module Aws
    module Redshift
      class Client
        class QueryError < StandardError; end

        # IAM permissions are required to execute SQL statements as a specific Redshift SQL user. For example, `daemon`
        # EC2 Instances are granted permission to connect to Redshift as the user `etl_client`
        # https://github.com/code-dot-org/code-dot-org/blob/5520c3c2c034135aa061ed6a279e19c74ab64550/aws/cloudformation/cloud_formation_stack.yml.erb#L563
        def initialize(cluster_id: CDO.redshift_cluster_id, database: 'dashboard', db_user: CDO.redshift_username)
          @client = ::Aws::RedshiftDataAPIService::Client.new
          @cluster_id = cluster_id
          @database = database
          @db_user = db_user
        end

        # SYNCHRONOUS: Blocks until the statement is FINISHED or FAILED.
        # @param sql [String] The SQL statement to execute.
        # @param timeout [Integer] Maximum time to wait in seconds. Defaults to 5 minutes.
        def execute(sql, timeout: 5.minutes.to_i)
          statement_id = execute_async(sql)
          wait_for_completion(statement_id, timeout: timeout)
          fetch_results(statement_id)
        end

        # ASYNCHRONOUS: Submits the query and returns the statement ID immediately.
        # @param sql [String] The SQL statement to execute.
        # @return [String] Statement ID.
        def execute_async(sql)
          CDO.log.info "[Redshift] Submitting SQL (#{sql.length} chars):\n#{sql}"
          resp = @client.execute_statement(
            cluster_identifier: @cluster_id,
            database: @database,
            db_user: @db_user,
            sql: sql
          )
          CDO.log.info "[Redshift] Statement submitted: #{resp.id}"
          resp.id
        end

        # SYNCHRONOUS: Executes multiple SQL statements serially. Blocks until all are FINISHED or one FAILS.
        # TODO: Does not return result sets. To support queries that return results, fetch_results would need to
        # iterate describe_statement sub_statements and call get_statement_result on each sub-statement ID.
        # @param sqls [Array<String>] SQL statements to execute in order.
        # @param timeout [Integer] Maximum time to wait in seconds. Defaults to 5 minutes.
        def batch_execute(sqls, timeout: 5.minutes.to_i)
          statement_id = batch_execute_async(sqls)
          wait_for_completion(statement_id, timeout: timeout)
        end

        # ASYNCHRONOUS: Submits multiple SQL statements for serial execution and returns the statement ID immediately.
        # @param sqls [Array<String>] SQL statements to execute in order.
        # @return [String] Statement ID.
        def batch_execute_async(sqls)
          CDO.log.info "[Redshift] Submitting batch of #{sqls.length} SQL statements:\n#{sqls.map.with_index(1) {|s, i| "  [#{i}] #{s}"}.join("\n")}"
          resp = @client.batch_execute_statement(
            cluster_identifier: @cluster_id,
            database: @database,
            db_user: @db_user,
            sqls: sqls
          )
          CDO.log.info "[Redshift] Batch statement submitted: #{resp.id}"
          resp.id
        end

        # Helper: Checks the status of an asynchronous statement.
        # @param statement_id [String] Identifier for the SQL statement to check.
        # @return [String] Current status of statement execution (`ABORTED`, `SUBMITTED`, `FINISHED`, etc.).
        def status(statement_id)
          desc = @client.describe_statement(id: statement_id)
          # https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/RedshiftDataAPIService/Types/DescribeStatementResponse.html#status-instance_method
          desc.status
        end

        # Long-running Ruby applications can invoke this method to block until a statement completes.
        # @param statement_id [String] The Redshift Data API statement ID.
        # @param timeout [Integer, nil] Maximum time to wait in seconds. Defaults to 4 hours.
        # @raise [QueryError] if final statement execution status is not success (`FINISHED`).
        def wait_for_completion(statement_id, timeout: 4.hours.to_i)
          start_time = Time.now

          loop do
            # Now we are safely comparing Float > Integer
            if timeout && (Time.now - start_time) > timeout
              # Actively kill the query on the Redshift cluster to save compute resources.
              begin
                @client.cancel_statement(id: statement_id)
              rescue
                nil
              end
              raise QueryError, "Query timed out after #{timeout} seconds."
            end

            current_status = status(statement_id)

            case current_status
            when 'FINISHED'
              CDO.log.info "[Redshift] Statement #{statement_id} finished in #{(Time.now - start_time).round(1)}s."
              return current_status
            when 'FAILED', 'ABORTED'
              desc = @client.describe_statement(id: statement_id)
              error_detail = build_error_detail(desc)
              CDO.log.error "[Redshift] Statement #{statement_id} #{current_status}:\n#{error_detail}"
              raise QueryError, "Redshift Data API Error (#{current_status}): #{error_detail}"
            end

            sleep 1
          end
        end

        # Retrieves the results of a FINISHED statement.
        # @param statement_id [String] The Redshift Data API statement ID.
        # @return [Array<Hash>] Array (one element per row in the ResultSet) of hashes.
        def fetch_results(statement_id)
          desc = @client.describe_statement(id: statement_id)
          return [] unless desc.has_result_set

          results = []
          next_token = nil

          loop do
            resp = @client.get_statement_result(id: statement_id, next_token: next_token)
            column_names = resp.column_metadata.map(&:name)

            resp.records.each do |row|
              values = row.map do |field|
                # Explicitly check .nil? instead of .present? to prevent 'false' booleans from evaluating to 'nil'.
                if field.is_null
                  nil
                elsif !field.string_value.nil?
                  field.string_value.strip # Trim trailing spaces from fixed width CHAR and BPCHAR columns.
                elsif !field.long_value.nil?
                  field.long_value
                elsif !field.boolean_value.nil?
                  field.boolean_value
                elsif !field.double_value.nil?
                  field.double_value
                elsif !field.blob_value.nil?
                  field.blob_value
                else
                  nil
                end
              end
              results << column_names.zip(values).to_h
            end

            next_token = resp.next_token
            break unless next_token
          end

          results
        end

        private def build_error_detail(desc)
          parts = []
          parts << desc.error if desc.error.present?
          parts << "SQL: #{desc.query_string}" if desc.query_string.present?

          if desc.respond_to?(:sub_statements) && desc.sub_statements&.any?
            desc.sub_statements.each_with_index do |sub, i|
              next unless sub.status == 'FAILED'
              parts << "Sub-statement #{i + 1} FAILED: #{sub.error}"
              parts << "Sub-statement #{i + 1} SQL: #{sub.query_string}" if sub.query_string.present?
            end
          end

          parts.empty? ? '(no error detail available)' : parts.join("\n")
        end
      end
    end
  end
end
