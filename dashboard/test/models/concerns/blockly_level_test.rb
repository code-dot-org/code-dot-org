require 'test_helper'
class BlocklyClass; include BlocklyLevel; end

class LevelTest < ActiveSupport::TestCase
  def blockly_value(val)
    BlocklyClass.blockly_value val
  end

  test 'leave non-coercible strings alone' do
    assert_equal 'test', blockly_value('test')
  end

  test 'force integer strings to integers' do
    assert_equal 5, blockly_value('5')
    assert_equal -5, blockly_value('-5')
    assert_equal 0, blockly_value('0')
  end

  test 'force float strings to floats' do
    assert_equal 5.00001, blockly_value('5.00001')
    assert_equal -5.00001, blockly_value('-5.00001')
  end

  test 'force boolean strings to boolean' do
    assert_equal false, blockly_value('false')
    assert_equal true, blockly_value('true')
  end
end
