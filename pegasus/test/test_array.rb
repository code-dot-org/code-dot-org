require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class ArrayTest < Minitest::Unit::TestCase
  def test_to_query
    assert_equal '%5B%5D=a&%5B%5D=b&%5B%5D=c', ['a',:b,'c'].to_query(nil)
    assert_equal 'q%5B%5D=a&q%5B%5D=b&q%5B%5D=c', ['a',:b,'c'].to_query('q')
  end
end
