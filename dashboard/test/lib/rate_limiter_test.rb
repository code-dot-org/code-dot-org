require 'test_helper'
require 'aws-sdk'
require 'fake_sqs/test_integration'
require 'sqs/rate_limiter'
require 'sqs/queue_processor_config'

class RateLimiterTest < ActiveSupport::TestCase
  DCDO_MAX_RATE_KEY = 'test-max-rate'.freeze

  def setup
    @logger = Logger.new(STDOUT)
  end

  def test_rate_limiter_with_default_rate_limit
    limiter = SQS::RateLimiter.new(create_config(max_rate: 10, num_processors: 1, num_workers_per_processor: 1))

    # If the maximum rate is 10 messages/second, we need to wait at least 0.1 seconds after
    # the start of a batch with 1 message to stay below the limit.
    assert_in_delta 0.1, limiter.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.0)

    # Make sure the time taken in processing the batch itself is taken into account
    assert_in_delta 0.05, limiter.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.05)
    assert_in_delta 0.01, limiter.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.09)
    assert_in_delta 0.0, limiter.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.1)
    assert_in_delta 0.0, limiter.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.2)

    # Make sure that as the number of processors and workers goes up that the inter batch delays also increase.
    limiter2 = SQS::RateLimiter.new(create_config(max_rate: 10, num_workers_per_processor: 5, num_processors: 1))
    assert_in_delta 0.5, limiter2.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.0)

    limiter3 = SQS::RateLimiter.new(create_config(max_rate: 10, num_workers_per_processor: 5, num_processors: 2))
    assert_in_delta 1, limiter3.inter_batch_delay(batch_size: 1, elapsed_time_sec: 0.0)
  end

  def test_rate_limiter_with_disabled_rate_limit
    limiter = SQS::RateLimiter.new(create_config(max_rate: 0))  # 0 indicates no limit.
    assert_in_delta 0.0, limiter.inter_batch_delay(batch_size: 100_000_000, elapsed_time_sec: 0.0)
  end

  def test_rate_limiter_with_dcdo_updates
    max_rate_proc = Proc.new { DCDO.get(DCDO_MAX_RATE_KEY, 1) }
    limiter = SQS::RateLimiter.new(create_config(max_rate: 10, max_rate_proc: max_rate_proc))

    # Change the DCDO rate limit and make sure the rate limiter uses the updated values.
    DCDO.set(DCDO_MAX_RATE_KEY, 1)
    assert_in_delta 10.0, limiter.inter_batch_delay(batch_size: 10, elapsed_time_sec: 0.0)

    DCDO.set(DCDO_MAX_RATE_KEY, 2)
    assert_in_delta 5.0, limiter.inter_batch_delay(batch_size: 10, elapsed_time_sec: 0.0)

    # Make sure the rate limiter keeps below the target max rate (but not too far below)
    # for a range of different max_rates and batch sizes.
    limiter = SQS::RateLimiter.new(create_config(max_rate: 1, max_rate_proc: max_rate_proc))
    (10..1000).step(50) do |max_rate|
      DCDO.set(DCDO_MAX_RATE_KEY, max_rate.to_s)
      (1..10).each do |batch_size|
        total_time = limiter.inter_batch_delay(batch_size: batch_size, elapsed_time_sec: 0)
        messages_per_sec = batch_size / total_time
        delta = 0.01
        assert messages_per_sec <= max_rate + delta, "#{batch_size} / #{total_time} = #{messages_per_sec} < #{max_rate}"
        assert messages_per_sec >= max_rate * 0.9
      end
    end
  end

  private

  def create_config(max_rate:, max_rate_proc: nil, num_workers_per_processor: 1, num_processors: 1)
    # Proc for determining the max rate based on DCDO.
    SQS::QueueProcessorConfig.new(
      queue_url: 'http://example.com',
      handler: NoOpHandler.new,
      initial_max_rate: max_rate,
      max_rate_proc: max_rate_proc,
      num_processors: num_processors,
      num_workers_per_processor: num_workers_per_processor,
      logger: @logger)
  end

  # A fake handler that does nothing.
  class NoOpHandler
    def handle(messages)
    end
  end

end
