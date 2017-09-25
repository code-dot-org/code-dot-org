require 'singleton'

# A wrapper client to the AWS Firehose service.
# @example
#   FirehoseClient.instance.put_record(
#     'analysis-events',
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
class FirehoseClient
  include Singleton

  REGION = 'us-east-1'.freeze

  # Initializes the @firehose to an AWS Firehose client.
  def initialize
    if rack_env == :test
      return
    end
    @firehose = Aws::Firehose::Client.new(region: REGION)
  end

  # Posts a record to the indicated stream.
  # @param stream_name [String] The steam to put the data in.
  # @param data [hash] The data to insert into the stream.
  def put_record(stream_name, data)
    data_with_common_values = add_common_values(data)

    if [:development, :test].include? rack_env
      CDO.log.info "Skipped sending record to #{stream_name}: "
      CDO.log.info data
      return
    end

    # TODO(asher): Determine whether these should be cached and batched via
    # put_record_batch. See
    #   http://docs.aws.amazon.com/sdkforruby/api/Aws/Firehose/Client.html#put_record_batch-instance_method
    # for documentation.
    @firehose.put_record(
      {
        delivery_stream_name: stream_name,
        record: {data: data_with_common_values.to_json}
      }
    )
  rescue Aws::Firehose::Errors::ServiceError => e
    # TODO(asher): Determine what action is appropriate here. In particular,
    # if the exception is ServiceUnavailableException, we should consider
    # backing off and retrying.
    # See http://docs.aws.amazon.com/sdkforruby/api/Aws/Firehose/Client.html#put_record-instance_method.
    Honeybadger.notify(e)
  end

  private

  # Adds common key-value pairs to the data hash.
  # @param data [hash] The data to add the key-value pairs to.
  # @return [hash] The data, including the newly added key-value pairs.
  def add_common_values(data)
    data_with_common_values = data.merge(
      created_at: DateTime.now,
      environment: rack_env,
      device: 'server-side'.to_json
    )
    data_with_common_values[user_id] = current_user.id if current_user

    data_with_common_values
  end
end
