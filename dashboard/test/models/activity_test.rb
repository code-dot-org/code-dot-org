require 'test_helper'

require 'aws-sdk'
require 'fake_sqs/test_integration'
require 'securerandom'
require 'timecop'

# Launch a fake SQS service running on Localhost unless an environment variable is set to use the
# actual SQS service.
unless ENV['USE_REAL_SQS']
  Aws.config.update(region: 'us-east-1', access_key_id: 'fake id', secret_access_key: 'fake secret')
  $fake_sqs_service = FakeSQS::TestIntegration.new(database: ":memory#{ENV['TEST_ENV_NUMBER']}:",
                                                   sqs_endpoint: 'localhost', sqs_port: 4568)
  sleep(7) # add a sleep to fix test failures with 'RuntimeError: FakeSQS didn't start in time'
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

  def test_create_async_with_queueing_enabled
    Gatekeeper.set('async_activity_writes', value: true)
    CDO.expects(:activity_queue_url).returns(@queue_url)
    _test_create_async(allow_queueing: true)
  end

  def test_create_async_with_queueing_disabled
    Gatekeeper.set('async_activity_writes', value: false)
    _test_create_async(allow_queueing: false)
  end

  def _test_create_async(allow_queueing:)
    # We need to freeze time, but it needs to be close to reality because otherwise AWS
    # will reject our request when using the real SQS.
    time = Time.now
    activity = student = level = level_source = nil
    Timecop.freeze(time) do
      student = create :student
      level = create :applab
      level_source = LevelSource.find_identical_or_create(level, SecureRandom.uuid)
      activity = Activity.create_async!(level: level, user: student, level_source: level_source)
    end

    # The new activity returned by create_async doesn't have an id yet, but it should
    # have other attributes.
    assert_nil activity.id
    assert_equal time.to_i, activity.created_at.to_i
    assert_equal time.to_i, activity.updated_at.to_i
    assert_equal student.id, activity.user_id
    assert_equal level.id, activity.level_id
    assert_equal level_source.id, activity.level_source_id

    activity_finder = Activity.
        where(user_id: student.id).
        where(level_id: level.id).
        where(level_source_id: level_source.id)

    if allow_queueing
      # Make sure the write hasn't happened yet because it was queued.
      assert_nil activity_finder.first

      # Process the pending messages. Advance time so we can check that updated_at reflects
      # the time of the write.
      new_time = time + 1
      Timecop.freeze(new_time) do
        process_pending_queue_messages(@queue_url, AsyncProgressHandler.new)
      end
    else
      new_time = time
    end

    # Make sure the activity was successfully written.
    saved_activity = activity_finder.first
    assert_not_nil saved_activity.id
    assert_equal time.to_i, saved_activity.created_at.to_i
    assert_equal new_time.to_i, saved_activity.updated_at.to_i
    assert_equal student.id, saved_activity.user_id
    assert_equal level.id, saved_activity.level_id
    assert_equal level_source.id, saved_activity.level_source_id
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
