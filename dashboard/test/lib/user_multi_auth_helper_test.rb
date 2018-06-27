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
  # Sponsored accounts:
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
        credential_type: AuthenticationOption::EMAIL,
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
    assert_convert_google_user create(:student, :unmigrated_google_sso)
  end

  test 'convert Google OAuth teacher' do
    assert_convert_google_user create(:teacher, :unmigrated_google_sso)
  end

  test 'convert Windows Live OAuth student' do
    assert_convert_sso_user_with_oauth_token create(:student, :unmigrated_windowslive_sso)
  end

  test 'convert Windows Live OAuth teacher' do
    assert_convert_sso_user_with_oauth_token create(:teacher, :unmigrated_windowslive_sso)
  end

  test 'convert Facebook OAuth student' do
    assert_convert_sso_user_with_oauth_token create(:student, :unmigrated_facebook_sso)
  end

  test 'convert Facebook OAuth teacher' do
    assert_convert_sso_user_with_oauth_token create(:teacher, :unmigrated_facebook_sso)
  end

  def assert_convert_google_user(user)
    # Google Oauth has an additional token to move over compared to
    # other oauth providers
    initial_oauth_refresh_token = user.oauth_refresh_token
    assert_user user, oauth_refresh_token: :not_nil

    assert_convert_sso_user_with_oauth_token user

    assert_user user, primary_authentication_option: {
      data: {
        oauth_refresh_token: initial_oauth_refresh_token
      }
    }
  end

  #
  # Untrusted email from Oauth:
  #

  test 'convert Clever OAuth student' do
    assert_convert_sso_user_with_oauth_token create(:student, :unmigrated_clever_sso)
  end

  test 'convert Clever OAuth teacher' do
    assert_convert_sso_user_with_oauth_token create(:teacher, :unmigrated_clever_sso)
  end

  test 'convert Powerschool OAuth student' do
    assert_convert_sso_user_with_oauth_token create(:student, :unmigrated_powerschool_sso)
  end

  test 'convert Powerschool OAuth teacher' do
    assert_convert_sso_user_with_oauth_token create(:teacher, :unmigrated_powerschool_sso)
  end

  def assert_convert_sso_user_with_oauth_token(user)
    # Some Oauth accounts store an oauth token and expiration time
    initial_oauth_token = user.oauth_token
    initial_oauth_token_expiration = user.oauth_token_expiration
    assert_user user,
      oauth_token: :not_nil,
      oauth_token_expiration: :not_nil

    assert_convert_sso_user user

    assert_user user, primary_authentication_option: {
      data: {
        oauth_token: initial_oauth_token,
        oauth_token_expiration: initial_oauth_token_expiration
      }
    }
  end

  # At time of writing we have 6 The School Project students and 3 teachers.
  # These mostly look like test accounts, but presumably we want to continue
  # supporting them.

  test 'convert The School Project student' do
    assert_convert_sso_user create(:student, :unmigrated_the_school_project_sso)
  end

  test 'convert The School Project teacher' do
    assert_convert_sso_user create(:teacher, :unmigrated_the_school_project_sso)
  end

  # Our Twitter SSO support is very old - we have a few thousand such accounts
  # but less than 10 are still active.

  test 'convert Twitter student' do
    assert_convert_sso_user create(:student, :unmigrated_twitter_sso)
  end

  test 'convert Twitter teacher' do
    assert_convert_sso_user create(:teacher, :unmigrated_twitter_sso)
  end

  #
  # Learning Tools Interoperability (LTI) providers:
  # These seem to store no oauth tokens at all, only a uid.
  #

  # At time of writing, we have ~400 Qwiklabs student accounts, no teachers.
  # That doesn't mean we couldn't end up with a teacher account though.

  test 'convert Qwiklabs LTI student' do
    assert_convert_lti_user create(:student, :unmigrated_qwiklabs_sso)
  end

  test 'convert Qwiklabs LTI teacher' do
    assert_convert_lti_user create(:teacher, :unmigrated_qwiklabs_sso)
  end

  def assert_convert_lti_user(user)
    assert_convert_sso_user user

    assert_user user, primary_authentication_option: {
      data: nil
    }
  end

  def assert_convert_sso_user(user)
    provider = user.provider
    initial_email = user.email
    initial_hashed_email = user.hashed_email
    initial_authentication_id = user.uid

    is_email_trusted = %w(facebook google_oauth2 windowslive).include? provider

    # Assert email remains empty for students
    expected_email = user.student? ? :empty : initial_email

    # Before migration hashed_email can be nil for untrusted provide
    # But it's not-nullable in AuthenticationOption
    expected_hashed_email = initial_hashed_email.nil? ? '' : initial_hashed_email

    assert_user user,
      provider: provider,
      email: user.student? ? :empty : :not_empty,
      hashed_email: is_email_trusted ? :not_empty : initial_hashed_email,
      uid: :not_nil

    migrate user

    assert_user user,
      email: expected_email,
      hashed_email: expected_hashed_email,
      primary_authentication_option: {
        credential_type: provider,
        authentication_id: initial_authentication_id,
        email: expected_email,
        hashed_email: expected_hashed_email
      }
  end

  test 'migrate and demigrate picture password student' do
    round_trip_sponsored create :student_in_picture_section
  end

  test 'migrate and demigrate word password student' do
    round_trip_sponsored create :student_in_word_section
  end

  def round_trip_sponsored(for_user)
    round_trip for_user do |user|
      assert_user user,
        provider: User::PROVIDER_SPONSORED,
        sponsored?: true
    end
  end

  test 'migrate and demigrate sponsored username+password student' do
    round_trip create(:manual_username_password_student) do |user|
      assert_user user,
        provider: User::PROVIDER_MANUAL,
        sponsored?: false,
        email: '',
        hashed_email: nil,
        username: :not_empty,
        encrypted_password: :not_empty
    end
  end

  test 'migrate and demigrate parent-managed student' do
    round_trip create(:parent_managed_student) do |user|
      assert_user user,
        provider: nil,
        sponsored?: false,
        email: '',
        hashed_email: nil,
        username: :not_empty,
        encrypted_password: :not_empty,
        parent_email: :not_empty
    end
  end

  test 'migrate and demigrate email+password student' do
    round_trip_email create(:student) do |user|
      assert_user user, email: :empty
    end
  end

  test 'migrate and demigrate email+password teacher' do
    round_trip_email create(:teacher) do |user|
      assert_user user, email: :not_empty
    end
  end

  def round_trip_email(for_user)
    round_trip for_user do |user|
      yield user
      assert_user user,
        provider: nil,
        hashed_email: :not_empty,
        encrypted_password: :not_empty,
        primary_authentication_option: nil
    end
  end

  test 'migrate and demigrate Google OAuth student' do
    round_trip_google_user create(:student, :unmigrated_google_sso)
  end

  test 'migrate and demigrate Google OAuth teacher' do
    round_trip_google_user create(:teacher, :unmigrated_google_sso)
  end

  def round_trip_google_user(for_user)
    initial_oauth_refresh_token = for_user.oauth_refresh_token
    refute_nil initial_oauth_refresh_token
    round_trip_sso_with_token for_user do |user|
      assert_user user, oauth_refresh_token: initial_oauth_refresh_token
    end
  end

  test 'migrate and demigrate Windows Live OAuth student' do
    round_trip_sso_with_token create(:student, :unmigrated_windowslive_sso)
  end

  test 'migrate and demigrate Windows Live OAuth teacher' do
    round_trip_sso_with_token create(:teacher, :unmigrated_windowslive_sso)
  end

  test 'migrate and demigrate Facebook OAuth student' do
    round_trip_sso_with_token create(:student, :unmigrated_facebook_sso)
  end

  test 'migrate and demigrate Facebook OAuth teacher' do
    round_trip_sso_with_token create(:teacher, :unmigrated_facebook_sso)
  end

  test 'migrate and demigrate Clever OAuth student' do
    round_trip_sso_with_token create(:student, :unmigrated_clever_sso)
  end

  test 'migrate and demigrate Clever OAuth teacher' do
    round_trip_sso_with_token create(:teacher, :unmigrated_clever_sso)
  end

  test 'migrate and demigrate Powerschool OAuth student' do
    round_trip_sso_with_token create(:student, :unmigrated_powerschool_sso)
  end

  test 'migrate and demigrate Powerschool OAuth teacher' do
    round_trip_sso_with_token create(:teacher, :unmigrated_powerschool_sso)
  end

  def round_trip_sso_with_token(for_user)
    initial_oauth_token = for_user.oauth_token
    initial_oauth_token_expiration = for_user.oauth_token_expiration
    refute_nil initial_oauth_token
    refute_nil initial_oauth_token_expiration
    round_trip_sso for_user do |user|
      assert_user user,
        oauth_token: initial_oauth_token,
        oauth_token_expiration: initial_oauth_token_expiration
    end
  end

  test 'migrate and demigrate The School Project student' do
    round_trip_sso create(:student, :unmigrated_the_school_project_sso)
  end

  test 'migrate and demigrate The School Project teacher' do
    round_trip_sso create(:teacher, :unmigrated_the_school_project_sso)
  end

  test 'migrate and demigrate Twitter student' do
    round_trip_sso create(:student, :unmigrated_twitter_sso)
  end

  test 'migrate and demigrate Twitter teacher' do
    round_trip_sso create(:teacher, :unmigrated_twitter_sso)
  end

  test 'migrate and demigrate Qwiklabs LTI student' do
    round_trip_sso create(:student, :unmigrated_qwiklabs_sso)
  end

  test 'migrate and demigrate Qwiklabs LTI teacher' do
    round_trip_sso create(:teacher, :unmigrated_qwiklabs_sso)
  end

  def round_trip_sso(for_user)
    provider = for_user.provider
    initial_email = for_user.email
    initial_hashed_email = for_user.hashed_email
    initial_authentication_id = for_user.uid

    refute_nil provider
    refute_nil initial_authentication_id

    round_trip for_user do |user|
      assert_user user,
        provider: provider,
        email: initial_email,
        hashed_email: initial_hashed_email,
        uid: initial_authentication_id
    end
  end

  private

  #
  # Assert a set of attributes about a user.
  # See assert_attributes for details.
  # Has special handling for :primary_authentication_option
  #
  def assert_user(user, expected_values)
    refute_nil user
    asserts_primary_authentication_option = expected_values.key? :primary_authentication_option
    expected_primary_option = expected_values.delete(:primary_authentication_option)

    assert_attributes user, expected_values

    return unless asserts_primary_authentication_option
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
    asserts_data = expected_values.key? :data
    expected_data = expected_values.delete(:data)

    assert_attributes actual_option, expected_values

    return unless asserts_data
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

  # Migrates and then de-migrates a user
  # Requires a block containing assertions to be run before and after the
  # migration, showing that the user is returned to its initial state.
  def round_trip(user)
    yield user

    refute user.migrated?
    migration_result = user.migrate_to_multi_auth
    demigration_result = user.demigrate_from_multi_auth
    user.reload
    assert migration_result
    assert demigration_result
    refute user.migrated?

    yield user
  end
end
