#!/usr/bin/env ruby

require 'csv'
require 'optparse'
require_relative '../../dashboard/config/environment'
require_relative '../../dashboard/shared_constants'  # Make sure to include shared_constants.rb

# Define a helper function to map the execution_status codes to human-readable text
def human_readable_execution_status(status_code)
  # Reference the AI_REQUEST_EXECUTION_STATUS directly from SharedConstants
  status_mapping = SharedConstants::AI_REQUEST_EXECUTION_STATUS.invert
  status_mapping[status_code] || "UNKNOWN_STATUS"
end

def main
  # Parse command-line arguments
  options = {}
  OptionParser.new do |opts|
    opts.banner = "Usage: ai_chat_profanity_logs_to_csv.rb [options]"

    opts.on("--all", "Export all rows") do
      options[:all] = true
      options[:output_label] = "all"
    end

    opts.on("--errors", "Export rows where execution_status is over 1000 (errors)") do
      options[:errors] = true
      options[:output_label] = "errors"
    end

    opts.on("--profanity", "Export rows related to profanity (user or model)") do
      options[:profanity] = true
      options[:output_label] = "profanity"
    end

    opts.on("--pii", "Export rows related to PII (user or model)") do
      options[:pii] = true
      options[:output_label] = "pii"
    end

    opts.on("--input_too_large", "Export rows where user input was too large") do
      options[:input_too_large] = true
      options[:output_label] = "input_too_large"
    end
  end.parse!

  # Check if any option was selected, otherwise exit with a message
  unless options[:all] || options[:errors] || options[:profanity] || options[:pii] || options[:input_too_large]
    puts "Please specify one of the options: --all, --errors, --profanity, --pii, or --input_too_large."
    exit
  end

  # Set the current date and time for the file name, and include the selected option
  current_date_time = Time.now.strftime('%Y-%m-%d_%H-%M')
  selected_option = options[:output_label]
  csv_file_path = "aichat_#{selected_option}_logs_#{current_date_time}.csv"

  # Fetch records based on user selection
  if options[:all]
    # Fetch all records
    aichat_requests = AichatRequest.all
  elsif options[:errors]
    # Fetch records where execution_status is over 1000 (errors)
    aichat_requests = AichatRequest.where("execution_status > ?", 1000)
  elsif options[:profanity]
    # Fetch records related to profanity (user or model)
    aichat_requests = AichatRequest.where(execution_status: [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PROFANITY]])
  elsif options[:pii]
    # Fetch records related to PII (user or model)
    aichat_requests = AichatRequest.where(execution_status: [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PII], SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PII]])
  elsif options[:input_too_large]
    # Fetch records where user input was too large
    aichat_requests = AichatRequest.where(execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_INPUT_TOO_LARGE])
  end

  # Open or create a CSV file and write the records to it
  CSV.open(csv_file_path, "w") do |csv|
    # Write the headers (column names)
    csv << AichatRequest.column_names.map {|column| column == 'execution_status' ? 'execution_status (human-readable)' : column}

    # Iterate through each record and write the values to the CSV
    aichat_requests.each do |request|
      # Convert the execution_status code to human-readable text
      human_readable_status = human_readable_execution_status(request.execution_status)
      csv << request.attributes.values.map.with_index do |value, index|
        # Replace execution_status with the human-readable version
        AichatRequest.column_names[index] == 'execution_status' ? human_readable_status : value
      end
    end
  end

  puts "CSV export complete! File saved to #{csv_file_path}"
end

main
