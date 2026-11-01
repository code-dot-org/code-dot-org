# RDS Proxy pins a MySQL client session to one database connection, for the remainder of that session, as soon as the
# session runs a single statement whose text exceeds 16KB. A pinned session cannot be multiplexed, so a small number of
# large statements costs the proxy most of its connection pool. RDS Proxy's own logs name the pinned connection but not
# the statement, so this names the code paths that emit them.
#
# Statements carry student program source and other personal data, so only a statement's size, ActiveRecord's label for
# it, the table it names and the frame that issued it are logged. Never the SQL itself.
require 'dynamic_config/dcdo'

module Cdo
  module OversizedSqlStatements
    # Fixed in RDS Proxy for MySQL; there is no setting that raises it.
    LIMIT_BYTES = 16_384

    DCDO_KEY = 'log_oversized_sql_statements'.freeze

    # This file's own frames sit above the caller's in the subscriber's stack, and survive the backtrace cleaner
    # because they are application code.
    SELF_BASENAME = File.basename(__FILE__).freeze

    def self.subscribe
      ActiveSupport::Notifications.subscribe('sql.active_record') do |event|
        payload = event.payload
        next if payload[:cached]

        sql = payload[:sql]
        # Bind values are interpolated into the statement because `prepared_statements` is false in database.yml,
        # so this is the same length the proxy measures.
        bytes = sql.bytesize
        next unless bytes > LIMIT_BYTES
        # Checked after the size, which is a cheaper gate on a path that runs for every query.
        next unless DCDO.get(DCDO_KEY, false)

        CDO.log.warn(
          'event=oversized_sql_statement ' \
            "bytes=#{bytes} " \
            "name=#{payload[:name].inspect} " \
            "table=#{target_table(sql).inspect} " \
            "source=#{source_frame.inspect}"
        )
      end
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

Cdo::OversizedSqlStatements.subscribe
