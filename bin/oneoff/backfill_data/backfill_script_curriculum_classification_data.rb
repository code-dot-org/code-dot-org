#!/usr/bin/env ruby

# As part of requirements captured at https://docs.google.com/document/d/1u4kFMpiktoTv7reTBXgWjW0MXbKH3V3stO9s7PWS4ss/edit#heading=h.qi8xxyq72bct
# two new fields were introduced (in addition to the existing curriculum_umbrella field)
# to bring about more granular categorization of curriculum units. This script would
# backfill existing units with values for these new fields based on a csv input provided
# by curriculum team.

require_relative '../../../dashboard/config/environment'
require_relative '../../../lib/cdo/shared_constants/curriculum/shared_course_constants'

$valid_curriculum_umbrella = Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.to_h.values
$valid_content_area = Curriculum::SharedCourseConstants::CURRICULUM_CONTENT_AREA.to_h.keys.map(&:to_s)
$valid_topic_tags = Curriculum::SharedCourseConstants::CURRICULUM_TOPIC_TAGS.to_h.keys.map(&:to_s)

# Take link to CSV file as input
def backfill_script_data_categories(file_path, actual_execution)
  raise unless Rails.application.config.levelbuilder_mode

  puts "Reading csv from #{file_path}"
  scripts_to_update = CSV.foreach(file_path, headers: true).map do |row|
    [row["Script Name"],
     {
       new_initiative: row["New Initiative"],
      new_content_area: row["Content Area"],
      new_topic_tags: row["Tags"]&.split(",")&.map(&:strip)&.reject(&:blank?)
     }]
  end.to_h

  # iterate over each script to be updated
  scripts_to_update.each do |script_name, new_values|
    script = Unit.find_by_name(script_name)
    if script.nil?
      warn "Unable to find script with name #{script_name}"
      next
    end

    initiative_val = new_values[:new_initiative]
    content_area_val = new_values[:new_content_area]
    topic_tags_val = new_values[:new_topic_tags]

    if (!initiative_val.nil? && !$valid_curriculum_umbrella.include?(initiative_val)) ||
        (!content_area_val.nil? && !$valid_content_area.include?(content_area_val)) ||
        (!topic_tags_val.nil? && !(topic_tags_val - $valid_topic_tags).empty?)
      puts "Updates for #{script_name} does not include a valid value for one of the three fields."
      next
    end

    unless actual_execution
      puts "Updates for #{script_name} = [#{initiative_val}] [#{content_area_val}] [#{topic_tags_val}]"
      next
    end

    script.curriculum_umbrella = initiative_val unless initiative_val.nil?
    script.content_area = content_area_val unless content_area_val.nil?
    script.topic_tags = topic_tags_val unless topic_tags_val.nil?

    begin
      script.save!
    rescue Exception => exception
      warn "Skipping #{script.id} - #{script.name} because of error:"
      warn exception.message
      next
    end

    # Update its script_json
    script.write_script_json
  end
end

if ARGV.empty? || ARGV.length >2
  warn "Usage: backfill_script_curriculum_classification_data.rb <path_to_csv_with_data> -for-real"
  return
end

backfill_script_data_categories(ARGV[0], ARGV.length == 2 && ARGV[1] == "-for-real")
