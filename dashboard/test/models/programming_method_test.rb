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

  test 'validates overload_of is not self' do
    programming_method = create :programming_method
    programming_method.overload_of = programming_method.key
    refute programming_method.valid?
  end

  test "validates overload_of points to an existing programming method" do
    programming_method = create :programming_method
    programming_method.overload_of = 'non-existinant key'
    refute programming_method.valid?
  end

  test "validates overload_of cannot point to a method that has an overload" do
    programming_class = create :programming_class
    programming_method1 = create :programming_method, programming_class: programming_class
    programming_method2 = create :programming_method, programming_class: programming_class, overload_of: programming_method1.key
    programming_method1.overload_of = programming_method2.key
    refute programming_method1.valid?
  end

  test "validate overload_of cannot be set if another method point to it" do
    programming_class = create :programming_class
    programming_method1 = create :programming_method, programming_class: programming_class
    create :programming_method, programming_class: programming_class, overload_of: programming_method1.key
    programming_method3 = create :programming_method, programming_class: programming_class
    programming_method1.overload_of = programming_method3.key
    refute programming_method1.valid?
  end

  test "valid overload_of validates successfully" do
    programming_class = create :programming_class
    programming_method = create :programming_method, programming_class: programming_class
    overload_programming_method = build :programming_method, programming_class: programming_class, overload_of: programming_method.key
    assert overload_programming_method.valid?
  end

  test "validation is not run when being seeded" do
    programming_method = create :programming_method
    programming_method.overload_of = programming_method.key
    programming_method.seed_in_progress = true
    assert programming_method.valid?
  end

  test "summarize for show summarizes overloads" do
    programming_class = create :programming_class
    programming_method = create :programming_method, programming_class: programming_class
    create :programming_method, programming_class: programming_class, overload_of: programming_method.key
    create :programming_method, programming_class: programming_class, overload_of: programming_method.key

    summary = programming_method.summarize_for_show
    assert_equal 2, summary[:overloads].length
  end
end
