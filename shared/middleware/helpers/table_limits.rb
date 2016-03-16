# A class for maintaining approximate row counts for a table.
# The implementation uses Redis to set, get, and atomically update the estimated
# count. The count will revert to zero if Redis crashes or becomes unavailable.
# However, if the caller can correct the count by calling set_approximate_row_count
# when an approximate value is known (e.g. after a the client reads the full table).
class TableLimits

  def initialize(redis, endpoint, channel_id, table)
    @redis = redis
    @row_count_key = "#{endpoint}.#{channel_id}.#{table}.approx_row_count"
  end

  # Returns the approximate number of rows in table, or -1 if Redis unavailable.
  # The underlying implementation uses Redis so the estimate may be an underestimate
  # if the Redis instance restarts or is unavailable.
  def get_approximate_row_count
    (@redis.get(@row_count_key) || 0).to_i
  rescue IOError
    -1
  end

  def set_approximate_row_count(count)
    @redis.set(@row_count_key, count)
  rescue IOError
    # Swallow IO errors since the count is best effort only.
    0
  end

  # Increments the approximate number of rows in `table`.
  def increment_row_count
    @redis.incr(@row_count_key)
  rescue IOError
    # Swallow IO errors since the count is best effort only.
    0
  end

  # Decrements the approximate number of rows in `table`.
  def decrement_row_count
    count = @redis.decr(@row_count_key)
    # Don't allow the count to become negative.
    if count < 0
      count = 0
      set_approximate_row_count(0)
    end
    count
  rescue IOError
    # Swallow IO errors since the count is best effort only.
    0
  end
end
