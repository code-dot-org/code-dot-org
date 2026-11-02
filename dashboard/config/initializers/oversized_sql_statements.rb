# RDS Proxy pins a MySQL client session to one database connection, for the remainder of that session, as soon as the
# session runs a single statement whose text exceeds 16KB. A pinned session cannot be multiplexed, so a small number of
# large statements costs the proxy most of its connection pool. RDS Proxy's own logs name the pinned connection but not
# the statement, so this names the code paths that emit them.
#
# Nothing releases a pin but the end of the client session: RDS Proxy has no admin interface, and no SQL statement or
# API call un-pins a live session. So this also closes the connection that earned one, at the moment the pool takes it
# back. The pool reconnects it on its next checkout and the replacement session starts unpinned.
#
# Statements carry student program source and other personal data, so only a statement's size, ActiveRecord's label for
# it, the table it names and the frame that issued it are logged. Never the SQL itself.
require 'socket'
require 'cdo/throttle'
require 'dynamic_config/dcdo'

module Cdo
  module OversizedSqlStatements
    # Fixed in RDS Proxy for MySQL; there is no setting that raises it.
    LIMIT_BYTES = 16_384

    # This file's own frames sit above the caller's in the subscriber's stack, and survive the backtrace cleaner
    # because they are application code.
    SELF_BASENAME = File.basename(__FILE__).freeze

    # Closing connections stays off until it is turned on, so that it can also be turned off without a deploy.
    ENABLED_KEY = 'close_sql_connections_pinned_by_rds_proxy'.freeze

    # Reconnects allowed per EC2 Instance per period. Scoped per instance so that a storm on one host cannot spend the
    # budget the rest of the fleet needs to close its own pinned connections.
    CLOSE_LIMIT = 60
    CLOSE_PERIOD = 60

    # Carried on the connection itself, so checkin finds it whatever pool, role or thread ran the statement.
    module PinnedByRdsProxy
      attr_accessor :pinned_by_rds_proxy
    end

    def self.subscribe
      ActiveSupport::Notifications.subscribe('sql.active_record') do |event|
        payload = event.payload
        next if payload[:cached]

        sql = payload[:sql]
        # Bind values are interpolated into the statement because `prepared_statements` is false in database.yml,
        # so this is the same length the proxy measures.
        bytes = sql.bytesize
        next unless bytes > LIMIT_BYTES

        payload[:connection]&.pinned_by_rds_proxy = true

        CDO.log.warn(
          'event=oversized_sql_statement ' \
            "bytes=#{bytes} " \
            "name=#{payload[:name].inspect} " \
            "table=#{target_table(sql).inspect} " \
            "source=#{source_frame.inspect}"
        )
      end
    end

    # Closes a connection that ran an oversized statement. Called from the pool's checkin, which holds both the
    # connection's lock and the pool's, so no other thread can be using the connection and none can take it until this
    # returns. Whatever statement pinned it has finished by then.
    def self.close_if_pinned(connection)
      return unless connection.pinned_by_rds_proxy
      # Checkin runs after the transaction has ended, so this guards a connection checked in by hand, not a path the
      # pool itself takes.
      return if connection.transaction_open?
      return unless DCDO.get(ENABLED_KEY, false)

      # A connection that loses the throttle stays pinned, which is where it would have been without this file, and is
      # flagged again by its next oversized statement. Clearing the flag either way keeps a throttled process from
      # reading the shared cache on every checkin, which is once per request.
      connection.pinned_by_rds_proxy = false
      return if Cdo::Throttle.throttle(throttle_id, CLOSE_LIMIT, CLOSE_PERIOD)

      # The pool keeps this connection and reconnects it on its next checkout, by way of `verify!`.
      connection.disconnect!
      CDO.log.warn("event=closed_pinned_sql_connection pool=#{connection.pool&.db_config&.name.inspect}")
    rescue StandardError => exception
      # Raising here would break checkin and with it the pool. The connection stays pinned instead.
      CDO.log.error("event=close_pinned_sql_connection_failed error=#{exception.message.inspect}")
    end

    def self.throttle_id
      "close_pinned_sql_connections/#{Socket.gethostname}"
    end

    # The table a write statement names, or nil for anything else. Anchored at the start of the statement so that it
    # can only ever match an identifier, never a quoted value further along that happens to read like one.
    def self.target_table(sql)
      sql[/\A\s*(?:INSERT\s+INTO|REPLACE\s+INTO|UPDATE|DELETE\s+FROM)\s+`?([A-Za-z0-9_$]+)`?/i, 1]
    end

    # The frame that issued the statement, with the framework's and this file's own frames removed. Falls back to the
    # raw frame where the cleaner silences everything, as it does for a caller outside the application's directories.
    def self.source_frame
      frames = caller.reject {|frame| frame.include?(SELF_BASENAME)}
      Rails.backtrace_cleaner.clean(frames).first || frames.first
    end
  end
end

ActiveRecord::ConnectionAdapters::AbstractAdapter.include(Cdo::OversizedSqlStatements::PinnedByRdsProxy)
ActiveRecord::ConnectionAdapters::AbstractAdapter.set_callback(:checkin, :after) do
  Cdo::OversizedSqlStatements.close_if_pinned(self)
end

Cdo::OversizedSqlStatements.subscribe
