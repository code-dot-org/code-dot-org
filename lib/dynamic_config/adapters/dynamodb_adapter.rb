# A DynamoDB adapter class that allows us to use dynamodb as a persistent store
# with the datastore_cache.
require 'aws-sdk-dynamodb'
require 'set'

require 'dynamic_config/adapters/base'

class DynamoDBAdapter < BaseAdapter
  # @param table_name [String] the name of the dynamodb table to use
  def initialize(table_name)
    @table_name = table_name
    @client = Aws::DynamoDB::Client.new
  end

  private

  def persist(key, value)
    @client.put_item(
      {
        table_name: @table_name,
        item: {
          'data-key' => key,
          'data-value' => value
        }
      }
    )
  end

  def all_persisted_keys
    result = Set[]
    last_evaluated = nil
    loop do
      resp = @client.scan(
        {
          table_name: @table_name,
          exclusive_start_key: last_evaluated
        }
      )

      keys = resp.items.map do |item|
        item['data-key']
      end
      result.merge(keys)

      break if resp.count == 0 || resp.last_evaluated_key.nil?
      last_evaluated = resp.last_evaluated_key
    end

    result
  end

  def retrieve(key)
    resp = @client.get_item(
      {
        table_name: @table_name,
        key: {'data-key' => key}
      }
    )
    return nil if resp.item.nil?
    return resp.item['data-value']
  end
end
