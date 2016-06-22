module SQS
  # A rate limiter for computing the delay between processing message batches,
  # such that the average rate of message processing remains below the current
  # rate limit configured in the config
  #
  # Design note: This is factored out a class for testability and to permit more
  # sophisticated stateful implementations in the future.  However the current
  # implementation is stateless and considers only the "instantaneous" rate of
  # each batch rather than smoothing the rate across a window of recent batches.
  # This is viable for spiky traffic only because the maximum size of an SQS
  # batch is only 10 messages, which has the effect of smoothing out spikes in
  # message rate.
  class RateLimiter
    # @param [SQS::QueueProcessorConfig] config
    def initialize(config)
      @config = config
    end

    # Computes the inter-batch delay in seconds needed for a worker to remain
    # below the configured maximum rate of message processing.
    #
    # @param [Integer] batch_size Size of the current batch.
    # @param [Float] elapsed_time_sec Elapsed time in seconds processing the batch.
    # @return [Float] delay in seconds.
    def inter_batch_delay(batch_size:, elapsed_time_sec:)
      worker_max_rate = @config.worker_max_rate
      return 0 if worker_max_rate <= 0   # 0 indicates no limit
      [0, (batch_size.to_f / worker_max_rate) - elapsed_time_sec].max
    end
  end
end
