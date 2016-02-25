#
# Table
#
require 'csv'
require 'set'
require_relative './table_metadata'
class Table

  class NotFound < Sinatra::NotFound
  end

  def initialize(channel_id, storage_id, table_name)
    _, @channel_id = storage_decrypt_channel_id(channel_id) # TODO(if/when needed): Ensure this is a registered channel?
    @storage_id = storage_id
    @table_name = table_name

    @table = PEGASUS_DB[:app_tables]
    @metadata_table = PEGASUS_DB[:channel_table_metadata]
  end

  def exists?()
    !@table.where(app_id: @channel_id, storage_id: @storage_id, table_name: @table_name).limit(1).first.nil?
  end

  def items()
    @items ||= @table.where(app_id: @channel_id, storage_id: @storage_id, table_name: @table_name)
  end

  def metadata
    @metadata ||= @metadata_table.where(app_id: @channel_id, storage_id: @storage_id, table_name: @table_name).limit(1)
  end

  # create a new metadata row, based on the contents of any existing records
  def create_metadata()
    @metadata_table.insert({
      app_id: @channel_id,
      storage_id: @storage_id,
      table_name: @table_name,
      column_list: TableMetadata.generate_column_list(to_a).to_json,
      updated_at: DateTime.now
    })
  end

  def ensure_metadata
    create_metadata if metadata.first.nil?
  end

  def delete(id)
    delete_count = items.where(row_id: id).delete
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless delete_count > 0
    true
  end

  def delete_all()
    items.delete
    @metadata.delete if metadata
  end

  def rename_column(old_name, new_name, ip_address)
    ensure_metadata()
    column_list = JSON.parse(metadata.first[:column_list])
    new_column_list = TableMetadata.rename_column(column_list, old_name, new_name)
    metadata.update({column_list: new_column_list.to_json})

    items.each do |r|
      # We want to preserve the order of the columns so creating
      # a new hash is required.
      new_value = {}
      value = JSON.load(r[:value])
      value.each do |k, v|
        if k == old_name
          new_value[new_name] = v
        else
          new_value[k] = v
        end
      end
      update(r[:row_id], new_value, ip_address)
    end
  end

  def add_column(column_name)
    ensure_metadata()
    column_list = JSON.parse(metadata.first[:column_list])
    new_column_list = TableMetadata.add_column(column_list, column_name)
    metadata.update({column_list: new_column_list.to_json})
  end

  def delete_column(column_name, ip_address)
    ensure_metadata()
    column_list = JSON.parse(metadata.first[:column_list])
    new_column_list = TableMetadata.remove_column(column_list, column_name)
    metadata.update({column_list: new_column_list.to_json})

    items.each do |r|
      value = JSON.load(r[:value])
      value.delete(column_name)
      update(r[:row_id], value, ip_address)
    end
  end

  def fetch(id)
    row = items.where(row_id: id).first
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless row
    JSON.load(row[:value]).merge('id' => row[:row_id])
  end

  def insert(value, ip_address)
    raise ArgumentError, 'Value is not a hash' unless value.is_a? Hash

    row = {
      app_id: @channel_id,
      storage_id: @storage_id,
      table_name: @table_name,
      value: value.to_json,
      updated_at: DateTime.now,
      updated_ip: ip_address,
    }

    tries = 0
    begin
      row[:row_id] = next_id
      row[:id] = @table.insert(row)
    rescue Sequel::UniqueConstraintViolation
      retry if (tries += 1) < 5
      raise
    end
    ensure_column_metadata(value)

    JSON.load(row[:value]).merge('id' => row[:row_id])
  end

  def ensure_column_metadata(row)
    ensure_metadata
    column_list = JSON.parse(metadata.first[:column_list])
    row_columns = TableMetadata.generate_column_list([row])
    new_column_list = column_list.dup.concat(row_columns).uniq

    if column_list != new_column_list
      @metadata.update({column_list: new_column_list.to_json})
    end
  end

  def next_id()
    items.max(:row_id).to_i + 1
  end

  def update(id, value, ip_address)
    raise ArgumentError, 'Value is not a hash' unless value.is_a? Hash
    row = {
      value: value.to_json,
      updated_at: DateTime.now,
      updated_ip: ip_address,
    }
    update_count = items.where(row_id: id).update(row)
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" if update_count == 0

    ensure_column_metadata(value)

    JSON.load(row[:value]).merge('id' => id)
  end

  def to_a()
    items.map do |row|
      JSON.load(row[:value]).merge('id' => row[:row_id])
    end
  end

  def to_csv()
    return table_to_csv(to_a, column_order: ['id'])
  end

  def self.table_names(channel_id)
    tables_from_records = PEGASUS_DB[:app_tables].where(app_id: channel_id, storage_id: nil).group(:table_name).select_map(:table_name)
    #TODO - same thing for dynamo
    tables_from_metadata = PEGASUS_DB[:channel_table_metadata].where(app_id: channel_id, storage_id: nil).group(:table_name).select_map(:table_name)
    tables_from_records.concat(tables_from_metadata).uniq
  end

