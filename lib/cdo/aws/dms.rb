require_relative '../../../deployment'
require 'aws-sdk-databasemigrationservice'
require 'ostruct'
require 'cdo/redshift_import'

module Cdo
  class DMS
    def self.redshift_schemas_imported_from_database
      %w(dashboard pegasus).map {|schema| CDO["#{schema}_db_name"]}.product(['', '_pii']).map(&:join)
    end

    # Generates a set of DMS task definition hashes from a source YAML configuration file.
    def self.tasks(file)
      tasks = YAML.load_file(file)
      tasks.map do |task_name, task|
        rules = []
        remove_rules = []

        # Default is to execute each FULL LOAD Replication Task on a daily schedule.
        schedule = 'daily'

        task.each do |schema|
          properties = nil

          schema, properties = schema.first if schema.is_a?(Hash)
          schema, table = schema.split '.'
          schema = CDO["#{schema}_db_name"]

          # The level sources
          schedule = properties['schedule'] if properties && properties['schedule']

          rules << {
            'rule-type': 'selection',
            'object-locator': {
              'schema-name': schema,
              'table-name': table
            },
            'rule-action': 'include'
          }

          # Add transformation rule to prefix target table name with '_import_', so we import each production MySQL
          # table to a staging Redshift table, which is later swapped into the target table when the FULL LOAD is
          # complete.
          unless properties && properties['skip_staging_table']
            rules << {
              'rule-type': 'transformation',
              'rule-action': 'add-prefix',
              'rule-target': 'table',
              'object-locator': {
                'schema-name': schema,
                'table-name': table,
              },
              'value': RedshiftImport::TEMP_TABLE_PREFIX
            }
          end

          # Remove specified columns using transformation rule.
          properties &&
            (columns = properties['remove_column']) &&
            columns.each do |column|
              remove_rules << {
                'rule-type': 'transformation',
                'rule-action': 'remove-column',
                'rule-target': 'column',
                'object-locator': {
                  'schema-name': schema,
                  'table-name': table,
                  'column-name': column
                }
              }
            end
        end

        rules.concat remove_rules

        # Migrate `-pii` tasks to alternative schema using transformation rule.
        if task_name.end_with? '-pii'
          rules << {
            'rule-type': 'transformation',
            'rule-action': 'add-suffix',
            'rule-target': 'schema',
            'object-locator': {'schema-name': '%'},
            'value': '_pii'
          }
        end

        # Add auto-increment rule-name and rule-id keys in specific order.
        rules = rules.map.with_index do |rule, index|
          rule.to_a.
            insert(1, ['rule-name', (index + 1).to_s]).
            insert(1, ['rule-id', (index + 1).to_s]).
            to_h
        end

        [task_name, {rules: rules}, schedule]
      end
    end

    class ReplicationTask
      # Get list of Replication Tasks that should be run on a specified schedule.
      # @param schedule [String] Frequency that task should be executed ('daily', 'weekly', etc.)
      # Returns array of Cdo::DMS::ReplicationTask
      def self.tasks_by_frequency(schedule)
        dms_client = Aws::DatabaseMigrationService::Client.new
        replication_tasks = dms_client.describe_replication_tasks({without_settings: true}).replication_tasks
        aws_tasks = replication_tasks.select do |task|
          dms_client.
            list_tags_for_resource({resource_arn: task.replication_task_arn}).
            tag_list.
            any? {|tag| tag.key == 'schedule' && tag.value == schedule}
        end
        aws_tasks.map do |aws_task|
          Cdo::DMS::ReplicationTask.new(aws_task.replication_task_arn, dms_client)
        end
      end

      # @param arn [String] Replication Task ARN
      # @param client [Aws::DatabaseMigrationService:Client] optionally pass in a DMS client.
      def initialize(arn, client = Aws::DatabaseMigrationService::Client.new)
        @arn = arn
        @dms_client = client
      end

      # Get current status of the Replication Task including table statistics.
      # Returns an OStruct containing the attributes returned by describe_replication_tasks and describe_table_statistics
      # that are relevant to assessing whether a task has completed successfully.
      def status
        task = OpenStruct.new(arn: @arn)

        replication_task = @dms_client.describe_replication_tasks(
          {
            filters: [
              {
                name: 'replication-task-arn',
                values: [@arn]
              }
            ]
          },
          max_records: 1,
          without_settings: true
        ).replication_tasks[0]

        # Collect the replication task attributes that identify overall replication status.
        task.status = replication_task.status
        task.last_failure_message = replication_task.last_failure_message
        task.stop_reason = replication_task.stop_reason
        task.start_date = replication_task.replication_task_start_date
        task.full_load_progress_percent = replication_task.replication_task_stats.full_load_progress_percent
        task.tables_loaded = replication_task.replication_task_stats.tables_loaded
        task.tables_loading = replication_task.replication_task_stats.tables_loading
        task.tables_queued = replication_task.replication_task_stats.tables_queued
        task.tables_errored = replication_task.replication_task_stats.tables_errored

        task.table_statistics = @dms_client.describe_table_statistics(
          {
            replication_task_arn: @arn
          }
        ).table_statistics

        return task
      end

      # Start the replication task and wait until it completes successfully.
      # @param max_attempts [Integer] Number of times to check whether task has completed successfully before failing.
      # @param delay [Integer] Number of seconds to wait between checking task status.
      def start(max_attempts, delay)
        CDO.log.info "Starting DMS Replication Task: #{@arn}"
        task = status
        @dms_client.start_replication_task(
          {
            replication_task_arn: @arn,
            # If a Replication Task has never been executed before, start it, otherwise, reload it.
            start_replication_task_type: task.status == 'ready' ? 'start-replication' : 'reload-target'
          }
        )

        wait_until_completed(max_attempts, delay)

        unless completed_successfully?
          raise StandardError.new("Replication Task #{@arn} did not complete successfully.  Task Status - #{status}")
        end

        CDO.log.info "DMS Task Completed Successfully: #{@arn}"
      rescue StandardError => error
        CDO.log.info "Error executing DMS Replication Task #{@arn} - #{error.message}"
        raise error
      end

      # Check periodically until replication task has completed and then validate that it was successful.
      # @param max_attempts [Integer] Number of times to check whether task has completed successfully before failing.
      # @param delay [Integer] Number of seconds to wait between checking task status.
      def wait_until_completed(max_attempts, delay)
        attempts = 1
        task = status
        while attempts <= max_attempts && task.status != 'stopped'
          CDO.log.info "Replication Task ARN: #{task.arn} / Status: #{task.status} / Attempt: #{attempts} of #{max_attempts}"

          attempts += 1
          task = status
          sleep delay
        end

        return task if completed_successfully?

        raise StandardError.new("Timeout after waiting #{attempts * delay} seconds or Replication Task" \
          " #{@arn} did not complete successfully.  Task Status - #{status}"
        )
      end

      # Determine whether a Full Load Replication Task has completed successfully.
      def completed_successfully?
        task = status

        return task.status == 'stopped' &&
          task.stop_reason.include?('FULL_LOAD_ONLY_FINISHED') &&
          task.full_load_progress_percent == 100 &&
          task.tables_loaded > 0 &&
          task.tables_loading == 0 &&
          task.tables_queued == 0 &&
          task.tables_errored == 0 &&
          task.table_statistics.all? {|table| table.table_state == 'Table completed'}
      end
    end
  end
end
