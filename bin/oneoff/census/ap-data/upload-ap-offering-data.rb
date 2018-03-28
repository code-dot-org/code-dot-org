#!/usr/bin/env ruby

require_relative '../../../../dashboard/config/environment'
require 'optparse'

CDO.log = Logger.new(STDERR)

ap_courses = Census::ApCsOffering::COURSES.values

options = {
  filename: nil,
  course: nil,
  school_year: nil,
}
OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on('-f', '--filename FILENAME', 'File containing the data to upload') do |f|
    options[:filename] = f
  end
  opts.on('-c', '--course AP_COURSE_NAME', ap_courses.join(' or ')) do |c|
    options[:course] = c
  end
  opts.on('-y', '--school_year YEAR', 'The school year for the data. This should be the calendar year in which the school year began (e.g., 2017 for the 2017-2018 school year)') do |y|
    options[:school_year] = y
  end
  opts.on('-h', '--help', 'Prints this help') do
    puts opts
    exit
  end
end.parse!

missing_args = [:filename, :course, :school_year].select {|arg| options[arg].nil?}
raise OptionParser::MissingArgument.new(missing_args.join(', ')) unless missing_args.empty?
raise OptionParser::InvalidOption.new("Course must be one of #{ap_courses.join(' or ')}") unless ap_courses.include? options[:course]
raise OptionParser::InvalidOption.new("School year must be four digits") unless options[:school_year] =~ /^\d{4}$/

bucket_name = Census::ApCsOffering::CENSUS_BUCKET_NAME
object_key = Census::ApCsOffering.construct_object_key(options[:course], options[:school_year].to_i)
backup_object_key = "#{object_key}.backup.#{DateTime.now.strftime('%Y-%m-%d-%H-%M-%S')}"

begin
  AWS::S3.process_file(bucket_name, object_key) do |filename|
    CDO.log.info "Backing up '#{object_key}' to '#{backup_object_key}' in '#{bucket_name}' bucket in S3"
    AWS::S3.upload_to_bucket(
      bucket_name,
      backup_object_key,
      open(filename),
      no_random: true
    )
  end
rescue Aws::S3::Errors::NoSuchKey
  CDO.log.info "'#{object_key}' not found in S3 - skipping backup."
end

CDO.log.info "Uploading '#{options[:filename]}' to '#{bucket_name}' bucket in S3 with object key '#{object_key}'"

AWS::S3.upload_to_bucket(
  bucket_name,
  object_key,
  open(options[:filename]),
  no_random: true
)
