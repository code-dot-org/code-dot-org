# Sequel extension to serve read-only requests from a replica shard
# when the primary database is down.
# Wait 10 seconds before attempting to read from the primary database again.
module ServerFallback
  def self.extended(db)
    db.instance_variable_set(:@suppress_master_until, Time.now)
  end

  def execute(sql, opts=OPTS, &block)
    if opts[:server] == :read_only && @suppress_master_until > Time.now
      opts[:server] = :fallback
    end
    super
  rescue Sequel::DatabaseDisconnectError, *@error_classes => e
    if opts[:server] == :read_only && pool.disconnect_error?(e)
      @suppress_master_until = 10.seconds.from_now
      retry
    else
      raise e
    end
  end
end
Sequel::Database.register_extension(:server_fallback, ServerFallback)
