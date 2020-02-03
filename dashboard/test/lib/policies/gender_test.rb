require 'test_helper'

class Policies::GenderTest < ActiveSupport::TestCase
  test 'normalize' do
    assert_equal 'f', Policies::Gender.normalize('f')
    assert_equal 'm', Policies::Gender.normalize('m')
    assert_equal 'n', Policies::Gender.normalize('n')
    assert_equal 'o', Policies::Gender.normalize('o')

    assert_equal 'f', Policies::Gender.normalize('F')
    assert_equal 'm', Policies::Gender.normalize('M')
    assert_equal 'n', Policies::Gender.normalize('N')
    assert_equal 'o', Policies::Gender.normalize('O')

    assert_equal 'f', Policies::Gender.normalize('Female')
    assert_equal 'm', Policies::Gender.normalize('Male')
    assert_equal 'n', Policies::Gender.normalize('NonBinary')
    assert_equal 'o', Policies::Gender.normalize('NotListed')

    assert_equal 'f', Policies::Gender.normalize('female')
    assert_equal 'm', Policies::Gender.normalize('male')
    assert_equal 'n', Policies::Gender.normalize('non-binary')
    assert_equal 'o', Policies::Gender.normalize('notlisted')

    assert_nil Policies::Gender.normalize('some nonsense')
    assert_nil Policies::Gender.normalize('')
    assert_nil Policies::Gender.normalize(nil)
  end
end
