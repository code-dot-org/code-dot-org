# Transform CloudFront access logs from CSV to JSON.
# Use RealtimeLogConfig to determine CSV column headers,
# and Glue-table schema to determine column formats.

require 'base64'
require 'csv'
require 'json'
require 'aws-sdk-glue'
require 'aws-sdk-cloudfront'

DATABASE = ENV['DATABASE']
TABLE = ENV['TABLE']
CONFIG_ARN = ENV['CONFIG_ARN']

CLOUDFRONT = Aws::CloudFront::Client.new

LOG_FIELDS = ENV['LOG_FIELDS']&.split(',')
$log_fields = LOG_FIELDS || []

GLUE = Aws::Glue::Client.new
COLUMNS = GLUE.get_table(database_name: DATABASE, name: TABLE).
  table.storage_descriptor.columns.map {|c| [c.name, c.type]}.to_h

CONVERTERS = [
  ->(field, info) {COLUMNS[info.header] == 'int' ? field.to_i : field},
  ->(field, info) {COLUMNS[info.header] == 'float' ? field.to_f : field}
]

def handler(event:, context:)
  {
    records: event['records'].map do |record|
      data = Base64.decode64(record['data'])

      tries = 0
      output = begin
                 CSV.parse_line(data, col_sep: "\t", headers: $log_fields, converters: CONVERTERS).tap do |out|
                   raise ArgumentError, "Record data doesn't match log fields" if out.headers[-1].nil? || out[-1].nil?
                 end
               rescue ArgumentError
                 raise if (tries += 1) > 1
                 # Try again after updating fields from the realtime log config.
                 $log_fields = CLOUDFRONT.get_realtime_log_config(arn: CONFIG_ARN).realtime_log_config.fields
                 retry
               end
      {
        recordId: record['recordId'],
        result: 'Ok',
        data: Base64.encode64(output.to_h.to_json)
      }
    rescue => e
      puts "Error: #{e.full_message}"
      {
        recordId: record['recordId'],
        result: 'ProcessingFailed',
        data: Base64.encode64({error: e.full_message}.to_json)
      }
    end
  }
end
