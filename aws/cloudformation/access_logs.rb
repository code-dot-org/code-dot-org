# Transform CloudFront access logs from CSV to JSON.
# Use Glue-table schema to determine CSV column headers and format.

require 'base64'
require 'csv'
require 'json'
require 'aws-sdk-glue'

DATABASE = ENV['DATABASE']
TABLE = ENV['TABLE']

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
      output_data = CSV.parse_line(data, col_sep: "\t", headers: COLUMNS.keys, converters: CONVERTERS).to_h.to_json
      {
        recordId: record['recordId'],
        result: 'Ok',
        data: Base64.encode64(output_data)
      }
    rescue => e
      {
        recordId: record['recordId'],
        result: 'ProcessingFailed',
        data: Base64.encode64({error: e.full_message}.to_json)
      }
    end
  }
end
