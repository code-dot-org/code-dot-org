require 'minitest/autorun'
require 'rack/test'

require_relative '../../lib/retention_stats_helper'

class RetentionStatsHelperTest < Minitest::Test
  def test_get_cumulatives_one_key
    stats = {17 => [2, 1, 2]}
    assert_equal({17 => [100.0, 60.0, 40.0]}, get_cumulatives(stats))
  end

  def test_get_cumulatives_multiple_keys
    stats = {17 => [2, 1, 2], 18 => [1, 3]}
    assert_equal({17 => [100.0, 60.0, 40.0], 18 => [100.0, 75.0]}, get_cumulatives(stats))
  end

  def test_get_cumulatives_zero_values
    stats = {17 => [0, 0]}
    assert_equal({17 => [0.0, 0.0]}, get_cumulatives(stats))
  end
end
