require 'dynamic_config/dcdo'

module SQS

  # Immutable configuration for a queue processor.
  class QueueProcessorConfig
    attr_reader :queue_url, :handler, :num_workers_per_processor, :num_processors, :logger
    attr_reader :initial_max_rate, :max_rate_proc, :name

    # @param [String] queue_url URI to the SQS queue.
    # @param [Integer] initial_max_rate Initial max rate (in messages per second) or 0 for no limit.
    # @param [String] max_rate_proc A proc for returning the current max rate, or nil to always use
    #     the initial rate.
    # @param [Logger] logger
    # @param [Integer] num_processors The number of processor instances.
    # @param [Integer] num_workers_per_processor How many worker threads for each processor.
    def initialize(queue_url:,
                   handler:,
                   initial_max_rate:,
                   num_processors:,
                   num_workers_per_processor:,
                   name: nil,
                   max_rate_proc: nil,
                   logger: Logger.new(STDOUT))
      raise ArgumentError, 'num_workers_per_processor must be positive' unless num_workers_per_processor > 0
      raise ArgumentError, 'initial_max_rate must be non-negative' unless initial_max_rate >= 0

      @queue_url = check_not_nil(queue_url)
      @handler = check_not_nil(handler)
      @initial_max_rate = [0, initial_max_rate].max
      @max_rate_proc = max_rate_proc
      @num_processors = check_not_nil(num_processors)
      @num_workers_per_processor = check_not_nil(num_workers_per_processor)
      @name = name
      @logger = check_not_nil(logger)
    end

    # Creates a config from an options hash.
    def self.create(options)
      SQS::QueueProcessorConfig.new(
          queue_url: options['queue_url'],
          handler: options['handler_class'].constantize.new,
          num_processors: options['num_processors'] || 1,
          num_workers_per_processor: options['num_workers_per_processor'] || 10,
          initial_max_rate: options['initial_max_rate'] || 5000,
          max_rate_proc: options['max_rate_proc'],
          name: options['name'])
    end

    def self.create_configs_from_json(json)
      processors_options = JSON.parse(json)['queues']
      processors_options.map do |options|
        define_proc_for_dcdo_max_rate_key(options)
        SQS::QueueProcessorConfig.create(options)
      end
    end

    def self.define_proc_for_dcdo_max_rate_key(processor_options)
      dcdo_max_rate_key = processor_options['dcdo_max_rate_key']
      if dcdo_max_rate_key
        initial_max_rate = processor_options['initial_max_rate']
        processor_options['max_rate_proc'] = Proc.new {
          DCDO.get(dcdo_max_rate_key, initial_max_rate).to_i
        }
      end
    end

    # The current maximum messages per second across all processor workers, or
    # 0 for no limit.
    # @return [Float]
    def global_max_rate
      if max_rate_proc
        max_rate_proc.call || initial_max_rate
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
