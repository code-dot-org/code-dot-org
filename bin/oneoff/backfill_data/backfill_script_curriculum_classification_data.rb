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
def backfill_script_data_categories(file_path, whatif_mode)
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

    if !$valid_curriculum_umbrella.include?(new_values[:new_initiative]) ||
        !$valid_content_area.include?(new_values[:content_area]) ||
        !$valid_topic_tags.include?(new_values[:topic_tags])
      puts "Updates for #{script_name} does not include a valid value for one of the three fields. #{$valid_curriculum_umbrella.inspect} #{$valid_content_area.inspect}"
      next
    end

    puts "new initiative #{new_values[:new_initiative]}" unless new_values[:new_initiative].to_s.empty?
    puts "new content area #{new_values[:new_content_area]}" unless new_values[:new_content_area].to_s.empty?
    puts "new topic tags #{new_values[:new_topic_tags]}" unless new_values[:new_topic_tags].to_s.empty?

    next if whatif_mode

    # script.curriculum_umbrella = new_values[:new_initiative] unless new_values[:new_initiative].to_s.empty?
    # script.content_area = new_values[:new_content_area] unless new_values[:new_content_area].to_s.empty?
    # script.topic_tags = new_values[:new_topic_tags] unless new_values[:new_topic_tags].to_s.empty?

    begin
      puts "Saving script with updated values"
      # script.save!
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
  warn "Usage: backfill_script_curriculum_classification_data.rb <path_to_csv_with_data> -whatif"
  return
end

backfill_script_data_categories(ARGV[0], ARGV.length == 2 && ARGV[2] == "-whatif")
