require 'socket'
require 'cdo/throttle'
require 'dynamic_config/dcdo'

module Cdo
  # Replaces a database connection whose session RDS Proxy has pinned. Detecting a pinned connection is delegated to
  # callers such as `Cdo::OversizedSqlStatements`.
  module PinnedSqlConnections
    ENABLED_KEY = 'close_sql_connections_pinned_by_rds_proxy'.freeze

    # Reconnects allowed per host per period, so that a storm on one host cannot spend the budget the rest of the
    # fleet needs to close its own pinned connections.
    CLOSE_LIMIT = 60
    CLOSE_PERIOD = 60

    # Carried on the connection itself, so `checkin` finds the mark whatever pool, role or thread ran the statement.
    module Pinnable
      attr_accessor :rds_proxy_pin_reason
    end

    # Teaches every connection to carry a pin reason, and closes the marked ones as the pool takes them back.
    # Idempotent, so each caller that marks connections can install the mechanism it depends on without ordering
    # itself against the others.
    def self.install!
      return if @installed
      @installed = true

      ActiveRecord::ConnectionAdapters::AbstractAdapter.include(Pinnable)
      ActiveRecord::ConnectionAdapters::AbstractAdapter.set_callback(:checkin, :after) do
        Cdo::PinnedSqlConnections.close_if_pinned(self)
      end
    end

    # Records that `reason` pinned this connection's session. A session already pinned stays pinned, so a second
    # reason changes nothing and the first one is the one worth reporting.
    def self.pin(connection, reason)
      return unless connection
      connection.rds_proxy_pin_reason ||= reason # A session already pinned stays pinned, a 2nd reason changes nothing.
    end

    # Closes a pinned connection. Invoked by the pool's `checkin` callback, which holds both the connection's lock and the
    # pool's, so no other thread can be using the connection and none can take it until this returns.
    def self.close_if_pinned(connection)
      reason = connection.rds_proxy_pin_reason
      return unless reason
      # `checkin` runs after the transaction has ended, so this guards a connection checked in by hand, not a path that
      # an ActiveRecord pool itself takes.
      return if connection.transaction_open?
      return unless DCDO.get(ENABLED_KEY, false)

      # A connection that loses the throttle stays pinned, which is where it would have been without this module, and
      # is marked again by the next statement that pins it. Clearing the mark either way keeps a throttled process
      # from reading the shared cache on every checkin, which is once per request.
      connection.rds_proxy_pin_reason = nil
      return if Cdo::Throttle.throttle(throttle_id, CLOSE_LIMIT, CLOSE_PERIOD)

      # Disconnect this database connection's socket to RDS Proxy. The next SQL statement that checks out this
      # connection from the pool will verify and reconnect it to RDS Proxy.
      connection.disconnect!
      CDO.log.warn(
        "event=closed_pinned_sql_connection reason=#{reason} pool=#{connection.pool&.db_config&.name.inspect}"
      )
    rescue StandardError => exception
      # Raising here would break `checkin` and with it the pool. The connection stays pinned if any error is raised while
      # trying to close it.
      CDO.log.error("event=close_pinned_sql_connection_failed error=#{exception.message.inspect}")
    end

    # One budget per host, shared by every reason a connection on it gets closed. `gethostname` names the unit that
    # owns the connection pool in every environment we deploy to: the EC2 instance, the Kubernetes pod, the container
    # under Docker and continuous integration, the workstation in development.
    def self.throttle_id
      @throttle_id ||= "close_pinned_sql_connections/#{Socket.gethostname}"
    end
  end
end
