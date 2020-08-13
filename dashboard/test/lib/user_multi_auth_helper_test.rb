require 'test_helper'

class UserMultiAuthHelperTest < ActiveSupport::TestCase
  test 'oauth_tokens_for_provider returns correct tokens for migrated teacher' do
    user = create :teacher, :with_google_authentication_option, :with_clever_authentication_option
    google_token = user.oauth_tokens_for_provider(AuthenticationOption::GOOGLE)[:oauth_token]
    google_expiration = user.oauth_tokens_for_provider(AuthenticationOption::GOOGLE)[:oauth_token_expiration]
    google_refresh_token = user.oauth_tokens_for_provider(AuthenticationOption::GOOGLE)[:oauth_refresh_token]
    clever_token = user.oauth_tokens_for_provider(AuthenticationOption::CLEVER)[:oauth_token]
    email_token = user.oauth_tokens_for_provider(AuthenticationOption::EMAIL)[:oauth_token]
    garbage_token = user.oauth_tokens_for_provider('garbage_value')[:oauth_token]
    assert_equal 'some-google-token', google_token
    assert_equal '999999', google_expiration
    assert_equal 'some-google-refresh-token', google_refresh_token
    assert_equal 'some-clever-token', clever_token
    assert_nil email_token
    assert_nil garbage_token
  end

  test 'oauth_tokens_for_provider returns most recently updated tokens for migrated teacher' do
    Timecop.freeze do
      user = create :teacher
      create :authentication_option, credential_type: AuthenticationOption::CLEVER, user: user, data: {
        oauth_token: 'old-clever-token'
      }.to_json
      Timecop.travel(1.minute) do
        create :authentication_option, credential_type: AuthenticationOption::CLEVER, user: user, data: {
          oauth_token: 'newer-clever-token'
        }.to_json
        clever_token = user.oauth_tokens_for_provider(AuthenticationOption::CLEVER)[:oauth_token]
        assert_equal 'newer-clever-token', clever_token
      end
    end
  end

  test 'oauth_tokens_for_provider returns nil values for migrated email teacher' do
    user = create :teacher
    google_token = user.oauth_tokens_for_provider(AuthenticationOption::GOOGLE)[:oauth_token]
    google_expiration = user.oauth_tokens_for_provider(AuthenticationOption::GOOGLE)[:oauth_token_expiration]
    google_refresh_token = user.oauth_tokens_for_provider(AuthenticationOption::GOOGLE)[:oauth_refresh_token]
    clever_token = user.oauth_tokens_for_provider(AuthenticationOption::CLEVER)[:oauth_token]
    email_token = user.oauth_tokens_for_provider(AuthenticationOption::EMAIL)[:oauth_token]
    garbage_token = user.oauth_tokens_for_provider('garbage_value')[:oauth_token]
    assert_nil google_token
    assert_nil google_expiration
    assert_nil google_refresh_token
    assert_nil clever_token
    assert_nil email_token
    assert_nil garbage_token
  end

  # The following two tests check the oauth_tokens_for_provider logic for demigrated teachers, and
  # can be deleted after we migrate all users to multiauth
  test 'oauth_tokens_for_provider returns correct token for demigrated Google teacher' do
    user = create :teacher, :google_sso_provider, :demigrated
    google_token = user.oauth_tokens_for_provider(AuthenticationOption::GOOGLE)[:oauth_token]
    google_expiration = user.oauth_tokens_for_provider(AuthenticationOption::GOOGLE)[:oauth_token_expiration]
    google_refresh_token = user.oauth_tokens_for_provider(AuthenticationOption::GOOGLE)[:oauth_refresh_token]
    assert_equal 'fake-oauth-token', google_token
    assert_equal 'fake-oauth-token-expiration', google_expiration
    assert_equal 'fake-oauth-refresh-token', google_refresh_token
  end

  test 'oauth_tokens_for_provider returns correct token for demigrated Clever teacher' do
    user = create :teacher, :clever_sso_provider, :demigrated
    clever_token = user.oauth_tokens_for_provider(AuthenticationOption::CLEVER)[:oauth_token]
    assert_equal 'fake-oauth-token', clever_token
  end

  test 'does nothing if user is already migrated' do
    user = create :teacher
    assert user.migrated?

    user.expects(:save).never
    assert user.migrate_to_multi_auth
    user.reload

    assert user.migrated?
  end

  test 'raises error if attempting to create a second account with the same oauth' do
    create :user, provider: 'google_oauth2', uid: 'fake-oauth-id'
    assert_raises ActiveRecord::RecordInvalid do
      create :user, provider: 'google_oauth2', uid: 'fake-oauth-id'
    end
  end

  #
  # Sponsored accounts:
  # Picture and word password students have no authentication_options.
  #

  test 'create migrated sponsored picture password student' do
    assert_created_sponsored_student create :student_in_picture_section
  end

  test 'create migrated sponsored word password student' do
    assert_created_sponsored_student create :student_in_word_section
  end

  def assert_created_sponsored_student(user)
    assert_user user,
      migrated?: true,
      sponsored?: true,
      primary_contact_info: nil,
      authentication_options: :empty
  end

  test 'create migrated sponsored username+password student' do
    # A migrated manual student has no authentication option rows because they
    # sign in with username+password or word/picture, and all of these values
    # are stored on the user row.
    user = create :manual_username_password_student
    assert_user user,
      migrated?: true,
      sponsored?: false,
      email: '',
      hashed_email: '',
      username: :not_empty,
      encrypted_password: :not_empty,
      primary_contact_info: nil,
      authentication_options: :empty
  end

  test 'create migrated parent-managed student' do
    # A migrated parent-managed student has no authentication option rows
    # because they sign in with username+password or word/picture, and all of
    # these values are stored on the user row.
    user = create :parent_managed_student
    assert_user user,
      migrated?: true,
      sponsored?: false,
      email: '',
      hashed_email: '',
      username: :not_empty,
      encrypted_password: :not_empty,
      parent_email: :not_empty,
      primary_contact_info: nil,
      authentication_options: :empty
  end

  test 'create migrated email+password student' do
    user = create :student
    assert_empty user.email
    assert_created_email_user user
  end

  test 'create migrated email+password teacher' do
    user = create :teacher
    refute_empty user.email
    assert_created_email_user user
  end

  def assert_created_email_user(user)
    email = user.email
    hashed_email = user.hashed_email

    refute_empty hashed_email

    assert_user user,
      encrypted_password: :not_empty,
      primary_contact_info: {
        credential_type: AuthenticationOption::EMAIL,
        authentication_id: hashed_email,
        email: email,
        hashed_email: hashed_email,
        data: nil
      }
  end

  #
  # Trusted email from Oauth:
  #

  test 'create migrated Google OAuth student' do
    assert_created_google_user create(:student, :google_sso_provider)
  end

  test 'create migrated Google OAuth teacher' do
    assert_created_google_user create(:teacher, :google_sso_provider)
  end

  test 'create migrated Windows Live OAuth student' do
    assert_created_sso_user_with_oauth_token create(:student, :windowslive_sso_provider)
  end

  test 'create migrated Windows Live OAuth teacher' do
    assert_created_sso_user_with_oauth_token create(:teacher, :windowslive_sso_provider)
  end

  test 'create migrated Facebook OAuth student' do
    assert_created_sso_user_with_oauth_token create(:student, :facebook_sso_provider)
  end

  test 'create migrated Facebook OAuth teacher' do
    assert_created_sso_user_with_oauth_token create(:teacher, :facebook_sso_provider)
  end

  def assert_created_google_user(user)
    # Google Oauth has an additional token to move over compared to
    # other oauth providers
    assert_created_sso_user_with_oauth_token user

    assert_user user, primary_contact_info: {
      data: {
        oauth_refresh_token: :not_nil
      }
    }
  end

  #
  # Untrusted email from Oauth:
  #

  test 'create migrated Clever OAuth student' do
    assert_created_sso_user_with_oauth_token create(:student, :clever_sso_provider)
  end

  test 'create migrated Clever OAuth teacher' do
    assert_created_sso_user_with_oauth_token create(:teacher, :clever_sso_provider)
  end

  test 'create migrated Powerschool OAuth student' do
    assert_created_sso_user_with_oauth_token create(:student, :powerschool_sso_provider)
  end

  test 'create migrated Powerschool OAuth teacher' do
    assert_created_sso_user_with_oauth_token create(:teacher, :powerschool_sso_provider)
  end

  def assert_created_sso_user_with_oauth_token(user)
    # Some Oauth accounts store an oauth token and expiration time
    assert_created_sso_user user

    assert_user user, primary_contact_info: {
      data: {
        oauth_token: :not_nil,
        oauth_token_expiration: :not_nil
      }
    }
  end

  # At time of writing we have 6 The School Project students and 3 teachers.
  # These mostly look like test accounts, but presumably we want to continue
  # supporting them.

  test 'create migrated The School Project student' do
    assert_created_sso_user create(:student, :the_school_project_sso_provider)
  end

  test 'create migrated The School Project teacher' do
    assert_created_sso_user create(:teacher, :the_school_project_sso_provider)
  end

  # Our Twitter SSO support is very old - we have a few thousand such accounts
  # but less than 10 are still active.

  test 'create migrated Twitter student' do
    assert_created_sso_user create(:student, :twitter_sso_provider)
  end

  test 'create migrated Twitter teacher' do
    assert_created_sso_user create(:teacher, :twitter_sso_provider)
  end

  #
  # Learning Tools Interoperability (LTI) providers:
  # These seem to store no oauth tokens at all, only a uid.
  #

  # At time of writing, we have ~400 Qwiklabs student accounts, no teachers.
  # That doesn't mean we couldn't end up with a teacher account though.

  test 'create migrated Qwiklabs LTI student' do
    assert_created_lti_user create(:student, :qwiklabs_sso_provider)
  end

  test 'create migrated Qwiklabs LTI teacher' do
    assert_created_lti_user create(:teacher, :qwiklabs_sso_provider)
  end

  def assert_created_lti_user(user)
    assert_created_sso_user user

    assert_user user, primary_contact_info: {
      data: nil
    }
  end

  def assert_created_sso_user(user)
    initial_email = user.email
    initial_hashed_email = user.hashed_email
    initial_authentication_id = user.primary_contact_info.authentication_id

    # Assert email remains empty for students
    expected_email = user.student? ? :empty : initial_email

    # Before migration hashed_email can be nil for untrusted provide
    # But it's not-nullable in AuthenticationOption
    expected_hashed_email = initial_hashed_email.nil? ? '' : initial_hashed_email

    assert_user user,
      email: expected_email,
      hashed_email: expected_hashed_email,
      primary_contact_info: {
        oauth?: true,
        authentication_id: initial_authentication_id,
        email: expected_email,
        hashed_email: expected_hashed_email
      }
  end

  test 'migration clears single-auth fields' do
    user = create :teacher, :google_sso_provider

    assert_user user,
      uid: nil,
      oauth_token: nil,
      oauth_token_expiration: nil,
      oauth_refresh_token: nil,
      primary_contact_info: {
        authentication_id: :not_nil,
        data: {
          oauth_token: :not_nil,
          oauth_token_expiration: :not_nil,
          oauth_refresh_token: :not_nil
        }
      }
    # Does not clear email or hashed_email fields
    refute_empty user.read_attribute(:email)
    refute_nil user.read_attribute(:hashed_email)
  end

  test 'de- and re-migrate picture password student' do
    round_trip_sponsored create :student_in_picture_section
  end

  test 'de- and re-migrate word password student' do
    round_trip_sponsored create :student_in_word_section
  end

  def round_trip_sponsored(for_user)
    round_trip for_user do |user|
      assert_user user,
        provider: User::PROVIDER_MIGRATED,
        sponsored?: true
    end
  end

  test 'de- and re-migrate sponsored username+password student' do
    round_trip create(:manual_username_password_student) do |user|
      assert_user user,
        provider: User::PROVIDER_MIGRATED,
        sponsored?: false,
        email: '',
        hashed_email: '',
        username: :not_empty,
        encrypted_password: :not_empty
    end
  end

  test 'de- and re-migrate parent-managed student' do
    round_trip create(:parent_managed_student) do |user|
      assert_user user,
        provider: User::PROVIDER_MIGRATED,
        sponsored?: false,
        email: '',
        hashed_email: '',
        username: :not_empty,
        encrypted_password: :not_empty,
        parent_email: :not_empty
    end
  end

  test 'de- and re-migrate email+password student' do
    round_trip_email create(:student) do |user|
      assert_user user, email: :empty
    end
  end

  test 'de- and re-migrate email+password teacher' do
    round_trip_email create(:teacher) do |user|
      assert_user user, email: :not_empty
    end
  end

  def round_trip_email(for_user)
    round_trip for_user do |user|
      yield user
      assert_user user,
        provider: User::PROVIDER_MIGRATED,
        encrypted_password: :not_empty,
        primary_contact_info: {
          credential_type: AuthenticationOption::EMAIL,
          hashed_email: :not_empty,
        }
    end
  end

  test 'de- and re-migrate Google OAuth student' do
    round_trip_google_user create(:student, :google_sso_provider)
  end

  test 'de- and re-migrate Google OAuth teacher' do
    round_trip_google_user create(:teacher, :google_sso_provider)
  end

  def round_trip_google_user(for_user)
    initial_oauth_refresh_token = for_user.primary_contact_info.data_hash[:oauth_refresh_token]
    refute_nil initial_oauth_refresh_token
    round_trip_sso_with_token for_user do |user|
      assert_user user, primary_contact_info: {
        data: {
          oauth_refresh_token: initial_oauth_refresh_token
        }
      }
    end
  end

  test 'de- and re-migrate Windows Live OAuth student' do
    round_trip_sso_with_token create(:student, :windowslive_sso_provider)
  end

  test 'de- and re-migrate Windows Live OAuth teacher' do
    round_trip_sso_with_token create(:teacher, :windowslive_sso_provider)
  end

  test 'de- and re-migrate Facebook OAuth student' do
    round_trip_sso_with_token create(:student, :facebook_sso_provider)
  end

  test 'de- and re-migrate Facebook OAuth teacher' do
    round_trip_sso_with_token create(:teacher, :facebook_sso_provider)
  end

  test 'de- and re-migrate Clever OAuth student' do
    round_trip_sso_with_token create(:student, :clever_sso_provider)
  end

  test 'de- and re-migrate Clever OAuth teacher' do
    round_trip_sso_with_token create(:teacher, :clever_sso_provider)
  end

  test 'de- and re-migrate Powerschool OAuth student' do
    round_trip_sso_with_token create(:student, :powerschool_sso_provider)
  end

  test 'de- and re-migrate Powerschool OAuth teacher' do
    round_trip_sso_with_token create(:teacher, :powerschool_sso_provider)
  end

  def round_trip_sso_with_token(for_user)
    initial_oauth_token = for_user.primary_contact_info.data_hash[:oauth_token]
    initial_oauth_token_expiration = for_user.primary_contact_info.data_hash[:oauth_token_expiration]
    refute_nil initial_oauth_token
    refute_nil initial_oauth_token_expiration
    round_trip_sso for_user do |user|
      yield user if block_given?
      assert_user user,
        primary_contact_info: {
          data: {
            oauth_token: initial_oauth_token,
            oauth_token_expiration: initial_oauth_token_expiration
          }
        }
    end
  end

  test 'de- and re-migrate The School Project student' do
    round_trip_sso create(:student, :the_school_project_sso_provider)
  end

  test 'de- and re-migrate The School Project teacher' do
    round_trip_sso create(:teacher, :the_school_project_sso_provider)
  end

  test 'de- and re-migrate Twitter student' do
    round_trip_sso create(:student, :twitter_sso_provider)
  end

  test 'de- and re-migrate Twitter teacher' do
    round_trip_sso create(:teacher, :twitter_sso_provider)
  end

  test 'de- and re-migrate Qwiklabs LTI student' do
    round_trip_sso create(:student, :qwiklabs_sso_provider)
  end

  test 'de- and re-migrate Qwiklabs LTI teacher' do
    round_trip_sso create(:teacher, :qwiklabs_sso_provider)
  end

  def round_trip_sso(for_user)
    provider = for_user.provider
    initial_email = for_user.email
    initial_hashed_email = for_user.hashed_email
    initial_authentication_id = for_user.primary_contact_info.authentication_id

    refute_nil provider
    refute_nil initial_authentication_id

    round_trip for_user do |user|
      yield user if block_given?
      assert_user user,
        provider: provider,
        email: initial_email,
        hashed_email: initial_hashed_email,
        primary_contact_info: {
          authentication_id: initial_authentication_id
        }
    end
  end

  private

  #
  # Assert a set of attributes about a user.
  # See assert_attributes for details.
  # Has special handling for :primary_contact_info
  #
  def assert_user(user, expected_values)
    refute_nil user
    asserts_primary_contact_info = expected_values.key? :primary_contact_info
    expected_primary_option = expected_values.delete(:primary_contact_info)

    assert_attributes user, expected_values

    return unless asserts_primary_contact_info
    if expected_primary_option.nil?
      assert_nil user.primary_contact_info
    elsif expected_primary_option
      assert_authentication_option user.primary_contact_info, expected_primary_option
    end
  end

  def migrate(user)
    refute user.migrated?
    result = user.migrate_to_multi_auth
    user.reload
    assert result, 'Expected migration to multi-auth to succeed, but it failed'
    assert user.migrated?
  end

  # De-migrates and then re-migrates a user
  # Requires a block containing assertions to be run before and after the
  # demigration, showing that the user is returned to its initial state.
  def round_trip(user)
    yield user

    assert user.migrated?

    demigration_result = user.demigrate_from_multi_auth
    migration_result = user.migrate_to_multi_auth

    user.reload

    assert demigration_result
    assert migration_result

    assert user.migrated?

    yield user
  end
end
