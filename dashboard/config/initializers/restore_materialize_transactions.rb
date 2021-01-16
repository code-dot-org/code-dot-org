module RestoreMaterializeTransactions
  # These `materialize_transactions` calls were removed in
  # https://github.com/rails/rails/commit/7d83ef4f7bd9e5766ebdb438370621a98be06a7c,
  # but doing so prevents some of our transaction from working correctly. This
  # module simply patches them back in.

  def exec_query(sql, name = "SQL", binds = [], prepare: false)
    materialize_transactions
    super
  end

  def exec_delete(sql, name = nil, binds = [])
    materialize_transactions
    super
  end
  alias :exec_update :exec_delete
end

ActiveRecord::ConnectionAdapters::Mysql2Adapter.prepend RestoreMaterializeTransactions
