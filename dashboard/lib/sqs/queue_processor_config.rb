require 'dynamic_config/dcdo'

module SQS

  # Immutable configuration for a queue processor.
  class QueueProcessorConfig
    attr_reader :queue_url, :handler, :num_workers_per_processor, :num_processors, :logger
    attr_reader :initial_max_rate, :dcdo_max_rate_key

    # @param [String] queue_url URI to the SQS queue.
    # @param [Integer] initial_max_rate Initial max rate (in messages per second) or 0 for no limit.
    # @param [String] dcdo_max_rate_key DCDO key for the dynamic max rate.
    # @param [Logger] logger
    # @param [Integer] num_processors The number of processor instances.
    # @param [Integer] num_workers_per_processor How many worker threads for each processor.
    def initialize(queue_url:,
                   handler:,
                   initial_max_rate:,
                   dcdo_max_rate_key:,
                   num_processors:,
                   num_workers_per_processor:,
                   logger: Logger.new(STDOUT))

      raise ArgumentError, 'num_workers_per_processor must be positive' unless num_workers_per_processor > 0
      raise ArgumentError, 'initial_max_rate must be non-negative' unless initial_max_rate >= 0

      @queue_url = check_not_nil(queue_url)
      @handler = check_not_nil(handler)
      @initial_max_rate = [0, initial_max_rate].max
      @dcdo_max_rate_key = check_not_nil(dcdo_max_rate_key)
      @num_processors = check_not_nil(num_processors)
      @num_workers_per_processor = check_not_nil(num_workers_per_processor)
      @logger = check_not_nil(logger)
    end

    # The current maximum messages per second across all processor workers, or
    # 0 for no limit.
    # @return [Float]
    def global_max_rate
      if dcdo_max_rate_key
        DCDO.get(dcdo_max_rate_key, initial_max_rate).to_f
      else
        initial_max_rate
      end
    end

    # The current maximum messages per second for a given processor.
    # @return [Float]
    def processor_max_rate
      global_max_rate.to_f / num_processors
    end

    # The current maximum messages per second for a given worker.
    # @return [Float]
    def worker_max_rate
      processor_max_rate / num_workers_per_processor
    end

    def check_not_nil(value)
      raise ArgumentError if value.nil?
      value
    end
  end
end
