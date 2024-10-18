#!/usr/bin/env ruby

# As part of requirements captured at https://docs.google.com/document/d/1u4kFMpiktoTv7reTBXgWjW0MXbKH3V3stO9s7PWS4ss/edit#heading=h.qi8xxyq72bct
# two new fields were introduced (in addition to the existing curriculum_umbrella field)
# to bring about more granular categorization of curriculum units. This script would
# backfill existing units with values for these new fields based on a csv input provided
# by curriculum team.

require_relative '../../../dashboard/config/environment'

# Take link to CSV file as input
def backfill_script_data_categories(file_path)
  raise unless Rails.application.config.levelbuilder_mode

  puts "Reading csv from #{file_path}"
  scripts_to_update = CSV.foreach(file_path, headers: true).map do |row|
    [row["Script name"],
     {
       new_initiative: row["Initative"],
      new_content_area: row["Content area"],
      new_topic_tags: row["Topic tags"]&.split(",")&.map(&:strip)&.reject(&:blank?)
     }]
  end.to_h

  # iterate over each script to be updated
  scripts_to_update.each do |script_name, new_values|
    script = Unit.find_by_name(script_name)
    if script.nil?
      warn "Unable to find script with name #{script_name}"
      next
    end

    puts "Updating script #{script_name}, #{script.id}"
    # script.curriculum_umbrella = new_values[:new_initiative] unless new_values[:new_initiative].to_s.empty?
    # script.content_area = new_values[:new_content_area] unless new_values[:new_content_area].to_s.empty?
    # script.topic_tags = new_values[:new_topic_tags] unless new_values[:new_topic_tags].to_s.empty?

    puts "new initiative #{new_values[:new_initiative]}" unless new_values[:new_initiative].to_s.empty?
    puts "new content area #{new_values[:new_content_area]}" unless new_values[:new_content_area].to_s.empty?
    puts "new topic tags #{new_values[:new_topic_tags]}" unless new_values[:new_topic_tags].to_s.empty?

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

if ARGV.length != 1
  warn "Usage: backfill_script_curriculum_classification_data.rb <path_to_csv_with_data>"
  return
end
backfill_script_data_categories ARGV[0]
