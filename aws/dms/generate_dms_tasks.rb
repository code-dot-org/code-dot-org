#!/usr/bin/env ruby
# Manually run this script to generate production DMS task configurations
# from the source tasks.yml.erb file.

ENV['RACK_ENV'] = 'production'
require_relative '../../deployment'

tasks = YAML.load_file('tasks.yml')
tasks.each do |task_name, task|
  rules = []
  remove_rules = []

  schemas = task.map do |schema|
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
    # rubocop:disable Style/Next
    if properties && (columns = properties['remove_column'])
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

    schema
  end

  # Migrate `-pii` tasks to alternative schema using transformation rule.
  if task_name.end_with? '-pii'
    schemas.uniq.each do |schema|
      rules << {
        'rule-type': 'transformation',
        'rule-action': 'rename',
        'rule-target': 'schema',
        'object-locator': {'schema-name': schema},
        'value': "#{schema}_pii"
      }
    end
  end

  # Add auto-increment rule-name and rule-id keys in specific order.
  rules = rules.concat(remove_rules).map.with_index do |rule, index|
    rule.to_a.
      insert(1, ['rule-name', (index + 1).to_s]).
      insert(1, ['rule-id', (index + 1).to_s]).
      to_h
  end

  filename = File.join __dir__, "#{task_name}.json"
  File.write filename, JSON.pretty_generate(rules: rules)
end
