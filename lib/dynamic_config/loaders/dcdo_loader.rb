# A script to update DCDO settings from a yaml file in
# the following format.
#
# Here's how a typical DCDO setting would be defined:
#
# <name>: <value>
#
# where name is a string and value can be anything
# that is jsonable

require 'yaml'
require 'oj'

module DCDOLoader
  # Validates that setting has the right format
  # @param key [String]
  # @param value [Object]
  def self.validate_setting(key, value)
    raise ArgumentError, "keys must be a string" unless key.is_a? String
    if value.is_a?(Array) && value[0].is_a?(Hash) && value[0].key?("rule")
      raise "Did you accidentally apply a gatekeeper config to dcdo?"
    end
    Oj.dump(value, :mode => :strict)
  end

  # Takes in a yaml string and converts it to a list of
  # k,v pairs to be sent to DCDO.set
  # @param yaml [String]
  def self.yaml_to_commands(yaml)
    yaml = YAML.load(yaml)
    raise ArgumentError, "yaml should be a hash" unless yaml.is_a? Hash
    commands = []

    yaml.each do |k, v|
      self.validate_setting(k, v)
      commands << [k, v]
    end
    commands
  end

  # Applies the given commands to DCDO
  # @param commands [Array]
  def self.apply_commands(commands)
    commands.each do |k, v|
      DCDO.set(k, v)
    end
  end

  # Load yaml file into DCDO
  # @param filepath [String]
  def self.load(filepath)
    yaml = File.open(filepath, 'r').read
    commands = self.yaml_to_commands(yaml)
    self.apply_commands(commands)
  end
end
