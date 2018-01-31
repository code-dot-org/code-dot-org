#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'
require_relative '../../lib/cdo/only_one'
require 'cdo/aws/s3'
require 'csv'

def main
  applications = Pd::Application::Teacher1819Application
    .left_outer_joins(:regional_partner)
    .pluck(:course, :name, :locked_at, :status)

  output = CSV.generate(col_sep: "\t") do |csv|
    csv << %w(course name locked_at status)
    applications.each {|row| csv << row}
  end

  AWS::S3.upload_to_bucket('cdo-data-sharing-internal', 'pd_applications.tsv', output, no_random: true)
end

main if only_one_running?(__FILE__)
