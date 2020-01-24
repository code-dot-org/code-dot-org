require_relative '../../../deployment'
require 'aws-sdk-databasemigrationservice'

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

    # Get list of production Replication Tasks and return as an array of
    # Aws::DatabaseMigrationService::Types::ReplicationTask
    # https://docs.aws.amazon.com/ja_jp/sdk-for-ruby/v3/api/Aws/DatabaseMigrationService/Types/ReplicationTask.html
    def self.production_replication_tasks
      dms_client = Aws::DatabaseMigrationService::Client.new
      replication_tasks = dms_client.describe_replication_tasks({without_settings: true}).replication_tasks
      replication_tasks.select do |task|
        dms_client.
          list_tags_for_resource({resource_arn: task.replication_task_arn}).
          tag_list.
          any? {|tag| tag.key == 'environment' && tag.value == 'production'}
      end
    end
  end
end
