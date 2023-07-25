require "test_helper"

class OauthJwksControllerTest < ActionDispatch::IntegrationTest
  test "jwks - on GET, return 200" do
    get 'oauth/jwks'
    assert_response :ok
  end
end
