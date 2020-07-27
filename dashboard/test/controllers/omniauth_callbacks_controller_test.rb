require 'test_helper'

class OmniauthCallbacksControllerTest < ActionController::TestCase
  include Mocha::API
  include UsersHelper
  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup do
    @request.env["devise.mapping"] = Devise.mappings[:user]
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
  end

  test "login: authorizing with known facebook account signs in" do
    user = create(:user, provider: 'facebook', uid: '1111')

    @request.env['omniauth.auth'] = OmniAuth::AuthHash.new(provider: 'facebook', uid: '1111')
    @request.env['omniauth.params'] = {}

    get :facebook

    assert_equal user.id, signed_in_user_id
  end

  test "login: authorizing with unknown facebook account needs additional information" do
    auth = OmniAuth::AuthHash.new(
      uid: '1111',
      provider: 'facebook',
      info: {
        nickname: '',
        name: 'someone',
        email: nil,
        user_type: nil,
        dob: nil,
        gender: nil
      },
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_does_not_create(User) do
      get :facebook
    end

    assert_redirected_to 'http://test.host/users/sign_up'
    partial_user = User.new_from_partial_registration(session)
    assert_empty partial_user.email
    assert_nil partial_user.age
  end

  test "login: authorizing with unknown clever teacher account" do
    auth = OmniAuth::AuthHash.new(
      uid: '1111',
      provider: 'clever',
      info: {
        nickname: '',
        name: {'first' => 'Hat', 'last' => 'Cat'},
        email: 'first_last@clever-teacher.xx',
        user_type: 'teacher',
        dob: nil,
        gender: nil
      },
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_creates(User) do
      get :clever
    end

    user = User.last
    assert_equal 'clever', user.primary_contact_info.credential_type
    assert_equal 'Hat Cat', user.name
    assert_equal User::TYPE_TEACHER, user.user_type
    assert_equal "21+", user.age # we know you're an adult if you are a teacher on clever
    assert_nil user.gender
    assert_equal user.id, signed_in_user_id
  end

  test "login: authorizing with unknown clever district admin account creates teacher" do
    auth = OmniAuth::AuthHash.new(
      uid: '1111',
      provider: 'clever',
      info: {
        nickname: '',
        name: {'first' => 'Hat', 'last' => 'Cat'},
        email: 'first_last@clever-district-admin.xx',
        user_type: 'district_admin',
        dob: nil,
        gender: nil
      },
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_creates(User) do
      get :clever
    end

    user = User.last
    assert_equal 'clever', user.primary_contact_info.credential_type
    assert_equal 'Hat Cat', user.name
    assert_equal User::TYPE_TEACHER, user.user_type
    assert_equal "21+", user.age # we know you're an adult if you are a teacher on clever
    assert_nil user.gender
    assert_equal user.id, signed_in_user_id
  end

  test "login: authorizing with unknown clever school admin account creates teacher" do
    auth = OmniAuth::AuthHash.new(
      uid: '1111',
      provider: 'clever',
      info: {
        nickname: '',
        name: {'first' => 'Hat', 'last' => 'Cat'},
        email: 'first_last@clever-school-admin.xx',
        user_type: 'school_admin',
        dob: nil,
        gender: nil
      },
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_creates(User) do
      get :clever
    end

    user = User.last
    assert_equal 'clever', user.primary_contact_info.credential_type
    assert_equal 'Hat Cat', user.name
    assert_equal User::TYPE_TEACHER, user.user_type
    assert_equal "21+", user.age # we know you're an adult if you are a teacher on clever
    assert_nil user.gender
    assert_equal user.id, signed_in_user_id
  end

  test "login: authorizing with unknown clever teacher account needs additional information" do
    auth = OmniAuth::AuthHash.new(
      uid: '1111',
      provider: 'clever',
      info: {
        nickname: '',
        name: {'first' => 'Hat', 'last' => 'Cat'},
        email: nil,
        user_type: 'teacher',
        dob: nil,
        gender: nil
      },
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_does_not_create(User) do
      get :clever
    end

    assert_redirected_to 'http://test.host/users/sign_up'
    partial_user = User.new_from_partial_registration(session)
    assert_empty partial_user.email
  end

  test "login: authorizing with unknown clever student account creates student" do
    auth = OmniAuth::AuthHash.new(
      uid: '111133',
      provider: 'clever',
      info: {
        nickname: '',
        name: {'first' => 'Hat', 'last' => 'Cat'},
        email: nil,
        user_type: 'student',
        dob: Date.today - 10.years,
        gender: 'f'
      },
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_creates(User) do
      get :clever
    end

    user = User.last
    assert_equal 'clever', user.primary_contact_info.credential_type
    assert_equal 'Hat Cat', user.name
    assert_equal User::TYPE_STUDENT, user.user_type
    assert_equal 10, user.age
    assert_equal 'f', user.gender
    assert_equal user.id, signed_in_user_id
  end

  # NOTE: Though this test really tests the User model, specifically the
  # before_save action hide_email_and_full_address_for_students, we include this
  # test here as there was concern authentication through clever could be a
  # workflow where we persist student email addresses.
  test "login: authorizing with unknown clever student account does not save email" do
    auth = OmniAuth::AuthHash.new(
      uid: '111133',
      provider: 'clever',
      info: {
        nickname: '',
        name: {'first' => 'Hat', 'last' => 'Cat'},
        email: 'hat.cat@example.com',
        user_type: 'student',
        dob: Date.today - 10.years,
        gender: 'f'
      },
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_creates(User) do
      get :clever
    end

    user = User.last
    assert_equal '', user.email
    assert_equal user.id, signed_in_user_id
  end

  test "login: authorizing with unknown powerschool student account does not save email" do
    auth = OmniAuth::AuthHash.new(
      uid: '12345',
      provider: 'powerschool',
      info: {
        name: nil,
      },
      extra: {
        response: {
          message: {
            args: {
              '["http://openid.net/srv/ax/1.0", "value.ext0"]': 'student',
              '["http://openid.net/srv/ax/1.0", "value.ext1"]': 'splat.cat@example.com',
              '["http://openid.net/srv/ax/1.0", "value.ext2"]': 'splat',
              '["http://openid.net/srv/ax/1.0", "value.ext3"]': 'cat',
            }
          }
        }
      }
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_creates(User) do
      get :powerschool
    end

    user = User.last
    assert_equal '', user.email
    assert_equal user.id, signed_in_user_id
  end

  test "login: authorizing with known clever student account does not alter email or hashed email" do
    clever_student = create(:student, provider: 'clever', uid: '111133')
    student_hashed_email = clever_student.hashed_email

    auth = OmniAuth::AuthHash.new(
      uid: '111133',
      provider: 'clever',
      info: {
        nickname: '',
        name: {'first' => 'Hat', 'last' => 'Cat'},
        email: 'hat.cat@example.com',
        user_type: 'student',
        dob: Date.today - 10.years,
        gender: 'f'
      },
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_does_not_create(User) do
      get :clever
    end

    user = User.last
    assert_equal '', user.email
    assert_equal student_hashed_email, user.hashed_email
    assert_equal user.id, signed_in_user_id
  end

  test "login: adding google classroom permissions redirects to the homepage with a param to open the roster dialog" do
    user = create(:user, provider: 'google_oauth2', uid: '1111')
    sign_in user

    @request.env['omniauth.auth'] = OmniAuth::AuthHash.new(
      provider: 'google_oauth2',
      uid: '1111',
      credentials: {
        token: 'my-new-token',
        refresh_token: 'my-new-refresh-token'
      }
    )
    @request.env['omniauth.params'] = {
      'scope' => 'userinfo.email,userinfo.profile,classroom.courses.readonly,classroom.rosters.readonly'
    }

    assert_does_not_create(User) do
      get :google_oauth2
    end
    assert_redirected_to 'http://test.host/home?open=rosterDialog'
    google_ao = user.authentication_options.find_by_credential_type('google_oauth2')
    assert_equal 'my-new-token', google_ao.data_hash[:oauth_token]
    assert_equal 'my-new-refresh-token', google_ao.data_hash[:oauth_refresh_token]
  end

  test "login: omniauth callback sets token on user when passed with credentials" do
    auth = OmniAuth::AuthHash.new(
      uid: '1111',
      provider: 'facebook',
      info: {
        name: 'someone',
        email: 'test@email.com',
        user_type: User::TYPE_STUDENT,
        dob: Date.today - 20.years,
        gender: 'f'
      },
      credentials: {
        token: '123456'
      }
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_creates(User) do
      get :facebook
    end
    user = User.last
    assert_equal auth[:credentials][:token], user.primary_contact_info.data_hash[:oauth_token]
    assert_equal user.id, signed_in_user_id
  end

  # The following tests actually test the user model, but relate specifically to
  # oauth uniqueness checks so they are included here. These have not been working
  # in the past for subtle reasons.

  test "login: omniauth student is checked for email uniqueness against student" do
    email = 'duplicate@email.com'
    user = create(:user, email: email)

    auth = generate_auth_user_hash(email: email, user_type: User::TYPE_STUDENT)

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_does_not_create(User) do
      get :facebook
    end
    assert_equal user.id, signed_in_user_id
  end

  test "login: omniauth teacher is checked for email uniqueness against student" do
    email = 'duplicate@email.com'
    user = create(:user, email: email)

    auth = generate_auth_user_hash(email: email, user_type: User::TYPE_TEACHER)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_does_not_create(User) do
      get :facebook
    end
    assert_equal user.id, signed_in_user_id
  end

  test "login: omniauth student is checked for email uniqueness against teacher" do
    email = 'duplicate@email.com'
    user = create(:teacher, email: email)

    auth = generate_auth_user_hash(email: email, user_type: User::TYPE_STUDENT)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_does_not_create(User) do
      get :facebook
    end
    assert_equal user.id, signed_in_user_id
  end

  test "login: omniauth teacher is checked for email uniqueness against teacher" do
    email = 'duplicate@email.com'
    user = create(:teacher, email: email)

    auth = generate_auth_user_hash(email: email, user_type: User::TYPE_TEACHER)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_does_not_create(User) do
      get :facebook
    end
    assert_equal user.id, signed_in_user_id
  end

  test 'clever: signs in user if user is found by credentials' do
    # Given I have a Clever-Code.org account
    user = create :student, :clever_sso_provider

    # When I hit the clever oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::CLEVER,
      uid: user.primary_contact_info.authentication_id
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :clever
    end

    # Then I am signed in
    user.reload
    assert_equal user.id, signed_in_user_id
  end

  test 'clever: updates tokens when unmigrated user is found by credentials' do
    # Given I have a Clever-Code.org account
    user = create :teacher, :clever_sso_provider, :demigrated

    # When I hit the clever oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::CLEVER,
      uid: user.uid,
      token: 'new-token',
      expires_at: 23456

    # And my tokens have changed
    refute_equal user.oauth_token, auth[:credentials][:token]
    refute_equal user.oauth_token_expiration, auth[:credentials][:expires_at]

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    get :clever

    # Then my OAuth tokens are updated
    user.reload
    assert_equal user.oauth_token, auth[:credentials][:token]
    assert_equal user.oauth_token_expiration, auth[:credentials][:expires_at]
  end

  test 'clever: updates tokens when migrated user is found by credentials' do
    # Given I have a Clever-Code.org account
    user = create :teacher, :clever_sso_provider
    assert user.migrated?

    # When I hit the clever oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::CLEVER,
      uid: user.primary_contact_info.authentication_id,
      token: 'new-token',
      expires_at: 23456

    # And my tokens have changed
    refute_equal user.primary_contact_info.data_hash[:oauth_token], auth[:credentials][:token]
    refute_equal user.primary_contact_info.data_hash[:oauth_token_expiration], auth[:credentials][:expires_at]

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    get :clever

    # Then my OAuth tokens are updated
    user.reload
    assert_equal user.primary_contact_info.data_hash[:oauth_token], auth[:credentials][:token]
    assert_equal user.primary_contact_info.data_hash[:oauth_token_expiration], auth[:credentials][:expires_at]
  end

  test 'clever: creates user if user is not found by credentials' do
    SignUpTracking.stubs(:new_sign_up_experience?).returns(false)
    # Given I do not have a Code.org account
    uid = "nonexistent-clever"

    # When I hit the clever oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::CLEVER,
      uid: uid,
      user_type: 'teacher'
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_creates User do
      get :clever
    end

    # Then my account is created
    # And I'm signed in
    # And I go to my dashboard
    user = User.find_by_credential(
      type: AuthenticationOption::CLEVER,
      id: uid
    )
    assert_redirected_to 'http://test.host/home'
    assert_equal user.id, signed_in_user_id
  end

  test 'clever: does not direct user to finish sign-up (new_sign_up_experience)' do
    SignUpTracking.stubs(:new_sign_up_experience?).returns(true)
    # Given I do not have a Code.org account
    uid = "nonexistent-clever"

    # When I hit the clever oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::CLEVER,
      uid: uid,
      user_type: 'teacher'
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_creates User do
      get :clever
    end

    # Then my account is created
    # And I'm signed in
    # And I go to my dashboard
    user = User.find_by_credential(
      type: AuthenticationOption::CLEVER,
      id: uid
    )
    assert_redirected_to 'http://test.host/home'
    assert_equal user.id, signed_in_user_id
  end

  test 'clever: sets tokens on new user' do
    SignUpTracking.stubs(:new_sign_up_experience?).returns(false)
    # Given I do not have a Code.org account
    uid = "nonexistent-clever"

    # When I hit the clever oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::CLEVER,
      uid: uid,
      user_type: 'teacher'
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    get :clever

    # Then I go to the registration page to finish signing up
    user = User.find_by_credential(
      type: AuthenticationOption::CLEVER,
      id: uid
    )
    assert_equal user.primary_contact_info.data_hash[:oauth_token], auth[:credentials][:token]
    assert_equal user.primary_contact_info.data_hash[:oauth_token_expiration], auth[:credentials][:expires_at]
  end

  test 'maker_google_oauth2: returns an error if no token' do
    # Go to function with no parameters
    post :maker_google_oauth2

    assert_template 'maker/login_code'

    # Check that flash alert displays desired message
    expected_error = I18n.t('maker.google_oauth.error_no_code')
    assert_select ".container .alert-danger", expected_error
  end

  test 'maker_google_oauth2: returns an error if token is expired' do
    #Given I have a Google-Code.org account
    user = create :student, :google_sso_provider
    user_auth = user.authentication_options.find_by_credential_type(AuthenticationOption::GOOGLE)

    #Generate token from 6 minutes ago
    secret_code = Encryption.encrypt_string_utf8(
      (Time.now - 6.minutes).strftime('%Y%m%dT%H%M%S%z') + user_auth['authentication_id'] + user_auth['credential_type']
    )

    # Go to function
    post :maker_google_oauth2, params: {secret_code: secret_code}

    assert_template 'maker/login_code'

    # Check that flash alert displays desired message
    expected_error = I18n.t('maker.google_oauth.error_token_expired')
    assert_select ".container .alert-danger", expected_error
  end

  test 'maker_google_oauth2: returns an error if provider is incorrect' do
    #Given I have a Google-Code.org account
    user = create :student, :google_sso_provider
    user_auth = user.authentication_options.find_by_credential_type(AuthenticationOption::GOOGLE)

    #Generate token with incorrect provider
    secret_code = Encryption.encrypt_string_utf8(
      Time.now.strftime('%Y%m%dT%H%M%S%z') + user_auth['authentication_id'] + "Clever"
    )

    # Go to function
    post :maker_google_oauth2, params: {secret_code: secret_code}

    assert_template 'maker/login_code'

    # Check that flash alert displays desired message
    expected_error = I18n.t('maker.google_oauth.error_wrong_provider')
    assert_select ".container .alert-danger", expected_error
  end

  test 'maker_google_oauth2: returns an error if user if is invalid' do
    #Given I have a Google-Code.org account
    user = create :student, :google_sso_provider
    user_auth = user.authentication_options.find_by_credential_type(AuthenticationOption::GOOGLE)

    #Generate token with corrupted authentication id
    secret_code = Encryption.encrypt_string_utf8(
      Time.now.strftime('%Y%m%dT%H%M%S%z') + user_auth['authentication_id'] + "test" + user_auth['credential_type']
    )

    # Go to function
    post :maker_google_oauth2, params: {secret_code: secret_code}

    assert_template 'maker/login_code'

    # Check that flash alert displays desired message
    expected_error = I18n.t('maker.google_oauth.error_invalid_user')
    assert_select ".container .alert-danger", expected_error
  end

  test 'maker_google_oauth2: logs in user if valid token' do
    #Given I have a Google-Code.org account
    user = create :student, :google_sso_provider
    user_auth = user.authentication_options.find_by_credential_type(AuthenticationOption::GOOGLE)

    #Generate token
    secret_code = Encryption.encrypt_string_utf8(
      Time.now.strftime('%Y%m%dT%H%M%S%z') + user_auth['authentication_id'] + user_auth['credential_type']
    )

    #Go to function
    post :maker_google_oauth2, params: {secret_code: secret_code}

    #Then I am signed in
    assert_equal user.id, signed_in_user_id
  end

  test 'google_oauth2: signs in user if user is found by credentials' do
    # Given I have a Google-Code.org account
    user = create :student, :google_sso_provider

    # When I hit the google oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::GOOGLE,
      uid: user.primary_contact_info.authentication_id
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end

    # Then I am signed in
    user.reload
    assert_equal user.id, signed_in_user_id
  end

  test 'google_oauth2: updates tokens when unmigrated user is found by credentials' do
    # Given I have a Google-Code.org account
    user = create :teacher, :google_sso_provider, :demigrated

    # When I hit the google oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::GOOGLE,
      uid: user.uid,
      token: 'new-token',
      expires_at: 23456,
      refresh_token: 'new-refresh-token'

    # And my tokens have changed
    refute_equal user.oauth_token, auth[:credentials][:token]
    refute_equal user.oauth_token_expiration, auth[:credentials][:expires_at]
    refute_equal user.oauth_refresh_token, auth[:credentials][:refresh_token]

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    get :google_oauth2

    # Then my OAuth tokens are updated
    user.reload
    assert_equal user.oauth_token, auth[:credentials][:token]
    assert_equal user.oauth_token_expiration, auth[:credentials][:expires_at]
    assert_equal user.oauth_refresh_token, auth[:credentials][:refresh_token]
  end

  test 'google_oauth2: updates tokens when migrated user is found by credentials' do
    # Given I have a Google-Code.org account
    user = create(:teacher,
      :google_sso_provider,
      uid: 'fake-uid'
    )
    assert user.migrated?

    # When I hit the google oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::GOOGLE,
      uid: user.primary_contact_info.authentication_id,
      token: 'new-token',
      expires_at: 23456,
      refresh_token: 'new-refresh-token'

    # And my tokens have changed
    refute_equal user.primary_contact_info.data_hash[:oauth_token], auth[:credentials][:token]
    refute_equal user.primary_contact_info.data_hash[:oauth_token_expiration], auth[:credentials][:expires_at]
    refute_equal user.primary_contact_info.data_hash[:oauth_refresh_token], auth[:credentials][:refresh_token]

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    get :google_oauth2

    # Then my OAuth tokens are updated
    user.reload
    assert_equal user.primary_contact_info.data_hash[:oauth_token], auth[:credentials][:token]
    assert_equal user.primary_contact_info.data_hash[:oauth_token_expiration], auth[:credentials][:expires_at]
    assert_equal user.primary_contact_info.data_hash[:oauth_refresh_token], auth[:credentials][:refresh_token]
  end

  test 'google_oauth2: redirects to complete registration if user is not found by credentials' do
    # Given I do not have a Code.org account
    uid = "nonexistent-google-oauth2"

    # When I hit the google oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::GOOGLE,
      uid: uid,
      user_type: '' # Google doesn't provider user_type
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end

    # Then I go to the registration page to finish signing up
    assert_redirected_to 'http://test.host/users/sign_up'
    partial_user = User.new_from_partial_registration(session)
    assert_equal AuthenticationOption::GOOGLE, partial_user.provider
    assert_equal uid, partial_user.uid
  end

  test 'google_oauth2: sets tokens in session/cache when redirecting to complete registration' do
    # Given I do not have a Code.org account
    uid = "nonexistent-google-oauth2"

    # When I hit the google oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::GOOGLE,
      uid: uid,
      user_type: '', # Google doesn't provider user_type
      refresh_token: 'fake-refresh-token'
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end

    # Then I go to the registration page to finish signing up
    assert_redirected_to 'http://test.host/users/sign_up'
    assert PartialRegistration.in_progress? session
    partial_user = User.new_with_session({}, session)

    assert_equal AuthenticationOption::GOOGLE, partial_user.provider
    assert_equal uid, partial_user.uid
    assert_equal auth[:credentials][:token], partial_user.oauth_token
    assert_equal auth[:credentials][:expires_at], partial_user.oauth_token_expiration
    assert_equal auth[:credentials][:refresh_token], partial_user.oauth_refresh_token
  end

  test 'google_oauth2: sets tokens in session/cache when redirecting to complete registration (new_sign_up_experience)' do
    SignUpTracking.stubs(:new_sign_up_experience?).returns(true)
    # Given I do not have a Code.org account
    uid = "nonexistent-google-oauth2"

    # When I hit the google oauth callback
    auth = generate_auth_user_hash \
      provider: AuthenticationOption::GOOGLE,
      uid: uid,
      user_type: '', # Google doesn't provider user_type
      refresh_token: 'fake-refresh-token'
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end

    # Then I go to the registration page to finish signing up
    assert_redirected_to 'http://test.host/users/sign_up'
    assert PartialRegistration.in_progress? session
    partial_user = User.new_with_session({}, session)

    assert_equal AuthenticationOption::GOOGLE, partial_user.provider
    assert_equal uid, partial_user.uid
    assert_equal auth[:credentials][:token], partial_user.oauth_token
    assert_equal auth[:credentials][:expires_at], partial_user.oauth_token_expiration
    assert_equal auth[:credentials][:refresh_token], partial_user.oauth_refresh_token
  end

  test 'login: google_oauth2 silently takes over unmigrated student with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, :demigrated, email: email)
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: uid, user_type: User::TYPE_STUDENT, email: email)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end
    user.reload
    assert_equal 'google_oauth2', user.provider
    assert_equal user.uid, uid
    assert_equal user.id, signed_in_user_id
  end

  test 'login: microsoft_v2_auth silently takes over unmigrated student with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, email: email)
    auth = OmniAuth::AuthHash.new(
      provider: 'microsoft_v2_auth',
      uid: uid,
      info: {},
      extra: {
        raw_info: {
          userPrincipalName: email,
          displayName: 'My Name'
        }
      },
    )

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_creates(AuthenticationOption) do
      assert_does_not_create(User) do
        get :microsoft_v2_auth
      end
    end
    user.reload
    takeover_auth = user.authentication_options.last
    assert_equal 'microsoft_v2_auth', takeover_auth.credential_type
    assert_equal uid, takeover_auth.authentication_id
    assert_equal signed_in_user_id, user.id
  end

  test 'login: google_oauth2 silently takes over unmigrated Google Classroom student with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, :demigrated, email: email)
    google_classroom_student = create(:student, :migrated_imported_from_google_classroom, :demigrated, uid: uid)
    google_classroom_section = google_classroom_student.sections_as_student.find {|s| s.login_type == Section::LOGIN_TYPE_GOOGLE_CLASSROOM}
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: uid, user_type: User::TYPE_STUDENT, email: email)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_destroys(User) do
      get :google_oauth2
    end
    user.reload
    assert_equal 'google_oauth2', user.provider
    assert_equal user.uid, uid
    assert_equal [google_classroom_section&.id], user.sections_as_student.pluck(:id)
    assert_equal user.id, signed_in_user_id
  end

  test 'login: google_oauth2 silently takes over unmigrated teacher with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:teacher, :demigrated, email: email)
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: uid, user_type: User::TYPE_TEACHER, email: email)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end
    user.reload
    assert_equal 'google_oauth2', user.provider
    assert_equal user.uid, uid
    assert_equal user.id, signed_in_user_id
  end

  test 'login: microsoft_v2_auth silently takes over unmigrated teacher with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:teacher, email: email)
    auth = OmniAuth::AuthHash.new(
      provider: 'microsoft_v2_auth',
      uid: uid,
      info: {},
      extra: {
        raw_info: {
          userPrincipalName: email,
          displayName: 'My Name'
        }
      },
    )

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_creates(AuthenticationOption) do
      assert_does_not_create(User) do
        get :microsoft_v2_auth
      end
    end
    user.reload
    takeover_auth = user.authentication_options.last
    assert_equal 'microsoft_v2_auth', takeover_auth.credential_type
    assert_equal uid, takeover_auth.authentication_id
    assert_equal signed_in_user_id, user.id
  end

  test 'login: google_oauth2 silently adds authentication_option to migrated student with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, email: email)
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: uid, user_type: User::TYPE_STUDENT, email: email)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end
    user.reload
    assert_equal 'migrated', user.provider
    found_google = user.authentication_options.any? {|auth_option| auth_option.credential_type == AuthenticationOption::GOOGLE}
    assert found_google
    assert_equal user.id, signed_in_user_id
  end

  test 'login: google_oauth2 silently takes over migrated Google Classroom student with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, email: email)
    google_classroom_student = create(:student, :migrated_imported_from_google_classroom, uid: uid)
    google_classroom_section = google_classroom_student.sections_as_student.find {|s| s.login_type == Section::LOGIN_TYPE_GOOGLE_CLASSROOM}
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: uid, user_type: User::TYPE_STUDENT, email: email)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_destroys(User) do
      get :google_oauth2
    end
    user.reload
    assert_equal 'migrated', user.provider
    found_google = user.authentication_options.any? {|auth_option| auth_option.credential_type == AuthenticationOption::GOOGLE}
    assert found_google
    assert [google_classroom_section&.id], user.sections_as_student.pluck(:id)
    assert_equal user.id, signed_in_user_id
  end

  test 'login: google_oauth2 silently adds authentication_option to migrated teacher with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:teacher, email: email)
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: uid, user_type: User::TYPE_TEACHER, email: email)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end
    user.reload
    assert_equal 'migrated', user.provider
    found_google = user.authentication_options.any? {|auth_option| auth_option.credential_type == AuthenticationOption::GOOGLE}
    assert found_google
    assert_equal user.id, signed_in_user_id
  end

  test 'login: microsoft_v2_auth silently adds authentication_option to migrated teacher with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:teacher, email: email)
    auth = OmniAuth::AuthHash.new(
      provider: 'microsoft_v2_auth',
      uid: uid,
      info: {},
      extra: {
        raw_info: {
          userPrincipalName: email,
          displayName: 'My Name'
        }
      },
    )

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :microsoft_v2_auth
    end
    user.reload
    assert_equal 'migrated', user.provider
    assert_equal 2, user.authentication_options.count
    microsoft_auth_option = user.authentication_options.find {|auth_option| auth_option.credential_type == AuthenticationOption::MICROSOFT}
    refute_nil microsoft_auth_option
    assert_equal uid, microsoft_auth_option.authentication_id
    assert_equal signed_in_user_id, user.id
  end

  test 'login: microsoft_v2_auth silently adds authentication_option to migrated student with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, email: email)
    auth = OmniAuth::AuthHash.new(
      provider: 'microsoft_v2_auth',
      uid: uid,
      info: {},
      extra: {
        raw_info: {
          userPrincipalName: email,
          displayName: 'My Name'
        }
      },
    )

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :microsoft_v2_auth
    end
    user.reload
    assert_equal 'migrated', user.provider
    assert_equal 2, user.authentication_options.count
    microsoft_auth_option = user.authentication_options.find {|auth_option| auth_option.credential_type == AuthenticationOption::MICROSOFT}
    refute_nil microsoft_auth_option
    assert_equal uid, microsoft_auth_option.authentication_id
    assert_equal signed_in_user_id, user.id
  end

  test 'login: microsoft_v2_auth deletes an existing windowslive authentication_option for migrated user' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:user, :windowslive_sso_provider, email: email)
    auth = OmniAuth::AuthHash.new(
      provider: 'microsoft_v2_auth',
      uid: uid,
      info: {},
      extra: {
        raw_info: {
          userPrincipalName: email,
          displayName: 'My Name'
        }
      },
    )

    windowslive_auth_option = user.authentication_options.find {|ao| ao.credential_type == 'windowslive'}
    assert windowslive_auth_option.primary?

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    get :microsoft_v2_auth

    user.reload
    assert_equal 'migrated', user.provider
    assert_equal 1, user.authentication_options.count
    microsoft_auth_option = user.authentication_options.first
    refute_nil microsoft_auth_option
    assert microsoft_auth_option.primary?
    assert_equal 'microsoft_v2_auth', microsoft_auth_option.credential_type
    assert_equal uid, microsoft_auth_option.authentication_id
    assert_equal signed_in_user_id, user.id
  end

  test 'login: google_oauth2 updates unmigrated Google Classroom student email if silent takeover not available' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, :migrated_imported_from_google_classroom, :demigrated, uid: uid)
    google_classroom_section = user.sections_as_student.find {|s| s.login_type == Section::LOGIN_TYPE_GOOGLE_CLASSROOM}
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: uid, user_type: User::TYPE_STUDENT, email: email)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_does_not_destroy(User) do
      get :google_oauth2
    end

    user.reload
    assert_equal 'google_oauth2', user.provider
    assert_equal User.hash_email(email), user.hashed_email
    assert [google_classroom_section&.id], user.sections_as_student.pluck(:id)
    assert_equal user.id, signed_in_user_id
  end

  test 'login: google_oauth2 updates migrated Google Classroom student AuthenticationOption email if silent takeover not available' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, :migrated_imported_from_google_classroom, uid: uid)
    google_auth_option = user.primary_contact_info
    google_classroom_section = user.sections_as_student.find {|s| s.login_type == Section::LOGIN_TYPE_GOOGLE_CLASSROOM}
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: uid, user_type: User::TYPE_STUDENT, email: email)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_does_not_destroy(User) do
      get :google_oauth2
    end
    user.reload
    google_auth_option.reload
    assert_equal 'migrated', user.provider
    assert_equal User.hash_email(email), google_auth_option.hashed_email
    assert [google_classroom_section&.id], user.sections_as_student.pluck(:id)
    assert_equal user.id, signed_in_user_id
  end

  test 'login: clever does not silently add authentication_option to migrated student with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, email: email)
    auth = generate_auth_user_hash(provider: 'clever', uid: uid, user_type: User::TYPE_STUDENT, email: email)
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_creates(User) do
      get :clever
    end
    user.reload
    assert_equal 'migrated', user.provider
    found_clever = user.authentication_options.any? {|auth_option| auth_option.credential_type == AuthenticationOption::CLEVER}
    refute found_clever
    assert_equal 'clever', User.last.authentication_options.last.credential_type
    assert_equal User.last.id, signed_in_user_id
  end

  test 'sign_up_clever: email conflict redirect if any users are already using your email address' do
    email = 'alreadytaken@example.com'
    create :student, email: email

    auth = generate_auth_user_hash(
      provider: AuthenticationOption::CLEVER,
      user_type: User::TYPE_TEACHER,
      email: email
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    refute_creates(User) do
      get :clever
    end
    assert_redirected_to users_existing_account_path({provider: "clever", email: email})
  end

  test 'connect_provider: can connect multiple auth options with the same email to the same user' do
    email = 'test@xyz.foo'
    user = create :user, uid: 'some-uid'
    AuthenticationOption.create!(
      {
        user: user,
        email: email,
        hashed_email: User.hash_email(email),
        credential_type: 'google_oauth2',
        authentication_id: 'some-uid',
        data: {
          oauth_token: 'fake_token',
          oauth_token_expiration: '999999',
          oauth_refresh_token: 'fake_refresh_token'
        }.to_json
      }
    )

    auth_hash = generate_auth_user_hash(provider: 'facebook', uid: user.uid, refresh_token: '65432', email: email)
    setup_should_connect_provider(user, auth_hash)
    assert_creates(AuthenticationOption) do
      get :facebook
    end

    user.reload
    assert_redirected_to 'http://test.host/users/edit'
    assert_equal 3, user.authentication_options.length
  end

  test 'connect_provider: cannot connect multiple auth options with the same email to a different user' do
    email = 'test@xyz.foo'
    user_a = create :user
    AuthenticationOption.create!(
      {
        user: user_a,
        email: email,
        hashed_email: User.hash_email(email),
        credential_type: 'google_oauth2',
        authentication_id: 'some-uid',
        data: {
          oauth_token: 'fake_token',
          oauth_token_expiration: '999999',
          oauth_refresh_token: 'fake_refresh_token'
        }.to_json
      }
    )

    user_b = create :user
    auth = generate_auth_user_hash(provider: 'facebook', uid: 'some-other-uid', refresh_token: '65432', email: email)
    setup_should_connect_provider(user_b, auth)
    assert_does_not_create(AuthenticationOption) do
      get :facebook
    end

    assert_redirected_to 'http://test.host/users/edit'
    assert_equal 'Email has already been taken', flash.alert

    user_a.reload
    user_b.reload
    assert_equal 2, user_a.authentication_options.length
    assert_equal 1, user_b.authentication_options.length
  end

  test 'connect_provider: does not connect if user not migrated' do
    user = create :user, :demigrated
    auth = generate_auth_user_hash(provider: 'facebook', uid: user.uid, refresh_token: '65432', email: user.email)
    setup_should_connect_provider(user, auth)
    assert_does_not_create(AuthenticationOption) do
      get :facebook
    end
    assert_redirected_to 'http://test.host/users/edit'
    assert_equal 'Sorry, we cannot connect or disconnect accounts that are still using the old account experience. Please update to the new account experience.', flash.alert
  end

  test 'connect_provider: creates new google auth option for signed in user' do
    user = create :user, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: user.uid, refresh_token: '54321')

    setup_should_connect_provider(user, auth)
    assert_creates(AuthenticationOption) do
      get :google_oauth2
    end

    user.reload
    assert_redirected_to 'http://test.host/users/edit'
    assert_auth_option(user, auth)
  end

  test 'connect_provider: creates new windowslive auth option for signed in user' do
    user = create :user, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'windowslive', uid: user.uid)

    setup_should_connect_provider(user, auth)
    assert_creates(AuthenticationOption) do
      get :windowslive
    end

    user.reload
    assert_redirected_to 'http://test.host/users/edit'
    assert_auth_option(user, auth)
  end

  test 'connect_provider: creates new facebook auth option for signed in user' do
    user = create :user, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'facebook', uid: user.uid)

    setup_should_connect_provider(user, auth)
    assert_creates(AuthenticationOption) do
      get :facebook
    end

    user.reload
    assert_redirected_to 'http://test.host/users/edit'
    assert_auth_option(user, auth)
  end

  test 'connect_provider: creates new clever auth option for signed in user' do
    user = create :user, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'clever', uid: user.uid)

    setup_should_connect_provider(user, auth)
    assert_creates(AuthenticationOption) do
      get :clever
    end

    user.reload
    assert_redirected_to 'http://test.host/users/edit'
    assert_auth_option(user, auth)
  end

  test 'connect_provider: creates new powerschool auth option for signed in user' do
    user = create :user, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'powerschool', uid: user.uid)

    setup_should_connect_provider(user, auth)
    assert_creates(AuthenticationOption) do
      get :powerschool
    end

    user.reload
    assert_redirected_to 'http://test.host/users/edit'
    assert_auth_option(user, auth)
  end

  test 'connect_provider: redirects to account edit page with an error if AuthenticationOption cannot save' do
    user = create :user, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: user.uid, refresh_token: '54321')

    AuthenticationOption.any_instance.expects(:save).returns(false)
    setup_should_connect_provider(user, auth)
    assert_does_not_create(AuthenticationOption) do
      get :google_oauth2
    end

    assert_redirected_to 'http://test.host/users/edit'
    expected_error = I18n.t('auth.unable_to_connect_provider', provider: I18n.t("auth.google_oauth2"))
    assert_equal expected_error, flash.alert
  end

  test "connect_provider: Performs takeover of an account with matching credential that has no activity" do
    user = create :user

    # Given there exists another user
    #   having credential X
    #   and having no activity
    other_user = create :user
    credential = create :google_authentication_option, user: other_user
    refute other_user.has_activity?

    # When I attempt to add credential X
    auth = link_credential user,
      type: credential.credential_type,
      id: credential.authentication_id

    # Then I should successfully add credential X
    user.reload
    assert_redirected_to 'http://test.host/users/edit'
    assert_auth_option(user, auth)

    # And the other user should be destroyed
    other_user.reload
    assert other_user.deleted?
  end

  test "connect_provider: Successful takeover also enrolls in replaced user's sections" do
    user = create :user

    # Given there exists another user
    #   having credential X
    #   and having no activity
    #   and enrolled in section Y
    other_user = create :user
    credential = create :google_authentication_option, user: other_user
    refute other_user.has_activity?
    section = create :section
    section.students << other_user

    # When I add credential X
    link_credential user,
      type: credential.credential_type,
      id: credential.authentication_id

    # Then I should be enrolled in section Y instead of the other user
    section.reload
    assert_includes section.students, user
    refute_includes section.students, other_user
  end

  test "connect_provider: Teacher takeover of student transfers section enrollment" do
    # Given I am a teacher
    user = create :teacher

    # And there exists a student
    #   having credential X
    #   and has no activity
    other_user = create :student
    credential = create :google_authentication_option, user: other_user
    refute other_user.has_activity?
    section = create :section
    section.students << other_user

    # When I add credential X
    link_credential user,
      type: credential.credential_type,
      id: credential.authentication_id

    # Then I should be enrolled in section Y instead of the other user
    section.reload
    assert_includes section.students, user
    refute_includes section.students, other_user
  end

  test "connect_provider: Successful takeover transfers ownership of sections" do
    # Given I am a teacher
    user = create :teacher

    # And there exists another teacher
    #   having credential X
    #   and who owns section Y
    #   and has no activity
    other_user = create :teacher
    credential = create :google_authentication_option, user: other_user
    section = create :section, teacher: other_user
    refute other_user.has_activity?

    # When I add credential X
    link_credential user,
      type: credential.credential_type,
      id: credential.authentication_id

    # Then I should own section Y instead of the other user
    section.reload
    refute section.deleted?
    assert_equal user, section.teacher
    refute_equal other_user, section.teacher
  end

  test "connect_provider: Refuses to link credential if student is taking over teacher account" do
    # Given I am a student
    user = create :student

    # And there exists a teacher
    #   having credential X
    #   and has no activity
    other_user = create :teacher
    credential = create :google_authentication_option, user: other_user
    refute other_user.has_activity?

    # When I attempt to add credential X
    link_credential user,
      type: credential.credential_type,
      id: credential.authentication_id

    # Then the other user should not be destroyed
    other_user.reload
    refute other_user.deleted?

    # And I should fail to add credential X
    user.reload
    assert_equal 1, user.authentication_options.count

    # And receive a helpful error message about the credential already being in use.
    assert_redirected_to 'http://test.host/users/edit'
    expected_error = I18n.t('auth.already_in_use', provider: I18n.t("auth.google_oauth2"))
    assert_equal expected_error, flash.alert
  end

  test "connect_provider: Refuses to link credential if there is an account with matching credential that has activity" do
    user = create :user

    # Given there exists another user
    #   having credential X
    #   and having activity
    other_user = create :user
    credential = create :google_authentication_option, user: other_user
    create :user_level, user: other_user, best_result: ActivityConstants::MINIMUM_PASS_RESULT
    assert other_user.has_activity?

    # When I attempt to add credential X
    link_credential user,
      type: credential.credential_type,
      id: credential.authentication_id

    # Then the other user should not be destroyed
    other_user.reload
    refute other_user.deleted?

    # And I should fail to add credential X
    user.reload
    assert_equal 1, user.authentication_options.count

    # And receive a helpful error message about the credential already being in use.
    assert_redirected_to 'http://test.host/users/edit'
    expected_error = I18n.t('auth.already_in_use', provider: I18n.t("auth.google_oauth2"))
    assert_equal expected_error, flash.alert
  end

  test "connect_provider: Presents no-op message if the provided credentials are already linked to user's account" do
    # Given the current user already has credential X
    user = create :user
    credential = create :google_authentication_option, user: user
    assert_equal 2, user.authentication_options.count

    # When I attempt to add credential X
    link_credential user,
      type: credential.credential_type,
      id: credential.authentication_id

    # Then I should have the same authentication options
    user.reload
    assert_equal 2, user.authentication_options.count

    # And receive a friendly notice about already having the credential
    assert_redirected_to 'http://test.host/users/edit'
    expected_notice = I18n.t('auth.already_linked', provider: I18n.t("auth.google_oauth2"))
    assert_equal expected_notice, flash.notice
  end

  test "connect_provider: return messaging specific to linked account" do
    provider = AuthenticationOption::SILENT_TAKEOVER_CREDENTIAL_TYPES.sample

    [User::TYPE_STUDENT, User::TYPE_TEACHER].each do |user_type|
      user = create user_type
      auth = generate_auth_user_hash(
        provider: provider,
        email: user.email
      )

      setup_should_connect_provider(user, auth)
      get provider

      assert_redirected_to 'http://test.host/users/edit'

      provider_name = I18n.t(provider, scope: :auth)
      expected_notice = user.teacher? ?
        I18n.t('user.auth_option_saved', provider: provider_name, email: user.email) :
        I18n.t('user.auth_option_saved_no_email', provider: provider_name)

      assert_equal expected_notice, flash.notice
      sign_out user
    end
  end

  test 'silent_takeover: Adds email to teacher account missing email' do
    # Set up existing account
    malformed_account = create :teacher, :demigrated
    email = malformed_account.email
    uid = 'google-takeover-id'

    # Make account invalid
    malformed_account.email = ''
    malformed_account.save(validate: false)
    malformed_account.reload
    refute malformed_account.valid?

    Honeybadger.expects(:notify).never

    # Hit google callback with matching email to trigger takeover
    auth = generate_auth_user_hash(
      provider: AuthenticationOption::GOOGLE,
      uid: uid,
      user_type: '',
      email: email
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end

    # Verify takeover completed
    malformed_account.reload
    assert_equal AuthenticationOption::GOOGLE, malformed_account.provider
    assert_equal  uid, malformed_account.uid

    # Verify the account has an email and is now well-formed
    assert_equal email, malformed_account.email
    assert malformed_account.valid?

    # Verify that we signed the user into the taken-over account
    assert_equal malformed_account.id, signed_in_user_id
  end

  test 'silent_takeover: Does not add email to student account' do
    # Set up existing account
    email = 'student+example@code.org'
    student = create :student, :demigrated, email: email
    uid = 'google-takeover-id'

    Honeybadger.expects(:notify).never

    # Hit google callback with matching email to trigger takeover
    auth = generate_auth_user_hash(
      provider: AuthenticationOption::GOOGLE,
      uid: uid,
      user_type: '',
      email: email
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end

    # Verify takeover completed
    student.reload
    assert_equal AuthenticationOption::GOOGLE, student.provider
    assert_equal  uid, student.uid

    # Verify the account has an email and is now well-formed
    assert_empty student.email
    assert student.valid?

    # Verify that we signed the user into the taken-over account
    assert_equal student.id, signed_in_user_id
  end

  test 'silent_takeover: Fails and notifies on malformed unmigrated user' do
    # Set up existing account
    malformed_account = create :teacher, :demigrated
    email = malformed_account.email

    # Make account invalid
    malformed_account.name = nil
    malformed_account.save(validate: false)
    malformed_account.reload
    refute malformed_account.valid?

    # Expect notification about validation failure
    Honeybadger.expects(:notify).with(
      error_class: 'Failed to update User during silent takeover',
      error_message: 'Validation failed: Display Name is required',
      context: {
        user_id: malformed_account.id,
        tags: 'accounts'
      }
    )

    # Hit google callback with matching email to trigger takeover
    auth = generate_auth_user_hash(
      provider: AuthenticationOption::GOOGLE,
      uid: 'some-unused-uid',
      user_type: '',
      email: email
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end

    # Verify takeover did not happen
    malformed_account.reload
    refute_equal AuthenticationOption::GOOGLE, malformed_account.provider
    assert_nil malformed_account.uid

    # We sign the user in anyway (weird, but okay because we know
    # the email matches?)
    assert_equal malformed_account.id, signed_in_user_id
  end

  test 'silent_takeover: Fails and notifies on malformed migrated user' do
    # Set up existing account
    account = create :teacher
    email = account.email
    assert_equal 1, account.authentication_options.count

    # Stub to break creation of new AuthenticationOptions by returning
    # an un-persisted instance
    AuthenticationOption.stubs(:create!).raises('Intentional test failure')

    # Expect notification about validation failure
    Honeybadger.expects(:notify).with(
      error_class: 'Failed to create AuthenticationOption during silent takeover',
      error_message: 'Intentional test failure',
      context: {
        user_id: account.id,
        tags: 'accounts'
      }
    )

    # Hit google callback with matching email to trigger takeover
    auth = generate_auth_user_hash(
      provider: AuthenticationOption::GOOGLE,
      uid: 'another-unused-uid',
      user_type: '',
      email: email
    )
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}
    assert_does_not_create(User) do
      get :google_oauth2
    end

    # Verify takeover did not happen
    account.reload
    assert_equal 1, account.authentication_options.count

    # We sign the user in anyway (weird, but okay because we know
    # the email matches?)
    assert_equal account.id, signed_in_user_id
  end

  private

  # Try to link a credential to the provided user
  # @return [OmniAuth::AuthHash] the auth hash, useful for validating
  #   linked credentials with assert_auth_option
  def link_credential(user, type:, id:)
    auth = generate_auth_user_hash(provider: type, uid: id)
    setup_should_connect_provider(user, auth)
    get :google_oauth2
    auth
  end

  def generate_auth_user_hash(args)
    OmniAuth::AuthHash.new(
      uid: args[:uid] || '1111',
      provider: args[:provider] || 'facebook',
      info: {
        name: args[:name] || 'someone',
        email: args[:email] || 'new@example.com',
        user_type: args[:user_type] || 'teacher',
        dob: args[:dob] || Date.today - 20.years,
        gender: args[:gender] || 'f'
      },
      credentials: {
        token: args[:token] || '12345',
        expires_at: args[:expires_at] || 'some-future-time',
        refresh_token: args[:refresh_token] || nil
      }
    )
  end

  def setup_should_connect_provider(user, auth_hash)
    @request.env['omniauth.auth'] = auth_hash
    @request.env['omniauth.params'] = {'action' => 'connect'}
    sign_in user
  end

  def assert_auth_option(user, oauth_hash)
    auth_option = user.authentication_options.last

    assert_authentication_option auth_option,
      user: user,
      hashed_email: User.hash_email(oauth_hash.info.email),
      credential_type: oauth_hash.provider,
      authentication_id: oauth_hash.uid,
      data: {
        oauth_token: oauth_hash.credentials.token,
        oauth_token_expiration: oauth_hash.credentials.expires_at,
        oauth_refresh_token: oauth_hash.credentials.refresh_token
      }
  end
end
