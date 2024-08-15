# This initializer adds a red [NO INDEX] annotation to SQL notifications printed to the logger
# for ActiveRecord queries when the MySQL query result has the 'no_index_used' flag set.
#
# It also adds a 'raise_on_no_index_used' Rails configuration option, which will enforce index usage
# by raising NoIndexUsedException if any ActiveRecord query is executed without using an index.
# Note that MySQL often chooses to ignore an existing index for small or empty tables where the query optimizer
# decides that a table scan will be more efficient anyway, so this setting may be difficult to use properly.

module MysqlCheckIndexUsed
  class NoIndexUsedException < StandardError; end

  # Copy/extend logic in AbstractMySQLAdapter#execute, and AbstractAdapter#log.
  def execute(sql, name = nil)
    # Rails 6 added both the materialize_transactions method and a call to it
    # right here, so to preserve compatibility between 5 and 6 we call the
    # method if and only if it exists. The if clause can be removed once we've
    # fully upgraded to Rails 6.
    #
    # See https://github.com/rails/rails/pull/32647/files#diff-868f1dccfcbed26a288bf9f3fd8a39c863a4413ab0075e12b6805d9798f556d1
    materialize_transactions if respond_to?(:materialize_transactions)

    options = {
      sql:               sql,
      name:              name,
      binds:             [],
      type_casted_binds: [],
      statement_name:    nil,
      connection_id:     object_id
    }
    @instrumenter.instrument("sql.active_record", options) do
      @lock.synchronize do
        ActiveSupport::Dependencies.interlock.permit_concurrent_loads do
          @raw_connection.query(sql).tap do |result|
            if name && name != 'SCHEMA' && result && result.server_flags[:no_index_used]
              options[:name] += ' ' + '[NO INDEX]'.on_red
              raise NoIndexUsedException if Rails.application.config.raise_on_no_index_used
            end
          end
        end
      end
    end
  rescue => exception
    raise translate_exception_class(exception, sql, [])
  end
end

Rails.application.configure do
  config.check_index_used = !Rails.env.production?
  config.raise_on_no_index_used = false
end

ActiveSupport.on_load(:active_record) do
  if Rails.application.config.check_index_used
    require 'active_record/connection_adapters/mysql2_adapter'
    ActiveRecord::ConnectionAdapters::Mysql2Adapter.prepend MysqlCheckIndexUsed
  end
end
