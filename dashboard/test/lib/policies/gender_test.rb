require 'test_helper'

class GenderPolicyTest < ActiveSupport::TestCase
  test 'normalize' do
    assert_equal 'f', GenderPolicy.normalize('f')
    assert_equal 'm', GenderPolicy.normalize('m')
    assert_equal 'n', GenderPolicy.normalize('n')
    assert_equal 'o', GenderPolicy.normalize('o')

    assert_equal 'f', GenderPolicy.normalize('F')
    assert_equal 'm', GenderPolicy.normalize('M')
    assert_equal 'n', GenderPolicy.normalize('N')
    assert_equal 'o', GenderPolicy.normalize('O')

    assert_equal 'f', GenderPolicy.normalize('Female')
    assert_equal 'm', GenderPolicy.normalize('Male')
    assert_equal 'n', GenderPolicy.normalize('NonBinary')
    assert_equal 'o', GenderPolicy.normalize('NotListed')

    assert_equal 'f', GenderPolicy.normalize('female')
    assert_equal 'm', GenderPolicy.normalize('male')
    assert_equal 'n', GenderPolicy.normalize('non-binary')
    assert_equal 'o', GenderPolicy.normalize('notlisted')

    assert_nil GenderPolicy.normalize('some nonsense')
    assert_nil GenderPolicy.normalize('')
    assert_nil GenderPolicy.normalize(nil)
  end
end
