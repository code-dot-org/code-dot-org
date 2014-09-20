require 'test_helper'

class OmniauthCallbacksControllerTest < ActionController::TestCase
  test "authorizing with known facebook account signs in" do
    user = create(:user, provider: 'facebook', uid: '1111')

    @request.env["devise.mapping"] = Devise.mappings[:user]
    @request.env['omniauth.auth'] = {provider: 'facebook', uid: '1111'}
    @request.env['omniauth.params'] = {}

    get :facebook

    assert_equal user.id, session['warden.user.user.key'].first.first
  end

  test "authorizing with unknown facebook account needs additional information" do
    @request.env["devise.mapping"] = Devise.mappings[:user]

    auth = stub('auth',
                slice: {provider: 'facebook', uid: '1111'},
                uid: '1111',
                provider: 'facebook',
                info: stub('info', nickname: '', name: 'someone', email: nil))
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

end
