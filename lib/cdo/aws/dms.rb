require_relative '../../../deployment'

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
  end
end