end

require 'aws-sdk'

#
# DynamoTable
#
class DynamoTable
  MAX_BATCH_SIZE ||= 25

  class NotFound < Sinatra::NotFound
  end

  def initialize(channel_id, storage_id, table_name)
    _, @channel_id = storage_decrypt_channel_id(channel_id) # TODO(if/when needed): Ensure this is a registered channel?
    @storage_id = storage_id
    @table_name = table_name

    @hash = "#{@channel_id}:#{@table_name}:#{@storage_id}"
  end

  def db
    @@dynamo_db ||= Aws::DynamoDB::Client.new
  end

  def delete(id)
    begin
      db.delete_item(
        table_name: CDO.dynamo_tables_table,
        key: {'hash'=>@hash, 'row_id'=>id},
        expected: row_id_exists(id),
      )
    rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
      raise NotFound, "row `#{id}` not found in `#{@table_name}` table"
    end
    true
  end

  def delete_all()
    ids = ids_to_a
    return true if ids.empty?

    items = ids.map do |id|
      { delete_request: { key: {'hash'=>@hash, 'row_id'=>id} } }
    end

    # batch_write_items can only handle 25 items at a time, so split into groups of 25
    (0..ids.length).step(MAX_BATCH_SIZE).each do |start_index|
      db.batch_write_item(request_items: {
        CDO.dynamo_tables_table => items.slice(start_index, MAX_BATCH_SIZE)
      })
    end
    true
  end

  def fetch(id)
    row = db.get_item(
      table_name: CDO.dynamo_tables_table,
      consistent_read: true,
      key: {'hash'=>@hash, 'row_id'=>id},
    ).item
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless row

    value_from_row(row)
  end

  def ids_to_a()
    last_evaluated_key = nil

    [].tap do |results|
      begin
        page = db.query(
          table_name: CDO.dynamo_tables_table,
          key_conditions: {
            "hash" => {
              attribute_value_list: [@hash],
              comparison_operator: "EQ",
            },
          },
          attributes_to_get: ['row_id'],
          exclusive_start_key: last_evaluated_key,
        ).first

        page[:items].each do |item|
          results << item['row_id']
        end

        last_evaluated_key = page[:last_evaluated_key]
      end while last_evaluated_key
    end
  end

  def insert(value, ip_address)
    retries = 5

    raise ArgumentError, 'Value is not a hash' unless value.is_a? Hash
    begin
      row_id = next_id

      db.put_item(
        table_name: CDO.dynamo_tables_table,
        item: {
          hash: @hash,
          channel_id: @channel_id,
          table_name: @table_name,
          row_id: row_id,
          updated_at: DateTime.now.to_s,
          updated_ip: ip_address,
          value: value.to_json,
        },
        expected: row_id_doesnt_exist(row_id),
      )
    rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
      retries -= 1
      raise Sequel::UniqueConstraintViolation if retries == 0
      retry
    end

    value.merge('id' => row_id)
  end

  def exists?()
    return next_id > 1
  end

  def next_id()
    page = db.query(
      table_name: CDO.dynamo_tables_table,
      key_conditions: {
        "hash" => {
          attribute_value_list: [@hash],
          comparison_operator: "EQ",
        },
      },
      attributes_to_get: ['row_id'],
      limit: 1,
      scan_index_forward: false,
    ).first

    return 1 unless page
    return 1 unless item = page[:items].first

    item['row_id'].to_i + 1
  end

  def row_id_exists(id)
    { "row_id" => { value: id, comparison_operator: 'EQ', } }
  end

  def row_id_doesnt_exist(id)
    { "row_id" => { value: id, comparison_operator: 'NE', } }
  end

  def rename_column(old_name, new_name, ip_address)
    items.each do |r|
      # We want to preserve the order of the columns so creating
      # a new hash is required.
      new_value = {}
      value = JSON.load(r['value'])
      value.each do |k, v|
        if k == old_name
          new_value[new_name] = v
        else
          new_value[k] = v
        end
      end
      update(r['row_id'], new_value, ip_address)
    end
  end

  def delete_column(column_name, ip_address)
    items.each do |r|
      value = JSON.load(r['value'])
      value.delete(column_name)
      update(r['row_id'], value, ip_address)
    end
  end

  def update(id, value, ip_address)
    raise ArgumentError, 'Value is not a hash' unless value.is_a? Hash
    begin
      db.put_item(
        table_name: CDO.dynamo_tables_table,
        item: {
          hash: @hash,
          channel_id: @channel_id,
          table_name: @table_name,
          row_id: id,
          updated_at: DateTime.now.to_s,
          updated_ip: ip_address,
          value: value.to_json,
        },
        expected: row_id_exists(id),
      )
    rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
      raise NotFound, "row `#{id}` not found in `#{@table_name}` table"
    end

    new

    value.merge('id' => id)
  end

  def items()
    last_evaluated_key = nil

    [].tap do |results|
      begin
        page = db.query(
          table_name: CDO.dynamo_tables_table,
          consistent_read: true,
          key_conditions: {
            "hash" => {
              attribute_value_list: [@hash],
              comparison_operator: "EQ",
            },
          },
          exclusive_start_key: last_evaluated_key,
        ).first

        page[:items].each do |item|
          results << item
        end

        last_evaluated_key = page[:last_evaluated_key]
      end while last_evaluated_key
    end
  end

  def to_a()
    return items.map { |i| value_from_row(i) }
  end

  def to_csv()
    return table_to_csv(to_a, column_order: ['id'])
  end

  def value_from_row(row)
    JSON.load(row['value']).merge('id' => row['row_id'].to_i)
  end

  def self.table_names(channel_id)
    @dynamo_db ||= Aws::DynamoDB::Client.new
    last_evaluated_key = nil
    results = {}
    begin
      page = @dynamo_db.query(
        table_name: CDO.dynamo_tables_table,
        index_name: CDO.dynamo_tables_index,
        key_conditions: {
          "channel_id" => {
            attribute_value_list: [channel_id.to_i],
            comparison_operator: "EQ",
          },
        },
        attributes_to_get: ['table_name'],
        exclusive_start_key: last_evaluated_key,
      ).first

      page[:items].each do |item|
        results[item['table_name']] = true
      end

      last_evaluated_key = page[:last_evaluated_key]
    end while last_evaluated_key
    results.keys
  end

end

# Converts an array of hashes into a csv string
def table_to_csv(table_array, column_order: nil)
  # Since not every row will have all the columns we need to take
  # two passes through the table. The first is to
  # collect all the column names and the second to write the data.

  unique_columns = Set.new

  table_array.each do |table_row|
    unique_columns.merge(table_row.keys)
  end

  unique_columns = unique_columns.to_a
  if column_order
    column_order.reverse_each do |c|
      unique_columns.delete(c)
      unique_columns.insert(0, c)
    end
  end

  csv_string = CSV.generate do |csv|
    csv << unique_columns
    table_array.each do |table_row|
      csv << unique_columns.collect { |x| table_row[x] }
    end
  end
  return csv_string
end
