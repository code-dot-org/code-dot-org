require 'test_helper'

class PartialRegistrationTest < ActiveSupport::TestCase
  # The PartialRegistration concern is only included in User, so we
  # are testing against User.

  test 'in_progress? is false when session has no user attributes' do
    refute PartialRegistration.in_progress? fake_empty_session
  end

  test 'in_progress? is true when session has user attributes' do
    assert PartialRegistration.in_progress? fake_session
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

  test 'persist_attributes puts tokens in the cache' do
    # Because some oauth tokens are quite large, we strip them from the session
    # variables and pass them through via the cache instead - they are pulled
    # out again in new_from_partial_registration.
    # This avoids "cookie overflow" errors.

    session = fake_empty_session
    user = build :student, :google_sso_provider

    PartialRegistration.persist_attributes session, user

    # Tokens are in cache
    assert_equal user.oauth_token,
      CDO.shared_cache.read(PartialRegistration.cache_key('oauth_token', user))
    assert_equal user.oauth_refresh_token,
      CDO.shared_cache.read(PartialRegistration.cache_key('oauth_refresh_token', user))

    # ...not in session
    refute_equal user.oauth_token, session[PartialRegistration::USER_ATTRIBUTES_SESSION_KEY]['oauth_token']
    refute_equal user.oauth_refresh_token, session[PartialRegistration::USER_ATTRIBUTES_SESSION_KEY]['oauth_refresh_token']
  end

  test 'persist_attributes puts other potentially large attributes into the cache' do
    session = fake_empty_session
    user = build :student, :google_sso_provider,
      school: 'fake-school',
      full_address: 'fake-full-address'

    PartialRegistration.persist_attributes session, user

    # Values are in cache
    assert_equal user.school,
      CDO.shared_cache.read(PartialRegistration.cache_key('school', user))
    assert_equal user.full_address,
      CDO.shared_cache.read(PartialRegistration.cache_key('full_address', user))

    # ...not in session
    refute session[PartialRegistration::USER_ATTRIBUTES_SESSION_KEY].key? 'school'
    refute session[PartialRegistration::USER_ATTRIBUTES_SESSION_KEY].key? 'full_address'
  end

  test 'persist_attributes omits irrelevant attributes from the session and the cache' do
    session = fake_empty_session
    user = build :student, :google_sso_provider

    PartialRegistration.persist_attributes session, user

    PartialRegistration::ATTRIBUTES_TO_DROP.each do |attr_name|
      # Values are not in the cache...
      refute CDO.shared_cache.exist? PartialRegistration.cache_key(attr_name, user)

      # ...nor in the session
      refute session[PartialRegistration::USER_ATTRIBUTES_SESSION_KEY].key? attr_name
    end
  end

  test 'round-trip preserves important attributes' do
    session = fake_empty_session
    user = build :user, :google_sso_provider

    PartialRegistration.persist_attributes session, user

    result_user = User.new_from_partial_registration session

    assert_equal user.user_type, result_user.user_type
    assert_equal user.name, result_user.name
    assert_equal user.email, result_user.email
    assert_equal user.provider, result_user.provider
    assert_equal user.uid, result_user.uid
    assert_equal user.oauth_token, result_user.oauth_token
    assert_equal user.oauth_token_expiration, result_user.oauth_token_expiration
    assert_equal user.oauth_refresh_token, result_user.oauth_refresh_token
  end

  test 'cancel ends signup tracking and deletes user attributes from the session' do
    user = build :user, :google_sso_provider
    session = fake_session user.attributes

    SignUpTracking.expects(:log_cancel_finish_sign_up)
    SignUpTracking.expects(:end_sign_up_tracking)
    new_session = PartialRegistration.cancel(session)

    assert_nil new_session[PartialRegistration::USER_ATTRIBUTES_SESSION_KEY]
  end

  private

  def fake_empty_session
    {}
  end

  def fake_session(user_attributes = {})
    {
      PartialRegistration::USER_ATTRIBUTES_SESSION_KEY => user_attributes
    }
  end
end
