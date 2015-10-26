# A script to update the Gatekeeper settings

require 'yaml'
require 'dynamic_config/gatekeeper'

module GatekeeperLoader
  # Validates that a rule has the correct format
  #
  # @param feature [String] name of the feature
  # @param rule [Hash]
  def self.validate_rule(feature, rule)
    raise ArgumentError, "In #{feature}, rule description is required." unless rule.key? 'rule'
    raise ArgumentError, "In #{feature}, value is required" unless rule.key? 'value'
    raise ArgumentError, "In #{feature}, value must be a boolean" unless rule['value'] == !!rule['value']

    if rule.key? 'where'
      where = rule['where']
      raise ArgumentError, "In #{feature}, where must be a hash" unless where.is_a? Hash
    end
  end

  # Takes in a yaml string a and converts it to a list
  # of commands to be sent to Gatekeeper.set
  def self.yaml_to_commands(yaml_str)
    obj = YAML.load(yaml_str)
    commands = []

    raise ArgumentError, "Invalid yaml format, must be a hash" unless obj.is_a? Hash

    obj.each do |feature, rules|
      rules.each do |rule|
        self.validate_rule(feature, rule)
        commands << {
          feature: feature,
          where: rule['where'] || {},
          value: rule['value']
        }
      end
    end
    commands
  end

  # Takes a list of commands and applies them to the gatekeeper config
  # @param commands [Array] a list of commands
  def self.apply_commands(commands)
    commands.each do |command|
      Gatekeeper.set(
        command[:feature],
        where: command[:where],
        value: command[:value]
      )
    end
  end

  # Load yaml file into gatekeeper
  # @param filepath [String]
  def self.load(filepath)
    yaml = File.open(filepath, 'r').read()
    commands = self.yaml_to_commands(yaml)
    self.apply_commands(commands)
  end
end
