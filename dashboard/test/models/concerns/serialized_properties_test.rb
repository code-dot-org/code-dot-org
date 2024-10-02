require 'test_helper'

class SerializedPropertiesTest < ActiveSupport::TestCase
  setup do
    @user = create :user, properties: {us_state: 'CO'}
  end

  test 'assign_attributes ensures properties are merged' do
    @user.assign_attributes({properties: {gender_student_input: 'f'}})

    assert_equal 'CO', @user.us_state
    assert_equal 'f', @user.gender_student_input
  end

  test 'assign_attributes adds properties when none already exist' do
    user = create :user, properties: {}
    user.assign_attributes({properties: {gender_student_input: 'f'}})

    assert_equal 'f', user.gender_student_input
  end

  test 'property_before_save returns the original value after a save' do
    @user.us_state = 'PA'
    @user.save

    assert_equal 'CO', @user.property_before_save('us_state')
  end

  test 'property_before_save returns the current value even if untouched' do
    @user.gender_student_input = 'f'
    @user.save

    assert_equal 'CO', @user.property_before_save('us_state')
  end

  test 'property_before_save returns the current value even if unsaved' do
    assert_equal @user.property_before_save('us_state'), 'CO'
  end

  test 'property_before_save returns nil if the value was previously not set' do
    @user.gender_student_input = 'f'
    @user.save

    assert_nil @user.property_before_save('gender_student_input')
  end

  test 'property_before save returns the original value when the property is deleted' do
    @user.us_state = nil
    @user.save

    assert_equal 'CO', @user.property_before_save('us_state')
  end

  test 'property_changed? returns true when the property is dirty' do
    @user.us_state = 'PA'
    assert @user.property_changed?('us_state')
  end

  test 'property_changed? returns false when the property has not changed' do
    @user.gender_student_input = 'f'
    refute @user.property_changed?('us_state')
  end

  test 'property_changed? returns false after the record is saved' do
    @user.us_state = 'PA'
    @user.save

    refute @user.property_changed?('us_state')
  end

  test 'created the reader method' do
    assert @user.respond_to?(:us_state)
  end

  test 'can read the correct value' do
    assert_equal @user.us_state, 'CO'
  end

  test 'unset properties are nil' do
    assert_nil @user.gender_student_input
  end

  test 'created the writer method' do
    assert @user.respond_to?(:us_state=)
  end

  test 'can write and persist a new value' do
    @user.us_state = 'PA'
    assert @user.us_state == 'PA'
  end

  test 'created the query method' do
    assert @user.respond_to?(:us_state?)
  end

  test 'query method returns true when the property is set' do
    assert @user.us_state?
  end

  test 'query method returns false when the property is missing or nil' do
    refute @user.gender_student_input?

    @user.us_state = nil
    refute @user.us_state?
  end

  test 'deletes the existing property when set to nil' do
    @user.us_state = nil
    @user.save!

    refute @user.read_attribute('properties').key?('us_state')
  end

  test 'does not serialize any unset properties' do
    @user.us_state = 'CO'
    @user.save!

    refute @user.read_attribute('properties').key?('gender_student_input')
  end
end
