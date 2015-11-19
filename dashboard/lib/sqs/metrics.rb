module SQS

  # A collection of Counters for the queue processor.
  class Metrics
    attr_accessor :success, :failures

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
  end

  # A thread safe counter.
  class Counter
    lock = Mutex.new

    def initialize
      reset
    end

    def value
      @value
    end

    def increment(added_value)
      lock.synchronize {
        @value += added_value
      }
    end

    def set(value)
      lock.synchronize {
        @value = value
      }
    end

    def reset
      lock.synchronize {
        @value = 0
      }
    end
  end

end
