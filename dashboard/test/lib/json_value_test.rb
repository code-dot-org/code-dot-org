require 'test_helper'
class JSONValueTest < ActiveSupport::TestCase
  test 'leave non-coercible strings alone' do
    assert_equal 'test', JSONValue.value('test')
  end

  test 'force integer strings to integers' do
    assert_equal 5, JSONValue.value('5')
    assert_equal (-5), JSONValue.value('-5')
    assert_equal 0, JSONValue.value('0')
  end

  test 'force float strings to floats' do
    assert_equal 5.00001, JSONValue.value('5.00001')
    assert_equal (-5.00001), JSONValue.value('-5.00001')
  end

  test 'force boolean strings to boolean' do
    assert_equal false, JSONValue.value('false')
    assert_equal true, JSONValue.value('true')
  end
end
