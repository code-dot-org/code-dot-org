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

  test 'validates overloaded_by is not self' do
    programming_method = create :programming_method
    programming_method.overloaded_by = programming_method.key
    refute programming_method.valid?
  end

  test "validates overloaded_by points to an existing programming method" do
    programming_method = create :programming_method
    programming_method.overloaded_by = 'non-existinant key'
    refute programming_method.valid?
  end

  test "validates overloaded_by cannot point to a method that has an overload" do
    programming_class = create :programming_class
    programming_method1 = create :programming_method, programming_class: programming_class
    programming_method2 = create :programming_method, programming_class: programming_class, overloaded_by: programming_method1.key
    programming_method1.overloaded_by = programming_method2.key
    refute programming_method1.valid?
  end

  test "validate overloaded_by cannot be set if another method point to it" do
    programming_class = create :programming_class
    programming_method1 = create :programming_method, programming_class: programming_class
    create :programming_method, programming_class: programming_class, overloaded_by: programming_method1.key
    programming_method3 = create :programming_method, programming_class: programming_class
    programming_method1.overloaded_by = programming_method3.key
    refute programming_method1.valid?
  end

  test "valid overloaded_by validates successfully" do
    programming_class = create :programming_class
    programming_method = create :programming_method, programming_class: programming_class
    overload_programming_method = build :programming_method, programming_class: programming_class, overloaded_by: programming_method.key
    assert overload_programming_method.valid?
  end
end
