require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class HashTest < Minitest::Unit::TestCase
  def test_slice_keys
    assert ({a: 1, b: 2, c: 3}).slice_keys(:a).keys == [:a]
    assert ({a: 1, b: 2, c: 3}).slice_keys(:a, :d).keys == [:a]
    assert ({a: 1, b: 2, c: 3}).slice_keys(:a, :b).keys == [:a, :b]
    assert ({a: 1, b: 2, c: 3}).slice_keys(:d).keys.empty?
  end

  def test_to_query
    assert_equal 'a=1&b=2', ({a: 1, b: 2}).to_query
    assert_equal 'boo%5Ba%5D=1&boo%5Bb%5D=2', ({a: 1, b: 2}).to_query('boo')
    assert_equal ({a: 1, b: 2}).to_param, ({a: 1, b: 2}).to_query
    assert_equal ({a: 1, b: 2}).to_param('boo'), ({a: 1, b: 2}).to_query('boo')
  end
end
