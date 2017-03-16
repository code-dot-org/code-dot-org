require 'singleton'

# A wrapper client to the AWS Firehose service.
# @example
#   FirehoseClient.instance.put_record(
#     'analysis-events',
#     {
#       created_at: DateTime.now,           # REQUIRED
#       environment: 'production',          # REQUIRED
#       study: 'underwater basket weaving', # REQUIRED
#       study_group: 'control',             # OPTIONAL
#       user_id: current_user.id,           # OPTIONAL
#       script_id: script.id,               # OPTIONAL
#       level_id: level.id,                 # OPTIONAL
#       project_id: project.id              # OPTIONAL
#       event: 'drowning',                  # REQUIRED
#       data_int:                           # OPTIONAL
#       data_float:                         # OPTIONAL
#       data_string:                        # OPTIONAL
#       data_json:                          # OPTIONAL
#     }.to_json
#   )
class FirehoseClient
  include Singleton

  REGION = 'us-east-1'.freeze

  # Initializes the @firehose to an AWS Firehose client.
  def initialize
    @firehose = Aws::Firehose::Client.new(region: REGION)
  end

  # Posts a record to the indicated stream.
  # @param stream_name [String] The steam to put the data in.
  # @param data [JSON] The data to insert into the stream.
  def put_record(stream_name, data)
    # TODO(asher): Determine whether these should be cached and batched via
    # put_record_batch. See
    #   http://docs.aws.amazon.com/sdkforruby/api/Aws/Firehose/Client.html#put_record_batch-instance_method
    # for documentation.
    @firehose.put_record(
      {
        delivery_stream_name: stream_name,
        record: {data: data}
      }
    )
  rescue Aws::Firehose::Errors::ServiceError
    # TODO(asher): Determine what action is appropriate here. In particular,
    # if the exception is ServiceUnavailableException, we should consider
    # backing off and retrying.
    # See http://docs.aws.amazon.com/sdkforruby/api/Aws/Firehose/Client.html#put_record-instance_method.
  end
end
