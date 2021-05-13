#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'

def main
  current_year = '2021'

  course_names = ['csd-' + current_year, 'csp-' + current_year]
  course_scripts = course_names.map {|name| UnitGroup.find_by(name: name)}.map(&:default_scripts).flatten

  script_names = ['coursea-' + current_year, 'courseb-' + current_year, 'coursec-' + current_year,
                  'coursed-' + current_year, 'coursee-' + current_year, 'coursef-' + current_year,
                  'pre-express-' + current_year, 'express-' + current_year,
                  'aiml-' + current_year]
  standalone_scripts = script_names.map {|name| Script.find_by(name: name)}

  scripts = standalone_scripts + course_scripts

  search_str = '/s/'

  scripts.each do |script|
    script.script_levels.each do |sl|
      next unless sl.level.long_instructions&.include?(search_str)
      puts sl.level.name
    end
  end
end

main
