# RedisTable provides a table abstraction that notifies clients of changes.
# Operations include adding a row, updating and fetching a specific row
# by id, and fetching all rows, preserving the rows in the order of insertion.
#
# The implementation wraps a RedisProperty bag to store the table rows
# and a pub sub service to notify clients of changes. All of the tables for
# a particular shard are stored in the same Redis key which ensures that
# data storage for a shard is all-or-none, avoiding some consistency issues if
# a Redis shard goes down.

require_relative 'redis_property_bag'

class RedisTable

  class NotFound < Sinatra::NotFound
  end

  # Constructs the redis table.
  #
  # @param [Redis] redis The Redis client.
  # @param [PubSubApi] pub_sub_api An optional PubSub API implementation
  # @param [String] shard_id
  # @param [String] table_name
  def initialize(redis, pub_sub_api, shard_id, table_name)
    @pub_sub_api = pub_sub_api

    @shard_id = shard_id
    @table_name = table_name

    # A counter key in the underlying RedisPropertyBag, used to generate
    # asecending row ids.
    @row_id_key = "#{table_name}_row_id"

    # A redis property bag for storing all tables in the shard.
    @props = RedisPropertyBag.new(redis, shard_id)
  end

  # Inserts a new row, notifying other clients using the pubsub service.
  #
  # @param [Hash] value The hash for the new row.
  # @param [String] ignored_ip Unused, for compatability with other table apis.
  # @return [Hash] The inserted value, including the new :id field.
  def insert(value, ignored_ip=nil)
    new_id = next_id
    @props.set(row_key(new_id), value.to_json)
    publish_change({:action => 'insert', :id => new_id})
    merge_id(value, new_id)
  end

  # Converts the rows to an array ordered by ascending row id.
  #
  # @return [Array<String>]
  def to_a
    @props.to_hash.
        select { |k, v| belongs_to_this_table(k) }.
        collect { |k, v| make_row(id_from_row_key(k), v) }.
        sort_by { |row| row[:id] }
  end

  # Fetches a row by id.
  #
  # @param [Integer] id The id of the row to fetch
  # @raises [Sinatra::NotFound] if no such row exists
  # @return [Hash] The row if exists
  def fetch(id)
    hash = @props.to_hash[row_key(id)]
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless hash
    make_row(id, hash)
  end

  # Updates an existing row, notifying other clients using the pubsub service.
  #
  # @param [Integer] id The id of the row to update.
  # @param [Hash] hash The updated hash.
  # @param [String] ignored_ip Unused, for compatability with other table apis.
  def update(id, hash, ignored_ip=nil)
    @props.set(row_key(id), hash.to_json)
    publish_change({:action => 'update', :id => id})
    merge_id(hash, id)
  end

  # Deletes a row, notifying other clients using the pubsub service.
  #
  # @param [Integer] id The id for the new row
  def delete(id)
    deleted = @props.delete(row_key(id))
    publish_change({:action => 'delete', :id => id}) if deleted
    deleted
  end

  # Deletes all the tables and rows in a shard.
  def self.reset_shard(shard_id, redis, pub_sub)
    RedisPropertyBag.new(redis, shard_id).delete_all
    pub_sub.publish(shard_id, 'all_tables', {:action => 'reset_shard'}) if pub_sub
  end

  private

  # Maps a table row_id to a Redis field name that includes the table
  # name, since all keys for a shard are stored in the same hash value.
  #
  # @param [Integer] row_id
  # @return [String] Redis field name.
  def row_key(row_id)
    "#{@table_name}_#{row_id}"
  end

  # Given a row key, return the name of the RedisTable that it belongs to.
  # @param [String] row_key
  # @return [String] the RedisTable name.
  def table_from_row_key(key)
    key.split('_')[0]
  end

  # Given a row key, return the id of the row that it corresponds to.
  # @param [String] key
  # @return [Integer] the row id.
  def id_from_row_key(key)
    key.split('_')[1]
  end

  # Returns a new, monotonically increasing id for a row.
  # @return [String]
  def next_id
    @props.increment_counter(@row_id_key)
  end

  # Returns the value hash merged with an id field.
  #
  # @param [Hash] value
  # @param [String, Integer] id
  # @return [Hash]
  def merge_id(value, id)
    value.merge({'id' => id.to_i})
  end

  # Makes a row object by parsing the JSON value and adding the id property.
  #
  # @param [String] id The id for the row.
  # @param [String] value The JSON-encoded value.
  # @return [Hash] The row, or null if no such row exists.
  # @private
  def make_row(id, value)
    value.nil? ? nil : merge_id(JSON.parse(value), id)
  end

  # Notifies other clients about changes to this table using pubsub api, if
  # provided.
  #
  # @param [Hash] update_hash A hash describing the update.
  def publish_change(update_hash)
    @pub_sub_api.publish(@shard_id, @table_name, update_hash) if @pub_sub_api
  end

  # Return true if row_key is a row_key for this table.
  #
  # @param [String] row_key
  # @return [Boolean]
  def belongs_to_this_table(row_key)
    table_from_row_key(row_key) == @table_name and row_key != @row_id_key
  end

end
