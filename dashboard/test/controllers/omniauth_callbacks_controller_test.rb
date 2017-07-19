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

    assert_equal user.id, session['warden.user.user.key'].first.first
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

  test 'authorizing with Google account with known email performs silent takeover' do
    user = create(:teacher, provider: nil, email: 'test123@xyz.com')

    @request.env['omniauth.auth'] = OmniAuth::AuthHash.new(
      provider:"google_oauth2",
      uid:"12345",
      info: {
        name:"Test Teacher",
        user_type:"teacher",
        email:"test123@xyz.com",
        first_name:"Test",
        last_name:"Teacher",
      },
      credentials:{
         token:"ya29.Glxxx",
         expires_at:1500430899,
         expires:true
      }
    )
    @request.env['omniauth.params'] = {}

    assert_does_not_create(User) do
      get :google_oauth2
    end

    assert_equal user.id, session['warden.user.user.key'].first.first
    assert_equal user.provider, 'google_oauth2'
    assert_equal user.uid, '12345'
  end
end
