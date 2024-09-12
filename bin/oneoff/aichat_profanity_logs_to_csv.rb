#!/usr/bin/env ruby

require 'csv'
require_relative '../../dashboard/config/environment'

def main
  current_date_time = Time.now.strftime('%Y-%m-%d_%H-%M')
  csv_file_path = "aichat_rejected_logs_#{current_date_time}.csv"

  # Fetch all records from the aichat_requests table that didn't pass the filter
  aichat_requests = AichatRequest.where.not(execution_status: 200)

  # Open or create a CSV file and write the records to it
  CSV.open(csv_file_path, "w") do |csv|
    # Write the headers (column names)
    csv << AichatRequest.column_names

    # Iterate through each record and write the values to the CSV
    aichat_requests.each do |request|
      csv << request.attributes.values
    end
  end

  puts "CSV export complete! File saved to #{csv_file_path}"
end

main
