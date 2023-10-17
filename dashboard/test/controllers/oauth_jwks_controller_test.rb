require "test_helper"

class OauthJwksControllerTest < ActionDispatch::IntegrationTest
  def setup
    @jwks_test_data = '{"test": "data"}'
    CDO.stubs(jwks_data: @jwks_test_data)
  end

  test "jwks - on GET, return 200" do
    get '/oauth/jwks'
    assert_response :ok
    assert_equal response.body, @jwks_test_data
  end
end
