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
    def initialize(config, metrics)
      raise ArgumentError if config.nil? || metrics.nil?
      @state = :initialized
      @config = config
      @metrics = metrics
      @logger = config.logger
      @handler = config.handler
    end

    # Begin processing messages. Must be called exactly once after initialize and before
    # stop is called. This does not block and returns immediately after starting the worker
    # thread, so be sure to make to keep the process running.
    def start
      assert_state :initialized, "Can't run in state #{@state}, must be :initialized"
      @state = :running

      # Kill the process if a thread dies with an unhandled exception. We attempt to catch all possible
      # exceptions, so this shouldn't happen.
      Thread.abort_on_exception = true
      @worker_threads = []

      (1..@config.num_workers_per_processor).each do |i|
        worker_thread = Thread.new do
          Thread.current[:name] = "SQS worker #{i}"
          rate_limiter = RateLimiter.new(@config)
          poller = Aws::SQS::QueuePoller.new(@config.queue_url,
                                             wait_time_seconds: @config.max_wait_time)

          # Break out of the polling loop when we leave the running state.
          poller.before_request do |stats|
            throw :stop_polling if @state != :running
          end

          while @state == :running
            begin
              # Long-poll for messages and handle them until we're told to stop.
              poller.poll(max_number_of_messages: @config.max_batch_size) do |messages|
                batch_failed = false
                batch_size = messages.size
                bodies = messages.map(&:body)

                start_time_sec = Time.now.to_f
                begin
                  @handler.handle(bodies)
                  @metrics.successes.increment(batch_size)
                rescue Exception => exception
                  @metrics.failures.increment(batch_size)
                  batch_failed = true
                  @logger.warn "Failed on batch of size #{batch_size}"
                  @logger.warn exception
                end
                # Sleep for a bit to make sure we stay below the configured maximum rate. Note that we
                # pause even if the handler failed because we don't want to exceed the configured rate
                # even when failures are occuring.
                delay = rate_limiter.inter_batch_delay(
                    batch_size: batch_size, elapsed_time_sec: Time.now.to_f - start_time_sec)
                sleep(delay) if delay > 0

                # Tell SQS to resend the batch if it failed.
                throw :skip_delete if batch_failed
              end
            rescue => exception
              @logger.warn exception
            end
          end # while
        end
        @worker_threads << worker_thread
      end
    end

    # Request each of the worker threads to stop and block until they terminate (which could take
    # ~max_wait_time seconds). Requires that run has been called.
    def stop
      assert_state :running, "Can't stop in state #{@state}, must be :running"
      @state = :stopping
      @worker_threads.each do |thread|
        thread.join
      end
      @state = :stopped
    end

    def assert_state(desired_state, error_message)
      raise error_message unless @state == desired_state
    end

  end
end
