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

  def test_get_cumulatives_rounding
    stats = {17 => [1, 1, 1]}
    assert_equal({17 => [100.000, 66.667, 33.333]}, get_cumulatives(stats))
  end

  def test_add_missing_keys_no_missing_keys
    base_hash = {1 => 11, 2 => 22}
    other_hash = {1 => 111, 2 => 222}

    add_missing_keys(base_hash, other_hash, 0)

    assert_equal({1 => 111, 2 => 222}, other_hash)
  end

  def test_add_missing_keys_extra_keys
    base_hash = {1 => 11, 2 => 22}
    other_hash = {1 => 111, 2 => 222, 3 => 333}

    add_missing_keys(base_hash, other_hash, 0)

    assert_equal({1 => 111, 2 => 222, 3 => 333}, other_hash)
  end

  def test_add_missing_keys_with_missing_keys
    base_hash = {1 => 11, 2 => 22}
    other_hash = {1 => 111}

    add_missing_keys(base_hash, other_hash, 0)

    assert_equal({1 => 111, 2 => 0}, other_hash)
  end

  def test_add_missing_keys_default_value
    base_hash = {1 => 11, 2 => 22}
    other_hash = {1 => 111}

    add_missing_keys(base_hash, other_hash, %w(a b))

    assert_equal({1 => 111, 2 => %w(a b)}, other_hash)
  end
end
