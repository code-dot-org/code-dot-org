require 'test_helper'

class PartialRegistrationTest < ActiveSupport::TestCase
  # The PartialRegistration concern is only included in User, so we
  # are testing against User.

  setup do
    @session = {}
  end

  test 'persist_attributes does not push empty attributes into the cache' do
    user = build :user
    assert user.attributes.values.any?(&:nil?)

    PartialRegistration.persist_attributes @session, user

    cache_contents = CDO.shared_cache.read(PartialRegistration.cache_key(user))
    deserialized = JSON.parse cache_contents
    refute deserialized.values.any?(&:nil?)
  end

  test 'persist_attributes pushes less than 0.5KB into the cache for a sample user' do
    user = build :user, :google_sso_provider
    PartialRegistration.persist_attributes @session, user

    cache_key = PartialRegistration.cache_key(user)
    cache_contents = CDO.shared_cache.read(cache_key)
    assert (cache_key + cache_contents).length < 512,
      "Pushed #{cache_contents.length}B into the cache, expected less than 512B"
  end

  test 'in_progress? is false when session has no user attributes' do
    refute PartialRegistration.in_progress? @session
  end

  test 'in_progress? is true when attributes have been persisted' do
    PartialRegistration.persist_attributes @session, build(:user)
    assert PartialRegistration.in_progress? @session
  end

  test 'in_progress? becomes false if attributes are lost from the cache' do
    user = build :user
    PartialRegistration.persist_attributes @session, user
    CDO.shared_cache.delete(PartialRegistration.cache_key(user))
    refute PartialRegistration.in_progress? @session
  end

  test 'new_from_partial_registration raises unless a partial registration is available' do
    exception = assert_raise RuntimeError do
      User.new_from_partial_registration @session
    end
    assert_equal 'No partial registration was in progress', exception.message
  end

  test 'new_from_partial_registration raises on a missing cache entry' do
    user = build :student
    PartialRegistration.persist_attributes @session, user
    CDO.shared_cache.delete(PartialRegistration.cache_key(user))

    exception = assert_raise RuntimeError do
      User.new_from_partial_registration @session
    end
    assert_equal 'No partial registration was in progress', exception.message
  end

  test 'new_from_partial_registration raises on a malformed cache entry' do
    user = build :student
    PartialRegistration.persist_attributes @session, user
    CDO.shared_cache.write(PartialRegistration.cache_key(user), '{malformed_json:')

    assert_raise JSON::ParserError do
      User.new_from_partial_registration @session
    end
  end

  test 'new_from_partial_registration returns a User' do
    PartialRegistration.persist_attributes @session, build(:user)
    assert_kind_of User, User.new_from_partial_registration(@session)
  end

  test 'new_from_partial_registration does not save the User' do
    PartialRegistration.persist_attributes @session, build(:user)

    user = User.new_from_partial_registration @session
    assert user.valid?
    refute user.persisted?
  end

  test 'new_from_partial_registration takes an optional block to modify the User' do
    PartialRegistration.persist_attributes @session, build(:user, name: 'Fake Name')

    user = User.new_from_partial_registration @session do |u|
      u.name = 'Different fake name'
    end
    assert_equal 'Different fake name', user.name
  end

  test 'round-trip preserves important attributes (email)' do
    user = build :student
    refute_nil user.email
    refute_nil user.encrypted_password
    PartialRegistration.persist_attributes @session, user

    result_user = User.new_from_partial_registration @session
    assert result_user.student?
    assert_equal user.name, result_user.name
    assert_equal user.email, result_user.email
    assert_equal user.encrypted_password, result_user.encrypted_password
    assert_equal user.age, result_user.age
  end

  test 'round-trip preserves important attributes (sso)' do
    user = build :user, :google_sso_provider
    refute_nil user.provider
    refute_nil user.uid
    refute_nil user.oauth_token
    refute_nil user.oauth_token_expiration
    refute_nil user.oauth_refresh_token
    PartialRegistration.persist_attributes @session, user

    result_user = User.new_from_partial_registration @session
    assert_equal user.user_type, result_user.user_type
    assert_equal user.name, result_user.name
    assert_equal user.email, result_user.email
    assert_equal user.provider, result_user.provider
    assert_equal user.uid, result_user.uid
    assert_equal user.oauth_token, result_user.oauth_token
    assert_equal user.oauth_token_expiration, result_user.oauth_token_expiration
    assert_equal user.oauth_refresh_token, result_user.oauth_refresh_token
  end

  test 'delete removes the partial registration from the session and cache' do
    user = build :user, :google_sso_provider
    cache_key = PartialRegistration.cache_key user

    PartialRegistration.persist_attributes @session, user
    refute_nil @session[PartialRegistration::SESSION_KEY]
    assert CDO.shared_cache.exist? cache_key

    PartialRegistration.delete @session
    assert_nil @session[PartialRegistration::SESSION_KEY]
    refute CDO.shared_cache.exist? cache_key
  end

  test 'delete can be called safely when no partial registration is in progress' do
    # Cache#delete(nil) throws on production (where we're using memcached)
    # but not in other environments (where we're using a file cache).
    # Force failure if we call this method with nil.
    CDO.shared_cache.stubs(:delete).with(nil).raises(Exception, "Can't delete nil key.")

    refute PartialRegistration.in_progress? @session
    PartialRegistration.delete @session
  end

  test 'get_provider returns nil when partial registration is not in progress' do
    assert_nil PartialRegistration.get_provider @session
  end

  test 'get_provider returns nil when an email registration is in progress' do
    PartialRegistration.persist_attributes @session, build(:user)
    assert_nil PartialRegistration.get_provider @session
  end

  test 'get_provider returns the provider name when an sso registration is in progress' do
    user = build :user, :google_sso_provider
    PartialRegistration.persist_attributes @session, user
    assert_equal user.provider, PartialRegistration.get_provider(@session)
  end
end
