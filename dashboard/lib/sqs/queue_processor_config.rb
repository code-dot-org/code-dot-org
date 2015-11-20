require_relative '../../../lib/dynamic_config/dcdo'

module SQS

  # Immutable configuration for a queue processor.
  class QueueProcessorConfig
    attr_reader :queue_uri, :handler, :num_workers_per_processor, :num_processors
    attr_reader :initial_max_rate, :dcdo_max_rate_key
    attr_reader :max_wait_time, :max_batch_size

    # @param [String] queue_uri URI to the SQS queue.
    # @param [Integer] initial_max_rate Initial max rate (in messages per second) or 0 for no limit.
    # @param [String] dcdo_max_rate_key DCDO key for the dynamic max rate.
    # @param [Logger] logger
    # @param [Integer] num_processors The number of processor instances.
    # @param [Integer] num_workers_per_processor How many worker threads for each processor.
    # @param [Integer] max_wait_time The maximum time for a long poll to wait for messages.
    # @param [Integer] max_batch_size The maximum messages per batch. Must be <= 10.
    def initialize(queue_uri:,
                   handler:,
                   initial_max_rate:,
                   dcdo_max_rate_key:,
                   num_processors:,
                   num_workers_per_processor:,
                   logger: Logger.new(STDOUT),
                   max_wait_time: 10,
                   max_batch_size: 10)

      raise ArgumentError, 'max batch size must be <= 10' unless max_batch_size <= 10 and max_batch_size > 0
      raise ArgumentError, 'num_workers_per_processor must be positive' unless num_workers_per_processor > 0
      raise ArgumentError, 'max_wait_time must be positive' unless max_wait_time > 0
      raise ArgumentError, 'initial_max_rate must be non-negative' unless initial_max_rate >= 0

      @queue_uri = check_not_nil(queue_uri)
      @handler = check_not_nil(handler)
      @initial_max_rate = [0, initial_max_rate].max
      @dcdo_max_rate_key = check_not_nil(dcdo_max_rate_key)
      @num_processors = check_not_nil(num_processors)
      @num_workers_per_processor = check_not_nil(num_workers_per_processor)
      @logger = check_not_nil(logger)
      @max_wait_time = check_not_nil(max_wait_time)
      @max_batch_size = check_not_nil(max_batch_size)
    end

    # The current maximum messages per second across all processor workers, or
    # 0 for no limit.
    # @return [Integer]
    def global_max_rate
      if dcdo_max_rate_key
        DCDO.get(dcdo_max_rate_key, initial_max_rate).to_i
      else
        initial_max_rate
      end
    end

    # The current maximum messages per second for a given processor.
    # @return [Integer]
    def processor_max_rate
      global_max_rate / num_processors
    end

    # The current maximum messages per second for a given worker.
    # @return [Integer]
    def worker_max_rate
      processor_max_rate / num_workers_per_processor
    end

    def check_not_nil(value)
      raise ArgumentError if value.nil?
      value
    end
  end
end
