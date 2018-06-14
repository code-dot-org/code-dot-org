require 'test_helper'

class UserMultiAuthHelperTest < ActiveSupport::TestCase
  test 'does nothing if user is already migrated' do
    user = create(:teacher, :with_multi_auth)
    refute_empty user.email
    assert_equal 'migrated', user.provider

    user.migrate_to_multi_auth
    user.reload

    refute_empty user.email
    assert_equal 'migrated', user.provider
  end

  test 'converts google_oauth2 teacher' do
    user = create(:google_oauth2_teacher)
    initial_email = user.email
    initial_hashed_email = user.hashed_email
    initial_authentication_id = user.uid
    initial_oauth_token = user.oauth_token
    initial_oauth_token_expiration = user.oauth_token_expiration
    initial_oauth_refresh_token = user.oauth_refresh_token

    assert_equal 'google_oauth2', user.provider
    assert_equal 0, user.authentication_options.count
    refute_empty initial_email
    refute_empty initial_hashed_email
    refute_nil initial_authentication_id
    refute_nil initial_oauth_token
    refute_nil initial_oauth_token_expiration
    refute_nil initial_oauth_refresh_token

    user.migrate_to_multi_auth
    user.reload

    assert_equal 'migrated', user.provider
    assert_equal 1, user.authentication_options.count
    assert_equal initial_email, user.email
    refute_nil user.primary_authentication_option

    # Verify authentication option attributes
    option = user.primary_authentication_option
    assert_equal initial_email, option.email
    assert_equal initial_hashed_email, option.hashed_email
    assert_equal initial_authentication_id, option.authentication_id
    assert_equal 'google_oauth2', option.credential_type

    # Verify authentication option data atribute
    data = JSON.parse(option.data)
    assert_equal initial_oauth_token, data['oauth_token']
    assert_equal initial_oauth_token_expiration, data['oauth_token_expiration']
    assert_equal initial_oauth_refresh_token, data['oauth_refresh_token']
  end

  # Non-Oauth accounts:
  # Picture password student
  # Word password student
  # Student with a parent-managed account
  # Email + password user
  # Old "manual" username and password student (no email or hashed email)
  #
  # Trusted email from Oauth:
  # Google Oauth user that also has a password
  # Microsoft Oauth
  # Facebook Oauth
  #
  # Untrusted email from Oauth:
  # Clever Oauth user
  # Clever Oauth user that also has a password (due to takeover)
  # Powerschool Oauth
  # Powerschool Oauth user that also has a password (due to takeover)
end
