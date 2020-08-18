require 'concurrent/scheduled_task'
require 'concurrent/utility/native_integer'
require 'honeybadger/ruby'
require 'monitor'

module Cdo
  # Abstract class to handle asynchronous-buffering and periodic-flushing using a thread pool.
  # This class is content-agnostic, buffering objects in memory through #buffer(object).
  # Subclasses implement #flush(objects), which will be called periodically as the buffer is flushed in batches.
  #
  # Because objects are stored in memory, the buffer can synchronously flush when the Ruby process exits.
  class Buffer
    MAX_INT = Concurrent::Utility::NativeInteger::MAX_VALUE

    attr_accessor :log

    # @param [Integer] batch_count    Maximum number of objects in a buffered batch.
    # @param [Integer] batch_size     Maximum total payload size in a buffered batch.
    # @param [Float] max_interval     Seconds after the first buffered item before a flush will occur.
    # @param [Float] min_interval     Seconds after the previous flush before a flush is allowed to occur.
    #                                 Useful for rate-throttling.
    # @param [Float] wait_at_exit     Seconds to wait at exit for flushing to complete.
    def initialize(
      batch_count:  MAX_INT,
      batch_size:   MAX_INT,
      max_interval: Float::INFINITY,
      min_interval: 0.0,
      wait_at_exit: nil,
      log: CDO.log
    )
      @batch_count = batch_count
      @batch_size   = batch_size
      @max_interval = max_interval
      @min_interval = min_interval
      @log = log

      @task = RescheduledTask.new(0.0, &method(:flush_batch)).
        with_observer(&method(:schedule_flush))

      @buffer = []
      @buffer.extend(MonitorMixin)

      @ruby_pid = $$
      if wait_at_exit
        at_exit {flush!(wait_at_exit)}
      end
    end

    # Flush a batch of buffered objects.
    # Implement in subclass.
    # @param [Array<Object>] objects
    def flush(objects)
    end

    # Calculate the total size of a batch of objects.
    # Override in subclass when using 'batch_size' limit.
    # @param [Array<Object>] objects
    # @return [Numeric] size of objects
    def size(objects)
      1
    end

    # Add an object to the buffer.
    # @raise [ArgumentError] when the object exceeds batch size
    # @param [Object] object
    def buffer(object)
      reset_if_forked
      if (size = size([object])) > @batch_size
        raise ArgumentError, "Object size (#{size}) exceeds batch size (#{@batch_size})"
      end
      @buffer.synchronize do
        @buffer << BufferObject.new(object, now)
        schedule_flush
      end
    end

    # Flush existing buffered objects.
    # @param [Float] timeout seconds to wait for buffered objects to finish flushing.
    def flush!(timeout = Float::INFINITY)
      reset_if_forked
      timeout_at = now + timeout
      until (wait = timeout_at - now) < 0 || @buffer.empty?
        @log.info "Flushing #{self.class}, waiting #{wait} seconds"
        schedule_flush(true)
        # Block until the pending flush is completed or timeout is reached.
        @task.wait(wait.infinite? ? nil : wait)
      end
    end

    private

    # Extend ScheduledTask to support rescheduling after being executed.
    class RescheduledTask < Concurrent::ScheduledTask
      # Reschedule the task using the given delay and the current time.
      # A task can be reset from any state except `:processing`.
      #
      # @yieldreturn [Float] number of seconds to wait for before executing the task.
      #   Passed as a block instead of an argument for thread-safety.
      def reschedule
        synchronize do
          delay = yield
          if compare_and_set_state(:pending, :fulfilled, :rejected, :unscheduled)
            event.reset
            ns_schedule(delay)
          else
            super(delay)
          end
        end
      end

      # Don't delete observers after notifying so they can be reused.
      def notify_observers(*)
        observers.notify_observers
      end
    end

    # Track time each object was added to the buffer.
    BufferObject = Struct.new(:object, :added_at)

    def now
      Concurrent.monotonic_time
    end

    # Schedule a flush in the future when the next batch is ready.
    # @param [Boolean] force flush batch even if not full.
    def schedule_flush(force = false)
      @buffer.synchronize do
        @task.reschedule {batch_ready(force)} unless @buffer.empty?
      end
    end

    # Determine when the next batch of existing buffered objects will be ready to be flushed.
    # @param [Boolean] force flush batch even if not full.
    # @return [Float] Seconds until the next batch can be flushed.
    def batch_ready(force)
      raise ArgumentError.new('Empty buffer') if @buffer.empty?

      # Wait until max_interval has passed since the earliest object to flush a non-full batch.
      earliest = @buffer.first.added_at
      wait = @max_interval - (now - earliest)

      # Flush now if the batch is full or when force flushing.
      wait = 0.0 if force ||
        size(@buffer.map(&:object)) >= @batch_size ||
        @buffer.length >= @batch_count

      # Wait until min_interval has passed since the last flush.
      min_delay = @min_interval - (now - @last_flush.to_f)

      [0.0, wait, min_delay].max.to_f
    end

    # Flush a batch of objects from the buffer.
    def flush_batch
      @last_flush = now
      flush(take_batch.map(&:object))
    rescue => e
      Honeybadger.notify(e)
    end

    # Take a single batch of objects from the buffer.
    def take_batch
      batch = []
      @buffer.synchronize do
        batch << @buffer.shift until
          @buffer.empty? ||
            batch.length >= @batch_count ||
            size((batch + [@buffer.first]).map(&:object)) > @batch_size
      end
      batch
    end

    def reset_if_forked
      @buffer.synchronize do
        if $$ != @ruby_pid
          @buffer.clear
          @task.cancel
          @ruby_pid = $$
        end
      end
    end
  end
end
