# RedisTable provides a table abstraction that notifies clients of changes.
# Operations include adding a row, updating and fetching a specific row
# by id, and fetching all rows. Rows preserve the order of insertion.
# # The implementation wraps a RedisProperty bag to store the table rows
# # and a pub sub service to notify clients of changes.

require_relative 'redis_property_bag'

# @private
class RedisTable
  ROW_ID_KEY = "row_id"

  def initialize(redis, pub_sub_api, shard_id, table_name)
    @pub_sub_api = pub_sub_api
    @props = RedisPropertyBag.new(redis, "#{shard_id}_#{table_name}")
  end

  # Inserts a new row, notifying other clients using the pubsub service.
  #
  # @param [Hash] value The hash for the new row.
  # @return [Hash] The inserted value, including the new :id field.
  def insert(value)
    new_row_id = next_id
    @props.set(new_row_id.to_s, value.to_json)
    publish_change({:action => 'insert', 'id' => new_row_id})
    merge_id(value, new_row_id)
  end

  # Converts the rows to an array ordered by ascending row id.
  #
  # @return [Array<String>]
  def to_a
    result = []
    @props.to_hash.each do |key, value|
      result << make_row(key, value) if key != ROW_ID_KEY
    end
    result.sort_by {|row| row['id'].to_i}
  end

  # Fetches a row by id.
  #
  # @param [String] id The id for the new row
  # @return [Hash] The row, or null if no such row exists.
  def fetch(id)
    make_row(id, @props.to_hash[id.to_s])
  end

  # Updates an existing row, notifying other clients using the pubsub service.
  #
  # @param [String] id The id of the row to update.
  # @param [Hash] hash The updated hash.
  def update(id, hash)
    @props.set(id.to_s, hash.to_json)
    publish_change({:action => 'update', :id => id.to_i})
    merge_id(hash, id)
  end

  # Deletes a row, notifying other clients using the pubsub service.
  #
  # @param [String] id The id for the new row
  def delete(id)
    @props.delete(id)
    publish_change({:action => 'delete', :id => id.to_i})
  end

  # Deletes all rows in the table.
  def delete_all
    @props.delete_all
  end


 private
  # Returns a new, monotonically increasing id for a row.
  # @return [String]
  def next_id
    @props.increment_counter(ROW_ID_KEY)
  end

  # Returns the value hash merged with an id field.
  #
  # @param [Hash] value
  # @param [String, Integer] id
  # @return [Hash]
  def merge_id(value, id)
    value.merge({'id' => id.to_s})
  end

  # Makes a row object by parsing the JSON value and adding the id property.
  #
  # @param [String] id The id for the row.
  # @param [String] value The JSON-encoded value.
  # @return [Hash] The row, or null if no such row exists.
  # @private
  def make_row(id, value)
    value.nil? ? nil : merge_id(JSON.load(value), id)
  end

  # Notifies other clients about changes to this table using pubsub api.
  #
  # @param [Hash] update_hash A hash describing the update.
  def publish_change(update_hash)
    @pub_sub_api.publish(@shard_id, @table_name, update_hash)
  end
end