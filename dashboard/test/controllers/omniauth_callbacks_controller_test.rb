require 'test_helper'

class OmniauthCallbacksControllerTest < ActionController::TestCase
  include Mocha::API

  setup do
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  test "authorizing with known facebook account signs in" do
    user = create(:user, provider: 'facebook', uid: '1111')

    @request.env['omniauth.auth'] = OmniAuth::AuthHash.new(provider: 'facebook', uid: '1111')
    @request.env['omniauth.params'] = {}

    get :facebook

    assert_equal user.id, signed_in_user_id
  end

  test "authorizing with unknown facebook account needs additional information" do
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

  test "authorizing with unknown clever teacher account" do
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
  end

  test "authorizing with unknown clever district admin account creates teacher" do
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
  end

  test "authorizing with unknown clever school admin account creates teacher" do
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
  end

  test "authorizing with unknown clever teacher account needs additional information" do
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

  test "authorizing with unknown clever student account creates student" do
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
  end

  # NOTE: Though this test really tests the User model, specifically the
  # before_save action hide_email_and_full_address_for_students, we include this
  # test here as there was concern authentication through clever could be a
  # workflow where we persist student email addresses.
  test "authorizing with unknown clever student account does not save email" do
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
  end

  test "adding google classroom permissions redirects to the homepage with a param to open the roster dialog" do
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

  test "omniauth callback sets token on user when passed with credentials" do
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
  end
end
