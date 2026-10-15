# A DynamoDB adapter class that allows us to use
# dynamodb as a persistent store with the datastore_cache.
require 'aws-sdk-dynamodb'
require 'oj'
require 'observability/errors'

class DynamoDBAdapter
  # @param table_name [String] the name of the dynamodb table to use
  def initialize(table_name)
    @table_name = table_name
    @client = Aws::DynamoDB::Client.new
  end

  # @param key [String]
  # @returns [Object] or nil if the key doesnt exist
  def get(key)
    resp = @client.get_item(
      {
        table_name: @table_name,
        key: {'data-key' => key}
      }
    )
    return nil if resp.item.nil?
    begin
      value = Oj.load(resp.item['data-value'])
    rescue => exception
      Observability::Errors.report(exception)
      value = nil
    end
    value
  end

  # @param key [String]
  # @param value [JSONable object]
  # @raise if DynamoDB is unavailable
  def set(key, value)
    @client.put_item(
      {
        table_name: @table_name,
        item: {
          'data-key' => key,
          'data-value' => Oj.dump(value, mode: :strict)
        }
      }
    )
  end

  # @returns [Hash]
  # @raise if DynamoDB is unavailable
  def all
    result = {}
    last_evaluated = nil
    loop do
      # Called right after a put_item; an eventually consistent scan can miss that write.
      resp = @client.scan(
        {
          table_name: @table_name,
          consistent_read: true,
          exclusive_start_key: last_evaluated
        }
      )

      resp.items.each do |item|
        key = item['data-key']
        begin
          value = Oj.load(item['data-value'])
        rescue => exception
          Observability::Errors.report(exception)
          value = nil
        end
        result[key] = value
      end

      # An empty page does not mean the scan is done; only a nil key does.
      break if resp.last_evaluated_key.nil?
      last_evaluated = resp.last_evaluated_key
    end

    result
  end

  def clear
    raise NotImplementedError, "DynamoDBAdapter does not support clear"
  end
end
