require 'test_helper'

require 'aws-sdk-sqs'
require 'fake_sqs/test_integration'
require 'securerandom'
require 'timecop'

# Launch a fake SQS service running on Localhost unless an environment variable is set to use the
# actual SQS service.
unless ENV['USE_REAL_SQS']
  Aws.config.update(region: 'us-east-1', access_key_id: 'fake id', secret_access_key: 'fake secret')
  $fake_sqs_service = FakeSQS::TestIntegration.new(
    database: ':memory:',
    sqs_endpoint: '127.0.0.1',
    sqs_port: 4568
  )
end

class ActivityTest < ActiveSupport::TestCase
  def setup
    @sqs = Aws::SQS::Client.new

    # Start the fake SQS service unless the user has request to use real SQS.
    @use_fake_queue = !ENV['USE_REAL_SQS']
    if @use_fake_queue
      $fake_sqs_service.start
      @sqs.config.endpoint = $fake_sqs_service.uri
    end

    # Create the test queue.
    queue_name = "test-activity_test-#{SecureRandom.hex}"
    response = @sqs.create_queue(queue_name: queue_name, attributes: {"VisibilityTimeout" => "1"})
    @queue_url = response.queue_url
  end

  def teardown
    @sqs.delete_queue(queue_url: @queue_url)
    $fake_sqs_service.stop if @use_fake_queue
  end

  private

  # Helper function to synchronously process all of the currently pending messages at `queue_url`
  # using handler. (In reality the handler would be called by an asynchronous QueueProcessor but
  # this helps testing by allowing us to process messages only when we want to.)
  def process_pending_queue_messages(queue_url, handler)
    response = @sqs.receive_message(queue_url: queue_url, wait_time_seconds: 10)
    handler.handle(response.messages.map {|msg| SQS::Message.new(msg.body)})
  end
end
