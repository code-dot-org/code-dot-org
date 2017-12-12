require 'aws-sdk'
require 'sinatra'

#
# DynamoTable
#
class DynamoTable
  MAX_BATCH_SIZE = 25
  # TODO: The `||=` is used below instead of `=` so as to avoid a constant redefinition warning.
  # Fix this, so that direct assignment can be used.
  CHANNEL_TABLE_NAME_INDEX ||= "channel_id-table_name-index".freeze

  class NotFound < Sinatra::NotFound
  end

  def initialize(channel_id, storage_id, table_name)
    _, @channel_id = storage_decrypt_channel_id(channel_id) # TODO(if/when needed): Ensure this is a registered channel?
    @storage_id = storage_id
    @table_type = storage_id.nil? ? 'shared' : 'user'
    @table_name = table_name

    @hash = "#{@channel_id}:#{@table_name}:#{@storage_id}"
    @metadata_hash = "#{@channel_id}:#{@table_name}:#{@table_type}:metadata"
  end

  def self.pre_initialize
    @@dynamo_db ||= Aws::DynamoDB::Client.new
  end

  def db
    @@dynamo_db ||= Aws::DynamoDB::Client.new
  end

  def metadata
    @metadata_item ||= db.get_item(
      table_name: CDO.dynamo_table_metadata_table,
      consistent_read: true,
      key: {'hash' => @metadata_hash}
    ).item

    # only return the parts we care about
    @metadata_item.select {|k, _| k == "column_list"} if @metadata_item
  end

  def set_column_list_metadata(column_list)
    db.put_item(
      table_name: CDO.dynamo_table_metadata_table,
      item: {
        hash: @metadata_hash,
        channel_id: @channel_id,
        table_name: @table_name,
        column_list: column_list.to_json,
        updated_at: DateTime.now.to_s,
      }
    )

    metadata
  end

  def create_metadata
    set_column_list_metadata TableMetadata.generate_column_list(to_a)
  end

  def ensure_metadata
    create_metadata unless metadata
  end

  def delete(id)
    begin
      db.delete_item(
        table_name: CDO.dynamo_tables_table,
        key: {'hash' => @hash, 'row_id' => id},
        expected: row_id_exists(id),
      )
    rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
      raise NotFound, "row `#{id}` not found in `#{@table_name}` table"
    end
    true
  end

  def delete_all
    ids = ids_to_a
    unless ids.empty?
      items = ids.map do |id|
        {delete_request: {key: {'hash' => @hash, 'row_id' => id}}}
      end

      # batch_write_items can only handle 25 items at a time, so split into groups of 25
      (0..ids.length).step(MAX_BATCH_SIZE).each do |start_index|
        db.batch_write_item(
          request_items: {
            CDO.dynamo_tables_table => items.slice(start_index, MAX_BATCH_SIZE)
          }
        )
      end
    end
    db.delete_item(
      table_name: CDO.dynamo_table_metadata_table,
      key: {'hash' => @metadata_hash}
    )
    true
  end

  def fetch(id)
    row = db.get_item(
      table_name: CDO.dynamo_tables_table,
      consistent_read: true,
      key: {'hash' => @hash, 'row_id' => id},
    ).item
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless row

    value_from_row(row)
  end

  def ids_to_a
    last_evaluated_key = nil

    [].tap do |results|
      loop do
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

        break unless last_evaluated_key
      end
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

  def exists?
    return next_id > 1
  end

  def next_id
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

    return 1 unless page && page[:items]
    return 1 unless item = page[:items].first

    item['row_id'].to_i + 1
  end

  def row_id_exists(id)
    {"row_id" => {value: id, comparison_operator: 'EQ',}}
  end

  def row_id_doesnt_exist(id)
    {"row_id" => {value: id, comparison_operator: 'NE',}}
  end

  def rename_column(old_name, new_name, ip_address)
    ensure_metadata
    column_list = JSON.parse(metadata["column_list"])
    new_column_list = TableMetadata.rename_column(column_list, old_name, new_name)
    set_column_list_metadata(new_column_list)

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

  def add_columns(column_names)
    ensure_metadata
    column_list = JSON.parse(metadata["column_list"])
    column_names.each do |col|
      column_list = TableMetadata.add_column(column_list, col)
    end
    set_column_list_metadata(column_list)
  end

  def delete_column(column_name, ip_address)
    ensure_metadata
    column_list = JSON.parse(metadata["column_list"])
    new_column_list = TableMetadata.remove_column(column_list, column_name)
    set_column_list_metadata(new_column_list)

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

    value.merge('id' => id)
  end

  def items
    last_evaluated_key = nil

    [].tap do |results|
      loop do
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

        break unless last_evaluated_key
      end
    end
  end

  def to_a
    return items.map {|i| value_from_row(i)}
  end

  def to_csv
    return table_to_csv(to_a, column_order: ['id'])
  end

  def value_from_row(row)
    JSON.load(row['value']).merge('id' => row['row_id'].to_i)
  end

  def self.table_names(channel_id)
    @dynamo_db ||= Aws::DynamoDB::Client.new
    last_evaluated_key = nil
    results = {}
    loop do
      page = @dynamo_db.query(
        table_name: CDO.dynamo_tables_table,
        index_name: CHANNEL_TABLE_NAME_INDEX,
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

      break unless last_evaluated_key
    end

    # now same thing for metadata
    loop do
      page = @dynamo_db.query(
        table_name: CDO.dynamo_table_metadata_table,
        index_name: CHANNEL_TABLE_NAME_INDEX,
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

      break unless last_evaluated_key
    end

    results.keys
  end
end
