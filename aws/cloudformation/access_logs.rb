# Transform CloudFront access logs from CSV to JSON.
# Use environment variables to determine CSV column headers,
# and Glue-table schema to determine column formats.

require 'base64'
require 'csv'
require 'json'
require 'aws-sdk-glue'

DATABASE = ENV['DATABASE']
TABLE = ENV['TABLE']

LOG_FIELDS = ENV['LOG_FIELDS']&.split(',')
OLD_LOG_FIELDS = ENV['OLD_LOG_FIELDS']&.split(',')

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

      fields = LOG_FIELDS
      output = begin
        CSV.parse_line(data, col_sep: "\t", headers: fields, converters: CONVERTERS).tap do |out|
          if out.headers[-1].nil? || out[-1].nil?
            raise ArgumentError, "Record data (#{data.count("\t") + 1}) doesn't match log fields (#{fields.length}"
          end
        end
      rescue ArgumentError
        # Try again using old log fields as CSV column headers.
        raise if fields == OLD_LOG_FIELDS
        fields = OLD_LOG_FIELDS
        retry
      end
      {
        recordId: record['recordId'],
        result: 'Ok',
        data: Base64.encode64(output.to_h.to_json)
      }
    rescue => exception
      puts "Error: #{exception.full_message}"
      {
        recordId: record['recordId'],
        result: 'ProcessingFailed',
        data: Base64.encode64({error: exception.full_message}.to_json)
      }
    end
  }
end
