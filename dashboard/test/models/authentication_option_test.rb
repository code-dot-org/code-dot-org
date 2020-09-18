require 'test_helper'

class AuthenticationOptionTest < ActiveSupport::TestCase
  test 'after create sets primary_contact_info on user if contact info is nil' do
    user = create :user
    user.primary_contact_info = nil
    auth_option = create :authentication_option, user: user
    assert_equal auth_option, user.primary_contact_info
  end

  test 'after create does not set primary_contact_info on user if contact info is present' do
    user = create :user, primary_contact_info: create(:authentication_option)
    auth_option = create :authentication_option, user: user
    refute_equal auth_option, user.primary_contact_info
  end

  test 'migrated user email and hashed email look at authentication_options' do
    original_teacher_email = 'testteacher@xyz.foo'
    new_teacher_email = 'awesometeacher@xyz.foo'
    teacher = create(:teacher, email: original_teacher_email)
    email_auth = create(:authentication_option, user: teacher, email: new_teacher_email)
    teacher.update(primary_contact_info: email_auth, provider: 'migrated')
    assert_equal teacher.primary_contact_info_id, email_auth.id
    assert_equal new_teacher_email, teacher.email
    assert_equal AuthenticationOption.hash_email(new_teacher_email), teacher.hashed_email
  end

  test 'email is properly sanitized and hashed' do
    teacher_email = 'TESTcaseSANITIZATION@test.com'
    sanitized = 'testcasesanitization@test.com'
    teacher = create(:teacher, email: teacher_email)
    email_auth = teacher.primary_contact_info
    assert_equal sanitized, email_auth.email
    assert_equal email_auth.hashed_email, AuthenticationOption.hash_email(sanitized)
  end

  test 'student email is not stored but hashed_email is' do
    student_email = 'teststudent@test.com'
    student = create(:student, email: student_email)
    email_auth = student.primary_contact_info
    assert email_auth.user.student?
    assert_equal '', email_auth.email
    assert_equal student.hashed_email, email_auth.hashed_email
  end

  test 'invalid if credential_type and authentication_id combo is not unique' do
    cred_type = AuthenticationOption::GOOGLE
    auth_id = '54321'
    create :authentication_option, credential_type: cred_type, authentication_id: auth_id
    new_auth_option = build :authentication_option, credential_type: cred_type, authentication_id: auth_id
    refute new_auth_option.valid?
    assert_equal ['Authentication has already been taken'], new_auth_option.errors.full_messages
  end

  test 'deleted authentication options do not affect uniqueness' do
    cred_type = AuthenticationOption::GOOGLE
    auth_id = '54321'
    first_auth_option = create :authentication_option, credential_type: cred_type, authentication_id: auth_id
    new_auth_option = build :authentication_option, credential_type: cred_type, authentication_id: auth_id
    refute new_auth_option.valid?
    first_auth_option.delete
    assert new_auth_option.valid?
  end

  test 'user can have multiple authentication options' do
    assert_creates(User) do
      user = create(:user, :with_google_authentication_option, :with_clever_authentication_option)
      assert_equal 3, user.authentication_options.length
      assert_equal user.hashed_email, user.authentication_options.first.hashed_email
    end
  end

  test 'student in word section can have no authentication options' do
    user = create(:student_in_word_section)
    assert_empty user.authentication_options
  end

  test 'destroying user destroys authentication options and we can restore them' do
    user = create(:user, :with_google_authentication_option)
    authentication_option_id = user.authentication_options.first.id
    user.destroy
    authentication_option = AuthenticationOption.with_deleted.where(id: authentication_option_id).first
    assert authentication_option.deleted?
    assert user.deleted?
    user.restore(recursive: true)
    refute user.deleted?
    refute user.authentication_options.first.deleted?
  end

  test 'oauth? false when credential_type is email' do
    option = create :authentication_option, credential_type: AuthenticationOption::EMAIL
    refute option.oauth?
  end

  test 'oauth? true when credential_type is Clever' do
    option = create :authentication_option, credential_type: AuthenticationOption::CLEVER
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Facebook' do
    option = create :authentication_option, credential_type: AuthenticationOption::FACEBOOK
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Google' do
    option = create :authentication_option, credential_type: AuthenticationOption::GOOGLE
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Powerschool' do
    option = create :authentication_option, credential_type: AuthenticationOption::POWERSCHOOL
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Quikcamps' do
    option = create :authentication_option, credential_type: AuthenticationOption::QWIKLABS
    assert option.oauth?
  end

  test 'oauth? true when credential_type is The School Project' do
    option = create :authentication_option, credential_type: AuthenticationOption::THE_SCHOOL_PROJECT
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Twitter' do
    option = create :authentication_option, credential_type: AuthenticationOption::TWITTER
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Windows Live' do
    option = create :authentication_option, credential_type: AuthenticationOption::WINDOWS_LIVE
    assert option.oauth?
  end

  test 'primary?' do
    user = create(:user)

    assert_equal 1, user.authentication_options.count
    refute_nil user.primary_contact_info
    old_primary_ao = user.primary_contact_info
    assert old_primary_ao.primary?

    google_ao = create(:google_authentication_option, user: user)
    user.update!(primary_contact_info: google_ao)
    old_primary_ao.reload

    assert google_ao.primary?
    refute old_primary_ao.primary?
  end

  test 'update_oauth_credential_tokens raises an error if auth option is not oauth' do
    not_oauth = build :authentication_option, credential_type: AuthenticationOption::EMAIL
    assert_raises(RuntimeError) do
      not_oauth.update_oauth_credential_tokens({})
    end
  end

  test 'update_oauth_credential_tokens updates data on auth option with new tokens' do
    old_data = {
      oauth_token: 'abcdef',
      oauth_refresh_token: '123456',
      oauth_token_expiration: Time.now.to_i,
      some_other_data: 'hello-world'
    }
    auth_option = create :google_authentication_option, data: old_data.to_json
    new_token = 'fedcba'
    new_refresh_token = '654321'
    new_expiration = Time.now.to_i + 100
    credentials = {
      token: new_token,
      refresh_token: new_refresh_token,
      expires_at: new_expiration
    }

    auth_option.update_oauth_credential_tokens(credentials)
    auth_option.reload
    new_data = {
      oauth_token: new_token,
      oauth_refresh_token: new_refresh_token,
      oauth_token_expiration: new_expiration,
      some_other_data: 'hello-world'
    }
    assert_equal new_data, auth_option.data_hash
  end

  test "factory: :authentication_option" do
    option = create :authentication_option
    assert option.valid?
    assert option.persisted?
    assert_equal AuthenticationOption::EMAIL, option.credential_type

    # Default user is a student so email is empty
    assert option.user.student?
    assert_empty option.email

    refute_empty option.hashed_email
    assert_equal option.hashed_email, option.authentication_id
  end

  test "factory: :authentication_option for teacher" do
    option = create :authentication_option, user: create(:teacher)
    assert option.valid?
    assert option.persisted?
    assert_equal AuthenticationOption::EMAIL, option.credential_type

    assert option.user.teacher?
    refute_empty option.email

    refute_empty option.hashed_email
    assert_equal option.hashed_email, option.authentication_id
  end

  test "factory: :google_authentication_option" do
    option = create :google_authentication_option
    assert option.valid?
    assert option.persisted?
    assert_equal AuthenticationOption::GOOGLE, option.credential_type

    # Default user is a student so email is empty
    assert option.user.student?
    assert_empty option.email

    refute_empty option.hashed_email
    refute_empty option.authentication_id
  end

  test "factory: :facebook_authentication_option" do
    option = create :facebook_authentication_option
    assert option.valid?
    assert option.persisted?
    assert_equal AuthenticationOption::FACEBOOK, option.credential_type

    # Default user is a student so email is empty
    assert option.user.student?
    assert_empty option.email

    refute_empty option.hashed_email
    refute_empty option.authentication_id
  end

  test "email must be unique for trusted credential types" do
    # For most credential types, we trust that the email provided by the
    # credential can also be used to identify the user (for example, when a
    # user authenticates with google we can trust that they are also
    # authenticated to use the email associated with their google account).
    #
    # Therefore, we enforce that a credential with that email can only be
    # associated with a user account that has that email.
    AuthenticationOption::TRUSTED_EMAIL_CREDENTIAL_TYPES.each do |credential_type|
      option = build :authentication_option, credential_type: credential_type
      create(:user, email: option.email)
      refute option.valid?
    end
  end

  test "email does not have to be unique for untrusted credential types" do
    # For some of our credential types, we cannot trust that the email provided
    # by the credential can also be used to identify the user (for example,
    # when a user authenticates with clever we cannot trust that they are also
    # authenticated to use the email associated with their clever account,
    # because clever does not verify emails).
    #
    # Therefore, we allow a user account to use a credential with that email
    # even if there already exists a different user account with that same
    # email.
    AuthenticationOption::UNTRUSTED_EMAIL_CREDENTIAL_TYPES.each do |credential_type|
      option = build :authentication_option, credential_type: credential_type
      create(:user, email: option.email)
      assert option.valid?
    end
  end

  test "untrusted emails do not violate uniqueness for trusted emails" do
    untrusted = create :authentication_option,
      credential_type: AuthenticationOption::UNTRUSTED_EMAIL_CREDENTIAL_TYPES.sample
    assert untrusted.valid?

    trusted = create :authentication_option,
      email: untrusted.email,
      hashed_email: untrusted.hashed_email,
      credential_type: AuthenticationOption::TRUSTED_EMAIL_CREDENTIAL_TYPES.sample
    assert trusted.valid?
  end
end
