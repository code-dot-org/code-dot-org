require 'test_helper'

class UserMultiAuthHelperTest < ActiveSupport::TestCase
  test 'does nothing if user is already migrated' do
    user = create :teacher, :with_multi_auth
    assert user.migrated?

    user.expects(:save).never
    assert user.migrate_to_multi_auth
    user.reload

    assert user.migrated?
  end

  #
  # Non-Oauth accounts:
  # Picture and word password students have no authentication_options.
  #

  test 'convert sponsored picture password student' do
    assert_convert_sponsored_student create :student_in_picture_section
  end

  test 'convert sponsored word password student' do
    assert_convert_sponsored_student create :student_in_word_section
  end

  def assert_convert_sponsored_student(user)
    assert_attributes user,
      provider: User::PROVIDER_SPONSORED,
      sponsored?: true

    migrate user

    assert_attributes user,
      sponsored?: true,
      primary_authentication_option: nil
    assert_authentication_options user, []
  end

  test 'convert sponsored username+password student' do
    # A student with provider "manual" has a username and password, but no email
    # or hashed email on file. This is a legacy account type.
    user = create :manual_username_password_student
    assert_attributes user,
      sponsored?: false,
      email: '',
      hashed_email: nil,
      username: :not_empty,
      encrypted_password: :not_empty

    migrate user

    # A migrated manual student has no authentication option rows because they
    # sign in with username+password or word/picture, and all of these values
    # are stored on the user row.
    assert_attributes user,
      sponsored?: false,
      email: '',
      hashed_email: '',
      username: :not_empty,
      encrypted_password: :not_empty,
      primary_authentication_option: nil
    assert_authentication_options user, []
  end

  test 'convert parent-managed student' do
    # A parent-managed student signs in with a username and password.
    # Its provider is nil but it has a parent_email on file.
    # In practice it's identical to the "manual" type above.
    user = create :parent_managed_student
    assert_attributes user,
      sponsored?: false,
      email: '',
      hashed_email: nil,
      username: :not_empty,
      encrypted_password: :not_empty,
      parent_email: :not_empty

    migrate user

    # A migrated parent-managed student has no authentication option rows
    # because they sign in with username+password or word/picture, and all of
    # these values are stored on the user row.
    assert_attributes user,
      sponsored?: false,
      email: '',
      hashed_email: '',
      username: :not_empty,
      encrypted_password: :not_empty,
      parent_email: :not_empty,
      primary_authentication_option: nil
    assert_authentication_options user, []
  end

  test 'convert email+password student' do
    user = create :student
    assert_empty user.email
    assert_convert_email_user user
    assert_empty user.primary_authentication_option.email
  end

  test 'convert email+password teacher' do
    user = create :teacher
    refute_empty user.email
    assert_convert_email_user user
    refute_empty user.primary_authentication_option.email
  end

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

  # TODO: Google Oauth user that also has a password
  # TODO: Microsoft Oauth
  # TODO: Facebook Oauth

  #
  # Untrusted email from Oauth:
  #

  # TODO: Clever Oauth user
  # TODO: Clever Oauth user that also has a password (due to takeover)
  # TODO: Powerschool Oauth
  # TODO: Powerschool Oauth user that also has a password (due to takeover)

  private

  def assert_convert_email_user(user)
    original_email = user.email
    original_hashed_email = user.hashed_email

    assert_nil user.provider
    refute_empty user.hashed_email
    refute_empty user.encrypted_password

    migrate user

    assert_equal original_email, user.email
    assert_equal original_hashed_email, user.hashed_email
    refute_empty user.encrypted_password

    # Check for email authentication option:
    # {
    #   email: 'teacher@example.org', // or '' for students
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

  #
  # Given an object and a hash mapping method or attribute names to expected
  # values, checks that each attribute has the expected value.
  #
  # Attribute names should all be symbols.  They can refer to attributes,
  # attr_readers, or methods that don't require arguments on the object.
  #
  # Expected values can be any literal object.  There are also some special
  # expected values that may be passed:
  #
  # :not_empty - refutes .empty? on the attribute.
  #
  def assert_attributes(obj, expected_values)
    expected_values.each do |attribute, expected_value|
      actual_value =
        if obj.respond_to? attribute
          obj.send attribute
        else
          obj[attribute]
        end
      failure_message = "Expected #{attribute} to be " \
        "#{expected_value.inspect} but was #{actual_value.inspect}"
      if expected_value == :not_empty
        refute_empty actual_value, failure_message
      elsif expected_value.nil?
        assert_nil actual_value, failure_message
      else
        assert_equal expected_value, actual_value, failure_message
      end
    end
  end

  def assert_authentication_options(user, expected_options)
    assert_equal expected_options.count, user.authentication_options.count
  end

  def migrate(user)
    refute user.migrated?
    result = user.migrate_to_multi_auth
    user.reload
    assert result, 'Expected migration to multi-auth to succeed, but it failed'
    assert user.migrated?
  end
end
