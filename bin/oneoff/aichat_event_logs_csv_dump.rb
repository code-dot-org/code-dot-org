#!/usr/bin/env ruby

require 'csv'
require 'optparse'
require 'date'
require_relative '../../dashboard/config/environment'  # Load the Rails environment

def dump_aichat_events_to_csv(options)
  # Set the current date and time for the file name
  current_date_time = Time.now.strftime('%Y-%m-%d_%H-%M')
  csv_file_path = if options[:specific_date]
                    "aichat_events_dump_#{options[:specific_date]}_#{current_date_time}.csv"
                  else
                    "aichat_events_dump_all_#{current_date_time}.csv"
                  end

  # Fetch records based on user selection (all records or records on a specific date)
  if options[:specific_date]
    # Fetch records where the created_at date matches the specific date
    begin
      parsed_date = Date.parse(options[:specific_date])
      aichat_events = AichatEvent.where(created_at: parsed_date.all_day)
    rescue ArgumentError
      puts "Invalid date format. Please provide the date in YYYY-MM-DD format."
      return
    end
  else
    # Fetch all records
    aichat_events = AichatEvent.all
  end

  # Open or create a CSV file and write the records to it
  CSV.open(csv_file_path, "w") do |csv|
    # Write the headers (column names)
    csv << AichatEvent.column_names

    # Iterate through each record and write the values to the CSV
    aichat_events.each do |event|
      csv << event.attributes.values
    end
  end

  puts "CSV dump complete! File saved to #{csv_file_path}"
end

def main
  options = {}

  # Parse command-line arguments
  OptionParser.new do |opts|
    opts.banner = "Usage: aichat_events_dump_to_csv.rb [options]"

    opts.on("--all", "Dump all records") do
      options[:all] = true
    end

    opts.on("--date DATE", "Dump records for a specific date (format: YYYY-MM-DD)") do |date|
      options[:specific_date] = date
    end
  end.parse!

  # Ensure the user provided either --all or --date
  if options[:all]
    dump_aichat_events_to_csv(options)
  elsif options[:specific_date]
    dump_aichat_events_to_csv(options)
  else
    puts "Please specify either --all or --date to dump records."
  end
end

# Execute the script
main
