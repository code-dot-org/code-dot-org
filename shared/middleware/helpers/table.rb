#
# Table
#
class Table

  class NotFound < Sinatra::NotFound
  end

  def initialize(channel_id, storage_id, table_name)
    _, @channel_id = storage_decrypt_channel_id(channel_id) # TODO(if/when needed): Ensure this is a registered channel?
    @storage_id = storage_id
    @table_name = table_name

    @table = PEGASUS_DB[:app_tables]
  end

  def items()
    @items ||= @table.where(app_id:@channel_id, storage_id:@storage_id, table_name:@table_name)
  end

  def delete(id)
    delete_count = items.where(row_id:id).delete
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless delete_count > 0
    true
  end

  def delete_all()
    items.delete
  end

  def fetch(id)
    row = items.where(row_id:id).first
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless row
    JSON.load(row[:value]).merge(id:row[:row_id])
  end

  def insert(value, ip_address)
    row = {
      app_id:@channel_id,
      storage_id:@storage_id,
      table_name:@table_name,
      value:value.to_json,
      updated_at:DateTime.now,
      updated_ip:ip_address,
    }

    tries = 0
    begin
      row[:row_id] = next_id
      row[:id] = @table.insert(row)
    rescue Sequel::UniqueConstraintViolation
      retry if (tries += 1) < 5
      raise
    end

    JSON.load(row[:value]).merge(id:row[:row_id])
  end

  def next_id()
    items.max(:row_id).to_i + 1
  end

  def update(id, value, ip_address)
    row = {
      value:value.to_json,
      updated_at:DateTime.now,
      updated_ip:ip_address,
    }
    update_count = items.where(row_id:id).update(row)
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" if update_count == 0

    JSON.load(row[:value]).merge(id:id)
  end

  def to_a()
    items.map do |row|
      JSON.load(row[:value]).merge(id:row[:row_id])
    end
  end

  def self.table_names(channel_id)
    PEGASUS_DB[:app_tables].where(app_id:channel_id, storage_id:nil).group(:table_name).map do |row|
      row[:table_name]
    end
  end

end

require 'aws-sdk'

#
# DynamoTable
#
class DynamoTable

  class NotFound < Sinatra::NotFound
  end

  def initialize(channel_id, storage_id, table_name)
    _, @channel_id = storage_decrypt_channel_id(channel_id) # TODO(if/when needed): Ensure this is a registered channel?
    @storage_id = storage_id
    @table_name = table_name

    @hash = "#{@channel_id}:#{@table_name}:#{@storage_id}"
  end

  def db
    @@dynamo_db ||= Aws::DynamoDB::Client.new(
      region: 'us-east-1',
      access_key_id: CDO.s3_access_key_id,
      secret_access_key: CDO.s3_secret_access_key,
    )
  end

  def delete(id)
    begin
      db.delete_item(
        table_name:CDO.dynamo_tables_table,
        key:{'hash'=>@hash, 'row_id'=>id},
        expected:row_id_exists(id),
      )
    rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
      raise NotFound, "row `#{id}` not found in `#{@table_name}` table"
    end
    true
  end

  def delete_all()
    ids = ids_to_a
    unless ids.empty?
      db.batch_write_item(
        request_items:{
          CDO.dynamo_tables_table => ids.map do |id|
            { delete_request: { key:{'hash'=>@hash, 'row_id'=>id}, } }
          end
        }
      )
    end
    true
  end

  def fetch(id)
    row = db.get_item(
      table_name:CDO.dynamo_tables_table,
      key:{'hash'=>@hash, 'row_id'=>id},
    ).item
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless row

    value_from_row(row)
  end

  def ids_to_a()
    last_evaluated_key = nil

    [].tap do |results|
      begin
        page = db.query(
          table_name:CDO.dynamo_tables_table,
          key_conditions: {
            "hash" => {
              attribute_value_list: [@hash],
              comparison_operator: "EQ",
            },
          },
          attributes_to_get:['row_id'],
          exclusive_start_key:last_evaluated_key,
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

    begin
      row_id = next_id

      db.put_item(
        table_name:CDO.dynamo_tables_table,
        item:{
          hash:@hash,
          channel_id:@channel_id,
          table_name:@table_name,
          row_id:row_id,
          updated_at:DateTime.now.to_s,
          updated_ip:ip_address,
          value:value.to_json,
        },
        expected:row_id_doesnt_exist(row_id),
      )
    rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
      retries -= 1
      raise Sequel::UniqueConstraintViolation if retries == 0
      retry
    end

    value.merge(id:row_id)
  end

  def next_id()
    page = db.query(
      table_name:CDO.dynamo_tables_table,
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
    { "row_id" => { value:id, comparison_operator:'EQ', } }
  end

  def row_id_doesnt_exist(id)
    { "row_id" => { value:id, comparison_operator:'NE', } }
  end

  def update(id, value, ip_address)
    begin
      db.put_item(
        table_name:CDO.dynamo_tables_table,
        item:{
          hash:@hash,
          row_id:id,
          updated_at:DateTime.now.to_s,
          updated_ip:ip_address,
          value:value.to_json,
        },
        expected:row_id_exists(id),
      )
    rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
      raise NotFound, "row `#{id}` not found in `#{@table_name}` table"
    end

    value.merge(id:id)
  end

  def to_a()
    last_evaluated_key = nil

    [].tap do |results|
      begin
        page = db.query(
          table_name:CDO.dynamo_tables_table,
          key_conditions: {
            "hash" => {
              attribute_value_list: [@hash],
              comparison_operator: "EQ",
            },
          },
          exclusive_start_key:last_evaluated_key,
        ).first

        page[:items].each do |item|
          results << value_from_row(item)
        end

        last_evaluated_key = page[:last_evaluated_key]
      end while last_evaluated_key
    end
  end

  def value_from_row(row)
    JSON.load(row['value']).merge(id:row['row_id'].to_i)
  end

  def self.table_names(channel_id)
    @dynamo_db ||= Aws::DynamoDB::Client.new(
      region: 'us-east-1',
      access_key_id: CDO.s3_access_key_id,
      secret_access_key: CDO.s3_secret_access_key,
    )
    last_evaluated_key = nil
    results = {}
    begin
      page = @dynamo_db.query(
        table_name:CDO.dynamo_tables_table,
        index_name:CDO.dynamo_tables_index,
        key_conditions: {
          "channel_id" => {
            attribute_value_list: [channel_id.to_i],
            comparison_operator: "EQ",
          },
        },
        attributes_to_get:['table_name'],
        exclusive_start_key:last_evaluated_key,
      ).first

      page[:items].each do |item|
        results[item['table_name']] = true
      end

      last_evaluated_key = page[:last_evaluated_key]
    end while last_evaluated_key
    results.keys
  end

end
