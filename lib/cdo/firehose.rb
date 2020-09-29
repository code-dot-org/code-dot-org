require 'singleton'
require 'cdo/buffer'
require 'aws-sdk-firehose'
require 'active_support/core_ext/module/attribute_accessors'

# A wrapper client to the AWS Firehose service.
class FirehoseClient
  include Singleton

  # :analysis
  # Used for recording events to later be analyzed by the product team.
  # @example
  #   FirehoseClient.instance.put_record(
  #     :analysis,
  #     {
  #       study: 'underwater basket weaving', # REQUIRED
  #       study_group: 'control',             # OPTIONAL
  #       script_id: script.id,               # OPTIONAL
  #       level_id: level.id,                 # OPTIONAL
  #       project_id: project.id,             # OPTIONAL
  #       user_id: user.id,                   # OPTIONAL
  #       event: 'drowning',                  # REQUIRED
  #       data_int: 2,                        # OPTIONAL
  #       data_float: 1.8,                    # OPTIONAL
  #       data_string: 'hello world',         # OPTIONAL
  #       data_json: "{\"key\":\"value\"}"    # OPTIONAL
  #     }
  #   )
  #
  # :i18n
  # Stream for tracking which translated strings are used on which URLs.
  # @example
  #   FirehoseClient.instance.put_record(
  #     :i18n,
  #     {
  #       url: 'http://studio.code.org/courses',
  #       string_key: 'home.heading_elementary_markdown'
  #     }
  #   )
  STREAMS = {
    analysis: 'analysis-events',
    i18n: 'i18n-string-tracking-events'
  }.freeze

  cattr_accessor :client
  cattr_accessor :log

  # 'Each PutRecordBatch request supports up to 500 records.'
  # Ref: https://docs.aws.amazon.com/firehose/latest/APIReference/API_PutRecordBatch.html
  ITEMS_PER_REQUEST = 500

  # 'The maximum size of a record sent to Kinesis Data Firehose, before base64-encoding, is 1,000 KiB.'
  # Ref: https://docs.aws.amazon.com/firehose/latest/dev/limits.html
  BYTES_PER_RECORD = 1024 * 1000

  # 'The PutRecordBatch operation can take up to 500 records per call or 4 MiB per call, whichever is smaller.'
  # Ref: https://docs.aws.amazon.com/firehose/latest/dev/limits.html
  BYTES_PER_REQUEST = 1024 * 1024 * 4

  # 'For US East (N. Virginia): 5,000 records/second, 2,000 requests/second, and 5 MiB/second.'
  # Ref: https://docs.aws.amazon.com/firehose/latest/dev/limits.html
  TRANSACTIONS_PER_SECOND = 2000.0

  class Buffer < Cdo::Buffer
    # @param stream_name [String] The AWS Firehose stream to send records to. Must be defined.
    def initialize(stream_name:)
      super(
        batch_count: ITEMS_PER_REQUEST,
        batch_size: BYTES_PER_REQUEST,
        max_interval: 10.0,
        min_interval: 1.0 / (TRANSACTIONS_PER_SECOND / Concurrent.processor_count),
        log: FirehoseClient.log,
        wait_at_exit: 10.0
      )

      raise ArgumentError.new("stream_name must be defined") if stream_name.nil? || stream_name.blank?
      # The name of the Firehose stream which records will be sent to.
      @stream_name = stream_name
      # The JSON overhead needed for every Firehose request. Needed when calculating request size limits.
      @request_overhead = {DeliveryStreamName: stream_name, Records: []}.to_json.bytesize
    end

    def flush(records)
      return unless Gatekeeper.allows('firehose', default: true)
      client = FirehoseClient.client
      if client
        client.put_record_batch(
          delivery_stream_name: @stream_name,
          records: records.map {|r| {data: r}}
        )
      else
        log.info "Skipped sending records to #{@stream_name}:\n#{records}"
      end
    end

    RECORD_OVERHEAD = {Data: ''}.to_json.bytesize

    # Calculate the exact request size of a PutRecordBatch call given the provided records.
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
      self.client = Aws::Firehose::Client.new
    end
    @buffers = Hash.new {|h, stream_name| h[stream_name] = Buffer.new(stream_name: stream_name)}
  end

  # Posts a record to the analytics stream.
  # @param stream [Symbol] The Firehose Stream to send the data to. A Symbol in the STREAMS hash.
  # @param data [Hash] The data to insert into the stream.
  def put_record(stream, data)
    return unless Gatekeeper.allows('firehose', default: true)
    raise ArgumentError.new("stream must be defined") if stream.nil? || stream.blank?
    raise ArgumentError.new("Stream #{stream} not found in STREAMS") if (stream_name = STREAMS[stream]).nil?

    record = add_common_values(data).to_json
    if (size = record.bytesize) > BYTES_PER_RECORD
      raise ArgumentError.new("Record too large (#{size} bytes)")
    end
    @buffers[stream_name].buffer(record)
  end

  # @param stream [Symbol] The Firehose Stream to send the data to. A Symbol in the STREAMS hash.
  # @param records [Array] An array of Firehose Records to be sent in a request.
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
      device: 'server-side'.to_json
    )
  end
end
