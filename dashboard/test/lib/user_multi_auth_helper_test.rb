require 'test_helper'

class UserMultiAuthHelperTest < ActiveSupport::TestCase
  test 'does nothing if user is already migrated' do
    user = create :teacher, :with_multi_auth
    assert user.migrated?
    refute_empty user.email

    migrate user

    assert user.migrated?
    refute_empty user.email
  end

  #
  # Non-Oauth accounts:
  #

  test 'convert sponsored picture password student' do
    assert_convert_sponsored_student create :student_in_picture_section
  end

  test 'convert sponsored word password student' do
    assert_convert_sponsored_student create :student_in_word_section
  end

  # Student with a parent-managed account

  test 'convert email+password student' do
    user = create :student

    original_email = user.email
    original_hashed_email = user.hashed_email

    refute user.migrated?
    assert_nil user.provider
    assert_empty user.email
    refute_empty user.hashed_email
    refute_empty user.password

    migrate user

    assert user.migrated?
    assert_equal original_email, user.email
    assert_equal original_hashed_email, user.hashed_email
    refute_empty user.password

    # Check for student email authentication option:
    # {
    #   email: '',
    #   hashed_email: 'cb3263338bcaf95f7b3a2baaf52dc288',
    #   credential_type: 'email',
    #   authentication_id: 'cb3263338bcaf95f7b3a2baaf52dc288',
    #   data: nil
    # }

    primary = user.primary_authentication_option
    refute_nil primary
    assert_equal original_email, primary.email
    assert_equal original_hashed_email, primary.hashed_email
    assert_equal 'email', primary.credential_type
    assert_equal original_hashed_email, primary.authentication_id
    assert_nil primary.data

    assert_equal 1, user.authentication_options.count
    assert_equal primary, user.authentication_options.first
  end

  test 'convert email+password teacher' do
    user = create :teacher

    original_email = user.email
    original_hashed_email = user.hashed_email

    refute user.migrated?
    assert_nil user.provider
    refute_empty user.email
    refute_empty user.hashed_email
    refute_empty user.password

    migrate user

    assert user.migrated?
    assert_equal original_email, user.email
    assert_equal original_hashed_email, user.hashed_email
    refute_empty user.password

    # Check for teacher email authentication option:
    # {
    #   email: 'teacher@example.org',
    #   hashed_email: 'cb3263338bcaf95f7b3a2baaf52dc288',
    #   credential_type: 'email',
    #   authentication_id: 'cb3263338bcaf95f7b3a2baaf52dc288',
    #   data: nil
    # }

    primary = user.primary_authentication_option
    refute_nil primary
    assert_equal original_email, primary.email
    assert_equal original_hashed_email, primary.hashed_email
    assert_equal 'email', primary.credential_type
    assert_equal original_hashed_email, primary.authentication_id
    assert_nil primary.data

    assert_equal 1, user.authentication_options.count
    assert_equal primary, user.authentication_options.first
  end

  # Old "manual" username and password student (no email or hashed email)

  #
  # Trusted email from Oauth:
  #

  test 'convert Google OAuth teacher' do
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

    migrate user

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

  # Google Oauth user that also has a password
  # Microsoft Oauth
  # Facebook Oauth

  #
  # Untrusted email from Oauth:
  #

  # Clever Oauth user
  # Clever Oauth user that also has a password (due to takeover)
  # Powerschool Oauth
  # Powerschool Oauth user that also has a password (due to takeover)

  private

  def assert_convert_sponsored_student(user)
    refute user.migrated?
    assert user.sponsored?

    migrate user

    assert user.migrated?
    assert user.sponsored?
    assert_empty user.authentication_options
    assert_nil user.primary_authentication_option
  end

  def migrate(user)
    result = user.migrate_to_multi_auth
    user.reload
    assert result, 'Expected migration to multi-auth to succeed, but it failed'
  end
end
