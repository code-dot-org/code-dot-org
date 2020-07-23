#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'
require 'cdo/properties'
require 'csv'

# Import level concept difficulty tags from a gsheet (downloaded as a series of
# CSVs). When we cloned the CSF courses from 2017 to 2018 and 2018 to 2019, the LCDs did not get
# cloned with them so we're doing a mass import.

VALID_HEADERS = %i(
  script
  stage
  position
  level_name
  type
).concat(LevelConceptDifficulty::CONCEPTS.map(&:to_sym))

def main(csv_dir)
  %w(CourseA CourseB CourseC CourseD CourseE CourseF PreExpress Express).each do |course|
    CSV.foreach("#{csv_dir}/#{course}.csv", headers: true,  header_converters: :symbol) do |row|
      row.to_hash.each do |key, _val|
        if VALID_HEADERS.exclude?(key)
          puts "Warning: Invalid header '#{key}' found. Continuing..."
        end
      end

      level = Level.find_by(name: row.fetch(:level_name))
      unless level
        puts "cannot find #{row.fetch(:level_name)}"
        next
      end

      concept_difficulties = row.to_hash.compact.delete_if do |key, _val|
        LevelConceptDifficulty::CONCEPTS.exclude?(key.to_s)
      end

      lcd = LevelConceptDifficulty.find_or_create_by(level: level)

      if concept_difficulties.any? {|key, value| lcd[key] != value}
        lcd.update!(concept_difficulties)
        file_path = Level.level_file_path(level.name)
        File.write(file_path, level.to_xml)
      end
    end
  end
end

main(ARGV[0])
