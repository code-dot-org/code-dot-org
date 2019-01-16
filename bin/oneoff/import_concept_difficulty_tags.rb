#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'
require 'cdo/properties'
require 'csv'

# Import level concept difficulty tags from a gsheet (downloaded as a series of
# CSVs). When we cloned the CSF courses from 2017 to 2018, the LCDs did not get
# cloned with them so we're doing a mass import.

# The given CSV contained headers that didn't map exactly to our defined LCDs,
# so we perform a simple mapping in code
HEADERS_TO_CONCEPTS = {
  sequence_algorithms: ConceptDifficulties::SEQUENCING,
  repeat: ConceptDifficulties::REPEAT_LOOPS,
  functions_wparams: ConceptDifficulties::FUNCTIONS_WITH_PARAMS
}

def main(csv_dir)
  %w(CourseA CourseB CourseC CourseD CourseE CourseF).each do |course|
    CSV.foreach("#{csv_dir}/#{course}.csv", headers: true,  header_converters: :symbol) do |row|
      concept_difficulties = Hash[row.to_hash.compact.map do |key, val|
        [HEADERS_TO_CONCEPTS.fetch(key, key.to_s), val]
      end].delete_if do |key, _val|
        !LevelConceptDifficulty::CONCEPTS.include?(key)
      end

      level = Level.find_by(name: row.fetch(:level_name))
      unless level
        puts "cannot find #{row.fetch(:level_name)}"
        next
      end

      lcd = LevelConceptDifficulty.find_or_create_by(level: level)

      if concept_difficulties.any? {|key, value| lcd[key] != value}
        lcd.update!(concept_difficulties)
        level.write_custom_level_file
      end
    end
  end
end

main(ARGV[0])
