#!/usr/bin/env ruby

require_relative '../../../../dashboard/config/environment'
require 'optparse'

CDO.log = Logger.new(STDERR)

filename = nil

OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on('-f', '--filename FILENAME', 'File containing the data to upload') do |f|
    filename = f
  end
  opts.on('-h', '--help', 'Prints this help') do
    puts opts
    exit
  end
end.parse!

raise OptionParser::MissingArgument.new(missing_args.join(', ')) unless filename.nil?

bucket_name = Census::IbSchoolCode::CENSUS_BUCKET_NAME
object_key = Census::IbSchoolCode::CSV_OBJECT_KEY
backup_object_key = "#{object_key}.backup.#{DateTime.now.strftime('%Y-%m-%d-%H-%M-%S')}"

begin
  AWS::S3.process_file(bucket_name, object_key) do |file_name|
    CDO.log.info "Backing up '#{object_key}' to '#{backup_object_key}' in '#{bucket_name}' bucket in S3"
    AWS::S3.upload_to_bucket(
      bucket_name,
      backup_object_key,
      open(file_name),
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
