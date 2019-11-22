require 'concurrent/async'
require 'concurrent/scheduled_task'
require 'honeybadger/ruby'

module Cdo
  # Abstract class to handle asynchronous-buffering and periodic-flushing using a thread pool.
  # This class is content-agnostic, buffering event objects in memory through #buffer(event, size).
  # Subclasses implement #flush(events), which will be called periodically as the buffer is flushed in batches.
  #
  # Because events are stored in memory, the buffer will be synchronously flushed when the Ruby process exits.
  class Buffer
    include Concurrent::Async

    # @param [Integer] batch_events   Maximum number of events in a buffered batch.
    # @param [Integer] batch_size     Maximum total payload 'size', based on the size parameter passed to #buffer,
    #                                 in a buffered batch.
    # @param [Integer] batch_interval Number of seconds after the first buffered item when the batch will flush.
    # @param [Integer] min_interval   Number of seconds after the previous flush before a flush will occur.
    #                                 Useful for rate-throttling.
    def initialize(
      batch_events: nil,
      batch_size: nil,
      batch_interval: nil,
      min_interval: nil
    )
      super()
      @batch_events = batch_events
      @batch_size = batch_size
      @batch_interval = batch_interval
      @min_interval = min_interval

      @events = Batch.new
      at_exit {flush!}
    end

    # Asynchronously adds an event to the buffer.
    # @param [Object] event
    # @param [Integer] size
    def buffer(event, size = nil)
      size ||= event.is_a?(String) ? event.bytesize : 1
      raise 'Event exceeds batch size' if @batch_size&.<(size)
      @events << [event, size]
      async.try_flush
    end

    # Implement in subclass.
    # @param [Array<Object>] events
    def flush(events)
    end

    # Synchronously flushes all events in batches until the buffer is empty.
    def flush!
      sleep @min_interval.to_f while await.try_flush(true).value
    end

    # Try to flush a batch of events from the buffer.
    # Should be called through the thread pool (`async.try_flush` / `await.try_flush`).
    # @param [Boolean] force flush a batch of events even if the buffer isn't ready.
    # @return [Float] number of seconds until next batch can be flushed, or `nil` if the buffer is empty.
    def try_flush(force = false)
      return nil if @events.empty?

      if force || (wait = batch_ready)&.zero?
        @last_flush = Concurrent.monotonic_time
        flush(get_batch)
        # Try to flush another batch if one is ready.
        try_flush
      else
        flush_in(wait)
        wait
      end
    rescue => e
      Honeybadger.notify(e)
      raise
    end

    private

    # Determine whether a batch of events is ready to be flushed.
    # @return [Float] Number of seconds until a batch can be flushed, zero if the batch is ready now,
    #                 or nil if the batch can't be flushed.
    def batch_ready
      now = Concurrent.monotonic_time

      # Wait if batch isn't full or old enough.
      batch_age = now - @events.earliest
      unless @batch_size&.<=(@events.size) ||
        @batch_events&.<=(@events.length) ||
        @batch_interval&.<=(batch_age)

        return @batch_interval && (@batch_interval - batch_age)
      end

      # Wait if last flush was too recent.
      flush_age = now - @last_flush.to_f
      if @min_interval&.>(flush_age)
        return @min_interval - flush_age
      end

      0.0
    end

    # Get a single batch of events based on configured size.
    def get_batch
      batch = Batch.new
      batch << @events.shift until
        @events.empty? ||
        @batch_events&.<=(batch.length) ||
        @batch_size&.<(batch.size + @events.first[1])
      batch.events
    end

    # Schedule a future call to #try_flush.
    # @param [Float] seconds number of seconds to wait.
    def flush_in(seconds)
      return unless seconds
      if @scheduled_task&.state == :pending
        @scheduled_task.reschedule(seconds)
      else
        @scheduled_task = Concurrent::ScheduledTask.execute(seconds, &method(:try_flush))
      end
    end

    # Helper class to track total size and earliest element in a batch of events.
    class Batch < Array
      attr_reader :size

      def initialize
        super
        @size = 0
      end

      def events
        map(&:first)
      end

      # Each item is an Array containing 2-3 elements (event, size, created_at). Sets created_at if not already present.
      def <<(item)
        raise "Invalid Batch item: #{item}" unless item.is_a?(Array) && item.length >= 2
        item.push(Concurrent.monotonic_time) if item.length < 3
        super(item)
        @size += item[1]
      end

      def shift
        super.tap {|item| @size -= item[1]}
      end

      def earliest
        first[2]
      end
    end
  end
end
