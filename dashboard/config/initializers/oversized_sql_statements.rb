# Detect ActiveRecord SQL statements that are larger than 16KB. RDS Proxy pins its outbound connection to the MySQL server
# for exclusive use by the single inbound connection from our application if the inbound connection to RDS Proxy executes
# a SQL statement larger than 16KB. https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy-pinning.html
module Cdo
  module OversizedSqlStatements
    LIMIT_BYTES = 16_384

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

        CDO.log.warn(
          'event=oversized_sql_statement ' \
            "bytes=#{bytes} " \
            "name=#{payload[:name].inspect} " \
            "table=#{target_table(sql).inspect} " \
            "source=#{source_frame.inspect}"
        )
      end
    end

    # The table a write statement names, or nil for anything else.
    def self.target_table(sql)
      sql[/\A\s*(?:INSERT\s+INTO|REPLACE\s+INTO|UPDATE|DELETE\s+FROM)\s+`?([A-Za-z0-9_$]+)`?/i, 1]
    end

    # The frame that issued the statement, with the framework's and this file's own frames removed.
    def self.source_frame
      frames = caller.reject {|frame| frame.include?(SELF_BASENAME)}
      Rails.backtrace_cleaner.clean(frames).first || frames.first
    end
  end
end

Cdo::OversizedSqlStatements.subscribe
