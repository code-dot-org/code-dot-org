require 'test_helper'
require 'fake_sqs/test_integration'

# Launch a fake SQS service running on Localhost unless an environment variable is set to use the
# actual SQS service.
unless ENV['USE_REAL_SQS']
  Aws.config.update(region: 'us-east-1', access_key_id: 'fake id', secret_access_key: 'fake secret')
  $fake_sqs_service = FakeSQS::TestIntegration.new(database: ':memory:',
    sqs_endpoint: 'localhost', sqs_port: 4568)
  sleep(2) # add a sleep to fix test failures with 'RuntimeError: FakeSQS didn't start in time'
end

class Pd::AsyncWorkshopHandlerTest < ActiveSupport::TestCase

  setup do
    @sqs = Aws::SQS::Client.new

    # Start the fake SQS service unless the user has request to use real SQS.
    @use_fake_queue = !ENV['USE_REAL_SQS']
    if @use_fake_queue
      $fake_sqs_service.start
      @sqs.config.endpoint = $fake_sqs_service.uri
    end

    # Create the test queue.
    queue_name = "test-pd-workshop-#{SecureRandom.hex}"
    response = @sqs.create_queue(queue_name: queue_name, attributes: {"VisibilityTimeout" => "1"})
    @queue_url = response.queue_url

    @workshop = create :pd_closed_workshop
  end

  teardown do
    @sqs.delete_queue(queue_url: @queue_url)
    $fake_sqs_service.stop if @use_fake_queue
  end

  test 'queue' do
    CDO.expects(:pd_workshop_queue_url).returns(@queue_url).at_least_once
    Pd::AsyncWorkshopHandler.process_closed_workshop @workshop.id

    Pd::Workshop.expects(:process_closed_workshop_async).with(@workshop.id)
    process_pending_queue_messages
  end

  private

  # Helper function to synchronously process all of the currently pending messages at `queue_url`
  # using handler. (In reality the handler would be called by an asynchronous QueueProcessor but
  # this helps testing by allowing us to process messages only when we want to.)
  def process_pending_queue_messages
    response = @sqs.receive_message(queue_url: @queue_url, wait_time_seconds: 10)
    Pd::AsyncWorkshopHandler.new.handle(response.messages.map {|msg| SQS::Message.new(msg.body)})
  end
end
