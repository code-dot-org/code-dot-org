require_relative '../test_helper'
require 'cdo/pinned_sql_connections'

class PinnedSqlConnectionsTest < Minitest::Test
  REASON = :oversized_statement

  # Stands in for a checked-in connection. The real pool holds the connection's lock and its own across checkin, so a
  # test driving a live connection would be exercising those locks rather than the decision made inside them.
  class FakeConnection
    include Cdo::PinnedSqlConnections::Pinnable

    attr_reader :disconnect_count

    def initialize(transaction_open: false, disconnect_raises: false)
      @transaction_open = transaction_open
      @disconnect_raises = disconnect_raises
      @disconnect_count = 0
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

  def allow_closing(throttled: false)
    DCDO.stubs(:get).with(Cdo::PinnedSqlConnections::ENABLED_KEY, false).returns(true)
    Cdo::Throttle.stubs(:throttle).returns(throttled)
  end

  def pinned_connection(**options)
    FakeConnection.new(**options).tap {|connection| Cdo::PinnedSqlConnections.pin(connection, REASON)}
  end

  def test_pin_records_the_reason
    connection = FakeConnection.new

    Cdo::PinnedSqlConnections.pin(connection, REASON)

    assert_equal REASON, connection.rds_proxy_pin_reason
  end

  def test_pin_keeps_the_first_reason
    connection = pinned_connection

    Cdo::PinnedSqlConnections.pin(connection, :named_lock)

    assert_equal REASON, connection.rds_proxy_pin_reason
  end

  def test_pin_ignores_a_missing_connection
    assert_nil Cdo::PinnedSqlConnections.pin(nil, REASON)
  end

  def test_closes_a_pinned_connection_and_clears_the_reason
    allow_closing
    connection = pinned_connection

    Cdo::PinnedSqlConnections.close_if_pinned(connection)

    assert_equal 1, connection.disconnect_count
    assert_nil connection.rds_proxy_pin_reason
  end

  def test_leaves_an_unpinned_connection_alone
    allow_closing
    connection = FakeConnection.new

    Cdo::PinnedSqlConnections.close_if_pinned(connection)

    assert_equal 0, connection.disconnect_count
  end

  def test_does_not_close_a_connection_with_an_open_transaction
    allow_closing
    connection = pinned_connection(transaction_open: true)

    Cdo::PinnedSqlConnections.close_if_pinned(connection)

    assert_equal 0, connection.disconnect_count
    assert_equal REASON, connection.rds_proxy_pin_reason
  end

  def test_does_not_close_anything_while_disabled
    DCDO.stubs(:get).with(Cdo::PinnedSqlConnections::ENABLED_KEY, false).returns(false)
    connection = pinned_connection

    Cdo::PinnedSqlConnections.close_if_pinned(connection)

    assert_equal 0, connection.disconnect_count
    assert_equal REASON, connection.rds_proxy_pin_reason
  end

  def test_does_not_close_when_throttled_and_does_not_reconsult_the_throttle
    allow_closing(throttled: true)
    connection = pinned_connection

    Cdo::PinnedSqlConnections.close_if_pinned(connection)

    assert_equal 0, connection.disconnect_count
    assert_nil connection.rds_proxy_pin_reason
  end

  def test_does_not_raise_when_closing_the_connection_fails
    allow_closing
    connection = pinned_connection(disconnect_raises: true)

    Cdo::PinnedSqlConnections.close_if_pinned(connection)

    assert_equal 0, connection.disconnect_count
  end

  def test_throttle_budget_is_scoped_to_the_host
    assert_includes Cdo::PinnedSqlConnections.throttle_id, Socket.gethostname
  end
end
