require 'singleton'
require 'aws-sdk-firehose'
require 'dynamic_config/dcdo'

# A wrapper client to the AWS Firehose service.
# @example
#   FirehoseClient.instance.put_record(ANALYSIS_EVENTS_STREAM_NAME,
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
# The `data` in the records which are sent to Firehose will be JSON encoded, so make sure your Redshift "Copy options"
# have `json 'auto'`. This will tell Redshift to parse the data as a JSON blob.
#
# All records uploaded to Firehose will have some common attributes added to them which you can optionally tell Firehose
# top copy.
#   `created_at` timestamp - The timestamp of when this record was created.
#   `environment` varchar(128) - The Ruby RACK_ENV which produced this record e.g. 'Production', 'Test'
#   `device` varchar(1024) - JSON blob with information about the source of the record
#    e.g. "server-side", {"useragent: ..."}

ANALYSIS_EVENTS_STREAM_NAME = 'analysis-events'.freeze
# This Firehose stream is used for collecting data about string:url associations.
I18N_STRING_TRACKING_EVENTS_STREAM_NAME = 'i18n-string-tracking-events'.freeze

# Experiment name for using the Firehose put_record_batch API
FIREHOSE_PUT_RECORD_BATCH_DCDO_KEY = 'firehose_put_record_batch'.freeze

class FirehoseClient
  include Singleton

  REGION = 'us-east-1'.freeze
  # Max number of records Firehose allows to be pushed in a batch.
  FIREHOSE_PUT_MAX_RECORDS = 500

  # Initializes the @firehose to an AWS Firehose client.
  def initialize
    @rack_env = rack_env
    if [:development, :test].include? @rack_env
      return
    end
    @firehose = Aws::Firehose::Client.new(region: REGION)
  end

  # Posts records in batches to the given AWS Kinesis Firehose stream.
  # @param stream_name [string] The Kinesis stream to send the data to.
  # @param datas [array[hash]] The list of data to send to the stream.
  def put_record_batch(stream_name, datas)
    return if datas.nil? || datas.empty?
    return unless Gatekeeper.allows('firehose', default: true)

    # convert the given data into the format Firehose expects
    records = []
    datas.each do |data|
      records << create_record_from_data(add_common_values(data))
    end

    # don't update our Firehose tables on dev or test environments.
    if [:development, :test].include?(@rack_env)
      CDO.log.info "Skipped sending record to #{stream_name}: "
      CDO.log.info datas
      return
    end

    # AWS Firehose batch_put has a limit on how many records can be uploaded
    # at once. This will break up the list of records in multiple lists of
    # the max batch size and then upload those.
    i = 0
    while i < records.size
      # get a batch of records to send
      batch_end = i + FIREHOSE_PUT_MAX_RECORDS
      records_batch = records[i..batch_end - 1]
      batch_response = @firehose.put_record_batch(
        {
          delivery_stream_name: stream_name,
          records: records_batch
        }
      )
      batch_response.request_responses.each do |response|
        if response.error_code
          Honeybadger.notify(error_code: response.error_code, error_message: response.error_message)
        end
      end
      i += FIREHOSE_PUT_MAX_RECORDS
    end
  # Swallow and log all errors because an issue sending analytics should not prevent the caller from continuing.
  rescue StandardError => error
    # TODO(suresh): if the exception is Firehose ServiceUnavailableException, we should consider
    # backing off and retrying.
    # See http://docs.aws.amazon.com/sdkforruby/api/Aws/Firehose/Client.html#put_record-instance_method.
    Honeybadger.notify(error)
  end

  # Posts a record to the given AWS Kinesis Firehose stream.
  # @param stream_name [string] The Kinesis stream to send the data to.
  # @param data [hash] The data to send to the stream.
  def put_record(stream_name, data)
    if DCDO.get(FIREHOSE_PUT_RECORD_BATCH_DCDO_KEY, false)
      put_record_batch(stream_name, [data])
    else
      put_record_old(data)
    end
  end

  # ----------------- START Old Code Remove when firehose_put_record_batch ends --------------------
  # Posts a record to the analytics stream.
  # @param data [hash] The data to insert into the stream.
  def put_record_old(data)
    return unless Gatekeeper.allows('firehose', default: true)

    data_with_common_values = add_common_values(data)

    if [:development, :test].include? @rack_env
      CDO.log.info "Skipped sending record to #{ANALYSIS_EVENTS_STREAM_NAME}: "
      CDO.log.info data
      return
    end

    # TODO(asher): Determine whether these should be cached and batched via
    # put_record_batch. See
    #   http://docs.aws.amazon.com/sdkforruby/api/Aws/Firehose/Client.html#put_record_batch-instance_method
    # for documentation.
    @firehose.put_record(
      {
        delivery_stream_name: ANALYSIS_EVENTS_STREAM_NAME,
        record: {data: data_with_common_values.to_json}
      }
    )
  # Swallow and log all errors because an issue sending analytics should not prevent the caller from continuing.
  rescue StandardError => error
    # TODO(suresh): if the exception is Firehose ServiceUnavailableException, we should consider
    # backing off and retrying.
    # See http://docs.aws.amazon.com/sdkforruby/api/Aws/Firehose/Client.html#put_record-instance_method.
    Honeybadger.notify(error)
  end
  # ----------------- END Old Code Remove when firehose_put_record_batch ends --------------------

  private

  # Adds common key-value pairs to the data hash.
  # @param data [hash] The data to add the key-value pairs to.
  # @return [hash] The data, including the newly added key-value pairs.
  def add_common_values(data)
    data_with_common_values = data.merge(
      created_at: DateTime.now,
      environment: @rack_env,
      device: 'server-side'.to_json
    )
    data_with_common_values[:user_id] ||= current_user.id if defined?(current_user) && current_user
    data_with_common_values
  end

  # Take the hash of data and converts it in the record structure which Firehose expects.
  # @param data [hash] The data to add the key-value pairs to.
  # @return [hash] a hash which the Firehose API will accept.
  def create_record_from_data(data)
    {
      data: data.to_json
    }
  end
end
