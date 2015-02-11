require 'test_helper'

class ConfirmationsControllerTest < ActionController::TestCase
  setup do
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  test "create redirects to sign in" do
    sign_in(user = create(:teacher))
    post :create, user: {email: user.email}
    assert_redirected_to 'http://test.host/users/sign_in' # if a user is signed in this will redirect again
  end

  test "create redirects to referer if exists" do
    sign_in(user = create(:teacher))
    @request.env['HTTP_REFERER'] = 'http://back.to/here'
    post :create, user: {email: user.email}
    assert_redirected_to 'http://back.to/here'
  end
end
