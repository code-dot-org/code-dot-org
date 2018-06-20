require 'test_helper'

class UserMultiAuthHelperTest < ActiveSupport::TestCase
  test 'does nothing if user is already migrated' do
    user = create :teacher, :with_migrated_email_authentication_option
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
    assert_user user,
      provider: User::PROVIDER_SPONSORED,
      sponsored?: true

    migrate user

    assert_user user,
      sponsored?: true,
      primary_authentication_option: nil,
      authentication_options: :empty
  end

  test 'convert sponsored username+password student' do
    # A student with provider "manual" has a username and password, but no email
    # or hashed email on file. This is a legacy account type.
    user = create :manual_username_password_student
    assert_user user,
      provider: User::PROVIDER_MANUAL,
      sponsored?: false,
      email: '',
      hashed_email: nil,
      username: :not_empty,
      encrypted_password: :not_empty

    migrate user

    # A migrated manual student has no authentication option rows because they
    # sign in with username+password or word/picture, and all of these values
    # are stored on the user row.
    assert_user user,
      sponsored?: false,
      email: '',
      hashed_email: '',
      username: :not_empty,
      encrypted_password: :not_empty,
      primary_authentication_option: nil,
      authentication_options: :empty
  end

  test 'convert parent-managed student' do
    # A parent-managed student signs in with a username and password.
    # Its provider is nil but it has a parent_email on file.
    # In practice it's identical to the "manual" type above.
    user = create :parent_managed_student
    assert_user user,
      provider: nil,
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
    assert_user user,
      sponsored?: false,
      email: '',
      hashed_email: '',
      username: :not_empty,
      encrypted_password: :not_empty,
      parent_email: :not_empty,
      primary_authentication_option: nil,
      authentication_options: :empty
  end

  test 'convert email+password student' do
    user = create :student
    assert_empty user.email
    assert_convert_email_user user
    assert_empty user.email
    assert_empty user.primary_authentication_option.email
  end

  test 'convert email+password teacher' do
    user = create :teacher
    refute_empty user.email
    assert_convert_email_user user
    refute_empty user.email
    refute_empty user.primary_authentication_option.email
  end

  def assert_convert_email_user(user)
    original_email = user.email
    original_hashed_email = user.hashed_email

    assert_user user,
      provider: nil,
      hashed_email: :not_empty,
      encrypted_password: :not_empty

    migrate user

    assert_user user,
      email: original_email,
      hashed_email: original_hashed_email,
      encrypted_password: :not_empty,
      primary_authentication_option: {
        credential_type: 'email',
        authentication_id: original_hashed_email,
        email: original_email,
        hashed_email: original_hashed_email,
        data: nil
      }
  end

  #
  # Trusted email from Oauth:
  #

  test 'convert Google OAuth student' do
    user = create(:google_oauth2_student)
    initial_hashed_email = user.hashed_email
    initial_authentication_id = user.uid
    initial_oauth_token = user.oauth_token
    initial_oauth_token_expiration = user.oauth_token_expiration
    initial_oauth_refresh_token = user.oauth_refresh_token

    assert_user user,
      provider: 'google_oauth2',
      email: :empty,
      hashed_email: :not_empty,
      uid: :not_nil,
      oauth_token: :not_nil,
      oauth_token_expiration: :not_nil,
      oauth_refresh_token: :not_nil

    migrate user

    assert_user user,
      email: :empty,
      hashed_email: initial_hashed_email,
      primary_authentication_option: {
        credential_type: 'google_oauth2',
        authentication_id: initial_authentication_id,
        email: :empty,
        hashed_email: initial_hashed_email,
        data: {
          oauth_token: initial_oauth_token,
          oauth_token_expiration: initial_oauth_token_expiration,
          oauth_refresh_token: initial_oauth_refresh_token
        }
      }
  end

  test 'convert Google OAuth teacher' do
    user = create(:google_oauth2_teacher)
    initial_email = user.email
    initial_hashed_email = user.hashed_email
    initial_authentication_id = user.uid
    initial_oauth_token = user.oauth_token
    initial_oauth_token_expiration = user.oauth_token_expiration
    initial_oauth_refresh_token = user.oauth_refresh_token

    assert_user user,
      provider: 'google_oauth2',
      email: :not_empty,
      hashed_email: :not_empty,
      uid: :not_nil,
      oauth_token: :not_nil,
      oauth_token_expiration: :not_nil,
      oauth_refresh_token: :not_nil

    migrate user

    assert_user user,
      email: initial_email,
      hashed_email: initial_hashed_email,
      primary_authentication_option: {
        credential_type: 'google_oauth2',
        authentication_id: initial_authentication_id,
        email: initial_email,
        hashed_email: initial_hashed_email,
        data: {
          oauth_token: initial_oauth_token,
          oauth_token_expiration: initial_oauth_token_expiration,
          oauth_refresh_token: initial_oauth_refresh_token
        }
      }
  end

  test 'convert Windows Live OAuth student' do
    user = create(:windowslive_student)
    initial_hashed_email = user.hashed_email
    initial_authentication_id = user.uid
    initial_oauth_token = user.oauth_token
    initial_oauth_token_expiration = user.oauth_token_expiration

    assert_user user,
      provider: 'windowslive',
      email: :empty,
      hashed_email: :not_empty,
      uid: :not_nil,
      oauth_token: :not_nil,
      oauth_token_expiration: :not_nil

    migrate user

    assert_user user,
      email: :empty,
      hashed_email: initial_hashed_email,
      primary_authentication_option: {
        credential_type: 'windowslive',
        authentication_id: initial_authentication_id,
        email: :empty,
        hashed_email: initial_hashed_email,
        data: {
          oauth_token: initial_oauth_token,
          oauth_token_expiration: initial_oauth_token_expiration
        }
      }
  end

  # TODO: Facebook Oauth

  #
  # Untrusted email from Oauth:
  #

  # TODO: Clever Oauth user
  # TODO: Clever Oauth user that also has a password (due to takeover)
  # TODO: Powerschool Oauth
  # TODO: Powerschool Oauth user that also has a password (due to takeover)

  private

  #
  # Assert a set of attributes about a user.
  # See assert_attributes for details.
  # Has special handling for :primary_authentication_option
  #
  def assert_user(user, expected_values)
    refute_nil user
    expected_primary_option = expected_values.delete(:primary_authentication_option)

    assert_attributes user, expected_values

    if expected_primary_option.nil?
      assert_nil user.primary_authentication_option
    elsif expected_primary_option
      assert_authentication_option user.primary_authentication_option, expected_primary_option
    end
  end

  #
  # Assert a set of attributes about an authentication option.
  # See assert_attributes for details.
  # Has special handling for :data
  #
  def assert_authentication_option(actual_option, expected_values)
    refute_nil actual_option
    expected_data = expected_values.delete(:data)

    assert_attributes actual_option, expected_values

    if expected_data.nil?
      assert_nil actual_option.data
    elsif expected_data
      actual_data = JSON.parse(actual_option.data).symbolize_keys
      assert_attributes actual_data, expected_data
    end
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
  # :not_nil - refutes .nil? on the attribute.
  # :empty - asserts .empty? on the attribute.
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
      if expected_value == :not_nil
        refute_nil actual_value, failure_message
      elsif expected_value == :empty
        assert_empty actual_value, failure_message
      elsif expected_value == :not_empty
        refute_empty actual_value, failure_message
      elsif expected_value.nil?
        assert_nil actual_value, failure_message
      else
        assert_equal expected_value, actual_value, failure_message
      end
    end
  end

  def migrate(user)
    refute user.migrated?
    result = user.migrate_to_multi_auth
    user.reload
    assert result, 'Expected migration to multi-auth to succeed, but it failed'
    assert user.migrated?
  end
end
