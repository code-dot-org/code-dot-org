# A DynamoDB adapter class that allows us to use
# dynamodb as a persistent store with the datastore_cache
require 'aws-sdk'
require 'oj'

class DynamoDBAdapter
  # @param table_name [String] the name of the dynamodb table to use
  def initialize(table_name)
    @table_name = table_name
    @client = Aws::DynamoDB::Client.new
  end

  # @param key [String]
  # @returns [String]
  def get(key)
    resp = @client.get_item({
      table_name: @table_name,
      key: {
        'data-key' => key
      }
    })
    return nil if resp.item.nil?
    Oj.load(resp.item['data-value'])
  end

  # @param key [String]
  # @param value [String]
  def set(key, value)
    @client.put_item({
      table_name: @table_name,
      item: {
        'data-key' => key,
        'data-value' => Oj.dump(value, :mode => :strict)
      }
    })
  end

  # returns [Hash]
  def all
    result = {}
    last_evaluated = nil
    loop do
      resp = @client.scan({
        table_name: @table_name,
        exclusive_start_key: last_evaluated
      })

      resp.items.each do |item|
        key = item['data-key']
        value = Oj.load(item['data-value'])
        result[key] = value
      end

      break if resp.count == 0 || resp.last_evaluated_key.nil?
      last_evaluated = resp.last_evaluated_key
    end

    result
  end

  def clear
    raise NotImplementedError, "DynamoDBAdapter does not support clear"
  end
end
