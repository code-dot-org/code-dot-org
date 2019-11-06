# This initializer adds a red [NO INDEX] annotation to SQL notifications printed to the logger
# for ActiveRecord queries when the MySQL query result has the 'no_index_used' flag set.
#
# It also adds a 'raise_on_no_index_used' Rails configuration option, which will enforce index usage
# by raising NoIndexUsedException if any ActiveRecord query is executed without using an index.
# Note that MySQL often chooses to ignore an existing index for small or empty tables where the query optimizer
# decides that a table scan will be more efficient anyway, so this setting may be difficult to use properly.

class NoIndexUsedException < StandardError; end
module MysqlCheckIndexUsed
  # Copy/extend logic in AbstractMySQLAdapter#execute, and AbstractAdapter#log.
  def execute(sql, name = nil)
    options = {
      sql:               sql,
      name:              name,
      binds:             [],
      type_casted_binds: [],
      statement_name:    nil,
      connection_id:     object_id
    }
    @instrumenter.instrument("sql.active_record", options) do
      @connection.query(sql).tap do |result|
        if name && name != 'SCHEMA' && result && result.server_flags[:no_index_used]
          options[:name] += ' ' + '[NO INDEX]'.on_red
          raise NoIndexUsedException if Rails.application.config.raise_on_no_index_used
        end
      end
    end
  rescue => e
    raise translate_exception_class(e, sql)
  end
end

ActiveSupport.on_load(:active_record) do
  require 'active_record/connection_adapters/mysql2_adapter'
  ActiveRecord::ConnectionAdapters::Mysql2Adapter.prepend MysqlCheckIndexUsed
end

Rails.application.configure do
  config.raise_on_no_index_used = false
end
