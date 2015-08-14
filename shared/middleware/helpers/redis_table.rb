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

  # Suffix appended to special row id columns.
  ROW_ID_SUFFIX='_row_id'

  class NotFound < Sinatra::NotFound
  end

  # Constructs the redis table.
  #
  # @param [Redis] redis The Redis client.
  # @param [PubSubApi] pub_sub_api An optional PubSub API implementation
  # @param [String] shard_id
  # @param [String] table_name
  # @param [Integer] expire_in - Shard expiration in seconds from the last write.
  #        If omitted (or nil), shard will not expire.
  def initialize(redis, pub_sub_api, shard_id, table_name, expire_in = nil)
    @pub_sub_api = pub_sub_api

    @shard_id = shard_id
    @table_name = table_name
    @expire_in = expire_in

    # A counter key in the underlying RedisPropertyBag, used to generate
    # asecending row ids.
    @row_id_key = "#{table_name}#{ROW_ID_SUFFIX}"

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
    @props.expire(@expire_in) if @expire_in
    publish_change({:action => 'insert', :id => new_id})
    merge_id(value, new_id)
  end

  # Returns all rows with id >= min_id as an array ordered by ascending row id.
  # (If min_id is nil or 1, returns all rows.)
  #
  # @param [Integer?] min_id
  # @return [Array<Hash>]
  def to_a_from_min_id(min_id)
    @props.to_hash.
        select { |k, v| belongs_to_this_table_with_min_id(k, min_id)}.
        collect { |k, v| make_row(id_from_row_key(k), v) }.
        sort_by { |row| row['id'] }
  end

  # Returns all rows as an array ordered by ascending row id.
  #
  # @return [Array<Hash>]
  def to_a
    to_a_from_min_id(nil)
  end


  # Fetch the rows multiple tables all at once.
  # The parameters are a shard_id and and a table map. The keys of the map
  # are the table names to fetch and the values are the starting id to fetch, or
  # 1 for all ids. The return value is a map from table name to a hash containing
  # a 'rows' field whose value is an array of rows.
  #
  # Note that the result map will always include a row for a requested table even
  # if none of the rows passed the min_id test.
  #
  # For example:
  #
  # RedisTable.get_tables(redis, "shard", {'t1' => 1, 't2' => 3})
  # =>  {'t1' => {'rows' => [{..}, <etc> }

  # @param [Redis] redis The redis client.
  # @param [String] shard_id
  # @param [Hash<String, Integer>] table_map
  # @return [Array<Hash<String, Array<Hash>>>]
  def self.get_tables(redis, shard_id, table_map)
    props = RedisPropertyBag.new(redis, shard_id)
    {}.tap do |result|
      props.to_hash.select do |k, v|
        # Skip internal keys and rows for non-requested tables
        table_name = table_from_row_key(k)
        next if is_internal_key(k) || !table_map.include?(table_name)

        # Add or get the rows entry for the table from the result map.
        value = (result[table_name] ||= {'rows' => []})

        # Ignore rows whose id is too low
        id = id_from_row_key(k)
        next if id < table_map[table_name]

        # Add the rows.
        value['rows'] << make_row(id, v)
      end
    end
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
    @props.expire(@expire_in) if @expire_in
    publish_change({:action => 'update', :id => id})
    merge_id(hash, id)
  end

  # Deletes multiple rows, notifying other clients using the pubsub service
  #
  # @param [Integer, Array<Integer>] ids The row IDs to delete.
  def delete(ids)
    ids = [ids] unless ids.is_a?(Array)
    deleted = @props.delete(ids.map {|id| row_key(id)})
    if deleted
      @props.expire(@expire_in) if @expire_in
      publish_change({:action => 'delete', :ids => ids})
    end
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
  def self.table_from_row_key(key)
    key.split('_')[0]
  end
  def table_from_row_key(key)
    self.class.table_from_row_key(key)
  end

  # Given a row key, return the id of the row that it corresponds to.
  # @param [String] key
  # @return [Integer] the row id.
  def self.id_from_row_key(key)
    key.split('_')[1].to_i
  end
  def id_from_row_key(key)
    self.class.id_from_row_key(key)
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
  def self.merge_id(value, id)
    value.merge({'id' => id.to_i})
  end
  def merge_id(value, id)
    self.class.merge_id(value, id)
  end

  # Makes a row object by parsing the JSON value and adding the id property.
  #
  # @param [String] id The id for the row.
  # @param [String] value The JSON-encoded value.
  # @return [Hash] The row, or null if no such row exists.
  # @private
  def self.make_row(id, value)
    value.nil? ? nil : merge_id(JSON.parse(value), id)
  end
  def make_row(id, value)
    self.class.make_row(id, value)
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
  # @param [String] row_key The row key.
  # @param [Integer] min_id The minimum id, or nil for all ids.
  # @return [Boolean]
  def belongs_to_this_table_with_min_id(row_key, min_id)
    (@table_name == table_from_row_key(row_key)) &&
        (row_key != @row_id_key) &&
        (min_id.nil? || id_from_row_key(row_key) >= min_id)
  end

  # Return true if k is special internal key (e.g. the row id key) that should
  # not be returned to callers.
  def self.is_internal_key(k)
    k.end_with?(ROW_ID_SUFFIX)
  end
  def is_internal_key(k)
    self.class.is_internal_key(k)
  end

end
