module SQS
  # A collection of Counters for the queue processor.
  class Metrics
    attr_accessor :successes, :failures

    def initialize
      @successes = Counter.new
      @failures = Counter.new
    end

    def reset
      lock.synchronize {
        @successes.reset
        @failures.reset
      }
    end

    def as_json(_options = nil)
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
      @lock.synchronize {
        @value += added_value
      }
    end

    def set(value)
      @lock.synchronize {
        @value = value
      }
    end

    def reset
      @lock.synchronize {
        @value = 0
      }
    end

    def to_s
      value
    end
  end
end
