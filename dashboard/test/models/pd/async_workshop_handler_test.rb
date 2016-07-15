require 'test_helper'
require 'fake_sqs/test_integration'

# Launch a fake SQS service running on Localhost
Aws.config.update(region: 'us-east-1', access_key_id: 'fake id', secret_access_key: 'fake secret')
$fake_sqs_service = FakeSQSService.create

class Pd::AsyncWorkshopHandlerTest < ActiveSupport::TestCase

  setup do
    @sqs = Aws::SQS::Client.new

    # Start the fake SQS service for testing.
    $fake_sqs_service.start
    @sqs.config.endpoint = $fake_sqs_service.uri

    # Create the test queue.
    queue_name = "test-pd-workshop-#{SecureRandom.hex}"
    response = @sqs.create_queue(queue_name: queue_name, attributes: {"VisibilityTimeout" => "1"})
    @queue_url = response.queue_url

    @workshop = create :pd_ended_workshop
  end

  teardown do
    @sqs.delete_queue(queue_url: @queue_url)
    $fake_sqs_service.stop
  end

  test 'queue' do
    CDO.expects(:pd_workshop_queue_url).returns(@queue_url).at_least_once
    Pd::AsyncWorkshopHandler.process_ended_workshop @workshop.id

    Pd::Workshop.expects(:process_ended_workshop_async).with(@workshop.id)
    process_pending_queue_messages
  end

  test 'unexpected action' do
    e = assert_raises RuntimeError do
      Pd::AsyncWorkshopHandler.process_workshop(@workshop.id, 'nonsense')
    end
    assert e.message.include? 'Unexpected action'
  end

  test 'test and production raise error when no queue provided' do
    CDO.expects(:pd_workshop_queue_url).returns(nil).at_least_once

    [:test, :production].each do |env|
      set_env env
      e = assert_raises RuntimeError do
        Pd::AsyncWorkshopHandler.process_ended_workshop(@workshop.id)
      end
      assert e.message.include? 'CDO.pd_workshop_queue_url is required'
    end
  end

  test 'specified queue is used' do
    CDO.expects(:pd_workshop_queue_url).returns(@queue_url).at_least_once

    mock_queue = mock
    mock_queue.expects(:enqueue).times(3)
    Pd::AsyncWorkshopHandler.expects(:workshop_queue).returns(mock_queue).times(3)

    # include an environment other than the required test & production
    [:test, :production, :adhoc].each do |env|
      set_env env
      Pd::AsyncWorkshopHandler.process_ended_workshop(@workshop.id)
    end
  end

  test 'no queue specified in development env processes immediately' do
    CDO.expects(:pd_workshop_queue_url).returns(nil).at_least_once
    set_env :development

    Pd::AsyncWorkshopHandler.expects(:handle_operation)
    Pd::AsyncWorkshopHandler.process_ended_workshop(@workshop.id)
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
