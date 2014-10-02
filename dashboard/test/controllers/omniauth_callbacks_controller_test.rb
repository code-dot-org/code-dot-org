require 'test_helper'

class OmniauthCallbacksControllerTest < ActionController::TestCase
  setup do
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  test "authorizing with known facebook account signs in" do
    user = create(:user, provider: 'facebook', uid: '1111')

    @request.env['omniauth.auth'] = {provider: 'facebook', uid: '1111'}
    @request.env['omniauth.params'] = {}

    get :facebook

    assert_equal user.id, session['warden.user.user.key'].first.first
  end

  test "authorizing with unknown facebook account needs additional information" do
    auth = stub('auth',
                slice: {provider: 'facebook', uid: '1111'},
                uid: '1111',
                provider: 'facebook',
                info: stub('info',
                           nickname: '',
                           name: 'someone',
                           email: nil,
                           user_type: nil,
                           dob: nil,
                           gender: nil))
    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_does_not_create(User) do
      get :facebook
    end

    assert_redirected_to 'http://test.host/users/sign_up'
    attributes =  session['devise.user_attributes']

    assert_equal nil, attributes['email']
    assert_equal nil, attributes['age']
  end

  test "authorizing with unknown clever teacher account" do
    auth = stub('auth',
                slice: {provider: 'clever', uid: '1111'},
                uid: '1111',
                provider: 'clever',
                info: stub('info', nickname: '',
                           name: {'first' => 'Hat', 'last' => 'Cat'} ,
                           email: 'first_last@clever_teacher.xx',
                           user_type: 'teacher',
                           dob: nil,
                           gender: nil))

    @request.env['omniauth.auth'] = auth
    @request.env['omniauth.params'] = {}

    assert_creates(User) do
      get :clever
    end

    user = User.last
    assert_equal 'clever', user.provider
    assert_equal 'Hat Cat', user.name
    assert_equal User::TYPE_TEACHER, user.user_type
    assert_equal 21, user.age # we know you're an adult if you are a teacher on clever
    assert_equal nil, user.gender
  end

  test "authorizing with unknown clever student account" do
    auth = stub('auth',
                slice: {provider: 'clever', uid: '111133'},
                uid: '111133',
                provider: 'clever',
                info: stub('info', nickname: '',
                           name: {'first' => 'Hat', 'last' => 'Cat'} ,
                           email: nil,
                           user_type: 'student',
                           dob: Date.today - 10.years,
                           gender: 'f'))
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

end
