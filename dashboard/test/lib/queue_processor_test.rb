require 'test_helper'
require 'minitest/autorun'
require 'aws-sdk'
require 'fake_sqs/test_integration'

require 'sqs/queue_processor'
require 'sqs/queue_processor_config'
require 'pp'
require 'set'

Aws.config.update(region: 'us-east-1')

$fake_sqs_service = FakeSQS::TestIntegration.new(
  database: ':memory:',
  sqs_endpoint: 'localhost',
  sqs_port: 4568,
)

class QueueProcessorTest < ActiveSupport::TestCase


  # A fake handler that remembers the items it handles
  class FakeHandler
    # @return {Array<String>}
    attr_accessor :messages

    def initialize
      @messages = []
    end

    def handle(messages)
      @messages += messages
    end
  end

  def setup
    $fake_sqs_service.start
    @client = Aws::SQS::Client.new
    @client.config.endpoint = $fake_sqs_service.uri

    response = @client.create_queue(queue_name: 'test-queue')
    @queue_uri = response.queue_url
  end

  def teardown
    $fake_sqs_service.stop
  end

  def test_create_queue
    response = @client.create_queue(queue_name: 'test-queue')
    url = response.queue_url

    @client.send_message(queue_url: url, message_body: 'hello')

    response = @client.receive_message(queue_url: url)

    assert_equal 1, response.messages.size
    assert_equal 'hello', response.messages[0].body
  end

  def test_rate_limiter_with_default_rate_limit
    logger = Logger.new(STDOUT)

    max_rate = 10
    dcdo_key = nil  # Don't use DCDO for this test.
    config = SQS::QueueProcessorConfig.new(
      queue_uri: @queue_uri, initial_max_rate: max_rate, dcdo_max_ops_key: dcdo_key,
      handler: FakeHandler.new, num_workers: 1, logger: logger)

    limiter = SQS::RateLimiter.new(config)

    # If the maximum rate is 10 messages/second, we need to wait at least 0.1 seconds after
    # the start of a batch with 1 message to stay below the limit.
    assert_in_delta 0.1, limiter.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.0)

    # Make sure the time taken in processing the batch itself is taken into account
    assert_in_delta 0.01, limiter.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.09)
    assert_in_delta 0.0, limiter.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.1)

    # Make sure the delay doesn't go negative.
    assert_in_delta 0.0, limiter.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.2)
  end


  def test_rate_limiter_with_dcdo_updates
    logger = Logger.new(STDOUT)

    max_rate = 10
    dcdo_key = 'test_max_ops'

    config = SQS::QueueProcessorConfig.new(
      queue_uri: @queue_uri, initial_max_rate: max_rate, dcdo_max_ops_key: dcdo_key,
      handler: FakeHandler.new, num_workers: 1, logger: logger)

    limiter = SQS::RateLimiter.new(config)

    # If the DCDO max rate is not explicitly set we should use the default.
    assert_in_delta 0.5, limiter.inter_batch_delay(batch_size: 5, elapsed_time_sec: 0.0)

    # Change the DCDO rate limit to 1 message per second and make sure the rate limiter
    # uses the updated limit.
    DCDO.set(dcdo_key, 1)
    assert_in_delta 10.0, limiter.inter_batch_delay(batch_size: 10, elapsed_time_sec: 0.0)

    DCDO.set(dcdo_key, 2)
    assert_in_delta 5.0, limiter.inter_batch_delay(batch_size: 10, elapsed_time_sec: 0.0)
  end

end
