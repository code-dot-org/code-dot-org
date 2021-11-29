require 'test_helper'
require_relative './utils'

class MakerOAuthTest < ActionDispatch::IntegrationTest
  include OmniauthCallbacksControllerTests::Utils

  test "confirm_login redirects to expected route after Google SSO" do
    auth_hash = mock_google_oauth
    create(:user, :google_sso_provider, uid: auth_hash.uid)
    redirect_route = '/my/new/route'

    get '/maker/google_oauth_confirm_login', params: {user_return_to: redirect_route}
    assert_select 'form.button_to', 1
    assert_select 'form.button_to' do
      assert_select '[method=?]', 'post'
      assert_select '[action=?]', '/users/auth/google_oauth2'
    end

    # "Click" the button by executing its action (POSTing to the Google OAuth sign-in route).
    sign_in_through_google

    assert_equal 'Signed in!', flash.notice
    assert_redirected_to redirect_route
  end

  private

  def mock_google_oauth
    mock_oauth_for AuthenticationOption::GOOGLE, generate_auth_hash(
      provider: AuthenticationOption::GOOGLE,
      refresh_token: 'fake-refresh-token'
    )
  end
end
