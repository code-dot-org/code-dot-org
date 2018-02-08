# Feature backport from Rails 5.1.0:
# https://github.com/rails/rails/pull/28083
module ConnectionPoolLockThread
  def initialize(spec)
    super(spec)
    @lock_thread = false
  end

  def lock_thread=(lock_thread)
    @lock_thread = lock_thread ? Thread.current : nil
  end

  def connection(owner_thread = @lock_thread || Thread.current)
    @thread_cached_conns[connection_cache_key(owner_thread)] ||= checkout
  end

  def release_connection(owner_thread = @lock_thread || Thread.current)
    if (conn = @thread_cached_conns.delete(connection_cache_key(owner_thread)))
      checkin conn
    end
  end

  def with_connection(owner_thread = @lock_thread || Thread.current)
    fresh_connection = false
    unless (conn = @thread_cached_conns[owner_thread])
      conn = connection(owner_thread)
      fresh_connection = true
    end
    yield conn
  ensure
    release_connection(owner_thread) if fresh_connection
  end
end

ActiveRecord::ConnectionAdapters::ConnectionPool.prepend ConnectionPoolLockThread
