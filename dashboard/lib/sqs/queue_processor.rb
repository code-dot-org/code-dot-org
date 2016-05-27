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
require_relative 'messages_handler'
require_relative 'metrics'
require_relative 'queue_processor_config'
require_relative 'rate_limiter'

module SQS

  # A class for processing an SQS queue using a pool of worker threads, each of which
  # does long polling against the queue.
  class QueueProcessor
    attr_reader :state, :logger, :config, :metrics, :handler

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
      logger.info "Polling on #{@config.queue_url}"

      (1..@config.num_workers_per_processor).each do |i|
        worker_thread = Thread.new do
          Thread.current[:name] = "SQS worker #{i}"
          rate_limiter = RateLimiter.new(@config)
          poller = Aws::SQS::QueuePoller.new(@config.queue_url)

          # Break out of the polling loop when we leave the running state.
          poller.before_request do |_stats|
            throw :stop_polling if @state != :running
          end

          # Wrap the polling loop in an outer exception handler and while loop,
          # to prevent an unanticipated exception from terminating the thread.
          while @state == :running
            begin
              # Long-poll for messages and handle them until we're told to stop.
              poller.poll(max_number_of_messages: 10, wait_time_seconds: 10, visibility_timeout: 5) do |sqs_messages|
                batch_failed = false
                messages = sqs_messages.map {|sqs_message|
                  SQS::Message.new(sqs_message.body)
                }
                batch_size = sqs_messages.size

                start_time_sec = Time.now.to_f
                begin
                  # Use with_connection to return the thread to pool when the operation is done.
                  ActiveRecord::Base.connection_pool.with_connection do |_conn|
                    @handler.handle(messages)
                  end
                  @metrics.successes.increment(batch_size)
                rescue Exception => exception
                  @logger.warn "Failed on batch of size #{batch_size}"
                  @metrics.failures.increment(batch_size)
                  batch_failed = true
                  @logger.warn exception.message
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
    # up to max_wait_time seconds). Requires that run has been called.
    def stop
      assert_state :running, "Can't stop in state #{@state}, must be :running"
      @state = :stopping
      @worker_threads.each(&:join)
      @state = :stopped
    end

    def assert_workers_alive_for_test
      @worker_threads.each do |thread|
        raise "Unexpected thread death" unless thread.alive?
      end
    end

    # Asserts that the current state is `desired_state`.
    def assert_state(desired_state, error_message)
      raise error_message unless @state == desired_state
    end
  end
end
