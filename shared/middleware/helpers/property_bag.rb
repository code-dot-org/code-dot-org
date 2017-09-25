require 'aws-sdk'

class DynamoPropertyBag
  class NotFound < Sinatra::NotFound
  end

  def initialize(channel_id, storage_id)
    @channel_id = channel_id
    @storage_id = storage_id

    @hash = "#{@channel_id}:#{storage_id}"
  end

  def self.pre_initialize
    @@dynamo_db ||= Aws::DynamoDB::Client.new
  end

  def db
    @@dynamo_db ||= Aws::DynamoDB::Client.new
  end

  def delete(name)
    begin
      db.delete_item(
        table_name: CDO.dynamo_properties_table,
        key: {'hash' => @hash, name: name},
        expected: name_exists(name),
      )
    rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
      raise NotFound, "key '#{name}' not found"
    end
    true
  end

  def get(name)
    item = db.get_item(
      table_name: CDO.dynamo_properties_table,
      consistent_read: true,
      key: {'hash' => @hash, 'name' => name},
    ).item

    raise NotFound, "key '#{name}' not found" unless item
    JSON.load(item['value'])
  end

  def set(name, value, ip_address, time = DateTime.now)
    db.put_item(
      table_name: CDO.dynamo_properties_table,
      item: {
        hash: @hash,
        name: name,
        updated_at: time.to_s,
        updated_ip: ip_address,
        value: value.to_json,
      },
    )
    value
  rescue Aws::DynamoDB::Errors::ValidationException => e
    if e.message == 'Item size has exceeded the maximum allowed size'
      {status: 'TOO_LARGE'}
    else
      raise e
    end
  end

  def to_hash
    last_evaluated_key = nil

    results = {}
    loop do
      page = db.query(
        table_name: CDO.dynamo_properties_table,
        key_conditions: {
          "hash" => {
            attribute_value_list: [@hash],
            comparison_operator: "EQ",
          },
        },
        attributes_to_get: ['name', 'value'],
        exclusive_start_key: last_evaluated_key,
      ).first

      page[:items].each do |item|
        results[item['name']] = JSON.load(item['value'])
      end

      last_evaluated_key = page[:last_evaluated_key]

      break unless last_evaluated_key
    end
    results
  end

  def name_exists(id)
    {"name" => {value: id, comparison_operator: 'EQ',}}
  end
end
