#!/usr/bin/env ruby
require_relative('../config/environment')
require 'cdo/properties'
require 'json'

LEVEL_TYPES_WITH_ILS = %w(Craft Studio Karel Eval Maze Calc Blockly StudioEC Artist).freeze

# Converts levels that have ideal level sources to JSON-defined level
# tests similar to those used in apps tests.
#
# Prints the JSON to the command line; redirect output to a file to save
# it

def main
  levels_to_test = Level.
      where('type in (?)', LEVEL_TYPES_WITH_ILS).
      where('ideal_level_source_id is not null').
      all.reject {|level| level.try(:free_play) || !level.is_a?(Blockly) || !level.custom?}

  level_hashes = levels_to_test.map do |level|
    level_hash = {
      levelDefinition: level.blockly_level_options,
      tests: [{
        description: "Validate Solution for: #{level.name} (#{level.id})",
        expected: {
          result: true,
          testResult: 100
        },
        xml: level.ideal_level_source.data
      }]
    }

    if level.type == "Artist"
      level_hash[:app] = "turtle"
    elsif level.type == "Karel"
      level_hash[:app] = "maze"
      level_hash[:skinId] = level_hash[:levelDefinition]['skin']
    else
      level_hash[:app] = level.type.downcase
    end

    level_hash
  end

  puts(JSON.pretty_generate({levels: level_hashes}))
end

main
