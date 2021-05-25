# Note: parent_level_id are specific to the environment the level was copied in
# Since the majority of copying happens on levelbuilder this script should be
# run on the levelbuilder environment.

#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'

def main(year_to_copy_to)
  script_names = ['coursea-' + year_to_copy_to, 'courseb-' + year_to_copy_to, 'coursec-' + year_to_copy_to,
                  'coursed-' + year_to_copy_to, 'coursee-' + year_to_copy_to, 'coursef-' + year_to_copy_to,
                  'pre-express-' + year_to_copy_to, 'express-' + year_to_copy_to]
  csf_scripts = script_names.map {|name| Script.find_by(name: name)}

  csf_scripts.each do |script|
    script.script_levels.each do |sl|
      puts "Level: " + sl.level.name
      next if sl.level.level_concept_difficulty
      copy_lcd_from_parent(sl.level)

      # Write changes to file
      file_path = Level.level_file_path(sl.level.name)
      File.write(file_path, sl.level.to_xml)
    end
  end
end

def copy_lcd_from_parent(level)
  parent_level = Level.find_by(id: level.parent_level_id)
  return unless parent_level
  puts "Parent Level: " + parent_level.name
  #make a new level_concept_difficulty that is same as parent_levels
  new_lcd = parent_level.level_concept_difficulty.dup
  # Assign it to the level
  level.level_concept_difficulty = new_lcd
  level.save! if level.changed?
end

main('2020')
main('2021')
