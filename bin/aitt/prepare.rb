#!/usr/bin/env ruby

require 'csv'
require 'json'
require 'httparty'
require 'fileutils'

# Goal: Convert the TSV to an appropriate CSV for 'expected_grades.csv'

if ARGV.length < 2
  echo "Usage: ./prepare.rb google_sheet.tsv expected_grades.csv"
  echo ""
  echo "Ensure google_sheet.tsv is tab separated... you can copy and paste"
  echo "from the sheet."
  echo ""
  echo "It will remove columns that are empty. It expects the project link url"
  echo "in the first column. That header will always be called 'student'."
  echo ""
  echo "The rest of the headers for the resulting CSV will be copied from the"
  echo "provided google sheet data."
  echo ""
  echo "This will download the appropriate sources into the `./sources` path."
  echo ""
  exit 1
end

# We want to generate a CSV of expected grades from the google sheet
tokens = []
csv_data = CSV.generate do |csv|
  headers = ['student']
  headers_added = false
  CSV.foreach(ARGV[0], headers: true, col_sep: "\t") do |row|
    # Get the student project link
    project_link = row.first.last

    # Get the project id
    project_link = project_link.match(/\/([^\/]+)\/view/)[1]
    tokens << project_link
    new_row = [project_link]

    row.drop(1).each do |tuple|
      header = tuple.first
      score = tuple.last
      next if score == "" || score.nil?
      headers << header unless headers_added
      new_row << score
    end

    csv << headers unless headers_added
    headers_added = true

    csv << new_row
  end
end

output_file = ARGV[1]
puts "[GEN] #{output_file}"

File.write(output_file, csv_data, mode: "w+")

# Ensure 'sources' path exists
FileUtils.mkdir_p('sources')

# Download source data, if we need to
REMOTE_URL = ENV['REMOTE_URL'] || 'https://studio.code.org'
tokens.each do |channel|
  source_url = "#{REMOTE_URL}/v3/sources/#{channel}/main.json"
  if File.exist?("sources/#{channel}.js")
    puts "[GET] #{source_url} (EXISTS)"
    next
  end

  puts "[GET] #{source_url}"
  response = HTTParty.get(source_url, timeout: 120)
  metadata = JSON.parse(response.body)
  File.write("sources/#{channel}.js", metadata["source"], mode: "w+")
end
