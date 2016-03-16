require_relative 'test_helper'
require 'fakeredis'

require_relative '../../shared/middleware/helpers/table_limits'

class TestTableLimits < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  def test_row_count
    redis_client = Redis.new
    limits = TableLimits.new(redis_client, 'shared', 'FAKE_CHANNEL_ID', 'mytable')
    assert_equal 0, limits.get_approximate_row_count,
                 'Approx row count should default to zero'

    count = limits.decrement_row_count
    assert_equal 0, count, 'decrement should return new count'
    assert_equal 0, limits.get_approximate_row_count,
                 'Approx row count should never go below zero'

    count = limits.increment_row_count
    assert_equal 1, count, 'increment should return new count'
    assert_equal 1, limits.get_approximate_row_count

    limits.increment_row_count
    assert_equal 2, limits.get_approximate_row_count

    limits2 = TableLimits.new(redis_client, 'shared', 'FAKE_CHANNEL_ID', 'mytable')
    assert_equal 2, limits2.get_approximate_row_count,
        'Limits should be shared across TableLimits instances'

    limits2.decrement_row_count
    assert_equal 1, limits.get_approximate_row_count

    limits.set_approximate_row_count(10)
    assert_equal 10, limits2.get_approximate_row_count
  end

end
