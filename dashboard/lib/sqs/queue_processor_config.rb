require_relative '../../../lib/dynamic_config/dcdo'

module SQS

  # Immutable configuration for a queue processor.
  class QueueProcessorConfig
    attr_reader :queue_uri, :handler, :initial_max_rate, :num_workers, :max_wait_time, :max_batch_size, :dcdo_max_rate_key

    # @param [String] queue_uri
    # @param [Integer] num_workers
    # @param [Integer] initial_max_rate Initial max rate (in messages per second) or 0 for no limit.
    # @param [String] dcdo_max_rate_key
    def initialize(queue_uri:,
                   handler:,
                   num_workers:,
                   initial_max_rate:,
                   logger:,
                   max_wait_time: 10,
                   max_batch_size: 10,
                   dcdo_max_rate_key:)

      raise ArgumentError, 'max batch size must be <= 10' unless max_batch_size <= 10 and max_batch_size > 0
      raise ArgumentError, 'num_workers must be positve' unless num_workers > 0
      raise ArgumentError, 'max_wait_time must be positive' unless max_wait_time > 0
      raise ArgumentError, 'initial_max_rate must be non-negative' unless initial_max_rate >= 0

      @queue_uri = check_not_nil(queue_uri)
      @handler = check_not_nil(handler)
      @num_workers = check_not_nil(num_workers)
      @initial_max_rate = [0, initial_max_rate].max
      @logger = check_not_nil(logger)
      @max_wait_time = check_not_nil(max_wait_time)
      @max_batch_size = check_not_nil(max_batch_size)
      @dcdo_max_rate_key = check_not_nil(dcdo_max_rate_key)
    end

    # The current maximum messages per second across all processor workers, or
    # 0 for not limit.
    # @return [Float]
    def processor_max_rate
      if dcdo_max_rate_key
        DCDO.get(dcdo_max_rate_key, initial_max_rate).to_i
      else
        initial_max_rate
      end
    end

    # The current maximum messages per second for a given worker.
    # @return [Float]
    def worker_max_rate
      processor_max_rate / num_workers
    end

    def check_not_nil(value)
      raise ArgumentError if value.nil?
      value
    end
  end
end
