require 'test_helper'

class ProgrammingMethodTest < ActiveSupport::TestCase
  test 'paratheses in name are sanitized for key' do
    programming_method = ProgrammingMethod.new(name: 'turnLeft()')
    programming_method.generate_key
    assert_equal 'turnleft', programming_method.key

    programming_method = ProgrammingMethod.new(name: 'pickUp(int num')
    programming_method.generate_key
    assert_equal 'pickup-int-num', programming_method.key
  end
end
