require 'test_helper'

# Guards two properties of `Cdo::OversizedSqlStatements`. It reports where an oversized statement came from without
# ever reproducing the statement, which carries student program source and other personal data. And it closes the
# connection that ran one only when that is safe: not mid-transaction, not past the throttle, not while disabled.
class OversizedSqlStatementsTest < ActiveSupport::TestCase
  WRITES = {
    "INSERT INTO `level_sources` (`level_id`, `md5`, `data`) VALUES (1, 'abc', 'x')" => 'level_sources',
    "REPLACE INTO `datablock_storage_kvps` (`project_id`) VALUES (1)" => 'datablock_storage_kvps',
    "UPDATE `users` SET `properties` = '{}' WHERE `id` = 1" => 'users',
    "DELETE FROM `channel_tokens` WHERE `id` = 1" => 'channel_tokens',
  }.freeze

  # Stands in for a checked-in connection. The real pool holds the connection's lock and its own across checkin, so a
  # test that drove a live connection would be exercising the locks rather than the decision made inside them.
  class FakeConnection
    include Cdo::OversizedSqlStatements::PinnedByRdsProxy

    attr_reader :disconnect_count

    def initialize(transaction_open: false, disconnect_raises: false)
      @transaction_open = transaction_open
      @disconnect_raises = disconnect_raises
      @disconnect_count = 0
      self.pinned_by_rds_proxy = true
    end

    def transaction_open?
      @transaction_open
    end

    def disconnect!
      raise IOError, 'socket already closed' if @disconnect_raises
      @disconnect_count += 1
    end

    def pool
      nil
    end
  end

  teardown do
    ActiveRecord::Base.connection.pinned_by_rds_proxy = false
  end

  def allow_closing(throttled: false)
    DCDO.stubs(:get).with(Cdo::OversizedSqlStatements::ENABLED_KEY, false).returns(true)
    Cdo::Throttle.stubs(:throttle).returns(throttled)
  end

  test 'names the table a write statement targets' do
    WRITES.each do |sql, table|
      assert_equal table, Cdo::OversizedSqlStatements.target_table(sql)
    end
  end

  # The statement is anchored, so a value that reads like a table reference cannot be mistaken for one. Reporting a
  # fragment of a student's program under `table=` would be a data leak, not a cosmetic bug.
  test 'never reports an identifier taken from a quoted value' do
    sql = "INSERT INTO `level_sources` (`data`) VALUES ('UPDATE `secrets` SET x = 1')"
    assert_equal 'level_sources', Cdo::OversizedSqlStatements.target_table(sql)
  end

  test 'reports no table for a read, whose model is already named by the ActiveRecord label' do
    assert_nil Cdo::OversizedSqlStatements.target_table("SELECT 'x' AS `padding` FROM `users` LIMIT 1")
    assert_nil Cdo::OversizedSqlStatements.target_table('SELECT 1')
  end

  test 'omits its own frames from the reported source' do
    refute_includes Cdo::OversizedSqlStatements.source_frame.to_s,
      Cdo::OversizedSqlStatements::SELF_BASENAME
  end

  test 'flags the connection that ran an oversized statement' do
    connection = ActiveRecord::Base.connection
    connection.pinned_by_rds_proxy = false

    connection.execute("SELECT '#{'x' * (Cdo::OversizedSqlStatements::LIMIT_BYTES + 1)}'")

    assert connection.pinned_by_rds_proxy, 'an oversized statement must flag the connection that ran it'
  end

  test 'leaves the connection unflagged for a statement within the limit' do
    connection = ActiveRecord::Base.connection
    connection.pinned_by_rds_proxy = false

    connection.execute('SELECT 1')

    refute connection.pinned_by_rds_proxy
  end

  test 'closes a flagged connection and clears the flag' do
    allow_closing
    connection = FakeConnection.new

    Cdo::OversizedSqlStatements.close_if_pinned(connection)

    assert_equal 1, connection.disconnect_count
    refute connection.pinned_by_rds_proxy
  end

  test 'leaves an unflagged connection alone' do
    allow_closing
    connection = FakeConnection.new
    connection.pinned_by_rds_proxy = false

    Cdo::OversizedSqlStatements.close_if_pinned(connection)

    assert_equal 0, connection.disconnect_count
  end

  # Closing mid-transaction would roll it back, so the flag survives for a later checkin to act on.
  test 'does not close a connection with an open transaction' do
    allow_closing
    connection = FakeConnection.new(transaction_open: true)

    Cdo::OversizedSqlStatements.close_if_pinned(connection)

    assert_equal 0, connection.disconnect_count
    assert connection.pinned_by_rds_proxy, 'the connection is still pinned, so the flag must survive'
  end

  # The flag survives so that turning this on closes connections pinned while it was off.
  test 'does not close anything while disabled' do
    DCDO.stubs(:get).with(Cdo::OversizedSqlStatements::ENABLED_KEY, false).returns(false)
    connection = FakeConnection.new

    Cdo::OversizedSqlStatements.close_if_pinned(connection)

    assert_equal 0, connection.disconnect_count
    assert connection.pinned_by_rds_proxy
  end

  # Clearing the flag is what keeps a throttled process from reading the shared cache once per request.
  test 'does not close when throttled, and does not reconsult the throttle' do
    allow_closing(throttled: true)
    connection = FakeConnection.new

    Cdo::OversizedSqlStatements.close_if_pinned(connection)

    assert_equal 0, connection.disconnect_count
    refute connection.pinned_by_rds_proxy
  end

  # Raising out of this would break the pool's checkin, which is a far worse failure than leaving a session pinned.
  test 'does not raise when closing the connection fails' do
    allow_closing
    connection = FakeConnection.new(disconnect_raises: true)

    assert_nothing_raised do
      Cdo::OversizedSqlStatements.close_if_pinned(connection)
    end
  end
end
