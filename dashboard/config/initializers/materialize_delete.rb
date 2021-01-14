module MaterializeTransactionsOnExecDelete
  def exec_delete(sql, name = nil, binds = [])
    materialize_transactions
    super
  end
  alias :exec_update :exec_delete
end

ActiveRecord::ConnectionAdapters::Mysql2Adapter.prepend MaterializeTransactionsOnExecDelete
