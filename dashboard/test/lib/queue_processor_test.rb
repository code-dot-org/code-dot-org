# Tests for the SQS::QueueProcessor class. These are run by default against a fake
# SQS instance but can be run against the real SQS by setting the environment variable
# USE_REAL_SQS to 'true'.  If LOG_TO_STDOUT is true, logs to stdout, otherwise uses the
# Rails logger.

require_relative '../../config/environment'
require 'minitest/autorun'
require 'aws-sdk'
require 'securerandom'

require 'sqs/queue_processor'
require 'sqs/queue_processor_config'

# Launch a fake SQS service running on Localhost unless an environment
# variable is set to use the actual SQS service.
unless ENV['USE_REAL_SQS'] == 'true'
  require 'fake_sqs/test_integration'
  Aws.config.update(region: 'us-east-1')
  $fake_sqs_service = FakeSQS::TestIntegration.new(
    database: ':memory:',
    sqs_endpoint: 'localhost',
    sqs_port: 4568,
  )
end

class QueueProcessorTest < ActiveSupport::TestCase
  attr_accessor :logger

  # A test handler that allows simulated failure and records received messages.
  class TestHandler
    # @return {Array<String>}
    attr_reader :messages

    def initialize(logger)
      @logger = logger
      @lock = Mutex.new

      # An array of all of the message bodies received by the handler.
      @bodies = Set.new#<String>

      # A set of message bodies to intentionally fail on.
      @fail_on_message = Set.new#<String>
    end

    def handle(messages)
      @lock.synchronize do
        messages.each do |message|
          body = message.body
          if @fail_on_message.include?(body)
            @fail_on_message.delete(body)
            raise "Fake failure for '#{body}'"
          end
        end
        messages.each do |message|
          @bodies.add(message.body)
        end
        @logger.debug "Handler succeeding on batch of size '#{messages.size}'"
      end
    end

    # Fail the next handle attempt for the given message body.
    def raise_on_next_receipt_of(body)
      @lock.synchronize {
        @logger.debug "Adding fake failure for #{body}"
        @fail_on_message.add(body)
      }
    end

    def received_bodies
      @lock.synchronize {
        @bodies.dup
      }
    end

    def reset_received_bodies
      @lock.synchronize {
        @bodies = Set.new#<String>
      }
    end
  end

  def setup
    # We need to allow http connections from the test to either the real or FAKE SQS service.
    FakeWeb.allow_net_connect = true

    @sqs = Aws::SQS::Client.new
    unless ENV['USE_REAL_SQS'] == 'true'
      $fake_sqs_service.start
      @sqs.config.endpoint = $fake_sqs_service.uri
    end

    @logger = ENV['LOG_TO_STDOUT'] ? Logger.new(STDOUT) : Rails.logger
    @lock = Mutex.new
    @message_id = 0
  end

  def teardown
    unless ENV['USE_REAL_SQS'] == 'true'
      $fake_sqs_service.stop
    end
  end

  def test_queue_processor
    response = @sqs.create_queue(
        queue_name: "test-queue-processor-test",
        # Set a short visibility timeout so that retries will happen quickly.
        attributes: {"VisibilityTimeout" => "1"}
    )
    queue_url = response.queue_url

    # Set up a handler which will fail on the initial delivery attempt
    # for 2 of the bodies so that we can make sure that those bodies are subsequently
    # redelivered and handled.
    handler = TestHandler.new(logger)

    # Configure and start the queue processor.
    sqs_metrics = SQS::Metrics.new
    num_workers = 5
    global_max_messages_per_sec = 25
    config = SQS::QueueProcessorConfig.new(
        queue_url: queue_url,
        handler: handler,
        initial_max_rate: global_max_messages_per_sec,
        dcdo_max_rate_key: 'test-max-rate',
        num_processors: 1,
        num_workers_per_processor: num_workers,
        logger: logger)
    processor = SQS::QueueProcessor.new(config, sqs_metrics)
    processor.start

    # Enqueue 50 messages in batches of size 10.
    batches = 5
    batch_size = 10
    num_messages = batches * batch_size
    expected_bodies = Set.new#<String>
    batches.times do
      batch = []
      batch_size.times do
        item = {id: SecureRandom.uuid, message_body: create_unique_message_body}
        expected_bodies << item[:message_body]
        batch << item
      end
      @sqs.send_message_batch(queue_url: queue_url, entries: batch)
    end

    # Wait for the queue processor to handle all of the messages.
    expected_elapsed_time = num_messages / global_max_messages_per_sec
    start = Time.now.to_f

    while handler.received_bodies.proper_subset?(expected_bodies)
      processor.assert_workers_alive_for_test
      sleep 2
    end

    # Make sure that the metrics recorded at least the expected number of successes and failures.
    # (The queue is allowed to deliver a message more than once.)
    assert_operator sqs_metrics.successes.value, :>=, num_messages
    assert_equal 0, sqs_metrics.failures.value

    # Make sure that the handler received each of expected messages.
    missed_bodies = expected_bodies.subtract(handler.received_bodies)
    assert_empty missed_bodies, "Failed to receive the following bodies: #{missed_bodies}"

    # Now make sure that if the handler throws on the initial delivery of a message
    # that the system will redeliver it and allow the handler to receive it.
    handler.reset_received_bodies
    initially_failing_body = 'initially_failing'
    handler.raise_on_next_receipt_of(initially_failing_body)

    @sqs.send_message(queue_url: queue_url, message_body: initially_failing_body)
    while not handler.received_bodies.include?(initially_failing_body)
      sleep 2
    end

    # Make sure the metrics capture the initial failure.
    assert sqs_metrics.failures.value >= 1

    processor.stop
  end

  def create_unique_message_body
    @lock.synchronize {
      @message_id += 1
      @message_id.to_s
    }
  end
end
