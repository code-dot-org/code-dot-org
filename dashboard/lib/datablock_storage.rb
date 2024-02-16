require 'csv'
require 'firebase'
require 'time'
require 'uri'

module DatablockStorage
  # @param [String] table_name The name of the table to query.
  # @return [String] A representation of the table (its columns and its data) as a CSV string.
  def self.table_as_csv(channel_id, table_name)
    table = DatablockStorageTable.find_by(channel_id: channel_id, table_name: table_name)
    if table
      # We're in datablock storage
      records = table.read_records.map(&:record_json)
    else
      # TODO: post-firebase-cleanup
      response = firebase.get( # TODO: unfirebase
        "/v3/channels/#{@channel_id}/storage/tables/#{escape_table_name(table_name)}/records"
      )
      records = response.body || []

      # The firebase response could be a Hash or a sparse Array
      records = records.values if records.is_a? Hash
      records.compact!
      records.map! {|record| JSON.parse(record)}
    end

    table_to_csv(records, column_order: ['id'])
  end

  def self.number?(num)
    !Float(num).nil? rescue false
  end

  def self.csv_as_table(csv_data)
    records = {}
    id = 1
    table = CSV.parse(csv_data, headers: true)
    table.each do |row|
      record = {}
      record['id'] = id
      table.headers.each do |col|
        value = (number? row[col]) ? row[col].to_f : row[col]
        record[col] = value
      end
      records[id] = record.to_json
      id += 1
    end
    # add id as first column
    columns = table.headers.unshift('id')
    return records, columns
  end

  def self.escape_table_name(table_name)
    return ERB::Util.url_encode(table_name).gsub('.', '%252E')
  end

  def self.unescape_table_name(table_name)
    return table_name.gsub('%2E', '.')
  end

  def self.delete_shared_table(table_name)
    escaped_table_name = escape_table_name(table_name)
    response = firebase_shared.delete("/v3/channels/shared/counters/tables/#{escaped_table_name}") # TODO: unfirebase
    return response unless response.success?
    response = firebase_shared.delete("/v3/channels/shared/storage/tables/#{escaped_table_name}/records") # TODO: unfirebase
    return response unless response.success?
    firebase_shared.delete("/v3/channels/shared/metadata/tables/#{escaped_table_name}/columns") # TODO: unfirebase
  end

  def self.upload_shared_table(table_name, records, columns)
    escaped_table_name = escape_table_name(table_name)
    response = firebase_shared.set("/v3/channels/shared/counters/tables/#{escaped_table_name}", {lastId: records.length, rowCount: records.length}) # TODO: unfirebase
    return response unless response.success?
    response = firebase_shared.set("/v3/channels/shared/storage/tables/#{escaped_table_name}/records", records) # TODO: unfirebase
    return response unless response.success?
    response = firebase_shared.delete("/v3/channels/shared/metadata/tables/#{escaped_table_name}/columns") # TODO: unfirebase
    return response unless response.success?
    columns.each do |column|
      response = firebase_shared.push("v3/channels/shared/metadata/tables/#{escaped_table_name}/columns", {columnName: column}) # TODO: unfirebase
    end
    return response
  end

  def self.upload_live_table(table_name, records, columns)
    delete_shared_table(table_name)
    upload_shared_table(table_name, records, columns)
    response = firebase_shared.get("/v3/channels/shared/metadata/manifest/tables/") # TODO: unfirebase
    return response unless response.success?
    tables = response.body
    index = tables.find_index {|table| table['name'] == table_name}
    firebase_shared.set("/v3/channels/shared/metadata/manifest/tables/#{index}/lastUpdated", Time.now.to_i * 1000) unless index.nil? # TODO: unfirebase
  end

  def self.get_shared_table(table_name)
    escaped_table_name = escape_table_name(table_name)
    columns_response = firebase_shared.get("/v3/channels/shared/metadata/tables/#{escaped_table_name}/columns") # TODO: unfirebase
    columns = columns_response.body ? columns_response.body.map {|_, value| value['columnName']} : []

    records_response = firebase_shared.get("/v3/channels/shared/storage/tables/#{escaped_table_name}/records") # TODO: unfirebase
    records = records_response.body || []

    {columns: columns, records: records}
  end

  def self.get_shared_table_list
    response = firebase_shared.get("/v3/channels/shared/counters/tables") # TODO: unfirebase
    return response unless response.success?
    response.body.transform_keys {|table_name| unescape_table_name(table_name)}
  end

  def self.get_library_manifest
    response = firebase_shared.get("/v3/channels/shared/metadata/manifest") # TODO: unfirebase
    response.body
  end

  # Important Note: this firebase database is shared across all of our environments.
  # Changes made using this function will be visible immediately in all environments (including prod)
  def self.set_library_manifest(manifest)
    firebase_shared.set("/v3/channels/shared/metadata/manifest", manifest) # TODO: unfirebase
  end

  def self.delete_channels(encrypted_channel_ids)
    firebase_client = create_client
    encrypted_channel_ids.each do |encrypted_channel_id|
      firebase_client.delete "/v3/channels/#{encrypted_channel_id}/" # TODO: unfirebase
    end
  end

  def self.delete_channel(encrypted_channel_id)
    raise "channel_id must be non-empty" if encrypted_channel_id.nil? || encrypted_channel_id.empty?
    create_client.delete "/v3/channels/#{encrypted_channel_id}/"
  end

  # TODO: post-firebase-cleanup
  def self.firebase_shared
    raise "CDO.firebase_shared_secret not defined" unless CDO.firebase_shared_secret
    Firebase::Client.new \
      'https://cdo-v3-shared.firebaseio.com/',
      CDO.firebase_shared_secret
  end
end
