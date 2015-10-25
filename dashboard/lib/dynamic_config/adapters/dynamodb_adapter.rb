require 'aws-sdk'

class DynamoDBAdapter
  def initialize(table_name)
    @table_name = table_name
    @client = Aws::DynamoDB::Client.new
  end

  def get(key)
    resp = @client.get_item({
      table_name: @table_name,
      key: {
        'data-key' => JSON.dump(key)
      }
    })
    return nil if resp.item.nil?
    JSON.load(resp.item['data-value'])
  end

  def set(key, value)
    @client.put_item({
      table_name: @table_name,
      item: {
        'data-key' => JSON.dump(key),
        'data-value' => JSON.dump(value)
      }
    })
  end

  def all
    result = {}
    last_evaluated = nil
    loop do
      resp = @client.scan({
        table_name: @table_name,
        exclusive_start_key: last_evaluated
      })

      resp.items.each do |item|
        key = JSON.load(item['data-key'])
        value = JSON.load(item['data-value'])
        result[key] = value
      end

      break if resp.count == 0 || resp.last_evaluated_key.nil?
      last_evaluated = resp.last_evaluated_key
    end

    result
  end
end
