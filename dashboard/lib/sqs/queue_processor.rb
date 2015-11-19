# A multithreaded Amazon SQS queue processor that supports throttling and batched operations.
#
# This is an intentionally minimal and SQS-specific implementation to meet the
# needs of queueing high scale database writes in SQS, for which throttled and
# batched process are essential.
#
# Why a custom solution? For our general asynchronous job queueing neds, ActiveJob
# and Shoryuken could be good choices, but neither of these satisfy our
# particular requirements for high scale processing:
# - The existing ActiveJob worker interface does not support batching.
# - Shoryuken's custom API supports batching but not throttling, and the
#   implementation has some concerning details (e.g. busy waiting) for high scale
#   usage. Given the complexity of the code base, we decided not to try to fork it
#   to add the needed features.

require 'aws-sdk'
require 'logger'
require 'thread'
require_relative 'metrics'
require_relative 'queue_processor_config'
require_relative 'rate_limiter'

module SQS

  # A class for processing an SQS queue using a pool of worker threads, each of which
  # does long polling and runs a throttled handler.
  class QueueProcessor
    # @param [SQS::QueueProcessorConfig] config
    # @param [SQS::Metrics] metrics
    # @param [Logger] logger
    def initialize(config, metrics, logger)
      raise ArgumentError if config.nil? || metrics.nil? || logger.nil?

      @state = :initialized
      @config = config
      @metrics = metrics
      @logger = logger
    end

    # Begin processing messages. Must be called exactly once after initialize and before
    # stop is called.
    def run
      unless @state == :initialized
        raise "Illegal state #{@state}, must be :initialized."
      end
      @state = :running

      @worker_threads = []
      config.num_workers.times do
        @worker_theads << Thread.new {
          rate_limiter = RateLimiter.new(@config)
          poller = Aws::SQS::QueuePoller.new(@config.queue_url,
                                             wait_time_seconds: @config.wait_time_seconds)

          # Break out of the polling loop when `keep_running?` is no longer true
          poller.before_request do |stats|
            throw :stop_polling if @state == :stopped
          end

          # Long-poll for messages and handle them until we're told to stop.
          poller.poll(max_number_of_messages: config.max_batch_size) do |messages|
            batch_failed = false

            start_time_sec = Time.now.to_f
            begin
              handler.handle(messages)
              @metrics.successes.increment(messages.size)
            rescue Exception => e
              # Skip delete so that the batch will be retried
              @logger.warn
              @metrics.increment_f(messages.size)
              batch_failed = true
            end
            elapsed_time_sec = Time.now.to_f - start_time_sec

            # Sleep for a bit to make sure we stay below the configured maximum rate. Note that we
            # pause even if the handler failed because we don't want to exceed the configured rate
            # even when failures are occuring.
            delay = rate_limiter.compute_inter_batch_delay(messages.size, elapsed_time_sec)
            sleep(delay) if delay > 0

            throw :skip_delete if failed
          end
        }
      end
    end

    # Request each of the worker threads to stop and block until they terminate (which could take
    # ~max_wait_time seconds). Requires that run has been called.
    def stop
      unless @state == :running
        raise "Illegal state #{@state}, must be :running."
      end
      @state = :stopped
      @worker_threads.each do |thread|
        thread.join
      end
    end

  end
end
