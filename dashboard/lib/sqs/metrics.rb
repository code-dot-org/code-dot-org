module SQS
  # A collection of Counters for the queue processor.
  class Metrics
    attr_accessor :successes, :failures

    def initialize
      @successes = Counter.new
      @failures = Counter.new
    end

    def reset
      lock.synchronize do
        @successes.reset
        @failures.reset
      end
    end

    def as_json(options = nil)
      {'successes' => @successes.value, 'failures' => @failures.value}
    end

    def to_s
      as_json.to_json
    end
  end

  # A thread safe counter.
  class Counter
    attr_reader :value

    def initialize
      @lock = Mutex.new
      reset
    end

    def increment(added_value)
      @lock.synchronize do
        @value += added_value
      end
    end

    def set(value)
      @lock.synchronize do
        @value = value
      end
    end

    def reset
      @lock.synchronize do
        @value = 0
      end
    end

    def to_s
      value
    end
  end
end
