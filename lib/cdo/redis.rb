require 'redis'
require 'singleton'
require 'json'
require 'cdo/buffer'

# Wrapper client for Redis in memory store
class RedisClient
  include Singleton

  # :i18n
  # Stream for tracking which translated strings are used on which URLs.
  # @example
  #   RedisClient.instance.put_record(
  #     :i18n,
  #     {
  #       url: 'http://studio.code.org/courses',
  #       string_key: 'home.heading_elementary_markdown'
  #     }
  #   )

  STREAMS = {
    i18n: "i18n-string-tracking-events"
  }.freeze

  cattr_accessor :client
  cattr_accessor :log

  # 'The max length of a list is 2^32 - 1 elements (4294967295, more than 4 billion of elements per list).'
  # Ref: https://redis.io/topics/data-types#:~:text=The%20max%20length%20of%20a%20list%20is%20232%20-%201%20elements%20(4294967295,%20more%20than%204%20billion%20of%20elements%20per%20list).
  MAX_LIST_LENGTH = 2**32 - 1

  class RedisBuffer < Cdo::Buffer
    # @param stream_name [String] The Redis stream to send records to. Must be defined.
    def initialize(stream_name:)
      super(
          log: RedisClient.log,
          wait_at_exit: 10.0
      )

      raise ArgumentError.new("stream_name must be defined") if stream_name.nil? || stream_name.blank?
      # The name of the Redis key which records will be written to.
      @stream_name = stream_name
      # The JSON overhead needed for every Redis request. Needed when calculating request size limits.
      @request_overhead = {DeliveryStreamName: stream_name, Records: []}.to_json.bytesize
    end

    def flush(records)
      return unless DCDO.get("redis", false)
      client = RedisClient.client
      if client
        # Store records in Redis as a list of hash records
        # Append new records to the end (right) of the list
        client.rpush(
          @stream_name,
          records
        )
      else
        log.info "Skipped sending records to #{@stream_name}:\n#{records}"
      end
    end

    RECORD_OVERHEAD = {Data: ""}.to_json.bytesize

    def size(records)
      @request_overhead + records.each_with_index.sum do |record, i|
        RECORD_OVERHEAD +
            # Base64-converted data is 4/3 the size of the original content.
            4 * (record.bytesize / 3.to_f).ceil +
            # Commas separating Records in the array (one less than length).
            (i.zero? ? 0 : 1)
      end
    end
  end

  def initialize
    self.log ||= CDO.log
    unless [:development, :test].include? rack_env
      self.client = Redis.new
    end
    @buffers = Hash.new {|h, stream_name| h[stream_name] = RedisBuffer.new(stream_name: stream_name)}
  end

  # Posts a record to the analytics stream.
  # @param stream [Symbol] The Redis key to write the data to. A Symbol in the STREAMS hash.
  # @param data [Hash] The data to insert into the stream.
  def put_record(stream, data)
    return unless DCDO.get("redis", false)
    raise ArgumentError.new("stream must be defined") if stream.nil? || stream.blank?
    raise ArgumentError.new("Stream #{stream} not found in STREAMS") if (stream_name = STREAMS[stream]).nil?
    record = add_common_values(data).to_json
    if (length = RedisClient.client.lrange(stream, 0, -1).length) > MAX_LIST_LENGTH
      raise ArgumentError.new("List too large (#{length} entries)")
    end
    @buffers[stream_name].buffer(record)
  end

  # @param stream [Symbol] The Redis key to send the data to. A Symbol in the STREAMS hash.
  # @param records [Array] An array of Redis records to be sent in a request.
  # @return [Int] The size of the Firehose request in bytes if these records were sent.
  def size(stream, records)
    @buffers[STREAMS[stream]].size(records)
  end

  def flush!
    @buffers.each {|_, buffer| buffer.flush!}
    @buffers.clear
  end

  private

  # Adds common key-value pairs to the data hash.
  # @param data [Hash] The data to add the key-value pairs to.
  # @return [Hash] The data, including the newly added key-value pairs.
  def add_common_values(data)
    data.merge(
      created_at: DateTime.now,
      environment: rack_env,
      device: "server-side".to_json
    )
  end
end
