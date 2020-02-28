require_relative '../../../deployment'
require 'aws-sdk-databasemigrationservice'
require 'ostruct'

module Cdo
  class DMS
    # Generates a set of DMS task definition hashes from a source YAML configuration file.
    def self.tasks(file)
      tasks = YAML.load_file(file)
      tasks.map do |task_name, task|
        rules = []
        remove_rules = []

        task.each do |schema|
          properties = nil
          schema, properties = schema.first if schema.is_a?(Hash)
          schema, table = schema.split '.'
          schema = CDO["#{schema}_db_name"]

          rules << {
            'rule-type': 'selection',
            'object-locator': {
              'schema-name': schema,
              'table-name': table
            },
            'rule-action': 'include'
          }

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

        [task_name, {rules: rules}]
      end
    end

    # Get list of Replication Tasks that should be run on a specified schedule.
    # @param schedule [String] Frequency that task should be executed ('daily', 'weekly', etc.)
    # Returns array of Aws::DatabaseMigrationService::Types::ReplicationTask
    def self.replication_tasks(schedule)
      dms_client = Aws::DatabaseMigrationService::Client.new
      replication_tasks = dms_client.describe_replication_tasks({without_settings: true}).replication_tasks
      replication_tasks.select do |task|
        dms_client.
          list_tags_for_resource({resource_arn: task.replication_task_arn}).
          tag_list.
          any? {|tag| tag.key == 'schedule' && tag.value == schedule}
      end
    end

    # Get current status of a Replication Task including table statistics.
    def self.replication_task_status(replication_task_arn)
      task = OpenStruct.new(arn: replication_task_arn)

      dms_client = Aws::DatabaseMigrationService::Client.new
      replication_task = dms_client.describe_replication_tasks(
        {
          filters: [
            {
              name: 'replication-task-arn',
              values: [replication_task_arn]
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

      task.table_statistics = dms_client.describe_table_statistics(
        {
          replication_task_arn: replication_task_arn
        }
      ).table_statistics

      return task
    end

    # Start a replication task and wait until it completes, raising an error if the task did not complete within a
    # configurable time period or did not complete successfully.
    # @param replication_task_arn [String]
    # @param max_attempts [Integer] Number of times to check whether task has completed successfully before failing.
    # @param delay [Integer] Number of seconds to wait between checking task status.
    def self.start_replication_task(replication_task_arn, max_attempts, delay)
      CDO.log.info "Starting DMS Replication Task: #{replication_task_arn}"
      task = replication_task_status(replication_task_arn)
      dms_client = Aws::DatabaseMigrationService::Client.new
      dms_client.start_replication_task(
        {
          replication_task_arn: replication_task_arn,
          # If a Replication Task has never been executed before, start it, otherwise, reload it.
          start_replication_task_type: task.status == 'ready' ? 'start-replication' : 'reload-target'
        }
      )

      wait_until_replication_task_completed(replication_task_arn, max_attempts, delay)

      CDO.log.info "DMS Task Completed Successfully: #{replication_task_arn}"
    rescue StandardError => error
      CDO.log.info "Error executing DMS Replication Task #{replication_task_arn} - #{error.message}"
      raise error
    end

    def self.wait_until_replication_task_completed(replication_task_arn, max_attempts, delay)
      attempts = 1
      task = replication_task_status(replication_task_arn)
      while attempts <= max_attempts && task.status != 'stopped'
        CDO.log.info "Replication Task ARN: #{task.arn} / Status: #{task.status} / Attempt: #{attempts} of #{max_attempts}"

        attempts += 1
        task = replication_task_status(replication_task_arn)
        sleep delay
      end

      return task if replication_task_completed_successfully?(task.arn)

      raise StandardError.new("Timeout after waiting #{attempts * delay} seconds or Replication Task" \
    " #{replication_task_arn} did not complete successfully.  Task Status - #{task}"
      )
    end

    # Determine whether a Full Load Replication Task has completed successfully.
    def self.replication_task_completed_successfully?(replication_task_arn)
      task = replication_task_status(replication_task_arn)

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
