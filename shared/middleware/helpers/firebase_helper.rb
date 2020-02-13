require 'csv'
require 'firebase'

# A wrapper around the firebase gem. For gem documentation, see
# https://github.com/oscardelben/firebase-ruby.
class FirebaseHelper
  def initialize(channel_id)
    raise "channel_id must be non-empty" if channel_id.nil? || channel_id.empty?
    @firebase = channel_id == 'shared' ? FirebaseHelper.create_shared_client : FirebaseHelper.create_client
    @channel_id = channel_id + CDO.firebase_channel_id_suffix
  end

  # @param [String] table_name The name of the table to query.
  # @return [String] A representation of the table (its columns and its data) as a CSV string.
  def table_as_csv(table_name)
    response = @firebase.get(
      "/v3/channels/#{@channel_id}/storage/tables/#{table_name}/records"
    )
    records = response.body || []

    # The firebase response could be a Hash or a sparse Array
    records = records.values if records.is_a? Hash
    records.compact!

    records.map! {|record| JSON.parse(record)}
    table_to_csv(records, column_order: ['id'])
  end

  def number?(num)
    !Float(num).nil? rescue false
  end

  def csv_as_table(csv_data)
    records = {}
    id = 1
    table = CSV.parse(csv_data, headers: true)
    table.each do |row|
      record = OpenStruct.new
      record.id = id
      table.headers.each do |col|
        value = (number? row[col]) ? row[col].to_f : row[col]
        record[col] = value
      end
      records[id] = record.to_h.to_json
      id += 1
    end
    return records, table.headers.unshift('id')
  end

  def delete_shared_table(table_name)
    response = @firebase.delete("/v3/channels/shared/counters/tables/#{table_name}")
    return response unless response.success?
    response = @firebase.delete("/v3/channels/shared/storage/tables/#{table_name}/records")
    return response unless response.success?
    response = @firebase.delete("/v3/channels/shared/metadata/tables/#{table_name}/columns")
    return response
  end

  def upload_shared_table(table_name, records, columns)
    response = @firebase.set("/v3/channels/shared/counters/tables/#{table_name}", {"lastId": records.length, "rowCount": records.length})
    return response unless response.success?
    response = @firebase.set("/v3/channels/shared/storage/tables/#{table_name}/records", records)
    return response unless response.success?
    response = @firebase.delete("/v3/channels/shared/metadata/tables/#{table_name}/columns")
    return response unless response.success?
    columns.each do |column|
      response = @firebase.push("v3/channels/shared/metadata/tables/#{table_name}/columns", {columnName: column})
    end
    return response
  end

  def get_shared_table(table_name)
    columns_response = @firebase.get("/v3/channels/shared/metadata/tables/#{table_name}/columns")
    columns = columns_response.body ? columns_response.body.map {|_, value| value['columnName']} : []

    records_response = @firebase.get("/v3/channels/shared/storage/tables/#{table_name}/records")
    records = records_response.body || []

    {columns: columns, records: records}
  end

  def get_shared_table_list
    response = @firebase.get("/v3/channels/shared/counters/tables")
    response.body
  end

  def get_library_manifest
    response = @firebase.get("v3/channels/shared/metadata/manifest")
    response.body
  end

  def self.delete_channel(encrypted_channel_id)
    raise "channel_id must be non-empty" if encrypted_channel_id.nil? || encrypted_channel_id.empty?
    create_client.delete "/v3/channels/#{encrypted_channel_id}/"
  end

  def self.create_shared_client
    raise "CDO.firebase_shared_secret not defined" unless CDO.firebase_shared_secret
    Firebase::Client.new \
      'https://cdo-v3-shared.firebaseio.com/',
      CDO.firebase_shared_secret
  end

  def self.create_client
    raise "CDO.firebase_name not defined" unless CDO.firebase_name
    raise "CDO.firebase_secret not defined" unless CDO.firebase_secret
    Firebase::Client.new \
      "https://#{CDO.firebase_name}.firebaseio.com/",
      CDO.firebase_secret
  end
end
