require 'singleton'
require 'cdo/buffer'
require 'aws-sdk-firehose'
require 'active_support/core_ext/module/attribute_accessors'

# A wrapper client to the AWS Firehose service.
# @example
#   FirehoseClient.instance.put_record(
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

class FirehoseClient < Cdo::Buffer
  STREAM_NAME = 'analysis-events'.freeze

  include Singleton
  cattr_accessor :client

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

  # Initializes the @firehose to an AWS Firehose client.
  def initialize(log: CDO.log)
    super(
      batch_count: ITEMS_PER_REQUEST,
      batch_size: BYTES_PER_REQUEST,
      max_interval: 10.0,
      min_interval: 1.0 / (TRANSACTIONS_PER_SECOND / Concurrent.processor_count),
      log: log,
      wait_at_exit: 10.0
    )
    unless [:development, :test].include? rack_env
      self.client = Aws::Firehose::Client.new
    end
  end

  # Posts a record to the analytics stream.
  # @param data [hash] The data to insert into the stream.
  def put_record(data)
    return unless Gatekeeper.allows('firehose', default: true)
    record = add_common_values(data).to_json
    if (size = record.bytesize) > BYTES_PER_RECORD
      raise ArgumentError.new("Record too large (#{size} bytes)")
    end
    buffer(record)
  end

  def flush(records)
    return unless Gatekeeper.allows('firehose', default: true)
    if client
      client.put_record_batch(
        delivery_stream_name: STREAM_NAME,
        records: records.map {|r| {data: r}}
      )
    else
      log.info "Skipped sending records to #{STREAM_NAME}:\n#{records}"
    end
  end

  REQUEST_OVERHEAD = {DeliveryStreamName: STREAM_NAME, Records: []}.to_json.bytesize
  RECORD_OVERHEAD = {Data: ''}.to_json.bytesize

  # Calculate the exact request size of a PutRecordBatch call given the provided records.
  def size(records)
    REQUEST_OVERHEAD + records.each_with_index.sum do |record, i|
      RECORD_OVERHEAD +
        # Base64-converted data is 4/3 the size of the original content.
        4 * (record.bytesize / 3.to_f).ceil +
        # Commas separating Records in the array (one less than length).
        (i.zero? ? 0 : 1)
    end
  end

  private

  # Adds common key-value pairs to the data hash.
  # @param data [hash] The data to add the key-value pairs to.
  # @return [hash] The data, including the newly added key-value pairs.
  def add_common_values(data)
    data.merge(
      created_at: DateTime.now,
      environment: rack_env,
      device: 'server-side'.to_json
    )
  end
end
