#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'

def main
  year_to_copy_to = '2020'

  script_names = ['coursea-' + year_to_copy_to, 'courseb-' + year_to_copy_to, 'coursec-' + year_to_copy_to,
                  'coursed-' + year_to_copy_to, 'coursee-' + year_to_copy_to, 'coursef-' + year_to_copy_to,
                  'pre-express-' + year_to_copy_to, 'express-' + year_to_copy_to]
  csf_scripts = script_names.map {|name| Script.find_by(name: name)}

  csf_scripts.each do |script|
    script.script_levels.each do |sl|
      puts "Level: " + sl.level.name
      next if sl.level.level_concept_difficulty
      copy_lcd_from_parent(sl)
    end
  end
end

def copy_lcd_from_parent(sl)
  parent_level = Level.find_by(id: sl.level.parent_level_id)
  next unless parent_level
  puts "Parent Level: " + parent_level.name
  #make a new level_concept_difficulty that is same as parent_levels
  new_lcd = parent_level.level_concept_difficulty.dup
  # Assign it to the level
  sl.level.level_concept_difficulty = new_lcd
  sl.level.save! if sl.level.changed?
end

main
