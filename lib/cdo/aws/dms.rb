require_relative '../../../deployment'

module Cdo
  class DMS
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
              'value': '_import_'
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
  end
end
