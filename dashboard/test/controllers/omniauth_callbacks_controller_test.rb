require 'test_helper'

class OmniauthCallbacksControllerTest < ActionController::TestCase
  include Mocha::API
  include UsersHelper

  setup do
    @request.env["devise.mapping"] = Devise.mappings[:user]
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
    attributes = session['devise.user_attributes']

    assert_nil attributes['email']
    assert_nil attributes['age']
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
    assert_equal 'clever', user.provider
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
    assert_equal 'clever', user.provider
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
    assert_equal 'clever', user.provider
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
    attributes = session['devise.user_attributes']

    assert_nil attributes['email']
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
    assert_equal 'clever', user.provider
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

    @request.env['omniauth.auth'] = OmniAuth::AuthHash.new(provider: user.provider, uid: user.uid)
    @request.env['omniauth.params'] = {
      'scope' => 'userinfo.email,userinfo.profile,classroom.courses.readonly,classroom.rosters.readonly'
    }

    assert_does_not_create(User) do
      get :google_oauth2
    end
    assert_redirected_to 'http://test.host/home?open=rosterDialog'
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
    assert_equal auth[:credentials][:token], user.oauth_token
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

  test 'login: oauth takeover transfers sections to taken over account' do
    User::OAUTH_PROVIDERS_UNTRUSTED_EMAIL.each do |provider|
      teacher = create :teacher
      section = create :section, user: teacher, login_type: 'clever'
      oauth_student = create :student, provider: provider, uid: '12345'
      student = create :student

      oauth_students = [oauth_student]
      section.set_exact_student_list(oauth_students)

      # Pull sections_as_student from the database and store them in an array to compare later
      sections_as_student = oauth_student.sections_as_student.to_ary

      @request.cookies[:pm] = 'clever_takeover'
      set_oauth_takeover_session_variables(provider, oauth_student)
      check_and_apply_oauth_takeover(student)

      assert_equal sections_as_student, student.sections_as_student
    end
  end

  test 'login: oauth takeover does not happen if takeover is expired' do
    User::OAUTH_PROVIDERS_UNTRUSTED_EMAIL.each do |provider|
      teacher = create :teacher
      section = create :section, user: teacher, login_type: 'clever'
      oauth_student = create :student, provider: provider, uid: '12345'
      student = create :student

      oauth_students = [oauth_student]
      section.set_exact_student_list(oauth_students)

      # Pull sections_as_student from the database and store them in an array to compare later
      sections_as_student = oauth_student.sections_as_student.to_ary

      @request.cookies[:pm] = 'clever_takeover'
      set_oauth_takeover_session_variables(provider, oauth_student)
      @request.session[ACCT_TAKEOVER_EXPIRATION] = 5.minutes.ago
      check_and_apply_oauth_takeover(student)

      assert_equal sections_as_student, oauth_student.sections_as_student
      refute_equal sections_as_student, student.sections_as_student
    end
  end

  test 'login: oauth takeover takes over account when account has no activity' do
    User::OAUTH_PROVIDERS_UNTRUSTED_EMAIL.each do |provider|
      oauth_student = create :student, provider: provider, uid: '12345'
      student = create :student

      set_oauth_takeover_session_variables(provider, oauth_student)
      check_and_apply_oauth_takeover(student)

      oauth_student.reload
      refute_nil oauth_student.deleted_at
      assert_equal provider, student.provider
      assert_equal oauth_student.uid, student.uid
      assert_equal '54321', student.oauth_token
      assert_nil @request.session['clever_link_flag']
    end
  end

  test 'login: oauth takeover does nothing if account has activity' do
    User::OAUTH_PROVIDERS_UNTRUSTED_EMAIL.each do |provider|
      oauth_student = create :student, provider: provider, uid: '12345'
      student = create :student
      level = create(:level)
      create :user_level, user: oauth_student, level: level, attempts: 1, best_result: 1

      assert oauth_student.has_activity?

      FirehoseClient.any_instance.expects(:put_record).at_least_once

      set_oauth_takeover_session_variables(provider, oauth_student)
      check_and_apply_oauth_takeover(student)

      oauth_student.reload
      assert_nil oauth_student.deleted_at
      assert_nil student.provider
    end
  end

  test 'login: google_oauth2 silently takes over unmigrated student with matching email' do
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
    assert_equal 'google_oauth2', user.provider
    assert_equal user.uid, uid
    assert_equal user.id, signed_in_user_id
  end

  test 'login: google_oauth2 silently takes over unmigrated Google Classroom student with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, email: email)
    google_classroom_student = create(:student, :imported_from_google_classroom, uid: uid)
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
    user = create(:teacher, email: email)
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

  test 'login: google_oauth2 silently adds authentication_option to migrated student with matching email' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, :with_migrated_email_authentication_option, email: email)
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
    user = create(:student, :with_migrated_email_authentication_option, email: email)
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
    user = create(:teacher, :with_migrated_email_authentication_option, email: email)
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

  test 'login: google_oauth2 updates unmigrated Google Classroom student email if silent takeover not available' do
    email = 'test@foo.xyz'
    uid = '654321'
    user = create(:student, :imported_from_google_classroom, uid: uid)
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
    user = create(:student, :with_migrated_email_authentication_option, email: email)
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
    assert_equal 'clever', User.last.provider # NOTE: this will fail when we create migrated users by default
    assert_equal User.last.id, signed_in_user_id
  end

  test 'connect_provider: can connect multiple auth options with the same email to the same user' do
    email = 'test@xyz.foo'
    user = create :user, :multi_auth_migrated, uid: 'some-uid'
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

    auth = generate_auth_user_hash(provider: 'facebook', uid: user.uid, refresh_token: '65432', email: email)
    @request.env['omniauth.auth'] = auth

    Timecop.freeze do
      setup_should_connect_provider(user, 2.days.from_now)
      assert_creates(AuthenticationOption) do
        get :facebook
      end

      user.reload
      assert_redirected_to 'http://test.host/users/edit'
      assert_equal 2, user.authentication_options.length
    end
  end

  test 'connect_provider: cannot connect multiple auth options with the same email to a different user' do
    email = 'test@xyz.foo'
    user_a = create :user, :multi_auth_migrated
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

    user_b = create :user, :multi_auth_migrated
    auth = generate_auth_user_hash(provider: 'facebook', uid: 'some-other-uid', refresh_token: '65432', email: email)
    @request.env['omniauth.auth'] = auth

    Timecop.freeze do
      setup_should_connect_provider(user_b, 2.days.from_now)
      assert_does_not_create(AuthenticationOption) do
        get :facebook
      end

      assert_redirected_to 'http://test.host/users/edit'
      assert_equal 'Email has already been taken', flash.alert
    end
    user_a.reload
    user_b.reload
    assert_equal 1, user_a.authentication_options.length
    assert_equal 0, user_b.authentication_options.length
  end

  test 'connect_provider: returns bad_request if user not migrated' do
    user = create :user, :unmigrated_facebook_sso
    Timecop.freeze do
      setup_should_connect_provider(user)
      get :google_oauth2
      assert_response :bad_request
    end
  end

  test 'connect_provider: returns bad_request if session[:connect_provider] is expired' do
    user = create :user, :multi_auth_migrated
    Timecop.freeze do
      setup_should_connect_provider(user, 3.minutes.ago)
      get :google_oauth2
      assert_response :bad_request
    end
  end

  test 'connect_provider: creates new google auth option for signed in user' do
    user = create :user, :multi_auth_migrated, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: user.uid, refresh_token: '54321')

    @request.env['omniauth.auth'] = auth

    Timecop.freeze do
      setup_should_connect_provider(user, 2.days.from_now)
      assert_creates(AuthenticationOption) do
        get :google_oauth2
      end

      user.reload
      assert_redirected_to 'http://test.host/users/edit'
      assert_auth_option(user, auth)
    end
  end

  test 'connect_provider: creates new windowslive auth option for signed in user' do
    user = create :user, :multi_auth_migrated, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'windowslive', uid: user.uid)

    @request.env['omniauth.auth'] = auth

    Timecop.freeze do
      setup_should_connect_provider(user, 2.days.from_now)
      assert_creates(AuthenticationOption) do
        get :windowslive
      end

      user.reload
      assert_redirected_to 'http://test.host/users/edit'
      assert_auth_option(user, auth)
    end
  end

  test 'connect_provider: creates new facebook auth option for signed in user' do
    user = create :user, :multi_auth_migrated, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'facebook', uid: user.uid)

    @request.env['omniauth.auth'] = auth

    Timecop.freeze do
      setup_should_connect_provider(user, 2.days.from_now)
      assert_creates(AuthenticationOption) do
        get :facebook
      end

      user.reload
      assert_redirected_to 'http://test.host/users/edit'
      assert_auth_option(user, auth)
    end
  end

  test 'connect_provider: creates new clever auth option for signed in user' do
    user = create :user, :multi_auth_migrated, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'clever', uid: user.uid)

    @request.env['omniauth.auth'] = auth

    Timecop.freeze do
      setup_should_connect_provider(user, 2.days.from_now)
      assert_creates(AuthenticationOption) do
        get :clever
      end

      user.reload
      assert_redirected_to 'http://test.host/users/edit'
      assert_auth_option(user, auth)
    end
  end

  test 'connect_provider: creates new powerschool auth option for signed in user' do
    user = create :user, :multi_auth_migrated, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'powerschool', uid: user.uid)

    @request.env['omniauth.auth'] = auth

    Timecop.freeze do
      setup_should_connect_provider(user, 2.days.from_now)
      assert_creates(AuthenticationOption) do
        get :powerschool
      end

      user.reload
      assert_redirected_to 'http://test.host/users/edit'
      assert_auth_option(user, auth)
    end
  end

  test 'connect_provider: redirects to account edit page with an error if AuthenticationOption cannot save' do
    AuthenticationOption.any_instance.expects(:save).returns(false)

    user = create :user, :multi_auth_migrated, uid: 'some-uid'
    auth = generate_auth_user_hash(provider: 'google_oauth2', uid: user.uid, refresh_token: '54321')

    @request.env['omniauth.auth'] = auth

    Timecop.freeze do
      setup_should_connect_provider(user, 2.days.from_now)
      assert_does_not_create(AuthenticationOption) do
        get :google_oauth2
      end

      assert_redirected_to 'http://test.host/users/edit'
      expected_error = I18n.t('auth.unable_to_connect_provider', provider: I18n.t("auth.google_oauth2"))
      assert_equal expected_error, flash.alert
    end
  end

  private

  def set_oauth_takeover_session_variables(provider, user)
    @request.session[ACCT_TAKEOVER_EXPIRATION] = 5.minutes.from_now
    @request.session[ACCT_TAKEOVER_PROVIDER] = provider
    @request.session[ACCT_TAKEOVER_UID] = user.uid
    @request.session[ACCT_TAKEOVER_OAUTH_TOKEN] = '54321'
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

  def setup_should_connect_provider(user, timestamp = Time.now)
    sign_in user
    session[:connect_provider] = timestamp
  end

  def assert_auth_option(user, oauth_hash)
    assert_equal 1, user.authentication_options.count
    auth_option = user.authentication_options.last

    assert_authentication_option auth_option,
      user: user,
      hashed_email: User.hash_email(oauth_hash.info.email),
      credential_type: oauth_hash.provider,
      authentication_id: user.uid,
      data: {
        oauth_token: oauth_hash.credentials.token,
        oauth_token_expiration: oauth_hash.credentials.expires_at,
        oauth_refresh_token: oauth_hash.credentials.refresh_token
      }
  end
end
