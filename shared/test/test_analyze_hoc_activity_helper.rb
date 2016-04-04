require 'minitest/autorun'
require 'rack/test'

require_relative '../../lib/analyze_hoc_activity_helper'

class AnalyzeHocActivityHelperTest < Minitest::Test
  def test_add_count_to_hash_existing_key
    a = {'k' => 10}
    add_count_to_hash a, 'k', 1
    assert_equal 11, a['k']
  end

  def test_add_count_to_hash_new_key
    a = {'k' => 10}
    add_count_to_hash a, 'l', 1
    assert_equal 10, a['k']
    assert_equal 1, a['l']
  end

  def test_add_hashes_disjoint_keys
    a = {'j' => 1, 'k' => 2}
    b = {'l' => 3}
    sum = add_hashes(a,b)
    assert_equal 1, sum['j']
    assert_equal 2, sum['k']
    assert_equal 3, sum['l']
  end

  def test_add_hashes_intersecting_keys
    a = {'j' => 1, 'k' => 2}
    b = {'j' => 3}
    sum = add_hashes(a,b)
    assert_equal 4, sum['j']
    assert_equal 2, sum['k']
  end
end
