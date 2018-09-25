require 'test_helper'

class PartialRegistrationHelperTest < ActiveSupport::TestCase
  # The PartialRegistrationHelper concern is only included in User, so we
  # are testing against User.

  test 'partial_registration? is false when session has no user attributes' do
    refute User.partial_registration? fake_empty_session
  end

  test 'partial_registration? is true when session has user attributes' do
    assert User.partial_registration? fake_session
  end

  test 'new_from_partial_registration raises unless a partial registration is available' do
    exception = assert_raise RuntimeError do
      User.new_from_partial_registration fake_empty_session
    end
    assert_equal 'No partial registration was in progress', exception.message
  end

  test 'new_from_partial_registration returns a User' do
    user = User.new_from_partial_registration fake_session
    assert_kind_of User, user
  end

  test 'new_from_partial_registration applies attributes to new User' do
    user = User.new_from_partial_registration fake_session(
      user_type: 'student',
      name: 'Fake Name',
      email: 'fake@example.com',
      password: 'fake password',
      age: 15,
    )
    assert user.student?
    assert_equal 'Fake Name', user.name
    assert_equal 'fake@example.com', user.email
    assert_equal 'fake password', user.password
    assert_equal 15, user.age
  end

  test 'new_from_partial_registration does not save the User' do
    user = User.new_from_partial_registration fake_session(
      user_type: 'student',
      name: 'Fake Name',
      email: 'fake@example.com',
      password: 'fake password',
      age: 15,
    )
    assert user.valid?
    refute user.persisted?
  end

  test 'new_from_partial_registration takes an optional block to modify the User' do
    user = User.new_from_partial_registration fake_session(
      user_type: 'student',
      name: 'Fake Name',
    ) do |u|
      u.name = 'Different fake name'
    end
    assert_equal 'Different fake name', user.name
  end

  private

  def fake_empty_session
    {}
  end

  def fake_session(user_attributes = {})
    {
      PartialRegistrationHelper::USER_ATTRIBUTES_SESSION_KEY => user_attributes
    }
  end
end
