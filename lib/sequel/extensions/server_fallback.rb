require 'active_support/core_ext/numeric/time'

# Sequel extension to serve read-only requests from a replica shard
# when the primary database is down.
# Throttle reconnection attempts to once every 10 seconds.
module ServerFallback
  def self.extended(db)
    db.instance_variable_set(:@suppress_master_until, Time.now)
    db.extend_datasets(Dataset)
  end

  attr_accessor :suppress_master_until

  def execute(sql, opts=OPTS, &block)
    if opts[:server] == :read_only && @suppress_master_until > Time.now
      opts[:server] = :fallback
    end
    super
  rescue Sequel::DatabaseDisconnectError, *database_error_classes => e
    if opts[:server] == :read_only && disconnect_error?(e, opts)
      @suppress_master_until = 10.seconds.from_now
      retry
    else
      raise e
    end
  end

  # Treat "Access denied" message as a disconnect error for testing purposes.
  def disconnect_error?(e, _)
    super || /Access denied for user/.match(e.message)
  end

  # MySQL adapter uses an active connection for escaping SQL strings,
  # so use same fallback as other read-only queries.
  module Dataset
    def literal_string_append(sql, v)
      @opts[:server] = :fallback if db.suppress_master_until > Time.now
      super
    rescue Sequel::DatabaseDisconnectError => e
      if @opts[:server] != :fallback
        db.suppress_master_until = 10.seconds.from_now
        retry
      else
        raise e
      end
    end
  end
end
Sequel::Database.register_extension(:server_fallback, ServerFallback)
