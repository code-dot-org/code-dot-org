require 'test_helper'

class GenderTest < ActiveSupport::TestCase
  test 'normalize' do
    assert_equal 'f', Gender.normalize('f')
    assert_equal 'm', Gender.normalize('m')
    assert_equal 'n', Gender.normalize('n')
    assert_equal 'o', Gender.normalize('o')

    assert_equal 'f', Gender.normalize('F')
    assert_equal 'm', Gender.normalize('M')
    assert_equal 'n', Gender.normalize('N')
    assert_equal 'o', Gender.normalize('O')

    assert_equal 'f', Gender.normalize('Female')
    assert_equal 'm', Gender.normalize('Male')
    assert_equal 'n', Gender.normalize('NonBinary')
    assert_equal 'o', Gender.normalize('NotListed')

    assert_equal 'f', Gender.normalize('female')
    assert_equal 'm', Gender.normalize('male')
    assert_equal 'n', Gender.normalize('non-binary')
    assert_equal 'o', Gender.normalize('notlisted')

    assert_nil Gender.normalize('some nonsense')
    assert_nil Gender.normalize('')
    assert_nil Gender.normalize(nil)
  end
end
